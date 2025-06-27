# Alternative Storage Setup (Using Supabase Dashboard)

## If you're getting SQL permission errors, use this dashboard approach instead:

### Step 1: Create Bucket via Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **"New bucket"**
4. Set the following:
   - **Name**: `product-assets`
   - **Public bucket**: ✅ **ENABLED** (This is important!)
   - **File size limit**: 50MB
   - **Allowed MIME types**: Leave empty (allows all) or add: `image/*,video/*`

### Step 2: Create Policies via Dashboard

1. After creating the bucket, you'll see it in the Storage section
2. Click on the **"product-assets"** bucket
3. Go to the **"Policies"** tab
4. Click **"New Policy"**

#### Policy 1: Public Read Access
- **Policy name**: `Public product assets are viewable by everyone`
- **Allowed operation**: `SELECT`
- **Policy definition**: 
  ```sql
  bucket_id = 'product-assets'
  ```

#### Policy 2: Authenticated Upload
- **Policy name**: `Authenticated users can upload product assets`  
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  bucket_id = 'product-assets' AND auth.role() = 'authenticated'
  ```

#### Policy 3: User Update Own Files
- **Policy name**: `Users can update their own product assets`
- **Allowed operation**: `UPDATE` 
- **Policy definition**:
  ```sql
  bucket_id = 'product-assets' AND auth.uid()::text = owner
  ```

#### Policy 4: User Delete Own Files  
- **Policy name**: `Users can delete their own product assets`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  bucket_id = 'product-assets' AND auth.uid()::text = owner
  ```

### Step 3: Test the Setup

Try this minimal SQL to verify the bucket was created:

```sql
-- Just check if the bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-assets';
```

If you see the bucket listed, then proceed to test file uploads in your app.

### Why Dashboard Method Works Better

- Supabase Dashboard has the proper permissions to create storage policies
- The UI guides you through the correct policy syntax
- Less chance of permission errors
- Visual feedback on policy creation

### Alternative: Minimal SQL Approach

If you want to try SQL again, use only this minimal version:

```sql
-- Only create the bucket (skip policies for now)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-assets', 'product-assets', true)
ON CONFLICT (id) DO NOTHING;
```

Then create policies through the dashboard as described above.
