import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const OFFERWALL_SUBDOMAIN = "https://living.rebookedsolutions.co.za";

const Ad = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const returnPath = params.get('return') || '/';

  useEffect(() => {
    const redirectToOfferwall = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // If no user, redirect back without reward
          window.location.href = returnPath;
          return;
        }

        // Build offerwall URL with user_id and return path
        const offerwallUrl = new URL(`${OFFERWALL_SUBDOMAIN}/wall`);
        offerwallUrl.searchParams.set('user_id', user.id);
        offerwallUrl.searchParams.set('return', window.location.origin + returnPath);
        
        // Redirect to offerwall
        window.location.href = offerwallUrl.toString();
      } catch (error) {
        console.error('Error redirecting to offerwall:', error);
        // Fallback: redirect back to return path
        window.location.href = returnPath;
      }
    };

    redirectToOfferwall();
  }, [returnPath]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Redirecting to offerwall...</p>
      </div>
    </div>
  );
};

export default Ad;
