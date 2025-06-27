import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RotateCcw } from "lucide-react";
import VoteBadgeSystem, { VoteBadgeShowcase } from "./VoteBadgeSystem";
import EnhancedUpvoteButton from "./EnhancedUpvoteButton";

const BadgeDemo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <motion.h1 
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Badge & Upvote System
        </motion.h1>
        <motion.p 
          className="text-muted-foreground text-lg max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Explore our comprehensive voting and achievement system with milestone-driven badges, 
          gradient progress indicators, and interactive feedback
        </motion.p>
      </div>

      <Separator />

      {/* Enhanced Upvote Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Enhanced Upvote Buttons</CardTitle>
            <CardDescription>
              Interactive buttons with milestone progression and visual feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Rising Product</h3>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <EnhancedUpvoteButton
                    upvotes={347}
                    size="lg"
                    showProgress={true}
                    showMilestone={true}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Close to reaching the 400 milestone
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Viral Product</h3>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <EnhancedUpvoteButton
                    upvotes={2847}
                    size="lg"
                    showProgress={true}
                    showMilestone={true}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Progressing towards the 5K milestone
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Legendary Product</h3>
                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                  <EnhancedUpvoteButton
                    upvotes={15234}
                    size="lg"
                    showProgress={true}
                    showMilestone={true}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Elite level achievement unlocked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vote Badge System */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <VoteBadgeShowcase />
      </motion.div>

      {/* Combined Demo */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Combined System Demo</CardTitle>
            <CardDescription>
              See how badges and upvote buttons work together in product cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: "AI Writing Assistant", upvotes: 156, category: "AI Tools" },
                { name: "Design System Pro", upvotes: 743, category: "Design" },
                { name: "Task Manager 3000", upvotes: 2341, category: "Productivity" },
                { name: "Code Reviewer AI", upvotes: 8567, category: "Developer Tools" },
              ].map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-6 border rounded-xl bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <VoteBadgeSystem 
                      upvotes={product.upvotes} 
                      size="sm"
                      showIcon={true}
                      showCount={false}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>👤 John Doe</span>
                      <span>💬 12</span>
                      <span>👁 {(product.upvotes * 3.2).toFixed(0)}</span>
                    </div>
                    <EnhancedUpvoteButton
                      upvotes={product.upvotes}
                      size="md"
                      showProgress={true}
                      showMilestone={false}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Key Features</CardTitle>
            <CardDescription>
              What makes our voting system special
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 className="font-semibold">Smart Milestones</h3>
                <p className="text-sm text-muted-foreground">
                  Incremental targets that encourage engagement and celebrate achievements
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
                <h3 className="font-semibold">Visual Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Gradient fills and progress bars show advancement toward next milestone
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✨</span>
                </div>
                <h3 className="font-semibold">Smooth Animations</h3>
                <p className="text-sm text-muted-foreground">
                  Delightful particle effects and micro-interactions enhance the experience
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🏆</span>
                </div>
                <h3 className="font-semibold">Achievement System</h3>
                <p className="text-sm text-muted-foreground">
                  Tiered badges that evolve with community engagement levels
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BadgeDemo;
