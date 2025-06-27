-- Simplified Storage Setup (Minimal SQL)
-- Run this in your Supabase SQL Editor

-- Only create the bucket - policies will be created via dashboard
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-assets', 'product-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Verify the bucket was created
SELECT id, name, public FROM storage.buckets WHERE id = 'product-assets';

-- Note: After running this, go to Storage → product-assets → Policies 
-- in your Supabase dashboard to create the policies manually
