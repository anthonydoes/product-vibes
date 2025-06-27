import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export class ProductService {
  // Get all products with optional filtering
  static async getProducts(options?: {
    category?: string
    limit?: number
    offset?: number
    trending?: boolean
    featured?: boolean
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        profiles!products_creator_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (options?.category && options.category !== 'all') {
      query = query.eq('category', options.category)
    }

    if (options?.trending) {
      query = query.eq('is_trending', true)
    }

    if (options?.featured) {
      query = query.eq('is_featured', true)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return { data: null, error }
    }

    return { data, error: null }
  }

  // Get a single product by ID
  static async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles!products_creator_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    return { data, error }
  }

  // Create a new product
  static async createProduct(product: ProductInsert) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    return { data, error }
  }

  // Update a product
  static async updateProduct(id: string, updates: ProductUpdate) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  // Delete a product
  static async deleteProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    return { data, error }
  }

  // Upvote a product
  static async upvoteProduct(productId: string, userId: string) {
    // Check if user already upvoted
    const { data: existingUpvote } = await supabase
      .from('upvotes')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single()

    if (existingUpvote) {
      // Remove upvote
      const { error: deleteError } = await supabase
        .from('upvotes')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', userId)

      if (deleteError) return { data: null, error: deleteError }

      // Decrement upvotes count
      const { data, error } = await supabase.rpc('decrement_upvotes', {
        product_id: productId
      })

      return { data, error }
    } else {
      // Add upvote
      const { error: insertError } = await supabase
        .from('upvotes')
        .insert({ product_id: productId, user_id: userId })

      if (insertError) return { data: null, error: insertError }

      // Increment upvotes count
      const { data, error } = await supabase.rpc('increment_upvotes', {
        product_id: productId
      })

      return { data, error }
    }
  }

  // Check if user has upvoted a product
  static async hasUserUpvoted(productId: string, userId: string) {
    const { data, error } = await supabase
      .from('upvotes')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single()

    return { hasUpvoted: !!data, error }
  }
}
