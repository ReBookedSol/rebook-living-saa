import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OfferwallCallbackPayload {
  user_id: string;
  offer_id: string;
  reward_amount: number;
  currency: string;
  signature?: string;
  provider?: string;
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Offerwall callback received');

    // Parse the callback payload
    let payload: OfferwallCallbackPayload;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.text();
      const params = new URLSearchParams(formData);
      payload = Object.fromEntries(params) as unknown as OfferwallCallbackPayload;
    } else {
      // Try parsing as query parameters
      const url = new URL(req.url);
      payload = Object.fromEntries(url.searchParams) as unknown as OfferwallCallbackPayload;
    }

    console.log('Callback payload:', { ...payload, signature: '***' });

    // Normalize user_id - check for common variations
    const userId = payload.user_id || payload.userId || payload['user-id'] || payload.uid;

    if (!userId) {
      console.error('Missing user_id in callback. Payload:', payload);
      return new Response(
        JSON.stringify({ error: 'Missing user_id. Expected: user_id, userId, user-id, or uid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update payload to use normalized user_id
    payload.user_id = userId;

    // TODO: Verify signature from offerwall provider
    // This is crucial for security - implement based on your provider's documentation
    // Example: verifySignature(payload, payload.signature, PROVIDER_SECRET_KEY)

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Record the completion in database
    const { error: insertError } = await supabase
      .from('offerwall_completions')
      .insert({
        user_id: payload.user_id,
        offer_id: payload.offer_id,
        reward_amount: payload.reward_amount || 1,
        currency: payload.currency || 'credits',
        provider: payload.provider || 'unknown',
        raw_payload: payload,
        completed_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error recording completion:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to record completion' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user's credits/rewards
    const { error: updateError } = await supabase.rpc('increment_user_credits', {
      p_user_id: payload.user_id,
      p_amount: payload.reward_amount || 1,
    });

    if (updateError) {
      console.error('Error updating user credits:', updateError);
      // Don't return error here - completion was recorded
    }

    console.log('Offerwall completion processed successfully for user:', payload.user_id);

    return new Response(
      JSON.stringify({ success: true, message: 'Reward processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing offerwall callback:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
