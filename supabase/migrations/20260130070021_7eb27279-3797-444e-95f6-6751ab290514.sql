-- Create programs table for storing university programs
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  faculty_name VARCHAR,
  description TEXT,
  duration VARCHAR,
  aps_requirement INTEGER,
  subjects JSONB DEFAULT '[]'::jsonb,
  career_prospects JSONB DEFAULT '[]'::jsonb,
  skills_developed JSONB DEFAULT '[]'::jsonb,
  salary_range VARCHAR,
  employment_rate INTEGER,
  application_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create index on university_id for faster queries
CREATE INDEX idx_programs_university_id ON public.programs(university_id);

-- Create index on faculty_name for grouping
CREATE INDEX idx_programs_faculty_name ON public.programs(faculty_name);

-- Create index on is_active for filtering
CREATE INDEX idx_programs_is_active ON public.programs(is_active);

-- Enable Row Level Security
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Create policy for anyone to view active programs
CREATE POLICY "Anyone can view active programs" 
ON public.programs 
FOR SELECT 
USING (is_active = true);

-- Create policy for admins to manage programs
CREATE POLICY "Admins can manage programs" 
ON public.programs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();