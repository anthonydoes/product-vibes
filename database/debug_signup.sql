-- Debug platform stats and view tracking
-- Run this in Supabase SQL editor to check stats

-- Test 1: Check if product_views table exists and has correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product_views' 
ORDER BY ordinal_position;

-- Test 2: Check how many views are recorded today
SELECT COUNT(*) as today_views
FROM product_views 
WHERE created_at >= CURRENT_DATE;

-- Test 3: Check total product views in product_views table
SELECT COUNT(*) as total_views_in_table
FROM product_views;

-- Test 4: Check products table view_count totals
SELECT SUM(view_count) as total_view_count_column
FROM products;

-- Test 5: Check if increment_product_views function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'increment_product_views';

-- Test 6: Platform stats breakdown
SELECT 
  'Today Products' as metric,
  COUNT(*) as count
FROM products 
WHERE created_at >= CURRENT_DATE
UNION ALL
SELECT 
  'Today Upvotes' as metric,
  COUNT(*) as count
FROM upvotes 
WHERE created_at >= CURRENT_DATE
UNION ALL
SELECT 
  'Today Views' as metric,
  COUNT(*) as count
FROM product_views 
WHERE created_at >= CURRENT_DATE
UNION ALL
SELECT 
  'All Time Products' as metric,
  COUNT(*) as count
FROM products
UNION ALL
SELECT 
  'All Time Upvotes' as metric,
  COUNT(*) as count
FROM upvotes;
