export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          accreditation_number: string | null
          added_by: string | null
          address: string
          amenities: string[] | null
          certified_universities: string[] | null
          city: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          gender_policy: string | null
          id: string
          image_urls: string[] | null
          is_landlord_listing: boolean | null
          landlord_id: string | null
          monthly_cost: number | null
          nsfas_accredited: boolean | null
          property_name: string
          province: string | null
          rating: number | null
          rooms_available: number | null
          status: string | null
          type: string
          units: number | null
          university: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          accreditation_number?: string | null
          added_by?: string | null
          address: string
          amenities?: string[] | null
          certified_universities?: string[] | null
          city?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          gender_policy?: string | null
          id?: string
          image_urls?: string[] | null
          is_landlord_listing?: boolean | null
          landlord_id?: string | null
          monthly_cost?: number | null
          nsfas_accredited?: boolean | null
          property_name: string
          province?: string | null
          rating?: number | null
          rooms_available?: number | null
          status?: string | null
          type: string
          units?: number | null
          university?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          accreditation_number?: string | null
          added_by?: string | null
          address?: string
          amenities?: string[] | null
          certified_universities?: string[] | null
          city?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          gender_policy?: string | null
          id?: string
          image_urls?: string[] | null
          is_landlord_listing?: boolean | null
          landlord_id?: string | null
          monthly_cost?: number | null
          nsfas_accredited?: boolean | null
          property_name?: string
          province?: string | null
          rating?: number | null
          rooms_available?: number | null
          status?: string | null
          type?: string
          units?: number | null
          university?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          accommodation_id: string | null
          created_at: string
          duration_seconds: number | null
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          accommodation_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          accommodation_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          admin_id: string
          created_at: string | null
          flagged_content_id: string
          id: string
          is_read: boolean | null
          notification_type: string | null
          read_at: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          flagged_content_id: string
          id?: string
          is_read?: boolean | null
          notification_type?: string | null
          read_at?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          flagged_content_id?: string
          id?: string
          is_read?: boolean | null
          notification_type?: string | null
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_flagged_content_id_fkey"
            columns: ["flagged_content_id"]
            isOneToOne: false
            referencedRelation: "flagged_content"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_pack_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          expires_at: string
          id: string
          pack_data: Json
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          expires_at: string
          id?: string
          pack_data: Json
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          pack_data?: Json
        }
        Relationships: []
      }
      ai_pack_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          request_data: Json
          response_data: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          request_data: Json
          response_data?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          request_data?: Json
          response_data?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          feature_name: string
          id: string
          is_enabled: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          email: string | null
          id: string
          ip_address: string | null
          status: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          email?: string | null
          id?: string
          ip_address?: string | null
          status: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          email?: string | null
          id?: string
          ip_address?: string | null
          status?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blocked_emails: {
        Row: {
          blocked_at: string
          blocked_by: string | null
          blocked_ip: string | null
          email: string
          expires_at: string | null
          id: string
          is_permanent: boolean
          reason: string | null
        }
        Insert: {
          blocked_at?: string
          blocked_by?: string | null
          blocked_ip?: string | null
          email: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean
          reason?: string | null
        }
        Update: {
          blocked_at?: string
          blocked_by?: string | null
          blocked_ip?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean
          reason?: string | null
        }
        Relationships: []
      }
      blocked_ips: {
        Row: {
          blocked_at: string
          blocked_by: string | null
          expires_at: string | null
          id: string
          ip_address: string
          is_permanent: boolean
          reason: string | null
        }
        Insert: {
          blocked_at?: string
          blocked_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          is_permanent?: boolean
          reason?: string | null
        }
        Update: {
          blocked_at?: string
          blocked_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_permanent?: boolean
          reason?: string | null
        }
        Relationships: []
      }
      bursaries: {
        Row: {
          amount: string | null
          application_process: string | null
          closing_date: string | null
          coverage_details: Json | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          opening_date: string | null
          provider: string | null
          qualifications: string | null
          required_documents: string[] | null
          requirements: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: string | null
          application_process?: string | null
          closing_date?: string | null
          coverage_details?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          opening_date?: string | null
          provider?: string | null
          qualifications?: string | null
          required_documents?: string[] | null
          requirements?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: string | null
          application_process?: string | null
          closing_date?: string | null
          coverage_details?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          opening_date?: string | null
          provider?: string | null
          qualifications?: string | null
          required_documents?: string[] | null
          requirements?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_analytics: {
        Row: {
          accommodation_id: string
          city: string | null
          contact_type: string
          created_at: string
          id: string
          landlord_id: string | null
          monthly_cost: number | null
          province: string | null
          session_id: string | null
          university: string | null
          user_id: string | null
        }
        Insert: {
          accommodation_id: string
          city?: string | null
          contact_type: string
          created_at?: string
          id?: string
          landlord_id?: string | null
          monthly_cost?: number | null
          province?: string | null
          session_id?: string | null
          university?: string | null
          user_id?: string | null
        }
        Update: {
          accommodation_id?: string
          city?: string | null
          contact_type?: string
          created_at?: string
          id?: string
          landlord_id?: string | null
          monthly_cost?: number | null
          province?: string | null
          session_id?: string | null
          university?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_analytics_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      edge_function_errors: {
        Row: {
          created_at: string
          error_code: string | null
          error_details: string | null
          error_hint: string | null
          error_message: string
          first_seen_at: string
          function_name: string
          id: string
          is_resolved: boolean
          last_seen_at: string
          occurrence_count: number
          resolved_at: string | null
          resolved_by: string | null
          severity: string
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          error_details?: string | null
          error_hint?: string | null
          error_message: string
          first_seen_at?: string
          function_name: string
          id?: string
          is_resolved?: boolean
          last_seen_at?: string
          occurrence_count?: number
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Update: {
          created_at?: string
          error_code?: string | null
          error_details?: string | null
          error_hint?: string | null
          error_message?: string
          first_seen_at?: string
          function_name?: string
          id?: string
          is_resolved?: boolean
          last_seen_at?: string
          occurrence_count?: number
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          accommodation_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          accommodation_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          accommodation_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      flagged_content: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          flag_type: string
          flagged_by: string
          id: string
          reason: string
          reply_id: string | null
          review_id: string | null
          reviewed_at: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          flag_type: string
          flagged_by: string
          id?: string
          reason: string
          reply_id?: string | null
          review_id?: string | null
          reviewed_at?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          flag_type?: string
          flagged_by?: string
          id?: string
          reason?: string
          reply_id?: string | null
          review_id?: string | null
          reviewed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flagged_content_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "review_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flagged_content_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      landlord_documents: {
        Row: {
          document_name: string
          document_type: string
          file_size: number | null
          id: string
          landlord_listing_id: string
          mime_type: string | null
          storage_path: string
          uploaded_at: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_name: string
          document_type: string
          file_size?: number | null
          id?: string
          landlord_listing_id: string
          mime_type?: string | null
          storage_path: string
          uploaded_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string
          file_size?: number | null
          id?: string
          landlord_listing_id?: string
          mime_type?: string | null
          storage_path?: string
          uploaded_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landlord_documents_landlord_listing_id_fkey"
            columns: ["landlord_listing_id"]
            isOneToOne: false
            referencedRelation: "landlord_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      landlord_listings: {
        Row: {
          accommodation_id: string
          admin_notes: string | null
          created_at: string
          id: string
          landlord_id: string
          payment_status: string
          published_at: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          submission_status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          accommodation_id: string
          admin_notes?: string | null
          created_at?: string
          id?: string
          landlord_id: string
          payment_status?: string
          published_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submission_status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          accommodation_id?: string
          admin_notes?: string | null
          created_at?: string
          id?: string
          landlord_id?: string
          payment_status?: string
          published_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submission_status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landlord_listings_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: true
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      landlord_subscriptions: {
        Row: {
          additional_listing_fee: number
          base_amount: number
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          max_free_listings: number
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          plan_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_listing_fee?: number
          base_amount?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          max_free_listings?: number
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_listing_fee?: number
          base_amount?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          max_free_listings?: number
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listing_analytics: {
        Row: {
          accommodation_id: string
          clicks: number
          created_at: string
          date: string
          favorites: number
          id: string
          shares: number
          views: number
        }
        Insert: {
          accommodation_id: string
          clicks?: number
          created_at?: string
          date?: string
          favorites?: number
          id?: string
          shares?: number
          views?: number
        }
        Update: {
          accommodation_id?: string
          clicks?: number
          created_at?: string
          date?: string
          favorites?: number
          id?: string
          shares?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_analytics_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_analytics_daily: {
        Row: {
          accommodation_id: string
          avg_time_seconds: number | null
          clicks: number | null
          created_at: string
          date: string
          email_clicks: number | null
          favorites: number | null
          id: string
          messages: number | null
          phone_clicks: number | null
          shares: number | null
          unique_views: number | null
          updated_at: string
          views: number | null
          website_clicks: number | null
          whatsapp_clicks: number | null
        }
        Insert: {
          accommodation_id: string
          avg_time_seconds?: number | null
          clicks?: number | null
          created_at?: string
          date?: string
          email_clicks?: number | null
          favorites?: number | null
          id?: string
          messages?: number | null
          phone_clicks?: number | null
          shares?: number | null
          unique_views?: number | null
          updated_at?: string
          views?: number | null
          website_clicks?: number | null
          whatsapp_clicks?: number | null
        }
        Update: {
          accommodation_id?: string
          avg_time_seconds?: number | null
          clicks?: number | null
          created_at?: string
          date?: string
          email_clicks?: number | null
          favorites?: number | null
          id?: string
          messages?: number | null
          phone_clicks?: number | null
          shares?: number | null
          unique_views?: number | null
          updated_at?: string
          views?: number | null
          website_clicks?: number | null
          whatsapp_clicks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_analytics_daily_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          name: string | null
          read: boolean | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          read?: boolean | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          read?: boolean | null
          subject?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          accommodation_id: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          target_user_id: string | null
          title: string
          type: string
        }
        Insert: {
          accommodation_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          target_user_id?: string | null
          title: string
          type?: string
        }
        Update: {
          accommodation_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          target_user_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      offerwall_completions: {
        Row: {
          completed_at: string
          created_at: string
          currency: string
          id: string
          offer_id: string
          provider: string | null
          raw_payload: Json | null
          reward_amount: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          currency?: string
          id?: string
          offer_id: string
          provider?: string | null
          raw_payload?: Json | null
          reward_amount?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          currency?: string
          id?: string
          offer_id?: string
          provider?: string | null
          raw_payload?: Json | null
          reward_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      place_cache: {
        Row: {
          attributions: string | null
          cached_at: string
          cached_tier: string
          created_at: string
          photo_count: number
          photo_uris: string[] | null
          place_id: string
          review_count: number
          reviews: Json | null
          updated_at: string
        }
        Insert: {
          attributions?: string | null
          cached_at?: string
          cached_tier?: string
          created_at?: string
          photo_count?: number
          photo_uris?: string[] | null
          place_id: string
          review_count?: number
          reviews?: Json | null
          updated_at?: string
        }
        Update: {
          attributions?: string | null
          cached_at?: string
          cached_tier?: string
          created_at?: string
          photo_count?: number
          photo_uris?: string[] | null
          place_id?: string
          review_count?: number
          reviews?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      place_cache_analytics: {
        Row: {
          api_calls_saved: number
          cache_hits: number
          cache_misses: number
          created_at: string
          date: string
          id: string
          updated_at: string
        }
        Insert: {
          api_calls_saved?: number
          cache_hits?: number
          cache_misses?: number
          created_at?: string
          date?: string
          id?: string
          updated_at?: string
        }
        Update: {
          api_calls_saved?: number
          cache_hits?: number
          cache_misses?: number
          created_at?: string
          date?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      private_institutions: {
        Row: {
          abbreviation: string | null
          created_at: string | null
          id: string
          locations: string[] | null
          name: string
          programs: Json | null
          updated_at: string | null
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string | null
          id: string
          locations?: string[] | null
          name: string
          programs?: Json | null
          updated_at?: string | null
        }
        Update: {
          abbreviation?: string | null
          created_at?: string | null
          id?: string
          locations?: string[] | null
          name?: string
          programs?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          credits: number
          diversity: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          university: string | null
        }
        Insert: {
          created_at?: string | null
          credits?: number
          diversity?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          university?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number
          diversity?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          university?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          application_details: Json | null
          aps_requirement: number | null
          career_prospects: Json | null
          created_at: string
          description: string | null
          duration: string | null
          employment_rate: number | null
          faculty_name: string | null
          id: string
          is_active: boolean | null
          name: string
          salary_range: string | null
          skills_developed: Json | null
          subjects: Json | null
          university_id: string
          updated_at: string
        }
        Insert: {
          application_details?: Json | null
          aps_requirement?: number | null
          career_prospects?: Json | null
          created_at?: string
          description?: string | null
          duration?: string | null
          employment_rate?: number | null
          faculty_name?: string | null
          id: string
          is_active?: boolean | null
          name: string
          salary_range?: string | null
          skills_developed?: Json | null
          subjects?: Json | null
          university_id: string
          updated_at?: string
        }
        Update: {
          application_details?: Json | null
          aps_requirement?: number | null
          career_prospects?: Json | null
          created_at?: string
          description?: string | null
          duration?: string | null
          employment_rate?: number | null
          faculty_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          salary_range?: string | null
          skills_developed?: Json | null
          subjects?: Json | null
          university_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          accommodation_id: string | null
          created_at: string | null
          details: string | null
          id: string
          reason: string
          reporter_email: string | null
          reporter_name: string | null
          status: string | null
        }
        Insert: {
          accommodation_id?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          reporter_email?: string | null
          reporter_name?: string | null
          status?: string | null
        }
        Update: {
          accommodation_id?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          reporter_email?: string | null
          reporter_name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      review_likes: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_likes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          created_at: string | null
          flag_reason: string | null
          id: string
          is_flagged: boolean | null
          is_hidden: boolean | null
          reply_text: string
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          reply_text: string
          review_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          reply_text?: string
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_stats: {
        Row: {
          like_count: number | null
          reply_count: number | null
          review_id: string
          updated_at: string | null
        }
        Insert: {
          like_count?: number | null
          reply_count?: number | null
          review_id: string
          updated_at?: string | null
        }
        Update: {
          like_count?: number | null
          reply_count?: number | null
          review_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_stats_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          accommodation_id: string | null
          comment: string | null
          created_at: string | null
          flag_reason: string | null
          id: string
          is_flagged: boolean | null
          is_hidden: boolean | null
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accommodation_id?: string | null
          comment?: string | null
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accommodation_id?: string | null
          comment?: string | null
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reviews_accommodation"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          amenities_filter_values: string[] | null
          city_searched: string | null
          converted_to_contact: boolean | null
          created_at: string
          gender_filter_value: string | null
          id: string
          listing_opened_id: string | null
          location_searched: string | null
          max_price: number | null
          min_price: number | null
          province_searched: string | null
          results_count: number | null
          search_query: string | null
          session_id: string | null
          university_searched: string | null
          used_amenities_filter: boolean | null
          used_gender_filter: boolean | null
          used_nsfas_filter: boolean | null
          used_price_filter: boolean | null
          user_id: string | null
        }
        Insert: {
          amenities_filter_values?: string[] | null
          city_searched?: string | null
          converted_to_contact?: boolean | null
          created_at?: string
          gender_filter_value?: string | null
          id?: string
          listing_opened_id?: string | null
          location_searched?: string | null
          max_price?: number | null
          min_price?: number | null
          province_searched?: string | null
          results_count?: number | null
          search_query?: string | null
          session_id?: string | null
          university_searched?: string | null
          used_amenities_filter?: boolean | null
          used_gender_filter?: boolean | null
          used_nsfas_filter?: boolean | null
          used_price_filter?: boolean | null
          user_id?: string | null
        }
        Update: {
          amenities_filter_values?: string[] | null
          city_searched?: string | null
          converted_to_contact?: boolean | null
          created_at?: string
          gender_filter_value?: string | null
          id?: string
          listing_opened_id?: string | null
          location_searched?: string | null
          max_price?: number | null
          min_price?: number | null
          province_searched?: string | null
          results_count?: number | null
          search_query?: string | null
          session_id?: string | null
          university_searched?: string | null
          used_amenities_filter?: boolean | null
          used_gender_filter?: boolean | null
          used_nsfas_filter?: boolean | null
          used_price_filter?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_analytics_listing_opened_id_fkey"
            columns: ["listing_opened_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      universities: {
        Row: {
          abbreviation: string | null
          created_at: string | null
          established_year: number | null
          faculties: Json | null
          full_name: string | null
          id: string
          location: string | null
          logo: string | null
          name: string
          overview: string | null
          province: string | null
          student_population: number | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string | null
          established_year?: number | null
          faculties?: Json | null
          full_name?: string | null
          id: string
          location?: string | null
          logo?: string | null
          name: string
          overview?: string | null
          province?: string | null
          student_population?: number | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          abbreviation?: string | null
          created_at?: string | null
          established_year?: number | null
          faculties?: Json | null
          full_name?: string | null
          id?: string
          location?: string | null
          logo?: string | null
          name?: string
          overview?: string | null
          province?: string | null
          student_population?: number | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_payments: {
        Row: {
          access_expires_at: string
          amount: number
          bobpay_payment_id: string | null
          bobpay_uuid: string | null
          created_at: string
          custom_payment_id: string | null
          id: string
          paid_at: string
          payment_method: string | null
          payment_provider: string
          payment_type: string
          raw_payload: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_expires_at: string
          amount: number
          bobpay_payment_id?: string | null
          bobpay_uuid?: string | null
          created_at?: string
          custom_payment_id?: string | null
          id?: string
          paid_at?: string
          payment_method?: string | null
          payment_provider?: string
          payment_type: string
          raw_payload?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_expires_at?: string
          amount?: number
          bobpay_payment_id?: string | null
          bobpay_uuid?: string | null
          created_at?: string
          custom_payment_id?: string | null
          id?: string
          paid_at?: string
          payment_method?: string | null
          payment_provider?: string
          payment_type?: string
          raw_payload?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      viewed_accommodations: {
        Row: {
          accommodation_id: string
          id: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          accommodation_id: string
          id?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          accommodation_id?: string
          id?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewed_accommodations_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_accommodation_photos: {
        Args: { p_accommodation_id: string; p_user_id?: string }
        Returns: string[]
      }
      get_cached_place: {
        Args: { p_place_id: string }
        Returns: {
          attributions: string
          cached_at: string
          cached_tier: string
          is_expired: boolean
          photo_count: number
          photo_uris: string[]
          place_id: string
          review_count: number
          reviews: Json
        }[]
      }
      get_user_access_level: { Args: { p_user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_paid_access: { Args: { p_user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_cache_analytics: {
        Args: { p_is_hit: boolean }
        Returns: undefined
      }
      increment_contact_analytics: {
        Args: { p_accommodation_id: string; p_contact_type: string }
        Returns: undefined
      }
      increment_listing_analytics: {
        Args: { p_accommodation_id: string; p_field: string }
        Returns: undefined
      }
      increment_user_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      is_place_cache_expired: { Args: { cached_at: string }; Returns: boolean }
      upsert_place_cache: {
        Args: {
          p_attributions: string
          p_cached_tier?: string
          p_photo_uris: string[]
          p_place_id: string
          p_reviews: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "landlord"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "landlord"],
    },
  },
} as const
