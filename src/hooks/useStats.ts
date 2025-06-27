import { useState, useEffect } from 'react'
import { StatsService, type PlatformStats } from '../services/statsService'

export function useStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setError(null)
      const platformStats = await StatsService.getPlatformStats()
      setStats(platformStats)
    } catch (err) {
      setError('Failed to fetch platform stats')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}
