import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, 
  GraduationCap, 
  Building2, 
  MapPin, 
  Globe, 
  Calculator,
  BookOpen,
  Users,
  Calendar,
  ChevronRight,
  Home,
  Coins,
  Filter,
  X,
  Star,
  Clock,
  Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";

// APS Calculator Component
const APSCalculator = ({ onCalculate }: { onCalculate: (score: number) => void }) => {
  const [subjects, setSubjects] = useState([
    { name: "Home Language", mark: "" },
    { name: "First Additional Language", mark: "" },
    { name: "Mathematics/Maths Literacy", mark: "" },
    { name: "Life Orientation", mark: "" },
    { name: "Subject 5", mark: "" },
    { name: "Subject 6", mark: "" },
    { name: "Subject 7", mark: "" },
  ]);

  const calculateAPSFromMark = (mark: number, isLifeOrientation = false): number => {
    if (isLifeOrientation) {
      // Life Orientation is calculated at 50% value
      if (mark >= 80) return 4;
      if (mark >= 70) return 3;
      if (mark >= 60) return 3;
      if (mark >= 50) return 2;
      if (mark >= 40) return 2;
      if (mark >= 30) return 1;
      return 0;
    }
    
    if (mark >= 80) return 7;
    if (mark >= 70) return 6;
    if (mark >= 60) return 5;
    if (mark >= 50) return 4;
    if (mark >= 40) return 3;
    if (mark >= 30) return 2;
    return 1;
  };

  const totalAPS = useMemo(() => {
    return subjects.reduce((total, subject, index) => {
      const mark = parseInt(subject.mark) || 0;
      if (mark === 0) return total;
      const isLO = index === 3; // Life Orientation
      return total + calculateAPSFromMark(mark, isLO);
    }, 0);
  }, [subjects]);

  const handleMarkChange = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index].mark = value;
    setSubjects(newSubjects);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          APS Calculator
        </CardTitle>
        <CardDescription>
          Enter your marks to calculate your Admission Point Score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {subjects.map((subject, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                placeholder={subject.name}
                value={subject.name}
                onChange={(e) => {
                  const newSubjects = [...subjects];
                  newSubjects[index].name = e.target.value;
                  setSubjects(newSubjects);
                }}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="%"
                min="0"
                max="100"
                value={subject.mark}
                onChange={(e) => handleMarkChange(index, e.target.value)}
                className="w-20"
              />
              <span className="w-8 text-center font-semibold">
                {subject.mark ? calculateAPSFromMark(parseInt(subject.mark) || 0, index === 3) : "-"}
              </span>
            </div>
          ))}
        </div>
        
        <div className="p-4 rounded-lg bg-primary/10 text-center">
          <p className="text-sm text-muted-foreground mb-1">Your APS Score</p>
          <p className="text-4xl font-bold text-primary">{totalAPS}</p>
        </div>
        
        <Button 
          className="w-full" 
          onClick={() => onCalculate(totalAPS)}
          disabled={totalAPS === 0}
        >
          Find Eligible Programs
        </Button>
      </CardContent>
    </Card>
  );
};

// University Card Component
const UniversityCard = ({ 
  university, 
  onClick 
}: { 
  university: any; 
  onClick: () => void;
}) => (
  <Card 
    className="cursor-pointer hover:shadow-lg transition-shadow"
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          {university.logo ? (
            <img src={university.logo} alt={university.name} className="w-12 h-12 object-contain" />
          ) : (
            <GraduationCap className="w-8 h-8 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg leading-tight">{university.name}</h3>
          {university.full_name && (
            <p className="text-sm text-muted-foreground truncate">{university.full_name}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{university.location || university.province || "South Africa"}</span>
          </div>
          {university.type && (
            <Badge variant="secondary" className="mt-2">{university.type}</Badge>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
);

// University Profile Modal
const UniversityProfileModal = ({ 
  university, 
  open, 
  onClose,
  apsScore 
}: { 
  university: any; 
  open: boolean; 
  onClose: () => void;
  apsScore: number;
}) => {
  const faculties = university?.faculties || [];

  // Fetch related accommodations
  const { data: accommodations } = useQuery({
    queryKey: ["campus-accommodations", university?.name],
    queryFn: async () => {
      if (!university?.name) return [];
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .or(`university.ilike.%${university.name}%,certified_universities.cs.{${university.name}}`)
        .eq("status", "active")
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!university?.name && open,
  });

  // Fetch related bursaries
  const { data: bursaries } = useQuery({
    queryKey: ["campus-bursaries", university?.name],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bursaries")
        .select("*")
        .eq("status", "active")
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  if (!university) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              {university.logo ? (
                <img src={university.logo} alt={university.name} className="w-12 h-12 object-contain" />
              ) : (
                <GraduationCap className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl">{university.name}</DialogTitle>
              <DialogDescription>{university.full_name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="faculties">Faculties & Programs</TabsTrigger>
              <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <MapPin className="w-4 h-4 text-primary mb-1" />
                  <p className="text-sm font-medium">{university.location || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Location</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <Users className="w-4 h-4 text-primary mb-1" />
                  <p className="text-sm font-medium">{university.student_population?.toLocaleString() || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <Calendar className="w-4 h-4 text-primary mb-1" />
                  <p className="text-sm font-medium">{university.established_year || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Established</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <Building2 className="w-4 h-4 text-primary mb-1" />
                  <p className="text-sm font-medium">{university.type || "University"}</p>
                  <p className="text-xs text-muted-foreground">Type</p>
                </div>
              </div>

              {university.overview && (
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-sm text-muted-foreground">{university.overview}</p>
                </div>
              )}

              {university.website && (
                <a 
                  href={university.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                </a>
              )}
            </TabsContent>

            <TabsContent value="faculties" className="mt-4">
              {faculties.length > 0 ? (
                <Accordion type="multiple" className="w-full">
                  {faculties.map((faculty: any, index: number) => (
                    <AccordionItem key={index} value={`faculty-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span>{faculty.name || `Faculty ${index + 1}`}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-6">
                          {faculty.programs?.map((program: any, pIndex: number) => (
                            <ProgramCard 
                              key={pIndex} 
                              program={program} 
                              apsScore={apsScore}
                            />
                          ))}
                          {(!faculty.programs || faculty.programs.length === 0) && (
                            <p className="text-sm text-muted-foreground">
                              No programs listed for this faculty yet.
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Faculty and program information coming soon.
                </p>
              )}
            </TabsContent>

            <TabsContent value="accommodation" className="mt-4">
              {accommodations && accommodations.length > 0 ? (
                <div className="grid gap-3">
                  {accommodations.map((acc: any) => (
                    <Link 
                      key={acc.id} 
                      to={`/listing/${acc.id}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{acc.property_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {acc.address}, {acc.city}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {acc.nsfas_accredited && (
                                <Badge variant="secondary" className="text-xs">NSFAS</Badge>
                              )}
                              <span className="text-sm font-medium text-primary">
                                R{acc.monthly_cost?.toLocaleString()}/month
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No accommodation listings found for this university.
                </p>
              )}
              <Link to={`/browse?university=${encodeURIComponent(university.name)}`}>
                <Button variant="outline" className="w-full mt-4">
                  <Home className="w-4 h-4 mr-2" />
                  View All Accommodation
                </Button>
              </Link>
            </TabsContent>

            <TabsContent value="funding" className="mt-4">
              <div className="text-center py-12 space-y-4">
                <div className="text-4xl">🚧</div>
                <h3 className="text-xl font-bold text-foreground">Coming Soon</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  We're building a comprehensive bursary directory. Stay tuned!
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Program Card Component
const ProgramCard = ({ program, apsScore }: { program: any; apsScore: number }) => {
  const [showDetails, setShowDetails] = useState(false);
  const meetsRequirement = apsScore === 0 || apsScore >= (program.aps_requirement || 0);

  return (
    <>
      <Card 
        className={`cursor-pointer transition-all ${meetsRequirement ? 'hover:border-primary' : 'opacity-60'}`}
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${meetsRequirement ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <p className="font-medium text-sm">{program.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {program.qualification_level && (
                  <span>{program.qualification_level}</span>
                )}
                {program.duration && (
                  <span>• {program.duration}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={meetsRequirement ? "default" : "secondary"}>
              APS: {program.aps_requirement || "TBC"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{program.name}</DialogTitle>
            <DialogDescription>{program.qualification_level}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {program.description && (
              <div>
                <h4 className="font-medium mb-1">About this program</h4>
                <p className="text-sm text-muted-foreground">{program.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <Star className="w-4 h-4 text-primary mb-1" />
                <p className="text-sm font-medium">APS: {program.aps_requirement || "TBC"}</p>
                <p className="text-xs text-muted-foreground">Minimum Required</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <Clock className="w-4 h-4 text-primary mb-1" />
                <p className="text-sm font-medium">{program.duration || "N/A"}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>

            {program.required_subjects && (
              <div>
                <h4 className="font-medium mb-2">Required Subjects</h4>
                <div className="flex flex-wrap gap-2">
                  {program.required_subjects.map((subject: string, i: number) => (
                    <Badge key={i} variant="outline">{subject}</Badge>
                  ))}
                </div>
              </div>
            )}

            {program.career_paths && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Career Paths
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {program.career_paths.map((career: string, i: number) => (
                    <li key={i}>• {career}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Main Campus Page
const Campus = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [apsScore, setApsScore] = useState(0);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch universities
  const { data: universities, isLoading: universitiesLoading } = useQuery({
    queryKey: ["campus-universities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch private institutions
  const { data: privateInstitutions, isLoading: privateLoading } = useQuery({
    queryKey: ["campus-private-institutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("private_institutions")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Filter universities
  const filteredUniversities = useMemo(() => {
    if (!universities) return [];
    
    return universities.filter(uni => {
      const matchesSearch = searchQuery === "" || 
        uni.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === "all" || uni.type === selectedType;
      const matchesProvince = selectedProvince === "all" || uni.province === selectedProvince;
      
      return matchesSearch && matchesType && matchesProvince;
    });
  }, [universities, searchQuery, selectedType, selectedProvince]);

  // Get unique provinces and types
  const provinces = useMemo(() => {
    if (!universities) return [];
    const unique = [...new Set(universities.map(u => u.province).filter(Boolean))];
    return unique.sort();
  }, [universities]);

  const types = useMemo(() => {
    if (!universities) return [];
    const unique = [...new Set(universities.map(u => u.type).filter(Boolean))];
    return unique.sort();
  }, [universities]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                ReBooked Campus
              </h1>
              <p className="text-lg opacity-90 mb-6">
                Discover universities, calculate your APS score, and find programs you qualify for
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search universities, programs, or fields of study..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar - APS Calculator & Filters */}
            <div className="lg:col-span-1 space-y-6">
              <APSCalculator onCalculate={setApsScore} />
              
              {/* Filters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Institution Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {types.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Province</label>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Provinces" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Provinces</SelectItem>
                        {provinces.map(province => (
                          <SelectItem key={province} value={province}>{province}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(selectedType !== "all" || selectedProvince !== "all" || searchQuery) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setSelectedType("all");
                        setSelectedProvince("all");
                        setSearchQuery("");
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>

              {apsScore > 0 && (
                <Card className="border-primary">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Your APS Score</p>
                    <p className="text-3xl font-bold text-primary">{apsScore}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Programs you qualify for are highlighted in green
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content - Institution Directory */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="public" className="w-full">
                <TabsList className="w-full justify-start mb-6 overflow-x-auto">
                  <TabsTrigger value="public" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Public Universities
                  </TabsTrigger>
                  <TabsTrigger value="private" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Private Institutions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="public">
                  {universitiesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : filteredUniversities.length > 0 ? (
                    <div className="space-y-4">
                      {filteredUniversities.map(university => (
                        <UniversityCard
                          key={university.id}
                          university={university}
                          onClick={() => setSelectedUniversity(university)}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="text-center py-12">
                      <CardContent>
                        <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">No Universities Found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search or filters.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="private">
                  {privateLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : privateInstitutions && privateInstitutions.length > 0 ? (
                    <div className="space-y-4">
                      {privateInstitutions
                        .filter(inst => 
                          searchQuery === "" || 
                          inst.name?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(institution => (
                          <Card key={institution.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                                  <Building2 className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold">{institution.name}</h3>
                                  {institution.abbreviation && (
                                    <p className="text-sm text-muted-foreground">{institution.abbreviation}</p>
                                  )}
                                  {institution.locations && institution.locations.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                      <MapPin className="w-3 h-3" />
                                      <span>{institution.locations.join(", ")}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <Card className="text-center py-12">
                      <CardContent>
                        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">No Private Institutions Found</h3>
                        <p className="text-muted-foreground">
                          Check back later for updates.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* University Profile Modal */}
        <UniversityProfileModal
          university={selectedUniversity}
          open={!!selectedUniversity}
          onClose={() => setSelectedUniversity(null)}
          apsScore={apsScore}
        />
      </div>
    </Layout>
  );
};

export default Campus;
