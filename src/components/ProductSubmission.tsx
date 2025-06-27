import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, Image, FileVideo, Plus, Check, ExternalLink, ChevronUp } from "lucide-react";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const allFiles = [...files, ...newFiles];
      
      // Validate the files
      const validation = FileValidator.validateProductMedia(allFiles);
      if (!validation.isValid) {
        setValidationErrors(prev => ({ ...prev, media: validation.error }));
        return;
      }
      
      setFiles(allFiles);

      // Create preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
      
      // Clear media validation errors
      clearValidationError('media');
    }
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate the logo file
      const validation = FileValidator.validateLogo(file);
      if (!validation.isValid) {
        setValidationErrors(prev => ({ ...prev, logo: validation.error }));
        return;
      }
      
      setLogoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      // Clear any logo validation errors
      clearValidationError('logo');
    }
  };

  const removeLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
  };

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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Drop Your Product
          </DialogTitle>
          <DialogDescription>
            Share your product with the community and get valuable feedback
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Product Images & Videos *</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors ${validationErrors.media ? 'border-red-500' : ''}`}
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
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">
                  Drag & drop or click to upload
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload images or videos (max 5 files, up to 10MB each)
                </p>
              </div>
              {validationErrors.media && (
                <p className="text-sm text-red-500 mt-2">{validationErrors.media}</p>
              )}
            </div>

            {previews.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Drag images to reorder them. The first image will be your main preview.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleImageDragOver(e, index)}
                    onDrop={(e) => handleImageDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group rounded-md overflow-hidden aspect-video bg-muted cursor-move transition-all ${
                      draggedIndex === index ? 'opacity-50 scale-95' : 'hover:scale-105'
                    }`}
                  >
                    {files[index].type.startsWith("image/") ? (
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileVideo className="h-10 w-10 text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          {files[index].name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-background/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {index + 1}
                    </div>
                  </div>
                ))}
                {previews.length < 5 && (
                  <div
                    className="flex items-center justify-center border-2 border-dashed rounded-md aspect-video cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back: Product Details
              </Button>
              <Button 
                onClick={() => {
                  if (validateMediaTab()) {
                    setActiveTab("visibility");
                  }
                }}
              >
                Next: Visibility Options
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={productData.title}
                  onChange={handleInputChange}
                  placeholder="What's your product called?"
                  className={`mt-1 ${validationErrors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={productData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about your product..."
                  className={`mt-1 min-h-[120px] ${validationErrors.description ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.description}</p>
                )}
              </div>

              <div>
                <Label htmlFor="url">Product URL *</Label>
                <Input
                  id="url"
                  name="url"
                  value={productData.url}
                  onChange={handleInputChange}
                  placeholder="your-product.com"
                  className={`mt-1 ${validationErrors.url ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {validationErrors.url && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.url}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  We'll automatically add https:// if not provided
                </p>
              </div>

              {/* Logo Upload */}
              <div>
                <Label htmlFor="logo">Product Logo *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  This will be the main image shown in your product card
                </p>
                <div className="mt-1">
                  {!logoPreview ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-colors ${validationErrors.logo ? 'border-red-500' : ''}`}
                      onClick={() => document.getElementById("logo-upload")?.click()}
                    >
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        Upload Product Logo
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WebP up to 5MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-accent/20">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Logo uploaded</p>
                        <p className="text-xs text-muted-foreground">This will appear in your product card</p>
                      </div>
                      <button
                        onClick={removeLogo}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {validationErrors.logo && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.logo}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={productData.category}
                  onValueChange={(value) => {
                    setProductData({ ...productData, category: value });
                    clearValidationError('category');
                  }}
                >
                  <SelectTrigger className={`mt-1 ${validationErrors.category ? 'border-red-500 focus:border-red-500' : ''}`}>
                    <SelectValue placeholder="Select a category for your product" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryConfig
                      .filter((cat) => cat.id !== "all") // Exclude "All" option
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {validationErrors.category && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.category}</p>
                )}
                {!productData.category && !validationErrors.category && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Please select a category to help users discover your product
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tags">Tags (up to 5)</Label>
                <Input
                  id="tags"
                  name="tagInput"
                  value={productData.tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tags and press Enter"
                  className="mt-1"
                  disabled={productData.tags.length >= 5}
                />

                {productData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {productData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-2 py-1"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-2">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => {
                  if (validateDetailsTab()) {
                    setActiveTab("media");
                  }
                }}
              >
                Next: Media Upload
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Choose Visibility Plan</h3>

              <RadioGroup
                value={visibilityPlan}
                onValueChange={setVisibilityPlan}
                className="grid gap-4 md:grid-cols-2"
              >
                <div>
                  <RadioGroupItem
                    value="free"
                    id="free"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="free"
                    className="flex flex-col items-start p-4 border rounded-md cursor-pointer hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg font-semibold">Free</span>
                      <span className="text-lg font-bold">$0</span>
                    </div>
                    <span className="text-sm text-muted-foreground mt-1">
                      Standard submission with basic visibility
                    </span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="boost"
                    id="boost"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="boost"
                    className="flex flex-col items-start p-4 border rounded-md cursor-pointer hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg font-semibold">Boost</span>
                      <span className="text-lg font-bold">$15</span>
                    </div>
                    <span className="text-sm text-muted-foreground mt-1">
                      7-day boost with enhanced visibility and analytics
                    </span>
                  </Label>
                </div>
              </RadioGroup>

              <div className="mt-6">
                <h4 className="text-md font-medium mb-2">Preview</h4>
                <div className="bg-card rounded-lg border p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4">
                    {/* Logo - exact match to ProductGrid */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 border">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt={productData.title || "Product logo"} 
                            className="w-full h-full object-cover" 
                          />
                        ) : previews.length > 0 ? (
                          files[0].type.startsWith("image/") ? (
                            <img 
                              src={previews[0]} 
                              alt={productData.title || "Product preview"} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📦
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Content - exact match to ProductGrid */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {productData.url ? (
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base truncate">
                                  {productData.title || "Your Product Title"}
                                </h3>
                                <ExternalLink className="h-3 w-3 opacity-60" />
                              </div>
                            ) : (
                              <h3 className="font-semibold text-base truncate">
                                {productData.title || "Your Product Title"}
                              </h3>
                            )}
                            
                            {/* Fresh badge for new products */}
                            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs border-0">
                              ✨ Fresh
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {productData.description || "Your product description will appear here..."}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[10px]">YU</AvatarFallback>
                              </Avatar>
                              <span>You</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {productData.category || "Category"}
                            </Badge>
                            <span className="text-muted-foreground">
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Tags - exact match to ProductGrid */}
                          {productData.tags && productData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {productData.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                                  {tag}
                                </Badge>
                              ))}
                              {productData.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
                                  +{productData.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Simple upvote button */}
                        <div className="ml-4">
                          <div className="flex flex-col items-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs gap-1 hover:border-primary hover:bg-primary/5 relative overflow-hidden transition-all duration-300"
                            >
                              <ChevronUp className="h-3 w-3 text-current" />
                              <span className="font-semibold">0</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Error Display */}
            {validationErrors.upload && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{validationErrors.upload}</p>
                <p className="text-xs text-red-500 mt-1">
                  Check the storage setup guide in STORAGE_FIX.md
                </p>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("media")}>
                Back: Media Upload
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
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {uploadProgress.logo && "Uploading logo..."}
                    {uploadProgress.images && "Uploading images..."}
                    {!uploadProgress.logo && !uploadProgress.images && "Creating product..."}
                  </div>
                ) : (
                  "Submit Product"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {activeTab === "details" && "Step 1 of 3: Add product details"}
            {activeTab === "media" && "Step 2 of 3: Upload media"}
            {activeTab === "visibility" &&
              "Step 3 of 3: Choose visibility options"}
          </div>

          <div className="flex space-x-2">
            <motion.div
              className={`w-2 h-2 rounded-full ${activeTab === "details" ? "bg-primary" : "bg-muted"}`}
              animate={{ scale: activeTab === "details" ? [1, 1.2, 1] : 1 }}
              transition={{
                duration: 0.5,
                repeat: activeTab === "details" ? Infinity : 0,
                repeatDelay: 1,
              }}
            />
            <motion.div
              className={`w-2 h-2 rounded-full ${activeTab === "media" ? "bg-primary" : "bg-muted"}`}
              animate={{ scale: activeTab === "media" ? [1, 1.2, 1] : 1 }}
              transition={{
                duration: 0.5,
                repeat: activeTab === "media" ? Infinity : 0,
                repeatDelay: 1,
              }}
            />
            <motion.div
              className={`w-2 h-2 rounded-full ${activeTab === "visibility" ? "bg-primary" : "bg-muted"}`}
              animate={{ scale: activeTab === "visibility" ? [1, 1.2, 1] : 1 }}
              transition={{
                duration: 0.5,
                repeat: activeTab === "visibility" ? Infinity : 0,
                repeatDelay: 1,
              }}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSubmission;
