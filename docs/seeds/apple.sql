-- Apple catalog seed (idempotent)
-- Run after docs/supabase-schema.sql

-- Brand
insert into public.brands (name, slug)
select 'Apple', 'apple'
where not exists (select 1 from public.brands where slug = 'apple');

-- Categories (broad)
insert into public.categories (name, slug) values
  ('Phones','phones'),
  ('Tablets','tablets'),
  ('Laptops','laptops'),
  ('Desktops','desktops'),
  ('Wearables','wearables'),
  ('Audio','audio'),
  ('TV','tv'),
  ('Smart Home','smart-home'),
  ('Accessories','accessories')
on conflict (slug) do nothing;

-- Families under Apple
-- Helper: get Apple id
with apple as (
  select id from public.brands where slug = 'apple'
)
insert into public.product_families (brand_id, name, slug)
select a.id, fam.name, fam.slug
from apple a
cross join (
  values
    ('iPhone','iphone'),
    ('iPad','ipad'),
    ('MacBook Air','macbook-air'),
    ('MacBook Pro','macbook-pro'),
    ('iMac','imac'),
    ('Mac mini','mac-mini'),
    ('Mac Studio','mac-studio'),
    ('Apple Watch','apple-watch'),
    ('AirPods','airpods'),
    ('Apple TV','apple-tv'),
    ('HomePod','homepod')
) as fam(name,slug)
on conflict (brand_id, slug) do nothing;

-- ============================
-- iPhone RESET and SEED
-- Models are the generation (12..16); Variants hold Base/mini/Plus/Pro/Pro Max
-- ============================
with ipfam as (
  select pf.id from public.product_families pf
  join public.brands b on b.id = pf.brand_id
  where b.slug = 'apple' and pf.slug = 'iphone'
)
-- Cleanup existing iPhone models/variants to avoid duplicates or old shape
delete from public.product_variants pv using public.product_models pm, ipfam
where pv.model_id = pm.id and pm.family_id = ipfam.id;

with ipfam as (
  select pf.id from public.product_families pf
  join public.brands b on b.id = pf.brand_id
  where b.slug = 'apple' and pf.slug = 'iphone'
)
delete from public.product_models pm using ipfam
where pm.family_id = ipfam.id;

-- Insert iPhone models (12..16)
insert into public.product_models (family_id, name, slug)
select pf.id, m.name, m.slug
from public.product_families pf
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values
    ('iPhone','iphone','iPhone 12','iphone-12'),
    ('iPhone','iphone','iPhone 13','iphone-13'),
    ('iPhone','iphone','iPhone 14','iphone-14'),
    ('iPhone','iphone','iPhone 15','iphone-15'),
    ('iPhone','iphone','iPhone 16','iphone-16')
) as m(fam_name, fam_slug, name, slug)
where pf.slug = m.fam_slug
on conflict (family_id, slug) do nothing;

-- Insert variants for each iPhone generation with full names
-- 12: Base, mini, Pro, Pro Max
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'iphone'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values ('iPhone 12','base'), ('iPhone 12 mini','mini'), ('iPhone 12 Pro','pro'), ('iPhone 12 Pro Max','pro-max')
) as v(name, slug)
where pm.slug = 'iphone-12'
on conflict (model_id, slug) do nothing;

-- 13: Base, mini, Pro, Pro Max
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'iphone'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values ('iPhone 13','base'), ('iPhone 13 mini','mini'), ('iPhone 13 Pro','pro'), ('iPhone 13 Pro Max','pro-max')
) as v(name, slug)
where pm.slug = 'iphone-13'
on conflict (model_id, slug) do nothing;

-- 14: Base, Plus, Pro, Pro Max
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'iphone'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values ('iPhone 14','base'), ('iPhone 14 Plus','plus'), ('iPhone 14 Pro','pro'), ('iPhone 14 Pro Max','pro-max')
) as v(name, slug)
where pm.slug = 'iphone-14'
on conflict (model_id, slug) do nothing;

-- 15: Base, Plus, Pro, Pro Max
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'iphone'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values ('iPhone 15','base'), ('iPhone 15 Plus','plus'), ('iPhone 15 Pro','pro'), ('iPhone 15 Pro Max','pro-max')
) as v(name, slug)
where pm.slug = 'iphone-15'
on conflict (model_id, slug) do nothing;

-- 16: Base, Plus, Pro, Pro Max
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'iphone'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values ('iPhone 16','base'), ('iPhone 16 Plus','plus'), ('iPhone 16 Pro','pro'), ('iPhone 16 Pro Max','pro-max')
) as v(name, slug)
where pm.slug = 'iphone-16'
on conflict (model_id, slug) do nothing;

-- Variant-level option presets for iPhone (use Name|#HEX for colors)
-- 12 Base/mini colors & storages
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Black|#000000','White|#FFFFFF','Green|#34C759','Blue|#2997FF','Purple|#AC39FF','Product Red|#FF3B30'], array['64GB','128GB','256GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-12'
where pv.slug in ('base','mini')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

-- 12 Pro/Pro Max
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Graphite|#1C1C1E','Silver|#F5F5F7','Gold|#C9B037','Pacific Blue|#6CA0DC'], array['128GB','256GB','512GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-12'
where pv.slug in ('pro','pro-max')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

-- 13 Base/mini
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Midnight|#1C1C1E','Starlight|#F5F5F7','Blue|#2997FF','Pink|#FFC0CB','Green|#34C759','(PRODUCT)RED|#FF3B30'], array['128GB','256GB','512GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-13'
where pv.slug in ('base','mini')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

-- 13 Pro/Pro Max
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Graphite|#1C1C1E','Gold|#C9B037','Silver|#F5F5F7','Sierra Blue|#87CEEB','Alpine Green|#A8E6A3'], array['128GB','256GB','512GB','1TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-13'
where pv.slug in ('pro','pro-max')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

-- 14 Base/Plus
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Midnight|#1C1C1E','Starlight|#F5F5F7','Blue|#2997FF','Purple|#AC39FF','Yellow|#FFFF00','(PRODUCT)RED|#FF3B30'], array['128GB','256GB','512GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-14'
where pv.slug in ('base','plus')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

-- 14 Pro/Pro Max
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Space Black|#1C1C1E','Silver|#F5F5F7','Gold|#C9B037','Deep Purple|#4B0082'], array['128GB','256GB','512GB','1TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-14'
where pv.slug in ('pro','pro-max')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

-- 15 Base/Plus
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Black|#1C1C1E','Blue|#ADD8E6','Green|#9FE2BF','Yellow|#FFFF99','Pink|#FFB6C1'], array['128GB','256GB','512GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-15'
where pv.slug in ('base','plus')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

-- 15 Pro/Pro Max (titanium)
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Black Titanium|#3D3D3F','White Titanium|#F5F5F7','Natural Titanium|#B39D7F','Blue Titanium|#7D7E80'], array['128GB','256GB','512GB','1TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-15'
where pv.slug in ('pro','pro-max')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

-- 16 Base/Plus (approx per current lineup)
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Black|#000000','White|#FFFFFF','Pink|#FF6B9E','Teal|#00B3A6','Ultramarine|#1A4DB3'], array['128GB','256GB','512GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-16'
where pv.slug in ('base','plus')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

-- 16 Pro/Pro Max (titanium, approx)
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Black Titanium|#3D3D3F','White Titanium|#F5F5F7','Natural Titanium|#B39D7F','Desert Titanium|#A3562B'], array['128GB','256GB','512GB','1TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-16'
where pv.slug in ('pro','pro-max')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

-- ============================
-- Other Apple families (unchanged)
-- ============================

-- iPad lineup (2024/2025)
insert into public.product_models (family_id, name, slug)
select f.id, m.name, m.slug
from public.product_families f
join public.brands b on b.id = f.brand_id and b.slug = 'apple'
cross join (
  values
    ('iPad','ipad','iPad Pro 13-inch (M4)','ipad-pro-13-m4'),
    ('iPad','ipad','iPad Pro 11-inch (M4)','ipad-pro-11-m4'),
    ('iPad','ipad','iPad Air 13-inch (M2)','ipad-air-13-m2'),
    ('iPad','ipad','iPad Air 11-inch (M2)','ipad-air-11-m2'),
    ('iPad','ipad','iPad (10th generation)','ipad-10th-gen'),
    ('iPad','ipad','iPad mini (A17 Pro)','ipad-mini-a17-pro')
) as m(fam_name, fam_slug, name, slug)
where f.slug = m.fam_slug
on conflict (family_id, slug) do nothing;

-- MacBook Air / Pro
insert into public.product_models (family_id, name, slug)
select f.id, m.name, m.slug
from public.product_families f
join public.brands b on b.id = f.brand_id and b.slug = 'apple'
cross join (
  values
    -- MacBook Air models (by size)
    ('MacBook Air','macbook-air','MacBook Air 13-inch','macbook-air-13'),
    ('MacBook Air','macbook-air','MacBook Air 15-inch','macbook-air-15'),
    -- MacBook Pro models (by size)
    ('MacBook Pro','macbook-pro','MacBook Pro 13-inch','macbook-pro-13'),
    ('MacBook Pro','macbook-pro','MacBook Pro 15-inch','macbook-pro-15')
) as m(fam_name, fam_slug, name, slug)
where f.slug = m.fam_slug
on conflict (family_id, slug) do nothing;

-- Insert variants for MacBook Air 13-inch (by chip generation)
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-air'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values 
    ('MacBook Air 13-inch (M4)','m4'),
    ('MacBook Air 13-inch (M3)','m3'),
    ('MacBook Air 13-inch (M2)','m2'),
    ('MacBook Air 13-inch (M1)','m1')
) as v(name, slug)
where pm.slug = 'macbook-air-13'
on conflict (model_id, slug) do nothing;

-- Insert variants for MacBook Air 15-inch (by chip generation)
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-air'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values 
    ('MacBook Air 15-inch (M4)','m4'),
    ('MacBook Air 15-inch (M3)','m3'),
    ('MacBook Air 15-inch (M2)','m2')
) as v(name, slug)
where pm.slug = 'macbook-air-15'
on conflict (model_id, slug) do nothing;

-- Insert variants for MacBook Pro models
-- MacBook Pro 13-inch variants
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-pro'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values ('MacBook Pro 13-inch (M4)','m4'),
    ('MacBook Pro 13-inch (M3)','m3'),
    ('MacBook Pro 13-inch (M2)','m2'),
    ('MacBook Pro 13-inch (M1)','m1')
) as v(name, slug)
where pm.slug = 'macbook-pro-13'
on conflict (model_id, slug) do nothing;

-- MacBook Pro 15-inch variants
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-pro'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values 
    ('MacBook Pro 15-inch (M4)','m4'),
    ('MacBook Pro 15-inch (M3)','m3'),
    ('MacBook Pro 15-inch (M2)','m2')
) as v(name, slug)
where pm.slug = 'macbook-pro-15'
on conflict (model_id, slug) do nothing;

-- Desktops
insert into public.product_models (family_id, name, slug)
select f.id, m.name, m.slug
from public.product_families f
join public.brands b on b.id = f.brand_id and b.slug = 'apple'
cross join (
  values
    ('iMac','imac','iMac 24-inch (M3)','imac-24-m3'),
    ('Mac mini','mac-mini','Mac mini (M2/M2 Pro)','mac-mini-m2'),
    ('Mac Studio','mac-studio','Mac Studio (M2 Max/Ultra)','mac-studio-m2')
) as m(fam_name, fam_slug, name, slug)
where f.slug = m.fam_slug
on conflict (family_id, slug) do nothing;

-- Watch
insert into public.product_models (family_id, name, slug)
select f.id, m.name, m.slug
from public.product_families f
join public.brands b on b.id = f.brand_id and b.slug = 'apple'
cross join (
  values
    ('Apple Watch','apple-watch','Apple Watch Series 10','apple-watch-series-10'),
    ('Apple Watch','apple-watch','Apple Watch Ultra 3','apple-watch-ultra-3'),
    ('Apple Watch','apple-watch','Apple Watch SE (2nd gen)','apple-watch-se-2')
) as m(fam_name, fam_slug, name, slug)
where f.slug = m.fam_slug
on conflict (family_id, slug) do nothing;

-- Audio / TV / Home
insert into public.product_models (family_id, name, slug)
select f.id, m.name, m.slug
from public.product_families f
join public.brands b on b.id = f.brand_id and b.slug = 'apple'
cross join (
  values
    ('AirPods','airpods','AirPods Pro (2nd generation)','airpods-pro-2'),
    ('AirPods','airpods','AirPods (4th generation)','airpods-4'),
    ('AirPods','airpods','AirPods Max','airpods-max'),
    ('Apple TV','apple-tv','Apple TV 4K (3rd generation)','apple-tv-4k-3rd'),
    ('HomePod','homepod','HomePod (2nd generation)','homepod-2'),
    ('HomePod','homepod','HomePod mini','homepod-mini')
) as m(fam_name, fam_slug, name, slug)
where f.slug = m.fam_slug
on conflict (family_id, slug) do nothing;

-- Variants (minimal where needed)
-- For iPad: Wi‑Fi / Wi‑Fi + Cellular
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'ipad'
cross join (values ('Wi‑Fi','wifi'),('Wi‑Fi + Cellular','wifi-cellular')) as v(name, slug)
on conflict (model_id, slug) do nothing;

-- Option Presets (colors, storages). Attach to model when possible for non‑iPhone
-- iPad Pro (M4)
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Silver|#F5F5F7','Space Black|#1C1C1E'], array['256GB','512GB','1TB','2TB']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'ipad'
where pm.slug in ('ipad-pro-13-m4','ipad-pro-11-m4')
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- iPad Air (M2)
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Blue|#0077ED','Purple|#AC39FF','Starlight|#F5F1E8','Space Gray|#7D7E80'], array['128GB','256GB','512GB']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'ipad'
where pm.slug in ('ipad-air-13-m2','ipad-air-11-m2')
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- iPad 10th gen
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Silver|#F5F5F7','Blue|#2997FF','Pink|#FF3B7F','Yellow|#FFD60A'], array['64GB','256GB']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'ipad'
where pm.slug = 'ipad-10th-gen'
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- iPad mini (A17 Pro)
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Blue|#0077ED','Purple|#AC39FF','Starlight|#F5F1E8','Space Gray|#7D7E80'], array['128GB','256GB','512GB']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'ipad'
where pm.slug = 'ipad-mini-a17-pro'
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- MacBook Air (M3)
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Space Gray|#1C1C1E','Silver|#F5F5F7','Starlight|#F5E6CC','Midnight|#191970'], array['256GB','512GB','1TB','2TB']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-air'
where pm.slug in ('macbook-air-13-m3','macbook-air-15-m3')
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- MacBook Air (M2)
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Space Gray|#1C1C1E','Silver|#F5F5F7','Starlight|#F5E6CC','Midnight|#191970'], array['256GB','512GB','1TB','2TB']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-air'
where pm.slug in ('macbook-air-13-m2','macbook-air-15-m2')
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- MacBook Pro (M3 Pro/Max)
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Space Black|#1C1C1E','Silver|#F5F5F7'], array['512GB','1TB','2TB','4TB','8TB']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-pro'
where pm.slug in ('macbook-pro-14-m3','macbook-pro-16-m3')
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- iMac 24-inch (M3)
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Blue|#2997FF','Purple|#AC39FF','Green|#00C7BE','Silver|#F5F5F7','Space Gray|#1C1C1E','Pink|#FFA3A3','Yellow|#F3E5AB'], array['256GB','512GB','1TB','2TB']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'imac'
where pm.slug = 'imac-24-m3'
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- Mac mini / Mac Studio
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Silver|#C0C0C0','Space Gray|#1C1C1E'], array['256GB','512GB','1TB','2TB','4TB','8TB']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug in ('mac-mini','mac-studio')
where pm.slug in ('mac-mini-m2','mac-studio-m2')
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- Apple Watch (sizes in storages field; colors vary)
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Space Black|#1C1C1E','Silver|#F5F5F7','Gray|#7D7E80','Starlight|#F5F1E8'], array['41mm','45mm']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'apple-watch'
where pm.slug = 'apple-watch-series-10'
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Titanium|#D2B48C','Silver|#F5F5F7','Coral|\#FF7F50'], array['49mm']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'apple-watch'
where pm.slug = 'apple-watch-ultra-3'
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Space Black|#1C1C1E','Silver|#F5F5F7','Gray|#7D7E80'], array['40mm','44mm']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'apple-watch'
where pm.slug = 'apple-watch-se-2'
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- AirPods
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['White|#FFFFFF'], array[]::text[]
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'airpods'
where pm.slug in ('airpods-pro-2','airpods-4')
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Space Black|#1C1C1E','Silver|#F5F5F7','Sky Blue|#B0C4DE','Light Blue|#ADD8E6','Pink|#FFC0CB'], array[]::text[]
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'airpods'
where pm.slug = 'airpods-max'
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- Apple TV 4K
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Black|#000000'], array['64GB','128GB']
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'apple-tv'
where pm.slug = 'apple-tv-4k-3rd'
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- HomePod
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Space Black|#1C1C1E','White|#F5F5F7'], array[]::text[]
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'homepod'
where pm.slug in ('homepod-2','homepod-mini')
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages;

-- Enrich presets: fill flexible options jsonb for admin forms
-- iPhone: color + storage captured at variant level; also include carrier placeholder
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'carrier', to_jsonb(array['unlocked','carrier-locked']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'iphone'
where pop.variant_id = pv.id;

-- iPad: color + storage + connectivity choices
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'connectivity', to_jsonb(array['wifi','wifi-cellular']::text[])
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'ipad'
where pop.model_id = pm.id;

-- MacBook Air (M3): color + storage + ram + chip
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB','24GB']::text[]),
  'chip', to_jsonb(array['M3']::text[])
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-air'
where pop.model_id = pm.id and pm.slug in ('macbook-air-13-m3','macbook-air-15-m3');

-- MacBook Air (M2): color + storage + ram + chip
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB','24GB']::text[]),
  'chip', to_jsonb(array['M2']::text[])
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-air'
where pop.model_id = pm.id and pm.slug in ('macbook-air-13-m2','macbook-air-15-m2');

-- MacBook Pro (M3 Pro/Max): color + storage + ram + chip
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['18GB','36GB','48GB','64GB','96GB','128GB']::text[]),
  'chip', to_jsonb(array['M3 Pro','M3 Max']::text[])
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-pro'
where pop.model_id = pm.id and pm.slug in ('macbook-pro-14-m3','macbook-pro-16-m3');

-- iMac 24-inch (M3): color + storage + ram + chip
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB','24GB']::text[]),
  'chip', to_jsonb(array['M3']::text[])
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'imac'
where pop.model_id = pm.id and pm.slug = 'imac-24-m3';

-- Mac mini: color + storage + ram + chip options (M2 / M2 Pro)
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB','24GB','32GB']::text[]),
  'chip', to_jsonb(array['M2','M2 Pro']::text[])
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'mac-mini'
where pop.model_id = pm.id and pm.slug = 'mac-mini-m2';

-- Mac Studio: color + storage + ram + chip options (M2 Max / Ultra)
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['32GB','64GB','96GB','128GB']::text[]),
  'chip', to_jsonb(array['M2 Max','M2 Ultra']::text[])
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'mac-studio'
where pop.model_id = pm.id and pm.slug = 'mac-studio-m2';

-- Apple Watch: color + size (+ material placeholder)
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'size', to_jsonb(pop.storages),
  'case_material', to_jsonb(array['aluminum','titanium']::text[])
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'apple-watch'
where pop.model_id = pm.id;

-- AirPods: color only (storage none)
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors)
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'airpods'
where pop.model_id = pm.id;

-- Apple TV: color + storage
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages)
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'apple-tv'
where pop.model_id = pm.id;

-- HomePod: color only
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors)
)
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'homepod'
where pop.model_id = pm.id;

-- MacBook Air M4 variant options (2025)
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB','24GB','32GB']::text[]),
  'chip', to_jsonb(array['M4']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-air'
where pop.variant_id = pv.id and pv.slug = 'm4';

-- MacBook Air M3 variant options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB','24GB']::text[]),
  'chip', to_jsonb(array['M3']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-air'
where pop.variant_id = pv.id and pv.slug = 'm3';

-- MacBook Air M2 variant options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB','24GB']::text[]),
  'chip', to_jsonb(array['M2']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-air'
where pop.variant_id = pv.id and pv.slug = 'm2';

-- MacBook Air M1 variant options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB']::text[]),
  'chip', to_jsonb(array['M1']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-air'
where pop.variant_id = pv.id and pv.slug = 'm1';

-- MacBook Pro M4 variant options (2025)
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['16GB','32GB','64GB','96GB']::text[]),
  'chip', to_jsonb(array['M4 Pro','M4 Max']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-pro'
where pop.variant_id = pv.id and pv.slug = 'm4';

-- MacBook Pro M3 variant options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['16GB','32GB','64GB','96GB']::text[]),
  'chip', to_jsonb(array['M3 Pro','M3 Max']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-pro'
where pop.variant_id = pv.id and pv.slug = 'm3';

-- MacBook Pro M2 variant options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['16GB','32GB','64GB']::text[]),
  'chip', to_jsonb(array['M2 Pro','M2 Max']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-pro'
where pop.variant_id = pv.id and pv.slug = 'm2';

-- MacBook Pro M1 variant options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB']::text[]),
  'chip', to_jsonb(array['M1']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-pro'
where pop.variant_id = pv.id and pv.slug = 'm1';

