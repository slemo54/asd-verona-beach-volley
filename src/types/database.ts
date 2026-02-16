/**
 * Tipi TypeScript per il database Supabase
 * Generati manualmente in base allo schema ASD Verona Beach Volley
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: "athlete" | "admin"
          tshirt_size: "XS" | "S" | "M" | "L" | "XL" | "XXL" | null
          avatar_url: string | null
          is_moroso: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role?: "athlete" | "admin"
          tshirt_size?: "XS" | "S" | "M" | "L" | "XL" | "XXL" | null
          avatar_url?: string | null
          is_moroso?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: "athlete" | "admin"
          tshirt_size?: "XS" | "S" | "M" | "L" | "XL" | "XXL" | null
          avatar_url?: string | null
          is_moroso?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: number
          name: string
          coach_id: string | null
          macro_category: "male" | "female"
          level: "base" | "medium" | "pro"
          day_of_week: number
          time_slot: "18:30-20:00" | "20:00-21:30"
          max_athletes: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          coach_id?: string | null
          macro_category: "male" | "female"
          level: "base" | "medium" | "pro"
          day_of_week: number
          time_slot: "18:30-20:00" | "20:00-21:30"
          max_athletes?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          coach_id?: string | null
          macro_category?: "male" | "female"
          level?: "base" | "medium" | "pro"
          day_of_week?: number
          time_slot?: "18:30-20:00" | "20:00-21:30"
          max_athletes?: number
          is_active?: boolean
          created_at?: string
        }
      }
      group_athletes: {
        Row: {
          id: number
          group_id: number
          athlete_id: string
          joined_at: string
          left_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: number
          group_id: number
          athlete_id: string
          joined_at?: string
          left_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: number
          group_id?: number
          athlete_id?: string
          joined_at?: string
          left_at?: string | null
          is_active?: boolean
        }
      }
      medical_certificates: {
        Row: {
          id: number
          athlete_id: string
          type: "agonistico" | "non_agonistico"
          expiry_date: string
          file_url: string
          uploaded_at: string
          status: "valid" | "expiring" | "expired"
        }
        Insert: {
          id?: number
          athlete_id: string
          type: "agonistico" | "non_agonistico"
          expiry_date: string
          file_url: string
          uploaded_at?: string
          status?: "valid" | "expiring" | "expired"
        }
        Update: {
          id?: number
          athlete_id?: string
          type?: "agonistico" | "non_agonistico"
          expiry_date?: string
          file_url?: string
          uploaded_at?: string
          status?: "valid" | "expiring" | "expired"
        }
      }
      training_sessions: {
        Row: {
          id: number
          group_id: number
          session_date: string
          time_slot: "18:30-20:00" | "20:00-21:30"
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: number
          group_id: number
          session_date: string
          time_slot: "18:30-20:00" | "20:00-21:30"
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          group_id?: number
          session_date?: string
          time_slot?: "18:30-20:00" | "20:00-21:30"
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      attendances: {
        Row: {
          id: number
          session_id: number
          athlete_id: string
          is_present: boolean
          needs_recovery: boolean
          recovery_date: string | null
          recovery_group_id: number | null
          notes: string | null
          recorded_at: string
        }
        Insert: {
          id?: number
          session_id: number
          athlete_id: string
          is_present: boolean
          needs_recovery?: boolean
          recovery_date?: string | null
          recovery_group_id?: number | null
          notes?: string | null
          recorded_at?: string
        }
        Update: {
          id?: number
          session_id?: number
          athlete_id?: string
          is_present?: boolean
          needs_recovery?: boolean
          recovery_date?: string | null
          recovery_group_id?: number | null
          notes?: string | null
          recorded_at?: string
        }
      }
      payments: {
        Row: {
          id: number
          athlete_id: string
          season: string
          total_season_fee: number
          association_fee: number
          amount_paid: number
          balance_due: number
          payment_method: string | null
          status: "paid" | "partial" | "overdue"
          last_payment_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          athlete_id: string
          season: string
          total_season_fee: number
          association_fee?: number
          amount_paid?: number
          balance_due?: number
          payment_method?: string | null
          status?: "paid" | "partial" | "overdue"
          last_payment_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          athlete_id?: string
          season?: string
          total_season_fee?: number
          association_fee?: number
          amount_paid?: number
          balance_due?: number
          payment_method?: string | null
          status?: "paid" | "partial" | "overdue"
          last_payment_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: number
          payment_id: number
          amount: number
          method: string
          transaction_date: string
          recorded_by: string | null
          notes: string | null
        }
        Insert: {
          id?: number
          payment_id: number
          amount: number
          method: string
          transaction_date?: string
          recorded_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: number
          payment_id?: number
          amount?: number
          method?: string
          transaction_date?: string
          recorded_by?: string | null
          notes?: string | null
        }
      }
      court_bookings: {
        Row: {
          id: number
          court_name: string
          booking_date: string
          time_slot: string
          booked_by: string
          status: "confirmed" | "cancelled" | "pending"
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          court_name: string
          booking_date: string
          time_slot: string
          booked_by: string
          status?: "confirmed" | "cancelled" | "pending"
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          court_name?: string
          booking_date?: string
          time_slot?: string
          booked_by?: string
          status?: "confirmed" | "cancelled" | "pending"
          notes?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          category: "tshirt" | "sweatshirt" | "accessory" | "other"
          available_sizes: Json
          image_urls: Json
          stock: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          category: "tshirt" | "sweatshirt" | "accessory" | "other"
          available_sizes?: Json
          image_urls?: Json
          stock?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          category?: "tshirt" | "sweatshirt" | "accessory" | "other"
          available_sizes?: Json
          image_urls?: Json
          stock?: number
          is_active?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          athlete_id: string
          status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          athlete_id: string
          status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          athlete_id?: string
          status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          product_id: number
          quantity: number
          size: string | null
          unit_price: number
        }
        Insert: {
          id?: number
          order_id: number
          product_id: number
          quantity?: number
          size?: string | null
          unit_price: number
        }
        Update: {
          id?: number
          order_id?: number
          product_id?: number
          quantity?: number
          size?: string | null
          unit_price?: number
        }
      }
      promotions: {
        Row: {
          id: number
          title: string
          description: string | null
          partner_name: string | null
          discount_type: "percentage" | "fixed" | null
          discount_value: number | null
          valid_from: string | null
          valid_until: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          partner_name?: string | null
          discount_type?: "percentage" | "fixed" | null
          discount_value?: number | null
          valid_from?: string | null
          valid_until?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          partner_name?: string | null
          discount_type?: "percentage" | "fixed" | null
          discount_value?: number | null
          valid_from?: string | null
          valid_until?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: number
          admin_id: string
          action: string
          entity_type: string
          entity_id: number | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: number
          admin_id: string
          action: string
          entity_type: string
          entity_id?: number | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: number
          admin_id?: string
          action?: string
          entity_type?: string
          entity_id?: number | null
          details?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

/** Tipi utility per le tabelle */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

/** Tipi specifici per le tabelle principali */
export type Profile = Tables<"profiles">
export type Group = Tables<"groups">
export type GroupAthlete = Tables<"group_athletes">
export type MedicalCertificate = Tables<"medical_certificates">
export type TrainingSession = Tables<"training_sessions">
export type Attendance = Tables<"attendances">
export type Payment = Tables<"payments">
export type PaymentTransaction = Tables<"payment_transactions">
export type CourtBooking = Tables<"court_bookings">
export type Product = Tables<"products">
export type Order = Tables<"orders">
export type OrderItem = Tables<"order_items">
export type Promotion = Tables<"promotions">
export type AdminLog = Tables<"admin_logs">
