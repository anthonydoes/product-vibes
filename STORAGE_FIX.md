# Quick Fix for Storage Permissions

## The Issue
You're getting a "row-level security policy" error because the storage bucket exists but doesn't have the proper policies set up.

## Quick Solution: Use Supabase Dashboard

### Step 1: Go to Storage Policies
1. Open your Supabase dashboard
2. Navigate to **Storage**
3. Click on the **"product-assets"** bucket
4. Click on the **"Policies"** tab

### Step 2: Create Upload Policy
Click **"New Policy"** and use these settings:

**Policy Name:** `Allow authenticated uploads`
**Operation:** `INSERT`
**Policy Definition:**
```sql
(bucket_id = 'product-assets') AND (auth.role() = 'authenticated')
```

### Step 3: Create Read Policy
Click **"New Policy"** again:

**Policy Name:** `Allow public reads`
**Operation:** `SELECT` 
**Policy Definition:**
```sql
bucket_id = 'product-assets'
```

### Step 4: Test Upload
After creating these policies, try uploading again.

## Alternative: SQL Commands

If you prefer SQL, run this in your Supabase SQL Editor:

```sql
-- Create upload policy
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-assets' AND 
  auth.role() = 'authenticated'
);

-- Create read policy  
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (bucket_id = 'product-assets');
```

## If Still Having Issues

Sometimes the bucket needs to be recreated. Try this:

```sql
-- Delete and recreate bucket
DELETE FROM storage.buckets WHERE id = 'product-assets';
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-assets', 'product-assets', true);
```

Then create the policies again using the dashboard method above.
