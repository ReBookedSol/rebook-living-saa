
-- Fix duplicate constraint on user_notifications
ALTER TABLE public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_user_notification_unique;

-- Remove duplicate place_cache_analytics policy
DROP POLICY IF EXISTS "Admins can manage place cache analytics" ON public.place_cache_analytics;

-- Remove redundant user_roles SELECT policy (covered by ALL policy)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_blocked_emails_blocked_by ON public.blocked_emails(blocked_by);
CREATE INDEX IF NOT EXISTS idx_search_analytics_listing_opened ON public.search_analytics(listing_opened_id);

-- Force PostgREST schema reload
NOTIFY pgrst, 'reload schema';
