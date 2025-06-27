import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Github,
  Mail,
  Eye,
  EyeOff,
  Edit2,
  Save,
  X,
  Upload,
  Camera,
  RefreshCw,
  Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/use-toast';
import { UserPreferencesService } from '../services/userPreferencesService';
import { StorageService } from '../services/storageService';
import { FileValidator } from '../utils/fileValidation';
import { AvatarGenerator } from '../utils/avatarGenerator';
import Header from './Header';
import ProductSubmission from './ProductSubmission';
import AuthModal from './AuthModal';

const Settings = () => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Modal states
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  
  // State for profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.user_metadata?.username || '',
    fullName: user?.user_metadata?.full_name || '',
    bio: user?.user_metadata?.bio || '',
    website: user?.user_metadata?.website || '',
    location: user?.user_metadata?.location || ''
  });
  
  // State for settings
  const [settings, setSettings] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    productUpdates: true,
    weeklyDigest: true,
    profileVisibility: 'public',
    showEmail: false,
    showProducts: true,
    allowDirectMessages: true
  });
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [generatedAvatars, setGeneratedAvatars] = useState<Record<string, { name: string; avatars: string[] }>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('people');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load user preferences from database
    const loadUserPreferences = async () => {
      if (user?.id) {
        try {
          const preferences = await UserPreferencesService.getUserPreferencesWithDefaults(user.id);
          setSettings({
            theme: preferences.theme,
            language: preferences.language,
            timezone: preferences.timezone,
            emailNotifications: preferences.email_notifications,
            pushNotifications: preferences.push_notifications,
            marketingEmails: preferences.marketing_emails,
            productUpdates: preferences.product_updates,
            weeklyDigest: preferences.weekly_digest,
            profileVisibility: preferences.profile_visibility,
            showEmail: preferences.show_email,
            showProducts: preferences.show_products,
            allowDirectMessages: preferences.allow_direct_messages
          });
        } catch (error) {
          console.error('Error loading user preferences:', error);
          // Fallback to localStorage if database fails
          const savedSettings = localStorage.getItem('userSettings');
          if (savedSettings) {
            setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
          }
        }
      }
    };

    loadUserPreferences();

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveSettings();
            break;
          case ',':
            e.preventDefault();
            // Already on settings page
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const saveSettings = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save settings.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await UserPreferencesService.upsertUserPreferences({
        user_id: user.id,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        email_notifications: settings.emailNotifications,
        push_notifications: settings.pushNotifications,
        marketing_emails: settings.marketingEmails,
        product_updates: settings.productUpdates,
        weekly_digest: settings.weeklyDigest,
        profile_visibility: settings.profileVisibility,
        show_email: settings.showEmail,
        show_products: settings.showProducts,
        allow_direct_messages: settings.allowDirectMessages
      });

      // Also save to localStorage as backup
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // Update the user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: profileData.username,
          full_name: profileData.fullName,
          bio: profileData.bio,
          website: profileData.website,
          location: profileData.location
        }
      });

      if (authError) throw authError;

      // Update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: profileData.username,
          full_name: profileData.fullName,
          bio: profileData.bio,
          website: profileData.website,
          location: profileData.location
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      setIsEditingProfile(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Implement account deletion logic here
      toast({
        title: "Coming Soon",
        description: "Account deletion feature coming soon",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    // Implement data export logic here
    toast({
      title: "Coming Soon",
      description: "Data export feature coming soon",
    });
  };

  // Avatar upload functions
  const handleAvatarFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = FileValidator.validateAvatar(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user?.id) return;

    setIsUploadingAvatar(true);
    try {
      // Upload to storage
      const { url, error } = await StorageService.uploadAvatar(avatarFile, user.id);
      
      if (error || !url) {
        throw new Error(error?.message || 'Failed to upload avatar');
      }

      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          avatar_url: url
        }
      });

      if (authError) throw authError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Clear upload state
      setAvatarFile(null);
      setAvatarPreview(null);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const generateNewAvatars = async () => {
    setIsRefreshing(true);
    
    // Add a small delay for the animation effect
    setTimeout(() => {
      const seed = user?.email || user?.id || 'default';
      const categorizedAvatars = AvatarGenerator.generateCategorizedAvatarOptions(seed + Date.now(), 4);
      setGeneratedAvatars(categorizedAvatars);
      setShowAvatarOptions(true);
      setIsRefreshing(false);
    }, 300);
  };

  const selectGeneratedAvatar = async (avatarUrl: string) => {
    if (!user?.id) return;

    setIsUploadingAvatar(true);
    try {
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          avatar_url: avatarUrl
        }
      });

      if (authError) throw authError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setShowAvatarOptions(false);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getCurrentAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    
    // Generate fun avatar as fallback
    const seed = user?.email || user?.id || 'default';
    return AvatarGenerator.generateFunAvatar(seed);
  };

  // Auto-save functionality with debouncing
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const autoSaveSettings = async () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        await saveSettings();
        // Show a subtle auto-save indicator
        toast({
          title: "Auto-saved",
          description: "Your settings have been automatically saved.",
          duration: 2000,
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 1000); // Save after 1 second of no changes

    setAutoSaveTimeout(timeout);
  };

  // Enhanced setSettings function that triggers auto-save
  const updateSettings = (newSettings: typeof settings | ((prev: typeof settings) => typeof settings)) => {
    setSettings(newSettings);
    autoSaveSettings();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <Header 
        onOpenSubmission={() => setIsSubmissionOpen(true)}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Content */}
      <main className="container px-4 py-8 md:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >

        <Tabs defaultValue="profile" className="space-y-6">
          {/* Account Overview Card */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={getCurrentAvatarUrl()}
                      alt="User" 
                    />
                    <AvatarFallback className="text-lg">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {user?.user_metadata?.full_name || user?.user_metadata?.username || 'User'}
                    </h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {user?.app_metadata?.provider === 'github' ? 'GitHub Account' : 'Email Account'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Member since {new Date(user?.created_at || '').toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <Badge variant="default" className="mt-1">
                    {user?.email_confirmed_at ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Profile Information
                  {!isEditingProfile ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleProfileSave} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  Manage your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload Section */}
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={getCurrentAvatarUrl()}
                        alt="User" 
                      />
                      <AvatarFallback className="text-lg">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Upload Controls */}
                    <div className="flex flex-col gap-2 w-full">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileSelect}
                        className="hidden"
                      />
                      
                      {avatarFile ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                            className="flex-1"
                          >
                            {isUploadingAvatar ? (
                              <>
                                <Upload className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={generateNewAvatars}
                            disabled={isUploadingAvatar || isRefreshing}
                            title="Generate avatar options"
                            className="min-w-[100px]"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Generate
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                    <div className="space-y-2 flex-1">
                      <h3 className="font-medium">Profile Picture</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a custom avatar or choose from our generated options. Choose between human-style avatars or fun characters like robots, blobs, and more!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Max file size: 2MB. Supported formats: JPEG, PNG, WebP, GIF.
                      </p>
                      
                      {avatarFile && (
                        <Alert>
                          <AlertDescription>
                            Ready to upload: {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)} MB)
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                </div>

                {/* Generated Avatar Options */}
                {showAvatarOptions && Object.keys(generatedAvatars).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Choose Your Avatar Style</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAvatarOptions(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Category Tabs with Refresh Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(generatedAvatars).map(([categoryKey, categoryData]) => (
                          <Button
                            key={categoryKey}
                            variant={selectedCategory === categoryKey ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(categoryKey)}
                          >
                            {categoryData.name}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateNewAvatars}
                        disabled={isUploadingAvatar || isRefreshing}
                        title="Generate new avatar options"
                        className={`min-w-[100px] relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                          isRefreshing 
                            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white border-transparent shadow-lg animate-pulse' 
                            : 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-purple-200 hover:border-purple-300 hover:shadow-md hover:from-blue-500/20 hover:via-purple-500/20 hover:to-pink-500/20'
                        }`}
                      >
                        <motion.div
                          animate={{ 
                            rotate: isRefreshing ? 360 : 0,
                            scale: isRefreshing ? [1, 1.2, 1] : 1
                          }}
                          transition={{ 
                            rotate: { duration: 0.6, ease: "easeInOut", repeat: isRefreshing ? Infinity : 0 },
                            scale: { duration: 0.3, ease: "easeOut" }
                          }}
                          className="flex items-center"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'text-white' : 'text-purple-600'}`} />
                        </motion.div>
                        <span className={`relative z-10 font-medium ${isRefreshing ? 'text-white' : 'text-purple-700'}`}>
                          {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </span>
                        {isRefreshing && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 opacity-20"
                          />
                        )}
                        {/* Subtle animated background for default state */}
                        {!isRefreshing && (
                          <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity, 
                              ease: "linear",
                              repeatDelay: 2
                            }}
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
                          />
                        )}
                      </Button>
                    </div>

                    {/* Avatar Grid for Selected Category */}
                    {selectedCategory && generatedAvatars[selectedCategory] && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {selectedCategory === 'people' 
                            ? 'Human-style avatars with various looks and expressions'
                            : 'Fun characters including robots, blobs, shapes, and more!'
                          }
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {generatedAvatars[selectedCategory].avatars.map((avatarUrl, index) => (
                            <button
                              key={`${selectedCategory}-${index}-${avatarUrl}`}
                              onClick={() => selectGeneratedAvatar(avatarUrl)}
                              disabled={isUploadingAvatar}
                              className="relative group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-2xl p-2 hover:bg-muted transition-colors"
                            >
                              <Avatar className="h-20 w-20 mx-auto transition-transform group-hover:scale-105">
                                <AvatarImage 
                                  src={avatarUrl} 
                                  alt={`${generatedAvatars[selectedCategory].name} avatar ${index + 1}`}
                                  onError={(e) => {
                                    // If image fails to load, try to reload with a slightly different seed
                                    const img = e.target as HTMLImageElement;
                                    if (!img.dataset.retried) {
                                      img.dataset.retried = 'true';
                                      const newUrl = avatarUrl + '&retry=' + Math.random().toString(36).substring(2, 8);
                                      img.src = newUrl;
                                    }
                                  }}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600">
                                  <User className="h-8 w-8" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute inset-0 bg-black/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-1">
                                  <Check className="h-3 w-3 text-green-600" />
                                  <span className="text-xs font-medium text-gray-800">Select</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Rest of Profile Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Choose a username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support for assistance.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditingProfile}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditingProfile}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {profileData.bio.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Change Password</h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handlePasswordChange} disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Connected Accounts</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Github className="h-5 w-5" />
                        <div>
                          <p className="font-medium">GitHub</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.app_metadata?.provider === 'github' ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={user?.app_metadata?.provider === 'github' ? 'default' : 'secondary'}>
                        {user?.app_metadata?.provider === 'github' ? 'Connected' : 'Connect'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-red-600">Danger Zone</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      onClick={exportData}
                      className="w-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      className="w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser push notifications
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>

                  <Separator />

                  <h4 className="font-medium">Email Preferences</h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="productUpdates">Product Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when products you've submitted receive feedback
                      </p>
                    </div>
                    <Switch
                      id="productUpdates"
                      checked={settings.productUpdates}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, productUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly summary of trending products and activities
                      </p>
                    </div>
                    <Switch
                      id="weeklyDigest"
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyDigest: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Promotional content and partnership announcements
                      </p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, marketingEmails: checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={saveSettings} disabled={loading}>
                    {loading ? "Saving..." : "Save Notification Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control what information is visible to others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Profile Visibility</h4>
                  <RadioGroup
                    value={settings.profileVisibility}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, profileVisibility: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public" className="flex-1">
                        <div>
                          <p className="font-medium">Public</p>
                          <p className="text-sm text-muted-foreground">
                            Anyone can see your profile and products
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="limited" id="limited" />
                      <Label htmlFor="limited" className="flex-1">
                        <div>
                          <p className="font-medium">Limited</p>
                          <p className="text-sm text-muted-foreground">
                            Only registered users can see your profile
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private" className="flex-1">
                        <div>
                          <p className="font-medium">Private</p>
                          <p className="text-sm text-muted-foreground">
                            Your profile is hidden from others
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <Separator />

                  <h4 className="font-medium">Information Sharing</h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="showEmail">Show Email Address</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your email address
                      </p>
                    </div>
                    <Switch
                      id="showEmail"
                      checked={settings.showEmail}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showEmail: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="showProducts">Show My Products</Label>
                      <p className="text-sm text-muted-foreground">
                        Display products you've submitted on your profile
                      </p>
                    </div>
                    <Switch
                      id="showProducts"
                      checked={settings.showProducts}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showProducts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="allowDirectMessages">Allow Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Let other users send you direct messages
                      </p>
                    </div>
                    <Switch
                      id="allowDirectMessages"
                      checked={settings.allowDirectMessages}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowDirectMessages: checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={saveSettings} disabled={loading}>
                    {loading ? "Saving..." : "Save Privacy Settings"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>
                  Customize your experience on Product Vibes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                        <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                        <SelectItem value="CET">CET (Central European Time)</SelectItem>
                        <SelectItem value="JST">JST (Japan Standard Time)</SelectItem>
                        <SelectItem value="CST">CST (China Standard Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={saveSettings} disabled={loading}>
                    {loading ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts Help */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Save Settings</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘S</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open Settings</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘,</kbd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </motion.div>
      </main>

      {/* Product Submission Modal */}
      <ProductSubmission
        open={isSubmissionOpen}
        onOpenChange={setIsSubmissionOpen}
        onSuccess={() => {
          setIsSubmissionOpen(false);
          toast({
            title: "Product submitted!",
            description: "Your product has been submitted successfully.",
          });
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

export default Settings;
