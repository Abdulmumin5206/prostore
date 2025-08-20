-- ProStore reset: remove all products and product images
--
-- What this does:
-- 1) Empties the Supabase Storage bucket `product-images`
-- 2) Truncates products (and cascades to SKUs, prices, inventory, images)
-- 3) Optionally (commented) clears taxonomy tables if you want a full catalog reset
--
-- Usage:
-- - Open Supabase Dashboard → SQL editor
-- - Paste & run this file
-- - If you want to also clear taxonomy, uncomment the optional TRUNCATEs at the bottom
-- - If you dropped/removed the bucket, re-run docs/seed-storage-setup.sql to re-create and set policies

begin;

-- 1) Empty product-images bucket if it exists (safe to re-run)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
    DELETE FROM storage.objects WHERE bucket_id = 'product-images';
  END IF;
END $$;

-- 2) Remove all products and dependent rows
-- CASCADE will clean product_skus, sku_prices, sku_inventory, product_images
TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;

-- 3) OPTIONAL: also clear taxonomy/content (uncomment the lines you need)
-- TRUNCATE TABLE public.product_model_content RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE public.product_option_presets RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE public.product_variants RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE public.product_models RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE public.product_families RESTART IDENTITY CASCADE;

commit; 