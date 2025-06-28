-- Fix the increment_product_views function to properly update the view count
-- Run this in your Supabase SQL editor

-- Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS increment_product_views(UUID, UUID, INET);

-- Create the new function with proper error handling and return value
CREATE OR REPLACE FUNCTION increment_product_views(product_uuid UUID, user_uuid UUID DEFAULT NULL, user_ip INET DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    -- Update product view count and get the new count
    UPDATE public.products 
    SET view_count = COALESCE(view_count, 0) + 1 
    WHERE id = product_uuid
    RETURNING view_count INTO new_count;
    
    -- Check if the product was found and updated
    IF new_count IS NULL THEN
        RAISE EXCEPTION 'Product with id % not found', product_uuid;
    END IF;
    
    -- Insert view record for analytics
    INSERT INTO public.product_views (product_id, user_id, ip_address)
    VALUES (product_uuid, user_uuid, user_ip);
    
    -- Return the new view count
    RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Update the view_count to match the actual number of views in product_views
UPDATE public.products 
SET view_count = (
    SELECT COUNT(*) 
    FROM public.product_views 
    WHERE product_views.product_id = products.id
)
WHERE id IN (
    SELECT DISTINCT product_id 
    FROM public.product_views
);
