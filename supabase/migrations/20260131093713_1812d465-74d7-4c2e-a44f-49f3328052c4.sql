-- Create cache analytics table to track hits/misses
CREATE TABLE public.place_cache_analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    cache_hits INTEGER NOT NULL DEFAULT 0,
    cache_misses INTEGER NOT NULL DEFAULT 0,
    api_calls_saved INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(date)
);

-- Enable RLS
ALTER TABLE public.place_cache_analytics ENABLE ROW LEVEL SECURITY;

-- Allow admins to read analytics
CREATE POLICY "Admins can read cache analytics"
ON public.place_cache_analytics
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow service role to insert/update
CREATE POLICY "Service role can manage cache analytics"
ON public.place_cache_analytics
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to increment cache analytics
CREATE OR REPLACE FUNCTION public.increment_cache_analytics(
    p_is_hit BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.place_cache_analytics (date, cache_hits, cache_misses, api_calls_saved)
    VALUES (
        CURRENT_DATE,
        CASE WHEN p_is_hit THEN 1 ELSE 0 END,
        CASE WHEN p_is_hit THEN 0 ELSE 1 END,
        CASE WHEN p_is_hit THEN 1 ELSE 0 END
    )
    ON CONFLICT (date) DO UPDATE SET
        cache_hits = place_cache_analytics.cache_hits + CASE WHEN p_is_hit THEN 1 ELSE 0 END,
        cache_misses = place_cache_analytics.cache_misses + CASE WHEN p_is_hit THEN 0 ELSE 1 END,
        api_calls_saved = place_cache_analytics.api_calls_saved + CASE WHEN p_is_hit THEN 1 ELSE 0 END,
        updated_at = now();
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_place_cache_analytics_updated_at
BEFORE UPDATE ON public.place_cache_analytics
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();