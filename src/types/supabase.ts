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
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          product_info: string | null
          logo_url: string | null
          product_images: string[]
          website_url: string | null
          category: string
          tags: string[]
          slug: string | null
          view_count: number
          created_at: string
          updated_at: string
          creator_id: string
          upvotes: number
          is_featured: boolean
          is_trending: boolean
          launch_date: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          product_info?: string | null
          logo_url?: string | null
          product_images?: string[]
          website_url?: string | null
          category: string
          tags?: string[]
          slug?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
          creator_id: string
          upvotes?: number
          is_featured?: boolean
          is_trending?: boolean
          launch_date?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          product_info?: string | null
          logo_url?: string | null
          product_images?: string[]
          website_url?: string | null
          category?: string
          tags?: string[]
          slug?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
          creator_id?: string
          upvotes?: number
          is_featured?: boolean
          is_trending?: boolean
          launch_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      upvotes: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "upvotes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      product_views: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_upvotes: {
        Args: {
          product_id: string
        }
        Returns: undefined
      }
      decrement_upvotes: {
        Args: {
          product_id: string
        }
        Returns: undefined
      }
      increment_product_views: {
        Args: {
          product_uuid: string
          user_uuid?: string
          user_ip?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}