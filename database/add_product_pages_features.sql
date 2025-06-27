-- Add fields needed for product pages and public profiles
-- Run this migration to add the necessary columns and features

-- Add bio field to profiles for public profile pages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
    
    -- Add view count to products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'view_count') THEN
        ALTER TABLE public.products ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add slug for pretty URLs (will be generated from name)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'slug') THEN
        ALTER TABLE public.products ADD COLUMN slug TEXT;
    END IF;
    
    -- Add product_info for long descriptions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'product_info') THEN
        ALTER TABLE public.products ADD COLUMN product_info TEXT;
    END IF;
END $$;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- Create index on creator_id for profile page queries
CREATE INDEX IF NOT EXISTS idx_products_creator_id ON public.products(creator_id);

-- Create product_views table to track individual views (optional, for analytics)
CREATE TABLE IF NOT EXISTS public.product_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) NOT NULL,
    user_id UUID REFERENCES public.profiles(id), -- NULL for anonymous views
    ip_address INET, -- For anonymous tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for product_views
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON public.product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON public.product_views(created_at);

-- Function to generate slug from product name
CREATE OR REPLACE FUNCTION generate_product_slug(product_name TEXT, product_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from name
    base_slug := lower(regexp_replace(product_name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    -- Ensure slug is not empty
    IF base_slug = '' THEN
        base_slug := 'product';
    END IF;
    
    final_slug := base_slug;
    
    -- Check if slug exists and increment if needed
    WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = final_slug AND id != product_id) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to increment product view count
CREATE OR REPLACE FUNCTION increment_product_views(product_uuid UUID, user_uuid UUID DEFAULT NULL, user_ip INET DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- Update product view count
    UPDATE public.products 
    SET view_count = view_count + 1 
    WHERE id = product_uuid;
    
    -- Insert view record for analytics
    INSERT INTO public.product_views (product_id, user_id, ip_address)
    VALUES (product_uuid, user_uuid, user_ip);
END;
$$ LANGUAGE plpgsql;

-- Update existing products to have slugs
UPDATE public.products 
SET slug = generate_product_slug(name, id) 
WHERE slug IS NULL;

-- Set up RLS (Row Level Security) policies for product_views
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert views (for tracking)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'product_views' 
        AND policyname = 'Anyone can insert product views'
    ) THEN
        CREATE POLICY "Anyone can insert product views" ON public.product_views
        FOR INSERT TO authenticated, anon
        WITH CHECK (true);
    END IF;
END $$;

-- Allow users to see their own views
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'product_views' 
        AND policyname = 'Users can see their own views'
    ) THEN
        CREATE POLICY "Users can see their own views" ON public.product_views
        FOR SELECT TO authenticated
        USING (user_id = auth.uid());
    END IF;
END $$;

-- Allow product owners to see views of their products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'product_views' 
        AND policyname = 'Product owners can see views of their products'
    ) THEN
        CREATE POLICY "Product owners can see views of their products" ON public.product_views
        FOR SELECT TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.products p
                WHERE p.id = product_views.product_id 
                AND p.creator_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Trigger to auto-generate slug when product is created/updated
CREATE OR REPLACE FUNCTION update_product_slug()
RETURNS TRIGGER AS $$
BEGIN
    NEW.slug := generate_product_slug(NEW.name, NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_update_product_slug ON public.products;
CREATE TRIGGER trigger_update_product_slug
BEFORE INSERT OR UPDATE OF name ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_product_slug();
