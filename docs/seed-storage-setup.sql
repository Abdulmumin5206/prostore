-- Create storage bucket for product images (idempotent)
-- Requires service role key when run via HTTP; in dashboard SQL editor it has privileges.

-- 1) Create bucket if missing
insert into storage.buckets (id, name, public)
select 'product-images', 'product-images', true
where not exists (select 1 from storage.buckets where id = 'product-images');

-- 2) Allow public read access to objects in this bucket via RLS policies
-- Note: Supabase sets default RLS on storage; add policies if not present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read product-images'
  ) THEN
    EXECUTE 'create policy "Public read product-images" on storage.objects for select to public using (bucket_id = ''product-images'')';
  END IF;
END $$;

-- 3) Allow authenticated users to upload to this bucket
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated upload product-images'
  ) THEN
    EXECUTE 'create policy "Authenticated upload product-images" on storage.objects for insert to authenticated with check (bucket_id = ''product-images'')';
  END IF;
END $$;

-- 4) Optional: allow authenticated delete
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated delete product-images'
  ) THEN
    EXECUTE 'create policy "Authenticated delete product-images" on storage.objects for delete to authenticated using (bucket_id = ''product-images'')';
  END IF;
END $$; 