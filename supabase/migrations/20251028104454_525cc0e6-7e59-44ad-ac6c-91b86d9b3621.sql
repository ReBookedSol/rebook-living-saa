-- Add missing columns to accommodations table
ALTER TABLE public.accommodations 
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS added_by text,
ADD COLUMN IF NOT EXISTS units integer,
ADD COLUMN IF NOT EXISTS description text;

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  accommodation_id uuid REFERENCES public.accommodations(id) ON DELETE CASCADE,
  reporter_name text,
  reporter_email text,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit reports
CREATE POLICY "Anyone can submit reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

-- Service role can manage reports
CREATE POLICY "Service role can manage reports" 
ON public.reports 
FOR ALL 
USING (true)
WITH CHECK (true);