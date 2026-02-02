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

    // Find payments expiring in the next 24 hours that haven't been notified
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    console.log("Checking for subscriptions expiring between", now.toISOString(), "and", in24Hours.toISOString());

    const { data: expiringPayments, error: fetchError } = await supabase
      .from("user_payments")
      .select(`
        id, 
        user_id, 
        payment_type, 
        access_expires_at,
        raw_payload
      `)
      .eq("status", "active")
      .gt("access_expires_at", now.toISOString())
      .lte("access_expires_at", in24Hours.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!expiringPayments || expiringPayments.length === 0) {
      console.log("No subscriptions expiring in the next 24 hours");
      return new Response(JSON.stringify({
        success: true,
        message: "No expiring subscriptions found",
        notified: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${expiringPayments.length} expiring subscriptions`);

    // Check which ones haven't been notified yet
    const notificationsToCreate = [];
    
    for (const payment of expiringPayments) {
      // Check if we already sent an expiry notification for this payment
      const { data: existingNotification } = await supabase
        .from("notifications")
        .select("id")
        .eq("target_user_id", payment.user_id)
        .eq("type", "subscription_expiring")
        .gte("created_at", new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString())
        .single();

      if (!existingNotification) {
        const expiryDate = new Date(payment.access_expires_at);
        const hoursUntilExpiry = Math.round((expiryDate.getTime() - now.getTime()) / (60 * 60 * 1000));
        
        notificationsToCreate.push({
          title: "Your Pro Access is Expiring Soon",
          message: `Your ${payment.payment_type === "weekly" ? "5-day" : "monthly"} pass expires in ${hoursUntilExpiry} hours. Renew now to keep unlimited access to photos, reviews, and AI features.`,
          type: "subscription_expiring",
          priority: "high",
          target_user_id: payment.user_id,
          created_at: now.toISOString(),
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notificationsToCreate);

      if (insertError) {
        console.error("Failed to create expiry notifications:", insertError);
        throw insertError;
      }

      console.log(`Created ${notificationsToCreate.length} expiry notifications`);
    }

    // Optionally send emails for expiring subscriptions
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (brevoApiKey) {
      for (const payment of expiringPayments) {
        // Get user email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, first_name")
          .eq("id", payment.user_id)
          .single();

        if (profile?.email) {
          const expiryDate = new Date(payment.access_expires_at);
          const hoursLeft = Math.round((expiryDate.getTime() - now.getTime()) / (60 * 60 * 1000));
          
          try {
            await fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: {
                "api-key": brevoApiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sender: { email: "info@rebookedsolutions.co.za", name: "ReBooked" },
                to: [{ email: profile.email }],
                subject: "⏰ Your ReBooked Pro Access Expires Soon",
                htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">
                ⏰ Time is Running Out!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Hi ${profile.first_name || 'there'},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Your <strong>${payment.payment_type === "weekly" ? "5-Day" : "Monthly"} Pro Access</strong> expires in approximately <strong>${hoursLeft} hours</strong>.
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  <strong>Don't lose access to:</strong><br>
                  ✓ All accommodation photos<br>
                  ✓ Google reviews & ratings<br>
                  ✓ AI-powered search & comparisons<br>
                  ✓ Interactive maps with travel times
                </p>
              </div>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Renew now to continue enjoying unlimited access. Your new pass will be added to your remaining time!
              </p>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="https://rebook-living-sa.lovable.app/pricing" 
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);">
                      Renew My Access
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Need help? Reply to this email or visit our <a href="https://rebook-living-sa.lovable.app/contact" style="color: #0ea5e9; text-decoration: none;">support page</a>.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0;">
                © 2025 ReBooked Solutions. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
                `,
              }),
            });
            console.log(`Sent expiry email to ${profile.email}`);
          } catch (emailError) {
            console.error(`Failed to send expiry email to ${profile.email}:`, emailError);
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${expiringPayments.length} expiring subscriptions`,
      notified: notificationsToCreate.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Notify expiring subscriptions error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
