# Supabase Storage Setup Guide

## Overview
This guide shows you how to set up Supabase Storage for handling file uploads in your Product Vibes app.

## Step 1: Create Storage Bucket

### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **"New bucket"**
4. Set the following:
   - **Name**: `product-assets`
   - **Public bucket**: ✅ Enabled
   - **File size limit**: 50MB (recommended)
   - **Allowed MIME types**: `image/*` (for now)

### Option B: Using SQL (Recommended)
Run the SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of /database/setup_storage.sql
```

## Step 2: Configure Storage Policies

The SQL script includes these policies:
- **Public Read**: Anyone can view uploaded product assets
- **Authenticated Upload**: Only logged-in users can upload
- **Owner Management**: Users can update/delete their own uploads

## Step 3: Test the Implementation

### Test Logo Upload
1. Open the product submission modal
2. In the "Details" tab, upload a logo image
3. Proceed through the form and submit
4. Check that the logo appears in the product grid

### Test Product Images Upload
1. In the "Media" tab, upload 1-5 product images
2. Verify previews show correctly
3. Submit the product
4. Check that the first image is used as fallback in product grid

## Step 4: Verify Storage in Dashboard

1. Go to **Storage** → **product-assets** in your Supabase dashboard
2. You should see folders:
   - `logos/` - Contains uploaded logo files
   - `products/` - Contains uploaded product images

## File Organization

```
product-assets/
├── logos/
│   ├── {userId}_{timestamp}_logo.jpg
│   └── {userId}_{timestamp}_logo.png
└── products/
    ├── {timestamp}_{random}.jpg
    ├── {timestamp}_{random}.png
    └── {timestamp}_{random}.mp4
```

## Storage Service Features

### Upload Single File
```typescript
const { url, error } = await StorageService.uploadFile(
  file, 
  'logos', 
  'custom-filename'
);
```

### Upload Multiple Files
```typescript
const { urls, errors } = await StorageService.uploadMultipleFiles(
  files, 
  'products'
);
```

### Delete File
```typescript
const { success, error } = await StorageService.deleteFile(filePath);
```

### Get Public URL
```typescript
const url = StorageService.getPublicUrl(filePath);
```

## Environment Variables

Make sure these are set in your `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Notes

- ✅ Files are publicly readable (good for product assets)
- ✅ Only authenticated users can upload
- ✅ Users can only manage their own uploads
- ✅ RLS policies protect against unauthorized access

## Optional Enhancements

### File Size Limits
Add client-side validation:
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
if (file.size > MAX_FILE_SIZE) {
  // Show error
}
```

### Image Compression
Install and use image compression:
```bash
npm install browser-image-compression
```

### File Type Validation
```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  // Show error
}
```

## Troubleshooting

### Common Issues

1. **Upload fails with "403 Forbidden"**
   - Check that storage policies are correctly set
   - Verify user is authenticated

2. **Images don't display**
   - Check that bucket is public
   - Verify the URL is correctly formed

3. **RLS policy errors**
   - Make sure RLS is enabled on `storage.objects`
   - Check policy conditions match your use case

### Debug Storage Issues

Check browser console for errors and verify uploads in Supabase dashboard under Storage → product-assets.
