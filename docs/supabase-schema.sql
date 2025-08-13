-- Phase 1 Supabase schema for ProStore

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Enums (run once)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin','staff','customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.product_condition AS ENUM ('new','second_hand');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.second_hand_grade AS ENUM ('A','B','C');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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
alter table if exists public.product_option_presets add column if not exists options jsonb not null default '{}'::jsonb;

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
  created_at timestamptz not null default now(),
  -- Added: human-friendly product code for admin search and external references
  public_id text unique
);
-- Ensure new columns exist even if tables were created earlier
alter table if exists public.products add column if not exists public_id text unique;
-- Ensure products has specs jsonb for detailed attributes/specifications
alter table if exists public.products add column if not exists specs jsonb not null default '{}'::jsonb;

-- SKUs (sellable variants)
create table if not exists public.product_skus (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  condition public.product_condition not null default 'new',
  attributes jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  -- Added: human-friendly sku code for admin search and labeling
  sku_code text unique
);
-- Ensure new columns exist even if tables were created earlier
alter table if exists public.product_skus add column if not exists sku_code text unique;

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

-- Indexes for faster search/filtering
create index if not exists idx_products_brand on public.products(brand_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_title on public.products using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(family,'') || ' ' || coalesce(model,'') || ' ' || coalesce(variant,'')));
create index if not exists idx_products_public_id on public.products(public_id);

create index if not exists idx_skus_product on public.product_skus(product_id);
create index if not exists idx_skus_condition on public.product_skus(condition);
create index if not exists idx_skus_code on public.product_skus(sku_code);
create index if not exists idx_skus_attributes on public.product_skus using gin (attributes jsonb_path_ops);

create index if not exists idx_second_hand_sku on public.second_hand_items(sku_id);
create index if not exists idx_second_hand_grade on public.second_hand_items(grade);
create index if not exists idx_second_hand_status on public.second_hand_items(status);
create index if not exists idx_second_hand_serial on public.second_hand_items(serial_number);

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
DROP POLICY IF EXISTS "public read products" ON public.products;
create policy "public read products" on public.products
for select using (published = true);

DROP POLICY IF EXISTS "public read skus" ON public.product_skus;
create policy "public read skus" on public.product_skus
for select using (
  exists (select 1 from public.products p where p.id = product_id and p.published = true)
);

DROP POLICY IF EXISTS "public read prices" ON public.sku_prices;
create policy "public read prices" on public.sku_prices for select using (true);

DROP POLICY IF EXISTS "public read inventory" ON public.sku_inventory;
create policy "public read inventory" on public.sku_inventory for select using (true);

DROP POLICY IF EXISTS "public read images" ON public.product_images;
create policy "public read images" on public.product_images for select using (true);

DROP POLICY IF EXISTS "public read families" ON public.product_families;
create policy "public read families" on public.product_families for select using (true);

DROP POLICY IF EXISTS "public read models" ON public.product_models;
create policy "public read models" on public.product_models for select using (true);

DROP POLICY IF EXISTS "public read variants" ON public.product_variants;
create policy "public read variants" on public.product_variants for select using (true);

DROP POLICY IF EXISTS "public read option presets" ON public.product_option_presets;
create policy "public read option presets" on public.product_option_presets for select using (true);

-- Admin write access (authenticated + profile role check)
DROP POLICY IF EXISTS "admin write products" ON public.products;
create policy "admin write products" on public.products
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

DROP POLICY IF EXISTS "admin write skus" ON public.product_skus;
create policy "admin write skus" on public.product_skus
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

DROP POLICY IF EXISTS "admin write prices" ON public.sku_prices;
create policy "admin write prices" on public.sku_prices
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

DROP POLICY IF EXISTS "admin write inventory" ON public.sku_inventory;
create policy "admin write inventory" on public.sku_inventory
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

DROP POLICY IF EXISTS "admin write images" ON public.product_images;
create policy "admin write images" on public.product_images
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

DROP POLICY IF EXISTS "admin write secondhand" ON public.second_hand_items;
create policy "admin write secondhand" on public.second_hand_items
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

DROP POLICY IF EXISTS "admin write families" ON public.product_families;
create policy "admin write families" on public.product_families
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

DROP POLICY IF EXISTS "admin write models" ON public.product_models;
create policy "admin write models" on public.product_models
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

DROP POLICY IF EXISTS "admin write variants" ON public.product_variants;
create policy "admin write variants" on public.product_variants
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
);

DROP POLICY IF EXISTS "admin write option presets" ON public.product_option_presets;
create policy "admin write option presets" on public.product_option_presets
for all to authenticated using (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
) with check (
  exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role = 'admin')
); 

-- Helper: slugify to generate clean codes
create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce($1,'')), '[^a-z0-9]+', '-', 'g'));
$$;

-- Auto-generate product.public_id if missing, based on family/model/variant/title
create or replace function public.products_set_public_id()
returns trigger
language plpgsql
as $$
declare
  base text;
  candidate text;
  i int := 1;
begin
  if new.public_id is null or length(new.public_id) = 0 then
    new.public_id := public.slugify(
      coalesce(new.family,'') || ' ' || coalesce(new.model,'') || ' ' || coalesce(new.variant, new.title)
    );
  end if;

  -- Ensure uniqueness by adding a numeric suffix if needed
  base := new.public_id;
  candidate := base;
  while exists (
    select 1 from public.products p
    where p.public_id = candidate and (TG_OP = 'INSERT' or p.id <> new.id)
  ) loop
    i := i + 1;
    candidate := base || '-' || i::text;
  end loop;
  new.public_id := candidate;

  return new;
end;
$$;

drop trigger if exists trg_products_set_public_id on public.products;
create trigger trg_products_set_public_id
before insert or update on public.products
for each row execute function public.products_set_public_id();

-- Auto-generate sku.sku_code if missing, based on product public_id + condition + key attributes
create or replace function public.product_skus_set_sku_code()
returns trigger
language plpgsql
as $$
declare
  prod public.products;
  color_name text;
  storage_size text;
  cond text;
  code_source text;
begin
  if new.sku_code is null or length(new.sku_code) = 0 then
    select * into prod from public.products where id = new.product_id;
    color_name := coalesce(new.attributes->>'color','');
    storage_size := coalesce(new.attributes->>'storage','');
    cond := coalesce((new.condition)::text, 'new');
    code_source := coalesce(prod.public_id,'') || ' ' || cond || ' ' || storage_size || ' ' || color_name;
    new.sku_code := public.slugify(code_source);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_product_skus_set_sku_code on public.product_skus;
create trigger trg_product_skus_set_sku_code
before insert or update on public.product_skus
for each row execute function public.product_skus_set_sku_code(); 

-- Hardening: constraints, indexes, and taxonomy improvements
-- These statements are idempotent and safe to rerun

-- Categories: support hierarchy (optional)
alter table if exists public.categories add column if not exists parent_id uuid references public.categories(id) on delete set null;
create index if not exists idx_categories_parent on public.categories(parent_id);

-- Brands/Categories optional metadata
alter table if exists public.brands add column if not exists description text;
alter table if exists public.brands add column if not exists logo_url text;
alter table if exists public.categories add column if not exists description text;

-- Products: index specs for filtering and search
create index if not exists idx_products_specs on public.products using gin (specs jsonb_path_ops);

-- Ensure at most one primary image per product
create unique index if not exists uidx_product_images_primary on public.product_images(product_id) where is_primary;

-- Inventory and pricing sanity checks (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sku_inventory_non_negative' AND conrelid = 'public.sku_inventory'::regclass
  ) THEN
    ALTER TABLE public.sku_inventory ADD CONSTRAINT sku_inventory_non_negative CHECK (quantity >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sku_prices_non_negative' AND conrelid = 'public.sku_prices'::regclass
  ) THEN
    ALTER TABLE public.sku_prices ADD CONSTRAINT sku_prices_non_negative CHECK (
      base_price >= 0 AND (discount_amount IS NULL OR discount_amount >= 0)
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sku_prices_discount_percent_range' AND conrelid = 'public.sku_prices'::regclass
  ) THEN
    ALTER TABLE public.sku_prices ADD CONSTRAINT sku_prices_discount_percent_range CHECK (
      discount_percent IS NULL OR (discount_percent >= 0 AND discount_percent <= 100)
    );
  END IF;
END $$;

-- Second-hand items sanity checks (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'second_hand_battery_health_range' AND conrelid = 'public.second_hand_items'::regclass
  ) THEN
    ALTER TABLE public.second_hand_items ADD CONSTRAINT second_hand_battery_health_range CHECK (
      battery_health IS NULL OR (battery_health >= 0 AND battery_health <= 100)
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'second_hand_price_override_non_negative' AND conrelid = 'public.second_hand_items'::regclass
  ) THEN
    ALTER TABLE public.second_hand_items ADD CONSTRAINT second_hand_price_override_non_negative CHECK (
      price_override IS NULL OR price_override >= 0
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'second_hand_status_values' AND conrelid = 'public.second_hand_items'::regclass
  ) THEN
    ALTER TABLE public.second_hand_items ADD CONSTRAINT second_hand_status_values CHECK (
      status IN ('available','reserved','sold','unlisted')
    );
  END IF;
END $$;

-- Enforce that second_hand_items.sku_id points to a SKU with condition = 'second_hand'
create or replace function public.enforce_second_hand_sku_condition()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.product_skus s where s.id = new.sku_id and s.condition = 'second_hand'
  ) then
    raise exception 'SKU % must have condition = second_hand to attach a second_hand_item', new.sku_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_second_hand_sku_condition on public.second_hand_items;
create trigger trg_enforce_second_hand_sku_condition
before insert or update on public.second_hand_items
for each row execute function public.enforce_second_hand_sku_condition();

-- Helpful indexes
create index if not exists idx_product_images_product on public.product_images(product_id);
create index if not exists idx_sku_prices_currency on public.sku_prices(currency);

-- End hardening 

-- Ordering helpers for models and variants
alter table if exists public.product_models add column if not exists display_order int;
alter table if exists public.product_variants add column if not exists display_order int;
create index if not exists idx_product_models_display_order on public.product_models(display_order);
create index if not exists idx_product_variants_display_order on public.product_variants(display_order);

-- Product models metadata: release year for UI ordering/labels
alter table if exists public.product_models add column if not exists release_year int;
create index if not exists idx_product_models_release_year on public.product_models(release_year);

-- Auto-provision profiles on new signup (default role: customer)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, role)
  values (new.id, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill profiles for existing auth users
insert into public.profiles(id, role)
select u.id, 'customer'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null; 

-- Profiles RLS: allow each authenticated user to read their own profile row
DROP POLICY IF EXISTS "own profile read" ON public.profiles;
create policy "own profile read" on public.profiles
for select to authenticated
using (id = auth.uid()); 

-- Short, readable codes (immutable) for products and SKUs
-- Products: PRD-000001, SKUs: SKU-000001
alter table if exists public.products add column if not exists code text unique;
create sequence if not exists public.product_code_seq start 1001;

create or replace function public.products_set_code()
returns trigger
language plpgsql
as $$
begin
  if new.code is null or length(new.code) = 0 then
    new.code := 'PRD-' || to_char(nextval('public.product_code_seq'), 'FM000000');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_products_set_code on public.products;
create trigger trg_products_set_code
before insert on public.products
for each row execute function public.products_set_code();

-- SKUs short code
alter table if exists public.product_skus add column if not exists short_code text unique;
create sequence if not exists public.sku_code_seq start 1001;

create or replace function public.product_skus_set_short_code()
returns trigger
language plpgsql
as $$
begin
  if new.short_code is null or length(new.short_code) = 0 then
    new.short_code := 'SKU-' || to_char(nextval('public.sku_code_seq'), 'FM000000');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_product_skus_set_short_code on public.product_skus;
create trigger trg_product_skus_set_short_code
before insert on public.product_skus
for each row execute function public.product_skus_set_short_code();

create index if not exists idx_products_code on public.products(code);
create index if not exists idx_skus_short_code on public.product_skus(short_code); 

-- Backfill codes for existing rows
update public.products
set code = 'PRD-' || to_char(nextval('public.product_code_seq'), 'FM000000')
where code is null;

update public.product_skus
set short_code = 'SKU-' || to_char(nextval('public.sku_code_seq'), 'FM000000')
where short_code is null; 