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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_user_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
