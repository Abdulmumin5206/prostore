# ProStore

- Frontend: Vite + React + Tailwind
- Backend: Supabase (Postgres + Auth)

## Setup
1. Configure Supabase env in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Apply database schema: run `docs/supabase-schema.sql` in Supabase SQL editor.
3. Seed Apple catalog (one-time): run either the master `docs/seeds/apple.sql` or per-family seeds below. All are idempotent.
4. Start dev server: `npm install && npm run dev`.

## Catalog Data Model
- Brands, Families, Models, Variants
- Option Presets per Model/Variant (colors, storages)
- Products (base) with `public_id` for human search
- SKUs (sellable) with `sku_code` and `attributes` (e.g., `{ storage, color, connectivity }`)
- Pricing (`sku_prices`) and Inventory (`sku_inventory`)
- Images per product
- Second-hand items table for unique used units (grade, battery health, serial, accessories, notes, status, price override)
- Public view `public_products_view` for storefront queries

## Import via CSV/Excel (new)
- CSV templates live in `docs/csv/` (`Products.csv`, `Skus.csv`, `Images.csv`, `OptionPresets.csv`, `ModelContent.csv`).
- Place local image files under `public/import_images/` and reference filenames in `Images.csv`.
- Run storage setup once: `docs/seed-storage-setup.sql`.
- Importer (dry-run scaffolding): `npm run import:catalog` (requires env vars; supports `SUPABASE_SERVICE_ROLE_KEY` for full access).

## Seeding
- Master (all Apple at once): `docs/seeds/apple.sql`
- Per-family seeds (run only what you need):
  - iPhone (resets iPhone and reseeds correctly): `docs/seeds/apple/iphone.sql`
  - iPad (resets iPad and reseeds correctly): `docs/seeds/apple/ipad.sql`
  - Watch: `docs/seeds/apple/watch.sql`
  - MacBook Air: `docs/seeds/apple/macbook_air.sql`
  - MacBook Pro: `docs/seeds/apple/macbook_pro.sql`
  - iMac: `docs/seeds/apple/imac.sql`
  - Mac mini: `docs/seeds/apple/mac_mini.sql`
  - Mac Studio: `docs/seeds/apple/mac_studio.sql`
  - AirPods: `docs/seeds/apple/airpods.sql`
  - Apple TV: `docs/seeds/apple/apple_tv.sql`
  - HomePod: `docs/seeds/apple/homepod.sql`
- If you delete seeded rows, re-run the same SQL; it will re-create any missing rows. iPhone seed will also clean outdated iPhone structure before inserting.

## Second-hand Workflow
1. Create a base Product and SKU with condition `second_hand` or reuse an existing SKU.
2. Add unique units to `second_hand_items` using `createSecondHandItem` in `src/lib/db.ts`.

## Reset + Seed Apple, then export CSV

1. Apply schema (run once):
   - Open Supabase SQL editor and run `docs/supabase-schema.sql`.

2. Reset Apple data (safe):
   - Run `docs/reset/apple_reset.sql` in Supabase SQL editor. This removes Apple products, option presets, variants, models, and families, while keeping the `Apple` brand and all categories.

3. Seed Apple catalog:
   - For full Apple: run `docs/seeds/apple.sql`.
   - Or seed only one family: run the desired file under `docs/seeds/apple/` (e.g., `iphone.sql`).

4. Create CSV-friendly views:
   - Run `docs/views/admin_csv_views.sql`.

5. Export CSVs in Supabase:
   - Products: `select * from admin_csv_products where brand = 'Apple';`
   - SKUs: `select s.* from admin_csv_skus s join admin_csv_products p on p.product_id = s.product_id where p.brand = 'Apple';`
   - Option presets: `select * from admin_csv_option_presets;`
   - In the SQL editor, click Download CSV on query results.

## Codes
- Product `public_id` is auto-generated from title/family/model for easy admin search.
- SKU `sku_code` includes condition and attributes for precise identification.

## Database: Apply schema and seed data

1. Open Supabase dashboard > SQL Editor.
2. Paste and run `docs/supabase-schema.sql` (entire file). It is idempotent.
3. Then run `docs/seed-brands-categories.sql`.
4. Optionally run `docs/seed-apple-iphone.sql` to prefill Apple/iPhone taxonomy and a sample product.

After this, the admin wizard will let you:
- Choose condition (new vs second_hand)
- Pick brand → family → model → variant
- Select color/storage from presets
- Price, stock, and upload images

### Storage setup (fix bucket not found 400)
- Run `docs/seed-storage-setup.sql` in Supabase SQL editor to create the `product-images` bucket and storage policies.

### Ordering and naming updates
- Re-run `docs/seed-apple-iphone-variants.sql` to set `display_order` for models and variants and full variant names (e.g., "iPhone 15 Pro Max").
