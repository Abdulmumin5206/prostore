-- Seed Apple iPhone taxonomy and presets (idempotent)
with apple as (
  select id as brand_id from public.brands where slug = 'apple'
), fam as (
  insert into public.product_families(brand_id, name, slug)
  select apple.brand_id, 'iPhone', 'iphone' from apple
  where not exists (
    select 1 from public.product_families f where f.slug = 'iphone' and f.brand_id = (select brand_id from apple)
  )
  returning id
), fam_id as (
  select id as family_id from public.product_families where slug = 'iphone' and brand_id = (select brand_id from apple)
), models as (
  insert into public.product_models(family_id, name, slug)
  select fam_id.family_id, m.name, m.slug
  from fam_id, (values
    ('iPhone 15', 'iphone-15'),
    ('iPhone 15 Pro', 'iphone-15-pro'),
    ('iPhone 16', 'iphone-16'),
    ('iPhone 16 Pro', 'iphone-16-pro')
  ) as m(name, slug)
  where not exists (
    select 1 from public.product_models pm where pm.family_id = fam_id.family_id and pm.slug = m.slug
  )
  returning id, name, slug
)
-- Example: set option presets for iPhone 16 Pro
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select pm.id as model_id, null as variant_id,
  array['Natural Titanium|#878787','Black Titanium|#1c1c1e','White Titanium|#f5f5f7','Blue Titanium|#335fa3']::text[] as colors,
  array['128GB','256GB','512GB','1TB']::text[] as storages,
  '{"connectivity":["5G","WiFi 6E"],"chip":"A18 Pro"}'::jsonb as options
from public.product_models pm
join fam_id on pm.family_id = fam_id.family_id
where pm.slug = 'iphone-16-pro'
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options;

-- Seed a sample product and SKU for storefront testing (skips if exists)
with brand as (select id from public.brands where slug = 'apple'),
     cat as (select id from public.categories where slug = 'phones'),
     prod as (
       insert into public.products(brand_id, category_id, family, model, variant, title, description, published)
       select (select id from brand), (select id from cat), 'iPhone', 'iPhone 16 Pro', null,
              'Apple iPhone 16 Pro', 'Latest iPhone 16 Pro', true
       where not exists (
         select 1 from public.products p where p.title = 'Apple iPhone 16 Pro'
       )
       returning id
     ),
     sku as (
       insert into public.product_skus(product_id, condition, attributes, is_active)
       select (select id from prod), 'new', '{"storage":"256GB","color":"#335fa3","color_name":"Blue Titanium"}'::jsonb, true
       where exists (select 1 from prod)
       returning id
     )
insert into public.sku_prices(sku_id, currency, base_price, discount_percent, discount_amount)
select (select id from sku), 'USD', 1199.00, null, null
where exists (select 1 from sku);

insert into public.sku_inventory(sku_id, quantity)
select (select id from sku), 25
where exists (select 1 from sku);

-- Optional: add a sample image url placeholder
insert into public.product_images(product_id, url, is_primary, sort_order)
select p.id, 'https://images.apple.com/v/iphone/home/ab/images/overview/compare/compare_iphone_16pro__fvt1vpeo4162_large.jpg', true, 0
from public.products p
where p.title = 'Apple iPhone 16 Pro'
and not exists (select 1 from public.product_images pi where pi.product_id = p.id); 