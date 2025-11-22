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
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category: string | null
          uom: string
          min_stock_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          category?: string | null
          uom?: string
          min_stock_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string | null
          category?: string | null
          uom?: string
          min_stock_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      warehouses: {
        Row: {
          id: string
          name: string
          location: string | null
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          type?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          type?: string
          created_at?: string
        }
      }
      inventory_levels: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string
          quantity: number
          bin_location: string | null
          last_updated: string
        }
        Insert: {
          id?: string
          product_id: string
          warehouse_id: string
          quantity?: number
          bin_location?: string | null
          last_updated?: string
        }
        Update: {
          id?: string
          product_id?: string
          warehouse_id?: string
          quantity?: number
          bin_location?: string | null
          last_updated?: string
        }
      }
      stock_moves: {
        Row: {
          id: string
          product_id: string
          from_warehouse_id: string | null
          to_warehouse_id: string | null
          quantity: number
          type: 'receipt' | 'delivery' | 'transfer' | 'adjustment'
          reference: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          quantity: number
          type: 'receipt' | 'delivery' | 'transfer' | 'adjustment'
          reference?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          quantity?: number
          type?: 'receipt' | 'delivery' | 'transfer' | 'adjustment'
          reference?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
