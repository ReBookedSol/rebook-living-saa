import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Ad = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const listingId = params.get('l');
  const returnPath = params.get('return') || '/';

  const [secondsLeft, setSecondsLeft] = useState(8);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!mounted) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setCanClose(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const finish = (allowed = true) => {
    if (listingId && allowed) {
      try {
        sessionStorage.setItem(`ai_allowed_${listingId}`, '1');
      } catch (e) {
        // ignore
      }
    }
    const url = `${returnPath}${returnPath.includes('?') ? '&' : '?'}ai=1`;
    navigate(url, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-3xl w-full p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Sponsored Content</h2>
          <p className="text-sm text-muted-foreground mb-4">Watch this short message to unlock the AI Insights for this listing.</p>

          <div className="w-full h-56 bg-black rounded-md mb-4 flex items-center justify-center text-white"> 
            {/* Placeholder "ad" area. Replace with video if desired. */}
            <div>
              <div className="text-lg font-medium">Ad playing...</div>
              <div className="text-sm mt-2">Please wait {secondsLeft}s</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => {
              if (!canClose) {
                toast('Please watch the full ad to unlock the insight');
                return;
              }
              finish(true);
            }}> 
              {canClose ? 'Close Ad' : `Close in ${secondsLeft}s`}
            </Button>

            <Button onClick={() => finish(true)}>
              Finish Now
            </Button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">You will be redirected back to the listing after the ad finishes.</div>
        </div>
      </div>
    </div>
  );
};

export default Ad;
