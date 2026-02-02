import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    console.log("Subscription event received:", body);

    // Handle payment success/activation
    if (body.type === "payment.success" || body.type === "subscription.activated") {
      const { user_id, payment_type } = body;

      if (!user_id) {
        throw new Error("Missing user_id in payment event");
      }

      console.log(`Creating pro upgrade notification for user: ${user_id}`);

      // Create notification for pro upgrade
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          title: "Welcome to Pro!",
          message: "You now have access to premium features including unlimited photos, reviews, and detailed accommodation insights.",
          type: "subscription",
          priority: "high",
          target_user_id: user_id,
          created_at: new Date().toISOString(),
        });

      if (notificationError) {
        console.error("Failed to create pro upgrade notification:", notificationError);
        throw notificationError;
      }

      console.log(`Successfully created pro upgrade notification for user: ${user_id}`);
    }

    // Handle expiration notifications
    else if (body.type === "subscription.expired") {
      const { user_id } = body;

      if (!user_id) {
        throw new Error("Missing user_id in expiration event");
      }

      console.log(`Creating expiration notification for user: ${user_id}`);

      // Create notification for subscription expiration
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          title: "Pro Subscription Expired",
          message: "Your premium access has expired. Subscribe again to continue enjoying unlimited benefits.",
          type: "subscription_expired",
          priority: "medium",
          target_user_id: user_id,
          created_at: new Date().toISOString(),
        });

      if (notificationError) {
        console.error("Failed to create expiration notification:", notificationError);
        throw notificationError;
      }

      console.log(`Successfully created expiration notification for user: ${user_id}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Subscription event processed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Subscription event handler error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
