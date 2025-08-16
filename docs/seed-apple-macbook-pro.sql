-- Apple MacBook Pro seed (families, models, variants, presets)
-- Models organized by base chip generation (M1/M2/M3/M4)
-- Variants are screen sizes (13/14/16)
-- Options include chip tiers (M4, M4 Pro, M4 Max, M4 Ultra)
-- Idempotent; safe to run multiple times

-- 1) Ensure Apple brand and MacBook Pro family
insert into public.product_families(brand_id, name, slug)
select b.id, 'MacBook Pro', 'macbook-pro'
from public.brands b
where b.slug = 'apple'
and not exists (
  select 1 from public.product_families f where f.brand_id = b.id and f.slug = 'macbook-pro'
);

-- 2) Insert/Upsert base models per chip with display order (newest first) and release year
insert into public.product_models(family_id, name, slug, display_order, release_year)
select f.id, t.name, t.slug, t.display_order, t.release_year
from public.product_families f
join public.brands b on b.id = f.brand_id
cross join (values
  ('MacBook Pro (M4)', 'macbook-pro-m4', 120, 2025),
  ('MacBook Pro (M3)', 'macbook-pro-m3', 110, 2024),
  ('MacBook Pro (M2)', 'macbook-pro-m2', 100, 2023),
  ('MacBook Pro (M1)', 'macbook-pro-m1', 90, 2021)
) as t(name, slug, display_order, release_year)
where b.slug = 'apple' and f.slug = 'macbook-pro'
on conflict (family_id, slug) do update set display_order = excluded.display_order, name = excluded.name, release_year = excluded.release_year;

-- 3) Insert variants (screen sizes) with display order
with fam as (
  select f.id as family_id from public.product_families f join public.brands b on b.id = f.brand_id where b.slug='apple' and f.slug='macbook-pro'
), m as (
  select pm.id, pm.slug from public.product_models pm join fam on pm.family_id = fam.family_id
), v(model_slug, variant_name, variant_slug, display_order) as (
  values
  -- M4 (2025)
  ('macbook-pro-m4','MacBook Pro 16" (M4)','16', 120),
  ('macbook-pro-m4','MacBook Pro 14" (M4)','14', 110),
  -- M3 (2024)
  ('macbook-pro-m3','MacBook Pro 16" (M3)','16', 100),
  ('macbook-pro-m3','MacBook Pro 14" (M3)','14', 90),
  -- M2 (2023)
  ('macbook-pro-m2','MacBook Pro 16" (M2)','16', 80),
  ('macbook-pro-m2','MacBook Pro 14" (M2)','14', 70),
  -- M1 (2021/2020)
  ('macbook-pro-m1','MacBook Pro 16" (M1)','16', 60),
  ('macbook-pro-m1','MacBook Pro 14" (M1)','14', 50),
  ('macbook-pro-m1','MacBook Pro 13" (M1)','13', 40)
)
insert into public.product_variants(model_id, name, slug, display_order)
select m.id, v.variant_name, v.variant_slug, v.display_order
from v join m on m.slug = v.model_slug
on conflict (model_id, slug) do update set name = excluded.name, display_order = excluded.display_order;

-- 4) Variant option presets (storages, colors, options)
with vars as (
  select pv.id, pm.slug as model_slug, pv.slug as variant_slug
  from public.product_variants pv
  join public.product_models pm on pm.id = pv.model_id
  join public.product_families f on pm.family_id = f.id
  join public.brands b on f.brand_id = b.id
  where b.slug='apple' and f.slug='macbook-pro'
), preset as (
  select * from (
    values
    -- M4 Pro/Max (2025): Space Black, Silver; 14/16
    ('macbook-pro-m4','16', 
      array['512GB','1TB','2TB','4TB','8TB']::text[], 
      array['Space Black|#1c1c1e','Silver|#c0c0c0']::text[], 
      '{"year":2025,"chip_tiers":["M4 Pro","M4 Max"],"display_inches":16.2,"ram_options":["16GB","24GB","32GB","64GB","96GB"],"cpu_cores":[12,14,16],"gpu_cores":[20,30,40]}'::jsonb
    ),
    ('macbook-pro-m4','14', 
      array['512GB','1TB','2TB','4TB','8TB']::text[], 
      array['Space Black|#1c1c1e','Silver|#c0c0c0']::text[], 
      '{"year":2025,"chip_tiers":["M4","M4 Pro","M4 Max"],"display_inches":14.2,"ram_options":["16GB","24GB","32GB","64GB","96GB"],"cpu_cores":[10,12,14,16],"gpu_cores":[10,18,24,30,40]}'::jsonb
    ),
    
    -- M3 Pro/Max (2024): Space Black, Silver
    ('macbook-pro-m3','16', 
      array['512GB','1TB','2TB','4TB','8TB']::text[], 
      array['Space Black|#1c1c1e','Silver|#c0c0c0']::text[], 
      '{"year":2024,"chip_tiers":["M3 Pro","M3 Max"],"display_inches":16.2,"ram_options":["18GB","24GB","36GB","48GB","96GB"],"cpu_cores":[12,14,16],"gpu_cores":[18,20,30,40]}'::jsonb
    ),
    ('macbook-pro-m3','14', 
      array['512GB','1TB','2TB','4TB','8TB']::text[], 
      array['Space Black|#1c1c1e','Silver|#c0c0c0']::text[], 
      '{"year":2024,"chip_tiers":["M3","M3 Pro","M3 Max"],"display_inches":14.2,"ram_options":["8GB","16GB","18GB","24GB","36GB","48GB","96GB"],"cpu_cores":[8,11,12,14,16],"gpu_cores":[10,14,18,20,30,40]}'::jsonb
    ),
    
    -- M2 Pro/Max (2023): Space Gray, Silver
    ('macbook-pro-m2','16', 
      array['512GB','1TB','2TB','4TB','8TB']::text[], 
      array['Space Gray|#545454','Silver|#c0c0c0']::text[], 
      '{"year":2023,"chip_tiers":["M2 Pro","M2 Max"],"display_inches":16.2,"ram_options":["16GB","32GB","64GB","96GB"],"cpu_cores":[12,14],"gpu_cores":[19,30,38]}'::jsonb
    ),
    ('macbook-pro-m2','14', 
      array['512GB','1TB','2TB','4TB','8TB']::text[], 
      array['Space Gray|#545454','Silver|#c0c0c0']::text[], 
      '{"year":2023,"chip_tiers":["M2 Pro","M2 Max"],"display_inches":14.2,"ram_options":["16GB","32GB","64GB","96GB"],"cpu_cores":[10,12,14],"gpu_cores":[16,19,30,38]}'::jsonb
    ),
    
    -- M1 Pro/Max (2021) and M1 13-inch (2020)
    ('macbook-pro-m1','16', 
      array['512GB','1TB','2TB','4TB','8TB']::text[], 
      array['Space Gray|#545454','Silver|#c0c0c0']::text[], 
      '{"year":2021,"chip_tiers":["M1 Pro","M1 Max"],"display_inches":16.2,"ram_options":["16GB","32GB","64GB"],"cpu_cores":[10],"gpu_cores":[16,24,32]}'::jsonb
    ),
    ('macbook-pro-m1','14', 
      array['512GB','1TB','2TB','4TB','8TB']::text[], 
      array['Space Gray|#545454','Silver|#c0c0c0']::text[], 
      '{"year":2021,"chip_tiers":["M1 Pro","M1 Max"],"display_inches":14.2,"ram_options":["16GB","32GB","64GB"],"cpu_cores":[8,10],"gpu_cores":[14,16,24,32]}'::jsonb
    ),
    ('macbook-pro-m1','13', 
      array['256GB','512GB','1TB','2TB']::text[], 
      array['Space Gray|#545454','Silver|#c0c0c0']::text[], 
      '{"year":2020,"chip_tiers":["M1"],"display_inches":13.3,"ram_options":["8GB","16GB"],"cpu_cores":[8],"gpu_cores":[8]}'::jsonb
    )
  ) as t(model_slug, variant_slug, storages, colors, options)
)
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select null, v.id, p.colors, p.storages, p.options
from preset p join vars v on v.model_slug = p.model_slug and v.variant_slug = p.variant_slug
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options;

-- Cleanup: remove any legacy variants under MacBook Pro that are not size-based
with fam as (
  select f.id as family_id
  from public.product_families f
  join public.brands b on b.id = f.brand_id
  where b.slug = 'apple' and f.slug = 'macbook-pro'
), mdl as (
  select pm.id as model_id
  from public.product_models pm
  join fam on fam.family_id = pm.family_id
), to_delete as (
  select pv.id
  from public.product_variants pv
  join mdl on mdl.model_id = pv.model_id
  where pv.slug not in ('13','14','16')
)
delete from public.product_variants pv
using to_delete d
where pv.id = d.id; 