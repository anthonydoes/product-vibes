import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RotateCcw } from "lucide-react";
import EnhancedUpvoteButton from "./EnhancedUpvoteButton";

const UpvoteDemo: React.FC = () => {
  const [demoUpvotes, setDemoUpvotes] = useState([
    { id: 1, upvotes: 45, isUpvoted: false },
    { id: 2, upvotes: 234, isUpvoted: true },
    { id: 3, upvotes: 897, isUpvoted: false },
    { id: 4, upvotes: 1543, isUpvoted: true },
    { id: 5, upvotes: 4921, isUpvoted: false },
    { id: 6, upvotes: 12453, isUpvoted: true },
  ]);

  const resetDemo = () => {
    setDemoUpvotes([
      { id: 1, upvotes: 45, isUpvoted: false },
      { id: 2, upvotes: 234, isUpvoted: true },
      { id: 3, upvotes: 897, isUpvoted: false },
      { id: 4, upvotes: 1543, isUpvoted: true },
      { id: 5, upvotes: 4921, isUpvoted: false },
      { id: 6, upvotes: 12453, isUpvoted: true },
    ]);
  };

  const handleUpvote = (id: number) => {
    setDemoUpvotes(prev => 
      prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              isUpvoted: !item.isUpvoted,
              upvotes: item.isUpvoted ? item.upvotes - 1 : item.upvotes + 1
            }
          : item
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <motion.h1 
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Enhanced Upvote System
        </motion.h1>
        <motion.p 
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Experience our milestone-driven upvote buttons with gradient progress fills and achievement badges
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button onClick={resetDemo} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset Demo
          </Button>
        </motion.div>
      </div>

      <Separator />

      {/* Feature Overview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Key Features</CardTitle>
            <CardDescription>
              Interactive upvote buttons with milestone progression and visual feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  🎯 Milestone System
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Incremental milestones: 100, 200, 300, 400, 500, 1K, 5K, 10K, 25K, 50K, 100K+
                </p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  📊 Progress Visualization
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Gradient fills show progress toward next milestone with smooth animations
                </p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  🏆 Achievement Badges
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Dynamic badges with tier levels: ⚡x3 (level 3 bolt), 🎯x2 (level 2 target), 🏆x1 (level 1 trophy)
                </p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  ✨ Smooth Animations
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Particle effects, scaling animations, and hover interactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Size Variations */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Size Variations</CardTitle>
            <CardDescription>Different sizes for various use cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Small</h3>
                <EnhancedUpvoteButton
                  upvotes={156}
                  size="sm"
                  showProgress={true}
                  showMilestone={true}
                />
                <p className="text-xs text-muted-foreground">
                  Perfect for compact layouts and list views
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Medium</h3>
                <EnhancedUpvoteButton
                  upvotes={892}
                  size="md"
                  showProgress={true}
                  showMilestone={true}
                />
                <p className="text-xs text-muted-foreground">
                  Ideal for product cards and grid layouts
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <h3 className="font-semibold">Large</h3>
                <EnhancedUpvoteButton
                  upvotes={2341}
                  size="lg"
                  showProgress={true}
                  showMilestone={true}
                />
                <p className="text-xs text-muted-foreground">
                  Great for featured products and detail pages
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Demo Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
            <CardDescription>
              Click on any upvote button to see the animations and milestone progression
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoUpvotes.map((demo, index) => (
                <motion.div
                  key={demo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📦</span>
                    </div>
                    <h4 className="font-medium text-center">Product {demo.id}</h4>
                    <EnhancedUpvoteButton
                      upvotes={demo.upvotes}
                      isUpvoted={demo.isUpvoted}
                      onUpvote={() => handleUpvote(demo.id)}
                      size="md"
                      showProgress={true}
                      showMilestone={true}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Milestone Reference */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Milestone Reference</CardTitle>
            <CardDescription>Achievement levels and their corresponding badges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">Starter Levels</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">⚡</span>
                    <span>100 - 900 upvotes</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Blue gradient badges: ⚡x1, ⚡x2, ⚡x3, ⚡x4, ⚡x5
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-600">Growth Levels</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-500">🎯</span>
                    <span>1K - 9K upvotes</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Purple gradient badges: 🎯x1, 🎯x2, 🎯x3, 🎯x4, 🎯x5
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-yellow-600">Elite Levels</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">🏆</span>
                    <span>10K+ upvotes</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Gold gradient badges: 🏆x1, 🏆x2, 🏆x3, 🏆x4, 🏆x5
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UpvoteDemo;
