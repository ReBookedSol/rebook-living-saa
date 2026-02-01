import { Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import Layout from "@/components/Layout";

const Pricing = () => {
  const premiumFeatures = [
    "See preview photos on browse cards",
    "Unlimited photos in property galleries",
    "Complete property information",
    "Interactive map with satellite view",
    "Street view (360° imagery)",
    "Advanced search filters",
  ];

  const freeFeatures = [
    { name: "Browse all accommodations", included: true },
    { name: "View up to 3 photos per listing", included: true },
    { name: "Read reviews and ratings", included: true },
    { name: "Basic property details", included: true },
    { name: "Search by location, price & amenities", included: true },
    { name: "Interactive map (standard view)", included: true },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock full property galleries and premium features with a ReBooked Premium Pass. View all accommodation photos in listings and access more features.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Free Forever */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">Free Forever</CardTitle>
                    <CardDescription>Get started at no cost</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-4xl font-bold">R0</div>
                  <p className="text-sm text-muted-foreground">Always free • No expiration</p>
                </div>

                <div className="space-y-3">
                  {freeFeatures.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm">{feature.name}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-center text-muted-foreground pt-4 border-t">
                  Start browsing now
                </p>
              </CardContent>
            </Card>

            {/* Monthly Pass - Featured */}
            <Card className="relative overflow-hidden border-2 border-primary shadow-xl hover:shadow-2xl transition-all transform md:scale-105">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white font-bold">Best Value</Badge>
              </div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-primary">Monthly Pass</CardTitle>
                    <CardDescription className="text-base mt-1">Best for regular access</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4">
                  <div className="text-5xl font-bold text-primary">R69</div>
                  <p className="text-sm text-muted-foreground mt-2">one-time payment • 30 days access</p>
                  <p className="text-xs text-primary font-semibold mt-3">6x longer than Weekly Pass</p>
                </div>

                <div className="space-y-3">
                  {premiumFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <UpgradePrompt type="general" compact={true} className="w-full justify-center" />
              </CardContent>
            </Card>

            {/* Weekly Pass */}
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">Weekly Pass</CardTitle>
                    <CardDescription>Perfect for trying premium features</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-4xl font-bold">R19</div>
                  <p className="text-sm text-muted-foreground">one-time payment • 5 days access</p>
                </div>

                <div className="space-y-3">
                  {premiumFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <UpgradePrompt type="general" compact={true} className="w-full justify-center" />
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Are payments recurring?</h3>
                <p className="text-muted-foreground">No, all payments are one-time. Access expires automatically after the duration ends.</p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Can I upgrade from Weekly to Monthly?</h3>
                <p className="text-muted-foreground">Yes! You can purchase a Monthly Pass anytime. Your remaining Weekly access will be honored, and Monthly access will extend your total access period.</p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">We support mobile money, bank transfers, and card payments through our secure BobPay payment gateway.</p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">What happens when my access expires?</h3>
                <p className="text-muted-foreground">You'll return to the free tier with limited features. You can purchase another pass anytime to regain premium access.</p>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Do I need an account to purchase?</h3>
                <p className="text-muted-foreground">Yes, you'll need to create a ReBooked account to purchase a premium pass. It's quick and free!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
