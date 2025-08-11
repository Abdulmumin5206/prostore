-- CSV-friendly admin views (read-only)
-- Create views that flatten products/SKUs/options into simple columns.

create or replace view admin_csv_products as
select
  p.id as product_id,
  p.public_id as product_code,
  p.title,
  p.family,
  p.model,
  p.variant,
  b.name as brand,
  c.name as category,
  p.published,
  p.created_at
from public.products p
join public.brands b on b.id = p.brand_id
join public.categories c on c.id = p.category_id;

create or replace view admin_csv_skus as
select
  s.id as sku_id,
  s.sku_code,
  s.product_id,
  (case when s.condition is null then 'new' else (s.condition)::text end) as condition,
  s.attributes->>'color' as color,
  s.attributes->>'storage' as storage,
  s.attributes->>'connectivity' as connectivity,
  pr.currency,
  pr.base_price,
  pr.discount_percent,
  pr.discount_amount,
  inv.quantity
from public.product_skus s
left join public.sku_prices pr on pr.sku_id = s.id
left join public.sku_inventory inv on inv.sku_id = s.id;

-- Option presets flattened for clarity
create or replace view admin_csv_option_presets as
select
  coalesce(pm.name, pv.name) as target_name,
  case when pop.model_id is not null then 'model' else 'variant' end as target_type,
  coalesce(pop.model_id::text, pop.variant_id::text) as target_id,
  array_to_string(pop.colors, ';') as colors,
  array_to_string(pop.storages, ';') as storages,
  pop.options
from public.product_option_presets pop
left join public.product_models pm on pm.id = pop.model_id
left join public.product_variants pv on pv.id = pop.variant_id; 