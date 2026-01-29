-- Create user_payments table for tracking paid access
CREATE TABLE public.user_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  payment_provider TEXT NOT NULL DEFAULT 'bobpay',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('weekly', 'monthly')),
  amount INTEGER NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  access_expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  bobpay_payment_id TEXT,
  bobpay_uuid TEXT,
  custom_payment_id TEXT UNIQUE,
  payment_method TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_user_payments_user_id ON public.user_payments(user_id);
CREATE INDEX idx_user_payments_status ON public.user_payments(status);
CREATE INDEX idx_user_payments_expires_at ON public.user_payments(access_expires_at);
CREATE INDEX idx_user_payments_custom_id ON public.user_payments(custom_payment_id);

-- Enable RLS
ALTER TABLE public.user_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON public.user_payments
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage all payments (for webhook processing)
CREATE POLICY "Service role can manage payments"
ON public.user_payments
FOR ALL
USING (true)
WITH CHECK (true);

-- Admins can manage all payments
CREATE POLICY "Admins can manage all payments"
ON public.user_payments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create function to check if user has active paid access
CREATE OR REPLACE FUNCTION public.has_paid_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_payments
    WHERE user_id = p_user_id
      AND status = 'active'
      AND access_expires_at > now()
  )
$$;

-- Create function to get user access level (returns 'free' or 'paid')
CREATE OR REPLACE FUNCTION public.get_user_access_level(p_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1
      FROM public.user_payments
      WHERE user_id = p_user_id
        AND status = 'active'
        AND access_expires_at > now()
    ) THEN 'paid'
    ELSE 'free'
  END
$$;

-- Create function to get limited photos based on access level
CREATE OR REPLACE FUNCTION public.get_accommodation_photos(
  p_accommodation_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_photos TEXT[];
  v_is_paid BOOLEAN;
BEGIN
  -- Get all photos
  SELECT image_urls INTO v_photos
  FROM public.accommodations
  WHERE id = p_accommodation_id;
  
  -- Check if user has paid access
  IF p_user_id IS NULL THEN
    v_is_paid := FALSE;
  ELSE
    v_is_paid := public.has_paid_access(p_user_id);
  END IF;
  
  -- Return limited photos for free users
  IF v_is_paid THEN
    RETURN v_photos;
  ELSE
    -- Return only first 3 photos for free users
    RETURN COALESCE(v_photos[1:3], ARRAY[]::TEXT[]);
  END IF;
END;
$$;

-- Create trigger to auto-expire payments
CREATE OR REPLACE FUNCTION public.check_payment_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-expire payments that have passed their expiry date
  IF NEW.access_expires_at < now() AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_check_payment_expiry
BEFORE UPDATE ON public.user_payments
FOR EACH ROW
EXECUTE FUNCTION public.check_payment_expiry();

-- Create trigger for updated_at
CREATE TRIGGER trigger_user_payments_updated_at
BEFORE UPDATE ON public.user_payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();