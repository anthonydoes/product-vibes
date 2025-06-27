import { useState, useEffect } from 'react'
import { ProductService } from '../services/productService'
import type { Database } from '../types/supabase'

type Product = Database['public']['Tables']['products']['Row'] & {
  profiles?: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface UseProductsOptions {
  category?: string
  limit?: number
  trending?: boolean
  featured?: boolean
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await ProductService.getProducts({
        category: options.category !== 'all' ? options.category : undefined,
        limit: options.limit,
        trending: options.trending,
        featured: options.featured
      })

      if (fetchError) {
        throw fetchError
      }

      setProducts(data || [])
      console.log('Fetched products:', data?.length, 'products')
      console.log('Sample product:', data?.[0])
      console.log('All products:', data?.map(p => ({ id: p.id, name: p.name, created_at: p.created_at })))
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [options.category, options.limit, options.trending, options.featured])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  }
}

export function useProductsByTab(tab: string, selectedCategory?: string) {
  const baseOptions = {
    category: selectedCategory,
    limit: 20
  }

  const trendingOptions = { ...baseOptions, trending: true }
  const newOptions = { ...baseOptions } // New products = recently created (default order)
  const risingOptions = { ...baseOptions } // Rising = products with recent upvotes growth

  console.log('useProductsByTab called with:', { tab, selectedCategory });

  switch (tab) {
    case 'trending':
      console.log('Using trending options:', trendingOptions);
      return useProducts(trendingOptions)
    case 'new':
      console.log('Using new options:', newOptions);
      return useProducts(newOptions)
    case 'rising':
      console.log('Using rising options:', risingOptions);
      return useProducts(risingOptions)
    default:
      console.log('Using default options:', baseOptions);
      return useProducts(baseOptions)
  }
}
