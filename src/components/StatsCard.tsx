import React from 'react'
import { TrendingUp, Eye, ThumbsUp, Package } from 'lucide-react'
import { useStats } from '../hooks/useStats'
import { StatsService } from '../services/statsService'

interface StatsCardProps {
  opacity?: number
  scale?: number
}

export function StatsCard({ opacity = 1, scale = 1 }: StatsCardProps) {
  const { stats, loading, error } = useStats()

  if (loading) {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-300 ease-out"
        style={{ 
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-300 ease-out"
        style={{ 
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        <div className="flex items-center justify-center text-gray-500">
          <TrendingUp className="w-5 h-5 mr-2" />
          <span>Unable to load stats</span>
        </div>
      </div>
    )
  }

  const statItems = [
    {
      label: "Views",
      value: StatsService.formatNumber(stats.today.productViews),
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Upvotes",
      value: StatsService.formatNumber(stats.today.upvotes),
      icon: ThumbsUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Products",
      value: StatsService.formatNumber(stats.today.newProducts),
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Views",
      value: StatsService.formatNumber(stats.allTime.totalViews),
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Upvotes",
      value: StatsService.formatNumber(stats.allTime.totalUpvotes),
      icon: ThumbsUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Products",
      value: StatsService.formatNumber(stats.allTime.totalProducts),
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-300 ease-out"
      style={{ 
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'top center'
      }}
    >
      <div className="flex items-center mb-4">
        <TrendingUp className="w-5 h-5 text-gray-700 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Product Vibes Stats</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Today</h4>
          {statItems.slice(0, 3).map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">All Time</h4>
          {statItems.slice(3, 6).map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{item.label.replace('Total ', '')}</p>
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Stats update every 5 minutes • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
