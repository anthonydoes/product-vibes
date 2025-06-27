import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import EmptyState from "./EmptyState";
import EnhancedUpvoteButton from "./EnhancedUpvoteButton";
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
    return product.profiles?.full_name || product.profiles?.username || 'Anonymous';
  };

  const getCreatorAvatar = () => {
    return product.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.creator_id}`;
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      className="group bg-card rounded-lg border p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 border">
            {product.logo_url ? (
              <img src={product.logo_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                📦
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {product.website_url ? (
                  <a 
                    href={product.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <h3 className="font-semibold text-base truncate">{product.name}</h3>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <h3 className="font-semibold text-base truncate">{product.name}</h3>
                )}
                
                {/* Badges */}
                {product.is_trending && (
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs border-0">
                    🔥 Trending
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs border-0">
                    ⭐ Featured
                  </Badge>
                )}
                {isNew() && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs border-0">
                    ✨ Fresh
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={getCreatorAvatar()} />
                    <AvatarFallback className="text-[10px]">{getCreatorInitials()}</AvatarFallback>
                  </Avatar>
                  <span>{getCreatorName()}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
                <span className="text-muted-foreground">
                  {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {/* Upvote */}
            <EnhancedUpvoteButton
              upvotes={upvoteCount}
              isUpvoted={isUpvoted}
              onUpvote={handleUpvote}
              size="sm"
              showProgress={true}
              showMilestone={true}
              className="ml-4"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, category, onSubmitProduct }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/4" />
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
      {/* Products List */}
      <div className="space-y-3">
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
