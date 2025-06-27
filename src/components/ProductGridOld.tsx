import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Eye, ExternalLink } from "lucide-react";
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
  products: Product[];
  category?: string;
  onSubmitProduct?: () => void;
}

const ProductCard = ({ product }: { product: Product }) => {
  const [isUpvoted, setIsUpvoted] = React.useState(false);
  const [upvoteCount, setUpvoteCount] = React.useState(product.upvotes);

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
    setUpvoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
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
        {/* Image */}
        <a href={product.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </a>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base truncate hover:text-primary transition-colors">{product.name}</h3>
                  {product.isTrending && <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs border-0">🔥 Trending</Badge>}
                  {product.isRising && <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs border-0">📈 Rising</Badge>}
                  {product.isNew && <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs border-0">✨ Fresh</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{product.description}</p>
              </a>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={product.maker.avatar} />
                    <AvatarFallback className="text-[10px]">{product.maker.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{product.maker.name}</span>
                </div>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{product.views}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{product.comments}</span>
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

const ProductGrid: React.FC<ProductGridProps> = ({ products, category, onSubmitProduct }) => {
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
