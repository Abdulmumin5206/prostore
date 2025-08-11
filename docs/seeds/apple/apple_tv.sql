-- Apple TV seed (idempotent)
-- Run after docs/supabase-schema.sql

insert into public.brands (name, slug)
select 'Apple','apple'
where not exists (select 1 from public.brands where slug='apple');

with apple as (select id from public.brands where slug='apple')
insert into public.product_families (brand_id, name, slug)
select a.id, 'Apple TV', 'apple-tv' from apple a
on conflict (brand_id, slug) do nothing;

insert into public.product_models (family_id, name, slug)
select f.id, 'Apple TV 4K (3rd generation)', 'apple-tv-4k-3rd'
from public.product_families f
join public.brands b on b.id=f.brand_id and b.slug='apple'
where f.slug='apple-tv'
on conflict (family_id, slug) do nothing;

insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Black|#000000'], array['64GB','128GB']
from public.product_models pm
where pm.slug='apple-tv-4k-3rd'
on conflict (model_id) do update set colors=excluded.colors, storages=excluded.storages; 