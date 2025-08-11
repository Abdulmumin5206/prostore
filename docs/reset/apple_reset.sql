-- Reset Apple catalog data (products + taxonomy + option presets)
-- Safe to run multiple times. Keeps the 'Apple' brand and all categories.
-- Intended for Supabase (Postgres).

-- 1) Resolve Apple brand and related taxonomy ids
with apple as (
  select id from public.brands where slug = 'apple'
), fam as (
  select pf.id from public.product_families pf join apple on pf.brand_id = apple.id
), mod as (
  select pm.id from public.product_models pm where pm.family_id in (select id from fam)
), var as (
  select pv.id from public.product_variants pv where pv.model_id in (select id from mod)
)
-- 2) Delete products (and cascading SKUs, prices, inventory, images, second-hand) under Apple
, del_products as (
  delete from public.products p using apple
  where p.brand_id = apple.id
  returning 1
)
-- 3) Delete option presets attached to Apple models/variants
, del_option_presets as (
  delete from public.product_option_presets pop
  using (
    select id as target_id, 'model' as kind from mod
    union all
    select id as target_id, 'variant' as kind from var
  ) t
  where (t.kind = 'model' and pop.model_id = t.target_id)
     or (t.kind = 'variant' and pop.variant_id = t.target_id)
  returning 1
)
-- 4) Delete variants, models, and families under Apple
, del_variants as (
  delete from public.product_variants pv using var v
  where pv.id = v.id
  returning 1
)
, del_models as (
  delete from public.product_models pm using mod m
  where pm.id = m.id
  returning 1
)
, del_families as (
  delete from public.product_families pf using fam f
  where pf.id = f.id
  returning 1
)
select 'ok' as status; 