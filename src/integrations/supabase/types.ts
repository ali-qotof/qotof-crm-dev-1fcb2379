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
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          customer_stage: Database["public"]["Enums"]["customer_stage"]
          email: string | null
          full_name: string
          governorate: string | null
          id: string
          notes: string | null
          primary_phone: string
          primary_phone_normalized: string
          source: Database["public"]["Enums"]["customer_source"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          customer_stage?: Database["public"]["Enums"]["customer_stage"]
          email?: string | null
          full_name: string
          governorate?: string | null
          id?: string
          notes?: string | null
          primary_phone: string
          primary_phone_normalized: string
          source?: Database["public"]["Enums"]["customer_source"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          customer_stage?: Database["public"]["Enums"]["customer_stage"]
          email?: string | null
          full_name?: string
          governorate?: string | null
          id?: string
          notes?: string | null
          primary_phone?: string
          primary_phone_normalized?: string
          source?: Database["public"]["Enums"]["customer_source"]
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          field_name: string
          id: string
          new_value: string
          old_value: string | null
          order_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          field_name: string
          id?: string
          new_value: string
          old_value?: string | null
          order_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string
          old_value?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string
          fulfillment_status: Database["public"]["Enums"]["fulfillment_status"]
          id: string
          notes: string | null
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          source: Database["public"]["Enums"]["order_source"]
          source_detail: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id: string
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          notes?: string | null
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          source?: Database["public"]["Enums"]["order_source"]
          source_detail?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_status"]
          id?: string
          notes?: string | null
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          source?: Database["public"]["Enums"]["order_source"]
          source_detail?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price: number
          sku: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          sku?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sku?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipment_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["shipment_status"]
          note: string | null
          old_status: Database["public"]["Enums"]["shipment_status"] | null
          shipment_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["shipment_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["shipment_status"] | null
          shipment_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["shipment_status"]
          note?: string | null
          old_status?: Database["public"]["Enums"]["shipment_status"] | null
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_status_history_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          carrier_name: string | null
          created_at: string
          created_by: string | null
          delivered_at: string | null
          id: string
          last_status_note: string | null
          order_id: string
          out_for_delivery_at: string | null
          return_received_at: string | null
          shipment_status: Database["public"]["Enums"]["shipment_status"]
          shipped_at: string | null
          tracking_number: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          carrier_name?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          id?: string
          last_status_note?: string | null
          order_id: string
          out_for_delivery_at?: string | null
          return_received_at?: string | null
          shipment_status?: Database["public"]["Enums"]["shipment_status"]
          shipped_at?: string | null
          tracking_number?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          carrier_name?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          id?: string
          last_status_note?: string | null
          order_id?: string
          out_for_delivery_at?: string | null
          return_received_at?: string | null
          shipment_status?: Database["public"]["Enums"]["shipment_status"]
          shipped_at?: string | null
          tracking_number?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_users: {
        Row: {
          auth_user_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          customer_id: string
          description: string | null
          id: string
          issue_type: Database["public"]["Enums"]["ticket_issue_type"]
          opened_by: string | null
          order_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolution_note: string | null
          resolved_at: string | null
          subject: string
          ticket_number: string
          ticket_status: Database["public"]["Enums"]["ticket_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          issue_type?: Database["public"]["Enums"]["ticket_issue_type"]
          opened_by?: string | null
          order_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution_note?: string | null
          resolved_at?: string | null
          subject: string
          ticket_number: string
          ticket_status?: Database["public"]["Enums"]["ticket_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          issue_type?: Database["public"]["Enums"]["ticket_issue_type"]
          opened_by?: string | null
          order_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution_note?: string | null
          resolved_at?: string | null
          subject?: string
          ticket_number?: string
          ticket_status?: Database["public"]["Enums"]["ticket_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["ticket_event_type"]
          id: string
          message: string | null
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          ticket_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["ticket_event_type"]
          id?: string
          message?: string | null
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["ticket_event_type"]
          id?: string
          message?: string | null
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_events_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_staff_role: {
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
    }
    Enums: {
      app_role:
        | "admin"
        | "sales"
        | "customer_service"
        | "operations"
        | "manager"
      customer_source:
        | "walk_in"
        | "phone"
        | "whatsapp"
        | "website"
        | "woocommerce"
        | "referral"
        | "other"
      customer_stage: "lead" | "active" | "inactive" | "vip" | "blocked"
      fulfillment_status:
        | "not_started"
        | "preparing"
        | "packed"
        | "ready_to_ship"
        | "shipped"
        | "out_for_delivery"
        | "delivered"
        | "delivery_failed"
        | "returned"
      order_source: "manual" | "woocommerce" | "phone" | "whatsapp" | "other"
      order_status:
        | "draft"
        | "new"
        | "pending_confirmation"
        | "confirmed"
        | "on_hold"
        | "cancelled"
        | "completed"
      payment_status:
        | "cod_pending"
        | "unpaid"
        | "paid"
        | "partially_refunded"
        | "refunded"
      shipment_status:
        | "pending"
        | "label_created"
        | "picked_up"
        | "in_transit"
        | "out_for_delivery"
        | "delivered"
        | "delivery_failed"
        | "returned"
        | "lost"
        | "cancelled"
      ticket_event_type:
        | "created"
        | "status_changed"
        | "priority_changed"
        | "assigned"
        | "unassigned"
        | "comment"
        | "internal_note"
        | "attachment"
        | "resolved"
        | "reopened"
        | "closed"
      ticket_issue_type:
        | "late_delivery"
        | "wrong_item"
        | "missing_item"
        | "damaged_item"
        | "quality_issue"
        | "refund_request"
        | "exchange_request"
        | "courier_issue"
        | "general_complaint"
        | "inquiry"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status:
        | "new"
        | "open"
        | "waiting_customer"
        | "waiting_internal"
        | "escalated"
        | "resolved"
        | "closed"
        | "reopened"
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
      app_role: ["admin", "sales", "customer_service", "operations", "manager"],
      customer_source: [
        "walk_in",
        "phone",
        "whatsapp",
        "website",
        "woocommerce",
        "referral",
        "other",
      ],
      customer_stage: ["lead", "active", "inactive", "vip", "blocked"],
      fulfillment_status: [
        "not_started",
        "preparing",
        "packed",
        "ready_to_ship",
        "shipped",
        "out_for_delivery",
        "delivered",
        "delivery_failed",
        "returned",
      ],
      order_source: ["manual", "woocommerce", "phone", "whatsapp", "other"],
      order_status: [
        "draft",
        "new",
        "pending_confirmation",
        "confirmed",
        "on_hold",
        "cancelled",
        "completed",
      ],
      payment_status: [
        "cod_pending",
        "unpaid",
        "paid",
        "partially_refunded",
        "refunded",
      ],
      shipment_status: [
        "pending",
        "label_created",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "delivery_failed",
        "returned",
        "lost",
        "cancelled",
      ],
      ticket_event_type: [
        "created",
        "status_changed",
        "priority_changed",
        "assigned",
        "unassigned",
        "comment",
        "internal_note",
        "attachment",
        "resolved",
        "reopened",
        "closed",
      ],
      ticket_issue_type: [
        "late_delivery",
        "wrong_item",
        "missing_item",
        "damaged_item",
        "quality_issue",
        "refund_request",
        "exchange_request",
        "courier_issue",
        "general_complaint",
        "inquiry",
      ],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: [
        "new",
        "open",
        "waiting_customer",
        "waiting_internal",
        "escalated",
        "resolved",
        "closed",
        "reopened",
      ],
    },
  },
} as const
