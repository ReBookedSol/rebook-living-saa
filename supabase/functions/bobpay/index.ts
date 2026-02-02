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

  // Note: We don't insert payment record here since the status constraint only allows
  // 'active', 'expired', 'cancelled'. The payment record will be created when 
  // the webhook confirms successful payment with status 'active'.
  // We log the pending payment info for tracking purposes.
  console.log("Payment initialized, awaiting webhook confirmation:", {
    custom_payment_id,
    user_id,
    amount,
    payment_type,
    access_expires_at: access_expires_at.toISOString(),
  });

  console.log("Payment initialization complete, awaiting webhook:", custom_payment_id);

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

  // Verify signature in production mode
  const passphrase = Deno.env.get("BOBPAY_PASSPHRASE");
  if (passphrase && !BOBPAY_SANDBOX) {
    const isValid = verifySignature(payload, passphrase);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }
    console.log("Webhook signature verified");
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

  // Parse the custom_payment_id to extract user_id
  // Format: RB-{full_user_id}-{timestamp}
  // Example: RB-f7f60a18-5bab-42ae-a737-c74ad1f3b31f-1769845983281
  const match = payload.custom_payment_id.match(/^RB-([0-9a-f-]{36})-\d+$/);
  if (!match) {
    console.error("Invalid custom_payment_id format:", payload.custom_payment_id);
    return new Response("OK", { status: 200 });
  }

  const user_id = match[1];
  console.log("Extracted user_id from payment:", user_id);
  
  // Determine payment type from item_name (Weekly = 5 days, Monthly = 25 days)
  const payment_type = payload.item_name?.toLowerCase().includes("5-day") || payload.item_name?.toLowerCase().includes("weekly") ? "weekly" : "monthly";
  const duration_days = payment_type === "weekly" ? 5 : 25;
  
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
    // Stack time on top of existing expiration
    access_expires_at = new Date(existingPayment.access_expires_at);
    console.log("Stacking on existing expiration:", access_expires_at.toISOString());
  } else {
    access_expires_at = new Date();
  }
  access_expires_at.setDate(access_expires_at.getDate() + duration_days);

  // Check if payment already exists to avoid duplicates
  const { data: existingPaymentRecord } = await supabase
    .from("user_payments")
    .select("id")
    .eq("custom_payment_id", payload.custom_payment_id)
    .single();

  if (existingPaymentRecord) {
    console.log("Payment already processed:", payload.custom_payment_id);
    return new Response("OK", { status: 200 });
  }

  // Create the payment record with status 'active'
  const { error: insertError } = await supabase
    .from("user_payments")
    .insert({
      user_id,
      amount: Math.round(payload.amount), // Amount from webhook
      payment_type,
      payment_provider: "bobpay",
      status: "active", // Allowed status value
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
    return new Response("Error creating payment", { status: 500 });
  }

  console.log("Payment created successfully:", payload.custom_payment_id, "for user:", user_id);

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
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0;">
                🎉 Welcome to Pro!
              </h1>
              <p style="color: #d1fae5; font-size: 16px; margin: 12px 0 0;">
                Your premium access is now active
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Thank you for your purchase! Your ReBooked Pro access is now active.
              </p>
              
              <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 24px; margin: 24px 0; border-radius: 12px;">
                <h2 style="color: #166534; font-size: 18px; margin: 0 0 16px;">Order Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="color: #6b7280; padding: 8px 0;">Plan:</td>
                    <td style="color: #111827; font-weight: 600; text-align: right;">${payment_type === "weekly" ? "5-Day Pass" : "Monthly Pass"}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; padding: 8px 0;">Amount Paid:</td>
                    <td style="color: #111827; font-weight: 600; text-align: right;">R${Math.round(payload.amount)}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; padding: 8px 0;">Valid Until:</td>
                    <td style="color: #111827; font-weight: 600; text-align: right;">${access_expires_at.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; padding: 8px 0;">Reference:</td>
                    <td style="color: #111827; font-weight: 600; text-align: right;">${payload.custom_payment_id}</td>
                  </tr>
                </table>
              </div>
              
              <h3 style="color: #111827; font-size: 16px; margin: 24px 0 12px;">What you can now access:</h3>
              <ul style="color: #374151; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
                <li>✓ <strong>All Photos</strong> - View every image of accommodations</li>
                <li>✓ <strong>Google Reviews</strong> - Read what others are saying</li>
                <li>✓ <strong>AI Search & Compare</strong> - Smart accommodation matching</li>
                <li>✓ <strong>Interactive Maps</strong> - See travel times & distances</li>
                <li>✓ <strong>No Ads</strong> - Enjoy an ad-free experience</li>
              </ul>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://rebook-living-sa.lovable.app/browse" 
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                      Start Browsing Now
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
                Questions? Reply to this email or visit our <a href="https://rebook-living-sa.lovable.app/contact" style="color: #10b981; text-decoration: none;">support page</a>.
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
      console.log("Purchase confirmation email sent to:", payload.email);
    } catch (emailError) {
      console.error("Failed to send purchase confirmation email:", emailError);
      // Don't fail the webhook if email fails
    }
  }

  return new Response("OK", { status: 200 });
}

async function handleVerify(req: Request, supabase: SupabaseClientType) {
  const { custom_payment_id } = await req.json();

  if (!custom_payment_id) {
    return new Response(
      JSON.stringify({ error: "Missing payment ID" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: payment, error } = await supabase
    .from("user_payments")
    .select("*")
    .eq("custom_payment_id", custom_payment_id)
    .single();

  if (error || !payment) {
    return new Response(
      JSON.stringify({ error: "Payment not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check if access is still active
  const isActive = payment.status === "active" && new Date() < new Date(payment.access_expires_at);

  return new Response(
    JSON.stringify({
      status: payment.status,
      payment_type: payment.payment_type,
      access_expires_at: payment.access_expires_at,
      is_active: isActive,
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

  // Check for active payment using the has_paid_access function or direct query
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
    const keyValuePairs = [
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

    const signatureString = keyValuePairs.join("&") + `&passphrase=${passphrase}`;
    const calculatedSignature = createHash("md5").update(signatureString).digest("hex");

    return calculatedSignature === payload.signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}
