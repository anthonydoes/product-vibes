import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronDown,
  TrendingUp,
  Sparkles,
  Flame,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import ProductSubmission from "./ProductSubmission";
import ProductGrid from "./ProductGrid";
import ActivityFeed from "./ActivityFeed";
import FloatingProductCard from "./FloatingProductCard";
import AuthModal from "./AuthModal";
import Header from "./Header";
import { useAuthContext } from "../contexts/AuthContext";
import { useProductsByTab } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { categoryConfig } from "../data/categories";

const Home = () => {
  const { user, loading, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Fetch categories with counts
  const { categories, loading: categoriesLoading } = useCategories();
  
  // Fetch products based on active tab and selected category
  const { products, loading: productsLoading, refetch } = useProductsByTab(activeTab, selectedCategory);

  // Define which categories to show by default (max 5 tags)
  const defaultCategories = ["all", "Creative Tools", "Productivity", "AI-Powered", "Fun & Games"];
  const visibleCategories = showAllCategories 
    ? categories 
    : categories.filter(cat => defaultCategories.includes(cat.id));
  const hiddenCategoriesCount = categories.length - defaultCategories.length;

  // Calculate filtered product count and description
  const getResultCountDescription = () => {
    if (productsLoading) return "Loading...";
    
    const filteredCount = products.length;
    const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
    const categoryName = selectedCategoryData?.name || "All";
    
    if (filteredCount === 0) {
      return selectedCategory === "all" ? "No products found" : `No ${categoryName} products found`;
    }
    
    if (selectedCategory === "all") {
      return `${filteredCount} ${filteredCount === 1 ? 'Product' : 'Products'}`;
    }
    
    return `${filteredCount} ${categoryName} ${filteredCount === 1 ? 'Product' : 'Products'}`;
  };

  // Handle product submission success
  const handleProductSubmitted = (productData?: { id: string; slug: string }) => {
    console.log('Product submitted successfully:', productData);
    
    setIsSubmissionOpen(false);
    
    // Navigate to the newly created product page
    if (productData?.slug) {
      navigate(`/product/${productData.slug}`);
    } else {
      // Fallback: refresh the current view if no product data
      console.log('No product data provided, refreshing list...');
      setActiveTab("new");
      setSelectedCategory("all");
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  };

  // Handle opening submission modal
  const handleOpenSubmission = () => {
    console.log('Opening submission modal...');
    setIsSubmissionOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <Header 
        onOpenSubmission={handleOpenSubmission}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        {/* Floating Product Cards - Disabled for now while using real data */}
        {/*
        <div className="absolute inset-0 pointer-events-none">
          {products.length > 0 && (
            <>
              <FloatingProductCard
                product={products[0]}
                position={{ top: "20%", left: "10%" }}
                delay={0}
                size="md"
              />
              {products.length > 1 && (
                <FloatingProductCard
                  product={products[1]}
                  position={{ top: "60%", right: "15%" }}
                  delay={0.5}
                  size="sm"
                />
              )}
              {products.length > 2 && (
                <FloatingProductCard
                  product={products[2]}
                  position={{ bottom: "20%", left: "5%" }}
                  delay={1}
                  size="lg"
                />
              )}
              {products.length > 3 && (
                <FloatingProductCard
                  product={products[3]}
                  position={{ top: "40%", right: "5%" }}
                  delay={1.5}
                  size="md"
                />
              )}
            </>
          )}
        </div>
        */}

        <div className="container px-4 py-12 md:py-8 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
            <motion.h1 
              className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl mb-6"
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
                onClick={handleOpenSubmission}
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
      <main className="container px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-12 max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">{/* min-w-0 helps with flex overflow */}
            <div className="mb-6 sm:mb-8">
              <Tabs
                defaultValue="trending"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-0">
                    <TabsList className="bg-muted/50 w-full sm:w-fit p-0">
                      <TabsTrigger value="trending" className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
                        <Flame className="h-4 w-4" />
                        Trending
                      </TabsTrigger>
                      <TabsTrigger value="new" className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                        <Sparkles className="h-4 w-4" />
                        Fresh Drops
                      </TabsTrigger>
                      <TabsTrigger value="rising" className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
                        <TrendingUp className="h-4 w-4" />
                        Rising
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Category Filter - Mobile Optimized */}
                  <div className="w-full">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-start">
                      {/* Default Categories */}
                      {visibleCategories.map((category) => (
                        <motion.div
                          key={category.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCategory(category.id)}
                            className={`whitespace-nowrap relative transition-all duration-300 ease-in-out flex-shrink-0 text-xs sm:text-sm ${
                              selectedCategory === category.id
                                ? `bg-gradient-to-r ${category.color} text-white border-transparent hover:opacity-90 shadow-sm`
                                : "bg-background border-border text-foreground hover:border-primary hover:text-primary hover:bg-accent/50"
                            }`}
                          >
                            <span className="mr-1">{category.icon}</span>
                            <span className="truncate max-w-[80px] sm:max-w-none">{category.name}</span>
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
                            className="whitespace-nowrap border-dashed hover:border-primary flex-shrink-0 text-xs sm:text-sm"
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
                            className="whitespace-nowrap hover:border-primary flex-shrink-0 text-xs sm:text-sm"
                          >
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Less
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Result Count Display */}
                  <div className="pt-2 border-t border-muted/30">
                    <p className="text-sm text-muted-foreground font-medium">
                      {getResultCountDescription()}
                    </p>
                  </div>
                </div>

                <TabsContent value="trending">
                  <ProductGrid 
                    products={products} 
                    loading={productsLoading}
                    category={selectedCategory !== "all" ? selectedCategory : undefined}
                    onSubmitProduct={handleOpenSubmission}
                  />
                </TabsContent>
                <TabsContent value="new">
                  <ProductGrid 
                    products={products} 
                    loading={productsLoading}
                    category={selectedCategory !== "all" ? selectedCategory : undefined}
                    onSubmitProduct={handleOpenSubmission}
                  />
                </TabsContent>
                <TabsContent value="rising">
                  <ProductGrid 
                    products={products} 
                    loading={productsLoading}
                    category={selectedCategory !== "all" ? selectedCategory : undefined}
                    onSubmitProduct={handleOpenSubmission}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Activity Sidebar - Hidden on mobile */}
          <div className="hidden xl:block w-80">
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
        onSuccess={handleProductSubmitted}
      />

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          defaultTab={authModalTab}
        />
      )}

      {/* Product Submission Modal */}
      {user && (
        <ProductSubmission
          open={isSubmissionOpen}
          onOpenChange={setIsSubmissionOpen}
          onSuccess={handleProductSubmitted}
        />
      )}
    </div>
  );
};

export default Home;
