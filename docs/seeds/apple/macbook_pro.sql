-- Apple MacBook Pro seed (idempotent)
-- Run after docs/supabase-schema.sql

insert into public.brands (name, slug)
select 'Apple','apple'
where not exists (select 1 from public.brands where slug='apple');

with apple as (select id from public.brands where slug='apple')
insert into public.product_families (brand_id, name, slug)
select a.id, 'MacBook Pro', 'macbook-pro' from apple a
on conflict (brand_id, slug) do nothing;

-- Insert MacBook Pro models (by size)
insert into public.product_models (family_id, name, slug)
select f.id, m.name, m.slug
from public.product_families f
join public.brands b on b.id=f.brand_id and b.slug='apple'
cross join (
  values
    ('MacBook Pro','macbook-pro','MacBook Pro 13-inch','macbook-pro-13'),
    ('MacBook Pro','macbook-pro','MacBook Pro 15-inch','macbook-pro-15')
) as m(fam_name,fam_slug,name,slug)
where f.slug=m.fam_slug
on conflict (family_id, slug) do nothing;

-- Insert variants for MacBook Pro 13-inch (by chip generation)
insert into public.product_variants (model_id, name, slug)
select pm.id, v.name, v.slug
from public.product_models pm
join public.product_families pf on pf.id = pm.family_id and pf.slug = 'macbook-pro'
join public.brands b on b.id = pf.brand_id and b.slug = 'apple'
cross join (
  values 
    ('MacBook Pro 13-inch (M4)','m4'),
    ('MacBook Pro 13-inch (M3)','m3'),
    ('MacBook Pro 13-inch (M2)','m2'),
    ('MacBook Pro 13-inch (M1)','m1')
) as v(name, slug)
where pm.slug = 'macbook-pro-13'
on conflict (model_id, slug) do nothing;

-- Insert variants for MacBook Pro 15-inch (by chip generation)
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

-- MacBook Pro 13-inch M4 options
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Space Gray|#1C1C1E','Silver|#F5F5F7'], array['256GB','512GB','1TB','2TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-13'
where pv.slug = 'm4'
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages;

-- MacBook Pro 13-inch M3 options
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Space Gray|#1C1C1E','Silver|#F5F5F7'], array['256GB','512GB','1TB','2TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-13'
where pv.slug = 'm3'
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages;

-- MacBook Pro 13-inch M2 options
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Space Gray|#1C1C1E','Silver|#F5F5F7'], array['256GB','512GB','1TB','2TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-13'
where pv.slug = 'm2'
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages;

-- MacBook Pro 13-inch M1 options
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Space Gray|#1C1C1E','Silver|#F5F5F7'], array['256GB','512GB','1TB','2TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-13'
where pv.slug = 'm1'
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages;

-- MacBook Pro 15-inch M4 options
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Space Black|#1C1C1E','Silver|#F5F5F7'], array['512GB','1TB','2TB','4TB','8TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-15'
where pv.slug = 'm4'
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages;

-- MacBook Pro 15-inch M3 options
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Space Black|#1C1C1E','Silver|#F5F5F7'], array['512GB','1TB','2TB','4TB','8TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-15'
where pv.slug = 'm3'
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages;

-- MacBook Pro 15-inch M2 options
insert into public.product_option_presets (variant_id, colors, storages)
select pv.id, array['Space Gray|#1C1C1E','Silver|#F5F5F7'], array['512GB','1TB','2TB','4TB','8TB']
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-15'
where pv.slug = 'm2'
on conflict (variant_id) do update set colors=excluded.colors, storages=excluded.storages;

-- Enrich presets with RAM and chip options
-- MacBook Pro 13-inch M4 options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB','24GB','32GB']::text[]),
  'chip', to_jsonb(array['M4']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-13'
where pop.variant_id = pv.id and pv.slug = 'm4';

-- MacBook Pro 13-inch M3 options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB','24GB']::text[]),
  'chip', to_jsonb(array['M3']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-13'
where pop.variant_id = pv.id and pv.slug = 'm3';

-- MacBook Pro 13-inch M2 options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB','24GB']::text[]),
  'chip', to_jsonb(array['M2']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-13'
where pop.variant_id = pv.id and pv.slug = 'm2';

-- MacBook Pro 13-inch M1 options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['8GB','16GB']::text[]),
  'chip', to_jsonb(array['M1']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-13'
where pop.variant_id = pv.id and pv.slug = 'm1';

-- MacBook Pro 15-inch M4 options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['16GB','32GB','64GB','96GB']::text[]),
  'chip', to_jsonb(array['M4 Pro','M4 Max']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-15'
where pop.variant_id = pv.id and pv.slug = 'm4';

-- MacBook Pro 15-inch M3 options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['16GB','32GB','64GB','96GB']::text[]),
  'chip', to_jsonb(array['M3 Pro','M3 Max']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-15'
where pop.variant_id = pv.id and pv.slug = 'm3';

-- MacBook Pro 15-inch M2 options
update public.product_option_presets pop
set options = jsonb_build_object(
  'color', to_jsonb(pop.colors),
  'storage', to_jsonb(pop.storages),
  'ram', to_jsonb(array['16GB','32GB','64GB']::text[]),
  'chip', to_jsonb(array['M2 Pro','M2 Max']::text[])
)
from public.product_variants pv
join public.product_models pm on pm.id = pv.model_id and pm.slug = 'macbook-pro-15'
where pop.variant_id = pv.id and pv.slug = 'm2'; 