-- Phase 1 Supabase schema for ProStore

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Enums (run once)
create type public.user_role as enum ('admin','staff','customer');
create type public.product_condition as enum ('new','second_hand');
create type public.second_hand_grade as enum ('A','B','C');

-- Profiles linked to auth
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Brands & Categories
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

-- Normalized taxonomy: families, models, variants
create table if not exists public.product_families (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (brand_id, slug)
);
create index if not exists idx_product_families_brand on public.product_families(brand_id);

create table if not exists public.product_models (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.product_families(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (family_id, slug)
);
create index if not exists idx_product_models_family on public.product_models(family_id);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.product_models(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (model_id, slug)
);
create index if not exists idx_product_variants_model on public.product_variants(model_id);

-- Option presets per model/variant (colors, storages)
create table if not exists public.product_option_presets (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references public.product_models(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  colors text[] not null default '{}',
  storages text[] not null default '{}',
  constraint one_target check ((model_id is not null) <> (variant_id is not null)),
  unique (model_id),
  unique (variant_id)
);
create index if not exists idx_option_presets_model on public.product_option_presets(model_id);
create index if not exists idx_option_presets_variant on public.product_option_presets(variant_id);

-- Products (base)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id),
  category_id uuid not null references public.categories(id),
  family text,
  model text,
  variant text,
  title text not null,
  description text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- SKUs (sellable variants)
create table if not exists public.product_skus (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  condition public.product_condition not null default 'new',
  attributes jsonb not null default '{}'::jsonb,
  is_active boolean not null default true
);

-- Price & Inventory
create table if not exists public.sku_prices (
  sku_id uuid primary key references public.product_skus(id) on delete cascade,
  currency text not null default 'USD',
  base_price numeric(12,2) not null,
  discount_percent numeric(5,2),
  discount_amount numeric(12,2)
);

create table if not exists public.sku_inventory (
  sku_id uuid primary key references public.product_skus(id) on delete cascade,
  quantity int not null default 0
);

-- Images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0
);

-- Second-hand unique units
create table if not exists public.second_hand_items (
  id uuid primary key default gen_random_uuid(),
  sku_id uuid not null references public.product_skus(id) on delete cascade,
  grade public.second_hand_grade not null,
  serial_number text,
  battery_health int,
  included_accessories jsonb,
  notes text,
  price_override numeric(12,2),
  status text not null default 'available',
  created_at timestamptz not null default now()
);

-- View for storefront
create or replace view public.public_products_view as
select
  p.id as product_id,
  p.title,
  p.description,
  p.family, p.model, p.variant,
  b.name as brand,
  c.name as category,
  i.url as primary_image,
  s.id as sku_id,
  s.condition,
  s.attributes,
  pr.currency,
  coalesce(
    case when pr.discount_amount is not null then pr.base_price - pr.discount_amount
         when pr.discount_percent is not null then pr.base_price * (1 - pr.discount_percent/100)
         else pr.base_price
    end, pr.base_price
  ) as effective_price,
  inv.quantity
from products p
join brands b on b.id = p.brand_id
join categories c on c.id = p.category_id
join product_skus s on s.product_id = p.id and s.is_active = true
left join sku_prices pr on pr.sku_id = s.id
left join sku_inventory inv on inv.sku_id = s.id
left join lateral (
  select url from product_images pi where pi.product_id = p.id
  order by is_primary desc, sort_order asc limit 1
) i on true
where p.published = true;

-- RLS
alter table public.products enable row level security;
alter table public.product_skus enable row level security;
alter table public.sku_prices enable row level security;
alter table public.sku_inventory enable row level security;
alter table public.product_images enable row level security;
alter table public.second_hand_items enable row level security;
alter table public.product_families enable row level security;
alter table public.product_models enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_option_presets enable row level security;

-- Policies (run once)
create policy "public read products" on public.products
for select using (published = true);

create policy "public read skus" on public.product_skus
for select using (
  exists (select 1 from public.products p where p.id = product_id and p.published = true)
);

create policy "public read prices" on public.sku_prices for select using (true);
create policy "public read inventory" on public.sku_inventory for select using (true);
create policy "public read images" on public.product_images for select using (true);
create policy "public read families" on public.product_families for select using (true);
create policy "public read models" on public.product_models for select using (true);
create policy "public read variants" on public.product_variants for select using (true);
create policy "public read option presets" on public.product_option_presets for select using (true);

-- Admin write access (authenticated + profile role check)
create policy "admin write products" on public.products
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy "admin write skus" on public.product_skus
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy "admin write prices" on public.sku_prices
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy "admin write inventory" on public.sku_inventory
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy "admin write images" on public.product_images
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy "admin write secondhand" on public.second_hand_items
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy "admin write families" on public.product_families
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy "admin write models" on public.product_models
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy "admin write variants" on public.product_variants
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

create policy "admin write option presets" on public.product_option_presets
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
); 