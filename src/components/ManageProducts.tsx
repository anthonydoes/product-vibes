import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Calendar,
  TrendingUp,
  Heart,
  Settings,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Archive,
  X,
  Check,
  Upload,
  Image,
  FileVideo,
  ArrowUpDown
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useAuthContext } from "../contexts/AuthContext";
import { ProductService } from "../services/productService";
import { StorageService } from "../services/storageService";
import { AvatarGenerator } from "../utils/avatarGenerator";
import { FileValidator } from "../utils/fileValidation";
import ProductSubmission from "./ProductSubmission";
import Header from "./Header";
import AuthModal from "./AuthModal";
import { categoryConfig } from "../data/categories";
import { normalizeUrl } from "../lib/utils";
import type { Database } from "../types/supabase";

type Product = Database['public']['Tables']['products']['Row'] & {
  profiles?: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

// Product Edit Modal Component
interface ProductEditModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  open,
  onOpenChange,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    website_url: product.website_url || '',
    category: product.category,
    tags: product.tags || []
  });
  const [tagInput, setTagInput] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(product.logo_url || null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    description?: string;
    category?: string;
    logo?: string;
    media?: string;
    submit?: string;
  }>({  });

  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Reset form when product changes
  useEffect(() => {
    setFormData({
      name: product.name,
      description: product.description || '',
      website_url: product.website_url || '',
      category: product.category,
      tags: product.tags || []
    });
    setTagInput('');
    setLogoFile(null);
    setLogoPreview(product.logo_url || null);
    setFiles([]);
    setPreviews([]);
    setValidationErrors({});
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof validationErrors];
        return newErrors;
      });
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (
        formData.tags.length < 5 &&
        !formData.tags.includes(tagInput.trim())
      ) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate the logo file
      const validation = FileValidator.validateLogo(file);
      if (!validation.isValid) {
        setValidationErrors(prev => ({ ...prev, logo: validation.error }));
        if (logoInputRef.current) {
          logoInputRef.current.value = '';
        }
        return;
      }
      
      // Clear any previous logo
      if (logoPreview && logoFile) {
        URL.revokeObjectURL(logoPreview);
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setLogoFile(file);
      setLogoPreview(previewUrl);
      
      // Clear any logo validation errors
      if (validationErrors.logo) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.logo;
          return newErrors;
        });
      }
    }
    
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }, [logoPreview, logoFile, validationErrors.logo]);

  const removeLogo = useCallback(() => {
    if (logoPreview && logoFile) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(product.logo_url || null);
    
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }, [logoPreview, logoFile, product.logo_url]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allFiles = [...files, ...newFiles];
      
      // Validate the files
      const validation = FileValidator.validateProductMedia(allFiles);
      if (!validation.isValid) {
        setValidationErrors(prev => ({ ...prev, media: validation.error }));
        e.target.value = '';
        return;
      }
      
      setFiles(allFiles);

      // Create preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
      
      // Clear media validation errors
      if (validationErrors.media) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.media;
          return newErrors;
        });
      }
    }
  };

  const removeFile = (index: number) => {
    // Revoke the URL to prevent memory leaks
    if (previews[index] && files[index]) {
      URL.revokeObjectURL(previews[index]);
    }
    
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = "Product description is required";
      isValid = false;
    }

    if (!formData.category) {
      errors.category = "Please select a category";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let logoUrl = product.logo_url;
      let imageUrls: string[] = [];

      // Upload new logo if provided
      if (logoFile) {
        const logoUploadResult = await StorageService.uploadFile(
          logoFile, 
          'logos',
          `${product.id}-logo-${Date.now()}`
        );
        
        if (logoUploadResult.error) {
          console.error('Error uploading logo:', logoUploadResult.error);
          setValidationErrors(prev => ({ 
            ...prev, 
            submit: 'Failed to upload logo. Please try again.' 
          }));
          return;
        }
        
        logoUrl = logoUploadResult.url;
      }

      // Upload product images if provided
      if (files.length > 0) {
        const imageUploadPromises = files.map((file, index) => 
          StorageService.uploadFile(
            file, 
            'products',
            `${product.id}-image-${Date.now()}-${index}`
          )
        );
        
        const imageResults = await Promise.all(imageUploadPromises);
        
        // Check for upload errors
        const uploadErrors = imageResults.filter(result => result.error);
        if (uploadErrors.length > 0) {
          console.error('Error uploading images:', uploadErrors);
          setValidationErrors(prev => ({ 
            ...prev, 
            submit: 'Failed to upload some images. Please try again.' 
          }));
          return;
        }
        
        imageUrls = imageResults
          .filter(result => result.url)
          .map(result => result.url!);
      }

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        website_url: formData.website_url ? normalizeUrl(formData.website_url) : null,
        category: formData.category,
        tags: formData.tags,
        ...(logoUrl !== product.logo_url && { logo_url: logoUrl }),
        ...(imageUrls.length > 0 && { images: imageUrls })
      };

      const { error } = await ProductService.updateProduct(product.id, updateData);

      if (error) {
        console.error('Error updating product:', error);
        setValidationErrors(prev => ({ 
          ...prev, 
          submit: 'Failed to update product. Please try again.' 
        }));
        return;
      }

      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      setValidationErrors(prev => ({ 
        ...prev, 
        submit: 'An unexpected error occurred. Please try again.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-gradient-to-br from-slate-50/80 via-white to-blue-50/60 backdrop-blur-sm border-0 shadow-2xl flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-cyan-100/20 pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full min-h-0">
          <DialogHeader className="pb-6 flex-shrink-0">
            <div className="text-center">
              <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">
                Edit Product
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Update your product information
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <form onSubmit={handleSubmit} className="space-y-6 pb-4">
            {/* Product Name */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <Label htmlFor="name" className="text-lg font-semibold text-slate-800 mb-3 block">
                Product Name ✨
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your product name..."
                className={`text-sm h-12 rounded-xl border-slate-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-300 focus:ring-purple-200 transition-all duration-300 ${validationErrors.name ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-600 mt-2">{validationErrors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <Label htmlFor="description" className="text-lg font-semibold text-slate-800 mb-3 block">
                Description 📝
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What makes your product special?"
                className={`text-sm min-h-[100px] rounded-xl border-slate-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-300 focus:ring-purple-200 transition-all duration-300 resize-none ${validationErrors.description ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}
              />
              {validationErrors.description && (
                <p className="text-sm text-red-600 mt-2">{validationErrors.description}</p>
              )}
            </div>

            {/* Website URL */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <Label htmlFor="website_url" className="text-lg font-semibold text-slate-800 mb-3 block">
                Website URL 🌐
              </Label>
              <Input
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                placeholder="your-awesome-product.com"
                className="text-sm h-12 rounded-xl border-slate-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-300 focus:ring-purple-200 transition-all duration-300"
              />
            </div>

            {/* Logo Upload */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <Label htmlFor="logo" className="text-lg font-semibold text-slate-800 mb-3 block">
                Product Logo 🎨
              </Label>
              <p className="text-sm text-slate-600 mb-4">
                Upload a logo for your product
              </p>
              <div className="mt-1">
                {!logoPreview ? (
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-cyan-50/50 transition-all duration-300 group ${validationErrors.logo ? 'border-red-300 bg-red-50/30' : 'border-slate-300/50 hover:border-purple-300/50'}`}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <input
                      ref={logoInputRef}
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    <div className="bg-gradient-to-br from-purple-100 to-cyan-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-800 mb-2">
                      Upload your logo
                    </p>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <Image className="h-4 w-4" />
                      Choose Logo
                    </div>
                    <p className="text-sm text-slate-500 mt-4">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-6 p-6 border border-slate-200/50 rounded-2xl bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-slate-800">
                        {logoFile ? "New logo uploaded" : "Current logo"}
                      </p>
                      <p className="text-sm text-slate-600">This will appear in your product card</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
                {validationErrors.logo && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 font-medium">{validationErrors.logo}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <Label htmlFor="category" className="text-lg font-semibold text-slate-800 mb-3 block">
                Category 📂
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, category: value }));
                  if (validationErrors.category) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.category;
                      return newErrors;
                    });
                  }
                }}
              >
                <SelectTrigger className={`text-sm h-12 rounded-xl border-slate-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-300 focus:ring-purple-200 transition-all duration-300 ${validationErrors.category ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200/50 bg-white/95 backdrop-blur-sm">
                  {categoryConfig
                    .filter((cat) => cat.id !== "all")
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id} className="rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {validationErrors.category && (
                <p className="text-sm text-red-600 mt-2">{validationErrors.category}</p>
              )}
            </div>

            {/* Tags */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <Label htmlFor="tags" className="text-lg font-semibold text-slate-800 mb-3 block">
                Tags 🏷️
              </Label>
              <Input
                id="tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="productivity, automation, saas..."
                className="text-sm h-12 rounded-xl border-slate-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-300 focus:ring-purple-200 transition-all duration-300"
                disabled={formData.tags.length >= 5}
              />
              <p className="text-sm text-slate-500 mt-2">
                Press Enter to add a tag • Up to 5 tags
              </p>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-3 py-1 bg-gradient-to-r from-purple-100 to-cyan-100 text-slate-700 border-slate-200/50 rounded-xl hover:scale-105 transition-transform duration-200"
                    >
                      {tag}
                      <button 
                        type="button"
                        onClick={() => removeTag(tag)} 
                        className="ml-2 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Product Images */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Image className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Product Images</h3>
                  <p className="text-sm text-slate-600">Add images to showcase your product</p>
                </div>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-cyan-50/50 transition-all duration-300 group ${validationErrors.media ? 'border-red-300 bg-red-50/30' : 'border-slate-300/50 hover:border-purple-300/50'}`}
                onClick={() => document.getElementById("product-images-upload")?.click()}
              >
                <input
                  id="product-images-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="bg-gradient-to-br from-purple-100 to-cyan-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Upload product images
                </h3>
                <p className="text-slate-600 mb-4">
                  or click to browse your files
                </p>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Upload className="h-4 w-4" />
                  Choose Files
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  Upload up to 5 files • Max 10MB each • Images & Videos
                </p>
              </div>
              
              {validationErrors.media && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{validationErrors.media}</p>
                </div>
              )}

              {previews.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"></div>
                    <p className="text-sm text-slate-600 font-medium">
                      Product images • First image is your main preview
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-slate-100 to-slate-200 transition-all duration-300 hover:shadow-lg border border-slate-200/50 hover:scale-105"
                    >
                      {files[index] && files[index].type.startsWith("image/") ? (
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : files[index] ? (
                        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-100 to-cyan-100">
                          <FileVideo className="h-8 w-8 text-purple-600 mb-2" />
                          <span className="text-xs text-slate-600 font-medium text-center px-2">
                            {files[index].name}
                          </span>
                        </div>
                      ) : (
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-3 left-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-3 py-1 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                        #{index + 1}
                      </div>
                      {index === 0 && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <div
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300/50 rounded-2xl aspect-video cursor-pointer hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-cyan-50/50 hover:border-purple-300/50 transition-all duration-300 group"
                      onClick={() =>
                        document.getElementById("product-images-upload")?.click()
                      }
                    >
                      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl w-12 h-12 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                        <Plus className="h-6 w-6 text-slate-600" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Add More</span>
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>

            {validationErrors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                <p className="text-sm text-red-600 font-medium">{validationErrors.submit}</p>
              </div>
            )}

            <DialogFooter className="flex justify-between pt-6 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 rounded-xl px-6 py-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    <span>Update Product</span>
                  </div>
                )}
              </Button>
            </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ManageProducts = () => {
  const { user } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "upvotes" | "comments">("date");
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProducts();
    }
  }, [user]);

  const fetchUserProducts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await ProductService.getProducts({
        creatorId: user.id,
        limit: 100
      });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching user products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setDeletingProductId(productId);
      const { error } = await ProductService.deleteProduct(productId);
      
      if (error) {
        console.error('Error deleting product:', error);
        // You might want to show a toast notification here
        return;
      }

      // Remove the product from the local state
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    fetchUserProducts(); // Refresh the products list
    
    // You could add a toast notification here
    console.log('Product updated successfully!');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "upvotes":
        return (b.upvotes || 0) - (a.upvotes || 0);
      case "comments":
        // TODO: Add comment count sorting when comments are implemented
        return 0;
      case "date":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const getProductStats = () => {
    const totalUpvotes = products.reduce((sum, product) => sum + (product.upvotes || 0), 0);
    
    return {
      totalProducts: products.length,
      totalUpvotes,
      trendingProducts: products.filter(p => p.is_trending).length
    };
  };

  const stats = getProductStats();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onOpenSubmission={() => setIsSubmissionOpen(true)}
          onOpenAuth={(tab) => {
            setAuthModalTab(tab);
            setIsAuthModalOpen(true);
          }}
        />
        <div className="container px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to manage your products</h1>
          <Button 
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            Sign In
          </Button>
        </div>
        
        {isAuthModalOpen && (
          <AuthModal
            onClose={() => setIsAuthModalOpen(false)}
            defaultTab={authModalTab}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onOpenSubmission={() => setIsSubmissionOpen(true)}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setIsAuthModalOpen(true);
        }}
      />

      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Products</h1>
              <p className="text-muted-foreground">Manage your product listings and track performance</p>
            </div>
            <Button
              onClick={() => setIsSubmissionOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
          </div>              {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Archive className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Upvotes</p>
                    <p className="text-2xl font-bold">{stats.totalUpvotes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">{[...new Set(products.map(p => p.category))].length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trending</p>
                    <p className="text-2xl font-bold">{stats.trendingProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort: {sortBy === "date" ? "Latest" : sortBy === "upvotes" ? "Most Upvoted" : "Most Comments"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  📅 Latest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("upvotes")}>
                  ❤️ Most Upvoted
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="opacity-50">
                  💬 Most Comments (Coming Soon)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Products List */}
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                        <div className="h-3 bg-muted rounded w-full mb-2" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                      <div className="w-20 h-8 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Archive className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No products found" : "No products yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms or filters"
                    : "Get started by submitting your first product to the community"
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsSubmissionOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Your First Product
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Product Logo */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {product.logo_url ? (
                            <img
                              src={product.logo_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                {product.description}
                              </p>
                              
                              {/* Tags */}
                              {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {product.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {product.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{product.tags.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Stats */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {product.upvotes || 0} upvotes
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(product.created_at).toLocaleDateString()}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {product.category}
                                </Badge>
                                {product.is_trending && (
                                  <Badge className="bg-orange-500 text-white text-xs">
                                    🔥 Trending
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {product.website_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a 
                                    href={product.website_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="gap-1"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Product
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Analytics
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem 
                                        className="text-red-600 focus:text-red-600"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Product
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete "{product.name}" and all associated data. 
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteProduct(product.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                          disabled={deletingProductId === product.id}
                                        >
                                          {deletingProductId === product.id ? "Deleting..." : "Delete"}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Product Submission Modal */}
      <ProductSubmission
        open={isSubmissionOpen}
        onOpenChange={setIsSubmissionOpen}
        onSuccess={() => {
          setIsSubmissionOpen(false);
          fetchUserProducts(); // Refresh the products list
        }}
      />

      {/* Product Edit Modal */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSuccess={handleEditSuccess}
        />
      )}

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

export default ManageProducts;
