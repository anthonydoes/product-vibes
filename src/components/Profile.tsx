import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Globe, ExternalLink, Edit2, TrendingUp, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { extractDomainName } from '../lib/utils';
import { AvatarGenerator } from '../utils/avatarGenerator';
import Header from './Header';
import ProductSubmission from './ProductSubmission';
import AuthModal from './AuthModal';
import { useToast } from './ui/use-toast';

const Profile = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Modal states
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  
  // Profile and products state
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    
    // Generate fun avatar as fallback
    const seed = user?.email || user?.id || 'default';
    return AvatarGenerator.generateFunAvatar(seed);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onOpenSubmission={() => setIsSubmissionOpen(true)}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Content */}
      <main className="container px-4 py-8 md:px-6 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-8">
            <p>Loading profile...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6 relative">
                <Button 
                  onClick={() => navigate('/settings')} 
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pr-24">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32">
                    <AvatarImage 
                      src={getAvatarUrl()}
                      alt="User" 
                    />
                    <AvatarFallback className="text-2xl md:text-4xl">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">
                        {profile?.full_name || profile?.username || 'User'}
                      </h1>
                      <p className="text-muted-foreground text-lg">
                        @{profile?.username || user?.email?.split('@')[0]}
                      </p>
                  </div>
                  
                  {profile?.bio && (
                    <p className="text-muted-foreground max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(profile?.created_at || '').toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                    
                    {profile?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    
                    {profile?.website && (
                      <a 
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        {extractDomainName(profile.website)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {user?.app_metadata?.provider === 'github' ? 'GitHub Account' : 'Email Account'}
                    </Badge>
                    <Badge variant={user?.email_confirmed_at ? 'default' : 'destructive'}>
                      {user?.email_confirmed_at ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                    {products.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Products Submitted</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Heart className="h-6 w-6 text-red-500" />
                    {profile?.total_upvotes || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Upvotes</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Calendar className="h-6 w-6 text-green-500" />
                    {new Date(profile?.created_at || '').toLocaleDateString('en-US', { 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submitted Products */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted Products</CardTitle>
              <CardDescription>
                Products you've shared with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      {product.logo_url && (
                        <img 
                          src={product.logo_url} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-medium truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {product.upvotes}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                              <span>
                                {new Date(product.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {product.website_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a 
                                href={product.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No products submitted yet.</p>
                  <Button 
                    onClick={() => setIsSubmissionOpen(true)} 
                    className="mt-4"
                  >
                    Submit Your First Product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        )}
      </main>

      {/* Product Submission Modal */}
      <ProductSubmission
        open={isSubmissionOpen}
        onOpenChange={setIsSubmissionOpen}
        onSuccess={(productData) => {
          setIsSubmissionOpen(false);
          if (productData?.slug) {
            navigate(`/product/${productData.slug}`);
            toast({
              title: "Product submitted!",
              description: "Your product has been submitted successfully.",
            });
          } else {
            toast({
              title: "Product submitted!",
              description: "Your product has been submitted successfully.",
            });
          }
        }}
      />

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

export default Profile;
