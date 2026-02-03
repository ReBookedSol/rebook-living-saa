-- Drop the existing check constraint that only allows 'pro'
ALTER TABLE public.place_cache DROP CONSTRAINT IF EXISTS place_cache_cached_tier_check;

-- Add new check constraint that allows both 'free' and 'pro'
ALTER TABLE public.place_cache ADD CONSTRAINT place_cache_cached_tier_check 
  CHECK (cached_tier IN ('free', 'pro'));