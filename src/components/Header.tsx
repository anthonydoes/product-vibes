import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AvatarGenerator } from '../utils/avatarGenerator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useAuthContext } from "../contexts/AuthContext";

interface HeaderProps {
  onOpenSubmission?: () => void;
  onOpenAuth?: (tab: 'signin' | 'signup') => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSubmission, onOpenAuth }) => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleDropProduct = () => {
    if (user) {
      onOpenSubmission?.();
    } else {
      onOpenAuth?.('signin');
    }
  };

  const handleLogin = () => {
    onOpenAuth?.('signin');
  };

  return (
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
              href="/upvote-demo"
              className="text-sm font-medium hover:text-primary transition-colors relative"
              whileHover={{ y: -1 }}
            >
              Upvote Demo
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

          {/* Drop Product Button - Always visible */}
          <Button
            onClick={handleDropProduct}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Drop Product
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Avatar className="h-8 w-8 border border-muted-foreground/20 cursor-pointer">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || AvatarGenerator.generateFunAvatar(user.email || user.id || 'default')}
                      alt="User"
                    />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <span className="font-medium">{user.user_metadata?.username || user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div className="relative p-[2px] rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200">
                <Button 
                  variant="ghost"
                  className="relative bg-background hover:bg-transparent hover:text-white w-full h-full rounded-[calc(0.5rem-2px)] transition-all duration-200"
                  onClick={handleLogin}
                >
                  <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent hover:text-white font-medium transition-all duration-200">
                    Login
                  </span>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
