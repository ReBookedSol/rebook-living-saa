import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { action, ...data } = await req.json();

    switch (action) {
      case "initialize-payment": {
        // Initialize a Paystack payment
        const { email, amount, metadata, callback_url } = data;

        const response = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            amount: amount * 100, // Convert to kobo/cents
            currency: "ZAR",
            callback_url,
            metadata,
          }),
        });

        const result = await response.json();

        if (!result.status) {
          throw new Error(result.message || "Failed to initialize payment");
        }

        return new Response(JSON.stringify(result.data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "verify-payment": {
        // Verify a Paystack payment
        const { reference } = data;

        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        });

        const result = await response.json();

        if (!result.status || result.data.status !== "success") {
          throw new Error("Payment verification failed");
        }

        // Update subscription status in database
        const { landlord_id, listing_id } = result.data.metadata;

        if (landlord_id) {
          // Update subscription
          await supabase
            .from("landlord_subscriptions")
            .update({
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              paystack_customer_code: result.data.customer.customer_code,
            })
            .eq("user_id", landlord_id);
        }

        if (listing_id) {
          // Update listing payment status
          await supabase
            .from("landlord_listings")
            .update({
              payment_status: "paid",
              published_at: new Date().toISOString(),
            })
            .eq("id", listing_id);

          // Get accommodation ID and make it active
          const { data: listing } = await supabase
            .from("landlord_listings")
            .select("accommodation_id")
            .eq("id", listing_id)
            .single();

          if (listing) {
            await supabase
              .from("accommodations")
              .update({ status: "active" })
              .eq("id", listing.accommodation_id);
          }
        }

        return new Response(JSON.stringify({ success: true, data: result.data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create-subscription": {
        // Create a recurring subscription plan
        const { email, plan_code, metadata, callback_url } = data;

        const response = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            plan: plan_code,
            currency: "ZAR",
            callback_url,
            metadata,
          }),
        });

        const result = await response.json();

        if (!result.status) {
          throw new Error(result.message || "Failed to create subscription");
        }

        return new Response(JSON.stringify(result.data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "webhook": {
        // Handle Paystack webhook events
        const event = data;
        
        console.log("Paystack webhook event:", event.event);

        switch (event.event) {
          case "charge.success": {
            const { metadata, customer } = event.data;
            
            if (metadata?.landlord_id) {
              await supabase
                .from("landlord_subscriptions")
                .update({
                  status: "active",
                  current_period_start: new Date().toISOString(),
                  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  paystack_customer_code: customer.customer_code,
                })
                .eq("user_id", metadata.landlord_id);
            }

            if (metadata?.listing_id) {
              await supabase
                .from("landlord_listings")
                .update({
                  payment_status: "paid",
                  published_at: new Date().toISOString(),
                })
                .eq("id", metadata.listing_id);

              const { data: listing } = await supabase
                .from("landlord_listings")
                .select("accommodation_id")
                .eq("id", metadata.listing_id)
                .single();

              if (listing) {
                await supabase
                  .from("accommodations")
                  .update({ status: "active" })
                  .eq("id", listing.accommodation_id);
              }
            }
            break;
          }

          case "subscription.disable":
          case "subscription.not_renew": {
            const { metadata } = event.data;
            
            if (metadata?.landlord_id) {
              await supabase
                .from("landlord_subscriptions")
                .update({ status: "cancelled" })
                .eq("user_id", metadata.landlord_id);
            }
            break;
          }

          case "invoice.payment_failed": {
            const { metadata } = event.data;
            
            if (metadata?.landlord_id) {
              await supabase
                .from("landlord_subscriptions")
                .update({ status: "expired" })
                .eq("user_id", metadata.landlord_id);

              // Mark all landlord listings as unpaid
              await supabase
                .from("landlord_listings")
                .update({ payment_status: "overdue" })
                .eq("landlord_id", metadata.landlord_id)
                .eq("payment_status", "paid");
            }
            break;
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error: any) {
    console.error("Paystack function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});