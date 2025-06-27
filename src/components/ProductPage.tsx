import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ExternalLink,
  Calendar,
  Tag,
  Eye,
  Send,
  ArrowLeft,
  Globe,
  User,
  Package
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { useAuthContext } from "../contexts/AuthContext";
import { ProductService } from "../services/productService";
import { AvatarGenerator } from "../utils/avatarGenerator";
import Header from "./Header";
import AuthModal from "./AuthModal";
import { categoryConfig } from "../data/categories";
import type { Database } from "../types/supabase";

type Product = Database['public']['Tables']['products']['Row'] & {
  profiles?: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    website: string | null
    bio: string | null
  } | null
}

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [ownerProducts, setOwnerProducts] = useState<Product[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (product?.creator_id) {
      fetchOwnerProducts();
    }
  }, [product?.creator_id]);

  const fetchProduct = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      const { data, error } = await ProductService.getProductBySlugOrId(slug);
      
      if (error) {
        setError('Product not found');
        return;
      }
      
      if (!data) {
        setError('Product not found');
        return;
      }
      
      setProduct(data);
      
      // Track view (increment view count) - don't count if user is the creator
      await ProductService.incrementProductViews(data.id, user?.id, data.creator_id);
      
      // Check if user has upvoted this product
      if (user) {
        const { hasUpvoted } = await ProductService.checkUserUpvote(data.id, user.id);
        setHasUpvoted(hasUpvoted);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerProducts = async () => {
    if (!product?.creator_id) return;
    
    try {
      const { data } = await ProductService.getProducts({
        creatorId: product.creator_id,
        limit: 4 // Get top 4 products from this creator
      });
      
      // Filter out the current product
      const otherProducts = (data || []).filter(p => p.id !== product.id);
      setOwnerProducts(otherProducts.slice(0, 3)); // Show top 3 other products
    } catch (err) {
      console.error('Error fetching owner products:', err);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (!product || isUpvoting) return;
    
    try {
      setIsUpvoting(true);
      
      if (hasUpvoted) {
        await ProductService.removeUpvote(product.id, user.id);
        setProduct(prev => prev ? { ...prev, upvotes: prev.upvotes - 1 } : null);
        setHasUpvoted(false);
      } else {
        await ProductService.addUpvote(product.id, user.id);
        setProduct(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
        setHasUpvoted(true);
      }
    } catch (err) {
      console.error('Error toggling upvote:', err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
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
            <div className="h-8 bg-muted rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-muted rounded-2xl"></div>
                <div className="h-32 bg-muted rounded-2xl"></div>
              </div>
              <div className="h-64 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
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
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(product.category);

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
        {/* Back Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-8 gap-2 hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Product Header */}
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {product.logo_url ? (
                      <img
                        src={product.logo_url}
                        alt={product.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-3xl border-2 border-white shadow-lg">
                        📦
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                          {product.name}
                        </h1>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-6">
                      <button
                        onClick={handleUpvote}
                        disabled={isUpvoting}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all duration-200 text-sm font-medium ${
                          hasUpvoted
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-accent border-border text-muted-foreground hover:text-foreground'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span className={`transition-transform duration-200 ${hasUpvoted ? 'scale-110' : ''}`}>
                          ▲
                        </span>
                        <span>{product.upvotes}</span>
                      </button>
                      
                      <Button variant="outline" onClick={handleShare} className="gap-2">
                        <Send className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Product Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.website_url && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-muted-foreground">Website</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={product.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {new URL(product.website_url).hostname}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Category</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{categoryInfo.icon}</span>
                      <span className="font-medium">{categoryInfo.name}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Launch Date</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{product.view_count || 0} views</span>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Information */}
            {product.product_info && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About This Product</h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {product.product_info}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Images */}
            {product.product_images && product.product_images.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Product Gallery</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.product_images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`${product.name} screenshot ${index + 1}`}
                          className="w-full aspect-video object-cover rounded-xl border shadow-sm group-hover:shadow-lg transition-shadow"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Sidebar - Creator Profile */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Creator Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Created by</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={product.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {AvatarGenerator.generateFunAvatar(
                        product.profiles?.username || product.profiles?.full_name || 'User'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Link 
                      to={`/user/${product.profiles?.username || product.creator_id}`}
                      className="font-medium hover:underline"
                    >
                      {product.profiles?.full_name || product.profiles?.username || 'Anonymous User'}
                    </Link>
                    {product.profiles?.username && (
                      <p className="text-sm text-muted-foreground">
                        @{product.profiles.username}
                      </p>
                    )}
                  </div>
                </div>
                
                {product.profiles?.bio && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {product.profiles.bio}
                  </p>
                )}
                
                {product.profiles?.website && (
                  <Button variant="outline" size="sm" asChild className="w-full mb-4">
                    <a 
                      href={product.profiles.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>
                )}
                
                <Button asChild className="w-full" variant="outline">
                  <Link to={`/user/${product.profiles?.username || product.creator_id}`}>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Other Products by Creator */}
            {ownerProducts.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">More from this creator</h3>
                  <div className="space-y-3">
                    {ownerProducts.map((ownerProduct) => (
                      <Link
                        key={ownerProduct.id}
                        to={`/product/${ownerProduct.slug}`}
                        className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {ownerProduct.logo_url ? (
                              <img
                                src={ownerProduct.logo_url}
                                alt={ownerProduct.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm">
                                📦
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                              {ownerProduct.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Heart className="h-3 w-3" />
                              {ownerProduct.upvotes}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    <Separator className="my-2" />
                    
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link to={`/user/${product.profiles?.username || product.creator_id}`}>
                        View all products
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

export default ProductPage;
