-- Add 'landlord' role to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'landlord';

-- Create landlord_subscriptions table to track subscription status
CREATE TABLE public.landlord_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'cancelled', 'expired')),
    plan_type TEXT NOT NULL DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium')),
    base_amount INTEGER NOT NULL DEFAULT 8000, -- R80 in cents
    additional_listing_fee INTEGER NOT NULL DEFAULT 3000, -- R30 in cents
    max_free_listings INTEGER NOT NULL DEFAULT 2,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    paystack_customer_code TEXT,
    paystack_subscription_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create landlord_listings table to track landlord-submitted accommodations
CREATE TABLE public.landlord_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accommodation_id UUID NOT NULL REFERENCES public.accommodations(id) ON DELETE CASCADE,
    landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_status TEXT NOT NULL DEFAULT 'draft' CHECK (submission_status IN ('draft', 'pending_review', 'approved', 'rejected', 'changes_requested')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'overdue')),
    admin_notes TEXT,
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(accommodation_id)
);

-- Create landlord_documents table for compliance documents
CREATE TABLE public.landlord_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_listing_id UUID NOT NULL REFERENCES public.landlord_listings(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('pdr_certificate', 'safety_compliance', 'business_registration', 'proof_of_ownership', 'other')),
    document_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID
);

-- Create listing_analytics table for tracking performance
CREATE TABLE public.listing_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accommodation_id UUID NOT NULL REFERENCES public.accommodations(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    views INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    favorites INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(accommodation_id, date)
);

-- Add landlord-specific columns to accommodations table
ALTER TABLE public.accommodations 
ADD COLUMN IF NOT EXISTS is_landlord_listing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS landlord_id UUID;

-- Enable RLS on new tables
ALTER TABLE public.landlord_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlord_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landlord_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for landlord_subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.landlord_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
ON public.landlord_subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage subscriptions"
ON public.landlord_subscriptions FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for landlord_listings
CREATE POLICY "Landlords can view their own listings"
ON public.landlord_listings FOR SELECT
USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert their own listings"
ON public.landlord_listings FOR INSERT
WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update their own listings"
ON public.landlord_listings FOR UPDATE
USING (auth.uid() = landlord_id);

CREATE POLICY "Admins can manage all landlord listings"
ON public.landlord_listings FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for landlord_documents
CREATE POLICY "Landlords can view their own documents"
ON public.landlord_documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.landlord_listings ll
        WHERE ll.id = landlord_listing_id
        AND ll.landlord_id = auth.uid()
    )
);

CREATE POLICY "Landlords can upload their own documents"
ON public.landlord_documents FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.landlord_listings ll
        WHERE ll.id = landlord_listing_id
        AND ll.landlord_id = auth.uid()
    )
);

CREATE POLICY "Landlords can delete their own documents"
ON public.landlord_documents FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.landlord_listings ll
        WHERE ll.id = landlord_listing_id
        AND ll.landlord_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all documents"
ON public.landlord_documents FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for listing_analytics
CREATE POLICY "Landlords can view analytics for their listings"
ON public.listing_analytics FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.accommodations a
        WHERE a.id = accommodation_id
        AND a.landlord_id = auth.uid()
    )
);

CREATE POLICY "Anyone can increment analytics"
ON public.listing_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update analytics"
ON public.listing_analytics FOR UPDATE
USING (true);

CREATE POLICY "Admins can manage all analytics"
ON public.listing_analytics FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_landlord_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_landlord_subscriptions_updated_at
BEFORE UPDATE ON public.landlord_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_landlord_updated_at();

CREATE TRIGGER update_landlord_listings_updated_at
BEFORE UPDATE ON public.landlord_listings
FOR EACH ROW EXECUTE FUNCTION public.update_landlord_updated_at();

-- Create function to increment analytics
CREATE OR REPLACE FUNCTION public.increment_listing_analytics(
    p_accommodation_id UUID,
    p_field TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.listing_analytics (accommodation_id, date, views, clicks, favorites, shares)
    VALUES (p_accommodation_id, CURRENT_DATE, 
        CASE WHEN p_field = 'views' THEN 1 ELSE 0 END,
        CASE WHEN p_field = 'clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_field = 'favorites' THEN 1 ELSE 0 END,
        CASE WHEN p_field = 'shares' THEN 1 ELSE 0 END
    )
    ON CONFLICT (accommodation_id, date)
    DO UPDATE SET
        views = listing_analytics.views + CASE WHEN p_field = 'views' THEN 1 ELSE 0 END,
        clicks = listing_analytics.clicks + CASE WHEN p_field = 'clicks' THEN 1 ELSE 0 END,
        favorites = listing_analytics.favorites + CASE WHEN p_field = 'favorites' THEN 1 ELSE 0 END,
        shares = listing_analytics.shares + CASE WHEN p_field = 'shares' THEN 1 ELSE 0 END;
END;
$$;

-- Create storage bucket for landlord documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('landlord-documents', 'landlord-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for landlord-documents bucket
CREATE POLICY "Landlords can upload their documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'landlord-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Landlords can view their own documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'landlord-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Landlords can delete their own documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'landlord-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can access all landlord documents"
ON storage.objects FOR ALL
USING (
    bucket_id = 'landlord-documents' 
    AND public.has_role(auth.uid(), 'admin')
);