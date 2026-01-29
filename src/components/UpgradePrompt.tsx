import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Camera, Star, Map, XCircle, Sparkles, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  type: "photos" | "reviews" | "map" | "ads" | "general";
  totalCount?: number;
  className?: string;
  compact?: boolean;
  buttonText?: string;
}

const promptContent = {
  photos: {
    icon: Camera,
    title: "View All Photos",
    description: "Unlock all photos to see every angle of this accommodation",
    cta: "View all photos",
  },
  reviews: {
    icon: Star,
    title: "Read All Reviews",
    description: "Access all Google reviews from students who lived here",
    cta: "Unlock all reviews",
  },
  map: {
    icon: Map,
    title: "Unlock Map & Satellite View",
    description: "See the exact location, surroundings, and satellite imagery",
    cta: "Unlock map view",
  },
  ads: {
    icon: XCircle,
    title: "Remove Ads",
    description: "Enjoy an ad-free browsing experience",
    cta: "Remove ads",
  },
  general: {
    icon: Sparkles,
    title: "Upgrade to Premium",
    description: "Get full access to all features",
    cta: "Upgrade now",
  },
};

export const UpgradePrompt = ({ type, totalCount, className = "", compact = false, buttonText }: UpgradePromptProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<"weekly" | "monthly" | null>(null);
  const navigate = useNavigate();
  const content = promptContent[type];
  const Icon = content.icon;
  const ctaText = buttonText || content.cta;

  const handleUpgrade = async (paymentType: "weekly" | "monthly") => {
    setIsLoading(paymentType);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error("Please sign in to upgrade");
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
            payment_type: paymentType,
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
      
      // Redirect to BobPay payment page
      window.location.href = data.payment_url;
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to start payment. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  if (compact) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
            <Lock className="w-3 h-3" />
            {content.cta}
            {totalCount && <Badge variant="secondary" className="ml-1">{totalCount}+</Badge>}
          </Button>
        </DialogTrigger>
        <UpgradeDialog 
          isLoading={isLoading} 
          onUpgrade={handleUpgrade}
          type={type}
          totalCount={totalCount}
        />
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className={`border-dashed border-2 border-primary/20 bg-primary/5 cursor-pointer hover:border-primary/40 transition-colors ${className}`}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{content.title}</h4>
              <p className="text-xs text-muted-foreground">{content.description}</p>
            </div>
            <Button size="sm" variant="default" className="gap-1">
              <Lock className="w-3 h-3" />
              {totalCount ? `${totalCount}+` : "Unlock"}
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>
      <UpgradeDialog 
        isLoading={isLoading} 
        onUpgrade={handleUpgrade}
        type={type}
        totalCount={totalCount}
      />
    </Dialog>
  );
};

interface UpgradeDialogProps {
  isLoading: "weekly" | "monthly" | null;
  onUpgrade: (type: "weekly" | "monthly") => void;
  type: string;
  totalCount?: number;
}

const UpgradeDialog = ({ isLoading, onUpgrade, type, totalCount }: UpgradeDialogProps) => {
  const features = [
    "All accommodation photos",
    "All Google reviews",
    "Interactive map view",
    "Satellite imagery",
    "No advertisements",
  ];

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Upgrade to Premium
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Get unlimited access to all photos, reviews, maps, and enjoy an ad-free experience.
          {totalCount && type === "photos" && ` View all ${totalCount}+ photos.`}
          {totalCount && type === "reviews" && ` Read all ${totalCount}+ reviews.`}
        </p>

        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-3 pt-2">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => !isLoading && onUpgrade("weekly")}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Weekly Pass</h4>
                  <Badge variant="secondary">Best for trying</Badge>
                </div>
                <p className="text-sm text-muted-foreground">7 days of premium access</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">R19</p>
                <p className="text-xs text-muted-foreground">one-time</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors border-primary/50 bg-primary/5"
            onClick={() => !isLoading && onUpgrade("monthly")}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Monthly Pass</h4>
                  <Badge className="bg-green-500">Save 25%</Badge>
                </div>
                <p className="text-sm text-muted-foreground">30 days of premium access</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">R59</p>
                <p className="text-xs text-muted-foreground">one-time</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Payments are one-time and non-recurring. Access expires automatically.
        </p>
      </div>
    </DialogContent>
  );
};

export default UpgradePrompt;
