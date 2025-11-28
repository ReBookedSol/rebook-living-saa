import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, DollarSign, Home, Calendar } from "lucide-react";

interface Pack {
  packName: string;
  accommodation: any;
  bursary: any;
  financialBreakdown: string;
  applicationStrategy: string;
  whyMatch: string;
}

const BursaryPackGenerator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [preferences, setPreferences] = useState({
    university: "",
    city: "",
    maxBudget: "",
    fieldOfStudy: "",
    academicPerformance: "",
    nsfasEligible: false,
    diversity: "",
  });

  const handleGenerate = async () => {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI pack generator",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPacks([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-bursary-pack', {
        body: { preferences }
      });

      if (error) throw error;

      if (data?.pack) {
        setPacks(Array.isArray(data.pack) ? data.pack : []);
        toast({
          title: "Success!",
          description: data.fromCache 
            ? "Generated packs from cache" 
            : "AI has generated personalized packs for you",
        });
      }
    } catch (error: any) {
      console.error('Error generating pack:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate packs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Bursary Pack Generator</CardTitle>
          </div>
          <CardDescription>
            Get personalized accommodation + bursary recommendations powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                placeholder="e.g., University of Pretoria"
                value={preferences.university}
                onChange={(e) => setPreferences({ ...preferences, university: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., Pretoria"
                value={preferences.city}
                onChange={(e) => setPreferences({ ...preferences, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Maximum Monthly Budget (R)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 5000"
                value={preferences.maxBudget}
                onChange={(e) => setPreferences({ ...preferences, maxBudget: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                placeholder="e.g., Engineering"
                value={preferences.fieldOfStudy}
                onChange={(e) => setPreferences({ ...preferences, fieldOfStudy: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="performance">Academic Performance</Label>
              <Select
                value={preferences.academicPerformance}
                onValueChange={(value) => setPreferences({ ...preferences, academicPerformance: value })}
              >
                <SelectTrigger id="performance">
                  <SelectValue placeholder="Select performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent (80%+)</SelectItem>
                  <SelectItem value="good">Good (70-79%)</SelectItem>
                  <SelectItem value="average">Average (60-69%)</SelectItem>
                  <SelectItem value="below-average">Below Average (50-59%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diversity">Diversity Category (Optional)</Label>
              <Input
                id="diversity"
                placeholder="e.g., African, Coloured, Indian, White"
                value={preferences.diversity}
                onChange={(e) => setPreferences({ ...preferences, diversity: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="nsfas"
              checked={preferences.nsfasEligible}
              onChange={(e) => setPreferences({ ...preferences, nsfasEligible: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="nsfas" className="cursor-pointer">
              I am NSFAS eligible
            </Label>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Your Personalized Packs...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Packs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {packs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Your Personalized Packs</h3>
          {packs.map((pack, index) => (
            <Card key={index} className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {pack.packName || `Pack ${index + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <Home className="h-4 w-4" />
                      Accommodation
                    </div>
                    <p className="text-sm">{pack.accommodation?.property_name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">
                      {pack.accommodation?.address || 'Address not available'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <DollarSign className="h-4 w-4" />
                      Bursary
                    </div>
                    <p className="text-sm">{pack.bursary?.name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">
                      {pack.bursary?.provider || 'Provider not available'}
                    </p>
                  </div>
                </div>

                {pack.financialBreakdown && (
                  <div className="space-y-2">
                    <div className="font-semibold">Financial Breakdown</div>
                    <p className="text-sm">{pack.financialBreakdown}</p>
                  </div>
                )}

                {pack.whyMatch && (
                  <div className="space-y-2">
                    <div className="font-semibold">Why This Match?</div>
                    <p className="text-sm">{pack.whyMatch}</p>
                  </div>
                )}

                {pack.applicationStrategy && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <Calendar className="h-4 w-4" />
                      Application Strategy
                    </div>
                    <p className="text-sm">{pack.applicationStrategy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BursaryPackGenerator;