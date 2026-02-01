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
  Award,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
      <div className="bg-gradient-to-r from-slate-50 to-gray-100 border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          APS Score Calculator
        </h3>
        <p className="text-sm text-slate-600">
          Enter your matric marks to calculate your APS score and discover which programs you qualify for.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject, index) => (
          <div key={index}>
            <label className="text-sm font-medium block mb-2 text-gray-700">{subject.name}</label>
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

      <Button onClick={calculateAPS} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        <Calculator className="h-5 w-5 mr-2" />
        Calculate APS Score
      </Button>

      {apsScore !== null && (
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-white shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-primary font-medium mb-2">Your APS Score</p>
            <p className="text-5xl font-bold text-primary mb-3">{apsScore}</p>
            <p className="text-sm text-muted-foreground">
              Use this score to check program requirements at universities. Click on a university to see which programs you qualify for.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// University logos mapping - use abbreviation as key
const UNIVERSITY_LOGOS: Record<string, string> = {
  "CPUT": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Cape_Peninsula_University_of_Technology_logo.svg/800px-Cape_Peninsula_University_of_Technology_logo.svg.png",
  "CUT": "https://upload.wikimedia.org/wikipedia/en/thumb/5/55/Central_University_of_Technology_logo.svg/800px-Central_University_of_Technology_logo.svg.png",
  "DUT": "https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Durban_University_of_Technology_logo.svg/800px-Durban_University_of_Technology_logo.svg.png",
  "MUT": "https://upload.wikimedia.org/wikipedia/en/d/d7/Mangosuthu_University_of_Technology_logo.png",
  "NMU": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Nelson_Mandela_University_logo.svg/800px-Nelson_Mandela_University_logo.svg.png",
  "NWU": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/NWU_Logo.svg/800px-NWU_Logo.svg.png",
  "RU": "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Rhodes_University_logo.svg/800px-Rhodes_University_logo.svg.png",
  "SMU": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Sefako_Makgatho_Health_Sciences_University_logo.svg/800px-Sefako_Makgatho_Health_Sciences_University_logo.svg.png",
  "SPU": "https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Sol_Plaatje_University_logo.svg/800px-Sol_Plaatje_University_logo.svg.png",
  "SU": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Stellenbosch_University_logo.svg/800px-Stellenbosch_University_logo.svg.png",
  "TUT": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e7/Tshwane_University_of_Technology_logo.svg/800px-Tshwane_University_of_Technology_logo.svg.png",
  "UCT": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/University_of_Cape_Town_logo.svg/800px-University_of_Cape_Town_logo.svg.png",
  "UFH": "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/University_of_Fort_Hare_logo.svg/800px-University_of_Fort_Hare_logo.svg.png",
  "UFS": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/University_of_the_Free_State_logo.svg/800px-University_of_the_Free_State_logo.svg.png",
  "UJ": "https://upload.wikimedia.org/wikipedia/en/thumb/0/01/University_of_Johannesburg_logo.svg/800px-University_of_Johannesburg_logo.svg.png",
  "UKZN": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/University_of_KwaZulu-Natal_logo.svg/800px-University_of_KwaZulu-Natal_logo.svg.png",
  "UL": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/University_of_Limpopo_logo.svg/800px-University_of_Limpopo_logo.svg.png",
  "UNISA": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Unisa_logo.svg/800px-Unisa_logo.svg.png",
  "UMP": "https://upload.wikimedia.org/wikipedia/en/1/14/University_of_Mpumalanga_logo.png",
  "UP": "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/University_of_Pretoria_logo.svg/800px-University_of_Pretoria_logo.svg.png",
  "UNIVEN": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/University_of_Venda_logo.svg/800px-University_of_Venda_logo.svg.png",
  "UWC": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/University_of_the_Western_Cape_logo.svg/800px-University_of_the_Western_Cape_logo.svg.png",
  "WSU": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Walter_Sisulu_University_logo.svg/800px-Walter_Sisulu_University_logo.svg.png",
  "WITS": "https://upload.wikimedia.org/wikipedia/en/thumb/2/26/Wits_University_logo.svg/800px-Wits_University_logo.svg.png",
  "UNIZULU": "https://upload.wikimedia.org/wikipedia/en/thumb/5/54/University_of_Zululand_logo.svg/800px-University_of_Zululand_logo.svg.png",
  "VUT": "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Vaal_University_of_Technology_logo.svg/800px-Vaal_University_of_Technology_logo.svg.png",
};

// University Card Component
const UniversityCard = ({ university }: { university: any }) => {
  const navigate = useNavigate();

  // Get logo with multiple fallback strategies
  const getLogoUrl = () => {
    // Try database logo first
    if (university.logo) return university.logo;

    // Try uppercase abbreviation
    const abbrev = university.abbreviation?.toUpperCase();
    if (abbrev && UNIVERSITY_LOGOS[abbrev]) return UNIVERSITY_LOGOS[abbrev];

    // Try lowercase abbreviation
    const abbrLower = university.abbreviation?.toLowerCase();
    if (abbrLower && UNIVERSITY_LOGOS[abbrLower]) return UNIVERSITY_LOGOS[abbrLower];

    // Try to match by university name
    const nameKey = university.name?.split(" ").slice(0, 2).join("").toUpperCase();
    if (nameKey && UNIVERSITY_LOGOS[nameKey]) return UNIVERSITY_LOGOS[nameKey];

    return null;
  };

  const logoUrl = getLogoUrl();
  const abbrev = university.abbreviation?.toUpperCase() || "";

  return (
    <div onClick={() => navigate(`/university/${university.id}`)}>
      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border border-slate-200 shadow-sm h-full bg-white flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${university.name} logo`}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = "none";
                      const fallback = img.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <span
                  className={`w-12 h-12 ${logoUrl ? "hidden" : "flex"} items-center justify-center text-xs font-bold bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-lg`}
                >
                  {abbrev || university.name?.substring(0, 3)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                  {university.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{university.location || "Location TBA"}</span>
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="flex-shrink-0 text-xs bg-slate-100 text-slate-700 whitespace-nowrap">
              {university.type || "University"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {university.overview || "Learn more about this university"}
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {university.student_population && (
              <div className="p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-slate-600" />
                  <span className="font-semibold text-slate-900">{(university.student_population / 1000).toFixed(0)}K</span>
                </div>
                <span className="text-muted-foreground">Students</span>
              </div>
            )}
            {university.established_year && (
              <div className="p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  <span className="font-semibold text-slate-900">{university.established_year}</span>
                </div>
                <span className="text-muted-foreground">Founded</span>
              </div>
            )}
          </div>

          <Button
            size="sm"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-auto"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            asChild
          >
            <Link to={`/university/${university.id}`}>
              <Globe className="w-4 h-4" />
              <span>Visit University Profile</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const ReBookedCampus = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllUniversities, setShowAllUniversities] = useState(false);

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

  const displayedUniversities = showAllUniversities
    ? filteredUniversities
    : filteredUniversities.slice(0, 6);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-gray-50">
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className={
                'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23334155" fill-opacity="0.3"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')]'
              }
            />
          </div>

          <div className="relative container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center space-y-8">
              {/* Main Heading */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <GraduationCap className="w-4 h-4" />
                  Complete University Guide
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  ReBooked
                  <span className="block text-primary">Campus Guide</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Your all-in-one platform for exploring South African universities, calculating your APS score, discovering bursaries, and finding the perfect student accommodation.
                </p>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => setActiveTab("apps")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate APS Score
                </Button>
                <Button
                  onClick={() => setActiveTab("bursaries")}
                  variant="outline"
                  className="border-slate-300 text-foreground hover:bg-slate-50 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Find Bursaries
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="container mx-auto px-4 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Modern Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1 bg-white rounded-xl shadow-sm border border-slate-200 mb-8 p-1 h-auto">
              <TabsTrigger
                value="overview"
                className="rounded-lg py-4 px-4 sm:px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium transition-all"
              >
                <Info className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="apps"
                className="rounded-lg py-4 px-4 sm:px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium transition-all"
              >
                <Calculator className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">APS</span>
                <span className="sm:hidden">APS</span>
              </TabsTrigger>
              <TabsTrigger
                value="bursaries"
                className="rounded-lg py-4 px-4 sm:px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium transition-all"
              >
                <Coins className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Bursaries</span>
              </TabsTrigger>
              <TabsTrigger
                value="universities"
                className="rounded-lg py-4 px-4 sm:px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium transition-all"
              >
                <Building2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Universities</span>
                <span className="sm:hidden">Unis</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to ReBooked Campus</h2>
                  <p className="text-muted-foreground">Your complete guide to South African higher education</p>
                </div>

                <Card className="border border-slate-200 shadow-lg bg-white">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      About ReBooked Campus
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-muted-foreground">
                      ReBooked Campus is your one-stop platform for everything related to student life in South Africa. Whether you're exploring universities, calculating your APS score, searching for bursaries, or looking for student accommodation, we've got you covered.
                    </p>
                    <p className="text-muted-foreground">
                      Our mission is to make it easier for students to access verified, NSFAS-accredited accommodation while providing essential information about applying to and studying at South African institutions.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-slate-200 shadow-sm" onClick={() => setActiveTab("universities")}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Explore Universities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Browse profiles of all South African universities with detailed information about programs, facilities, and admissions.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        View Universities
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-slate-200 shadow-sm" onClick={() => setActiveTab("apps")}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-primary" />
                        Calculate APS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter your matric marks to calculate your APS score and see which programs you qualify for.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Calculate Now
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-slate-200 shadow-sm" onClick={() => setActiveTab("bursaries")}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Find Funding
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Discover bursaries, scholarships, and financial aid programs available to South African students.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Explore Bursaries
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Apps & APS Tab */}
            <TabsContent value="apps" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">APS Score Calculator</h2>
                <p className="text-muted-foreground">Calculate your Admission Point Score from your matric marks</p>
              </div>
              <div className="max-w-2xl mx-auto">
                <APSCalculator />
              </div>
            </TabsContent>

            {/* Bursaries Tab */}
            <TabsContent value="bursaries" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Student Bursaries & Financial Aid</h2>
                <p className="text-muted-foreground">Discover funding opportunities for your studies</p>
              </div>

              <Card className="border border-slate-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Available Funding Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h4 className="font-semibold text-amber-900 mb-2 text-lg">NSFAS (National Student Financial Aid Scheme)</h4>
                    <p className="text-sm text-amber-800 mb-4">
                      NSFAS provides financial aid to students from poor and working-class families. It's the primary funding mechanism for South African students in higher education.
                    </p>
                    <a
                      href="https://www.nsfas.org.za"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-amber-700 font-medium hover:text-amber-900"
                    >
                      Visit NSFAS
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        icon: Building2,
                        title: "University Bursaries",
                        description: "Most universities offer their own bursaries and scholarships. Contact your chosen institution."
                      },
                      {
                        icon: TrendingUp,
                        title: "Merit-Based Scholarships",
                        description: "Students with excellent academic records can apply for merit-based scholarships."
                      },
                      {
                        icon: Award,
                        title: "Corporate Bursaries",
                        description: "Many companies offer bursaries to students in specific fields like engineering and IT."
                      },
                      {
                        icon: Users,
                        title: "SETA Programs",
                        description: "Sector Education and Training Authority provides bursaries for specific industries."
                      }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div>
                              <h5 className="font-semibold text-foreground mb-1">{item.title}</h5>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>💡 Pro Tip:</strong> Apply early and explore multiple options. Contact your university's financial aid office for personalized guidance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="universities" className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">South African Universities</h2>
                <p className="text-muted-foreground">Explore all universities and their programs</p>
              </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-48 animate-pulse bg-gray-200 border-0" />
                  ))}
                </div>
              ) : displayedUniversities.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedUniversities.map((university: any) => (
                      <UniversityCard key={university.id} university={university} />
                    ))}
                  </div>

                  {/* View More Button */}
                  {filteredUniversities.length > 6 && (
                    <div className="text-center pt-8">
                      <Button
                        onClick={() => setShowAllUniversities(!showAllUniversities)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
                        size="lg"
                      >
                        {showAllUniversities ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            View Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            View All ({filteredUniversities.length} universities)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card className="border-0 shadow-lg text-center py-12">
                  <CardContent>
                    <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">No universities found</h3>
                    <p className="text-sm text-gray-600">
                      {searchQuery ? "Try adjusting your search terms." : "Universities will be listed here soon."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ReBookedCampus;
