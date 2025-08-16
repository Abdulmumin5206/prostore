-- Apple MacBook Air (detailed) seed
-- Models: M1/M2/M3/M4 with per-variant screen size
-- Options JSON includes: year, chip, cpu_cores_total, cpu_perf_cores, cpu_eff_cores, gpu_cores, display_inches, ram_options
-- Idempotent; safe to run multiple times

-- 1) Ensure Apple brand and MacBook Air family
insert into public.product_families(brand_id, name, slug)
select b.id, 'MacBook Air', 'macbook-air'
from public.brands b
where b.slug = 'apple'
and not exists (
  select 1 from public.product_families f where f.brand_id = b.id and f.slug = 'macbook-air'
);

-- 2) Upsert models (newest first via display_order)
insert into public.product_models(family_id, name, slug, display_order, release_year)
select f.id, t.name, t.slug, t.display_order, t.release_year
from public.product_families f
join public.brands b on b.id = f.brand_id
cross join (values
  ('MacBook Air (M4)', 'macbook-air-m4', 130, 2025),
  ('MacBook Air (M3)', 'macbook-air-m3', 120, 2024),
  ('MacBook Air (M2)', 'macbook-air-m2', 110, 2022),
  ('MacBook Air (M1)', 'macbook-air-m1', 100, 2020)
) as t(name, slug, display_order, release_year)
where b.slug='apple' and f.slug='macbook-air'
on conflict (family_id, slug) do update set display_order = excluded.display_order, name = excluded.name, release_year = excluded.release_year;

-- 3) Insert variants with screen sizes as the primary differentiator
with fam as (
  select f.id as family_id from public.product_families f join public.brands b on b.id=f.brand_id where b.slug='apple' and f.slug='macbook-air'
), m as (
  select pm.id, pm.slug from public.product_models pm join fam on pm.family_id=fam.family_id
), v(model_slug, variant_slug, variant_name, display_order) as (
  values
  -- M1 (2020) – 13.3" only
  ('macbook-air-m1','13','MacBook Air 13" (M1)', 100),
  
  -- M2 (2022/2023) – 13.6" and 15.3"
  ('macbook-air-m2','13-6','MacBook Air 13.6" (M2)', 100),
  ('macbook-air-m2','15-3','MacBook Air 15.3" (M2)', 90),
  
  -- M3 (2024) – 13.6" and 15.3"
  ('macbook-air-m3','13-6','MacBook Air 13.6" (M3)', 100),
  ('macbook-air-m3','15-3','MacBook Air 15.3" (M3)', 90),
  
  -- M4 (2025) – 13.6" and 15.3"
  ('macbook-air-m4','13-6','MacBook Air 13.6" (M4)', 100),
  ('macbook-air-m4','15-3','MacBook Air 15.3" (M4)', 90)
)
insert into public.product_variants(model_id, name, slug, display_order)
select m.id, v.variant_name, v.variant_slug, v.display_order
from v join m on m.slug=v.model_slug
on conflict (model_id, slug) do update set name = excluded.name, display_order = excluded.display_order;

-- 4) Variant presets with exact colors/storages and options metadata
with vars as (
  select pv.id, pm.slug as model_slug, pv.slug as variant_slug
  from public.product_variants pv
  join public.product_models pm on pm.id = pv.model_id
  join public.product_families f on pm.family_id = f.id
  join public.brands b on f.brand_id = b.id
  where b.slug='apple' and f.slug='macbook-air'
), preset as (
  select * from (
    values
    -- M1 (2020): 13" – colors: Gold, Silver, Space Gray
    ('macbook-air-m1','13',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Gold|#d4af37','Silver|#c0c0c0','Space Gray|#545454']::text[],
      '{"year":2020,"chip":"M1","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":[7,8],"display_inches":13.3,"ram_options":["8GB","16GB"]}'::jsonb
    ),

    -- M2 (2022/2023): colors: Silver, Starlight, Space Gray, Midnight
    ('macbook-air-m2','13-6',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Silver|#c0c0c0','Starlight|#f4f1ea','Space Gray|#545454','Midnight|#191924']::text[],
      '{"year":2022,"chip":"M2","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":[8,10],"display_inches":13.6,"ram_options":["8GB","16GB","24GB"]}'::jsonb
    ),
    ('macbook-air-m2','15-3',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Silver|#c0c0c0','Starlight|#f4f1ea','Space Gray|#545454','Midnight|#191924']::text[],
      '{"year":2023,"chip":"M2","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":[10],"display_inches":15.3,"ram_options":["8GB","16GB","24GB"]}'::jsonb
    ),

    -- M3 (2024): colors: Silver, Starlight, Space Gray, Midnight
    ('macbook-air-m3','13-6',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Silver|#c0c0c0','Starlight|#f4f1ea','Space Gray|#545454','Midnight|#191924']::text[],
      '{"year":2024,"chip":"M3","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":[8,10],"display_inches":13.6,"ram_options":["8GB","16GB","24GB"]}'::jsonb
    ),
    ('macbook-air-m3','15-3',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Silver|#c0c0c0','Starlight|#f4f1ea','Space Gray|#545454','Midnight|#191924']::text[],
      '{"year":2024,"chip":"M3","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":[10],"display_inches":15.3,"ram_options":["8GB","16GB","24GB"]}'::jsonb
    ),

    -- M4 (2025): specific storage constraints and new colors
    ('macbook-air-m4','13-6',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Sky Blue|#9ecbff','Silver|#c0c0c0','Starlight|#f4f1ea','Midnight|#191924']::text[],
      '{"year":2025,"chip":"M4","cpu_cores_total":10,"cpu_perf_cores":4,"cpu_eff_cores":6,"gpu_cores":[8,10],"display_inches":13.6,"ram_options":["16GB","24GB","32GB"]}'::jsonb
    ),
    ('macbook-air-m4','15-3',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Sky Blue|#9ecbff','Silver|#c0c0c0','Starlight|#f4f1ea','Midnight|#191924']::text[],
      '{"year":2025,"chip":"M4","cpu_cores_total":10,"cpu_perf_cores":4,"cpu_eff_cores":6,"gpu_cores":[10],"display_inches":15.3,"ram_options":["16GB","24GB","32GB"]}'::jsonb
    )
  ) as t(model_slug, variant_slug, storages, colors, options)
)
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select null, v.id, p.colors, p.storages, p.options
from preset p
join vars v on v.model_slug = p.model_slug and v.variant_slug = p.variant_slug
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options;

-- Cleanup: remove any legacy variants under MacBook Air that are not size-based
with fam as (
  select f.id as family_id
  from public.product_families f
  join public.brands b on b.id = f.brand_id
  where b.slug = 'apple' and f.slug = 'macbook-air'
), mdl as (
  select pm.id as model_id
  from public.product_models pm
  join fam on fam.family_id = pm.family_id
), to_delete as (
  select pv.id
  from public.product_variants pv
  join mdl on mdl.model_id = pv.model_id
  where pv.slug not in ('13','13-6','15-3')
)
delete from public.product_variants pv
using to_delete d
where pv.id = d.id; 