import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrackingOptions {
  accommodationId?: string;
  pagePath?: string;
}

/**
 * Hook to track user activity on a page
 * - Logs page view on mount
 * - Tracks time spent on page
 * - Logs duration when user leaves or navigates away
 */
export function useActivityTracking({ accommodationId, pagePath }: TrackingOptions) {
  const startTimeRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string>(`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const hasLoggedViewRef = useRef(false);
  const activityLogIdRef = useRef<string | null>(null);

  const logActivity = useCallback(async (eventType: string, durationSeconds?: number, metadata?: Record<string, unknown>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const insertData = {
        event_type: eventType,
        session_id: sessionIdRef.current,
        page_path: pagePath || window.location.pathname,
        user_id: userId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        accommodation_id: accommodationId || null,
        duration_seconds: durationSeconds ?? null,
      };

      const { data, error } = await supabase
        .from("activity_logs")
        .insert(insertData)
        .select("id")
        .single();

      if (error) {
        console.debug("Failed to log activity:", error);
        return null;
      }

      return data?.id || null;
    } catch (err) {
      console.debug("Activity tracking error:", err);
      return null;
    }
  }, [accommodationId, pagePath]);

  const updateDuration = useCallback(async () => {
    if (!activityLogIdRef.current) return;

    const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    try {
      await supabase
        .from("activity_logs")
        .update({ duration_seconds: durationSeconds })
        .eq("id", activityLogIdRef.current);
    } catch (err) {
      console.debug("Failed to update duration:", err);
    }
  }, []);

  // Log view on mount
  useEffect(() => {
    if (hasLoggedViewRef.current) return;
    hasLoggedViewRef.current = true;
    startTimeRef.current = Date.now();

    const logView = async () => {
      const logId = await logActivity("page_view");
      activityLogIdRef.current = logId;

      // Also increment analytics if this is an accommodation
      if (accommodationId) {
        try {
          await supabase.rpc("increment_listing_analytics", {
            p_accommodation_id: accommodationId,
            p_field: "views",
          });
        } catch (err) {
          console.debug("Failed to increment listing analytics:", err);
        }
      }
    };

    logView();

    // Update duration periodically (every 30 seconds)
    const intervalId = setInterval(() => {
      updateDuration();
    }, 30000);

    // Handle visibility change (tab switch, minimize)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateDuration();
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      updateDuration();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Final duration update on unmount
      updateDuration();
    };
  }, [logActivity, updateDuration, accommodationId]);

  // Function to manually log custom events
  const trackEvent = useCallback((eventType: string, metadata?: Record<string, unknown>) => {
    return logActivity(eventType, undefined, metadata);
  }, [logActivity]);

  return { trackEvent, sessionId: sessionIdRef.current };
}
