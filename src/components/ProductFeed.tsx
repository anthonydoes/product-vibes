import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  maker: {
    name: string;
    avatarUrl: string;
  };
  upvotes: number;
  category: string;
  tags: string[];
  createdAt: string;
}

interface ProductFeedProps {
  feedType: "trending" | "new" | "rising";
}

const ProductFeed = ({ feedType }: ProductFeedProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Mock categories
  const categories = [
    { id: "all", name: "All" },
    { id: "creative", name: "🎨 Creative Tools" },
    { id: "productivity", name: "🚀 Productivity" },
    { id: "games", name: "🎮 Fun & Games" },
    { id: "dev", name: "🛠️ Developer Tools" },
    { id: "ai", name: "💡 AI-Powered" },
    { id: "side-projects", name: "🌱 Side Projects" },
  ];

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: "1",
      title: "DesignFlow AI",
      description: "Generate stunning UI designs with AI in seconds",
      imageUrl:
        "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&q=80",
      maker: {
        name: "Sarah Chen",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      },
      upvotes: 342,
      category: "creative",
      tags: ["design", "ai", "productivity"],
      createdAt: "2023-05-15",
    },
    {
      id: "2",
      title: "CodeBuddy",
      description: "Your AI pair programming assistant that learns your style",
      imageUrl:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      maker: {
        name: "Alex Morgan",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      },
      upvotes: 287,
      category: "dev",
      tags: ["development", "ai", "tools"],
      createdAt: "2023-05-20",
    },
    {
      id: "3",
      title: "TaskMaster Pro",
      description: "The ultimate productivity system for busy professionals",
      imageUrl:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
      maker: {
        name: "Jamie Wilson",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jamie",
      },
      upvotes: 198,
      category: "productivity",
      tags: ["productivity", "organization", "tasks"],
      createdAt: "2023-05-25",
    },
    {
      id: "4",
      title: "PixelPulse",
      description: "Create animated pixel art with intuitive tools",
      imageUrl:
        "https://images.unsplash.com/photo-1563207153-f403bf289096?w=800&q=80",
      maker: {
        name: "Taylor Reed",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=taylor",
      },
      upvotes: 156,
      category: "creative",
      tags: ["art", "design", "animation"],
      createdAt: "2023-06-01",
    },
    {
      id: "5",
      title: "MindQuest VR",
      description: "Educational VR games that make learning fun",
      imageUrl:
        "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
      maker: {
        name: "Jordan Lee",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan",
      },
      upvotes: 231,
      category: "games",
      tags: ["education", "vr", "games"],
      createdAt: "2023-06-05",
    },
    {
      id: "6",
      title: "DataSense",
      description: "Visualize complex data with beautiful interactive charts",
      imageUrl:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      maker: {
        name: "Casey Kim",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=casey",
      },
      upvotes: 175,
      category: "dev",
      tags: ["data", "visualization", "analytics"],
      createdAt: "2023-06-10",
    },
  ];

  // Simulate fetching products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Apply sorting based on feed type
        let filteredProducts = [...mockProducts];
        switch (feedType) {
          case "trending":
            filteredProducts.sort((a, b) => b.upvotes - a.upvotes);
            break;
          case "new":
            filteredProducts.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
            break;
          case "rising":
            // For demo, just a different sort
            filteredProducts.sort(
              (a, b) =>
                b.upvotes /
                  (new Date().getTime() - new Date(b.createdAt).getTime()) -
                a.upvotes /
                  (new Date().getTime() - new Date(a.createdAt).getTime()),
            );
            break;
        }

        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [feedType]);

  // Simulate loading more products
  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add more mock products
      const moreProducts = mockProducts.map((p) => ({
        ...p,
        id: `${p.id}-more-${Math.random().toString(36).substring(7)}`,
      }));

      setProducts((prev) => [...prev, ...moreProducts]);
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-background">
      {/* Products grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground">
            Try changing your filters or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Load more button */}
      {products.length > 0 && (
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-w-[200px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Products"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFeed;
