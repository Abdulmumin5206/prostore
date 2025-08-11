-- Apple iPad seed (reset + idempotent)
-- Run after docs/supabase-schema.sql

-- Ensure brand/family
insert into public.brands (name, slug)
select 'Apple', 'apple'
where not exists (select 1 from public.brands where slug = 'apple');

with apple as (select id from public.brands where slug = 'apple')
insert into public.product_families (brand_id, name, slug)
select a.id, 'iPad', 'ipad' from apple a
on conflict (brand_id, slug) do nothing;

-- Reset iPad models/variants to keep a clean, idempotent state
with ipfam as (
  select pf.id from public.product_families pf
  join public.brands b on b.id = pf.brand_id
  where b.slug = 'apple' and pf.slug = 'ipad'
)
delete from public.product_variants pv using public.product_models pm, ipfam
where pv.model_id = pm.id and pm.family_id = ipfam.id;

with ipfam as (
  select pf.id from public.product_families pf
  join public.brands b on b.id = pf.brand_id
  where b.slug = 'apple' and pf.slug = 'ipad'
)
delete from public.product_models pm using ipfam
where pm.family_id = ipfam.id;

-- Insert iPad models
insert into public.product_models (family_id, name, slug)
select pf.id, m.name, m.slug
from public.product_families pf
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values
    ('iPad','ipad','iPad Pro','ipad-pro'),
    ('iPad','ipad','iPad Air','ipad-air'),
    ('iPad','ipad','iPad','ipad'),
    ('iPad','ipad','iPad mini','ipad-mini')
) as m(fam_name, fam_slug, name, slug)
where pf.slug = m.fam_slug
on conflict (family_id, slug) do nothing;

-- Variants per model
-- iPad Pro sizes
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'ipad'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values ('11‑inch','11-inch'), ('13‑inch','13-inch')
) as v(name, slug)
where pm.slug = 'ipad-pro'
on conflict (model_id, slug) do nothing;

-- iPad Air sizes
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'ipad'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values ('11‑inch','11-inch'), ('13‑inch','13-inch')
) as v(name, slug)
where pm.slug = 'ipad-air'
on conflict (model_id, slug) do nothing;

-- iPad (base)
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'ipad'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values ('10.9‑inch','10-9-inch')
) as v(name, slug)
where pm.slug = 'ipad'
on conflict (model_id, slug) do nothing;

-- iPad mini
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'ipad'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values ('8.3‑inch','8-3-inch')
) as v(name, slug)
where pm.slug = 'ipad-mini'
on conflict (model_id, slug) do nothing;

-- Option presets (colors | storages) per variant
-- iPad Pro: Silver, Space Black; 256GB..2TB
-- Pro 11-inch
insert into public.product_option_presets (variant_id, colors, storages, options)
select pv.id,
       array['Silver|#F5F5F7','Space Black|#1C1C1E'],
       array['256GB','512GB','1TB','2TB'],
       jsonb_build_object('chip','M4','display_size_in','11')
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'ipad-pro'
where pv.slug = '11-inch'
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options;

-- Pro 13-inch
insert into public.product_option_presets (variant_id, colors, storages, options)
select pv.id,
       array['Silver|#F5F5F7','Space Black|#1C1C1E'],
       array['256GB','512GB','1TB','2TB'],
       jsonb_build_object('chip','M4','display_size_in','13')
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'ipad-pro'
where pv.slug = '13-inch'
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options;

-- iPad Air: Blue, Purple, Starlight, Midnight; 128GB..512GB
-- Air 11-inch
insert into public.product_option_presets (variant_id, colors, storages, options)
select pv.id,
       array['Blue|#2997FF','Purple|#AC39FF','Starlight|#F5F5F7','Midnight|#1C1C1E'],
       array['128GB','256GB','512GB'],
       jsonb_build_object('chip','M2','display_size_in','11')
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'ipad-air'
where pv.slug = '11-inch'
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options;

-- Air 13-inch
insert into public.product_option_presets (variant_id, colors, storages, options)
select pv.id,
       array['Blue|#2997FF','Purple|#AC39FF','Starlight|#F5F5F7','Midnight|#1C1C1E'],
       array['128GB','256GB','512GB'],
       jsonb_build_object('chip','M2','display_size_in','13')
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'ipad-air'
where pv.slug = '13-inch'
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options;

-- iPad (base): Blue, Pink, Yellow, Silver; 64GB/256GB
insert into public.product_option_presets (variant_id, colors, storages, options)
select pv.id,
       array['Blue|#2997FF','Pink|#FFC0CB','Yellow|#FFFF00','Silver|#F5F5F7'],
       array['64GB','256GB'],
       jsonb_build_object('chip','A16 Bionic','display_size_in','10.9')
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'ipad'
where pv.slug in ('10-9-inch')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options;

-- iPad mini: Starlight, Purple, Pink, Space Gray; 128GB/256GB
insert into public.product_option_presets (variant_id, colors, storages, options)
select pv.id,
       array['Starlight|#F5F5F7','Purple|#AC39FF','Pink|#FFC0CB','Space Gray|#7D7E80'],
       array['128GB','256GB'],
       jsonb_build_object('chip','A15 Bionic','display_size_in','8.3')
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'ipad-mini'
where pv.slug in ('8-3-inch')
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options; 