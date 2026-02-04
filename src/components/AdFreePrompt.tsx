import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { XCircle, Sparkles, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AdFreePromptProps {
  className?: string;
}

export const AdFreePrompt = ({ className = "" }: AdFreePromptProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<"weekly" | "monthly" | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const navigate = useNavigate();

  const handleUpgrade = async (paymentType: "weekly" | "monthly") => {
    setIsLoading(paymentType);
    setLoadingProgress(10);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      setLoadingProgress(20);

      if (!session?.user) {
        toast.error("Please sign in to upgrade");
        navigate("/auth");
        return;
      }

      setLoadingProgress(30);

      const supabaseUrl = "https://gzihagvdpdjcoyjpvyvs.supabase.co";
      const bobpayFunctionUrl = `${supabaseUrl}/functions/v1/bobpay`;

      setLoadingProgress(50);

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

      setLoadingProgress(80);

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
      setLoadingProgress(100);
      
      window.location.href = data.payment_url;
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start payment. Please try again.");
    } finally {
      setIsLoading(null);
      setLoadingProgress(0);
    }
  };

  const features = [
    "All accommodation photos",
    "All Google reviews",
    "Interactive map view",
    "Satellite imagery",
    "No advertisements",
  ];

  return (
    <div className={`flex items-center justify-between gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 ${className}`}>
      <div className="flex items-center gap-2 text-sm">
        <XCircle className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-muted-foreground">
          Go ad-free. 🚫 No interruptions — just peace of mind.
        </span>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="default" className="whitespace-nowrap gap-1.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            Upgrade Pass
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[92vw] max-w-sm sm:max-w-md rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Upgrade to Premium
            </DialogTitle>
          </DialogHeader>
          
          {isLoading && (
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Preparing payment...
                </span>
              </div>
              <Progress value={loadingProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to our secure payment page
              </p>
            </div>
          )}

          {!isLoading && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Get unlimited access to all photos, reviews, maps, and enjoy an ad-free experience.
              </p>

              <div className="space-y-1.5 sm:space-y-2">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-xs sm:text-sm">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-2.5 sm:gap-3 pt-2">
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors rounded-xl"
                  onClick={() => handleUpgrade("weekly")}
                >
                  <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base">5-Day Pass</h4>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">Best for trying</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">5 days of premium access</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold">R19</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">one-time</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:border-primary transition-colors border-primary/50 bg-primary/5 rounded-xl"
                  onClick={() => handleUpgrade("monthly")}
                >
                  <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm sm:text-base">Monthly Pass</h4>
                        <Badge className="bg-green-500 text-[10px] sm:text-xs">Best Value</Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">25 days of premium access</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold">R59</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">one-time</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                Payments are one-time and non-recurring. Access expires automatically.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdFreePrompt;
