import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Sparkles, 
  Send, 
  Loader2, 
  Building2, 
  Scale, 
  MessageSquare,
  Lock,
  ChevronRight,
  Star,
  MapPin,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAccessControl } from "@/hooks/useAccessControl";
import { UpgradePrompt } from "@/components/UpgradePrompt";

interface SearchResult {
  id: string;
  property_name: string;
  type: string;
  address: string;
  city: string;
  province: string;
  monthly_cost: number;
  nsfas_accredited: boolean;
  gender_policy: string;
  amenities: string[];
  rating: number;
  university: string;
}

interface AIResponse {
  success: boolean;
  filters?: Record<string, any>;
  results?: SearchResult[];
  alternatives?: SearchResult[];
  message?: string;
  explanation?: string;
  comparison?: string;
  rankings?: Array<{ id: string; rank: number; reason: string }>;
  error?: string;
}

export const AIAccommodationAssistant = () => {
  const navigate = useNavigate();
  const { accessLevel, isLoading: accessLoading } = useAccessControl();
  const isPaidUser = accessLevel === "paid";
  
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedListings, setSelectedListings] = useState<SearchResult[]>([]);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [comparison, setComparison] = useState<string>("");

  const callAIAssistant = async (action: string, data: Record<string, any>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to use AI features");
      return null;
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-accommodation-assistant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action, ...data }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "AI request failed");
    }

    return response.json();
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    setAiResponse(null);

    try {
      const result = await callAIAssistant("search", { query });
      setAiResponse(result);
      setSearchResults(result?.results || []);
      
      if (result?.alternatives?.length > 0 && result?.results?.length === 0) {
        toast.info("No exact matches found. Showing alternatives.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplain = async (listing: SearchResult) => {
    setIsLoading(true);
    setExplanation("");

    try {
      const result = await callAIAssistant("explain", { listings: [listing] });
      setExplanation(result?.explanation || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to explain listing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    if (selectedListings.length < 2) {
      toast.error("Select at least 2 listings to compare");
      return;
    }

    setIsLoading(true);
    setComparison("");

    try {
      const result = await callAIAssistant("compare", { listings: selectedListings });
      setComparison(result?.comparison || "");
      setActiveTab("compare");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Comparison failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListingSelection = (listing: SearchResult) => {
    setSelectedListings((prev) => {
      const exists = prev.find((l) => l.id === listing.id);
      if (exists) {
        return prev.filter((l) => l.id !== listing.id);
      }
      if (prev.length >= 3) {
        toast.error("Maximum 3 listings for comparison");
        return prev;
      }
      return [...prev, listing];
    });
  };

  if (accessLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isPaidUser) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Accommodation Assistant
          </CardTitle>
          <CardDescription>
            Unlock intelligent search, recommendations, and comparisons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Pro Feature</p>
                <p className="text-xs text-muted-foreground">
                  Upgrade to Pro to use AI-powered search, explanations, and comparisons
                </p>
              </div>
            </div>
            <UpgradePrompt 
              type="general"
              buttonText="Upgrade for AI Features"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Accommodation Assistant
        </CardTitle>
        <CardDescription>
          Search naturally, get explanations, and compare listings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="search" className="text-xs sm:text-sm">
              <Search className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </TabsTrigger>
            <TabsTrigger value="explain" className="text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Explain</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="text-xs sm:text-sm">
              <Scale className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Try: 'NSFAS accommodation near WITS under R3000'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Found {searchResults.length} results
                  </p>
                  {selectedListings.length >= 2 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCompare}
                      disabled={isLoading}
                    >
                      <Scale className="w-4 h-4 mr-2" />
                      Compare ({selectedListings.length})
                    </Button>
                  )}
                </div>
                
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedListings.find((l) => l.id === result.id)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleListingSelection(result)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{result.property_name}</p>
                          {result.nsfas_accredited && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              NSFAS
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {result.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            R{result.monthly_cost?.toLocaleString()}/mo
                          </span>
                          {result.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {result.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExplain(result);
                            setActiveTab("explain");
                          }}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/listing/${result.id}`);
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Alternatives */}
            {aiResponse?.alternatives && aiResponse.alternatives.length > 0 && searchResults.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-amber-600">
                  No exact matches. Try these alternatives:
                </p>
                {aiResponse.alternatives.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/listing/${alt.id}`)}
                  >
                    <p className="font-medium text-sm">{alt.property_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {alt.city} • R{alt.monthly_cost?.toLocaleString()}/mo
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Explain Tab */}
          <TabsContent value="explain" className="space-y-4">
            {explanation ? (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">AI Analysis</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {explanation}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a listing to get an AI explanation</p>
              </div>
            )}
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-4">
            {comparison ? (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Scale className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Comparison</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {comparison}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Scale className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {selectedListings.length < 2
                    ? "Select 2-3 listings from search results to compare"
                    : "Click Compare to analyze selected listings"}
                </p>
                {selectedListings.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {selectedListings.map((l) => (
                      <Badge key={l.id} variant="secondary">
                        {l.property_name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIAccommodationAssistant;
