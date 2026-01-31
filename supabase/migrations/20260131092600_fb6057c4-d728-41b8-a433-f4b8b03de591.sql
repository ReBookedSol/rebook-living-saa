-- Create place_cache table for Google Places API caching
CREATE TABLE public.place_cache (
    place_id TEXT PRIMARY KEY,
    cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    photo_uris TEXT[] DEFAULT ARRAY[]::TEXT[],
    photo_count INTEGER NOT NULL DEFAULT 0,
    reviews JSONB DEFAULT '[]'::JSONB,
    review_count INTEGER NOT NULL DEFAULT 0,
    attributions TEXT,
    cached_tier TEXT NOT NULL DEFAULT 'none' CHECK (cached_tier IN ('none', 'pro')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient expired cache lookup
CREATE INDEX idx_place_cache_cached_at ON public.place_cache(cached_at);
CREATE INDEX idx_place_cache_tier ON public.place_cache(cached_tier);

-- Enable RLS
ALTER TABLE public.place_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can view cached data (public read)
CREATE POLICY "Anyone can view cached places"
ON public.place_cache
FOR SELECT
USING (true);

-- Service role can manage cache
CREATE POLICY "Service role can manage place cache"
ON public.place_cache
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to check if cache is expired (30 days)
CREATE OR REPLACE FUNCTION public.is_place_cache_expired(cached_at TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT (now() - cached_at) > INTERVAL '30 days'
$$;

-- Function to get cached place data with expiry check
CREATE OR REPLACE FUNCTION public.get_cached_place(p_place_id TEXT)
RETURNS TABLE (
    place_id TEXT,
    photo_uris TEXT[],
    photo_count INTEGER,
    reviews JSONB,
    review_count INTEGER,
    attributions TEXT,
    cached_tier TEXT,
    cached_at TIMESTAMP WITH TIME ZONE,
    is_expired BOOLEAN
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        pc.place_id,
        pc.photo_uris,
        pc.photo_count,
        pc.reviews,
        pc.review_count,
        pc.attributions,
        pc.cached_tier,
        pc.cached_at,
        public.is_place_cache_expired(pc.cached_at) as is_expired
    FROM public.place_cache pc
    WHERE pc.place_id = p_place_id
$$;

-- Function to upsert place cache with auto-calculated counts
CREATE OR REPLACE FUNCTION public.upsert_place_cache(
    p_place_id TEXT,
    p_photo_uris TEXT[],
    p_reviews JSONB,
    p_attributions TEXT,
    p_cached_tier TEXT DEFAULT 'pro'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.place_cache (
        place_id,
        photo_uris,
        photo_count,
        reviews,
        review_count,
        attributions,
        cached_tier,
        cached_at,
        updated_at
    )
    VALUES (
        p_place_id,
        COALESCE(p_photo_uris, ARRAY[]::TEXT[]),
        COALESCE(array_length(p_photo_uris, 1), 0),
        COALESCE(p_reviews, '[]'::JSONB),
        COALESCE(jsonb_array_length(p_reviews), 0),
        p_attributions,
        p_cached_tier,
        now(),
        now()
    )
    ON CONFLICT (place_id) DO UPDATE SET
        photo_uris = COALESCE(EXCLUDED.photo_uris, place_cache.photo_uris),
        photo_count = COALESCE(array_length(EXCLUDED.photo_uris, 1), 0),
        reviews = COALESCE(EXCLUDED.reviews, place_cache.reviews),
        review_count = COALESCE(jsonb_array_length(EXCLUDED.reviews), 0),
        attributions = COALESCE(EXCLUDED.attributions, place_cache.attributions),
        cached_tier = EXCLUDED.cached_tier,
        cached_at = now(),
        updated_at = now();
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_place_cache_updated_at
BEFORE UPDATE ON public.place_cache
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();