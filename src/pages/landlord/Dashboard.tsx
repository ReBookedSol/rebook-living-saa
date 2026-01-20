import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  Plus, 
  Eye, 
  Heart, 
  MousePointerClick, 
  Share2, 
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  BarChart3,
  Home,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check if user is a landlord
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data?.role || "user";
    },
    enabled: !!user?.id,
  });

  // Fetch landlord subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["landlord-subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("landlord_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id && userRole === "landlord",
  });

  // Fetch landlord listings
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ["landlord-listings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("landlord_listings")
        .select(`
          *,
          accommodations(*)
        `)
        .eq("landlord_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && userRole === "landlord",
  });

  // Fetch analytics for all listings
  const { data: analytics } = useQuery({
    queryKey: ["landlord-analytics", user?.id],
    queryFn: async () => {
      if (!user?.id || !listings?.length) return { total: { views: 0, clicks: 0, favorites: 0, shares: 0 } };
      
      const accommodationIds = listings.map(l => l.accommodation_id);
      const { data, error } = await supabase
        .from("listing_analytics")
        .select("*")
        .in("accommodation_id", accommodationIds);
      
      if (error) throw error;
      
      const total = (data || []).reduce((acc, curr) => ({
        views: acc.views + (curr.views || 0),
        clicks: acc.clicks + (curr.clicks || 0),
        favorites: acc.favorites + (curr.favorites || 0),
        shares: acc.shares + (curr.shares || 0),
      }), { views: 0, clicks: 0, favorites: 0, shares: 0 });
      
      return { total, byListing: data };
    },
    enabled: !!listings?.length,
  });

  // Upgrade to landlord mutation
  const upgradeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Add landlord role
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: user.id, role: "landlord" }, { onConflict: "user_id" });
      
      if (roleError) throw roleError;
      
      // Create subscription record
      const { error: subError } = await supabase
        .from("landlord_subscriptions")
        .insert({ user_id: user.id, status: "inactive" });
      
      if (subError && !subError.message.includes("duplicate")) throw subError;
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
      queryClient.invalidateQueries({ queryKey: ["landlord-subscription"] });
      toast.success("Successfully upgraded to Landlord account!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upgrade account");
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case "pending_review":
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "changes_requested":
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" />Changes Requested</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800"><CreditCard className="w-3 h-3 mr-1" />Paid</Badge>;
      case "unpaid":
        return <Badge variant="secondary"><CreditCard className="w-3 h-3 mr-1" />Unpaid</Badge>;
      case "overdue":
        return <Badge variant="destructive"><CreditCard className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (roleLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  // Show upgrade prompt if not a landlord
  if (userRole !== "landlord" && userRole !== "admin") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Become a Landlord</CardTitle>
              <CardDescription className="text-base mt-2">
                List your accommodation properties and reach thousands of students looking for housing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h3 className="font-semibold mb-2">What's Included</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> 2 free listings</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Performance analytics</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Direct student inquiries</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> "Listed by Landlord" badge</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h3 className="font-semibold mb-2">Pricing</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> R80/month subscription</li>
                    <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> First 2 listings included</li>
                    <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> R30/extra listing</li>
                    <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Pay only after approval</li>
                  </ul>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full md:w-auto"
                onClick={() => upgradeMutation.mutate()}
                disabled={upgradeMutation.isPending}
              >
                {upgradeMutation.isPending ? "Upgrading..." : "Upgrade to Landlord"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const approvedListings = listings?.filter(l => l.submission_status === "approved" && l.payment_status === "paid").length || 0;
  const pendingListings = listings?.filter(l => l.submission_status === "pending_review").length || 0;
  const maxFreeListings = subscription?.max_free_listings || 2;
  const canAddMore = (listings?.length || 0) < maxFreeListings || subscription?.status === "active";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Building2 className="w-7 h-7 text-primary" />
              Landlord Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage your accommodation listings</p>
          </div>
          <Button 
            onClick={() => navigate("/landlord/add-listing")}
            disabled={!canAddMore}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
          </Button>
        </div>

        {/* Subscription Status Alert */}
        {subscription?.status !== "active" && (listings?.length || 0) > 0 && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your subscription is inactive. Approved listings will become visible once you complete payment.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.total?.views || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <MousePointerClick className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.total?.clicks || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.total?.favorites || 0}</p>
                  <p className="text-xs text-muted-foreground">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Share2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analytics?.total?.shares || 0}</p>
                  <p className="text-xs text-muted-foreground">Shares</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              My Listings ({listings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {listingsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="space-y-4">
                {listings.map((listing: any) => (
                  <Card key={listing.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {listing.accommodations?.property_name || "Untitled Listing"}
                            </h3>
                            {getStatusBadge(listing.submission_status)}
                            {getPaymentBadge(listing.payment_status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {listing.accommodations?.address}, {listing.accommodations?.city}
                          </p>
                          {listing.rejection_reason && (
                            <Alert className="mt-2 border-red-200 bg-red-50 py-2">
                              <AlertDescription className="text-sm text-red-800">
                                {listing.rejection_reason}
                              </AlertDescription>
                            </Alert>
                          )}
                          {listing.admin_notes && listing.submission_status === "changes_requested" && (
                            <Alert className="mt-2 border-orange-200 bg-orange-50 py-2">
                              <AlertDescription className="text-sm text-orange-800">
                                Admin notes: {listing.admin_notes}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/landlord/listing/${listing.id}`)}
                          >
                            View Details
                          </Button>
                          {listing.submission_status === "approved" && listing.payment_status === "unpaid" && (
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/landlord/pay/${listing.id}`)}
                            >
                              Pay Now
                            </Button>
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
                  <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first accommodation listing.
                  </p>
                  <Button onClick={() => navigate("/landlord/add-listing")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Listing
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track how your listings are performing</CardDescription>
              </CardHeader>
              <CardContent>
                {listings && listings.length > 0 ? (
                  <div className="space-y-4">
                    {listings.map((listing: any) => {
                      const listingAnalytics = analytics?.byListing?.filter(
                        (a: any) => a.accommodation_id === listing.accommodation_id
                      ) || [];
                      const totals = listingAnalytics.reduce((acc: any, curr: any) => ({
                        views: acc.views + (curr.views || 0),
                        clicks: acc.clicks + (curr.clicks || 0),
                        favorites: acc.favorites + (curr.favorites || 0),
                        shares: acc.shares + (curr.shares || 0),
                      }), { views: 0, clicks: 0, favorites: 0, shares: 0 });

                      return (
                        <div key={listing.id} className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-3">{listing.accommodations?.property_name}</h4>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-xl font-bold text-primary">{totals.views}</p>
                              <p className="text-xs text-muted-foreground">Views</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-blue-600">{totals.clicks}</p>
                              <p className="text-xs text-muted-foreground">Clicks</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-red-500">{totals.favorites}</p>
                              <p className="text-xs text-muted-foreground">Favorites</p>
                            </div>
                            <div>
                              <p className="text-xl font-bold text-green-600">{totals.shares}</p>
                              <p className="text-xs text-muted-foreground">Shares</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Add listings to see analytics
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Manage your landlord subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Status</h4>
                      <Badge className={subscription?.status === "active" ? "bg-green-100 text-green-800" : ""}>
                        {subscription?.status || "Inactive"}
                      </Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Plan</h4>
                      <p className="text-lg font-semibold">R80/month</p>
                      <p className="text-sm text-muted-foreground">Includes 2 listings</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Listing Slots</h4>
                    <p className="text-sm text-muted-foreground">
                      {listings?.length || 0} of {maxFreeListings} free listings used
                    </p>
                    {(listings?.length || 0) >= maxFreeListings && (
                      <p className="text-sm text-amber-600 mt-2">
                        Additional listings: R30 each
                      </p>
                    )}
                  </div>
                  {subscription?.status !== "active" && approvedListings > 0 && (
                    <Button className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Activate Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LandlordDashboard;
