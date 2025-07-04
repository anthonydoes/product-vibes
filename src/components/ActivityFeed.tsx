import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Clock, Rocket, Trophy, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useActivity } from "../hooks/useActivity";
import type { ActivityItem } from "../services/activityService";

const ActivityFeed: React.FC = () => {
  const navigate = useNavigate();
  const { activities, loading, error } = useActivity(30000); // Refresh every 30 seconds

  // Update sticky positioning when isSticky changes
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "trending":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case "upvote":
        return <Zap className="h-4 w-4 text-blue-500" />;
      case "launch":
        return <Rocket className="h-4 w-4 text-green-500" />;
      case "milestone":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.productSlug) {
      navigate(`/product/${activity.productSlug}`);
    }
  };

  if (error) {
    return (
      <div className="w-80 bg-card border rounded-2xl p-4 h-fit">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 bg-red-500 rounded-full" />
          <h3 className="font-semibold text-sm">Live Activity</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Failed to load activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border rounded-2xl p-4 h-fit">
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-2 w-2 rounded-full animate-pulse ${loading ? 'bg-yellow-500' : 'bg-green-500'}`} />
        <h3 className="font-semibold text-sm">Live Activity</h3>
        {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />}
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {loading && activities.length === 0 ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 text-sm animate-pulse">
              <div className="w-4 h-4 bg-muted rounded-full mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Check back soon for updates!</p>
          </div>
        ) : (
          activities.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-start gap-3 text-sm group ${item.productSlug ? 'cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors' : ''}`}
              onClick={() => handleActivityClick(item)}
              title={item.productSlug ? `View ${item.productName}` : undefined}
            >
              <div className="mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground leading-relaxed text-sm group-hover:text-foreground transition-colors">
                      {item.message}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {item.time}
                    </p>
                  </div>
                  {item.userAvatar && (
                    <Avatar className="h-5 w-5 flex-shrink-0 border border-muted group-hover:border-primary/50 transition-colors">
                      <AvatarImage src={item.userAvatar} alt={item.userName} />
                      <AvatarFallback className="text-xs bg-muted">
                        {item.userName?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      <motion.div 
        className="mt-4 pt-3 border-t text-center"
        whileHover={{ scale: 1.02 }}
      >
        <button className="text-xs text-primary hover:underline transition-colors">
          View all activity →
        </button>
      </motion.div>
    </div>
  );
};

export default ActivityFeed;
