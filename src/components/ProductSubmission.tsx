import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, X, Image, FileVideo, Plus, Check, ExternalLink, ChevronUp, MessageSquare, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryConfig } from "../data/categories";
import { useAuthContext } from "../contexts/AuthContext";
import { ProductService } from "../services/productService";
import { StorageService } from "../services/storageService";
import { FileValidator } from "../utils/fileValidation";
import { normalizeUrl } from "../lib/utils";

interface ProductSubmissionProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const ProductSubmission: React.FC<ProductSubmissionProps> = ({
  open = true,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("details"); // Start with details tab
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    logo: boolean;
    images: boolean;
  }>({ logo: false, images: false });
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
    url?: string;
    category?: string;
    logo?: string;
    media?: string;
    upload?: string; // Add upload error field
  }>({});
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    url: "",
    category: "",
    tags: [] as string[],
    tagInput: "",
  });
  const [visibilityPlan, setVisibilityPlan] = useState("free");

  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allFiles = [...files, ...newFiles];
      
      // Validate the files
      const validation = FileValidator.validateProductMedia(allFiles);
      if (!validation.isValid) {
        setValidationErrors(prev => ({ ...prev, media: validation.error }));
        // Clear the input value so files can be selected again
        e.target.value = '';
        return;
      }
      
      setFiles(allFiles);

      // Create preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
      
      // Clear media validation errors
      clearValidationError('media');
    }
    
    // Clear the input value to allow the same files to be selected again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setFiles(newFiles);
    setPreviews(newPreviews);
    
    // Clear the file input value if no files remain
    if (newFiles.length === 0) {
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      const allFiles = [...files, ...newFiles];
      
      // Validate the files
      const validation = FileValidator.validateProductMedia(allFiles);
      if (!validation.isValid) {
        alert(validation.error); // You can replace this with a proper toast/notification
        return;
      }
      
      setFiles(allFiles);

      // Create preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
    
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof typeof validationErrors]) {
      clearValidationError(name as keyof typeof validationErrors);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductData({ ...productData, tagInput: e.target.value });
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && productData.tagInput.trim() !== "") {
      e.preventDefault();
      if (
        productData.tags.length < 5 &&
        !productData.tags.includes(productData.tagInput.trim())
      ) {
        setProductData({
          ...productData,
          tags: [...productData.tags, productData.tagInput.trim()],
          tagInput: "",
        });
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductData({
      ...productData,
      tags: productData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Drag and drop functions for reordering images
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Swap the files and previews
    const draggedFile = newFiles[draggedIndex];
    const draggedPreview = newPreviews[draggedIndex];
    
    newFiles.splice(draggedIndex, 1);
    newPreviews.splice(draggedIndex, 1);
    
    newFiles.splice(dropIndex, 0, draggedFile);
    newPreviews.splice(dropIndex, 0, draggedPreview);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    setDraggedIndex(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // Final validation check before submission
    const detailsValid = validateDetailsTab();
    const mediaValid = validateMediaTab();
    
    if (!detailsValid || !mediaValid) {
      console.error('Form validation failed');
      return;
    }

    setIsSubmitting(true);
    // Clear any previous upload errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.upload;
      return newErrors;
    });

    try {
      let logoUrl: string | null = null;
      let productImageUrls: string[] = [];

      // Upload logo if provided
      if (logoFile) {
        setUploadProgress(prev => ({ ...prev, logo: true }));
        const { url, error } = await StorageService.uploadFile(
          logoFile, 
          'logos', 
          `${user.id}_${Date.now()}_logo`
        );
        
        if (error) {
          console.error('Error uploading logo:', error);
          setValidationErrors(prev => ({ 
            ...prev, 
            upload: `Failed to upload logo: ${error.message || 'Storage not configured properly'}`
          }));
          throw new Error('Failed to upload logo');
        }
        
        logoUrl = url;
        setUploadProgress(prev => ({ ...prev, logo: false }));
      }

      // Upload product images if provided
      if (files.length > 0) {
        setUploadProgress(prev => ({ ...prev, images: true }));
        const { urls, errors } = await StorageService.uploadMultipleFiles(
          files, 
          'products'
        );
        
        if (errors.length > 0) {
          console.error('Error uploading images:', errors);
          setValidationErrors(prev => ({ 
            ...prev, 
            upload: `Failed to upload some images: ${errors[0].message || 'Storage not configured properly'}`
          }));
          // Continue with partial uploads - don't fail completely
        }
        
        productImageUrls = urls;
        setUploadProgress(prev => ({ ...prev, images: false }));
      }

      // Create product with uploaded file URLs
      const productToSubmit = {
        name: productData.title,
        description: productData.description,
        website_url: normalizeUrl(productData.url) || null,
        category: productData.category,
        tags: productData.tags,
        creator_id: user.id,
        logo_url: logoUrl,
        product_images: productImageUrls,
        // Don't auto-assign trending - let it be earned through engagement
      };

      const { data, error } = await ProductService.createProduct(productToSubmit);

      if (error) {
        console.error('Error creating product:', error);
        return;
      }

      console.log('Product created successfully:', data);
      console.log('Product ID:', data?.id);
      console.log('Product data being submitted:', productToSubmit);
      
      // Reset form and clean up URLs
      setProductData({
        title: "",
        description: "",
        url: "",
        category: "",
        tags: [],
        tagInput: "",
      });
      
      // Clean up file previews
      previews.forEach(preview => URL.revokeObjectURL(preview));
      setFiles([]);
      setPreviews([]);
      
      // Clean up logo preview
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoFile(null);
      setLogoPreview(null);
      setUploadProgress({ logo: false, images: false });
      setValidationErrors({});

      // Call success callback and close dialog
      if (onSuccess) onSuccess();
      if (onOpenChange) onOpenChange(false);

    } catch (error) {
      console.error('Error submitting product:', error);
      // TODO: Show user-friendly error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate the logo file
      const validation = FileValidator.validateLogo(file);
      if (!validation.isValid) {
        setValidationErrors(prev => ({ ...prev, logo: validation.error }));
        // Clear the input value so the same file can be selected again
        if (logoInputRef.current) {
          logoInputRef.current.value = '';
        }
        return;
      }
      
      // Clear any previous logo
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Update state - using functional updates to ensure we have the latest state
      setLogoFile(() => file);
      setLogoPreview(() => previewUrl);
      
      // Clear any logo validation errors
      clearValidationError('logo');
    }
    
    // Clear the input value to allow the same file to be selected again
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }, [logoPreview]); // Add logoPreview as dependency

  const removeLogo = useCallback(() => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
    
    // Clear the file input value
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  }, [logoPreview]);

  // Validation functions
  const validateDetailsTab = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    // Title validation
    if (!productData.title.trim()) {
      errors.title = "Product title is required";
      isValid = false;
    }

    // Description validation  
    if (!productData.description.trim()) {
      errors.description = "Product description is required";
      isValid = false;
    }

    // URL validation (required)
    if (!productData.url.trim()) {
      errors.url = "Product URL is required";
      isValid = false;
    } else {
      // More lenient URL validation
      const urlInput = productData.url.trim();
      
      // Check for basic domain pattern (allow domains like hello.com, app.example.com, etc.)
      const domainPattern = /^(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?[a-zA-Z]{2,}(?:\/.*)?$/;
      
      if (!domainPattern.test(urlInput)) {
        errors.url = "Please enter a valid URL (e.g., hello.com or https://hello.com)";
        isValid = false;
      } else {
        // Additional validation with URL constructor for well-formed URLs
        try {
          const normalizedUrl = normalizeUrl(urlInput);
          const urlObj = new URL(normalizedUrl);
          
          // Ensure hostname is reasonable
          if (!urlObj.hostname || urlObj.hostname.length < 4 || !urlObj.hostname.includes('.')) {
            throw new Error("Invalid hostname");
          }
        } catch {
          // Fallback to pattern validation only for edge cases
          if (!domainPattern.test(urlInput)) {
            errors.url = "Please enter a valid URL (e.g., hello.com or https://hello.com)";
            isValid = false;
          }
        }
      }
    }

    // Category validation
    if (!productData.category) {
      errors.category = "Please select a category";
      isValid = false;
    }

    // Logo validation (required)
    if (!logoFile) {
      errors.logo = "Product logo is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const validateMediaTab = (): boolean => {
    const errors: typeof validationErrors = {};
    let isValid = true;

    // At least one product image is required
    if (files.length === 0) {
      errors.media = "At least one product image is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const clearValidationError = (field: keyof typeof validationErrors) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] bg-gradient-to-br from-slate-50/80 via-white to-blue-50/60 backdrop-blur-sm border-0 shadow-2xl flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-cyan-100/20 pointer-events-none" />
        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          <DialogHeader className="flex-shrink-0 pb-6">
            <div className="text-center">
              <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">
                Launch Your Product
              </DialogTitle>
              <DialogDescription className="text-slate-600 max-w-lg mx-auto">
                Share your creation with our community of makers and builders
              </DialogDescription>
            </div>
          </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6 flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-100/50 via-white to-slate-100/50 border border-slate-200/50 rounded-xl p-1 shadow-sm flex-shrink-0">
            <TabsTrigger 
              value="details" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-medium"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="media" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-medium"
            >
              Media
            </TabsTrigger>
            <TabsTrigger 
              value="visibility" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 font-medium"
            >
              Visibility
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-y-auto py-4">

          <TabsContent value="media" className="space-y-6 flex-1 min-h-0 overflow-y-auto">
            <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Image className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">Product Gallery</h3>
                  <p className="text-sm text-slate-600">Showcase your product with stunning visuals</p>
                </div>
              </div>
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-cyan-50/50 transition-all duration-300 group ${validationErrors.media ? 'border-red-300 bg-red-50/30' : 'border-slate-300/50 hover:border-purple-300/50'}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="bg-gradient-to-br from-purple-100 to-cyan-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Drop your media here
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
            </div>

            {previews.length > 0 && (
              <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"></div>
                  <p className="text-sm text-slate-600 font-medium">
                    Drag to reorder • First image is your main preview
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleImageDragOver(e, index)}
                    onDrop={(e) => handleImageDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-slate-100 to-slate-200 cursor-move transition-all duration-300 hover:shadow-lg border border-slate-200/50 ${
                      draggedIndex === index ? 'opacity-50 scale-95 shadow-2xl' : 'hover:scale-105'
                    }`}
                  >
                    {files[index].type.startsWith("image/") ? (
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-100 to-cyan-100">
                        <FileVideo className="h-8 w-8 text-purple-600 mb-2" />
                        <span className="text-xs text-slate-600 font-medium text-center px-2">
                          {files[index].name}
                        </span>
                      </div>
                    )}
                    <button
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
                      document.getElementById("file-upload")?.click()
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

            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-4 mt-8">
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("details")}
                  className="border-slate-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 rounded-xl px-6 py-3"
                >
                  ← Back to Details
                </Button>
                <Button 
                  onClick={() => {
                    if (validateMediaTab()) {
                      setActiveTab("visibility");
                    }
                  }}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Continue to Visibility →
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 flex-1 min-h-0 overflow-y-auto">
            <div className="grid gap-6 pb-4">
              <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
                <Label htmlFor="title" className="text-lg font-semibold text-slate-800 mb-3 block">
                  What's your product called? ✨
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={productData.title}
                  onChange={handleInputChange}
                  placeholder="Enter your product name..."
                  className={`text-sm h-14 rounded-xl border-slate-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-300 focus:ring-purple-200 transition-all duration-300 ${validationErrors.title ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}
                />
                {validationErrors.title && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 font-medium">{validationErrors.title}</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
                <Label htmlFor="description" className="text-lg font-semibold text-slate-800 mb-3 block">
                  Tell us about your product 📝
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={productData.description}
                  onChange={handleInputChange}
                  placeholder="What makes your product special? What problem does it solve?"
                  className={`text-sm min-h-[140px] rounded-xl border-slate-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-300 focus:ring-purple-200 transition-all duration-300 resize-none ${validationErrors.description ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}
                />
                {validationErrors.description && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 font-medium">{validationErrors.description}</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
                <Label htmlFor="url" className="text-lg font-semibold text-slate-800 mb-3 block">
                  Where can people find it? 🌐
                </Label>
                <Input
                  id="url"
                  name="url"
                  value={productData.url}
                  onChange={handleInputChange}
                  placeholder="your-awesome-product.com"
                  className={`text-sm h-14 rounded-xl border-slate-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-300 focus:ring-purple-200 transition-all duration-300 ${validationErrors.url ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}
                />
                {validationErrors.url && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 font-medium">{validationErrors.url}</p>
                  </div>
                )}
                <p className="text-sm text-slate-500 mt-3 bg-slate-50/50 rounded-lg p-3">
                  💡 Don't worry about https:// - we'll add it automatically
                </p>
              </div>

              {/* Logo Upload */}
              <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
                <Label htmlFor="logo" className="text-lg font-semibold text-slate-800 mb-3 block">
                  Upload your logo 🎨
                </Label>
                <p className="text-sm text-slate-600 mb-4">
                  This will be the main image shown in your product card
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
                        <p className="text-lg font-semibold text-slate-800">Perfect! Logo uploaded</p>
                        <p className="text-sm text-slate-600">This will appear in your product card</p>
                      </div>
                      <button
                        onClick={removeLogo}
                        className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-all duration-300 hover:scale-110 shadow-lg"
                      >
                        <X className="h-4 w-4" />
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

              <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
                <Label htmlFor="category" className="text-lg font-semibold text-slate-800 mb-3 block">
                  Choose your category 📂
                </Label>
                <Select
                  value={productData.category}
                  onValueChange={(value) => {
                    setProductData({ ...productData, category: value });
                    clearValidationError('category');
                  }}
                >
                  <SelectTrigger className={`text-sm h-14 rounded-xl border-slate-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-300 focus:ring-purple-200 transition-all duration-300 ${validationErrors.category ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}>
                    <SelectValue placeholder="What type of product is this?" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200/50 bg-white/95 backdrop-blur-sm">
                    {categoryConfig
                      .filter((cat) => cat.id !== "all") // Exclude "All" option
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
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 font-medium">{validationErrors.category}</p>
                  </div>
                )}
                {!productData.category && !validationErrors.category && (
                  <p className="text-sm text-slate-500 mt-3 bg-slate-50/50 rounded-lg p-3">
                    💡 Help users discover your product by selecting the right category
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
                <Label htmlFor="tags" className="text-lg font-semibold text-slate-800 mb-3 block">
                  Add some tags 🏷️
                </Label>
                <Input
                  id="tags"
                  name="tagInput"
                  value={productData.tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="productivity, automation, saas..."
                  className="text-sm h-14 rounded-xl border-slate-200/50 bg-white/50 backdrop-blur-sm focus:border-purple-300 focus:ring-purple-200 transition-all duration-300"
                  disabled={productData.tags.length >= 5}
                />
                <p className="text-sm text-slate-500 mt-2">
                  Press Enter to add a tag • Up to 5 tags
                </p>

                {productData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {productData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-4 py-2 bg-gradient-to-r from-purple-100 to-cyan-100 text-slate-700 border-slate-200/50 rounded-xl hover:scale-105 transition-transform duration-200"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-2 hover:text-red-500 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-4 pb-4">
              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    if (validateDetailsTab()) {
                      setActiveTab("media");
                    }
                  }}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Continue to Media →
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="space-y-6 flex-1 min-h-0 overflow-y-auto">
            <div className="pb-4">
            <div className="bg-gradient-to-br from-white/80 to-slate-50/60 rounded-2xl p-6 border border-slate-200/50 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🚀</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Choose Your Launch Plan</h3>
                  <p className="text-slate-600">Select how you want to showcase your product</p>
                </div>
              </div>

              <RadioGroup
                value={visibilityPlan}
                onValueChange={setVisibilityPlan}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className="relative">
                  <RadioGroupItem
                    value="free"
                    id="free"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="free"
                    className="flex flex-col p-6 border-2 border-slate-200/50 rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-green-50/50 hover:to-emerald-50/50 peer-data-[state=checked]:border-green-400 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-green-50 peer-data-[state=checked]:to-emerald-50 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">F</span>
                        </div>
                        <span className="text-xl font-bold text-slate-800">Free Launch</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">$0</span>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Standard community visibility</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Organic discovery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Forever free</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 w-5 h-5 border-2 border-green-400 rounded-full opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity duration-300">
                      <div className="w-full h-full bg-green-400 rounded-full scale-50"></div>
                    </div>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem
                    value="boost"
                    id="boost"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="boost"
                    className="flex flex-col p-6 border-2 border-slate-200/50 rounded-2xl cursor-pointer hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-cyan-50/50 peer-data-[state=checked]:border-purple-400 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-purple-50 peer-data-[state=checked]:to-cyan-50 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-bl-lg text-xs font-bold">
                      POPULAR
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">B</span>
                        </div>
                        <span className="text-xl font-bold text-slate-800">Boost Launch</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">$15</span>
                    </div>
                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-purple-500" />
                        <span>Featured placement for 7 days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-purple-500" />
                        <span>Enhanced visibility & analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-purple-500" />
                        <span>Priority support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-purple-500" />
                        <span>Badge & special styling</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 w-5 h-5 border-2 border-purple-400 rounded-full opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity duration-300">
                      <div className="w-full h-full bg-purple-400 rounded-full scale-50"></div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

              <div className="mt-6">
                <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span>👀</span> Preview
                </h4>
                <Card className="overflow-hidden h-full bg-white border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer group">
                  <div className="p-4">
                    {/* Top row: Logo, Title, Vote button */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Logo */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt={productData.title || "Product logo"}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg bg-gradient-to-br from-purple-50 to-blue-50">
                              📦
                            </div>
                          )}
                        </div>
                        {(visibilityPlan === "boost") && (
                          <div className="absolute -top-1 -right-1">
                            <Badge
                              variant="secondary"
                              className="bg-orange-500 text-white hover:bg-orange-600 text-[8px] px-1 py-0.5 h-3"
                            >
                              🔥
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {productData.title || "Your Amazing Product"}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {productData.description || "Your product description will appear here..."}
                        </p>
                      </div>

                      {/* Vote button */}
                      <div className="flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 px-3 h-8 text-sm bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 hover:from-purple-600 hover:to-cyan-600"
                        >
                          <ChevronUp className="h-4 w-4" />
                          <span>0</span>
                        </Button>
                      </div>
                    </div>

                    {/* Bottom row: Username, Date, Category */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Avatar className="h-4 w-4 flex-shrink-0">
                          <AvatarFallback className="text-[10px]">
                            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">
                          {user?.user_metadata?.full_name || user?.email || "You"}
                        </span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">just now</span>
                      </div>
                      
                      {/* Category pill */}
                      <div className="flex-shrink-0">
                        {productData.category && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-1 bg-transparent border-2 border-transparent bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-border"
                            style={{
                              background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, rgb(168, 85, 247), rgb(6, 182, 212)) border-box'
                            }}
                          >
                            {categoryConfig.find(c => c.id === productData.category)?.name || productData.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

            {/* Upload Error Display */}
            {validationErrors.upload && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <X className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-red-700 font-semibold mb-1">Upload Error</p>
                    <p className="text-sm text-red-600">{validationErrors.upload}</p>
                  </div>
                </div>
              </div>
            )}
            </div>

            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-4">
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("media")}
                  className="border-slate-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 rounded-xl px-6 py-3"
                >
                  ← Back to Media
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting || 
                    !user || 
                    !productData.title || 
                    !productData.description || 
                    !productData.url ||
                    !productData.category ||
                    !logoFile ||
                    files.length === 0
                  }
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>
                        {uploadProgress.logo && "Uploading logo..."}
                        {uploadProgress.images && "Uploading images..."}
                        {!uploadProgress.logo && !uploadProgress.images && "Creating magic..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>🚀 Launch Product</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          </div>
        </Tabs>
        </div>
        
        <DialogFooter className="flex items-center justify-between pt-6 border-t border-gradient-to-r from-transparent via-slate-200/50 to-transparent bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50 rounded-b-2xl">
          <div className="text-sm text-slate-600 font-medium">
            {activeTab === "details" && "✨ Step 1 of 3: Product details"}
            {activeTab === "media" && "📸 Step 2 of 3: Media upload"}
            {activeTab === "visibility" && "🚀 Step 3 of 3: Launch options"}
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              className={`w-3 h-3 rounded-full border-2 ${activeTab === "details" ? "bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent" : "bg-transparent border-slate-300"}`}
              animate={{ scale: activeTab === "details" ? [1, 1.2, 1] : 1 }}
              transition={{
                duration: 0.8,
                repeat: activeTab === "details" ? Infinity : 0,
                repeatDelay: 1.5,
              }}
            />
            <motion.div
              className={`w-3 h-3 rounded-full border-2 ${activeTab === "media" ? "bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent" : "bg-transparent border-slate-300"}`}
              animate={{ scale: activeTab === "media" ? [1, 1.2, 1] : 1 }}
              transition={{
                duration: 0.8,
                repeat: activeTab === "media" ? Infinity : 0,
                repeatDelay: 1.5,
              }}
            />
            <motion.div
              className={`w-3 h-3 rounded-full border-2 ${activeTab === "visibility" ? "bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent" : "bg-transparent border-slate-300"}`}
              animate={{ scale: activeTab === "visibility" ? [1, 1.2, 1] : 1 }}
              transition={{
                duration: 0.8,
                repeat: activeTab === "visibility" ? Infinity : 0,
                repeatDelay: 1.5,
              }}
            />
          </div>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSubmission;
