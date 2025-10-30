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

    return () => subscription.unsubscribe();
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

  const { data: favorites } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("accommodation_id, accommodations(*)")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data.map(f => f.accommodations);
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
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .eq("status", "active")
        .eq("university", university)
        .limit(6);
      
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
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="saved">Saved Properties</TabsTrigger>
            <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details. Email: {user.email}
                  {user.email_confirmed_at ? " (Verified)" : " (Not verified)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <h2 className="text-2xl font-bold mb-4">Saved Properties</h2>
            {favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((accommodation: any) => (
                  <AccommodationCard key={accommodation.id} {...accommodation} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No saved properties yet</p>
            )}
          </TabsContent>

          <TabsContent value="recent">
            <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
            {recentlyViewed && recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentlyViewed.map((accommodation: any) => (
                  <AccommodationCard key={accommodation.id} {...accommodation} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recently viewed properties</p>
            )}
          </TabsContent>

          <TabsContent value="recommended">
            <h2 className="text-2xl font-bold mb-4">
              Recommended for You
              {university && ` (${university})`}
            </h2>
            {!university ? (
              <p className="text-muted-foreground">
                Please add your university to see personalized recommendations
              </p>
            ) : recommended && recommended.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommended.map((accommodation: any) => (
                  <AccommodationCard key={accommodation.id} {...accommodation} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No recommendations available for your university yet
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
