-- Fix RLS policies for product_views table to allow public read access for platform stats
-- Run this in your Supabase SQL editor

-- Allow anyone to read product_views for platform statistics
DROP POLICY IF EXISTS "Anyone can read product views for statistics" ON public.product_views;
CREATE POLICY "Anyone can read product views for statistics" 
ON public.product_views FOR SELECT 
TO public
USING (true);

-- Keep the existing insert policy for tracking views
-- (This should already exist from the setup)
DROP POLICY IF EXISTS "Anyone can insert product views" ON public.product_views;
CREATE POLICY "Anyone can insert product views" 
ON public.product_views FOR INSERT 
TO public 
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
