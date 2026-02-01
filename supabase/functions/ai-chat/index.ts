import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  context?: {
    propertyName?: string;
    university?: string;
    location?: string;
    listingId?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has paid access
    const { data: accessLevel } = await supabase.rpc('get_user_access_level', { p_user_id: user.id });
    
    if (accessLevel !== 'paid') {
      return new Response(
        JSON.stringify({ error: 'AI features require Pro access. Please upgrade to use the AI assistant.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationHistory = [], context }: ChatRequest = await req.json();

    // Fetch listing details if we have context
    let listingDetails = "";
    if (context?.listingId) {
      const { data: listing } = await supabase
        .from('accommodations')
        .select('*')
        .eq('id', context.listingId)
        .single();
      
      if (listing) {
        listingDetails = `
Current Listing Context:
- Property Name: ${listing.property_name}
- Type: ${listing.type}
- Address: ${listing.address}, ${listing.city || ''}, ${listing.province || ''}
- University: ${listing.university || 'Not specified'}
- Monthly Cost: R${listing.monthly_cost || 'Not specified'}
- NSFAS Accredited: ${listing.nsfas_accredited ? 'Yes' : 'No'}
- Gender Policy: ${listing.gender_policy || 'Not specified'}
- Amenities: ${listing.amenities?.join(', ') || 'Not specified'}
- Rating: ${listing.rating || 'No rating'}
- Description: ${listing.description || 'No description'}
- Contact: ${listing.contact_email || ''} ${listing.contact_phone || ''}
`;
      }
    } else if (context?.propertyName) {
      listingDetails = `
User is viewing a listing:
- Property: ${context.propertyName}
- University: ${context.university || 'Unknown'}
- Location: ${context.location || 'Unknown'}
`;
    }

    const systemPrompt = `You are a helpful AI assistant for ReBooked Living, a student accommodation platform in South Africa.

Your role:
- Help students find and understand student accommodation options
- Answer questions about listings, amenities, pricing, and locations
- Provide guidance on NSFAS accreditation and bursary requirements
- Explain travel options between accommodations and universities
- Be friendly, concise, and helpful

${listingDetails}

Important guidelines:
- Only use information from the database - never invent facts about properties
- If the user is viewing a specific listing, assume their questions relate to that listing unless specified otherwise
- Be honest if you don't have certain information
- NEVER provide safety or crime advice - direct users to official resources
- Keep responses concise and use markdown formatting for readability
- When discussing prices, always use South African Rand (R)`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI response");
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: assistantMessage 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
