import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const passType = searchParams.get("type") as "weekly" | "monthly" || "weekly";
  
  const prices = {
    weekly: { base: 19, name: "Weekly Pass", days: 7 },
    monthly: { base: 59, name: "Monthly Pass", days: 30 },
  };

  const currentPrice = prices[passType];
  const finalPrice = currentPrice.base - (currentPrice.base * discount / 100);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth?redirect=/checkout?type=" + passType);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setUser(profile);
    };
    checkSession();
  }, [navigate, passType]);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error("Please sign in to proceed");
        navigate("/auth");
        return;
      }

      // Construct BobPay function URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("Supabase configuration is missing");
      }

      const bobpayFunctionUrl = `${supabaseUrl}/functions/v1/bobpay`;

      const response = await fetch(
        `${bobpayFunctionUrl}/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            payment_type: passType,
            email: session.user.email,
            user_id: session.user.id,
          }),
        }
      );

      if (!response.ok) {
        let errorDetail = "Failed to initialize payment";
        try {
          const errorData = await response.json();
          errorDetail = errorData.error || errorDetail;
        } catch {
          errorDetail = `Payment initialization failed (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorDetail);
      }

      const data = await response.json();
      window.location.href = data.payment_url;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to start payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const applyPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setDiscount(0);

    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);
    try {
      const { data: promo, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error) {
        setPromoError("Invalid or expired promo code");
        setIsApplyingPromo(false);
        return;
      }

      if (!promo) {
        setPromoError("Promo code not found");
        setIsApplyingPromo(false);
        return;
      }

      // Check if code has usage limit
      if (promo.max_uses && promo.uses_count >= promo.max_uses) {
        setPromoError("This promo code has reached its usage limit");
        setIsApplyingPromo(false);
        return;
      }

      // Check if code has expiry
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        setPromoError("This promo code has expired");
        setIsApplyingPromo(false);
        return;
      }

      setDiscount(promo.discount_percentage);
      toast.success(`Promo code applied! ${promo.discount_percentage}% off`);
    } catch (err: any) {
      setPromoError("Error applying promo code");
      console.error(err);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const premiumFeatures = [
    { icon: "📸", name: "All accommodation photos", description: "View every photo from listings" },
    { icon: "⭐", name: "All Google reviews", description: "See all reviews & ratings" },
    { icon: "🗺️", name: "Interactive map view", description: "Explore locations on map" },
    { icon: "🛰️", name: "Satellite imagery", description: "View satellite views" },
    { icon: "🚫", name: "No advertisements", description: "Ad-free browsing experience" },
    { icon: "⚡", name: "Priority support", description: "Get help when you need it" },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/pricing")}
              className="flex items-center gap-2 text-primary hover:underline mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to pricing
            </button>
            <h1 className="text-4xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-lg text-muted-foreground">Get instant access to premium features</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Checkout Section */}
            <div className="lg:col-span-2">
              {/* User Info */}
              {user && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Order for</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {user.first_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Premium Features */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">What you'll get</CardTitle>
                  <CardDescription>Premium features included in your {currentPrice.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {premiumFeatures.map((feature) => (
                      <div key={feature.name} className="flex gap-3">
                        <div className="text-2xl flex-shrink-0">{feature.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{feature.name}</p>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Duration Info */}
              <Card className="mb-6 border-accent/50 bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    Access Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Valid for</p>
                      <p className="text-2xl font-bold">{currentPrice.days} days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Automatic renewal</p>
                      <p className="text-lg font-semibold">Never</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Have a promo code?</CardTitle>
                  <CardDescription>Apply any available discount code</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={applyPromoCode} className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="flex-1"
                        disabled={isApplyingPromo}
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={isApplyingPromo || discount > 0}
                      >
                        {isApplyingPromo ? "Applying..." : discount > 0 ? "Applied" : "Apply"}
                      </Button>
                    </div>
                    {promoError && (
                      <div className="flex gap-2 items-start text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {promoError}
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex gap-2 items-start text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{discount}% discount applied!</span>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{currentPrice.name}</CardTitle>
                  <CardDescription>Order summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary Items */}
                  <div className="space-y-2 border-b pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base price</span>
                      <span>R{currentPrice.base}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span>-R{(currentPrice.base * discount / 100).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-semibold">Total</span>
                    <div className="text-right">
                      {discount > 0 && (
                        <div className="text-xs text-muted-foreground line-through">R{currentPrice.base}</div>
                      )}
                      <div className="text-2xl font-bold text-primary">R{finalPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground text-center pt-2">
                    One-time payment • No auto-renewal
                  </div>

                  {/* Payment Button */}
                  <UpgradePrompt
                    type="general"
                    compact={true}
                    className="w-full justify-center mt-6"
                  />

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4 border-t">
                    <span>🔒</span>
                    <span>Secure payment powered by BobPay</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
