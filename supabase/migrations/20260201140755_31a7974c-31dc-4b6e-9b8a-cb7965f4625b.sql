-- Fix activity_logs: allow anonymous inserts for tracking and allow users to update their own logs
DROP POLICY IF EXISTS "Users can log their own activity" ON public.activity_logs;
CREATE POLICY "Anyone can log activity"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own activity logs (for duration tracking)
CREATE POLICY "Users can update their activity"
  ON public.activity_logs FOR UPDATE
  USING (session_id IS NOT NULL);

-- Fix listing_analytics_daily: allow RPC to increment analytics
CREATE POLICY "System can insert analytics"
  ON public.listing_analytics_daily FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update analytics"
  ON public.listing_analytics_daily FOR UPDATE
  USING (true);