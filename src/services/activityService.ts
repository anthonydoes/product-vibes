import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type Product = Database['public']['Tables']['products']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Upvote = Database['public']['Tables']['upvotes']['Row']

export interface ActivityItem {
  id: string
  type: "upvote" | "launch" | "trending" | "milestone"
  message: string
  time: string
  productName?: string
  userName?: string
  productSlug?: string
  userAvatar?: string
  timestamp: Date
}

export class ActivityService {
  static async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    const activities: ActivityItem[] = []

    try {
      // Get recent product launches (last 24 hours)
      const { data: recentProducts } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_creator_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      // Get recent upvotes (last 2 hours)
      const { data: recentUpvotes } = await supabase
        .from('upvotes')
        .select(`
          *,
          products (
            name,
            slug,
            upvotes
          ),
          profiles!upvotes_user_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(8)

      // Get trending products (products with high upvotes)
      const { data: trendingProducts } = await supabase
        .from('products')
        .select(`
          *,
          profiles!products_creator_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .gte('upvotes', 10)
        .order('upvotes', { ascending: false })
        .limit(3)

      // Process product launches
      if (recentProducts) {
        for (const product of recentProducts) {
          const profile = product.profiles as Profile
          const timeAgo = this.getTimeAgo(new Date(product.created_at))
          
          activities.push({
            id: `launch-${product.id}`,
            type: 'launch',
            message: `${product.name} launched by ${profile?.full_name || profile?.username || 'Anonymous'}`,
            time: timeAgo,
            productName: product.name,
            userName: profile?.full_name || profile?.username || 'Anonymous',
            productSlug: product.slug || undefined,
            userAvatar: profile?.avatar_url || undefined,
            timestamp: new Date(product.created_at)
          })
        }
      }

      // Process recent upvotes
      if (recentUpvotes) {
        // Group upvotes by product to avoid spam
        const upvoteGroups = new Map<string, { count: number; latest: any; product: Product; users: Profile[] }>()
        
        for (const upvote of recentUpvotes) {
          const product = upvote.products as Product
          const profile = upvote.profiles as Profile
          
          if (product) {
            const existing = upvoteGroups.get(product.id)
            if (existing) {
              existing.count++
              existing.users.push(profile)
              if (new Date(upvote.created_at) > new Date(existing.latest.created_at)) {
                existing.latest = upvote
              }
            } else {
              upvoteGroups.set(product.id, {
                count: 1,
                latest: upvote,
                product,
                users: [profile]
              })
            }
          }
        }

        // Create activity items from grouped upvotes
        for (const [productId, group] of upvoteGroups.entries()) {
          const timeAgo = this.getTimeAgo(new Date(group.latest.created_at))
          
          let message: string
          if (group.count === 1) {
            const user = group.users[0]
            message = `${user?.full_name || user?.username || 'Someone'} upvoted ${group.product.name}`
          } else if (group.count === 2) {
            message = `${group.users[0]?.full_name || group.users[0]?.username || 'Someone'} and 1 other upvoted ${group.product.name}`
          } else {
            message = `${group.users[0]?.full_name || group.users[0]?.username || 'Someone'} and ${group.count - 1} others upvoted ${group.product.name}`
          }
          
          activities.push({
            id: `upvote-group-${productId}`,
            type: 'upvote',
            message,
            time: timeAgo,
            productName: group.product.name,
            userName: group.users[0]?.full_name || group.users[0]?.username || 'Someone',
            productSlug: group.product.slug || undefined,
            userAvatar: group.users[0]?.avatar_url || undefined,
            timestamp: new Date(group.latest.created_at)
          })
        }
      }

      // Process trending products
      if (trendingProducts) {
        for (const product of trendingProducts) {
          const profile = product.profiles as Profile
          
          // Check if product hit milestone upvotes (every 25 upvotes)
          if (product.upvotes > 0 && product.upvotes % 25 === 0) {
            activities.push({
              id: `milestone-${product.id}-${product.upvotes}`,
              type: 'milestone',
              message: `${product.name} just hit ${product.upvotes} upvotes! 🔥`,
              time: this.getTimeAgo(new Date(product.updated_at)),
              productName: product.name,
              userName: profile?.full_name || profile?.username || 'Anonymous',
              productSlug: product.slug || undefined,
              userAvatar: profile?.avatar_url || undefined,
              timestamp: new Date(product.updated_at)
            })
          }
          
          // Mark as trending if it has high upvotes
          else if (product.upvotes >= 10) {
            activities.push({
              id: `trending-${product.id}`,
              type: 'trending',
              message: `${product.name} is trending with ${product.upvotes} upvotes! 📈`,
              time: this.getTimeAgo(new Date(product.updated_at)),
              productName: product.name,
              userName: profile?.full_name || profile?.username || 'Anonymous',
              productSlug: product.slug || undefined,
              userAvatar: profile?.avatar_url || undefined,
              timestamp: new Date(product.updated_at)
            })
          }
        }
      }

      // Sort all activities by timestamp and limit
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      
      return activities.slice(0, limit)

    } catch (error) {
      console.error('Error fetching activity:', error)
      return []
    }
  }

  private static getTimeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }
}
