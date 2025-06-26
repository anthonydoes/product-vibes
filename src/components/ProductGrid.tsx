import React from "react";
import { motion } from "framer-motion";
import { ArrowUp, MessageCircle, Eye, ExternalLink, Flame, TrendingUp, Grid3X3, List, LayoutGrid } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import EmptyState from "./EmptyState";

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  url: string;
  maker: {
    name: string;
    avatar: string;
  };
  upvotes: number;
  comments: number;
  views: number;
  category: string;
  tags: string[];
  isRising?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  launchedAt: string;
}

type ViewMode = "grid" | "list" | "compact";

interface ProductGridProps {
  products: Product[];
  category?: string;
  onSubmitProduct?: () => void;
}

const ProductCard = ({ product, viewMode }: { product: Product; viewMode: ViewMode }) => {
  const [isUpvoted, setIsUpvoted] = React.useState(false);
  const [upvoteCount, setUpvoteCount] = React.useState(product.upvotes);

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUpvoted(!isUpvoted);
    setUpvoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
  };

  // List View
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
        className="group bg-card rounded-lg border p-4 hover:shadow-md transition-all duration-200"
      >
        <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
          <div className="flex items-center gap-4">
            {/* Image */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 flex-shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base truncate">{product.name}</h3>
                    {product.isTrending && <Badge className="bg-red-500 text-white text-xs">🔥</Badge>}
                    {product.isRising && <Badge className="bg-green-500 text-white text-xs">📈</Badge>}
                    {product.isNew && <Badge className="bg-blue-500 text-white text-xs">✨</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{product.description}</p>
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
                <Button
                  size="sm"
                  variant={isUpvoted ? "default" : "outline"}
                  onClick={handleUpvote}
                  className={`ml-4 gap-1 ${isUpvoted ? "bg-gradient-to-r from-purple-500 to-blue-500" : ""}`}
                >
                  <ArrowUp className="h-3 w-3" />
                  {upvoteCount}
                </Button>
              </div>
            </div>
          </div>
        </a>
      </motion.div>
    );
  }

  // Compact Grid View
  if (viewMode === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="group bg-card rounded-xl border overflow-hidden hover:shadow-md transition-all duration-200"
      >
        <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            
            {/* Status Badge */}
            <div className="absolute top-2 left-2">
              {product.isTrending && <Badge className="bg-red-500/90 text-white text-xs border-0">🔥</Badge>}
              {product.isRising && <Badge className="bg-green-500/90 text-white text-xs border-0">📈</Badge>}
              {product.isNew && <Badge className="bg-blue-500/90 text-white text-xs border-0">✨</Badge>}
            </div>
            
            {/* Upvote Button */}
            <div className="absolute top-2 right-2">
              <Button
                size="sm"
                variant={isUpvoted ? "default" : "secondary"}
                onClick={handleUpvote}
                className={`h-8 px-2 gap-1 backdrop-blur-sm ${
                  isUpvoted ? "bg-gradient-to-r from-purple-500/90 to-blue-500/90" : "bg-white/90"
                }`}
              >
                <ArrowUp className="h-3 w-3" />
                {upvoteCount}
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-3">
            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
            
            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={product.maker.avatar} />
                  <AvatarFallback className="text-[10px]">{product.maker.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">{product.maker.name}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{product.views}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{product.comments}</span>
              </div>
            </div>
          </div>
        </a>
      </motion.div>
    );
  }

  // Default Grid View (Medium sized)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group bg-card rounded-xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
    >
      <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
        {/* Status Badges */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {product.isTrending && (
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
              <Flame className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
          {product.isRising && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <TrendingUp className="h-3 w-3 mr-1" />
              Rising
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
              ✨ Fresh
            </Badge>
          )}
        </div>

        {/* Product Image */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{product.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={product.maker.avatar} />
                <AvatarFallback className="text-xs">{product.maker.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{product.maker.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{product.views}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{product.comments}</span>
              </div>

              <Button
                size="sm"
                variant={isUpvoted ? "default" : "outline"}
                onClick={handleUpvote}
                className={`gap-1 transition-all duration-200 ${
                  isUpvoted 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" 
                    : "hover:border-primary"
                }`}
              >
                <motion.div
                  animate={{ scale: isUpvoted ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowUp className="h-3 w-3" />
                </motion.div>
                {upvoteCount}
              </Button>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
};

const ProductGrid: React.FC<ProductGridProps> = ({ products, category, onSubmitProduct }) => {
  const [viewMode, setViewMode] = React.useState<ViewMode>("compact");

  if (products.length === 0) {
    return (
      <EmptyState 
        type={category ? "category" : "general"} 
        category={category}
        onSubmitProduct={onSubmitProduct}
      />
    );
  }

  const getGridClasses = () => {
    switch (viewMode) {
      case "list":
        return "space-y-3";
      case "compact":
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4";
      case "grid":
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }
  };

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 flex-shrink-0">
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
            className="h-8 w-8 p-0"
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "ghost"}
            onClick={() => setViewMode("grid")}
            className="h-8 w-8 p-0"
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "compact" ? "default" : "ghost"}
            onClick={() => setViewMode("compact")}
            className="h-8 w-8 p-0"
            title="Compact view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products */}
      <div className={getGridClasses()}>
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ProductCard product={product} viewMode={viewMode} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
