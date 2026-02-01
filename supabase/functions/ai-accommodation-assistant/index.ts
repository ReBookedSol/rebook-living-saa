import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SearchFilters {
  university?: string;
  city?: string;
  province?: string;
  maxCost?: number;
  minCost?: number;
  nsfasAccredited?: boolean;
  genderPolicy?: string;
  amenities?: string[];
}

interface AccommodationResult {
  id: string;
  property_name: string;
  type: string;
  address: string;
  city: string;
  province: string;
  monthly_cost: number;
  nsfas_accredited: boolean;
  gender_policy: string;
  amenities: string[];
  rating: number;
  university: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, query, listings, userPreferences, message, conversationHistory } = body;

    // Verify user has Pro access
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has paid access
    const { data: payments } = await supabase
      .from("user_payments")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["successful", "active"])
      .gte("access_expires_at", new Date().toISOString())
      .limit(1);

    if (!payments || payments.length === 0) {
      return new Response(JSON.stringify({ error: "Pro access required for AI features" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (action) {
      case "search": {
        // Natural language to structured filters
        const filterResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are an accommodation search assistant for South African students. Convert natural language queries into structured search filters.

Available fields:
- university: University name (e.g., "University of Cape Town", "WITS", "Stellenbosch University")
- city: City name (e.g., "Cape Town", "Johannesburg", "Pretoria")
- province: Province name (e.g., "Western Cape", "Gauteng", "KwaZulu-Natal")
- maxCost: Maximum monthly cost in ZAR (number)
- minCost: Minimum monthly cost in ZAR (number)
- nsfasAccredited: true if user mentions NSFAS, bursary, or funding
- genderPolicy: "male", "female", or "mixed"
- amenities: Array of amenities (wifi, parking, laundry, study room, gym, security, furnished, meals, pool)

Return ONLY a valid JSON object with the relevant filters. Do not include fields that weren't mentioned.`
              },
              {
                role: "user",
                content: query
              }
            ],
            temperature: 0.1,
          }),
        });

        if (!filterResponse.ok) {
          throw new Error("Failed to process search query");
        }

        const filterData = await filterResponse.json();
        const filtersText = filterData.choices?.[0]?.message?.content || "{}";
        
        // Parse JSON from response
        let filters: SearchFilters;
        try {
          const jsonMatch = filtersText.match(/\{[\s\S]*\}/);
          filters = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        } catch {
          filters = {};
        }

        // Build Supabase query
        let dbQuery = supabase
          .from("accommodations")
          .select("*")
          .eq("status", "active");

        if (filters.university) {
          dbQuery = dbQuery.ilike("university", `%${filters.university}%`);
        }
        if (filters.city) {
          dbQuery = dbQuery.ilike("city", `%${filters.city}%`);
        }
        if (filters.province) {
          dbQuery = dbQuery.ilike("province", `%${filters.province}%`);
        }
        if (filters.maxCost) {
          dbQuery = dbQuery.lte("monthly_cost", filters.maxCost);
        }
        if (filters.minCost) {
          dbQuery = dbQuery.gte("monthly_cost", filters.minCost);
        }
        if (filters.nsfasAccredited) {
          dbQuery = dbQuery.eq("nsfas_accredited", true);
        }
        if (filters.genderPolicy) {
          dbQuery = dbQuery.eq("gender_policy", filters.genderPolicy);
        }
        if (filters.amenities && filters.amenities.length > 0) {
          dbQuery = dbQuery.contains("amenities", filters.amenities);
        }

        const { data: results, error: dbError } = await dbQuery.limit(20);

        if (dbError) {
          throw dbError;
        }

        // If no results, suggest alternatives
        if (!results || results.length === 0) {
          // Try broader search
          const { data: alternatives } = await supabase
            .from("accommodations")
            .select("*")
            .eq("status", "active")
            .limit(5);

          return new Response(JSON.stringify({
            success: true,
            filters,
            results: [],
            alternatives: alternatives || [],
            message: "No exact matches found. Here are some alternative options.",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          filters,
          results,
          message: `Found ${results.length} accommodations matching your criteria.`,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "explain": {
        // Generate explanation for a listing
        if (!listings || listings.length === 0) {
          return new Response(JSON.stringify({ error: "No listing provided" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const listing = listings[0];
        const explainResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a helpful accommodation assistant for South African students. Provide a clear, concise summary of the accommodation in bullet points.

Include:
- Price and value assessment
- Location benefits
- Key amenities
- NSFAS status if applicable
- Gender policy
- Any standout features

Keep it factual - only use the provided data. Do not invent details or make assumptions about safety/crime.
Format as 4-6 short bullet points.`
              },
              {
                role: "user",
                content: JSON.stringify(listing)
              }
            ],
            temperature: 0.3,
          }),
        });

        const explainData = await explainResponse.json();
        const explanation = explainData.choices?.[0]?.message?.content || "";

        return new Response(JSON.stringify({
          success: true,
          explanation,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "compare": {
        // Compare multiple listings
        if (!listings || listings.length < 2) {
          return new Response(JSON.stringify({ error: "Need at least 2 listings to compare" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const compareResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are an accommodation comparison assistant for South African students. Compare the provided accommodations objectively.

For each listing, provide:
- Key pros (2-3 points)
- Key cons (1-2 points)
- Best for (type of student)

Then provide a brief recommendation based on value for money.

Only use the provided data. Do not invent details or make assumptions about safety/crime.
Keep the comparison balanced and factual.`
              },
              {
                role: "user",
                content: JSON.stringify(listings)
              }
            ],
            temperature: 0.3,
          }),
        });

        const compareData = await compareResponse.json();
        const comparison = compareData.choices?.[0]?.message?.content || "";

        return new Response(JSON.stringify({
          success: true,
          comparison,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "rank": {
        // Rank listings based on user preferences
        if (!listings || listings.length === 0) {
          return new Response(JSON.stringify({ error: "No listings provided" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const rankResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are an accommodation ranking assistant. Rank the provided listings based on the user's preferences.

Consider:
- Price vs. value
- Location relevance
- Amenities match
- NSFAS status if mentioned
- Overall quality indicators

Return a JSON array of listing IDs in order of recommendation, with a brief reason for each.
Format: [{"id": "...", "rank": 1, "reason": "..."}]`
              },
              {
                role: "user",
                content: JSON.stringify({ listings, preferences: userPreferences || query })
              }
            ],
            temperature: 0.2,
          }),
        });

        const rankData = await rankResponse.json();
        const rankingText = rankData.choices?.[0]?.message?.content || "[]";
        
        let rankings;
        try {
          const jsonMatch = rankingText.match(/\[[\s\S]*\]/);
          rankings = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        } catch {
          rankings = [];
        }

        return new Response(JSON.stringify({
          success: true,
          rankings,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "chat": {
        // Conversational chat with accommodation context
        const { message, conversationHistory } = await req.json();

        if (!message) {
          return new Response(JSON.stringify({ error: "No message provided" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get some context from the database if user mentions search terms
        const { data: accommodations } = await supabase
          .from("accommodations")
          .select("*")
          .eq("status", "active")
          .limit(100);

        const chatHistory = [
          {
            role: "system",
            content: `You are a friendly accommodation assistant for South African students. Help them find suitable student accommodation.

Context: You have access to ${accommodations?.length || 0} active listings in our database.

Guidelines:
- Answer questions about finding accommodation
- Provide helpful tips for choosing accommodation
- If they ask about specific criteria, offer to search
- Be conversational and helpful
- Only use factual information from our database
- Don't invent details about accommodations or locations

If they ask for accommodation suggestions, mention you can help search for specific criteria like:
- Budget
- University/location
- Amenities
- NSFAS accreditation
- etc.`,
          },
          ...(conversationHistory || []),
          {
            role: "user",
            content: message,
          },
        ];

        const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: chatHistory,
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!chatResponse.ok) {
          throw new Error("Failed to process chat message");
        }

        const chatData = await chatResponse.json();
        const assistantMessage = chatData.choices?.[0]?.message?.content || "I'm having trouble responding. Please try again.";

        return new Response(JSON.stringify({
          success: true,
          message: assistantMessage,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "validate": {
        // Background validation for admin review
        if (!listings || listings.length === 0) {
          return new Response(JSON.stringify({ error: "No listing provided" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const listing = listings[0];
        const validateResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a data validation assistant. Check the accommodation listing for:
- Missing required fields
- Contradictory information
- Unrealistic values (e.g., price too low/high for area)
- Suspicious patterns

Return a JSON object with:
{
  "valid": boolean,
  "issues": [{"field": "...", "type": "missing|contradiction|unrealistic|suspicious", "description": "..."}],
  "suggestions": ["..."]
}`
              },
              {
                role: "user",
                content: JSON.stringify(listing)
              }
            ],
            temperature: 0.1,
          }),
        });

        const validateData = await validateResponse.json();
        const validationText = validateData.choices?.[0]?.message?.content || "{}";
        
        let validation;
        try {
          const jsonMatch = validationText.match(/\{[\s\S]*\}/);
          validation = jsonMatch ? JSON.parse(jsonMatch[0]) : { valid: true, issues: [], suggestions: [] };
        } catch {
          validation = { valid: true, issues: [], suggestions: [] };
        }

        return new Response(JSON.stringify({
          success: true,
          validation,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("AI Assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
