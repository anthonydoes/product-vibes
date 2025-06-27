import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe,
  Calendar,
  Package,
  Heart,
  Eye,
  ExternalLink,
  User,
  Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { useAuthContext } from "../contexts/AuthContext";
import { ProductService } from "../services/productService";
import { UserService } from "../services/userService";
import { AvatarGenerator } from "../utils/avatarGenerator";
import Header from "./Header";
import AuthModal from "./AuthModal";
import { categoryConfig } from "../data/categories";
import type { Database } from "../types/supabase";

type Profile = Database['public']['Tables']['profiles']['Row']
type Product = Database['public']['Tables']['products']['Row'] & {
  profiles?: Profile | null
}

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuthContext();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await UserService.getPublicProfile(username);
      
      if (profileError || !profileData) {
        setError('User not found');
        return;
      }
      
      setProfile(profileData);
      
      // Fetch user's products
      const { data: productsData } = await ProductService.getProducts({
        creatorId: profileData.id,
        limit: 50 // Get all user's products
      });
      
      setProducts(productsData || []);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const getUserStats = () => {
    const totalUpvotes = products.reduce((sum, product) => sum + (product.upvotes || 0), 0);
    const totalViews = products.reduce((sum, product) => sum + (product.view_count || 0), 0);
    const featuredProducts = products.filter(p => p.is_featured).length;
    const trendingProducts = products.filter(p => p.is_trending).length;
    
    return {
      totalProducts: products.length,
      totalUpvotes,
      totalViews,
      featuredProducts,
      trendingProducts
    };
  };

  const getCategoryInfo = (categoryId: string) => {
    return categoryConfig.find(cat => cat.id === categoryId) || 
           { name: categoryId, icon: '📦', color: 'bg-gray-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onOpenSubmission={() => {}}
          onOpenAuth={(tab) => {
            setAuthModalTab(tab);
            setIsAuthModalOpen(true);
          }}
        />
        <div className="container px-4 py-8 max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="h-64 bg-muted rounded-2xl"></div>
              </div>
              <div className="lg:col-span-3 space-y-6">
                <div className="h-32 bg-muted rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-muted rounded-2xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onOpenSubmission={() => {}}
          onOpenAuth={(tab) => {
            setAuthModalTab(tab);
            setIsAuthModalOpen(true);
          }}
        />
        <div className="container px-4 py-8 max-w-6xl mx-auto text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The user profile you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getUserStats();

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onOpenSubmission={() => {}}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setIsAuthModalOpen(true);
        }}
      />

      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className="text-2xl">
                      {AvatarGenerator.generateFunAvatar(
                        profile.username || profile.full_name || 'User'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h1 className="text-2xl font-bold mb-1">
                    {profile.full_name || profile.username || 'Anonymous User'}
                  </h1>
                  
                  {profile.username && (
                    <p className="text-muted-foreground mb-4">@{profile.username}</p>
                  )}
                  
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {profile.website && (
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Products</span>
                    </div>
                    <span className="font-semibold">{stats.totalProducts}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Total Upvotes</span>
                    </div>
                    <span className="font-semibold">{stats.totalUpvotes}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Total Views</span>
                    </div>
                    <span className="font-semibold">{stats.totalViews}</span>
                  </div>
                  
                  {stats.featuredProducts > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Featured</span>
                      </div>
                      <span className="font-semibold">{stats.featuredProducts}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Products Section */}
          <motion.div
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Products by {profile.full_name || profile.username || 'this user'}
                </h2>
                <p className="text-muted-foreground">
                  {stats.totalProducts} {stats.totalProducts === 1 ? 'product' : 'products'} created
                </p>
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                  <p className="text-muted-foreground">
                    This user hasn't created any products yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => {
                  const categoryInfo = getCategoryInfo(product.category);
                  
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
                        <Link to={`/product/${product.slug}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                {product.logo_url ? (
                                  <img
                                    src={product.logo_url}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-xl object-cover border shadow-sm group-hover:shadow-md transition-shadow"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-xl">
                                    📦
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                                    {product.name}
                                  </h3>
                                  {product.is_featured && (
                                    <Badge className="bg-yellow-500 text-white text-xs flex-shrink-0">
                                      ⭐ Featured
                                    </Badge>
                                  )}
                                  {product.is_trending && (
                                    <Badge className="bg-orange-500 text-white text-xs flex-shrink-0">
                                      🔥 Trending
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                  {product.description}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{categoryInfo.icon}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {categoryInfo.name}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      {product.upvotes}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {product.view_count || 0}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Tags */}
                                {product.tags && product.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    {product.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {product.tags.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{product.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          defaultTab={authModalTab}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
