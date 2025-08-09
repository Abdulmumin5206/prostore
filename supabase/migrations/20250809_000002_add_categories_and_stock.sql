-- Categories table for dynamic brands/subcategories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) <= 100),
  created_at timestamptz not null default now()
);

-- Add stock quantity and category_id to products
alter table public.new_products
  add column if not exists stock_quantity integer not null default 0,
  add column if not exists category_id uuid references public.categories(id) on delete set null;

alter table public.secondhand_products
  add column if not exists stock_quantity integer not null default 0,
  add column if not exists category_id uuid references public.categories(id) on delete set null;

-- Helpful indexes
create index if not exists idx_new_products_category_id on public.new_products (category_id);
create index if not exists idx_secondhand_products_category_id on public.secondhand_products (category_id);

-- Optional: seed a couple of categories for quick testing (safe to ignore on rerun)
insert into public.categories (name)
values ('Apple'), ('Samsung'), ('Dell')
on conflict (name) do nothing; 