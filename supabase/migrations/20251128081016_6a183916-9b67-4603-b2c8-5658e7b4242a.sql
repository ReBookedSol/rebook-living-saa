-- Create bursaries table
CREATE TABLE public.bursaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT,
  description TEXT,
  amount TEXT,
  coverage_details JSONB,
  requirements TEXT,
  qualifications TEXT,
  opening_date DATE,
  closing_date DATE,
  application_process TEXT,
  required_documents TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create AI settings table
CREATE TABLE public.ai_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create AI pack requests tracking table
CREATE TABLE public.ai_pack_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_data JSONB NOT NULL,
  response_data JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create AI pack cache table
CREATE TABLE public.ai_pack_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  pack_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS
ALTER TABLE public.bursaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_pack_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_pack_cache ENABLE ROW LEVEL SECURITY;

-- Bursaries policies
CREATE POLICY "Anyone can view active bursaries"
ON public.bursaries FOR SELECT
USING (status = 'active');

CREATE POLICY "Service role can manage bursaries"
ON public.bursaries FOR ALL
USING (true)
WITH CHECK (true);

-- AI settings policies
CREATE POLICY "Admins can manage AI settings"
ON public.ai_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view AI settings"
ON public.ai_settings FOR SELECT
TO authenticated
USING (true);

-- AI pack requests policies
CREATE POLICY "Users can view their own requests"
ON public.ai_pack_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
ON public.ai_pack_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
ON public.ai_pack_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- AI cache policies
CREATE POLICY "Authenticated users can view cache"
ON public.ai_pack_cache FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can manage cache"
ON public.ai_pack_cache FOR ALL
USING (true)
WITH CHECK (true);

-- Insert default AI settings
INSERT INTO public.ai_settings (feature_name, is_enabled)
VALUES ('bursary_pack_generator', true);

-- Add trigger for bursaries updated_at
CREATE TRIGGER update_bursaries_updated_at
BEFORE UPDATE ON public.bursaries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add trigger for AI settings updated_at
CREATE TRIGGER update_ai_settings_updated_at
BEFORE UPDATE ON public.ai_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();