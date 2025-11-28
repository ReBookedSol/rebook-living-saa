import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header and verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if AI feature is enabled
    const { data: aiSettings } = await supabase
      .from('ai_settings')
      .select('is_enabled')
      .eq('feature_name', 'bursary_pack_generator')
      .single();

    if (!aiSettings?.is_enabled) {
      return new Response(JSON.stringify({ error: 'AI feature is currently disabled' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { preferences } = await req.json();
    
    // Create request tracking
    const { data: requestRecord, error: requestError } = await supabase
      .from('ai_pack_requests')
      .insert({
        user_id: user.id,
        request_data: preferences,
        status: 'processing'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating request record:', requestError);
    }

    // Generate cache key
    const cacheKey = JSON.stringify(preferences);
    
    // Check cache
    const { data: cachedPack } = await supabase
      .from('ai_pack_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedPack) {
      console.log('Returning cached pack');
      
      // Update request status
      if (requestRecord) {
        await supabase
          .from('ai_pack_requests')
          .update({
            status: 'completed',
            response_data: cachedPack.pack_data,
            completed_at: new Date().toISOString()
          })
          .eq('id', requestRecord.id);
      }

      return new Response(JSON.stringify({ pack: cachedPack.pack_data, fromCache: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch accommodations
    let accommodationsQuery = supabase
      .from('accommodations')
      .select('*')
      .eq('status', 'active');

    if (preferences.university) {
      accommodationsQuery = accommodationsQuery.eq('university', preferences.university);
    }
    if (preferences.city) {
      accommodationsQuery = accommodationsQuery.eq('city', preferences.city);
    }
    if (preferences.maxBudget) {
      accommodationsQuery = accommodationsQuery.lte('monthly_cost', preferences.maxBudget);
    }

    const { data: accommodations, error: accomError } = await accommodationsQuery;

    if (accomError) {
      throw new Error(`Failed to fetch accommodations: ${accomError.message}`);
    }

    // Fetch bursaries
    const { data: bursaries, error: bursariesError } = await supabase
      .from('bursaries')
      .select('*')
      .eq('status', 'active');

    if (bursariesError) {
      throw new Error(`Failed to fetch bursaries: ${bursariesError.message}`);
    }

    // Call AI to generate pack
    const systemPrompt = `You are an expert South African student accommodation and bursary advisor. 
Your task is to analyze accommodations and bursaries and create personalized "packs" that match students with:
1. Suitable accommodations that fit their needs and budget
2. Bursaries that can fund those accommodations

For each pack, explain:
- Which bursary covers which costs (tuition, accommodation, books, living stipend)
- Exact amounts and coverage details
- How to apply and important dates
- Why this combination is a good match

Be specific, practical, and encouraging. Focus on actionable information.`;

    const userPrompt = `Student Profile:
${preferences.university ? `University: ${preferences.university}` : ''}
${preferences.city ? `Preferred City: ${preferences.city}` : ''}
${preferences.maxBudget ? `Budget: Up to R${preferences.maxBudget}/month` : ''}
${preferences.fieldOfStudy ? `Field of Study: ${preferences.fieldOfStudy}` : ''}
${preferences.academicPerformance ? `Academic Performance: ${preferences.academicPerformance}` : ''}
${preferences.nsfasEligible ? 'NSFAS Eligible: Yes' : ''}
${preferences.diversity ? `Diversity: ${preferences.diversity}` : ''}

Available Accommodations: ${JSON.stringify(accommodations, null, 2)}

Available Bursaries: ${JSON.stringify(bursaries, null, 2)}

Create 3-5 personalized accommodation + bursary packs. For each pack, provide:
1. Pack name (creative and descriptive)
2. Recommended accommodation with key details
3. Matching bursary with coverage breakdown
4. Total financial picture (what's covered, what student pays)
5. Application strategy and timeline
6. Why this is a good match

Format as JSON array of pack objects.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const packContent = aiData.choices[0].message.content;

    // Parse AI response
    let packs;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = packContent.match(/```json\n([\s\S]*?)\n```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : packContent;
      packs = JSON.parse(jsonContent);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      packs = {
        raw_response: packContent,
        message: 'AI generated a text response instead of structured data'
      };
    }

    // Cache the result (expires in 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await supabase
      .from('ai_pack_cache')
      .upsert({
        cache_key: cacheKey,
        pack_data: packs,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'cache_key'
      });

    // Update request status
    if (requestRecord) {
      await supabase
        .from('ai_pack_requests')
        .update({
          status: 'completed',
          response_data: packs,
          completed_at: new Date().toISOString()
        })
        .eq('id', requestRecord.id);
    }

    return new Response(JSON.stringify({ pack: packs, fromCache: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-bursary-pack:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});