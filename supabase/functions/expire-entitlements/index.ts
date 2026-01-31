import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find all expired payments that are still marked as active/successful
    const now = new Date().toISOString();
    
    const { data: expiredPayments, error: fetchError } = await supabase
      .from("user_payments")
      .select("id, user_id, payment_type, access_expires_at")
      .in("status", ["active", "successful"])
      .lt("access_expires_at", now);

    if (fetchError) {
      throw fetchError;
    }

    if (!expiredPayments || expiredPayments.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No expired entitlements found",
        expired: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update all expired payments to 'expired' status
    const expiredIds = expiredPayments.map(p => p.id);
    
    const { error: updateError } = await supabase
      .from("user_payments")
      .update({ status: "expired", updated_at: now })
      .in("id", expiredIds);

    if (updateError) {
      throw updateError;
    }

    console.log(`Expired ${expiredPayments.length} entitlements:`, expiredIds);

    return new Response(JSON.stringify({
      success: true,
      message: `Expired ${expiredPayments.length} entitlements`,
      expired: expiredPayments.length,
      details: expiredPayments.map(p => ({
        user_id: p.user_id,
        payment_type: p.payment_type,
        expired_at: p.access_expires_at,
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Expire entitlements error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
