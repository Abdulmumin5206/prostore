-- Apple MacBook Air (detailed) seed
-- Models: M1/M2/M3/M4 with per-variant screen size and GPU core count
-- Options JSON includes: year, chip, cpu_cores_total, cpu_perf_cores, cpu_eff_cores, gpu_cores, display_inches
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

-- 3) Insert variants with full names + GPU core count and display order (larger/newer first)
with fam as (
  select f.id as family_id from public.product_families f join public.brands b on b.id=f.brand_id where b.slug='apple' and f.slug='macbook-air'
), m as (
  select pm.id, pm.slug from public.product_models pm join fam on pm.family_id=fam.family_id
), v(model_slug, variant_slug, variant_name, display_order) as (
  values
  -- M1 (2020) – 13.3" (list as 13)
  ('macbook-air-m1','13-7gpu','MacBook Air 13" (M1) • 7‑core GPU', 100),
  ('macbook-air-m1','13-8gpu','MacBook Air 13" (M1) • 8‑core GPU', 90),
  -- M2 (2022/2023) – 13.6" and 15.3"
  ('macbook-air-m2','13-8gpu','MacBook Air 13.6" (M2) • 8‑core GPU', 100),
  ('macbook-air-m2','13-10gpu','MacBook Air 13.6" (M2) • 10‑core GPU', 95),
  ('macbook-air-m2','15-10gpu','MacBook Air 15.3" (M2) • 10‑core GPU', 90),
  -- M3 (2024) – 13.6" and 15.3"
  ('macbook-air-m3','13-8gpu','MacBook Air 13.6" (M3) • 8‑core GPU', 100),
  ('macbook-air-m3','13-10gpu','MacBook Air 13.6" (M3) • 10‑core GPU', 95),
  ('macbook-air-m3','15-10gpu','MacBook Air 15.3" (M3) • 10‑core GPU', 90),
  -- M4 (2025) – 13.6" and 15.3" (placeholder based on request)
  ('macbook-air-m4','13-8gpu','MacBook Air 13.6" (M4) • 8‑core GPU', 100),
  ('macbook-air-m4','13-10gpu','MacBook Air 13.6" (M4) • 10‑core GPU', 95),
  ('macbook-air-m4','15-10gpu','MacBook Air 15.3" (M4) • 10‑core GPU', 90)
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
    ('macbook-air-m1','13-7gpu',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Gold|#d4af37','Silver|#c0c0c0','Space Gray|#545454']::text[],
      '{"year":2020,"chip":"M1","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":7,"display_inches":13.3}'::jsonb
    ),
    ('macbook-air-m1','13-8gpu',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Gold|#d4af37','Silver|#c0c0c0','Space Gray|#545454']::text[],
      '{"year":2020,"chip":"M1","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":8,"display_inches":13.3}'::jsonb
    ),

    -- M2 (2022/2023): colors: Silver, Starlight, Space Gray, Midnight
    ('macbook-air-m2','13-8gpu',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Silver|#c0c0c0','Starlight|#f4f1ea','Space Gray|#545454','Midnight|#191924']::text[],
      '{"year":2022,"chip":"M2","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":8,"display_inches":13.6}'::jsonb
    ),
    ('macbook-air-m2','13-10gpu',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Silver|#c0c0c0','Starlight|#f4f1ea','Space Gray|#545454','Midnight|#191924']::text[],
      '{"year":2022,"chip":"M2","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":10,"display_inches":13.6}'::jsonb
    ),
    ('macbook-air-m2','15-10gpu',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Silver|#c0c0c0','Starlight|#f4f1ea','Space Gray|#545454','Midnight|#191924']::text[],
      '{"year":2023,"chip":"M2","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":10,"display_inches":15.3}'::jsonb
    ),

    -- M3 (2024): colors: Silver, Starlight, Space Gray, Midnight
    ('macbook-air-m3','13-8gpu',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Silver|#c0c0c0','Starlight|#f4f1ea','Space Gray|#545454','Midnight|#191924']::text[],
      '{"year":2024,"chip":"M3","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":8,"display_inches":13.6}'::jsonb
    ),
    ('macbook-air-m3','13-10gpu',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Silver|#c0c0c0','Starlight|#f4f1ea','Space Gray|#545454','Midnight|#191924']::text[],
      '{"year":2024,"chip":"M3","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":10,"display_inches":13.6}'::jsonb
    ),
    ('macbook-air-m3','15-10gpu',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Silver|#c0c0c0','Starlight|#f4f1ea','Space Gray|#545454','Midnight|#191924']::text[],
      '{"year":2024,"chip":"M3","cpu_cores_total":8,"cpu_perf_cores":4,"cpu_eff_cores":4,"gpu_cores":10,"display_inches":15.3}'::jsonb
    ),

    -- M4 (2025): specific storage constraints
    -- 13.6" 8‑GPU: 16GB + 256GB only
    ('macbook-air-m4','13-8gpu',
      array['256GB']::text[],
      array['Sky Blue|#9ecbff','Silver|#c0c0c0','Starlight|#f4f1ea','Midnight|#191924']::text[],
      '{"year":2025,"chip":"M4","cpu_cores_total":10,"cpu_perf_cores":4,"cpu_eff_cores":6,"gpu_cores":8,"display_inches":13.6,"ram":"16GB only"}'::jsonb
    ),
    -- 13.6" 10‑GPU: 16/24GB RAM with 256GB→2TB
    ('macbook-air-m4','13-10gpu',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Sky Blue|#9ecbff','Silver|#c0c0c0','Starlight|#f4f1ea','Midnight|#191924']::text[],
      '{"year":2025,"chip":"M4","cpu_cores_total":10,"cpu_perf_cores":4,"cpu_eff_cores":6,"gpu_cores":10,"display_inches":13.6,"ram":"16GB/24GB"}'::jsonb
    ),
    -- 15.3" 10‑GPU: 16/24GB RAM with 256GB→2TB
    ('macbook-air-m4','15-10gpu',
      array['256GB','512GB','1TB','2TB']::text[],
      array['Sky Blue|#9ecbff','Silver|#c0c0c0','Starlight|#f4f1ea','Midnight|#191924']::text[],
      '{"year":2025,"chip":"M4","cpu_cores_total":10,"cpu_perf_cores":4,"cpu_eff_cores":6,"gpu_cores":10,"display_inches":15.3,"ram":"16GB/24GB"}'::jsonb
    )
  ) as t(model_slug, variant_slug, storages, colors, options)
)
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select null, v.id, p.colors, p.storages, p.options
from preset p
join vars v on v.model_slug = p.model_slug and v.variant_slug = p.variant_slug
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options; 