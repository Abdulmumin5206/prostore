prostore

Setup notes:
- See `docs/supabase-schema.sql` for database schema, view, and RLS policies to run in Supabase SQL editor.
- Create storage buckets: `product-images` (public read, authenticated/admin write) and `secondhand-images` (public read, authenticated/admin write).
- Ensure a row in `public.profiles` exists for your admin user with `role='admin'`.
