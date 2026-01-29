import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Coins,
  Info,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";

// APS Calculator Component
const APSCalculator = () => {
  const [subjects, setSubjects] = useState([
    { name: "Home Language", mark: "" },
    { name: "First Additional Language", mark: "" },
    { name: "Mathematics/Maths Literacy", mark: "" },
    { name: "Life Orientation", mark: "" },
    { name: "Subject 5", mark: "" },
    { name: "Subject 6", mark: "" },
    { name: "Subject 7", mark: "" },
  ]);
  const [apsScore, setApsScore] = useState<number | null>(null);

  const calculateAPSFromMark = (mark: number, isLifeOrientation = false): number => {
    if (isLifeOrientation) {
      return mark >= 50 ? 4 : 0;
    }
    if (mark >= 80) return 7;
    if (mark >= 70) return 6;
    if (mark >= 60) return 5;
    if (mark >= 50) return 4;
    if (mark >= 40) return 3;
    if (mark >= 30) return 2;
    if (mark >= 20) return 1;
    return 0;
  };

  const calculateAPS = () => {
    let total = 0;
    subjects.forEach((subject, index) => {
      const mark = parseInt(subject.mark) || 0;
      const isLifeOrientation = subject.name === "Life Orientation";
      const points = calculateAPSFromMark(mark, isLifeOrientation);
      total += points;
    });
    setApsScore(total);
  };

  const handleMarkChange = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index].mark = value;
    setSubjects(newSubjects);
    setApsScore(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          APS Score Calculator
        </h3>
        <p className="text-sm text-blue-800">
          Enter your matric marks to calculate your APS score, which determines your eligibility for university programs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject, index) => (
          <div key={index}>
            <label className="text-sm font-medium block mb-1">{subject.name}</label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="Enter mark (0-100)"
              value={subject.mark}
              onChange={(e) => handleMarkChange(index, e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <Button onClick={calculateAPS} size="lg" className="w-full">
        Calculate APS Score
      </Button>

      {apsScore !== null && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Your APS Score</p>
            <p className="text-4xl font-bold text-primary">{apsScore}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Use this score to check program requirements at universities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// University Card Component
const UniversityCard = ({ university }: { university: any }) => {
  return (
    <Link to={`/campus?uni=${university.id}`}>
      <Card className="hover:shadow-lg transition-shadow h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{university.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {university.location || "Location TBA"}
              </CardDescription>
            </div>
            <Badge variant="secondary">{university.type || "University"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {university.overview || "Learn more about this university"}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {university.student_population && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                <span>{(university.student_population / 1000).toFixed(0)}K Students</span>
              </div>
            )}
            {university.established_year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Est. {university.established_year}</span>
              </div>
            )}
          </div>

          {university.website && (
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              Visit Website
              <ChevronRight className="w-3 h-3" />
            </a>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

const ReBookedCampus = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch universities
  const { data: universities, isLoading } = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Filter universities based on search
  const filteredUniversities = useMemo(() => {
    if (!universities) return [];
    return universities.filter((uni: any) =>
      uni.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [universities, searchQuery]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-transparent">
        {/* Header */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  ReBooked Campus
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Your complete guide to South African universities, applications, and student accommodation.
              </p>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="apps">Apps & APS</TabsTrigger>
                <TabsTrigger value="bursaries">Bursaries</TabsTrigger>
                <TabsTrigger value="universities">Universities</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      About ReBooked Campus
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      ReBooked Campus is your one-stop platform for everything related to student life in South Africa.
                      Whether you're exploring universities, calculating your APS score, or looking for student accommodation,
                      we've got you covered.
                    </p>
                    <p>
                      Our mission is to make it easier for students to find verified, NSFAS-accredited accommodation near
                      their universities while providing essential information about applying to and studying at South African
                      institutions.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Find Accommodation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Browse verified student accommodation near your university.
                      </p>
                      <Link to="/browse">
                        <Button variant="outline" size="sm" className="w-full">
                          Browse Listings
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        Explore Universities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Learn about universities and their programs.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveTab("universities")}
                      >
                        View Universities
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Calculate APS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Check your APS score for program eligibility.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveTab("apps")}
                      >
                        Calculate Now
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Apps & APS Tab */}
              <TabsContent value="apps" className="mt-8">
                <div className="max-w-2xl mx-auto">
                  <APSCalculator />
                </div>
              </TabsContent>

              {/* Bursaries Tab */}
              <TabsContent value="bursaries" className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="w-5 h-5" />
                      Student Bursaries & Financial Aid
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 mb-2">NSFAS (National Student Financial Aid Scheme)</h4>
                      <p className="text-sm text-amber-800 mb-3">
                        NSFAS provides financial aid to students from poor and working-class families.
                      </p>
                      <a
                        href="https://www.nsfas.org.za"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                      >
                        Visit NSFAS Website
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Other Bursary Options</h4>
                      <div className="space-y-3">
                        {[
                          {
                            name: "University-Based Bursaries",
                            description: "Most universities offer their own bursaries and scholarships. Check with your chosen institution."
                          },
                          {
                            name: "Corporate Bursaries",
                            description: "Many companies offer bursaries to students in specific fields like engineering, IT, and commerce."
                          },
                          {
                            name: "Merit-Based Scholarships",
                            description: "Students with excellent academic records can apply for merit-based scholarships."
                          },
                          {
                            name: "Sector Education and Training Authority (SETA)",
                            description: "SETAs provide bursaries for students in specific industries and professions."
                          }
                        ].map((bursary, idx) => (
                          <Card key={idx}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{bursary.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{bursary.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        <strong>Tip:</strong> Apply early and explore multiple options. Contact your university's financial aid office for personalized guidance.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Universities Tab */}
              <TabsContent value="universities" className="mt-8 space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search universities by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Universities Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="h-48 animate-pulse bg-muted" />
                    ))}
                  </div>
                ) : filteredUniversities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUniversities.map((university: any) => (
                      <UniversityCard key={university.id} university={university} />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold mb-2">No universities found</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery ? "Try adjusting your search terms." : "Universities will be listed here soon."}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ReBookedCampus;
