import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronUp, Trophy, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedUpvoteButtonProps {
  upvotes: number;
  isUpvoted?: boolean;
  onUpvote?: () => void;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  showMilestone?: boolean;
  className?: string;
}

// Milestone configuration with incremental values
const MILESTONES = [100, 200, 300, 400, 500, 1000, 5000, 10000, 25000, 50000, 100000];

const EnhancedUpvoteButton: React.FC<EnhancedUpvoteButtonProps> = ({
  upvotes,
  isUpvoted = false,
  onUpvote,
  size = "md",
  showProgress = true,
  showMilestone = true,
  className,
}) => {
  const [localUpvoted, setLocalUpvoted] = useState(isUpvoted);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);

  // Calculate milestone progress
  const milestoneData = useMemo(() => {
    const currentMilestone = MILESTONES.find(milestone => localUpvotes < milestone) || MILESTONES[MILESTONES.length - 1];
    const previousMilestone = MILESTONES[MILESTONES.indexOf(currentMilestone) - 1] || 0;
    const progress = ((localUpvotes - previousMilestone) / (currentMilestone - previousMilestone)) * 100;
    
    return {
      current: currentMilestone,
      previous: previousMilestone,
      progress: Math.min(Math.max(progress, 0), 100),
      isComplete: localUpvotes >= currentMilestone,
    };
  }, [localUpvotes]);

  // Get milestone achievement badge
  const getMilestoneBadge = () => {
    const achievedMilestones = MILESTONES.filter(milestone => localUpvotes >= milestone);
    const highestAchieved = achievedMilestones[achievedMilestones.length - 1];
    
    if (!highestAchieved) return null;
    
    // Calculate tier and level count
    let tierLevel, icon, color;
    
    if (highestAchieved >= 10000) {
      // Elite tier (10K+): Trophy level
      tierLevel = Math.floor(achievedMilestones.length / 3) + 1; // Groups of 3 milestones = 1 level
      tierLevel = Math.min(tierLevel, 5); // Max level 5
      icon = Trophy;
      color = "from-yellow-400 to-orange-500";
    } else if (highestAchieved >= 1000) {
      // Growth tier (1K-9K): Target level  
      tierLevel = Math.floor((achievedMilestones.length - 5) / 2) + 1; // Milestones 6+ grouped by 2
      tierLevel = Math.min(tierLevel, 5); // Max level 5
      icon = Target;
      color = "from-purple-500 to-pink-500";
    } else {
      // Starter tier (100-900): Bolt level
      tierLevel = achievedMilestones.length; // 1 level per milestone achieved
      tierLevel = Math.min(tierLevel, 5); // Max level 5
      icon = Zap;
      color = "from-blue-500 to-cyan-500";
    }
    
    return {
      milestone: highestAchieved,
      tierLevel,
      icon,
      color
    };
  };

  const handleUpvote = () => {
    if (onUpvote) {
      onUpvote();
    } else {
      setLocalUpvoted(!localUpvoted);
      setLocalUpvotes(prev => localUpvoted ? prev - 1 : prev + 1);
    }
  };

  const sizeConfig = {
    sm: {
      button: "h-6 px-2 text-xs gap-1",
      icon: "h-3 w-3",
      progress: "h-1",
      badge: "text-xs px-1.5 py-0.5",
    },
    md: {
      button: "h-8 px-3 text-sm gap-1.5",
      icon: "h-4 w-4",
      progress: "h-1.5",
      badge: "text-xs px-2 py-0.5",
    },
    lg: {
      button: "h-10 px-4 text-base gap-2",
      icon: "h-5 w-5",
      progress: "h-2",
      badge: "text-sm px-2.5 py-1",
    },
  };

  const config = sizeConfig[size];
  const milestoneBadge = getMilestoneBadge();

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col items-end gap-1", className)}>
        {/* Milestone Badge */}
        <AnimatePresence>
          {showMilestone && milestoneBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <Badge
                className={cn(
                  "bg-gradient-to-r text-white border-0 shadow-lg",
                  milestoneBadge.color,
                  config.badge
                )}
              >
                <milestoneBadge.icon className={cn("mr-1", size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} />
                x{milestoneBadge.tierLevel}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Button
                variant={localUpvoted ? "default" : "outline"}
                size="sm"
                onClick={handleUpvote}
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  config.button,
                  localUpvoted
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg"
                    : "hover:border-primary hover:bg-primary/5"
                )}
              >
                {/* Progress Fill Background */}
                {showProgress && !localUpvoted && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 transition-all duration-500"
                    style={{
                      width: `${milestoneData.progress}%`,
                      opacity: milestoneData.progress > 0 ? 0.6 : 0,
                    }}
                  />
                )}

                {/* Animated Icon */}
                <motion.div
                  animate={{
                    scale: localUpvoted ? [1, 1.3, 1] : 1,
                    rotate: localUpvoted ? [0, 10, 0] : 0,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <ChevronUp
                    className={cn(
                      config.icon,
                      localUpvoted ? "text-white" : "text-current"
                    )}
                  />
                </motion.div>

                {/* Vote Count */}
                <span className="relative z-10 font-semibold">
                  {localUpvotes.toLocaleString()}
                </span>

                {/* Particle Effect */}
                <AnimatePresence>
                  {localUpvoted && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                    >
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full"
                          initial={{
                            x: "50%",
                            y: "50%",
                            scale: 0,
                          }}
                          animate={{
                            x: `${50 + (Math.random() - 0.5) * 200}%`,
                            y: `${50 + (Math.random() - 0.5) * 200}%`,
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 0.8,
                            delay: i * 0.1,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="text-center">
              <p className="font-medium">
                {localUpvoted ? "Thanks for your vote!" : "Upvote this product"}
              </p>
              {showProgress && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{milestoneData.previous.toLocaleString()}</span>
                    <span>{milestoneData.current.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${milestoneData.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.ceil(milestoneData.current - localUpvotes)} votes to next milestone
                  </p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Progress Bar (External) */}
        {showProgress && size !== "sm" && (
          <div className="w-full max-w-[100px] space-y-1">
            <div className={cn("w-full bg-gray-200 dark:bg-gray-700 rounded-full", config.progress)}>
              <motion.div
                className={cn("bg-gradient-to-r from-purple-500 to-blue-500 rounded-full", config.progress)}
                initial={{ width: 0 }}
                animate={{ width: `${milestoneData.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{milestoneData.previous.toLocaleString()}</span>
              <span>{milestoneData.current.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedUpvoteButton;
