import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageSquare, Share2 } from "lucide-react";
import EnhancedUpvoteButton from "./EnhancedUpvoteButton";

interface ProductCardProps {
  id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  upvotes?: number;
  comments?: number;
  category?: string[];
  maker?: {
    name?: string;
    avatar?: string;
  };
  isNew?: boolean;
  isTrending?: boolean;
  product?: {
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
  };
}

const ProductCard = ({
  id = "product-1",
  title = "Awesome Product",
  description = "This is an amazing product that solves a real problem for users with its innovative approach.",
  imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&q=80",
  upvotes = 42,
  comments = 12,
  category = ["Productivity", "AI-Powered"],
  maker = {
    name: "Jane Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  isNew = false,
  isTrending = false,
  product,
}: ProductCardProps) => {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [currentUpvotes, setCurrentUpvotes] = useState(0);

  // Use product data if provided, otherwise use individual props
  const cardData = product
    ? {
        id: product.id,
        title: product.title,
        description: product.description,
        imageUrl: product.imageUrl,
        upvotes: product.upvotes,
        comments: Math.floor(Math.random() * 20) + 1, // Mock comments
        category: [product.category, ...product.tags.slice(0, 1)],
        maker: {
          name: product.maker.name,
          avatar: product.maker.avatarUrl,
        },
        isNew:
          new Date(product.createdAt) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isTrending: product.upvotes > 200,
      }
    : {
        id,
        title,
        description,
        imageUrl,
        upvotes,
        comments,
        category,
        maker,
        isNew,
        isTrending,
      };

  // Initialize current upvotes
  React.useEffect(() => {
    setCurrentUpvotes(cardData.upvotes);
  }, [cardData.upvotes]);

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
    setCurrentUpvotes(prev => isUpvoted ? prev - 1 : prev + 1);
  };

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="h-full"
      >
        <Card className="overflow-hidden h-full bg-white border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group">
          <div className="flex gap-3 p-3">
            {/* Image */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                <img
                  src={cardData.imageUrl}
                  alt={cardData.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {(cardData.isNew || cardData.isTrending) && (
                <div className="absolute -top-1 -right-1 flex gap-1">
                  {cardData.isNew && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-500 text-white hover:bg-blue-600 text-[10px] px-1 py-0.5 h-4"
                    >
                      New
                    </Badge>
                  )}
                  {cardData.isTrending && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-500 text-white hover:bg-orange-600 text-[10px] px-1 py-0.5 h-4"
                    >
                      🔥
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Avatar className="h-4 w-4 flex-shrink-0">
                    <AvatarImage
                      src={cardData.maker.avatar}
                      alt={cardData.maker.name}
                    />
                    <AvatarFallback className="text-[10px]">
                      {cardData.maker.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {cardData.maker.name}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {cardData.category.slice(0, 1).map((cat, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0.5 h-4"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Title and Description */}
              <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {cardData.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {cardData.description}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <EnhancedUpvoteButton
                    upvotes={currentUpvotes}
                    isUpvoted={isUpvoted}
                    onUpvote={handleUpvote}
                    size="sm"
                    showProgress={true}
                    showMilestone={true}
                    className="flex-shrink-0"
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 px-1.5 h-6 text-[11px] hover:bg-primary/10 hover:text-primary"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>{cardData.comments}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View comments</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this product</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default ProductCard;
