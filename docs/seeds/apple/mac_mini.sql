-- Apple Mac mini seed (idempotent)
-- Run after docs/supabase-schema.sql

insert into public.brands (name, slug)
select 'Apple','apple'
where not exists (select 1 from public.brands where slug='apple');

with apple as (select id from public.brands where slug='apple')
insert into public.product_families (brand_id, name, slug)
select a.id, 'Mac mini', 'mac-mini' from apple a
on conflict (brand_id, slug) do nothing;

insert into public.product_models (family_id, name, slug)
select f.id, 'Mac mini (M2/M2 Pro)', 'mac-mini-m2'
from public.product_families f
join public.brands b on b.id=f.brand_id and b.slug='apple'
where f.slug='mac-mini'
on conflict (family_id, slug) do nothing;

insert into public.product_option_presets (model_id, colors, storages)
select pm.id, array['Silver|#C0C0C0','Space Gray|#1C1C1E'], array['256GB','512GB','1TB','2TB','4TB','8TB']
from public.product_models pm
where pm.slug='mac-mini-m2'
on conflict (model_id) do update set colors=excluded.colors, storages=excluded.storages; 