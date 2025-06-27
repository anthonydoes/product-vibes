-- Supabase Storage Setup
-- Run this in your Supabase SQL Editor to set up storage buckets and policies

-- Create storage bucket for product assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-assets', 'product-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by default in Supabase
-- We don't need to enable it manually

-- Policy: Allow anyone to view public product assets
CREATE POLICY "Public product assets are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-assets');

-- Policy: Allow authenticated users to upload product assets
CREATE POLICY "Authenticated users can upload product assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-assets' 
        AND auth.role() = 'authenticated'
    );

-- Policy: Allow users to update their own uploads
CREATE POLICY "Users can update their own product assets" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-assets' 
        AND auth.uid()::text = owner
    );

-- Policy: Allow users to delete their own uploads  
CREATE POLICY "Users can delete their own product assets" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-assets' 
        AND auth.uid()::text = owner
    );
