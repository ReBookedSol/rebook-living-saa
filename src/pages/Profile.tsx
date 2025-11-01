import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import AccommodationCard from "@/components/AccommodationCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User2, Heart, Clock, CheckCircle, AlertCircle, LogOut, ShieldCheck } from "lucide-react";

const SA_UNIVERSITIES = [
  "University of Cape Town",
  "Stellenbosch University",
  "University of Pretoria",
  "University of the Witwatersrand",
  "University of KwaZulu-Natal",
  "Rhodes University",
  "University of the Free State",
  "North-West University",
  "University of Johannesburg",
  "Nelson Mandela University",
  "Cape Peninsula University of Technology",
  "Durban University of Technology",
  "Tshwane University of Technology",
  "Vaal University of Technology",
  "Central University of Technology",
  "Mangosuthu University of Technology",
  "Walter Sisulu University",
  "University of Venda",
  "University of Limpopo",
  "University of Zululand",
  "University of Fort Hare",
  "Sol Plaatje University",
  "Sefako Makgatho Health Sciences University",
];

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe && subscription.unsubscribe();
  }, [navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
        setUniversity(data.university || "");
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      if (error) throw error;
      return data?.role;
    },
    enabled: !!user?.id,
  });

  const { data: favorites } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("accommodation_id, accommodations(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return (data || []).map(f => f.accommodations).filter(Boolean);
    },
    enabled: !!user?.id,
  });

  const { data: recentlyViewed } = useQuery({
    queryKey: ["recently-viewed", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("viewed_accommodations")
        .select("accommodation_id, accommodations(*), viewed_at")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data.map(v => v.accommodations);
    },
    enabled: !!user?.id,
  });

  const { data: recommended } = useQuery({
    queryKey: ["recommended", university],
    queryFn: async () => {
      if (!university) return [];

      // get count for active accommodations for the university
      const { data: countData, count, error: countError } = await supabase
        .from("accommodations")
        .select("id", { count: "exact" })
        .eq("university", university);

      if (countError) throw countError;
      const total = count || 0;
      if (total === 0) return [];

      // rotate hourly using hour index
      const hourIndex = Math.floor(Date.now() / (60 * 60 * 1000));
      const start = hourIndex % total;
      const end = Math.min(start + 4, total - 1); // show up to 5

      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("status", "active")
        .eq("university", university)
        .range(start, end);

      if (error) throw error;
      return data;
    },
    enabled: !!university,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        university,
      })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast({ title: "Error", description: "Failed to sign out. Please try again.", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Sign out failed:", err);
      toast({ title: "Error", description: err?.message || "Network error while signing out.", variant: "destructive" });
    } finally {
      // Ensure local redirect even if sign out request failed
      try {
        // Attempt to clear local session storage keys set by supabase
        localStorage.removeItem("sb:$AUTH_TOKEN");
      } catch (e) {
        // ignore
      }
      navigate("/");
    }
  };

  if (!user) return null;

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString() : profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "-";
  const savedCount = favorites?.length || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 md:py-8">
        <Card className="w-full p-4 mb-4 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{firstName || lastName ? `${firstName} ${lastName}` : user.email}</h1>
                <div className="text-sm text-muted-foreground mt-1">Member since {memberSince}</div>
                {user.email_confirmed_at ? (
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle className="w-4 h-4" /> Verified
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border bg-gradient-to-br from-white to-gray-50 p-3 flex items-center gap-3">
                <div className="text-sm text-muted-foreground">Saved</div>
                <div className="text-xl font-semibold">{savedCount}</div>
              </div>

              {userRole === "admin" && (
                <Button onClick={() => navigate("/panel")} variant="default" className="inline-flex items-center gap-2 h-10 px-4">
                  <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                </Button>
              )}

              <Button onClick={handleSignOut} variant="outline" className="inline-flex items-center gap-2 h-10 px-4">
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="saved" className="space-y-6">
          <TabsList className="w-full bg-gray-50 border border-gray-200 rounded-xl p-1 flex flex-wrap gap-2">
            <TabsTrigger
              value="saved"
              className="flex-1 md:flex-none justify-center flex items-center gap-2 rounded-lg px-3 py-2 text-sm md:text-base data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm hover:bg-white/60 transition-all duration-200"
              aria-label="Saved"
            >
              <Heart className="w-5 h-5" /> <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>

            <TabsTrigger
              value="recent"
              className="flex-1 md:flex-none justify-center flex items-center gap-2 rounded-lg px-3 py-2 text-sm md:text-base data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm hover:bg-white/60 transition-all duration-200"
              aria-label="Recently viewed"
            >
              <Clock className="w-5 h-5" /> <span className="hidden sm:inline">Recent</span>
            </TabsTrigger>


            <TabsTrigger
              value="profile"
              className="flex-1 md:flex-none justify-center flex items-center gap-2 rounded-lg px-3 py-2 text-sm md:text-base data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm hover:bg-white/60 transition-all duration-200"
              aria-label="Profile"
            >
              <User2 className="w-5 h-5" /> <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl md:text-2xl">Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details. Email: {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university">University (Optional)</Label>
                    <Select value={university} onValueChange={setUniversity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your university" />
                      </SelectTrigger>
                      <SelectContent>
                        {SA_UNIVERSITIES.map((uni) => (
                          <SelectItem key={uni} value={uni}>
                            {uni}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 h-10">
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Saved Properties</h2>
            {favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {favorites.map((accommodation: any) => (
                  <AccommodationCard key={accommodation.id} {...accommodation} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No saved properties yet</p>
            )}
          </TabsContent>

          <TabsContent value="recent">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Recently Viewed</h2>
            {recentlyViewed && recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {recentlyViewed.map((accommodation: any) => (
                  <AccommodationCard key={accommodation.id} {...accommodation} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recently viewed properties</p>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
