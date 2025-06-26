import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "upvote" | "comment" | "launch" | "trending";
  message: string;
  time: string;
  productName?: string;
  userName?: string;
}

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    type: "trending",
    message: "Focus Flow just hit 200+ upvotes! 🔥",
    time: "2m ago",
    productName: "Focus Flow"
  },
  {
    id: "2",
    type: "launch",
    message: "Plant Care AI launched by Emma Thompson",
    time: "5m ago",
    productName: "Plant Care AI",
    userName: "Emma Thompson"
  },
  {
    id: "3",
    type: "upvote",
    message: "CodeSnap AI is rising fast! 📈",
    time: "8m ago",
    productName: "CodeSnap AI"
  },
  {
    id: "4",
    type: "comment",
    message: "New comment on Meeting Buddy",
    time: "12m ago",
    productName: "Meeting Buddy"
  },
  {
    id: "5",
    type: "upvote",
    message: "Retro Games Hub getting love from the community",
    time: "15m ago",
    productName: "Retro Games Hub"
  }
];

const ActivityFeed = () => {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "trending":
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case "upvote":
        return <Zap className="h-4 w-4 text-blue-500" />;
      case "launch":
        return <span className="text-sm">🚀</span>;
      case "comment":
        return <span className="text-sm">💬</span>;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-80 bg-card border rounded-2xl p-4 h-fit">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        <h3 className="font-semibold text-sm">Live Activity</h3>
      </div>
      
      <div className="space-y-3">
        {mockActivity.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 text-sm"
          >
            <div className="mt-0.5">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground leading-relaxed">
                {item.message}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {item.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="mt-4 pt-3 border-t text-center"
        whileHover={{ scale: 1.02 }}
      >
        <button className="text-xs text-primary hover:underline">
          View all activity →
        </button>
      </motion.div>
    </div>
  );
};

export default ActivityFeed;
