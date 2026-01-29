import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradePrompt } from "@/components/UpgradePrompt";

const Pricing = () => {
  const features = [
    "All accommodation photos",
    "All Google reviews",
    "Interactive map view",
    "Satellite imagery",
    "No advertisements",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get unlimited access to all photos, reviews, and premium features with a ReBooked Premium Pass
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
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
                <p className="text-sm text-muted-foreground">one-time payment • 7 days access</p>
              </div>

              <div className="space-y-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <UpgradePrompt type="general" compact={true} className="w-full justify-center" />
            </CardContent>
          </Card>

          {/* Monthly Pass */}
          <Card className="relative overflow-hidden border-primary/50 bg-primary/5 hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
              <Badge className="bg-green-500 rounded-full">Best Value</Badge>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Monthly Pass</CardTitle>
                  <CardDescription>Best for regular access</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-4xl font-bold">R59</div>
                <p className="text-sm text-muted-foreground">one-time payment • 30 days access</p>
              </div>

              <div className="space-y-3">
                {features.map((feature) => (
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
  );
};

export default Pricing;
