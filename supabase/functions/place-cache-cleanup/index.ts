import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CleanupResult {
  success: boolean;
  deleted_count: number;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting cache cleanup job...");

    // Find expired cache entries (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get count of expired entries before deletion
    const { data: expiredEntries, error: fetchError } = await supabase
      .from("place_cache")
      .select("place_id, cached_at")
      .lt("cached_at", thirtyDaysAgo);

    if (fetchError) {
      console.error("Error fetching expired entries:", fetchError);
      throw fetchError;
    }

    const expiredCount = expiredEntries?.length || 0;
    console.log(`Found ${expiredCount} expired cache entries`);

    if (expiredCount === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          deleted_count: 0,
          message: "No expired entries to clean up",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete expired entries
    const { error: deleteError } = await supabase
      .from("place_cache")
      .delete()
      .lt("cached_at", thirtyDaysAgo);

    if (deleteError) {
      console.error("Error deleting expired entries:", deleteError);
      throw deleteError;
    }

    console.log(`Successfully deleted ${expiredCount} expired cache entries`);

    // Log cleanup to analytics (as a special negative hit to track cleanup events)
    // We could create a separate cleanup log table, but for now we'll just log
    console.log("Cache cleanup completed:", {
      deleted_count: expiredCount,
      cleanup_time: new Date().toISOString(),
    });

    const result: CleanupResult = {
      success: true,
      deleted_count: expiredCount,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cache cleanup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({
        success: false,
        deleted_count: 0,
        error: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
