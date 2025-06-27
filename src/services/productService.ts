import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'
import { generateSlug, generateUniqueSlug } from '../utils/slugGenerator'

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
    creatorId?: string  // Add creatorId filter
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        profiles!products_creator_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          website,
          bio
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

    if (options?.creatorId) {
      query = query.eq('creator_id', options.creatorId)
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
    // Generate a slug from the product name
    const baseSlug = generateSlug(product.name || 'untitled-product')
    
    // Get existing slugs to ensure uniqueness
    const { data: existingProducts } = await supabase
      .from('products')
      .select('slug')
      .not('slug', 'is', null)
    
    const existingSlugs = existingProducts?.map(p => p.slug).filter(Boolean) || []
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs as string[])
    
    // Add the slug to the product data
    const productWithSlug = {
      ...product,
      slug: uniqueSlug
    }

    const { data, error } = await supabase
      .from('products')
      .insert(productWithSlug)
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

  // Get product by slug
  static async getProductBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles!products_creator_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          website,
          bio
        )
      `)
      .eq('slug', slug)
      .single()

    return { data, error }
  }

  // Get product by slug or ID (fallback)
  static async getProductBySlugOrId(slugOrId: string) {
    // First try to get by slug
    const { data: slugData, error: slugError } = await supabase
      .from('products')
      .select(`
        *,
        profiles!products_creator_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          website,
          bio
        )
      `)
      .eq('slug', slugOrId)
      .single()

    if (slugData && !slugError) {
      return { data: slugData, error: null }
    }

    // If not found by slug, try by ID
    const { data: idData, error: idError } = await supabase
      .from('products')
      .select(`
        *,
        profiles!products_creator_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          website,
          bio
        )
      `)
      .eq('id', slugOrId)
      .single()

    return { data: idData, error: idError }
  }

  // Increment product view count (only once per session per product, and not for creators viewing their own products)
  static async incrementProductViews(productId: string, userId?: string, creatorId?: string) {
    // Don't count views from the product creator (except maybe the initial creation view)
    if (userId && creatorId && userId === creatorId) {
      // Skip view counting for creators viewing their own products
      return { data: null, error: null };
    }

    // Check if this view has already been counted in this session
    const sessionKey = `viewed_product_${productId}`;
    const hasViewedInSession = sessionStorage.getItem(sessionKey);
    
    if (hasViewedInSession) {
      // Already counted this view in this session, don't count again
      return { data: null, error: null };
    }

    // Mark as viewed in this session
    sessionStorage.setItem(sessionKey, 'true');

    // Use the database function that updates both products.view_count and inserts into product_views
    const { data, error } = await supabase.rpc('increment_product_views', {
      product_uuid: productId,
      user_uuid: userId || null,
      user_ip: null // We could get this from request headers in the future
    })

    if (error) {
      console.error('Error incrementing product views:', error)
      // Remove from session storage if the database call failed
      sessionStorage.removeItem(sessionKey);
    }

    return { data, error }
  }

  // Check if user has upvoted a product (alias for consistency)
  static async checkUserUpvote(productId: string, userId: string) {
    return this.hasUserUpvoted(productId, userId)
  }

  // Add upvote
  static async addUpvote(productId: string, userId: string) {
    return this.upvoteProduct(productId, userId)
  }

  // Remove upvote
  static async removeUpvote(productId: string, userId: string) {
    // Remove from upvotes table
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
  }
}
