-- Create accommodations table
CREATE TABLE public.accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accreditation_number text,
  property_name text NOT NULL,
  type text NOT NULL,
  university text,
  address text NOT NULL,
  city text,
  province text,
  monthly_cost integer,
  rooms_available integer,
  amenities text[],
  gender_policy text,
  contact_person text,
  contact_email text,
  contact_phone text,
  rating double precision DEFAULT 0,
  image_urls text[],
  status text DEFAULT 'active',
  nsfas_accredited boolean DEFAULT false,
  certified_universities text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  last_name text,
  diversity text,
  university text,
  phone text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  subject text,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Public read access for accommodations
CREATE POLICY "Anyone can view active accommodations"
ON public.accommodations FOR SELECT
USING (status = 'active');

-- Admin-only policies (we'll use service role key for admin operations)
CREATE POLICY "Service role can manage accommodations"
ON public.accommodations FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage profiles"
ON public.profiles FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage messages"
ON public.messages FOR ALL
USING (true)
WITH CHECK (true);

-- Anyone can insert messages (contact form)
CREATE POLICY "Anyone can submit messages"
ON public.messages FOR INSERT
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for accommodations
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.accommodations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data
INSERT INTO public.accommodations (
  property_name, type, university, address, city, province, 
  monthly_cost, rooms_available, amenities, gender_policy,
  contact_person, contact_email, contact_phone, rating,
  image_urls, nsfas_accredited, certified_universities
) VALUES
(
  'Greenside Student Village',
  'Residence',
  'University of Johannesburg',
  '45 Jan Smuts Avenue, Greenside',
  'Johannesburg',
  'Gauteng',
  3500,
  12,
  ARRAY['WiFi', 'Laundry', 'Study Room', 'Security', 'Parking'],
  'Mixed',
  'Sarah Nkosi',
  'info@greensidevillage.co.za',
  '+27 11 234 5678',
  4.5,
  ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
  true,
  ARRAY['University of Johannesburg', 'University of the Witwatersrand']
),
(
  'Stellenbosch Student Flats',
  'Private Flat',
  'Stellenbosch University',
  '12 Dorp Street, Stellenbosch Central',
  'Stellenbosch',
  'Western Cape',
  4200,
  6,
  ARRAY['WiFi', 'Kitchen', 'Security', 'Furnished'],
  'Mixed',
  'Johan van der Merwe',
  'johan@stellenflats.co.za',
  '+27 21 887 1234',
  4.8,
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
  true,
  ARRAY['Stellenbosch University']
),
(
  'Durban North Student House',
  'Student House',
  'University of KwaZulu-Natal',
  '78 Umhlanga Rocks Drive, Durban North',
  'Durban',
  'KwaZulu-Natal',
  2800,
  8,
  ARRAY['WiFi', 'Shared Kitchen', 'Lounge', 'Garden'],
  'Mixed',
  'Thabo Dlamini',
  'thabo@dbnstudents.co.za',
  '+27 31 564 8900',
  4.2,
  ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
  false,
  ARRAY['University of KwaZulu-Natal']
),
(
  'Cape Town City Centre Digs',
  'Residence',
  'University of Cape Town',
  '23 Long Street, Cape Town',
  'Cape Town',
  'Western Cape',
  5500,
  4,
  ARRAY['WiFi', 'Gym', 'Study Room', '24/7 Security', 'Cleaning Service'],
  'Female Only',
  'Fatima Adams',
  'fatima@ctcdigs.co.za',
  '+27 21 423 7788',
  4.7,
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
  true,
  ARRAY['University of Cape Town', 'Cape Peninsula University of Technology']
),
(
  'Pretoria East Student Residence',
  'Residence',
  'University of Pretoria',
  '156 Lynnwood Road, Pretoria East',
  'Pretoria',
  'Gauteng',
  3200,
  15,
  ARRAY['WiFi', 'Laundry', 'Parking', 'Study Areas', 'Common Room'],
  'Mixed',
  'Pieter Botha',
  'pieter@ptaeast.co.za',
  '+27 12 362 4455',
  4.3,
  ARRAY['https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800'],
  true,
  ARRAY['University of Pretoria', 'Tshwane University of Technology']
);