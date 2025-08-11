-- Apple AirPods seed (idempotent)
-- Run after docs/supabase-schema.sql

insert into public.brands (name, slug)
select 'Apple','apple'
where not exists (select 1 from public.brands where slug='apple');

with apple as (select id from public.brands where slug='apple')
insert into public.product_families (brand_id, name, slug)
select a.id, 'AirPods', 'airpods' from apple a
on conflict (brand_id, slug) do nothing;

insert into public.product_models (family_id, name, slug)
select f.id, m.name, m.slug
from public.product_families f
join public.brands b on b.id=f.brand_id and b.slug='apple'
cross join (
  values
    ('AirPods','airpods','AirPods Pro (2nd generation)','airpods-pro-2'),
    ('AirPods','airpods','AirPods (4th generation)','airpods-4'),
    ('AirPods','airpods','AirPods Max','airpods-max')
) as m(fam_name,fam_slug,name,slug)
where f.slug=m.fam_slug
on conflict (family_id, slug) do nothing;

insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['White|#FFFFFF'], array[]::text[]
from public.product_models pm
where pm.slug in ('airpods-pro-2','airpods-4')
on conflict (model_id) do update set colors=excluded.colors, storages=excluded.storages;

insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Space Black|#1C1C1E','Silver|#F5F5F7','Sky Blue|#B0C4DE','Light Blue|#ADD8E6','Pink|#FFC0CB'], array[]::text[]
from public.product_models pm
where pm.slug='airpods-max'
on conflict (model_id) do update set colors=excluded.colors, storages=excluded.storages; 