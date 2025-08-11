-- Apple Watch seed (idempotent)
-- Run after docs/supabase-schema.sql

insert into public.brands (name, slug)
select 'Apple','apple'
where not exists (select 1 from public.brands where slug='apple');

with apple as (select id from public.brands where slug='apple')
insert into public.product_families (brand_id, name, slug)
select a.id, 'Apple Watch', 'apple-watch' from apple a
on conflict (brand_id, slug) do nothing;

-- Models
insert into public.product_models (family_id, name, slug)
select f.id, m.name, m.slug
from public.product_families f
join public.brands b on b.id=f.brand_id and b.slug='apple'
cross join (
  values
    ('Apple Watch','apple-watch','Apple Watch Series 10','apple-watch-series-10'),
    ('Apple Watch','apple-watch','Apple Watch Ultra 3','apple-watch-ultra-3'),
    ('Apple Watch','apple-watch','Apple Watch SE (2nd gen)','apple-watch-se-2')
) as m(fam_name,fam_slug,name,slug)
where f.slug=m.fam_slug
on conflict (family_id, slug) do nothing;

-- Presets (colors named, sizes in storages)
insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Space Black|#1C1C1E','Silver|#F5F5F7','Gray|#7D7E80','Starlight|#F5F1E8'], array['41mm','45mm']
from public.product_models pm
join public.product_families pf on pf.id=pm.family_id and pf.slug='apple-watch'
where pm.slug='apple-watch-series-10'
on conflict (model_id) do update set colors=excluded.colors, storages=excluded.storages;

insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Titanium|#D2B48C','Silver|#F5F5F7','Coral|#FF7F50'], array['49mm']
from public.product_models pm
join public.product_families pf on pf.id=pm.family_id and pf.slug='apple-watch'
where pm.slug='apple-watch-ultra-3'
on conflict (model_id) do update set colors=excluded.colors, storages=excluded.storages;

insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Space Black|#1C1C1E','Silver|#F5F5F7','Gray|#7D7E80'], array['40mm','44mm']
from public.product_models pm
join public.product_families pf on pf.id=pm.family_id and pf.slug='apple-watch'
where pm.slug='apple-watch-se-2'
on conflict (model_id) do update set colors=excluded.colors, storages=excluded.storages; 