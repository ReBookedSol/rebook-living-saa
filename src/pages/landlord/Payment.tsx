import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CreditCard, 
  CheckCircle, 
  Building2, 
  MapPin, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  Shield
} from "lucide-react";
import { toast } from "sonner";

const LandlordPayment = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  // Fetch the listing details
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listing-payment", listingId],
    queryFn: async () => {
      if (!listingId) throw new Error("No listing ID provided");
      
      const { data, error } = await supabase
        .from("landlord_listings")
        .select(`
          *,
          accommodations(*)
        `)
        .eq("id", listingId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!listingId && !!user,
  });

  // Fetch subscription to determine pricing
  const { data: subscription } = useQuery({
    queryKey: ["landlord-subscription-payment", user?.id],
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
    enabled: !!user?.id,
  });

  // Count existing paid listings
  const { data: paidListingsCount } = useQuery({
    queryKey: ["paid-listings-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from("landlord_listings")
        .select("*", { count: "exact", head: true })
        .eq("landlord_id", user.id)
        .eq("payment_status", "paid");
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const handlePayment = async () => {
    if (!user || !listing) return;
    
    setProcessing(true);
    try {
      const profile = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();
      
      const email = profile.data?.email || user.email;
      const amount = calculateAmount();
      
      // Call the Paystack edge function
      const { data, error } = await supabase.functions.invoke("paystack", {
        body: {
          action: "initialize-payment",
          email,
          amount,
          metadata: {
            landlord_id: user.id,
            listing_id: listingId,
          },
          callback_url: `${window.location.origin}/landlord?payment=success`,
        },
      });

      if (error) throw error;

      // Redirect to Paystack checkout
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to initialize payment");
      setProcessing(false);
    }
  };

  const calculateAmount = () => {
    const baseAmount = subscription?.base_amount || 8000; // R80 in cents
    const additionalFee = subscription?.additional_listing_fee || 3000; // R30 in cents
    const maxFree = subscription?.max_free_listings || 2;
    
    // If under the free limit, just pay base subscription
    if ((paidListingsCount || 0) < maxFree) {
      // If subscription is already active, this listing is free
      if (subscription?.status === "active") {
        return 0;
      }
      return baseAmount / 100; // Convert from cents to rands
    }
    
    // Additional listing fee
    return additionalFee / 100;
  };

  const amount = calculateAmount();
  const isFirstPayment = !subscription || subscription.status !== "active";

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || "Listing not found or you don't have permission to access it."}
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => navigate("/landlord")}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  // Check if listing is approved
  if (listing.submission_status !== "approved") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This listing has not been approved yet. Please wait for admin approval before making payment.
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => navigate("/landlord")}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  // Check if already paid
  if (listing.payment_status === "paid") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Already Paid</h2>
              <p className="text-muted-foreground mb-4">
                This listing has already been paid for and is now live.
              </p>
              <Button onClick={() => navigate("/landlord")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/landlord")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader className="text-center border-b">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete Payment</CardTitle>
            <CardDescription>
              Finalize your listing and make it visible to students
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Listing Summary */}
            <div className="p-4 rounded-lg bg-secondary/50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Listing Summary
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-lg">{listing.accommodations?.property_name}</p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {listing.accommodations?.address}, {listing.accommodations?.city}
                </p>
                <p className="text-muted-foreground">
                  Type: {listing.accommodations?.type}
                </p>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">Payment Details</h3>
              <div className="space-y-3">
                {isFirstPayment ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Subscription</span>
                      <span>R{(subscription?.base_amount || 8000) / 100}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Includes up to {subscription?.max_free_listings || 2} listings</span>
                      <span>Included</span>
                    </div>
                  </>
                ) : amount === 0 ? (
                  <div className="flex justify-between text-sm">
                    <span>This listing is included in your subscription</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span>Additional Listing Fee</span>
                    <span>R{amount}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total Due Today</span>
                  <span className="text-xl text-primary">R{amount}</span>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Secure Payment</p>
                <p className="text-green-700">
                  Your payment is processed securely by Paystack. We never store your card details.
                </p>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="space-y-2">
              <h4 className="font-medium">What happens next?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Your listing will go live immediately after payment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Students will be able to find your accommodation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  You'll receive analytics on listing performance
                </li>
              </ul>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {amount === 0 ? "Activate Listing" : `Pay R${amount} Now`}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LandlordPayment;
