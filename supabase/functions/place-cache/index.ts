import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PlaceCacheRequest {
  place_id?: string;
  address?: string;
  property_name?: string;
  city?: string;
  user_tier: "free" | "pro";
  action: "browse" | "listing";
}

interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface PlaceCacheResponse {
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

// Display limits based on user tier and action
const DISPLAY_LIMITS = {
  browse: { photos: 1, reviews: 0 },
  listing: {
    free: { photos: 3, reviews: 1 },
    pro: { photos: 10, reviews: 5 },
  },
};

// Maximum data to cache per tier
const CACHE_LIMITS = {
  free: { photos: 3, reviews: 1 },
  pro: { photos: 10, reviews: 5 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");

    if (!googleApiKey) {
      console.error("GOOGLE_PLACES_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "API key not configured", photos: [], reviews: [], photo_count: 0, review_count: 0 }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: PlaceCacheRequest = await req.json();
    const { place_id, address, property_name, city, user_tier = "free", action = "listing" } = body;

    // Input validation
    if (!["free", "pro"].includes(user_tier)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid user_tier. Must be 'free' or 'pro'",
          photos: [],
          reviews: [],
          photo_count: 0,
          review_count: 0
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["browse", "listing"].includes(action)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid action. Must be 'browse' or 'listing'",
          photos: [],
          reviews: [],
          photo_count: 0,
          review_count: 0
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Place cache request:", { place_id, address, property_name, user_tier, action });

    // Get cache stats for monitoring
    const { count: totalCachedPlaces } = await supabase
      .from("place_cache")
      .select("*", { count: "exact", head: true });

    // If no place_id provided, we need to search for it first
    let resolvedPlaceId = place_id;
    
    if (!resolvedPlaceId && (address || property_name)) {
      // Use Google Places Text Search to find the place
      const searchQuery = [property_name, address, city].filter(Boolean).join(", ");
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id&key=${googleApiKey}`;
      
      console.log("Searching for place:", searchQuery);
      const searchResp = await fetch(searchUrl);
      const searchData = await searchResp.json();
      
      if (searchData.candidates && searchData.candidates.length > 0) {
        resolvedPlaceId = searchData.candidates[0].place_id;
        console.log("Found place_id:", resolvedPlaceId);
      } else {
        console.log("No place found for query:", searchQuery);
        return new Response(
          JSON.stringify({
            success: true,
            cached: false,
            photos: [],
            reviews: [],
            photo_count: 0,
            review_count: 0,
            cache_stats: { total_cached_places: totalCachedPlaces || 0, cache_hit: false },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!resolvedPlaceId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No place_id or address provided",
          photos: [],
          reviews: [],
          photo_count: 0,
          review_count: 0,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cache first
    const { data: cacheData } = await supabase.rpc("get_cached_place", {
      p_place_id: resolvedPlaceId,
    });

    const cachedPlace = cacheData && cacheData.length > 0 ? cacheData[0] : null;
    const cachedPhotoCount = cachedPlace?.photo_uris?.length || 0;
    const cachedReviewCount = cachedPlace?.reviews?.length || 0;
    const cachedTier = cachedPlace?.cached_tier;
    const isExpired = cachedPlace?.is_expired;

    // Determine what fetch limits we need based on user tier
    const userLimits = CACHE_LIMITS[user_tier];

    // Determine if cache is sufficient for THIS user
    // - Pro user needs pro-tier cache OR pro-level data
    // - Free user can use either free or pro cache
    const cacheHasEnoughForUser = cachedPlace && !isExpired && (
      cachedTier === "pro" || // Pro cache has everything
      (user_tier === "free" && cachedPhotoCount >= userLimits.photos) // Free user needs at least free-level data
    );

    // Pro user visiting free-tier cache needs delta fetch
    const needsDeltaFetch = cachedPlace && !isExpired && user_tier === "pro" && cachedTier === "free";

    console.log("Cache status:", {
      found: !!cachedPlace,
      expired: isExpired,
      cachedTier,
      cachedPhotos: cachedPhotoCount,
      cachedReviews: cachedReviewCount,
      userTier: user_tier,
      cacheHasEnoughForUser,
      needsDeltaFetch
    });

    let photos: string[] = [];
    let reviews: GoogleReview[] = [];
    let attributions: string | undefined;
    let cacheHit = false;

    if (cacheHasEnoughForUser && !needsDeltaFetch) {
      // Use cached data directly
      photos = cachedPlace.photo_uris || [];
      reviews = cachedPlace.reviews || [];
      attributions = cachedPlace.attributions;
      cacheHit = true;
      console.log("Using cached data:", { photos: photos.length, reviews: reviews.length, tier: cachedTier });
      
      // Track cache hit in analytics
      await supabase.rpc("increment_cache_analytics", { p_is_hit: true });
    } else {
      // Need to fetch from Google Places API
      console.log("Fetching from Google Places API...");

      // Determine fetch limits based on scenario
      let photoFetchLimit: number;
      let reviewFetchLimit: number;
      let tierToSave: "free" | "pro";

      if (needsDeltaFetch) {
        // Pro user visiting free-tier cache: fetch ONLY the delta (remaining photos/reviews)
        photoFetchLimit = CACHE_LIMITS.pro.photos; // Need to refetch all to get the extras
        reviewFetchLimit = CACHE_LIMITS.pro.reviews;
        tierToSave = "pro";
        console.log("Delta fetch for pro user:", { 
          existingPhotos: cachedPhotoCount, 
          existingReviews: cachedReviewCount,
          fetchingPhotos: photoFetchLimit,
          fetchingReviews: reviewFetchLimit 
        });
      } else {
        // Fresh fetch - only get what this user tier needs
        photoFetchLimit = userLimits.photos;
        reviewFetchLimit = userLimits.reviews;
        tierToSave = user_tier;
        console.log("Fresh fetch for", user_tier, "user:", { photos: photoFetchLimit, reviews: reviewFetchLimit });
      }

      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${resolvedPlaceId}&fields=photos,reviews,name,formatted_address&key=${googleApiKey}`;
      const detailsResp = await fetch(detailsUrl);
      const detailsData = await detailsResp.json();

      if (detailsData.status !== "OK") {
        console.error("Google Places API error:", detailsData.status, detailsData.error_message);

        // If we have stale cache, use it as fallback
        if (cachedPlace) {
          console.log("Using stale cache as fallback");
          photos = cachedPlace.photo_uris || [];
          reviews = cachedPlace.reviews || [];
          attributions = cachedPlace.attributions;
        }
      } else {
        const result = detailsData.result;

        // Extract photos from API (up to fetch limit)
        const fetchedPhotos: string[] = [];
        if (result.photos && result.photos.length > 0) {
          const photoPromises = result.photos.slice(0, photoFetchLimit).map(async (photo: any) => {
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${googleApiKey}`;
            return photoUrl;
          });

          fetchedPhotos.push(...await Promise.all(photoPromises));

          // Collect attributions
          const photoAttributions = result.photos
            .slice(0, photoFetchLimit)
            .map((p: any) => p.html_attributions?.join(" ") || "")
            .filter(Boolean)
            .join(" ");
          attributions = photoAttributions || "Photos from Google Places";
        }

        // Extract reviews from API (up to fetch limit)
        const fetchedReviews: GoogleReview[] = [];
        if (result.reviews && result.reviews.length > 0) {
          fetchedReviews.push(...result.reviews.slice(0, reviewFetchLimit).map((r: any) => ({
            author_name: r.author_name,
            author_url: r.author_url,
            profile_photo_url: r.profile_photo_url,
            rating: r.rating,
            relative_time_description: r.relative_time_description,
            text: r.text,
            time: r.time,
          })));
        }

        photos = fetchedPhotos;
        reviews = fetchedReviews;
        
        console.log("Fetched from API:", { 
          photos: photos.length, 
          reviews: reviews.length, 
          tierToSave,
          availablePhotosFromGoogle: result.photos?.length || 0,
          availableReviewsFromGoogle: result.reviews?.length || 0
        });

        // Cache the data with appropriate tier
        if (photos.length > 0 || reviews.length > 0) {
          const { error: cacheError } = await supabase.rpc("upsert_place_cache", {
            p_place_id: resolvedPlaceId,
            p_photo_uris: photos,
            p_reviews: reviews,
            p_attributions: attributions,
            p_cached_tier: tierToSave,
          });

          if (cacheError) {
            console.error("Failed to cache place data:", cacheError);
          } else {
            console.log("Successfully cached place data:", { tier: tierToSave, photos: photos.length, reviews: reviews.length });
          }

          // Track cache miss in analytics
          await supabase.rpc("increment_cache_analytics", { p_is_hit: false });
        }
      }
    }

    // Apply display limits based on user tier and action
    let displayPhotos: string[];
    let displayReviews: GoogleReview[];

    if (action === "browse") {
      displayPhotos = photos.slice(0, DISPLAY_LIMITS.browse.photos);
      displayReviews = [];
    } else {
      const limits = DISPLAY_LIMITS.listing[user_tier];
      displayPhotos = photos.slice(0, limits.photos);
      displayReviews = reviews.slice(0, limits.reviews);
    }

    console.log("Returning:", { 
      displayPhotos: displayPhotos.length, 
      displayReviews: displayReviews.length,
      totalCachedPhotos: photos.length,
      totalCachedReviews: reviews.length,
      tier: user_tier, 
      action,
      cacheHit
    });

    const response: PlaceCacheResponse = {
      success: true,
      cached: cacheHit,
      place_id: resolvedPlaceId,
      photos: displayPhotos,
      reviews: displayReviews,
      attributions,
      photo_count: photos.length,
      review_count: reviews.length,
      cache_stats: {
        total_cached_places: totalCachedPlaces || 0,
        cache_hit: cacheHit,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Place cache error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        photos: [],
        reviews: [],
        photo_count: 0,
        review_count: 0,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});