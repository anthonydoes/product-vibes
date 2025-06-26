import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, Image, FileVideo, Plus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
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

interface ProductSubmissionProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ProductSubmission: React.FC<ProductSubmissionProps> = ({
  open = true,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    url: "",
    tags: [] as string[],
    tagInput: "",
  });
  const [visibilityPlan, setVisibilityPlan] = useState("free");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);

      // Create preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
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
      setFiles([...files, ...newFiles]);

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

  const handleSubmit = () => {
    // Here you would handle the actual submission
    console.log("Submitting product:", {
      ...productData,
      files,
      visibilityPlan,
    });
    // Reset form or close dialog after submission
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Drop Your Product
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="visibility">Visibility</TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="space-y-4 mt-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
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
                Upload images or videos (max 5 files)
              </p>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group rounded-md overflow-hidden aspect-video bg-muted"
                  >
                    {files[index].type.startsWith("image/") ? (
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
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
                      className="absolute top-2 right-2 bg-background/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
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
            )}

            <div className="flex justify-end mt-4">
              <Button onClick={() => setActiveTab("details")}>
                Next: Product Details
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={productData.title}
                  onChange={handleInputChange}
                  placeholder="What's your product called?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={productData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about your product..."
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="url">Product URL</Label>
                <Input
                  id="url"
                  name="url"
                  value={productData.url}
                  onChange={handleInputChange}
                  placeholder="https://your-product.com"
                  className="mt-1"
                />
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

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("media")}>
                Back: Media
              </Button>
              <Button onClick={() => setActiveTab("visibility")}>
                Next: Visibility Options
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
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 bg-muted aspect-video flex items-center justify-center">
                        {previews.length > 0 ? (
                          files[0].type.startsWith("image/") ? (
                            <img
                              src={previews[0]}
                              alt="Product preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileVideo className="h-10 w-10 text-muted-foreground" />
                          )
                        ) : (
                          <Image className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4 md:w-2/3">
                        <h3 className="font-bold text-lg">
                          {productData.title || "Your Product Title"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {productData.description ||
                            "Your product description will appear here..."}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {productData.tags.length > 0 ? (
                            productData.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="px-2 py-0.5"
                              >
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="secondary" className="px-2 py-0.5">
                              example-tag
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back: Details
              </Button>
              <Button onClick={handleSubmit}>
                {visibilityPlan === "free"
                  ? "Submit Product"
                  : "Continue to Payment"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {activeTab === "media" && "Step 1 of 3: Upload media"}
            {activeTab === "details" && "Step 2 of 3: Add product details"}
            {activeTab === "visibility" &&
              "Step 3 of 3: Choose visibility options"}
          </div>

          <div className="flex space-x-2">
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
              className={`w-2 h-2 rounded-full ${activeTab === "details" ? "bg-primary" : "bg-muted"}`}
              animate={{ scale: activeTab === "details" ? [1, 1.2, 1] : 1 }}
              transition={{
                duration: 0.5,
                repeat: activeTab === "details" ? Infinity : 0,
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
