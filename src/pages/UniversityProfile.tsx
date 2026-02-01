import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  BookOpen,
  Calculator,
  BarChart3,
  Users,
  Calendar,
  Building2,
  GraduationCap,
  Globe,
  TrendingUp,
  Award,
  Heart,
  Info,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Home,
  ChevronRight,
} from "lucide-react";
import Layout from "@/components/Layout";
import ProgramDetailModal from "@/components/ProgramDetailModal";
import { UNIVERSITY_LOGOS } from "@/constants/universityLogos";

interface Program {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  aps_requirement?: number;
  faculty_name?: string;
  career_prospects?: any;
  subjects?: any;
  skills_developed?: any;
  salary_range?: string;
  employment_rate?: number;
  application_details?: any;
}

interface University {
  id: string;
  name: string;
  fullName?: string;
  full_name?: string;
  abbreviation?: string;
  location: string;
  province: string;
  logo?: string;
  overview?: string;
  type?: string;
  website?: string;
  studentPopulation?: number;
  student_population?: number;
  establishedYear?: number;
  established_year?: number;
  faculties?: any[];
}

const UniversityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("programs");
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(new Set());
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  // Get APS from URL parameters
  const fromAPS = searchParams.get("fromAPS") === "true";
  const userAPS = parseInt(searchParams.get("aps") || "0");

  // Fetch university data
  const { data: university, isLoading: universityLoading, error: universityError } = useQuery({
    queryKey: ["university", id],
    queryFn: async () => {
      const { data, error: dbError } = await supabase
        .from("universities")
        .select("*")
        .eq("id", id)
        .single();

      if (dbError) throw dbError;

      // Transform to our University interface
      return {
        id: data.id,
        name: data.name,
        fullName: data.full_name || data.name,
        full_name: data.full_name,
        abbreviation: data.abbreviation,
        location: data.location || "",
        province: data.province || "",
        logo: data.logo,
        overview: data.overview,
        type: data.type,
        website: data.website,
        studentPopulation: data.student_population,
        student_population: data.student_population,
        establishedYear: data.established_year,
        established_year: data.established_year,
      } as University;
    },
  });

  // Fetch programs from programs table
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["programs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("university_id", id)
        .eq("is_active", true)
        .order("faculty_name", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as Program[];
    },
    enabled: !!id,
  });

  // Fetch related accommodations
  const { data: accommodations = [] } = useQuery({
    queryKey: ["university-accommodations", university?.name],
    queryFn: async () => {
      if (!university?.name) return [];
      
      const { data, error } = await supabase
        .from("accommodations")
        .select("id, property_name, address, city, monthly_cost, rating, image_urls, nsfas_accredited")
        .or(`university.ilike.%${university.name}%,city.ilike.%${university.location}%`)
        .eq("status", "active")
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!university?.name,
  });

  // Group programs by faculty
  const programsByFaculty = programs.reduce((acc, program) => {
    const faculty = program.faculty_name || "Other Programs";
    if (!acc[faculty]) acc[faculty] = [];
    acc[faculty].push(program);
    return acc;
  }, {} as Record<string, Program[]>);

  const facultyNames = Object.keys(programsByFaculty).sort();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      const params = new URLSearchParams(searchParams);
      params.set("tab", value);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (fromAPS && userAPS > 0) {
      setShowEligibleOnly(true);
    }
  }, [id, fromAPS, userAPS]);

  const toggleFacultyExpansion = (faculty: string) => {
    setExpandedFaculties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faculty)) {
        newSet.delete(faculty);
      } else {
        newSet.add(faculty);
      }
      return newSet;
    });
  };

  const handleAPSCalculator = () => {
    navigate("/campus-guide?tab=apps");
  };

  const isEligibleForProgram = (program: Program): boolean => {
    if (!userAPS || userAPS === 0) return true;
    const requiredAPS = program.aps_requirement || 0;
    return userAPS >= requiredAPS;
  };

  const filterPrograms = (progs: Program[]): Program[] => {
    if (!showEligibleOnly || !userAPS) return progs;
    return progs.filter(isEligibleForProgram);
  };

  // Get logo URL from shared mapping
  const getLogoUrl = () => {
    if (!university) return undefined;

    // Try database logo first
    if (university.logo) return university.logo;

    // Try university name lookup
    if (UNIVERSITY_LOGOS[university.name]) return UNIVERSITY_LOGOS[university.name];

    // No logo available - will fallback to text abbreviation
    return undefined;
  };

  const logoUrl = getLogoUrl();

  if (universityLoading) {
    return (
      <Layout>
        <div className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading university profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (universityError || !university) {
    return (
      <Layout>
        <div className="bg-background min-h-screen">
          <div className="container mx-auto px-6 py-16 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">University Not Found</h1>
            <p className="text-muted-foreground mb-8">The university you're looking for could not be found.</p>
            <Button onClick={() => navigate("/campus-guide?tab=universities")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to Universities
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const totalPrograms = programs.length;
  const studentCount = university.studentPopulation
    ? university.studentPopulation > 1000
      ? `${Math.round(university.studentPopulation / 1000)}k+`
      : university.studentPopulation.toString()
    : "N/A";

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Header - Reduced green, using neutral/slate tones */}
        <div className="bg-gradient-to-b from-slate-100 via-slate-50 to-background border-b border-border">
          <div className="container mx-auto px-6 py-8">
            {/* Back Navigation */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => navigate("/campus-guide?tab=universities")}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span className="text-sm font-medium">Back to Universities</span>
              </button>
            </div>

            {/* University Header */}
            <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
              <div className="lg:col-span-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Logo */}
                  <div className="relative mx-auto sm:mx-0 flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 border-primary/20 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={`${university.name} logo`}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.display = "none";
                            const fallback = img.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className={`w-12 h-12 sm:w-16 sm:h-16 ${logoUrl ? "hidden" : "flex"} items-center justify-center text-lg sm:text-2xl font-bold bg-primary text-primary-foreground rounded-lg`}
                      >
                        {university.abbreviation || university.name.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                      <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
                    <div>
                      <Badge variant="secondary" className="mb-3 bg-slate-100 text-slate-700 border-slate-200">
                        {university.type || "University"}
                      </Badge>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 leading-tight">
                        {university.fullName || university.name}
                      </h1>
                      <div className="flex items-center justify-center sm:justify-start text-muted-foreground mb-3 sm:mb-4">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span className="text-base sm:text-lg">{university.location}, {university.province}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base lg:text-lg max-w-3xl">
                      {university.overview || "A prestigious South African institution dedicated to academic excellence, research innovation, and developing leaders who shape the future."}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto" asChild>
                    <a href="https://www.rebookedsolutions.co.za/" target="_blank" rel="noopener noreferrer">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Find Textbooks
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-amber-200 text-amber-700 hover:bg-amber-50 w-full sm:w-auto" onClick={handleAPSCalculator}>
                    <Calculator className="h-5 w-5 mr-2" />
                    APS Calculator
                  </Button>
                  {university.website && (
                    <Button size="lg" variant="outline" className="border-2 hover:border-primary hover:text-primary w-full sm:w-auto" asChild>
                      <a href={university.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">University Website</span>
                        <span className="sm:hidden">Website</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 border-slate-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center text-foreground">
                      <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground font-medium">Students</span>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-primary" />
                        <span className="font-bold text-foreground">{studentCount}</span>
                      </div>
                    </div>
                    {university.establishedYear && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground font-medium">Founded</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-primary" />
                          <span className="font-bold text-foreground">{university.establishedYear}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground font-medium">Faculties</span>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1 text-primary" />
                        <span className="font-bold text-foreground">{facultyNames.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground font-medium">Programs</span>
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1 text-primary" />
                        <span className="font-bold text-foreground">{totalPrograms}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* APS Status Banner */}
        {fromAPS && userAPS > 0 && (
          <div className="bg-amber-50 border-b border-amber-200">
            <div className="container mx-auto px-6 py-4">
              <Alert className="border-amber-300 bg-amber-50">
                <Calculator className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <strong>Your APS Score: {userAPS}</strong> - 
                      {(() => {
                        const eligibleCount = programs.filter(isEligibleForProgram).length;
                        return (
                          <span className="ml-2">
                            You qualify for <strong>{eligibleCount}</strong> out of <strong>{totalPrograms}</strong> programs
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={showEligibleOnly ? "default" : "outline"}
                        onClick={() => setShowEligibleOnly(!showEligibleOnly)}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {showEligibleOnly ? "Show All Programs" : "Show Eligible Only"}
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Tab Navigation */}
            <div className="bg-card rounded-xl shadow-sm border border-border mb-8">
              <div className="block md:hidden">
                <TabsList className="bg-transparent p-2 h-auto w-full flex flex-col space-y-2 rounded-xl">
                  <TabsTrigger value="programs" className="w-full rounded-lg py-3 px-4 data-[state=active]:bg-slate-100 data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all justify-start">
                    <GraduationCap className="h-5 w-5 mr-3" />
                    Academic Programs
                  </TabsTrigger>
                  <TabsTrigger value="admissions" className="w-full rounded-lg py-3 px-4 data-[state=active]:bg-slate-100 data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all justify-start">
                    <Calendar className="h-5 w-5 mr-3" />
                    Admissions
                  </TabsTrigger>
                  <TabsTrigger value="student-life" className="w-full rounded-lg py-3 px-4 data-[state=active]:bg-slate-100 data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all justify-start">
                    <Heart className="h-5 w-5 mr-3" />
                    Campus Life
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="w-full rounded-lg py-3 px-4 data-[state=active]:bg-slate-100 data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all justify-start">
                    <Info className="h-5 w-5 mr-3" />
                    Resources
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="hidden md:block">
                <TabsList className="bg-transparent p-1 h-auto w-full grid grid-cols-4 rounded-xl">
                  <TabsTrigger value="programs" className="rounded-lg py-4 px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Academic Programs</span>
                    <span className="lg:hidden">Programs</span>
                  </TabsTrigger>
                  <TabsTrigger value="admissions" className="rounded-lg py-4 px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Admissions</span>
                    <span className="lg:hidden">Apply</span>
                  </TabsTrigger>
                  <TabsTrigger value="student-life" className="rounded-lg py-4 px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all">
                    <Heart className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Campus Life</span>
                    <span className="lg:hidden">Life</span>
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="rounded-lg py-4 px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium transition-all">
                    <Info className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Resources</span>
                    <span className="lg:hidden">Info</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Programs Tab */}
            <TabsContent value="programs" className="mt-0">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Academic Programs</h2>
                    <p className="text-muted-foreground">
                      Explore {totalPrograms} programs across {facultyNames.length} faculties
                    </p>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" onClick={handleAPSCalculator}>
                    <Calculator className="h-5 w-5 mr-2" />
                    Calculate Your APS
                  </Button>
                </div>

                {programsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : facultyNames.length > 0 ? (
                  <div className="grid gap-8">
                    {facultyNames.map((facultyName) => {
                      const facultyPrograms = programsByFaculty[facultyName];
                      const filteredPrograms = filterPrograms(facultyPrograms);

                      if (showEligibleOnly && filteredPrograms.length === 0) return null;

                      return (
                        <Card key={facultyName} className="border-0 shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                            <CardTitle className="text-xl flex items-center justify-between text-foreground">
                              <div className="flex items-center">
                                <Building2 className="h-6 w-6 mr-3 text-primary" />
                                {facultyName}
                              </div>
                              <Badge variant="secondary">{filteredPrograms.length} programs</Badge>
                            </CardTitle>
                          </CardHeader>

                          {filteredPrograms.length > 0 && (
                            <CardContent className="pt-6">
                              <div className="grid gap-4">
                                {filteredPrograms
                                  .slice(0, showEligibleOnly || expandedFaculties.has(facultyName) ? filteredPrograms.length : 3)
                                  .map((program) => {
                                    const isEligible = isEligibleForProgram(program);
                                    return (
                                      <div
                                        key={program.id}
                                        className={`group bg-card border rounded-xl p-5 hover:shadow-md transition-all duration-200 ${
                                          fromAPS && userAPS > 0
                                            ? isEligible
                                              ? "border-green-300 bg-green-50 hover:border-green-400"
                                              : "border-red-300 bg-red-50 hover:border-red-400"
                                            : "border-border hover:border-primary/30"
                                        }`}
                                      >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              {fromAPS && userAPS > 0 && (
                                                isEligible ? (
                                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                  <XCircle className="h-5 w-5 text-red-600" />
                                                )
                                              )}
                                              <h5 className={`font-semibold mb-0 group-hover:text-primary transition-colors ${
                                                fromAPS && userAPS > 0
                                                  ? isEligible ? "text-green-900" : "text-red-900"
                                                  : "text-foreground"
                                              }`}>
                                                {program.name}
                                              </h5>
                                            </div>
                                            {program.description && (
                                              <p className={`text-sm leading-relaxed mb-3 ${
                                                fromAPS && userAPS > 0
                                                  ? isEligible ? "text-green-700" : "text-red-700"
                                                  : "text-muted-foreground"
                                              }`}>
                                                {program.description}
                                              </p>
                                            )}
                                            {program.duration && (
                                              <div className={`flex items-center text-sm ${
                                                fromAPS && userAPS > 0
                                                  ? isEligible ? "text-green-600" : "text-red-600"
                                                  : "text-muted-foreground"
                                              }`}>
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {program.duration}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex flex-col items-center gap-2 shrink-0">
                                            <Badge className={
                                              fromAPS && userAPS > 0
                                                ? isEligible
                                                  ? "bg-green-100 text-green-800 border-green-300"
                                                  : "bg-red-100 text-red-800 border-red-300"
                                                : "bg-primary/10 text-primary border-primary/20"
                                            }>
                                              APS: {program.aps_requirement || "N/A"}
                                              {fromAPS && userAPS > 0 && (
                                                <span className="ml-1">{isEligible ? "✓" : "✗"}</span>
                                              )}
                                            </Badge>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-primary/30 text-primary hover:bg-primary/5 w-full sm:w-auto"
                                              onClick={() => {
                                                setSelectedProgram({
                                                  ...program,
                                                  name: program.name,
                                                  apsRequirement: program.aps_requirement,
                                                  faculty: program.faculty_name,
                                                  careerProspects: program.career_prospects,
                                                  subjects: program.subjects,
                                                });
                                                setIsProgramModalOpen(true);
                                              }}
                                            >
                                              <Eye className="h-4 w-4 mr-1" />
                                              View More
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                {!showEligibleOnly && filteredPrograms.length > 3 && !expandedFaculties.has(facultyName) && (
                                  <div className="text-center py-4">
                                    <Button
                                      variant="outline"
                                      className="border-primary/30 text-primary hover:bg-primary/5"
                                      onClick={() => toggleFacultyExpansion(facultyName)}
                                    >
                                      <TrendingUp className="h-4 w-4 mr-2" />
                                      View {filteredPrograms.length - 3} more programs
                                    </Button>
                                  </div>
                                )}
                                {!showEligibleOnly && filteredPrograms.length > 3 && expandedFaculties.has(facultyName) && (
                                  <div className="text-center py-4">
                                    <Button
                                      variant="outline"
                                      className="border-primary/30 text-primary hover:bg-primary/5"
                                      onClick={() => toggleFacultyExpansion(facultyName)}
                                    >
                                      <TrendingUp className="h-4 w-4 mr-2 rotate-180" />
                                      Show Less
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="text-center py-16">
                      <GraduationCap className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
                      <h3 className="text-xl font-semibold text-muted-foreground mb-3">No Programs Available</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Program information for this university is not yet available. Please check back later or contact the university directly.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Admissions Tab */}
            <TabsContent value="admissions" className="mt-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Admissions Information</h2>
                  <p className="text-muted-foreground">Everything you need to know about applying to {university.name}</p>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                    <CardTitle className="text-xl flex items-center text-foreground">
                      <Calendar className="h-6 w-6 mr-3 text-primary" />
                      Admissions Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h4 className="font-semibold text-amber-900 mb-2">Get Help With Your Application</h4>
                        <p className="text-sm text-amber-800 mb-4">
                          Contact the university directly for admissions information and support.
                        </p>
                        {university.website && (
                          <a
                            href={university.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium"
                          >
                            Visit University Website
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Campus Life Tab - With Accommodations */}
            <TabsContent value="student-life" className="mt-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Campus Life at {university.name}</h2>
                  <p className="text-muted-foreground">Discover what makes student life vibrant and engaging</p>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                    <CardTitle className="text-xl flex items-center text-foreground">
                      <Building2 className="h-6 w-6 mr-3 text-primary" />
                      Campus Facilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4">
                      Explore the various facilities and student services available on campus.
                    </p>
                    {university.website && (
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                      >
                        Learn More About Campus Life
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </CardContent>
                </Card>

                {/* Student Accommodation Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-white">
                    <CardTitle className="text-xl flex items-center text-foreground">
                      <Home className="h-6 w-6 mr-3 text-amber-600" />
                      Student Accommodation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {accommodations.length > 0 ? (
                      <>
                        <p className="text-muted-foreground mb-6">
                          Find verified, NSFAS-accredited accommodation near {university.name}.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          {accommodations.map((acc: any) => (
                            <Link key={acc.id} to={`/listing/${acc.id}`}>
                              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <div className="relative h-32 overflow-hidden rounded-t-lg">
                                  <img
                                    src={acc.image_urls?.[0] || "/placeholder.svg"}
                                    alt={acc.property_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                  />
                                  {acc.nsfas_accredited && (
                                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs">
                                      NSFAS
                                    </Badge>
                                  )}
                                </div>
                                <CardContent className="p-3">
                                  <h5 className="font-semibold text-sm line-clamp-1">{acc.property_name}</h5>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{acc.address}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-primary font-bold text-sm">
                                      {acc.monthly_cost ? `R${acc.monthly_cost.toLocaleString()}` : "Contact"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">★ {(acc.rating || 0).toFixed(1)}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                        <Link to={`/browse?university=${encodeURIComponent(university.name)}`}>
                          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                            <Home className="h-4 w-4 mr-2" />
                            Explore More Accommodation
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Home className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground mb-4">
                          No accommodation listings found near {university.name} yet.
                        </p>
                        <Link to="/browse">
                          <Button variant="outline">
                            Browse All Accommodation
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="mt-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">University Resources</h2>
                  <p className="text-muted-foreground">Essential resources and support services at {university.name}</p>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                    <CardTitle className="text-xl flex items-center text-foreground">
                      <Info className="h-6 w-6 mr-3 text-primary" />
                      Contact & Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-foreground mb-2">Get More Information</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Visit the university's official website for detailed information about resources, facilities, and student support services.
                        </p>
                        {university.website && (
                          <a
                            href={university.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                          >
                            Visit Official Website
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <ProgramDetailModal
          program={selectedProgram}
          university={university}
          isOpen={isProgramModalOpen}
          onClose={() => setIsProgramModalOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default UniversityProfile;
