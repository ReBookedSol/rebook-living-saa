import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import AccommodationCard from "@/components/AccommodationCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User2, Heart, Clock, CheckCircle, AlertCircle, LogOut, ShieldCheck, Sparkles, Crown, Bell } from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";
import { UpgradePrompt } from "@/components/UpgradePrompt";

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
  const [savedPage, setSavedPage] = useState(1);
  const SAVED_PER_PAGE = 5;
  
  // Access control status
  const { accessLevel, hasActivePayment, paymentType, expiresAt, isLoading: accessLoading } = useAccessControl();
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
        .limit(5);
      
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
        .eq("university", university)
        .range(start, end);

      if (error) throw error;
      return data;
    },
    enabled: !!university,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all notifications for this user
      const { data: notifs, error: notifsError } = await supabase
        .from("notifications")
        .select("*")
        .or(`target_user_id.is.null,target_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (notifsError) throw notifsError;
      if (!notifs?.length) return [];

      // Get read notifications for this user
      const { data: readNotifs, error: readError } = await supabase
        .from("user_notifications")
        .select("notification_id, is_read")
        .eq("user_id", user.id);

      if (readError) throw readError;
      const readMap = new Map(readNotifs?.map((r) => [r.notification_id, r.is_read]) || []);

      // Mark as read for notifications we're displaying
      const unreadIds = notifs.filter(n => !readMap.get(n.id)).map(n => n.id);
      if (unreadIds.length > 0) {
        await Promise.all(unreadIds.map(notifId =>
          supabase
            .from("user_notifications")
            .upsert({ user_id: user.id, notification_id: notifId, is_read: true })
            .select()
        ));
      }

      return notifs.map(n => ({
        ...n,
        is_read: readMap.get(n.id) ?? false,
      }));
    },
    enabled: !!user?.id,
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
        <Card className="w-full p-3 sm:p-4 mb-4 rounded-2xl shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <User2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">{firstName || lastName ? `${firstName} ${lastName}` : user.email}</h1>
                  {hasActivePayment && (
                    <div title="Premium Member">
                      <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">Member since {memberSince}</div>
                {user.email_confirmed_at ? (
                  <div className="mt-1 sm:mt-2 inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600 font-medium">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Verified
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="rounded-xl border bg-gradient-to-br from-white to-gray-50 p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
                <div className="text-xs sm:text-sm text-muted-foreground">Saved</div>
                <div className="text-lg sm:text-xl font-semibold">{savedCount}</div>
              </div>

              {userRole === "admin" && (
                <Button onClick={() => navigate("/panel")} variant="default" className="inline-flex items-center gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm">
                  <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" /> 
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </Button>
              )}

              <Button onClick={handleSignOut} variant="outline" className="inline-flex items-center gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm">
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Logout</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Subscription Status Card */}
        <Card className="w-full p-3 sm:p-4 mb-4 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${hasActivePayment ? 'bg-yellow-100 text-yellow-600' : 'bg-muted text-muted-foreground'}`}>
                {hasActivePayment ? <Crown className="w-5 h-5 sm:w-6 sm:h-6" /> : <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm sm:text-base">
                    {hasActivePayment ? "Premium Access" : "Free Account"}
                  </h3>
                  {hasActivePayment && (
                    <Badge className="bg-primary text-primary-foreground capitalize">
                      {paymentType}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {hasActivePayment && expiresAt
                    ? `Expires ${new Date(expiresAt).toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" })}`
                    : "Upgrade for unlimited photos, reviews & map access"}
                </p>
              </div>
            </div>
            
            {!hasActivePayment && (
              <UpgradePrompt type="general" compact className="w-full sm:w-auto" />
            )}
          </div>
        </Card>

        <Tabs defaultValue="saved" className="space-y-6">
          <TabsList className="w-full max-w-3xl mx-auto bg-gray-50 border border-gray-200 rounded-xl p-1 flex flex-wrap md:flex-nowrap items-center justify-center gap-1 sm:gap-2">
            <TabsTrigger
              value="saved"
              className="flex-1 md:flex-none min-w-[80px] justify-center flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm hover:bg-white/60 transition-all duration-200"
              aria-label="Saved"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Saved</span>
            </TabsTrigger>

            <TabsTrigger
              value="recent"
              className="flex-1 md:flex-none min-w-[80px] justify-center flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm hover:bg-white/60 transition-all duration-200"
              aria-label="Recently viewed"
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Recent</span>
            </TabsTrigger>


            <TabsTrigger
              value="profile"
              className="flex-1 md:flex-none min-w-[80px] justify-center flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm hover:bg-white/60 transition-all duration-200"
              aria-label="Profile"
            >
              <User2 className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>

            <TabsTrigger
              value="notifications"
              className="flex-1 md:flex-none min-w-[80px] justify-center flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm md:text-base data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm hover:bg-white/60 transition-all duration-200 relative"
              aria-label="Notifications"
            >
              <div className="relative">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {notifications && notifications.filter((n) => !n.is_read).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {notifications.filter((n) => !n.is_read).length}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Notifications</span>
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {favorites.slice((savedPage - 1) * SAVED_PER_PAGE, savedPage * SAVED_PER_PAGE).map((accommodation: any) => (
                    <AccommodationCard
                      key={accommodation.id}
                      id={accommodation.id}
                      propertyName={accommodation.property_name}
                      type={accommodation.type}
                      university={accommodation.university || ""}
                      address={accommodation.address}
                      city={accommodation.city || ""}
                      monthlyCost={accommodation.monthly_cost || 0}
                      rating={accommodation.rating || 0}
                      nsfasAccredited={accommodation.nsfas_accredited || false}
                      genderPolicy={accommodation.gender_policy || ""}
                      website={accommodation.website || null}
                      amenities={accommodation.amenities || []}
                      imageUrls={accommodation.image_urls || []}
                    />
                  ))}
                </div>
                {Math.ceil(favorites.length / SAVED_PER_PAGE) > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSavedPage(p => Math.max(1, p - 1))}
                      disabled={savedPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {savedPage} of {Math.ceil(favorites.length / SAVED_PER_PAGE)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSavedPage(p => Math.min(Math.ceil(favorites.length / SAVED_PER_PAGE), p + 1))}
                      disabled={savedPage >= Math.ceil(favorites.length / SAVED_PER_PAGE)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No saved properties yet</p>
            )}
          </TabsContent>

          <TabsContent value="recent">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Recently Viewed</h2>
            {recentlyViewed && recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {recentlyViewed.map((accommodation: any) => (
                  <AccommodationCard
                    key={accommodation.id}
                    id={accommodation.id}
                    propertyName={accommodation.property_name}
                    type={accommodation.type}
                    university={accommodation.university || ""}
                    address={accommodation.address}
                    city={accommodation.city || ""}
                    monthlyCost={accommodation.monthly_cost || 0}
                    rating={accommodation.rating || 0}
                    nsfasAccredited={accommodation.nsfas_accredited || false}
                    genderPolicy={accommodation.gender_policy || ""}
                    website={accommodation.website || null}
                    amenities={accommodation.amenities || []}
                    imageUrls={accommodation.image_urls || []}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No recently viewed properties</p>
            )}
          </TabsContent>

          <TabsContent value="notifications">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Notifications</h2>
            {notificationsLoading ? (
              <p className="text-muted-foreground">Loading notifications...</p>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification: any) => (
                  <Card key={notification.id} className="border border-gray-200 bg-white hover:shadow-sm transition-shadow">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.is_read ? 'bg-gray-300' : 'bg-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-foreground">{notification.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground/70 mt-2">
                            {new Date(notification.created_at).toLocaleDateString("en-ZA", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No notifications yet</p>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
