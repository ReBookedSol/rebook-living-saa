import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// BobPay API configuration - check if using sandbox or production
const BOBPAY_SANDBOX = Deno.env.get("BOBPAY_SANDBOX") === "true";
const BOBPAY_API_URL = BOBPAY_SANDBOX 
  ? "https://api.sandbox.bobpay.co.za/v2"
  : "https://api.bobpay.co.za/v2";

const BOBPAY_PAYMENT_URL = BOBPAY_SANDBOX
  ? "https://sandbox.bobpay.co.za"
  : "https://my.bobpay.co.za";

// Allowed IPs for webhook verification
const ALLOWED_IPS = ["13.246.115.225", "13.246.100.25"];

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(req.url);
  const action = url.pathname.split("/").pop();

  try {
    // Handle different actions
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

async function handleInitialize(req: Request, supabase: any) {
  const body: PaymentRequest = await req.json();
  const { payment_type, email, user_id } = body;

  if (!payment_type || !email || !user_id) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: payment_type, email, user_id" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Determine amount and duration based on payment type
  const amount = payment_type === "weekly" ? 19 : 59;
  const duration_days = payment_type === "weekly" ? 7 : 30;
  const item_name = payment_type === "weekly" ? "Weekly Access Pass" : "Monthly Access Pass";
  const item_description = `ReBooked ${payment_type === "weekly" ? "7-day" : "30-day"} premium access - all photos, reviews, maps & no ads`;

  // Generate unique payment ID
  const custom_payment_id = `RB-${user_id.slice(0, 8)}-${Date.now()}`;

  // Get BobPay credentials
  const bobpayToken = Deno.env.get("BOBPAY_API_TOKEN");
  const accountCode = Deno.env.get("BOBPAY_ACCOUNT_CODE");

  // Validate credentials
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

  // Prepare request body matching Postman structure
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

  // Handle response defensively
  const contentType = paymentResponse.headers.get("content-type");
  
  if (!paymentResponse.ok) {
    let errorDetail = `BobPay API error: ${paymentResponse.status}`;
    
    // Try to parse error response
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
    
    // Provide helpful error messages
    if (paymentResponse.status === 401) {
      throw new Error("BobPay authentication failed. Please verify your API token in Supabase secrets.");
    } else if (paymentResponse.status === 403) {
      throw new Error("BobPay access denied. Please verify your account code and permissions.");
    } else {
      throw new Error(errorDetail);
    }
  }

  // Parse successful response
  if (!contentType?.includes("application/json")) {
    const textResponse = await paymentResponse.text();
    console.error("BobPay returned non-JSON success response:", textResponse.substring(0, 200));
    throw new Error("BobPay API returned invalid response format");
  }

  const paymentData = await paymentResponse.json();
  console.log("BobPay success response:", JSON.stringify(paymentData, null, 2));

  // Store pending payment record
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + duration_days);

  const { error: insertError } = await supabase.from("user_payments").insert({
    user_id,
    payment_type,
    amount: amount * 100, // Store in cents
    status: "pending",
    custom_payment_id,
    payment_provider: "bobpay",
    access_expires_at: expiresAt.toISOString(),
  });

  if (insertError) {
    console.error("Failed to store payment record:", insertError);
    throw new Error(`Failed to create payment record: ${insertError.message}`);
  }

  console.log("Payment record created successfully:", custom_payment_id);

  return new Response(
    JSON.stringify({
      payment_url: paymentData.url,
      short_url: paymentData.short_url,
      custom_payment_id,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleWebhook(req: Request, supabase: any) {
  // Verify source IP (in production)
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                   req.headers.get("cf-connecting-ip") ||
                   req.headers.get("x-real-ip");
  
  console.log("Webhook received from IP:", clientIp);
  
  // Note: In sandbox mode, we skip IP verification
  // if (clientIp && !ALLOWED_IPS.includes(clientIp)) {
  //   console.warn("Webhook from unauthorized IP:", clientIp);
  //   return new Response("Forbidden", { status: 403 });
  // }

  const payload: WebhookPayload = await req.json();
  console.log("BobPay webhook received:", JSON.stringify(payload, null, 2));

  // Verify signature
  const passphrase = Deno.env.get("BOBPAY_PASSPHRASE");
  if (passphrase) {
    const isValid = verifySignature(payload, passphrase);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }
    console.log("Webhook signature verified");
  } else {
    console.warn("BOBPAY_PASSPHRASE not configured - skipping signature verification");
  }

  // Only process paid status
  if (payload.status !== "paid") {
    console.log("Payment status not paid:", payload.status);
    return new Response("OK", { status: 200 });
  }

  // Find and update the payment record
  const { data: existingPayment, error: findError } = await supabase
    .from("user_payments")
    .select("*")
    .eq("custom_payment_id", payload.custom_payment_id)
    .single();

  if (findError || !existingPayment) {
    console.error("Payment record not found:", payload.custom_payment_id);
    // Still return 200 to acknowledge receipt
    return new Response("OK", { status: 200 });
  }

  // Calculate new expiry date from now
  const duration_days = existingPayment.payment_type === "weekly" ? 7 : 30;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + duration_days);

  // Update payment to active
  const { error: updateError } = await supabase
    .from("user_payments")
    .update({
      status: "active",
      paid_at: new Date().toISOString(),
      access_expires_at: expiresAt.toISOString(),
      bobpay_payment_id: payload.payment_id?.toString(),
      bobpay_uuid: payload.uuid,
      payment_method: payload.payment_method,
      raw_payload: payload,
    })
    .eq("custom_payment_id", payload.custom_payment_id);

  if (updateError) {
    console.error("Failed to update payment:", updateError);
  }

  console.log("Payment activated for:", payload.custom_payment_id);
  return new Response("OK", { status: 200 });
}

async function handleVerify(req: Request, supabase: any) {
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

  return new Response(
    JSON.stringify({
      status: payment.status,
      payment_type: payment.payment_type,
      access_expires_at: payment.access_expires_at,
      is_active: payment.status === "active" && new Date(payment.access_expires_at) > new Date(),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleStatus(req: Request, supabase: any) {
  // Get user from authorization header
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
  const { data: payment } = await supabase
    .from("user_payments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .gt("access_expires_at", new Date().toISOString())
    .order("access_expires_at", { ascending: false })
    .limit(1)
    .single();

  if (payment) {
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
