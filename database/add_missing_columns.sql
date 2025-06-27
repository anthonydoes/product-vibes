-- SQL script to add missing columns to existing database
-- Run this in your Supabase SQL Editor

-- Add tags column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE public.products ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added tags column to products table';
    ELSE
        RAISE NOTICE 'Tags column already exists';
    END IF;
END $$;

-- Add product_images column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'product_images') THEN
        ALTER TABLE public.products ADD COLUMN product_images TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added product_images column to products table';
    ELSE
        RAISE NOTICE 'Product_images column already exists';
    END IF;
END $$;

-- Add index for tags if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);

-- Add index for product_images if it doesn't exist  
CREATE INDEX IF NOT EXISTS idx_products_images ON public.products USING GIN(product_images);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('tags', 'product_images')
ORDER BY column_name;
