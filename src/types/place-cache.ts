export interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface PlaceCacheData {
  success: boolean;
  cached: boolean;
  place_id?: string;
  photos: string[];
  reviews: GoogleReview[];
  attributions?: string;
  photo_count: number;
  review_count: number;
  cache_stats?: {
    total_cached_places: number;
    cache_hit: boolean;
  };
  error?: string;
}

export interface PlaceCacheRequest {
  place_id?: string;
  address?: string;
  property_name?: string;
  city?: string;
  user_tier: "free" | "pro";
  action: "browse" | "listing";
}
