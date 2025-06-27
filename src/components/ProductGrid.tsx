import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import EmptyState from "./EmptyState";
import EnhancedUpvoteButton from "./EnhancedUpvoteButton";
import { categoryConfig } from "../data/categories";
import type { Database } from "../types/supabase";

type Product = Database['public']['Tables']['products']['Row'] & {
  profiles?: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  category?: string;
  onSubmitProduct: () => void;
}

const ProductCard = ({ product }: { product: Product }) => {
  const [isUpvoted, setIsUpvoted] = React.useState(false);
  const [upvoteCount, setUpvoteCount] = React.useState(product.upvotes);

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
    setUpvoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
  };

  // Helper function to get creator info
  const getCreatorName = () => {
    // If profile is missing, fall back to a default name
    if (!product.profiles) {
      return 'Anonymous Creator';
    }
    return product.profiles.full_name || product.profiles.username || 'Anonymous';
  };

  const getCreatorAvatar = () => {
    // If profile is missing, generate avatar from creator_id
    if (!product.profiles?.avatar_url) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.creator_id}`;
    }
    return product.profiles.avatar_url;
  };

  // Helper function to get category color
  const getCategoryColor = () => {
    const categoryData = categoryConfig.find(cat => cat.id === product.category);
    return categoryData?.color || "from-gray-500 to-gray-600";
  };

  // Helper function to get category icon
  const getCategoryIcon = () => {
    const categoryData = categoryConfig.find(cat => cat.id === product.category);
    return categoryData?.icon || "📦";
  };

  const getCreatorInitials = () => {
    const name = getCreatorName();
    return name.slice(0, 2).toUpperCase();
  };

  // Check if product was launched today (new)
  const isNew = () => {
    const today = new Date();
    const launchDate = new Date(product.created_at);
    const timeDiff = today.getTime() - launchDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 1;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group bg-card rounded-2xl border hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <div className="p-4 sm:p-6">
        {/* Header Row - Logo, Title, Badges */}
        <div className="flex items-start gap-3 mb-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 border shadow-sm">
              {product.logo_url ? (
                <img src={product.logo_url} alt={product.name} className="w-full h-full object-cover" />
              ) : product.product_images && product.product_images.length > 0 ? (
                <img src={product.product_images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg text-muted-foreground">
                  📦
                </div>
              )}
            </div>
          </div>
          
          {/* Title and Badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              {/* Title */}
              <div className="flex-1 min-w-0">
                {product.website_url ? (
                  <a 
                    href={product.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 hover:text-primary transition-colors group/link"
                  >
                    <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover/link:text-primary transition-colors truncate">
                      {product.name}
                    </h3>
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-all" />
                  </a>
                ) : (
                  <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">{product.name}</h3>
                )}
              </div>
              
              {/* Status Badges - Mobile: Stack vertically, Desktop: Horizontal */}
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-1.5 flex-shrink-0">
                {product.is_trending && (
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs border-0 shadow-sm whitespace-nowrap">
                    🔥
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs border-0 shadow-sm whitespace-nowrap">
                    ⭐
                  </Badge>
                )}
                {isNew() && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs border-0 shadow-sm whitespace-nowrap">
                    ✨
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Bottom Row - Creator, Date, Category, Upvote */}
        <div className="flex items-center justify-between gap-3">
          {/* Creator Info, Date, and Category - All on same line */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-5 w-5 sm:h-6 sm:w-6 border flex-shrink-0">
              <AvatarImage src={getCreatorAvatar()} />
              <AvatarFallback className="text-[10px] font-medium">{getCreatorInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 min-w-0 flex-1 text-xs text-muted-foreground">
              <span className="font-medium truncate">{getCreatorName()}</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-muted-foreground whitespace-nowrap">
                {new Date(product.created_at).toLocaleDateString()}
              </span>
              <span className="text-muted-foreground/60">•</span>
              <div className={`inline-block p-0.5 rounded-md bg-gradient-to-r ${getCategoryColor()} flex-shrink-0`}>
                <Badge 
                  variant="outline" 
                  className="bg-background/95 backdrop-blur-sm text-foreground border-0 text-xs font-medium px-2 py-0.5 rounded-md"
                >
                  <span className="mr-1">{getCategoryIcon()}</span>
                  {product.category}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Upvote Button */}
          <div className="flex-shrink-0">
            <EnhancedUpvoteButton
              upvotes={upvoteCount}
              isUpvoted={isUpvoted}
              onUpvote={handleUpvote}
              size="sm"
              showProgress={true}
              showMilestone={true}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, category, onSubmitProduct }) => {
  console.log('ProductGrid received:', products.length, 'products')
  console.log('Sample product for display:', products[0])
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-2xl border p-4 sm:p-6 animate-pulse">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-muted rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-4 sm:h-5 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
              <div className="w-8 h-6 bg-muted rounded flex-shrink-0" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-muted rounded-full" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
              <div className="w-12 h-8 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState 
        type={category ? "category" : "general"} 
        category={category}
        onSubmitProduct={onSubmitProduct}
      />
    );
  }

  return (
    <div>
      {/* Products Grid - Mobile First, Two Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
