import React from "react";
import { motion } from "framer-motion";
import { Plus, Search, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  type: "category" | "search" | "general";
  category?: string;
  onSubmitProduct?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, category, onSubmitProduct }) => {
  const getContent = () => {
    switch (type) {
      case "category":
        return {
          icon: <Search className="h-12 w-12 text-muted-foreground/50" />,
          title: `No products in ${category} yet`,
          description: "Be the first to drop something amazing in this category!",
          action: {
            text: "Drop Your Product",
            icon: <Plus className="h-4 w-4" />,
            onClick: onSubmitProduct
          }
        };
      case "search":
        return {
          icon: <Search className="h-12 w-12 text-muted-foreground/50" />,
          title: "No products found",
          description: "Try adjusting your search or explore different categories",
          action: null
        };
      default:
        return {
          icon: <TrendingUp className="h-12 w-12 text-muted-foreground/50" />,
          title: "Getting ready...",
          description: "Amazing products are coming soon!",
          action: {
            text: "Be the First to Launch",
            icon: <Plus className="h-4 w-4" />,
            onClick: onSubmitProduct
          }
        };
    }
  };

  const content = getContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        {content.icon}
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl font-semibold text-center mb-2"
      >
        {content.title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-muted-foreground text-center mb-6 max-w-md"
      >
        {content.description}
      </motion.p>
      
      {content.action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            onClick={content.action.onClick}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          >
            {content.action.icon}
            {content.action.text}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
