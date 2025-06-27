import { supabase } from '../lib/supabase'

export interface PlatformStats {
  today: {
    productViews: number
    upvotes: number
    newProducts: number
  }
  allTime: {
    totalProducts: number
    totalViews: number
    totalUpvotes: number
  }
}

export class StatsService {
  static async getPlatformStats(): Promise<PlatformStats> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      // Get today's stats
      const [
        { data: todayProducts },
        { data: todayUpvotes },
        { data: todayViews },
        { data: allTimeProducts },
        { data: allTimeUpvotes }
      ] = await Promise.all([
        // Today's new products
        supabase
          .from('products')
          .select('id')
          .gte('created_at', todayISO),

        // Today's upvotes
        supabase
          .from('upvotes')
          .select('id')
          .gte('created_at', todayISO),

        // Today's views from product_views table
        supabase
          .from('product_views')
          .select('id')
          .gte('created_at', todayISO),

        // All time products and total views
        supabase
          .from('products')
          .select('id, view_count'),

        // All time upvotes
        supabase
          .from('upvotes')
          .select('id')
      ])

      // Calculate total views
      const totalViews = allTimeProducts?.reduce((sum, product) => sum + (product.view_count || 0), 0) || 0

      return {
        today: {
          productViews: todayViews?.length || 0,
          upvotes: todayUpvotes?.length || 0,
          newProducts: todayProducts?.length || 0
        },
        allTime: {
          totalProducts: allTimeProducts?.length || 0,
          totalViews: totalViews,
          totalUpvotes: allTimeUpvotes?.length || 0
        }
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error)
      return {
        today: {
          productViews: 0,
          upvotes: 0,
          newProducts: 0
        },
        allTime: {
          totalProducts: 0,
          totalViews: 0,
          totalUpvotes: 0
        }
      }
    }
  }

  static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }
}
