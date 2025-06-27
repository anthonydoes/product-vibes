import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export class UserService {
  // Get a user profile by username
  static async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    return { data, error }
  }

  // Get a user profile by ID
  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  // Update user profile
  static async updateProfile(id: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }

  // Get user's products with stats
  static async getUserProducts(userId: string, options?: {
    limit?: number
    offset?: number
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
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    return { data, error }
  }

  // Get user stats (total products, total upvotes, total views)
  static async getUserStats(userId: string) {
    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId)

    // Get total upvotes across all user's products
    const { data: products } = await supabase
      .from('products')
      .select('upvotes')
      .eq('creator_id', userId)

    const totalUpvotes = products?.reduce((sum, product) => sum + (product.upvotes || 0), 0) || 0

    // Get total views across all user's products
    const { data: viewData } = await supabase
      .from('products')
      .select('view_count')
      .eq('creator_id', userId)

    const totalViews = viewData?.reduce((sum, product) => sum + (product.view_count || 0), 0) || 0

    return {
      totalProducts: totalProducts || 0,
      totalUpvotes,
      totalViews
    }
  }

  // Check if username is available
  static async isUsernameAvailable(username: string, excludeUserId?: string) {
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', username)

    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }

    const { data, error } = await query.single()

    return { available: !data, error }
  }
}
