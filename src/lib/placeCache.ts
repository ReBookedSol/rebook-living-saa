import { supabase } from "@/integrations/supabase/client";
import type { PlaceCacheData, PlaceCacheRequest } from "@/types/place-cache";

const SUPABASE_URL = (import.meta.env as any).VITE_SUPABASE_URL || "https://gzihagvdpdjcoyjpvyvs.supabase.co";
const SUPABASE_API_KEY = (import.meta.env as any).VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta.env as any).VITE_SUPABASE_ANON_KEY;

// Log configuration (remove in production if needed)
if (!SUPABASE_API_KEY) {
  console.warn("⚠️ SUPABASE_API_KEY is not set! Place cache requests will fail with 401.");
}

/**
 * Fetch place data from cache or Google Places API
 */
export async function getPlaceData(
  params: Omit<PlaceCacheRequest, "user_tier" | "action"> & {
    user_tier?: "free" | "pro";
    action?: "browse" | "listing";
  }
): Promise<PlaceCacheData> {
  const { place_id, address, property_name, city, user_tier = "free", action = "listing" } = params;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      apikey: SUPABASE_API_KEY,
    };

    // Only include Authorization header if session exists
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/place-cache`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        place_id,
        address,
        property_name,
        city,
        user_tier,
        action,
      }),
    });

    if (!response.ok) {
      let errorDetail = `API error: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorDetail = `${response.status} - ${errorBody.error || response.statusText}`;
      } catch (_) {
        // If response isn't JSON, just use status
      }
      console.error("Place cache API error:", errorDetail, {
        status: response.status,
        apiKeyExists: !!SUPABASE_API_KEY,
        hasSession: !!session,
      });
      return {
        success: false,
        cached: false,
        photos: [],
        reviews: [],
        photo_count: 0,
        review_count: 0,
        error: errorDetail,
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Place cache fetch error:", error);
    return {
      success: false,
      cached: false,
      photos: [],
      reviews: [],
      photo_count: 0,
      review_count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Determine user tier based on access level
 */
export function getUserTier(accessLevel: string): "free" | "pro" {
  return accessLevel === "paid" ? "pro" : "free";
}

/**
 * Get cache statistics from the database
 */
export async function getCacheStats(): Promise<{
  total_places: number;
  pro_tier_count: number;
}> {
  try {
    const [totalResult, proResult] = await Promise.all([
      supabase.from("place_cache").select("*", { count: "exact", head: true }),
      supabase
        .from("place_cache")
        .select("*", { count: "exact", head: true })
        .eq("cached_tier", "pro"),
    ]);

    return {
      total_places: totalResult.count || 0,
      pro_tier_count: proResult.count || 0,
    };
  } catch (error) {
    console.error("Failed to get cache stats:", error);
    return { total_places: 0, pro_tier_count: 0 };
  }
}
