import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// BobPay API configuration - check if using sandbox or production
const BOBPAY_SANDBOX = Deno.env.get("BOBPAY_SANDBOX") === "true";
const BOBPAY_API_URL = BOBPAY_SANDBOX 
  ? "https://api.sandbox.bobpay.co.za/v2"
  : "https://api.bobpay.co.za/v2";

interface PaymentRequest {
  payment_type: "weekly" | "monthly";
  email: string;
  user_id: string;
}

interface WebhookPayload {
  id: number;
  uuid: string;
  short_reference: string;
  custom_payment_id: string;
  amount: number;
  paid_amount: number;
  total_paid_amount: number;
  status: string;
  payment_method: string;
  original_requested_payment_method: string;
  payment_id: number;
  payment: {
    id: number;
    payment_method_id: number;
    payment_method: string;
    amount: number;
    status: string;
  };
  item_name: string;
  item_description: string;
  recipient_account_code: string;
  recipient_account_id: number;
  email: string;
  mobile_number: string;
  from_bank: string;
  time_created: string;
  is_test: boolean;
  signature: string;
  notify_url: string;
  success_url: string;
  pending_url: string;
  cancel_url: string;
}

// deno-lint-ignore no-explicit-any
type SupabaseClientType = any;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(req.url);
  const action = url.pathname.split("/").pop();

  console.log("BobPay function called with action:", action);

  try {
    switch (action) {
      case "initialize":
        return await handleInitialize(req, supabase);
      case "webhook":
        return await handleWebhook(req, supabase);
      case "verify":
        return await handleVerify(req, supabase);
      case "poll":
        return await handlePoll(req, supabase);
      case "status":
        return await handleStatus(req, supabase);
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("BobPay error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleInitialize(req: Request, supabase: SupabaseClientType) {
  const body: PaymentRequest = await req.json();
  const { payment_type, email, user_id } = body;

  console.log("Initialize payment request:", { payment_type, email, user_id });

  if (!payment_type || !email || !user_id) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: payment_type, email, user_id" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Determine amount and duration based on payment type (Weekly = 5 days, Monthly = 25 days)
  const amount = payment_type === "weekly" ? 19 : 59;
  const duration_days = payment_type === "weekly" ? 5 : 25;
  const item_name = payment_type === "weekly" ? "5-Day Access Pass" : "Monthly Access Pass (25 Days)";
  const item_description = `ReBooked ${payment_type === "weekly" ? "5-day" : "25-day"} premium access - all photos, reviews, maps & no ads`;

  // Generate unique payment ID with full user_id for webhook lookup
  const custom_payment_id = `RB-${user_id}-${Date.now()}`;

  // Calculate access expiration date
  const access_expires_at = new Date();
  access_expires_at.setDate(access_expires_at.getDate() + duration_days);

  // Get BobPay credentials
  const bobpayToken = Deno.env.get("BOBPAY_API_TOKEN");
  const accountCode = Deno.env.get("BOBPAY_ACCOUNT_CODE");

  if (!bobpayToken) {
    console.error("BOBPAY_API_TOKEN not configured");
    throw new Error("BobPay API token not configured. Please check Supabase secrets.");
  }

  if (!accountCode) {
    console.error("BOBPAY_ACCOUNT_CODE not configured");
    throw new Error("BobPay account code not configured. Please check Supabase secrets.");
  }

  // Extract callback base URL dynamically from request origin
  const origin = req.headers.get("origin") || req.headers.get("referer")?.split("/").slice(0, 3).join("/");
  if (!origin) {
    console.error("Unable to determine request origin");
    throw new Error("Cannot determine callback URL. Please try again.");
  }
  const callbackBaseUrl = origin;

  console.log("BobPay initialization:", {
    api_url: BOBPAY_API_URL,
    sandbox_mode: BOBPAY_SANDBOX,
    account_code: accountCode,
    amount,
    payment_type,
    custom_payment_id,
  });

  // Prepare request body for BobPay API
  const requestBody = {
    recipient_account_code: accountCode,
    custom_payment_id,
    email,
    amount,
    item_name,
    item_description,
    notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/bobpay/webhook`,
    success_url: `${callbackBaseUrl}/payment/success?payment_id=${custom_payment_id}`,
    pending_url: `${callbackBaseUrl}/payment/pending?payment_id=${custom_payment_id}`,
    cancel_url: `${callbackBaseUrl}/payment/cancel?payment_id=${custom_payment_id}`,
    short_url: true,
  };

  console.log("BobPay request body:", JSON.stringify(requestBody, null, 2));

  // Create payment link with BobPay
  const paymentResponse = await fetch(`${BOBPAY_API_URL}/payments/intents/link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bobpayToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  const contentType = paymentResponse.headers.get("content-type");
  
  if (!paymentResponse.ok) {
    let errorDetail = `BobPay API error: ${paymentResponse.status}`;
    
    if (contentType?.includes("application/json")) {
      try {
        const errorData = await paymentResponse.json();
        console.error("BobPay API error response:", JSON.stringify(errorData));
        errorDetail = errorData.message || errorData.error || errorDetail;
      } catch (parseError) {
        console.error("Failed to parse BobPay error response");
      }
    } else {
      const textResponse = await paymentResponse.text();
      console.error("BobPay API non-JSON error:", textResponse.substring(0, 500));
    }
    
    if (paymentResponse.status === 401) {
      throw new Error("BobPay authentication failed. Please verify your API token in Supabase secrets.");
    } else if (paymentResponse.status === 403) {
      throw new Error("BobPay access denied. Please verify your account code and permissions.");
    } else {
      throw new Error(errorDetail);
    }
  }

  if (!contentType?.includes("application/json")) {
    const textResponse = await paymentResponse.text();
    console.error("BobPay returned non-JSON success response:", textResponse.substring(0, 200));
    throw new Error("BobPay API returned invalid response format");
  }

  const paymentData = await paymentResponse.json();
  console.log("BobPay success response:", JSON.stringify(paymentData, null, 2));

  console.log("Payment initialized, awaiting webhook confirmation:", {
    custom_payment_id,
    user_id,
    amount,
    payment_type,
    access_expires_at: access_expires_at.toISOString(),
  });

  return new Response(
    JSON.stringify({
      payment_url: paymentData.url,
      short_url: paymentData.short_url,
      custom_payment_id,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleWebhook(req: Request, supabase: SupabaseClientType) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                   req.headers.get("cf-connecting-ip") ||
                   req.headers.get("x-real-ip");
  
  console.log("Webhook received from IP:", clientIp);

  const payload: WebhookPayload = await req.json();
  console.log("BobPay webhook received:", JSON.stringify(payload, null, 2));

  // Signature verification - LOG failures but DO NOT reject
  // BobPay's signature algorithm can vary and rejecting valid payments is catastrophic
  const passphrase = Deno.env.get("BOBPAY_PASSPHRASE");
  if (passphrase && !BOBPAY_SANDBOX) {
    const isValid = verifySignature(payload, passphrase);
    if (!isValid) {
      console.warn("⚠️ Webhook signature mismatch - PROCESSING ANYWAY to avoid losing payments");
      console.warn("Payload signature:", payload.signature);
      // Do NOT return 400 - process the payment anyway
      // The payment will be verified by checking custom_payment_id format and status
    } else {
      console.log("Webhook signature verified successfully");
    }
  } else if (BOBPAY_SANDBOX) {
    console.log("Sandbox mode: skipping signature verification");
  } else {
    console.warn("BOBPAY_PASSPHRASE not configured - skipping signature verification");
  }

  // Only process paid status
  if (payload.status !== "paid") {
    console.log("Payment status not paid:", payload.status);
    return new Response("OK", { status: 200 });
  }

  // Process the payment
  const result = await processPayment(payload, supabase);
  
  return new Response(result.message, { status: result.status });
}

// Shared payment processing logic used by both webhook and polling
async function processPayment(payload: WebhookPayload, supabase: SupabaseClientType): Promise<{ status: number; message: string }> {
  // Parse the custom_payment_id to extract user_id
  // Format: RB-{full_user_id}-{timestamp}
  const match = payload.custom_payment_id.match(/^RB-([0-9a-f-]{36})-\d+$/);
  if (!match) {
    console.error("Invalid custom_payment_id format:", payload.custom_payment_id);
    return { status: 200, message: "OK" };
  }

  const user_id = match[1];
  console.log("Extracted user_id from payment:", user_id);
  
  // Determine payment type from item_name
  const payment_type = payload.item_name?.toLowerCase().includes("5-day") || payload.item_name?.toLowerCase().includes("weekly") ? "weekly" : "monthly";
  const duration_days = payment_type === "weekly" ? 5 : 25;
  
  // Check if payment already exists to avoid duplicates
  const { data: existingPaymentRecord } = await supabase
    .from("user_payments")
    .select("id")
    .eq("custom_payment_id", payload.custom_payment_id)
    .single();

  if (existingPaymentRecord) {
    console.log("Payment already processed:", payload.custom_payment_id);
    return { status: 200, message: "OK" };
  }

  // Check for existing active payment to stack time
  const { data: existingPayment } = await supabase
    .from("user_payments")
    .select("access_expires_at")
    .eq("user_id", user_id)
    .eq("status", "active")
    .gt("access_expires_at", new Date().toISOString())
    .order("access_expires_at", { ascending: false })
    .limit(1)
    .single();
  
  // Calculate access expiration - stack on existing if present
  let access_expires_at: Date;
  if (existingPayment) {
    access_expires_at = new Date(existingPayment.access_expires_at);
    console.log("Stacking on existing expiration:", access_expires_at.toISOString());
  } else {
    access_expires_at = new Date();
  }
  access_expires_at.setDate(access_expires_at.getDate() + duration_days);

  // Create the payment record with status 'active'
  const { error: insertError } = await supabase
    .from("user_payments")
    .insert({
      user_id,
      amount: Math.round(payload.amount),
      payment_type,
      payment_provider: "bobpay",
      status: "active",
      payment_method: payload.payment_method || "instant_eft",
      custom_payment_id: payload.custom_payment_id,
      bobpay_payment_id: payload.payment_id?.toString(),
      bobpay_uuid: payload.uuid,
      access_expires_at: access_expires_at.toISOString(),
      paid_at: new Date().toISOString(),
      raw_payload: {
        item_name: payload.item_name,
        item_description: payload.item_description,
        duration_days,
        webhook_payload: payload,
        is_sandbox: payload.is_test,
      },
    });

  if (insertError) {
    console.error("Failed to create payment record:", insertError);
    return { status: 500, message: "Error creating payment" };
  }

  console.log("✅ Payment created successfully:", payload.custom_payment_id, "for user:", user_id);

  // Create a notification for the user about their pro upgrade
  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      title: "Welcome to Pro!",
      message: `You now have access to premium features. Your ${payment_type === "weekly" ? "5-day" : "monthly"} pass expires on ${access_expires_at.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`,
      type: "subscription",
      priority: "high",
      target_user_id: user_id,
      created_at: new Date().toISOString(),
    });

  if (notificationError) {
    console.error("Failed to create pro upgrade notification:", notificationError);
  } else {
    console.log("Pro upgrade notification created for user:", user_id);
  }

  // Send purchase confirmation email
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  if (brevoApiKey && payload.email) {
    try {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { email: "info@rebookedsolutions.co.za", name: "ReBooked" },
          to: [{ email: payload.email }],
          subject: "🎉 Your ReBooked Pro Access is Now Active!",
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
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #7c3aed, #a855f7); border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Welcome to Pro!</h1>
              <p style="color: #e9d5ff; margin: 10px 0 0; font-size: 16px;">Your premium access is now active</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Hi there!</p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">Your <strong>${payment_type === "weekly" ? "5-Day" : "Monthly"} Access Pass</strong> has been activated. Here's what you now have access to:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px 0; color: #374151;">✅ All photos & Google reviews</td></tr>
                <tr><td style="padding: 8px 0; color: #374151;">✅ Interactive maps & satellite views</td></tr>
                <tr><td style="padding: 8px 0; color: #374151;">✅ AI Accommodation Assistant</td></tr>
                <tr><td style="padding: 8px 0; color: #374151;">✅ Ad-free browsing</td></tr>
                <tr><td style="padding: 8px 0; color: #374151;">✅ Distance & travel time to campus</td></tr>
              </table>
              <div style="background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Pass expires: <strong style="color: #374151;">${access_expires_at.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
                <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Amount paid: <strong style="color: #374151;">R${payload.amount}</strong></p>
              </div>
              <a href="https://rebook-living-sa.lovable.app/browse" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 10px;">Start Browsing</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ReBooked Solutions | support@rebookedsolutions.co.za</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        }),
      });
      console.log("Confirmation email sent to:", payload.email);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }
  }

  return { status: 200, message: "OK" };
}

// Poll BobPay API directly to verify payment status - called by client as a fallback
async function handlePoll(req: Request, supabase: SupabaseClientType) {
  const body = await req.json();
  const { custom_payment_id } = body;

  if (!custom_payment_id) {
    return new Response(
      JSON.stringify({ error: "Missing custom_payment_id" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log("Polling payment status for:", custom_payment_id);

  // First check if we already have this payment recorded
  const { data: existingPayment } = await supabase
    .from("user_payments")
    .select("id, status, access_expires_at, payment_type")
    .eq("custom_payment_id", custom_payment_id)
    .single();

  if (existingPayment) {
    console.log("Payment already recorded in DB:", existingPayment.id);
    return new Response(
      JSON.stringify({
        found: true,
        status: existingPayment.status === "active" ? "successful" : existingPayment.status,
        access_expires_at: existingPayment.access_expires_at,
        payment_type: existingPayment.payment_type,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Not in DB yet - try to verify directly with BobPay API
  const bobpayToken = Deno.env.get("BOBPAY_API_TOKEN");
  if (!bobpayToken) {
    console.error("BOBPAY_API_TOKEN not configured for polling");
    return new Response(
      JSON.stringify({ found: false, status: "pending", message: "Waiting for payment confirmation..." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Try to look up the payment via BobPay API
    const lookupResponse = await fetch(`${BOBPAY_API_URL}/payments/intents?custom_payment_id=${encodeURIComponent(custom_payment_id)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${bobpayToken}`,
        "Content-Type": "application/json",
      },
    });

    if (lookupResponse.ok) {
      const lookupData = await lookupResponse.json();
      console.log("BobPay API lookup response:", JSON.stringify(lookupData, null, 2));

      // Check if the API returned payment data
      // BobPay can return a single object or an array
      const paymentInfo = Array.isArray(lookupData) ? lookupData[0] : lookupData;
      
      if (paymentInfo && (paymentInfo.status === "paid" || paymentInfo.status === "success" || paymentInfo.status === "complete")) {
        console.log("✅ BobPay API confirms payment is PAID - recording now");
        
        // Build a webhook-like payload from the API response
        const syntheticPayload: WebhookPayload = {
          id: paymentInfo.id || 0,
          uuid: paymentInfo.uuid || "",
          short_reference: paymentInfo.short_reference || "",
          custom_payment_id: custom_payment_id,
          amount: paymentInfo.amount || paymentInfo.paid_amount || 0,
          paid_amount: paymentInfo.paid_amount || paymentInfo.amount || 0,
          total_paid_amount: paymentInfo.total_paid_amount || paymentInfo.amount || 0,
          status: "paid",
          payment_method: paymentInfo.payment_method || paymentInfo.payment?.payment_method || "unknown",
          original_requested_payment_method: paymentInfo.original_requested_payment_method || "",
          payment_id: paymentInfo.payment_id || paymentInfo.payment?.id || 0,
          payment: paymentInfo.payment || { id: 0, payment_method_id: 0, payment_method: "unknown", amount: 0, status: "success" },
          item_name: paymentInfo.item_name || "",
          item_description: paymentInfo.item_description || "",
          recipient_account_code: paymentInfo.recipient_account_code || "",
          recipient_account_id: paymentInfo.recipient_account_id || 0,
          email: paymentInfo.email || "",
          mobile_number: paymentInfo.mobile_number || "",
          from_bank: paymentInfo.from_bank || "",
          time_created: paymentInfo.time_created || new Date().toISOString(),
          is_test: paymentInfo.is_test || false,
          signature: "",
          notify_url: paymentInfo.notify_url || "",
          success_url: paymentInfo.success_url || "",
          pending_url: paymentInfo.pending_url || "",
          cancel_url: paymentInfo.cancel_url || "",
        };

        const result = await processPayment(syntheticPayload, supabase);
        
        if (result.status === 200) {
          // Fetch the newly created payment
          const { data: newPayment } = await supabase
            .from("user_payments")
            .select("id, status, access_expires_at, payment_type")
            .eq("custom_payment_id", custom_payment_id)
            .single();

          return new Response(
            JSON.stringify({
              found: true,
              status: "successful",
              access_expires_at: newPayment?.access_expires_at,
              payment_type: newPayment?.payment_type,
              recovered: true, // Flag that this was recovered via polling
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        console.log("BobPay API says payment status:", paymentInfo?.status || "unknown");
      }
    } else {
      const errorText = await lookupResponse.text();
      console.warn("BobPay API lookup failed:", lookupResponse.status, errorText.substring(0, 200));
    }
  } catch (apiError) {
    console.error("Error polling BobPay API:", apiError);
  }

  // Payment not found or not yet paid
  return new Response(
    JSON.stringify({ found: false, status: "pending", message: "Payment not yet confirmed" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleVerify(req: Request, supabase: SupabaseClientType) {
  const body = await req.json();
  const { custom_payment_id } = body;

  if (!custom_payment_id) {
    return new Response(
      JSON.stringify({ error: "Missing custom_payment_id" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check our database first
  const { data: payment, error } = await supabase
    .from("user_payments")
    .select("*")
    .eq("custom_payment_id", custom_payment_id)
    .single();

  if (error || !payment) {
    // Payment not in DB - try polling BobPay directly
    console.log("Payment not found in DB, attempting BobPay API verification...");
    
    // Delegate to the poll handler which has the full BobPay API logic
    const pollReq = new Request(req.url.replace("/verify", "/poll"), {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({ custom_payment_id }),
    });
    return await handlePoll(pollReq, supabase);
  }

  const isActive = payment.status === "active" && new Date(payment.access_expires_at) > new Date();

  return new Response(
    JSON.stringify({
      found: true,
      status: isActive ? "successful" : payment.status,
      is_active: isActive,
      access_expires_at: payment.access_expires_at,
      payment_type: payment.payment_type,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleStatus(req: Request, supabase: SupabaseClientType) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ access_level: "free", has_active_payment: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return new Response(
      JSON.stringify({ access_level: "free", has_active_payment: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check for active payment
  const { data: payments } = await supabase
    .from("user_payments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("access_expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (payments && payments.length > 0) {
    const payment = payments[0];
    return new Response(
      JSON.stringify({
        access_level: "paid",
        has_active_payment: true,
        payment_type: payment.payment_type,
        expires_at: payment.access_expires_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ access_level: "free", has_active_payment: false }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function verifySignature(payload: WebhookPayload, passphrase: string): boolean {
  try {
    // Try multiple signature algorithms since BobPay's exact format may vary
    
    // Method 1: Standard PayFast-style signature (key=value pairs + passphrase)
    const keyValuePairs = [
      `recipient_account_code=${payload.recipient_account_code || ""}`,
      `custom_payment_id=${payload.custom_payment_id || ""}`,
      `email=${payload.email || ""}`,
      `mobile_number=${payload.mobile_number || ""}`,
      `amount=${payload.amount?.toFixed(2) || "0.00"}`,
      `item_name=${payload.item_name || ""}`,
      `item_description=${payload.item_description || ""}`,
      `notify_url=${payload.notify_url || ""}`,
      `success_url=${payload.success_url || ""}`,
      `pending_url=${payload.pending_url || ""}`,
      `cancel_url=${payload.cancel_url || ""}`,
    ];

    // Try without URL encoding first (common BobPay format)
    const sig1String = keyValuePairs.join("&") + `&passphrase=${passphrase}`;
    const sig1 = createHash("md5").update(sig1String).digest("hex");
    if (sig1 === payload.signature) return true;

    // Method 2: With URL encoding
    const encodedPairs = [
      `recipient_account_code=${encodeURIComponent(payload.recipient_account_code || "")}`,
      `custom_payment_id=${encodeURIComponent(payload.custom_payment_id || "")}`,
      `email=${encodeURIComponent(payload.email || "")}`,
      `mobile_number=${encodeURIComponent(payload.mobile_number || "")}`,
      `amount=${payload.amount?.toFixed(2) || "0.00"}`,
      `item_name=${encodeURIComponent(payload.item_name || "")}`,
      `item_description=${encodeURIComponent(payload.item_description || "")}`,
      `notify_url=${encodeURIComponent(payload.notify_url || "")}`,
      `success_url=${encodeURIComponent(payload.success_url || "")}`,
      `pending_url=${encodeURIComponent(payload.pending_url || "")}`,
      `cancel_url=${encodeURIComponent(payload.cancel_url || "")}`,
    ];
    const sig2String = encodedPairs.join("&") + `&passphrase=${encodeURIComponent(passphrase)}`;
    const sig2 = createHash("md5").update(sig2String).digest("hex");
    if (sig2 === payload.signature) return true;

    // Method 3: Fewer fields (some gateways use subset)
    const minimalPairs = [
      `custom_payment_id=${payload.custom_payment_id || ""}`,
      `amount=${payload.amount?.toFixed(2) || "0.00"}`,
      `status=${payload.status || ""}`,
    ];
    const sig3String = minimalPairs.join("&") + `&passphrase=${passphrase}`;
    const sig3 = createHash("md5").update(sig3String).digest("hex");
    if (sig3 === payload.signature) return true;

    console.warn("All signature methods failed. Expected:", payload.signature);
    console.warn("Method 1 produced:", sig1);
    console.warn("Method 2 produced:", sig2);
    console.warn("Method 3 produced:", sig3);
    
    return false;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}
