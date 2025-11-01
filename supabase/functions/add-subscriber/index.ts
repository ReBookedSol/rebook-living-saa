import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriberData {
  email: string;
  firstname?: string;
  lastname?: string;
  groups?: string[];
  fields?: Record<string, any>;
}

serve(async (req) => {
  console.log(`${req.method} request to add-subscriber function`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const senderApiKey = Deno.env.get('SENDER_API_KEY');
    console.log('SENDER_API_KEY available:', !!senderApiKey);
    
    if (!senderApiKey) {
      console.error('SENDER_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'Sender API key not configured' }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestBody = await req.text();
    console.log('Request body:', requestBody);
    
    const { email, firstname, lastname, groups, fields }: SubscriberData = JSON.parse(requestBody);

    if (!email) {
      console.error('Email is missing from request');
      return new Response(
        JSON.stringify({ error: 'Email is required' }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Processing subscriber:', { email, firstname, lastname });

    // Prepare the data for Sender.net API
    const subscriberData: any = {
      email,
      trigger_automation: true
    };

    if (firstname) subscriberData.firstname = firstname;
    if (lastname) subscriberData.lastname = lastname;
    if (groups && groups.length > 0) subscriberData.groups = groups;
    if (fields) subscriberData.fields = fields;

    console.log('Sending to Sender.net API:', JSON.stringify(subscriberData, null, 2));

    // Make request to Sender.net API
    const response = await fetch('https://api.sender.net/v2/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${senderApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(subscriberData),
    });

    const responseText = await response.text();
    console.log('Sender.net API response status:', response.status);
    console.log('Sender.net API response:', responseText);

    if (!response.ok) {
      let errorMessage = 'Failed to add subscriber';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('Sender.net API error:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', e);
        errorMessage = responseText || errorMessage;
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: response.status 
        }), 
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('Parsed successful response:', result);
    } catch (e) {
      console.log('Response not JSON, treating as success');
      result = { message: 'Subscriber added successfully', data: responseText };
    }

    // Save subscriber to Supabase database (newsletter_subscribers)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

      // Check if subscriber already exists
      const { data: existing, error: selectError } = await supabase
        .from('newsletter_subscribers')
        .select('id, first_name, last_name, is_active')
        .eq('email', email)
        .maybeSingle();

      if (selectError) {
        console.error('Select subscriber error:', selectError);
      }

      if (existing) {
        const updatePayload: Record<string, any> = {
          is_active: true,
          unsubscribed_at: null,
        };
        if (firstname) updatePayload.first_name = firstname;
        if (lastname) updatePayload.last_name = lastname;

        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update(updatePayload)
          .eq('id', existing.id);
        if (updateError) console.error('Update subscriber error:', updateError);
      } else {
        const { error: insertError } = await supabase
          .from('newsletter_subscribers')
          .insert({
            email,
            first_name: firstname || null,
            last_name: lastname || null,
            is_active: true,
          });
        if (insertError) console.error('Insert subscriber error:', insertError);
      }

      console.log('Subscriber saved/updated in Supabase');
    } catch (dbError) {
      console.error('Failed to save subscriber in Supabase:', dbError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Subscriber added successfully',
        data: result 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in add-subscriber function:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Internal server error' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});