import { useState, useEffect } from 'react'
import { ActivityService, type ActivityItem } from '../services/activityService'

export const useActivity = (refreshInterval: number = 30000) => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      setError(null)
      const data = await ActivityService.getRecentActivity(10)
      setActivities(data)
    } catch (err) {
      setError('Failed to load activities')
      console.error('Error fetching activities:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
    
    // Set up auto-refresh interval
    const interval = setInterval(fetchActivities, refreshInterval)
    
    return () => clearInterval(interval)
  }, [refreshInterval])

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities
  }
}
