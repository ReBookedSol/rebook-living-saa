import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = (import.meta.env as any).VITE_SUPABASE_URL || "https://gzihagvdpdjcoyjpvyvs.supabase.co";
const SUPABASE_API_KEY = (import.meta.env as any).VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta.env as any).VITE_SUPABASE_ANON_KEY;

let cachedApiKey: string | null = null;
let cacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // Cache for 1 hour

/**
 * Fetch Google Places API key from Supabase secrets via Edge Function
 */
export async function getGoogleMapsApiKey(): Promise<string | null> {
  // Return cached key if still valid
  if (cachedApiKey && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedApiKey;
  }

  // Fetch from Edge Function which retrieves from Supabase secrets
  try {
    const { data: { session } } = await supabase.auth.getSession();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: session ? `Bearer ${session.access_token}` : "",
        apikey: SUPABASE_API_KEY,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("Failed to fetch config from Edge Function:", response.status);
      return null;
    }

    const data = await response.json();
    if (data.success && data.googlePlacesApiKey) {
      cachedApiKey = data.googlePlacesApiKey;
      cacheTime = Date.now();
      return data.googlePlacesApiKey;
    }

    if (!data.success) {
      console.warn("Config fetch returned success: false", data.error);
    }
    return null;
  } catch (error) {
    console.warn("Failed to fetch API key from Edge Function:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Load Google Maps script with the API key
 */
export async function loadGoogleMapsScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if ((window as any).google?.maps) {
      resolve(true);
      return;
    }

    // Check if script already exists
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      if ((window as any).google?.maps) {
        resolve(true);
      } else {
        existing.addEventListener(
          "load",
          () => resolve(true),
          { once: true }
        );
        existing.addEventListener(
          "error",
          () => resolve(false),
          { once: true }
        );
      }
      return;
    }

    // Fetch API key and load script
    getGoogleMapsApiKey().then((apiKey) => {
      if (!apiKey) {
        console.warn("No Google Maps API key available");
        resolve(false);
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn("Failed to load Google Maps script");
        resolve(false);
      };
      document.head.appendChild(script);
    });
  });
}
