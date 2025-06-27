import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Star, Crown, Medal } from "lucide-react";

interface VoteBadgeSystemProps {
  upvotes: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showCount?: boolean;
}

// Enhanced milestone system with more tiers
const MILESTONE_TIERS = [
  { min: 0, max: 99, name: "Starter", icon: Zap, color: "from-gray-400 to-gray-500", emoji: "⚡" },
  { min: 100, max: 299, name: "Rising", icon: Star, color: "from-blue-400 to-blue-500", emoji: "⭐" },
  { min: 300, max: 499, name: "Popular", icon: Target, color: "from-green-400 to-green-500", emoji: "🎯" },
  { min: 500, max: 999, name: "Trending", icon: Medal, color: "from-purple-400 to-purple-500", emoji: "🏅" },
  { min: 1000, max: 4999, name: "Viral", icon: Crown, color: "from-orange-400 to-red-500", emoji: "👑" },
  { min: 5000, max: 9999, name: "Legend", icon: Trophy, color: "from-yellow-400 to-orange-500", emoji: "🏆" },
  { min: 10000, max: Infinity, name: "Epic", icon: Trophy, color: "from-pink-400 to-purple-500", emoji: "💎" },
];

const VoteBadgeSystem: React.FC<VoteBadgeSystemProps> = ({
  upvotes,
  className = "",
  size = "md",
  showIcon = true,
  showCount = true,
}) => {
  // Find the appropriate tier for the current upvote count
  const currentTier = MILESTONE_TIERS.find(
    tier => upvotes >= tier.min && upvotes <= tier.max
  ) || MILESTONE_TIERS[0];

  const sizeConfig = {
    sm: {
      badge: "text-xs px-2 py-1",
      icon: "h-3 w-3",
      text: "text-xs",
    },
    md: {
      badge: "text-sm px-3 py-1.5",
      icon: "h-4 w-4",
      text: "text-sm",
    },
    lg: {
      badge: "text-base px-4 py-2",
      icon: "h-5 w-5",
      text: "text-base",
    },
  };

  const config = sizeConfig[size];
  const IconComponent = currentTier.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Badge
        className={`
          bg-gradient-to-r ${currentTier.color} 
          text-white border-0 shadow-lg font-semibold
          hover:shadow-xl transition-all duration-300
          ${config.badge}
        `}
      >
        <div className="flex items-center gap-1.5">
          {showIcon && (
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <IconComponent className={config.icon} />
            </motion.div>
          )}
          
          <span className={config.text}>
            {currentTier.name}
          </span>
          
          {showCount && (
            <>
              <span className="text-white/80">•</span>
              <span className={`font-bold ${config.text}`}>
                {upvotes.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </Badge>
    </motion.div>
  );
};

// Component to show all available badge tiers
export const VoteBadgeShowcase: React.FC = () => {
  const sampleCounts = [25, 150, 350, 750, 2500, 7500, 15000];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Vote Badge System</h3>
        <p className="text-muted-foreground">
          Dynamic badges that evolve with community engagement
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleCounts.map((count, index) => {
          const tier = MILESTONE_TIERS.find(
            t => count >= t.min && count <= t.max
          ) || MILESTONE_TIERS[0];

          return (
            <motion.div
              key={count}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="text-3xl">{tier.emoji}</div>
                <VoteBadgeSystem 
                  upvotes={count} 
                  size="md"
                  showIcon={true}
                  showCount={true}
                />
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">{tier.name} Tier</p>
                  <p className="text-xs text-muted-foreground">
                    {tier.min.toLocaleString()} - {tier.max === Infinity ? "∞" : tier.max.toLocaleString()} votes
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Size Variations */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-center">Size Variations</h4>
        <div className="flex flex-wrap justify-center items-center gap-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Small</p>
            <VoteBadgeSystem upvotes={1250} size="sm" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Medium</p>
            <VoteBadgeSystem upvotes={1250} size="md" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Large</p>
            <VoteBadgeSystem upvotes={1250} size="lg" />
          </div>
        </div>
      </div>

      {/* Configuration Examples */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-center">Configuration Options</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg space-y-3">
            <p className="font-medium">Icon Only</p>
            <VoteBadgeSystem upvotes={3500} showIcon={true} showCount={false} />
          </div>
          <div className="p-4 border rounded-lg space-y-3">
            <p className="font-medium">Count Only</p>
            <VoteBadgeSystem upvotes={3500} showIcon={false} showCount={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteBadgeSystem;
