-- Apple iPhone seed (reset + idempotent)
-- Run after docs/supabase-schema.sql

-- Ensure brand/family
insert into public.brands (name, slug)
select 'Apple', 'apple'
where not exists (select 1 from public.brands where slug = 'apple');

with apple as (select id from public.brands where slug = 'apple')
insert into public.product_families (brand_id, name, slug)
select a.id, 'iPhone', 'iphone' from apple a
on conflict (brand_id, slug) do nothing;

-- Reset iPhone models/variants to enforce generation-as-model strategy
with ipfam as (
  select pf.id from public.product_families pf
  join public.brands b on b.id = pf.brand_id
  where b.slug = 'apple' and pf.slug = 'iphone'
)
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

-- Variants with full names per generation
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

-- Variant-level presets (Name|#HEX)
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Black|#000000','White|#FFFFFF','Green|#34C759','Blue|#2997FF','Purple|#AC39FF','Product Red|#FF3B30'], array['64GB','128GB','256GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-12'
where pv.slug in ('base','mini')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Graphite|#1C1C1E','Silver|#F5F5F7','Gold|#C9B037','Pacific Blue|#6CA0DC'], array['128GB','256GB','512GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-12'
where pv.slug in ('pro','pro-max')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Midnight|#1C1C1E','Starlight|#F5F5F7','Blue|#2997FF','Pink|#FFC0CB','Green|#34C759','(PRODUCT)RED|#FF3B30'], array['128GB','256GB','512GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-13'
where pv.slug in ('base','mini')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Graphite|#1C1C1E','Gold|#C9B037','Silver|#F5F5F7','Sierra Blue|#87CEEB','Alpine Green|#A8E6A3'], array['128GB','256GB','512GB','1TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-13'
where pv.slug in ('pro','pro-max')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Midnight|#1C1C1E','Starlight|#F5F5F7','Blue|#2997FF','Purple|#AC39FF','Yellow|#FFFF00','(PRODUCT)RED|#FF3B30'], array['128GB','256GB','512GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-14'
where pv.slug in ('base','plus')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Space Black|#1C1C1E','Silver|#F5F5F7','Gold|#C9B037','Deep Purple|#4B0082'], array['128GB','256GB','512GB','1TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-14'
where pv.slug in ('pro','pro-max')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Black|#1C1C1E','Blue|#ADD8E6','Green|#9FE2BF','Yellow|#FFFF99','Pink|#FFB6C1'], array['128GB','256GB','512GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-15'
where pv.slug in ('base','plus')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Black Titanium|#3D3D3F','White Titanium|#F5F5F7','Natural Titanium|#B39D7F','Blue Titanium|#7D7E80'], array['128GB','256GB','512GB','1TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-15'
where pv.slug in ('pro','pro-max')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Black|#000000','White|#FFFFFF','Pink|#FF6B9E','Teal|#00B3A6','Ultramarine|#1A4DB3'], array['128GB','256GB','512GB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-16'
where pv.slug in ('base','plus')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages;

insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Black Titanium|#3D3D3F','White Titanium|#F5F5F7','Natural Titanium|#B39D7F','Desert Titanium|#A3562B'], array['128GB','256GB','512GB','1TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'iphone-16'
where pv.slug in ('pro','pro-max')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages; 