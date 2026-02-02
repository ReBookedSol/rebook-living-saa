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

// MyCiTi stations for Cape Town
const MYCITI_STATIONS = [
  { name: 'Civic Centre', lat: -33.9198, lng: 18.4240, nearbyUniversities: ['UCT', 'CPUT'] },
  { name: 'Waterfront', lat: -33.9035, lng: 18.4200, nearbyUniversities: [] },
  { name: 'Table View', lat: -33.8280, lng: 18.4880, nearbyUniversities: [] },
  { name: 'Century City', lat: -33.8890, lng: 18.5120, nearbyUniversities: [] },
];

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function findNearestGautrainStation(lat: number, lng: number) {
  let nearest = GAUTRAIN_STATIONS[0];
  let minDistance = calculateDistance(lat, lng, nearest.lat, nearest.lng);
  
  for (const station of GAUTRAIN_STATIONS) {
    const distance = calculateDistance(lat, lng, station.lat, station.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = station;
    }
  }
  
  return { station: nearest, distance: minDistance };
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
      .order('rating', { ascending: false });

    if (accError) {
      console.error("Error fetching accommodations:", accError);
      throw new Error("Failed to fetch accommodations");
    }

    // Add travel info to accommodations
    const accommodationsWithTravel = allAccommodations?.map(acc => {
      // Try to geocode the address (simplified - in production use a geocoding API)
      let travelInfo = "";
      
      // Check if in Gauteng
      if (acc.province?.toLowerCase().includes('gauteng') || 
          acc.city?.toLowerCase().includes('pretoria') || 
          acc.city?.toLowerCase().includes('johannesburg')) {
        
        // Find nearest Gautrain station based on city/area
        if (acc.city?.toLowerCase().includes('hatfield')) {
          travelInfo = "Near Hatfield Gautrain Station (~5 min walk). Direct train to Park Station (Wits/UJ).";
        } else if (acc.city?.toLowerCase().includes('pretoria') || acc.address?.toLowerCase().includes('pretoria')) {
          travelInfo = "Near Pretoria Gautrain Station. Good access to TUT and UNISA campuses.";
        } else if (acc.city?.toLowerCase().includes('midrand')) {
          travelInfo = "Near Midrand Gautrain Station. Connects to Pretoria and Johannesburg.";
        } else if (acc.city?.toLowerCase().includes('sandton')) {
          travelInfo = "Near Sandton Gautrain Station. Easy access to business district.";
        } else if (acc.city?.toLowerCase().includes('johannesburg') || acc.city?.toLowerCase().includes('braamfontein')) {
          travelInfo = "Near Park Station Gautrain. Walking distance to Wits and UJ Auckland Park.";
        } else if (acc.city?.toLowerCase().includes('soshanguve')) {
          travelInfo = "PUTCO bus routes available to Pretoria CBD and TUT campuses.";
        }
      }
      // Check if in Western Cape
      else if (acc.province?.toLowerCase().includes('cape') || 
               acc.city?.toLowerCase().includes('cape town')) {
        if (acc.city?.toLowerCase().includes('rondebosch') || acc.address?.toLowerCase().includes('uct')) {
          travelInfo = "Close to UCT campus. MyCiTi bus connections to CBD via Civic Centre.";
        } else if (acc.city?.toLowerCase().includes('bellville')) {
          travelInfo = "Near CPUT Bellville campus. Train and MyCiTi bus connections available.";
        } else {
          travelInfo = "MyCiTi bus network available for city-wide transport.";
        }
      }

      return { ...acc, travelInfo };
    }) || [];

    // Build system prompt with comprehensive knowledge
    const systemPrompt = `You are ReBooked's AI Accommodation Assistant, helping South African students find the perfect accommodation near their universities.

KNOWLEDGE BASE:
You have access to ${accommodationsWithTravel.length} active accommodation listings.

TRANSPORT KNOWLEDGE:
- GAUTRAIN: High-speed rail in Gauteng connecting Hatfield (UP) → Pretoria → Centurion → Midrand → Marlboro → Sandton → Rosebank → Park Station (Wits/UJ). Fares: R76-R124. Hours: 5:30 AM - 8:30 PM.
- PUTCO BUS: Affordable bus service in Gauteng. Soshanguve routes (S101-S120) connect to Pretoria CBD. Ekangala routes (E201-E224) for Mpumalanga students. Fares: R15-R45.
- MyCiTi (Cape Town): BRT system. Trunk routes T01-T04, Direct routes D01-D08. Fares: R8-R22.
- MINIBUS TAXIS: Cheapest option (R12-R35), very frequent, available everywhere.
- UBER/BOLT: On-demand, R50-R200 depending on distance.

UNIVERSITY LOCATIONS:
- University of Pretoria (UP): Near Hatfield Gautrain
- Wits University: Near Park Station Gautrain
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

ACCOMMODATION DATA:
${JSON.stringify(accommodationsWithTravel.slice(0, 50), null, 2)}

GUIDELINES:
1. Always recommend specific listings from the database when possible
2. Include travel/transport information when relevant
3. Mention NSFAS accreditation if the student asks about funding
4. Consider proximity to campus and transport links
5. Be friendly, helpful, and concise
6. If no exact matches, suggest alternatives and explain why
7. For comparisons, highlight key differences and make a recommendation`;

    let userPrompt = "";
    
    switch (action) {
      case "search":
        userPrompt = `A student is searching for accommodation with this query: "${query}"

Parse their requirements and find the best matching listings. Consider:
- Location/university mentioned
- Budget constraints
- Specific amenities needed
- NSFAS requirements
- Gender preferences
- Transport accessibility

Return a JSON response with:
{
  "success": true,
  "filters": { extracted filters from query },
  "results": [ array of matching accommodation objects with id, property_name, type, address, city, province, monthly_cost, nsfas_accredited, amenities, rating, university, travelInfo ],
  "alternatives": [ if no exact matches, suggest alternatives ],
  "message": "Brief explanation of results"
}`;
        break;
        
      case "explain":
        userPrompt = `Provide a detailed analysis of this accommodation listing:
${JSON.stringify(listings[0], null, 2)}

Include:
1. Location advantages/disadvantages
2. Value for money assessment
3. Transport options and commute times to nearby universities
4. Suitability for different student types
5. Any concerns or highlights

Return as plain text explanation.`;
        break;
        
      case "compare":
        userPrompt = `Compare these ${listings.length} accommodation listings:
${JSON.stringify(listings, null, 2)}

Create a comprehensive comparison covering:
1. Price comparison and value
2. Location and transport access
3. Amenities and features
4. Pros and cons of each
5. Your recommendation based on different student needs

Return as plain text with clear sections.`;
        break;

      case "chat":
        // Free-form chat about the current listing or general questions
        const currentAccommodation = accommodationId 
          ? accommodationsWithTravel.find(a => a.id === accommodationId)
          : null;
        
        userPrompt = `${currentAccommodation ? `The student is viewing this listing:
${JSON.stringify(currentAccommodation, null, 2)}

` : ''}Student's question: "${message}"

Provide a helpful, conversational response. If they're asking about:
- This specific listing: Give relevant details about location, transport, pricing
- Finding accommodation: Suggest specific listings from our database
- Transport: Explain Gautrain, PUTCO, MyCiTi options based on their area
- General advice: Be helpful and informative

Keep responses concise but informative.`;
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
        max_tokens: 2000,
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

    // For search action, try to parse JSON response
    if (action === "search") {
      try {
        // Extract JSON from markdown code blocks if present
        let jsonContent = content;
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }
        
        const parsed = JSON.parse(jsonContent);
        return new Response(
          JSON.stringify(parsed),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch {
        // If JSON parsing fails, return structured response with the raw content
        return new Response(
          JSON.stringify({
            success: true,
            results: [],
            message: content,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // For explain, compare, and chat actions
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
      return new Response(
        JSON.stringify({ success: true, response: content }),
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
