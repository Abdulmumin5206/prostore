-- Apple iPad seed (families, models, variants, presets)
-- Idempotent; safe to run multiple times

-- Families
insert into public.product_families(brand_id, name, slug)
select b.id, x.name, x.slug
from public.brands b
cross join (values
  ('iPad Pro','ipad-pro'),
  ('iPad Air','ipad-air'),
  ('iPad','ipad'),
  ('iPad mini','ipad-mini')
) as x(name, slug)
where b.slug='apple'
and not exists (
  select 1 from public.product_families f where f.brand_id=b.id and f.slug=x.slug
);

-- iPad Pro (M4, 2024) --------------------------------------------------------
insert into public.product_models(family_id, name, slug, display_order, release_year)
select f.id, 'iPad Pro (M4)', 'ipad-pro-m4', 140, 2024
from public.product_families f
join public.brands b on b.id=f.brand_id
where b.slug='apple' and f.slug='ipad-pro'
on conflict (family_id, slug) do update set name=excluded.name, display_order=excluded.display_order, release_year=excluded.release_year;

with fam as (
  select f.id as family_id from public.product_families f join public.brands b on b.id=f.brand_id where b.slug='apple' and f.slug='ipad-pro'
), model as (
  select id from public.product_models where family_id=(select family_id from fam) and slug='ipad-pro-m4'
), v(name, slug, sort) as (
  values
  ('iPad Pro 13" (M4)','13', 140),
  ('iPad Pro 11" (M4)','11', 130)
)
insert into public.product_variants(model_id, name, slug, display_order)
select (select id from model), v.name, v.slug, v.sort from v
on conflict (model_id, slug) do update set name=excluded.name, display_order=excluded.display_order;

with vars as (
  select pv.id, pv.slug from public.product_variants pv
  join public.product_models pm on pm.id=pv.model_id
  where pm.slug='ipad-pro-m4'
), preset as (
  select * from (
    values
    ('13', array['256GB','512GB','1TB','2TB']::text[], array['Space Black|#1c1c1e','Silver|#c0c0c0']::text[], '{"year":2024,"chip":"M4","display_inches":13}'::jsonb),
    ('11', array['256GB','512GB','1TB','2TB']::text[], array['Space Black|#1c1c1e','Silver|#c0c0c0']::text[], '{"year":2024,"chip":"M4","display_inches":11}'::jsonb)
  ) as t(slug, storages, colors, options)
)
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select null, v.id, p.colors, p.storages, p.options
from preset p join vars v on v.slug=p.slug
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages, options=excluded.options;

-- iPad Air (M2, 2024) --------------------------------------------------------
insert into public.product_models(family_id, name, slug, display_order, release_year)
select f.id, 'iPad Air (M2)', 'ipad-air-m2', 130, 2024
from public.product_families f
join public.brands b on b.id=f.brand_id
where b.slug='apple' and f.slug='ipad-air'
on conflict (family_id, slug) do update set name=excluded.name, display_order=excluded.display_order, release_year=excluded.release_year;

with fam as (
  select f.id as family_id from public.product_families f join public.brands b on b.id=f.brand_id where b.slug='apple' and f.slug='ipad-air'
), model as (
  select id from public.product_models where family_id=(select family_id from fam) and slug='ipad-air-m2'
), v(name, slug, sort) as (
  values
  ('iPad Air 13" (M2)','13', 130),
  ('iPad Air 11" (M2)','11', 120)
)
insert into public.product_variants(model_id, name, slug, display_order)
select (select id from model), v.name, v.slug, v.sort from v
on conflict (model_id, slug) do update set name=excluded.name, display_order=excluded.display_order;

with vars as (
  select pv.id, pv.slug from public.product_variants pv
  join public.product_models pm on pm.id=pv.model_id
  where pm.slug='ipad-air-m2'
), preset as (
  select * from (
    values
    ('13', array['128GB','256GB','512GB','1TB']::text[], array['Blue|#6bb6ff','Purple|#a78bfa','Starlight|#f4f1ea','Space Gray|#545454']::text[], '{"year":2024,"chip":"M2","display_inches":13}'::jsonb),
    ('11', array['128GB','256GB','512GB','1TB']::text[], array['Blue|#6bb6ff','Purple|#a78bfa','Starlight|#f4f1ea','Space Gray|#545454']::text[], '{"year":2024,"chip":"M2","display_inches":11}'::jsonb)
  ) as t(slug, storages, colors, options)
)
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select null, v.id, p.colors, p.storages, p.options
from preset p join vars v on v.slug=p.slug
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages, options=excluded.options;

-- iPad (10th gen, 2022) ------------------------------------------------------
insert into public.product_models(family_id, name, slug, display_order, release_year)
select f.id, 'iPad 10th gen', 'ipad-10th-gen', 90, 2022
from public.product_families f
join public.brands b on b.id=f.brand_id
where b.slug='apple' and f.slug='ipad'
on conflict (family_id, slug) do update set name=excluded.name, display_order=excluded.display_order, release_year=excluded.release_year;

with fam as (
  select f.id as family_id from public.product_families f join public.brands b on b.id=f.brand_id where b.slug='apple' and f.slug='ipad'
), model as (
  select id from public.product_models where family_id=(select family_id from fam) and slug='ipad-10th-gen'
)
insert into public.product_variants(model_id, name, slug, display_order)
select (select id from model), 'iPad 10.9" (10th gen)','10-9', 90
on conflict (model_id, slug) do update set name=excluded.name, display_order=excluded.display_order;

with vars as (
  select pv.id from public.product_variants pv
  join public.product_models pm on pm.id=pv.model_id
  where pm.slug='ipad-10th-gen' and pv.slug='10-9'
)
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select null, (select id from vars),
  array['Silver|#c0c0c0','Pink|#ffb6c1','Blue|#6bb6ff','Yellow|#fff176']::text[],
  array['64GB','256GB']::text[],
  '{"year":2022,"chip":"A14","display_inches":10.9}'::jsonb
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages, options=excluded.options;

-- iPad mini (6th gen, 2021) --------------------------------------------------
insert into public.product_models(family_id, name, slug, display_order, release_year)
select f.id, 'iPad mini (6th gen)', 'ipad-mini-6', 80, 2021
from public.product_families f
join public.brands b on b.id=f.brand_id
where b.slug='apple' and f.slug='ipad-mini'
on conflict (family_id, slug) do update set name=excluded.name, display_order=excluded.display_order, release_year=excluded.release_year;

with fam as (
  select f.id as family_id from public.product_families f join public.brands b on b.id=f.brand_id where b.slug='apple' and f.slug='ipad-mini'
), model as (
  select id from public.product_models where family_id=(select family_id from fam) and slug='ipad-mini-6'
)
insert into public.product_variants(model_id, name, slug, display_order)
select (select id from model), 'iPad mini 8.3" (6th gen)','8-3', 80
on conflict (model_id, slug) do update set name=excluded.name, display_order=excluded.display_order;

with vars as (
  select pv.id from public.product_variants pv
  join public.product_models pm on pm.id=pv.model_id
  where pm.slug='ipad-mini-6' and pv.slug='8-3'
)
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select null, (select id from vars),
  array['Space Gray|#545454','Pink|#ffb6c1','Purple|#a78bfa','Starlight|#f4f1ea']::text[],
  array['64GB','256GB']::text[],
  '{"year":2021,"chip":"A15","display_inches":8.3}'::jsonb
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages, options=excluded.options; 

-- iPad (11th gen, 2025 A16) --------------------------------------------------
insert into public.product_models(family_id, name, slug, display_order, release_year)
select f.id, 'iPad 11th gen', 'ipad-11th-gen', 100, 2025
from public.product_families f
join public.brands b on b.id=f.brand_id
where b.slug='apple' and f.slug='ipad'
on conflict (family_id, slug) do update set name=excluded.name, display_order=excluded.display_order, release_year=excluded.release_year;

with fam as (
  select f.id as family_id from public.product_families f join public.brands b on b.id=f.brand_id where b.slug='apple' and f.slug='ipad'
), model as (
  select id from public.product_models where family_id=(select family_id from fam) and slug='ipad-11th-gen'
)
insert into public.product_variants(model_id, name, slug, display_order)
select (select id from model), 'iPad 10.9" (11th gen)','10-9-11', 100
on conflict (model_id, slug) do update set name=excluded.name, display_order=excluded.display_order;

with vars as (
  select pv.id from public.product_variants pv
  join public.product_models pm on pm.id=pv.model_id
  where pm.slug='ipad-11th-gen' and pv.slug='10-9-11'
)
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select null, (select id from vars),
  array['Starlight|#f4f1ea','Space Gray|#545454','Blue|#6bb6ff','Pink|#ffb6c1']::text[],
  array['128GB','256GB','512GB']::text[],
  '{"year":2025,"chip":"A16","display_inches":10.9}'::jsonb
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages, options=excluded.options; 