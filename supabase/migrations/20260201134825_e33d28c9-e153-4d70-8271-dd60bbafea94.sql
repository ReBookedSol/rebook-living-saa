-- Drop tables if they exist from failed migrations
DROP TABLE IF EXISTS public.user_notifications CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.listing_analytics_daily CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Create notifications table for admin push notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  target_user_id UUID,
  accommodation_id UUID REFERENCES public.accommodations(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'normal'
);

-- Create user_notifications junction table
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Create activity_logs table for tracking user activity
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  event_type TEXT NOT NULL,
  page_path TEXT,
  accommodation_id UUID REFERENCES public.accommodations(id),
  metadata JSONB DEFAULT '{}',
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create listing_analytics_daily for aggregated daily stats
CREATE TABLE public.listing_analytics_daily (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  accommodation_id UUID NOT NULL REFERENCES public.accommodations(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  messages INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  avg_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(accommodation_id, date)
);

-- Enable RLS on all new tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_analytics_daily ENABLE ROW LEVEL SECURITY;

-- Notifications policies using direct role check
CREATE POLICY "Admins can manage notifications" 
ON public.notifications 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view general notifications" 
ON public.notifications 
FOR SELECT 
USING (target_user_id IS NULL OR target_user_id = auth.uid());

-- User notifications policies
CREATE POLICY "Users can manage their notification status" 
ON public.user_notifications 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all user notifications" 
ON public.user_notifications 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Activity logs policies
CREATE POLICY "Users can log their own activity" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Listing analytics daily policies
CREATE POLICY "Admins can manage listing analytics" 
ON public.listing_analytics_daily 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Landlords can view their listing analytics" 
ON public.listing_analytics_daily 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.accommodations a
    WHERE a.id = accommodation_id AND a.landlord_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_notifications_target_user ON public.notifications(target_user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_user_notifications_user ON public.user_notifications(user_id);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_accommodation ON public.activity_logs(accommodation_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_listing_analytics_daily_accommodation ON public.listing_analytics_daily(accommodation_id);
CREATE INDEX idx_listing_analytics_daily_date ON public.listing_analytics_daily(date DESC);