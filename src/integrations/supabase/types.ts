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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      branches: {
        Row: {
          active: boolean
          address: string | null
          area: string | null
          county: string | null
          created_at: string
          delivery_radius_km: number | null
          email: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          offer_note: string | null
          opening_hours: string | null
          phone: string | null
          products_available: string[] | null
          serves_areas: string[] | null
          sort_order: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          area?: string | null
          county?: string | null
          created_at?: string
          delivery_radius_km?: number | null
          email?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          offer_note?: string | null
          opening_hours?: string | null
          phone?: string | null
          products_available?: string[] | null
          serves_areas?: string[] | null
          sort_order?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          area?: string | null
          county?: string | null
          created_at?: string
          delivery_radius_km?: number | null
          email?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          offer_note?: string | null
          opening_hours?: string | null
          phone?: string | null
          products_available?: string[] | null
          serves_areas?: string[] | null
          sort_order?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string
          caption: string | null
          created_at: string
          id: string
          image_path: string | null
          image_url: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          alt_text?: string
          caption?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          image_url: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          alt_text?: string
          caption?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          image_url?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal_kes: number
          unit_price_kes: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal_kes: number
          unit_price_kes: number
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          subtotal_kes?: number
          unit_price_kes?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_branch_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_fee_kes: number
          delivery_lat: number
          delivery_landmark: string | null
          delivery_lng: number
          delivery_notes: string | null
          delivery_status: string
          estimated_distance_km: number | null
          estimated_duration_min: number | null
          id: string
          order_number: string
          subtotal_kes: number
          total_kes: number
          updated_at: string
        }
        Insert: {
          assigned_branch_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_fee_kes?: number
          delivery_lat: number
          delivery_landmark?: string | null
          delivery_lng: number
          delivery_notes?: string | null
          delivery_status?: string
          estimated_distance_km?: number | null
          estimated_duration_min?: number | null
          id?: string
          order_number: string
          subtotal_kes?: number
          total_kes?: number
          updated_at?: string
        }
        Update: {
          assigned_branch_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_fee_kes?: number
          delivery_lat?: number
          delivery_landmark?: string | null
          delivery_lng?: number
          delivery_notes?: string | null
          delivery_status?: string
          estimated_distance_km?: number | null
          estimated_duration_min?: number | null
          id?: string
          order_number?: string
          subtotal_kes?: number
          total_kes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_branch_id_fkey"
            columns: ["assigned_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          brand: string
          category: string
          created_at: string
          description: string
          featured: boolean
          id: string
          image_path: string | null
          image_url: string | null
          in_stock: boolean
          name: string
          price_kes: number
          product_type: string | null
          size: string | null
          slug: string
          sort_order: number
          specs: Json
          updated_at: string
        }
        Insert: {
          badge?: string | null
          brand: string
          category: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_path?: string | null
          image_url?: string | null
          in_stock?: boolean
          name: string
          price_kes: number
          product_type?: string | null
          size?: string | null
          slug: string
          sort_order?: number
          specs?: Json
          updated_at?: string
        }
        Update: {
          badge?: string | null
          brand?: string
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_path?: string | null
          image_url?: string | null
          in_stock?: boolean
          name?: string
          price_kes?: number
          product_type?: string | null
          size?: string | null
          slug?: string
          sort_order?: number
          specs?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
