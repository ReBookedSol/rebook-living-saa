import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ExpiryRecord {
  user_id: string;
  notification_created: boolean;
}

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

    console.log("Starting subscription expiry check...");

    // Find users with expired subscriptions that don't have expiration notifications yet
    const now = new Date().toISOString();

    // Get all payments that are active/successful but have expired
    const { data: expiredPayments, error: fetchError } = await supabase
      .from("user_payments")
      .select("user_id, access_expires_at")
      .in("status", ["successful", "active"])
      .lt("access_expires_at", now)
      .order("access_expires_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching expired payments:", fetchError);
      throw fetchError;
    }

    if (!expiredPayments || expiredPayments.length === 0) {
      console.log("No expired subscriptions found");
      return new Response(
        JSON.stringify({ success: true, message: "No expired subscriptions found", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${expiredPayments.length} expired subscriptions`);

    // Get unique users
    const userIds = [...new Set(expiredPayments.map((p) => p.user_id))];

    // Check which users already have expiration notifications
    const { data: existingNotifications, error: notifError } = await supabase
      .from("notifications")
      .select("target_user_id")
      .in("target_user_id", userIds)
      .eq("type", "subscription_expired");

    if (notifError) {
      console.error("Error checking existing notifications:", notifError);
      throw notifError;
    }

    const usersWithNotifications = new Set(
      existingNotifications?.map((n) => n.target_user_id) || []
    );

    // Create notifications for users without them
    const usersNeedingNotifications = userIds.filter(
      (id) => !usersWithNotifications.has(id)
    );

    if (usersNeedingNotifications.length === 0) {
      console.log("All expired users already have notifications");
      return new Response(
        JSON.stringify({ success: true, message: "All expired users already have notifications", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating expiration notifications for ${usersNeedingNotifications.length} users`);

    const notificationInserts = usersNeedingNotifications.map((userId) => ({
      title: "Pro Subscription Expired",
      message: "Your premium access has expired. Subscribe again to continue enjoying unlimited benefits.",
      type: "subscription_expired",
      priority: "medium",
      target_user_id: userId,
      created_at: now,
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notificationInserts);

    if (insertError) {
      console.error("Error creating notifications:", insertError);
      throw insertError;
    }

    console.log(
      `Successfully created ${usersNeedingNotifications.length} expiration notifications`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription expiry check completed",
        processed: usersNeedingNotifications.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Subscription expiry check error:", error);
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
