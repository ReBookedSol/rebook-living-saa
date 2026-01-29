import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  Navigate,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
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
} from "lucide-react";
import Layout from "@/components/Layout";
import ProgramDetailModal from "@/components/ProgramDetailModal";

interface Faculty {
  name: string;
  description?: string;
  degrees?: Degree[];
}

interface Degree {
  name: string;
  description?: string;
  duration?: string;
  apsRequirement: number;
  universitySpecificAPS?: Record<string, number>;
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
  faculties?: Faculty[];
  admissionsContact?: string;
  studentPortal?: string;
  applicationInfo?: {
    openingDate: string;
    closingDate: string;
    academicYear: string;
    applicationFee?: string;
    applicationMethod: string;
  };
}

/**
 * University Profile Component - Complete modern redesign
 */
const UniversityProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("programs");
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [expandedFaculties, setExpandedFaculties] = useState<Set<number>>(
    new Set()
  );

  // Get APS from URL parameters
  const fromAPS = searchParams.get("fromAPS") === "true";
  const userAPS = parseInt(searchParams.get("aps") || "0");

  // Fetch university data
  const { data: university, isLoading, error } = useQuery({
    queryKey: ["university", id],
    queryFn: async () => {
      const { data, error: dbError } = await supabase
        .from("universities")
        .select("*")
        .eq("id", id)
        .single();

      if (dbError) throw dbError;

      // Transform database field names to component field names
      const transformed: University = {
        ...data,
        fullName: data.full_name || data.name,
        studentPopulation: data.student_population,
        establishedYear: data.established_year,
        faculties: data.faculties ? (Array.isArray(data.faculties) ? data.faculties : Object.values(data.faculties)) : [],
      };

      return transformed;
    },
  });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Tab change handler with URL persistence
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
    // Scroll to top when component mounts or university changes
    window.scrollTo({ top: 0, behavior: "smooth" });

    // If coming from APS calculator, show eligible programs by default
    if (fromAPS && userAPS > 0) {
      setShowEligibleOnly(true);
    }
  }, [id, fromAPS, userAPS]);

  const toggleFacultyExpansion = (facultyIndex: number) => {
    setExpandedFaculties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(facultyIndex)) {
        newSet.delete(facultyIndex);
      } else {
        newSet.add(facultyIndex);
      }
      return newSet;
    });
  };

  const handleAPSCalculator = () => {
    navigate("/campus-guide?tab=apps");
  };

  // Normalize weird data where some requirements are stored as 10x (e.g., 450 -> 45)
  const normalizeRequirement = (val: number) =>
    val > 100 ? Math.round(val / 10) : val;

  // Helper function to check if user is eligible for a program
  const isEligibleForProgram = (program: Degree): boolean => {
    if (!userAPS || userAPS === 0) return true;
    const uniId = university?.id || "";
    let requiredAPS =
      program.universitySpecificAPS && uniId
        ? program.universitySpecificAPS[uniId]
        : undefined ?? program.apsRequirement;
    requiredAPS = normalizeRequirement(requiredAPS);
    return userAPS >= requiredAPS;
  };

  // Helper function to filter programs based on eligibility
  const filterPrograms = (programs: Degree[]): Degree[] => {
    if (!showEligibleOnly || !userAPS) return programs;
    return programs.filter(isEligibleForProgram);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-book-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading university profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !university) {
    return (
      <Layout>
        <div className="bg-white min-h-screen">
          <div className="container mx-auto px-6 py-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              University Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The university you're looking for could not be found.
            </p>
            <Button
              onClick={() => navigate("/campus-guide?tab=universities")}
              className="bg-book-600 hover:bg-book-700 text-white"
            >
              Back to Universities
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate stats
  const totalPrograms =
    university.faculties?.reduce((total, faculty) => {
      return total + (faculty.degrees?.length || 0);
    }, 0) || 0;

  const studentCount = university.studentPopulation
    ? university.studentPopulation > 1000
      ? `${Math.round(university.studentPopulation / 1000)}k+`
      : university.studentPopulation.toString()
    : "N/A";

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Clean Header */}
        <div className="bg-gradient-to-b from-book-100 via-book-50 to-white border-b border-book-200">
          <div className="container mx-auto px-6 py-8">
            {/* Back Navigation */}
            <div className="mb-8">
              <button
                type="button"
                aria-label="Back to Universities"
                onClick={() => navigate("/campus-guide?tab=universities")}
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span className="text-sm font-medium">Back to Universities</span>
              </button>
            </div>

            {/* University Header - Mobile Optimized */}
            <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Main Info */}
              <div className="lg:col-span-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Logo */}
                  <div className="relative mx-auto sm:mx-0 flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-4 border-book-200 rounded-2xl flex items-center justify-center shadow-lg">
                      {university.logo ? (
                        <img
                          src={university.logo}
                          alt={`${university.name} logo`}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                          onError={(e) => {
                            // Hide the failed image and show fallback
                            const img = e.currentTarget;
                            img.style.display = "none";
                            const fallback =
                              img.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <span
                        className={`w-12 h-12 sm:w-16 sm:h-16 ${
                          university.logo ? "hidden" : "flex"
                        } items-center justify-center text-lg sm:text-2xl font-bold text-gray-700 bg-gradient-to-br from-book-500 to-book-600 text-white rounded-lg`}
                      >
                        {university.abbreviation ||
                          university.name.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-book-500 rounded-full flex items-center justify-center">
                      <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
                    <div>
                      <Badge
                        variant="secondary"
                        className="mb-3 bg-book-50 text-book-700 border-book-200"
                      >
                        {university.type || "University"}
                      </Badge>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                        {university.fullName || university.name}
                      </h1>
                      <div className="flex items-center justify-center sm:justify-start text-gray-600 mb-3 sm:mb-4">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-400" />
                        <span className="text-base sm:text-lg">
                          {university.location}, {university.province}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg max-w-3xl">
                      {university.overview ||
                        "A prestigious South African institution dedicated to academic excellence, research innovation, and developing leaders who shape the future."}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    size="lg"
                    className="bg-book-600 hover:bg-book-700 text-white w-full sm:w-auto"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Find Textbooks
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                    onClick={handleAPSCalculator}
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    APS Calculator
                  </Button>

                  {university.website && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 hover:border-book-500 hover:text-book-600 w-full sm:w-auto"
                      asChild
                    >
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">
                          Official Website
                        </span>
                        <span className="sm:hidden">Website</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-book-50 border-book-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center text-gray-800">
                      <BarChart3 className="h-5 w-5 mr-2 text-book-500" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">
                        Students
                      </span>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-book-500" />
                        <span className="font-bold text-gray-900">
                          {studentCount}
                        </span>
                      </div>
                    </div>

                    {university.establishedYear && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">
                          Founded
                        </span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-book-500" />
                          <span className="font-bold text-gray-900">
                            {university.establishedYear}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">
                        Faculties
                      </span>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1 text-book-500" />
                        <span className="font-bold text-gray-900">
                          {university.faculties?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">
                        Programs
                      </span>
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1 text-book-500" />
                        <span className="font-bold text-gray-900">
                          {totalPrograms}
                        </span>
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
          <div className="bg-book-100 border-b border-book-200">
            <div className="container mx-auto px-6 py-4">
              <Alert className="border-book-300 bg-book-50">
                <Calculator className="h-5 w-5 text-book-600" />
                <AlertDescription className="text-book-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <strong>Your APS Score: {userAPS}</strong> -
                      {(() => {
                        const eligibleCount = (
                          university.faculties || []
                        ).reduce((total, faculty) => {
                          const count = (faculty.degrees || []).filter(
                            isEligibleForProgram
                          ).length;
                          return total + count;
                        }, 0);
                        const totalPrograms = (
                          university.faculties || []
                        ).reduce((total, faculty) => {
                          return total + (faculty.degrees?.length || 0);
                        }, 0);
                        return (
                          <span className="ml-2">
                            You qualify for <strong>{eligibleCount}</strong> out
                            of <strong>{totalPrograms}</strong> programs
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={showEligibleOnly ? "default" : "outline"}
                        onClick={() => setShowEligibleOnly(!showEligibleOnly)}
                        className="bg-book-600 hover:bg-book-700 text-white"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        {showEligibleOnly
                          ? "Show All Programs"
                          : "Show Eligible Only"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAPSCalculator}
                        className="border-book-200 text-book-600 hover:bg-book-50"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Back to APS Calculator
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigate(`/university/${id}`, { replace: true });
                        }}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Clear APS Profile
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
            {/* Modern Tab Navigation - Mobile Optimized */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              {/* Mobile: Vertical Stack */}
              <div className="block md:hidden">
                <TabsList className="bg-transparent p-2 h-auto w-full flex flex-col space-y-2 rounded-xl">
                  <TabsTrigger
                    value="programs"
                    className="w-full rounded-lg py-3 px-4 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all justify-start"
                  >
                    <GraduationCap className="h-5 w-5 mr-3" />
                    Academic Programs
                  </TabsTrigger>
                  <TabsTrigger
                    value="admissions"
                    className="w-full rounded-lg py-3 px-4 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all justify-start"
                  >
                    <Calendar className="h-5 w-5 mr-3" />
                    Admissions
                  </TabsTrigger>
                  <TabsTrigger
                    value="student-life"
                    className="w-full rounded-lg py-3 px-4 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all justify-start"
                  >
                    <Heart className="h-5 w-5 mr-3" />
                    Campus Life
                  </TabsTrigger>
                  <TabsTrigger
                    value="resources"
                    className="w-full rounded-lg py-3 px-4 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all justify-start"
                  >
                    <Info className="h-5 w-5 mr-3" />
                    Resources
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Desktop: Horizontal Grid */}
              <div className="hidden md:block">
                <TabsList className="bg-transparent p-1 h-auto w-full grid grid-cols-4 rounded-xl">
                  <TabsTrigger
                    value="programs"
                    className="rounded-lg py-4 px-6 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all"
                  >
                    <GraduationCap className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Academic Programs</span>
                    <span className="lg:hidden">Programs</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="admissions"
                    className="rounded-lg py-4 px-6 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Admissions</span>
                    <span className="lg:hidden">Apply</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="student-life"
                    className="rounded-lg py-4 px-6 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Campus Life</span>
                    <span className="lg:hidden">Life</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="resources"
                    className="rounded-lg py-4 px-6 data-[state=active]:bg-book-50 data-[state=active]:text-book-700 data-[state=active]:shadow-sm font-medium transition-all"
                  >
                    <Info className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Resources</span>
                    <span className="lg:hidden">Info</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Tab Content */}
            <TabsContent value="programs" className="mt-0">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Academic Programs
                    </h2>
                    <p className="text-gray-600">
                      Explore {totalPrograms} programs across{" "}
                      {university.faculties?.length || 0} faculties
                    </p>
                  </div>
                  <Button
                    className="bg-book-600 hover:bg-book-700 text-white shadow-lg"
                    onClick={handleAPSCalculator}
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    Calculate Your APS
                  </Button>
                </div>

                {university.faculties && university.faculties.length > 0 ? (
                  <div className="grid gap-8">
                    {university.faculties.map((faculty, index) => {
                      const facultyPrograms = faculty.degrees || [];
                      const filteredPrograms = filterPrograms(facultyPrograms);

                      // Skip faculty if no programs match the filter
                      if (
                        showEligibleOnly &&
                        filteredPrograms.length === 0
                      ) {
                        return null;
                      }

                      return (
                        <Card key={index} className="border-0 shadow-lg">
                          <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                            <CardTitle className="text-xl flex items-center justify-between text-gray-900">
                              <div className="flex items-center">
                                <Building2 className="h-6 w-6 mr-3 text-book-500" />
                                {faculty.name}
                              </div>
                            </CardTitle>
                            {faculty.description && (
                              <p className="text-gray-600 mt-2">
                                {faculty.description}
                              </p>
                            )}
                          </CardHeader>

                          {filteredPrograms.length > 0 && (
                            <CardContent className="pt-6">
                              <div className="grid gap-4">
                                {filteredPrograms
                                  .slice(
                                    0,
                                    showEligibleOnly ||
                                      expandedFaculties.has(index)
                                      ? filteredPrograms.length
                                      : 3
                                  )
                                  .map((degree, degreeIndex) => {
                                    const isEligible =
                                      isEligibleForProgram(degree);
                                    return (
                                      <div
                                        key={degreeIndex}
                                        className={`group bg-white border rounded-xl p-5 hover:shadow-md transition-all duration-200 ${
                                          fromAPS && userAPS > 0
                                            ? isEligible
                                              ? "border-green-300 bg-green-50 hover:border-green-400"
                                              : "border-red-300 bg-red-50 hover:border-red-400"
                                            : "border-gray-200 hover:border-book-200"
                                        }`}
                                      >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                              {fromAPS &&
                                                userAPS > 0 &&
                                                (isEligible ? (
                                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                  <XCircle className="h-5 w-5 text-red-600" />
                                                ))}
                                              <h5
                                                className={`font-semibold mb-0 group-hover:text-book-700 transition-colors ${
                                                  fromAPS && userAPS > 0
                                                    ? isEligible
                                                      ? "text-green-900"
                                                      : "text-red-900"
                                                    : "text-gray-900"
                                                }`}
                                              >
                                                {degree.name}
                                              </h5>
                                            </div>
                                            {degree.description && (
                                              <p
                                                className={`text-sm leading-relaxed mb-3 ${
                                                  fromAPS && userAPS > 0
                                                    ? isEligible
                                                      ? "text-green-700"
                                                      : "text-red-700"
                                                    : "text-gray-600"
                                                }`}
                                              >
                                                {degree.description}
                                              </p>
                                            )}
                                            {degree.duration && (
                                              <div
                                                className={`flex items-center text-sm ${
                                                  fromAPS && userAPS > 0
                                                    ? isEligible
                                                      ? "text-green-600"
                                                      : "text-red-600"
                                                    : "text-gray-500"
                                                }`}
                                              >
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {degree.duration}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <Badge
                                              className={
                                                fromAPS && userAPS > 0
                                                  ? isEligible
                                                    ? "bg-green-100 text-green-800 border-green-300"
                                                    : "bg-red-100 text-red-800 border-red-300"
                                                  : "bg-book-100 text-book-700 border-book-200"
                                              }
                                            >
                                              APS:{" "}
                                              {normalizeRequirement(
                                                degree.apsRequirement
                                              )}
                                              {fromAPS && userAPS > 0 && (
                                                <span className="ml-1">
                                                  {isEligible ? "✓" : "✗"}
                                                </span>
                                              )}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                {!showEligibleOnly &&
                                  filteredPrograms.length > 3 &&
                                  !expandedFaculties.has(index) && (
                                    <div className="text-center py-4">
                                      <Button
                                        variant="outline"
                                        className="border-book-200 text-book-600 hover:bg-book-50"
                                        onClick={() =>
                                          toggleFacultyExpansion(index)
                                        }
                                      >
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        View {filteredPrograms.length - 3} more
                                        programs
                                      </Button>
                                    </div>
                                  )}
                                {!showEligibleOnly &&
                                  filteredPrograms.length > 3 &&
                                  expandedFaculties.has(index) && (
                                    <div className="text-center py-4">
                                      <Button
                                        variant="outline"
                                        className="border-book-200 text-book-600 hover:bg-book-50"
                                        onClick={() =>
                                          toggleFacultyExpansion(index)
                                        }
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
                      <GraduationCap className="h-20 w-20 mx-auto text-gray-300 mb-6" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-3">
                        No Programs Available
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Program information for this university is not yet
                        available. Please check back later or contact the
                        university directly.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="admissions" className="mt-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Admissions Information
                  </h2>
                  <p className="text-gray-600">
                    Everything you need to know about applying to{" "}
                    {university.name}
                  </p>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-book-50 to-white">
                    <CardTitle className="text-xl flex items-center text-gray-900">
                      <Calendar className="h-6 w-6 mr-3 text-book-500" />
                      Admissions Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-book-50 rounded-lg">
                        <h4 className="font-semibold text-book-900 mb-2">
                          Get Help With Your Application
                        </h4>
                        <p className="text-sm text-book-700 mb-4">
                          Contact the university directly for admissions information and support.
                        </p>
                        {university.website && (
                          <a
                            href={university.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-book-600 hover:text-book-700 font-medium"
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

            <TabsContent value="student-life" className="mt-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Campus Life at {university.name}
                  </h2>
                  <p className="text-gray-600">
                    Discover what makes student life vibrant and engaging
                  </p>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-book-50 to-white">
                    <CardTitle className="text-xl flex items-center text-gray-900">
                      <Building2 className="h-6 w-6 mr-3 text-book-500" />
                      Campus Facilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 mb-4">
                      Explore the various facilities and student services available on campus.
                    </p>
                    {university.website && (
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-book-600 hover:text-book-700 font-medium"
                      >
                        Learn More About Campus Life
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="mt-0">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    University Resources
                  </h2>
                  <p className="text-gray-600">
                    Essential resources and support services at {university.name}
                  </p>
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-book-50 to-white">
                    <CardTitle className="text-xl flex items-center text-gray-900">
                      <Info className="h-6 w-6 mr-3 text-book-500" />
                      Contact & Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-book-50 rounded-lg">
                        <h4 className="font-semibold text-book-900 mb-2">
                          Get More Information
                        </h4>
                        <p className="text-sm text-book-700 mb-4">
                          Visit the university's official website for detailed information about resources, facilities, and student support services.
                        </p>
                        {university.website && (
                          <a
                            href={university.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-book-600 hover:text-book-700 font-medium"
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
      </div>
    </Layout>
  );
};

export default UniversityProfile;
