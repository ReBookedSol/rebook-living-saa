-- Create search_analytics table for tracking search and filter usage
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Search parameters
  search_query TEXT,
  university_searched TEXT,
  location_searched TEXT,
  city_searched TEXT,
  province_searched TEXT,
  
  -- Price filters
  min_price INTEGER,
  max_price INTEGER,
  
  -- Filter usage (boolean flags)
  used_nsfas_filter BOOLEAN DEFAULT false,
  used_gender_filter BOOLEAN DEFAULT false,
  used_amenities_filter BOOLEAN DEFAULT false,
  used_price_filter BOOLEAN DEFAULT false,
  
  -- Filter values
  gender_filter_value TEXT,
  amenities_filter_values TEXT[],
  
  -- Results
  results_count INTEGER DEFAULT 0,
  
  -- Conversion tracking
  listing_opened_id UUID REFERENCES public.accommodations(id) ON DELETE SET NULL,
  converted_to_contact BOOLEAN DEFAULT false
);

-- Create contact_analytics table for lead/contact tracking
CREATE TABLE public.contact_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_id UUID,
  accommodation_id UUID NOT NULL REFERENCES public.accommodations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contact type
  contact_type TEXT NOT NULL CHECK (contact_type IN ('email', 'phone', 'whatsapp', 'website')),
  
  -- Context
  university TEXT,
  city TEXT,
  province TEXT,
  monthly_cost INTEGER,
  
  -- Landlord tracking (for future)
  landlord_id UUID
);

-- Add indexes for performance
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at);
CREATE INDEX idx_search_analytics_university ON public.search_analytics(university_searched);
CREATE INDEX idx_search_analytics_location ON public.search_analytics(location_searched);
CREATE INDEX idx_search_analytics_session ON public.search_analytics(session_id);

CREATE INDEX idx_contact_analytics_created_at ON public.contact_analytics(created_at);
CREATE INDEX idx_contact_analytics_accommodation ON public.contact_analytics(accommodation_id);
CREATE INDEX idx_contact_analytics_type ON public.contact_analytics(contact_type);
CREATE INDEX idx_contact_analytics_university ON public.contact_analytics(university);

-- Enable RLS
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for search_analytics (insert only for everyone, read for admins)
CREATE POLICY "Anyone can insert search analytics"
ON public.search_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can read search analytics"
ON public.search_analytics
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for contact_analytics
CREATE POLICY "Anyone can insert contact analytics"
ON public.contact_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can read contact analytics"
ON public.contact_analytics
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add contact tracking columns to listing_analytics_daily
ALTER TABLE public.listing_analytics_daily 
ADD COLUMN IF NOT EXISTS email_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS phone_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS whatsapp_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS website_clicks INTEGER DEFAULT 0;

-- Create function to increment contact analytics
CREATE OR REPLACE FUNCTION public.increment_contact_analytics(
  p_accommodation_id UUID,
  p_contact_type TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.listing_analytics_daily (
    accommodation_id, 
    date, 
    email_clicks,
    phone_clicks,
    whatsapp_clicks,
    website_clicks
  )
  VALUES (
    p_accommodation_id, 
    CURRENT_DATE,
    CASE WHEN p_contact_type = 'email' THEN 1 ELSE 0 END,
    CASE WHEN p_contact_type = 'phone' THEN 1 ELSE 0 END,
    CASE WHEN p_contact_type = 'whatsapp' THEN 1 ELSE 0 END,
    CASE WHEN p_contact_type = 'website' THEN 1 ELSE 0 END
  )
  ON CONFLICT (accommodation_id, date)
  DO UPDATE SET
    email_clicks = listing_analytics_daily.email_clicks + CASE WHEN p_contact_type = 'email' THEN 1 ELSE 0 END,
    phone_clicks = listing_analytics_daily.phone_clicks + CASE WHEN p_contact_type = 'phone' THEN 1 ELSE 0 END,
    whatsapp_clicks = listing_analytics_daily.whatsapp_clicks + CASE WHEN p_contact_type = 'whatsapp' THEN 1 ELSE 0 END,
    website_clicks = listing_analytics_daily.website_clicks + CASE WHEN p_contact_type = 'website' THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;