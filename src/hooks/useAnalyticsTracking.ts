 import { useCallback, useRef } from "react";
 import { supabase } from "@/integrations/supabase/client";
 
 interface SearchParams {
   searchQuery?: string;
   university?: string;
   location?: string;
   city?: string;
   province?: string;
   minPrice?: number;
   maxPrice?: number;
   usedNsfasFilter?: boolean;
   usedGenderFilter?: boolean;
   usedAmenitiesFilter?: boolean;
   usedPriceFilter?: boolean;
   genderFilterValue?: string;
   amenitiesFilterValues?: string[];
   resultsCount?: number;
 }
 
 interface ContactParams {
   accommodationId: string;
   contactType: "email" | "phone" | "whatsapp" | "website";
   university?: string;
   city?: string;
   province?: string;
   monthlyCost?: number;
   landlordId?: string;
 }
 
 /**
  * Hook for tracking analytics events:
  * - Search analytics (filters, queries, results)
  * - Contact analytics (email, phone, whatsapp clicks)
  */
 export function useAnalyticsTracking() {
   const sessionIdRef = useRef<string>(
     `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
   );
 
   const trackSearch = useCallback(async (params: SearchParams) => {
     try {
       const { data: { session } } = await supabase.auth.getSession();
       const userId = session?.user?.id || null;
 
       await supabase.from("search_analytics").insert({
         session_id: sessionIdRef.current,
         user_id: userId,
         search_query: params.searchQuery || null,
         university_searched: params.university || null,
         location_searched: params.location || null,
         city_searched: params.city || null,
         province_searched: params.province || null,
         min_price: params.minPrice || null,
         max_price: params.maxPrice || null,
         used_nsfas_filter: params.usedNsfasFilter || false,
         used_gender_filter: params.usedGenderFilter || false,
         used_amenities_filter: params.usedAmenitiesFilter || false,
         used_price_filter: params.usedPriceFilter || false,
         gender_filter_value: params.genderFilterValue || null,
         amenities_filter_values: params.amenitiesFilterValues || null,
         results_count: params.resultsCount || 0,
       });
     } catch (err) {
       console.debug("Failed to track search:", err);
     }
   }, []);
 
   const trackContact = useCallback(async (params: ContactParams) => {
     try {
       const { data: { session } } = await supabase.auth.getSession();
       const userId = session?.user?.id || null;
 
       // Insert into contact_analytics table
       await supabase.from("contact_analytics").insert({
         session_id: sessionIdRef.current,
         user_id: userId,
         accommodation_id: params.accommodationId,
         contact_type: params.contactType,
         university: params.university || null,
         city: params.city || null,
         province: params.province || null,
         monthly_cost: params.monthlyCost || null,
         landlord_id: params.landlordId || null,
       });
 
       // Also increment listing_analytics_daily
       await supabase.rpc("increment_contact_analytics", {
         p_accommodation_id: params.accommodationId,
         p_contact_type: params.contactType,
       });
 
       // Increment clicks in listing_analytics
       await supabase.rpc("increment_listing_analytics", {
         p_accommodation_id: params.accommodationId,
         p_field: "clicks",
       });
     } catch (err) {
       console.debug("Failed to track contact:", err);
     }
   }, []);
 
   const trackListingOpened = useCallback(async (
     searchAnalyticsId: string | null,
     listingId: string
   ) => {
     if (!searchAnalyticsId) return;
     
     try {
       await supabase
         .from("search_analytics")
         .update({ listing_opened_id: listingId })
         .eq("id", searchAnalyticsId);
     } catch (err) {
       console.debug("Failed to track listing opened:", err);
     }
   }, []);
 
   return {
     trackSearch,
     trackContact,
     trackListingOpened,
     sessionId: sessionIdRef.current,
   };
 }