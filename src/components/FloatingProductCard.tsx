import React from "react";
import { motion } from "framer-motion";

interface FloatingProductCardProps {
  product: {
    name: string;
    image: string;
    category: string;
  };
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  delay?: number;
  size?: "sm" | "md" | "lg";
}

const FloatingProductCard: React.FC<FloatingProductCardProps> = ({
  product,
  position,
  delay = 0,
  size = "md"
}) => {
  const sizeClasses = {
    sm: "w-24 h-16",
    md: "w-32 h-20",
    lg: "w-40 h-24"
  };

  return (
    <motion.div
      className={`absolute ${sizeClasses[size]} rounded-xl overflow-hidden shadow-lg border border-white/20 backdrop-blur-sm bg-white/10`}
      style={position}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 0.7, 
        scale: 1, 
        y: [0, -10, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{
        opacity: { delay, duration: 0.6 },
        scale: { delay, duration: 0.6 },
        y: { 
          delay: delay + 1, 
          duration: 4, 
          repeat: Infinity, 
          repeatType: "reverse" 
        },
        rotate: { 
          delay: delay + 1, 
          duration: 6, 
          repeat: Infinity, 
          repeatType: "reverse" 
        }
      }}
      whileHover={{ 
        opacity: 0.9, 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-1 left-1 right-1">
        <p className="text-white text-xs font-medium truncate">
          {product.name}
        </p>
        <p className="text-white/80 text-xs truncate">
          {product.category}
        </p>
      </div>
    </motion.div>
  );
};

export default FloatingProductCard;
