import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  ChevronDown,
  TrendingUp,
  Sparkles,
  Clock,
  Flame,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Dialog, DialogTrigger } from "./ui/dialog";
import ProductFeed from "./ProductFeed";
import ProductSubmission from "./ProductSubmission";
import ProductGrid from "./ProductGrid";
import ActivityFeed from "./ActivityFeed";
import FloatingProductCard from "./FloatingProductCard";
import { mockProducts, categories } from "../data/mockData";

const Home = () => {
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock auth state

  // Define which categories to show by default
  const defaultCategories = ["all", "creative", "productivity", "ai"];
  const visibleCategories = showAllCategories 
    ? categories 
    : categories.filter(cat => defaultCategories.includes(cat.id));
  const hiddenCategoriesCount = categories.length - defaultCategories.length;

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "all" 
    ? mockProducts 
    : mockProducts.filter(product => 
        product.category === categories.find(cat => cat.id === selectedCategory)?.name
      );

  // Get products for different tabs
  const getProductsByTab = (tab: string) => {
    switch (tab) {
      case "trending":
        return filteredProducts.filter(p => p.isTrending).concat(
          filteredProducts.filter(p => !p.isTrending).slice(0, 3)
        );
      case "new":
        return filteredProducts.filter(p => p.isNew).concat(
          filteredProducts.filter(p => !p.isNew).slice(0, 3)
        );
      case "rising":
        return filteredProducts.filter(p => p.isRising).concat(
          filteredProducts.filter(p => !p.isRising).slice(0, 3)
        );
      default:
        return filteredProducts;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2">
              <motion.div
                className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Product Vibes
              </span>
            </a>
            <nav className="hidden md:flex gap-6">
              <motion.a 
                href="/" 
                className="text-sm font-medium hover:text-primary transition-colors relative"
                whileHover={{ y: -1 }}
              >
                Discover
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
              <motion.a
                href="/makers"
                className="text-sm font-medium hover:text-primary transition-colors relative"
                whileHover={{ y: -1 }}
              >
                Makers
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
              <motion.a
                href="/pricing"
                className="text-sm font-medium hover:text-primary transition-colors relative"
                whileHover={{ y: -1 }}
              >
                Pricing
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-[200px] lg:w-[300px] bg-muted/30 border-muted-foreground/20 focus:border-primary transition-colors"
              />
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setIsSubmissionOpen(true)}
                    className="hidden md:flex gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                  >
                    <Plus className="h-4 w-4" />
                    Drop Product
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Avatar className="h-8 w-8 border border-muted-foreground/20">
                    <AvatarImage
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=maker"
                      alt="User"
                    />
                    <AvatarFallback>MK</AvatarFallback>
                  </Avatar>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="hidden sm:flex hover:border-primary transition-colors">
                    Log in
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
                    Sign up
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        {/* Floating Product Cards */}
        <div className="absolute inset-0 pointer-events-none">
          <FloatingProductCard
            product={mockProducts[0]}
            position={{ top: "20%", left: "10%" }}
            delay={0}
            size="md"
          />
          <FloatingProductCard
            product={mockProducts[1]}
            position={{ top: "60%", right: "15%" }}
            delay={0.5}
            size="sm"
          />
          <FloatingProductCard
            product={mockProducts[2]}
            position={{ bottom: "20%", left: "5%" }}
            delay={1}
            size="lg"
          />
          <FloatingProductCard
            product={mockProducts[3]}
            position={{ top: "40%", right: "5%" }}
            delay={1.5}
            size="md"
          />
        </div>

        <div className="container px-4 py-16 md:py-12 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Drop your product. <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Catch the vibe.</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button
                size="lg"
                onClick={() => setIsSubmissionOpen(true)}
                className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                Drop Your Product
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container px-4 py-8 md:px-6 md:py-12 max-w-full overflow-hidden">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">{/* min-w-0 helps with flex overflow */}
            <div className="mb-8">
              <Tabs
                defaultValue="trending"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <TabsList className="bg-muted/50 p-1 w-fit">
                      <TabsTrigger value="trending" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                        <Flame className="h-4 w-4" />
                        Trending
                      </TabsTrigger>
                      <TabsTrigger value="new" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                        <Sparkles className="h-4 w-4" />
                        Fresh Drops
                      </TabsTrigger>
                      <TabsTrigger value="rising" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                        <TrendingUp className="h-4 w-4" />
                        Rising
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Category Filter - Collapsible with More button */}
                  <div className="w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Default Categories */}
                      {visibleCategories.map((category) => (
                        <motion.div
                          key={category.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`whitespace-nowrap relative transition-all duration-200 flex-shrink-0 ${
                              selectedCategory === category.id
                                ? `bg-gradient-to-r ${category.color} text-white border-0 hover:opacity-90`
                                : "hover:border-primary"
                            }`}
                          >
                            <span className="mr-1">{category.icon}</span>
                            {category.name}
                            {category.count > 0 && (
                              <Badge 
                                variant="secondary" 
                                className="ml-2 h-5 text-xs bg-white/20 text-white border-0"
                              >
                                {category.count}
                              </Badge>
                            )}
                          </Button>
                        </motion.div>
                      ))}

                      {/* More Button */}
                      {!showAllCategories && hiddenCategoriesCount > 0 && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAllCategories(true)}
                            className="whitespace-nowrap border-dashed hover:border-primary flex-shrink-0"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            More ({hiddenCategoriesCount})
                          </Button>
                        </motion.div>
                      )}

                      {/* Collapse Button */}
                      {showAllCategories && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAllCategories(false)}
                            className="whitespace-nowrap hover:border-primary flex-shrink-0"
                          >
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Less
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <TabsContent value="trending">
                  <ProductGrid 
                    products={getProductsByTab("trending")} 
                    category={selectedCategory !== "all" ? categories.find(c => c.id === selectedCategory)?.name : undefined}
                    onSubmitProduct={() => setIsSubmissionOpen(true)}
                  />
                </TabsContent>
                <TabsContent value="new">
                  <ProductGrid 
                    products={getProductsByTab("new")} 
                    category={selectedCategory !== "all" ? categories.find(c => c.id === selectedCategory)?.name : undefined}
                    onSubmitProduct={() => setIsSubmissionOpen(true)}
                  />
                </TabsContent>
                <TabsContent value="rising">
                  <ProductGrid 
                    products={getProductsByTab("rising")} 
                    category={selectedCategory !== "all" ? categories.find(c => c.id === selectedCategory)?.name : undefined}
                    onSubmitProduct={() => setIsSubmissionOpen(true)}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-24">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-medium">Product Vibes</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Drop your product. Catch the vibe.
              </p>
              <div className="mt-4 flex gap-2">
                <a
                  href="#"
                  className="rounded-full bg-muted p-2 text-muted-foreground hover:text-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-twitter"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                  <span className="sr-only">Twitter</span>
                </a>
                <a
                  href="#"
                  className="rounded-full bg-muted p-2 text-muted-foreground hover:text-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-github"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <span className="sr-only">GitHub</span>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium">Product</h3>
              <nav className="mt-4 flex flex-col gap-2">
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Discover
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Submit Product
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </a>
              </nav>
            </div>
            <div>
              <h3 className="text-sm font-medium">Company</h3>
              <nav className="mt-4 flex flex-col gap-2">
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Blog
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Careers
                </a>
              </nav>
            </div>
            <div>
              <h3 className="text-sm font-medium">Legal</h3>
              <nav className="mt-4 flex flex-col gap-2">
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cookie Policy
                </a>
              </nav>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2023 Product Vibes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Product Submission Dialog */}
      <ProductSubmission
        open={isSubmissionOpen}
        onOpenChange={setIsSubmissionOpen}
      />
    </div>
  );
};

export default Home;
