import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { categoryConfig } from '../data/categories'

interface CategoryWithCount {
  id: string
  name: string
  icon: string
  color: string
  count: number
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        // Get counts for each category
        const categoriesWithCounts = await Promise.all(
          categoryConfig.map(async (category) => {
            if (category.id === 'all') {
              // Get total count for "All" category
              const { count } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
              
              return {
                ...category,
                count: count || 0
              }
            } else {
              // Get count for specific category
              const { count } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('category', category.id)
              
              return {
                ...category,
                count: count || 0
              }
            }
          })
        )

        setCategories(categoriesWithCounts)
      } catch (error) {
        console.error('Error fetching category counts:', error)
        // Fallback to categories without counts
        setCategories(categoryConfig.map(cat => ({ ...cat, count: 0 })))
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryCounts()
  }, [])

  return { categories, loading }
}
