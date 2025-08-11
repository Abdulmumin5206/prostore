-- Apple iMac seed (idempotent)
-- Run after docs/supabase-schema.sql

insert into public.brands (name, slug)
select 'Apple','apple'
where not exists (select 1 from public.brands where slug='apple');

with apple as (select id from public.brands where slug='apple')
insert into public.product_families (brand_id, name, slug)
select a.id, 'iMac', 'imac' from apple a
on conflict (brand_id, slug) do nothing;

insert into public.product_models (family_id, name, slug)
select f.id, 'iMac 24-inch (M3)', 'imac-24-m3'
from public.product_families f
join public.brands b on b.id=f.brand_id and b.slug='apple'
where f.slug='imac'
on conflict (family_id, slug) do nothing;

insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Blue|#2997FF','Purple|#AC39FF','Green|#00C7BE','Silver|#F5F5F7','Space Gray|#1C1C1E','Pink|#FFA3A3','Yellow|#F3E5AB'], array['256GB','512GB','1TB','2TB']
from public.product_models pm
where pm.slug='imac-24-m3'
on conflict (model_id) do update set colors=excluded.colors, storages=excluded.storages; 