import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Gautrain stations data for travel recommendations
const GAUTRAIN_STATIONS = [
  { name: 'Hatfield', lat: -25.7500, lng: 28.2380, nearbyUniversities: ['University of Pretoria', 'UP'] },
  { name: 'Pretoria', lat: -25.7536, lng: 28.1893, nearbyUniversities: ['TUT Pretoria', 'UNISA'] },
  { name: 'Centurion', lat: -25.8510, lng: 28.1893, nearbyUniversities: [] },
  { name: 'Midrand', lat: -25.9930, lng: 28.1264, nearbyUniversities: ['Midrand Graduate Institute'] },
  { name: 'Marlboro', lat: -26.0862, lng: 28.1097, nearbyUniversities: [] },
  { name: 'Sandton', lat: -26.1076, lng: 28.0567, nearbyUniversities: ['Wits Business School'] },
  { name: 'Rosebank', lat: -26.1455, lng: 28.0436, nearbyUniversities: [] },
  { name: 'Park Station', lat: -26.1960, lng: 28.0410, nearbyUniversities: ['Wits University', 'UJ Auckland Park', 'UJ Doornfontein'] },
  { name: 'Rhodesfield', lat: -26.1380, lng: 28.2167, nearbyUniversities: [] },
  { name: 'OR Tambo International', lat: -26.1367, lng: 28.2350, nearbyUniversities: [] },
];

interface Accommodation {
  id: string;
  property_name: string;
  type: string;
  address: string;
  city: string | null;
  province: string | null;
  monthly_cost: number | null;
  nsfas_accredited: boolean | null;
  gender_policy: string | null;
  amenities: string[] | null;
  rating: number | null;
  university: string | null;
  rooms_available: number | null;
  travelInfo?: string;
}

function addTravelInfo(acc: Accommodation): Accommodation {
  let travelInfo = "";
  const cityLower = acc.city?.toLowerCase() || "";
  const addressLower = acc.address?.toLowerCase() || "";
  const provinceLower = acc.province?.toLowerCase() || "";
  
  // Check if in Gauteng
  if (provinceLower.includes('gauteng') || cityLower.includes('pretoria') || cityLower.includes('johannesburg')) {
    if (cityLower.includes('hatfield') || addressLower.includes('hatfield')) {
      travelInfo = "Near Hatfield Gautrain Station (~5 min walk). Direct train to Park Station (Wits/UJ).";
    } else if (cityLower.includes('pretoria') || addressLower.includes('pretoria')) {
      travelInfo = "Near Pretoria Gautrain Station. Good access to TUT and UNISA campuses.";
    } else if (cityLower.includes('midrand')) {
      travelInfo = "Near Midrand Gautrain Station. Connects to Pretoria and Johannesburg.";
    } else if (cityLower.includes('sandton')) {
      travelInfo = "Near Sandton Gautrain Station. Easy access to business district.";
    } else if (cityLower.includes('johannesburg') || cityLower.includes('braamfontein')) {
      travelInfo = "Near Park Station Gautrain. Walking distance to Wits and UJ Auckland Park.";
    } else if (cityLower.includes('soshanguve')) {
      travelInfo = "PUTCO bus routes available to Pretoria CBD and TUT campuses.";
    } else if (cityLower.includes('centurion')) {
      travelInfo = "Near Centurion Gautrain Station. Easy access to Pretoria and Johannesburg.";
    }
  }
  // Check if in Western Cape
  else if (provinceLower.includes('cape') || cityLower.includes('cape town')) {
    if (cityLower.includes('rondebosch') || addressLower.includes('uct')) {
      travelInfo = "Close to UCT campus. MyCiTi bus connections to CBD via Civic Centre.";
    } else if (cityLower.includes('bellville')) {
      travelInfo = "Near CPUT Bellville campus. Train and MyCiTi bus connections available.";
    } else {
      travelInfo = "MyCiTi bus network available for city-wide transport.";
    }
  }

  return { ...acc, travelInfo };
}

function formatAccommodationForDisplay(acc: Accommodation): string {
  let display = `**${acc.property_name}**`;
  if (acc.city) display += ` - ${acc.city}`;
  if (acc.monthly_cost) display += ` | R${acc.monthly_cost.toLocaleString()}/mo`;
  if (acc.nsfas_accredited) display += " | NSFAS ✓";
  if (acc.rating && acc.rating > 0) display += ` | ⭐${acc.rating.toFixed(1)}`;
  if (acc.travelInfo) display += `\n  📍 ${acc.travelInfo}`;
  display += `\n  🔗 View: /listing/${acc.id}`;
  return display;
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

    const { action, query, listings, accommodationId, message } = await req.json();
    console.log("AI Assistant request:", { action, query, accommodationId });

    // Fetch all accommodations for context
    const { data: allAccommodations, error: accError } = await supabase
      .from('accommodations')
      .select('id, property_name, type, address, city, province, monthly_cost, nsfas_accredited, gender_policy, amenities, rating, university, rooms_available')
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .limit(100);

    if (accError) {
      console.error("Error fetching accommodations:", accError);
      throw new Error("Failed to fetch accommodations");
    }

    // Add travel info to accommodations
    const accommodationsWithTravel = (allAccommodations || []).map(addTravelInfo);

    // Build system prompt with comprehensive knowledge
    const systemPrompt = `You are ReBooked's AI Accommodation Assistant, helping South African students find the perfect accommodation near their universities.

You have access to ${accommodationsWithTravel.length} active accommodation listings in the database.

IMPORTANT RULES:
1. When users ask for accommodation recommendations, ALWAYS include specific listings from the database
2. Format each recommendation clearly with property name, location, price, and key features
3. Include the listing ID so users can view more details
4. Consider transport options when making recommendations

TRANSPORT KNOWLEDGE:
- GAUTRAIN: High-speed rail in Gauteng connecting Hatfield (UP) → Pretoria → Centurion → Midrand → Marlboro → Sandton → Rosebank → Park Station (Wits/UJ). Fares: R76-R124. Hours: 5:30 AM - 8:30 PM.
- PUTCO BUS: Affordable bus service in Gauteng. Soshanguve routes (S101-S120) connect to Pretoria CBD. Ekangala routes (E201-E224) for Mpumalanga students. Fares: R15-R45.
- MyCiTi (Cape Town): BRT system. Trunk routes T01-T04, Direct routes D01-D08. Fares: R8-R22.
- MINIBUS TAXIS: Cheapest option (R12-R35), very frequent, available everywhere.
- UBER/BOLT: On-demand, R50-R200 depending on distance.

UNIVERSITY LOCATIONS:
- University of Pretoria (UP): Hatfield area, near Hatfield Gautrain
- Wits University: Braamfontein, near Park Station Gautrain
- UJ Auckland Park: Near Park Station Gautrain  
- TUT Pretoria: Near Pretoria Gautrain
- TUT Soshanguve: PUTCO bus access
- UNISA Muckleneuk: Near Pretoria Gautrain
- UCT: Rondebosch, MyCiTi access
- Stellenbosch: Own transport recommended
- CPUT: Multiple campuses, MyCiTi access

PRICING GUIDELINES:
- Budget: Under R3,000/month
- Mid-range: R3,000-R5,000/month  
- Premium: R5,000+/month

RESPONSE FORMAT:
When recommending accommodations, use this format:
1. Brief intro addressing the user's needs
2. List 3-5 relevant accommodations with details
3. Transport tips for the area
4. Invitation to ask follow-up questions`;

    let userPrompt = "";
    let accommodationList = "";
    
    // Create a formatted list of relevant accommodations for the AI to reference
    const top30Accommodations = accommodationsWithTravel.slice(0, 30);
    accommodationList = top30Accommodations.map(acc => 
      `ID: ${acc.id} | ${acc.property_name} | ${acc.city || 'Unknown'} | R${acc.monthly_cost || 'N/A'}/mo | ${acc.nsfas_accredited ? 'NSFAS' : 'Not NSFAS'} | ${acc.type} | Rating: ${acc.rating || 'N/A'} | University: ${acc.university || 'Any'}`
    ).join('\n');
    
    switch (action) {
      case "search":
        userPrompt = `A student is searching for accommodation with this query: "${query}"

Here are the available accommodations in the database:
${accommodationList}

Please:
1. Identify the student's requirements (location, budget, university, NSFAS, etc.)
2. Select the BEST matching accommodations from the list above
3. Format your response as a helpful recommendation with specific listings

Include the listing IDs so the student can view more details. Be specific and helpful!`;
        break;
        
      case "explain":
        const listingToExplain = listings?.[0];
        userPrompt = `Provide a detailed analysis of this accommodation:
${JSON.stringify(listingToExplain, null, 2)}

Include:
1. Location advantages/disadvantages
2. Value for money assessment
3. Transport options and commute times to nearby universities
4. Suitability for different student types
5. Any concerns or highlights`;
        break;
        
      case "compare":
        userPrompt = `Compare these ${listings?.length || 0} accommodation listings:
${JSON.stringify(listings, null, 2)}

Create a comprehensive comparison covering:
1. Price comparison and value
2. Location and transport access
3. Amenities and features
4. Pros and cons of each
5. Your recommendation based on different student needs`;
        break;

      case "chat":
        // Free-form chat about the current listing or general questions
        const currentAccommodation = accommodationId 
          ? accommodationsWithTravel.find(a => a.id === accommodationId)
          : null;
        
        userPrompt = `${currentAccommodation ? `The student is viewing this listing:
${JSON.stringify(currentAccommodation, null, 2)}

` : ''}Student's question: "${message}"

Available accommodations for reference:
${accommodationList}

IMPORTANT: If they're asking about finding accommodation, ALWAYS include specific listings from the database above with their IDs.

Provide a helpful response that:
1. Directly answers their question
2. Includes relevant listings if they're looking for accommodation
3. Mentions transport options if location is relevant
4. Keeps the response conversational but informative`;
        break;
        
      default:
        throw new Error("Invalid action");
    }

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error("AI service error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // For search action, try to parse and structure the response
    if (action === "search") {
      // Extract mentioned listing IDs from the response
      const idMatches = content.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
      const mentionedIds = idMatches ? [...new Set(idMatches)] : [];
      
      // Get the full listing data for mentioned IDs
      const results = accommodationsWithTravel.filter(acc => mentionedIds.includes(acc.id));
      
      return new Response(
        JSON.stringify({
          success: true,
          results: results.slice(0, 5),
          message: content,
          filters: {},
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "explain") {
      return new Response(
        JSON.stringify({ success: true, explanation: content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "compare") {
      return new Response(
        JSON.stringify({ success: true, comparison: content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "chat") {
      // Extract mentioned listing IDs from the response for chat as well
      const idMatches = content.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
      const mentionedIds = idMatches ? [...new Set(idMatches)] : [];
      const results = accommodationsWithTravel.filter(acc => mentionedIds.includes(acc.id));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          response: content,
          listings: results.slice(0, 5),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, response: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI Assistant error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
