-- Comprehensive Apple iPhone seed (models + option presets)
-- Safe to run multiple times (idempotent)

-- 1) Ensure Apple brand and iPhone family exist
with apple as (
	select id as brand_id from public.brands where slug = 'apple'
), fam as (
	insert into public.product_families(brand_id, name, slug)
	select apple.brand_id, 'iPhone', 'iphone' from apple
	where not exists (
		select 1 from public.product_families f where f.slug = 'iphone' and f.brand_id = (select brand_id from apple)
	)
	returning id
), fam_id as (
	select id as family_id from public.product_families where slug = 'iphone' and brand_id = (select brand_id from apple)
)
select 1 from fam_id; -- no-op to complete CTE

-- 2) Insert/Upsert models (no duplicates)
insert into public.product_models(family_id, name, slug)
select f.family_id, md.name, md.slug
from (select id as family_id from public.product_families where slug = 'iphone' and brand_id = (select id from public.brands where slug='apple')) f,
(values
	('iPhone 6','iphone-6'),
	('iPhone 6 Plus','iphone-6-plus'),
	('iPhone 6s','iphone-6s'),
	('iPhone 6s Plus','iphone-6s-plus'),
	('iPhone SE (1st gen)','iphone-se-1st-gen'),
	('iPhone 7','iphone-7'),
	('iPhone 7 Plus','iphone-7-plus'),
	('iPhone 8','iphone-8'),
	('iPhone 8 Plus','iphone-8-plus'),
	('iPhone X','iphone-x'),
	('iPhone XR','iphone-xr'),
	('iPhone XS','iphone-xs'),
	('iPhone XS Max','iphone-xs-max'),
	('iPhone 11','iphone-11'),
	('iPhone 11 Pro','iphone-11-pro'),
	('iPhone 11 Pro Max','iphone-11-pro-max'),
	('iPhone SE (2nd gen)','iphone-se-2nd-gen'),
	('iPhone 12','iphone-12'),
	('iPhone 12 mini','iphone-12-mini'),
	('iPhone 12 Pro','iphone-12-pro'),
	('iPhone 12 Pro Max','iphone-12-pro-max'),
	('iPhone 13','iphone-13'),
	('iPhone 13 mini','iphone-13-mini'),
	('iPhone 13 Pro','iphone-13-pro'),
	('iPhone 13 Pro Max','iphone-13-pro-max'),
	('iPhone SE (3rd gen)','iphone-se-3rd-gen'),
	('iPhone 14','iphone-14'),
	('iPhone 14 Plus','iphone-14-plus'),
	('iPhone 14 Pro','iphone-14-pro'),
	('iPhone 14 Pro Max','iphone-14-pro-max'),
	('iPhone 15','iphone-15'),
	('iPhone 15 Plus','iphone-15-plus'),
	('iPhone 15 Pro','iphone-15-pro'),
	('iPhone 15 Pro Max','iphone-15-pro-max'),
	('iPhone 16','iphone-16'),
	('iPhone 16 Plus','iphone-16-plus'),
	('iPhone 16 Pro','iphone-16-pro'),
	('iPhone 16 Pro Max','iphone-16-pro-max')
) as md(name, slug)
on conflict (family_id, slug) do nothing;

-- 3) Map storages/colors/options to model slugs
with preset as (
	select * from (
		values
		-- 6 series
		('iphone-6', array['16GB','64GB','128GB']::text[], array['Silver|#c0c0c0','Space Gray|#545454','Gold|#d4af37']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		('iphone-6-plus', array['16GB','64GB','128GB']::text[], array['Silver|#c0c0c0','Space Gray|#545454','Gold|#d4af37']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		-- 6s
		('iphone-6s', array['32GB','64GB','128GB']::text[], array['Silver|#c0c0c0','Space Gray|#545454','Gold|#d4af37','Rose Gold|#e6a1b0']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		('iphone-6s-plus', array['32GB','64GB','128GB']::text[], array['Silver|#c0c0c0','Space Gray|#545454','Gold|#d4af37','Rose Gold|#e6a1b0']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		-- SE 1st gen
		('iphone-se-1st-gen', array['16GB','32GB','64GB','128GB']::text[], array['Silver|#c0c0c0','Space Gray|#545454','Gold|#d4af37','Rose Gold|#e6a1b0']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		-- 7 series
		('iphone-7', array['32GB','128GB','256GB']::text[], array['Jet Black|#0a0a0a','Black|#121212','Silver|#c0c0c0','Gold|#d4af37','Rose Gold|#e6a1b0','Red|#cc0000']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		('iphone-7-plus', array['32GB','128GB','256GB']::text[], array['Jet Black|#0a0a0a','Black|#121212','Silver|#c0c0c0','Gold|#d4af37','Rose Gold|#e6a1b0','Red|#cc0000']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		-- 8 series
		('iphone-8', array['64GB','256GB']::text[], array['Silver|#c0c0c0','Space Gray|#545454','Gold|#d4af37','Red|#cc0000']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		('iphone-8-plus', array['64GB','256GB']::text[], array['Silver|#c0c0c0','Space Gray|#545454','Gold|#d4af37','Red|#cc0000']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		-- X series
		('iphone-x', array['64GB','256GB']::text[], array['Silver|#c0c0c0','Space Gray|#545454']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		('iphone-xr', array['64GB','128GB','256GB']::text[], array['Black|#121212','White|#f5f5f7','Blue|#0b72d2','Coral|#ff7f50','Yellow|#ffd54f','Red|#cc0000']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		('iphone-xs', array['64GB','256GB','512GB']::text[], array['Silver|#c0c0c0','Space Gray|#545454','Gold|#d4af37']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		('iphone-xs-max', array['64GB','256GB','512GB']::text[], array['Silver|#c0c0c0','Space Gray|#545454','Gold|#d4af37']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		-- 11 series
		('iphone-11', array['64GB','128GB','256GB']::text[], array['Black|#121212','White|#f5f5f7','Green|#a8e6cf','Yellow|#fff176','Purple|#b39ddb','Red|#cc0000']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		('iphone-11-pro', array['64GB','256GB','512GB']::text[], array['Midnight Green|#004d40','Space Gray|#545454','Silver|#c0c0c0','Gold|#d4af37']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		('iphone-11-pro-max', array['64GB','256GB','512GB']::text[], array['Midnight Green|#004d40','Space Gray|#545454','Silver|#c0c0c0','Gold|#d4af37']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		-- SE 2nd gen (2020)
		('iphone-se-2nd-gen', array['64GB','128GB','256GB']::text[], array['Black|#121212','White|#f5f5f7','Red|#cc0000']::text[], '{"connectivity":["4G LTE"]}'::jsonb),
		-- 12 series (5G starts)
		('iphone-12', array['64GB','128GB','256GB']::text[], array['Black|#121212','White|#f5f5f7','Blue|#0b72d2','Green|#a8e6cf','Purple|#b39ddb','Red|#cc0000']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-12-mini', array['64GB','128GB','256GB']::text[], array['Black|#121212','White|#f5f5f7','Blue|#0b72d2','Green|#a8e6cf','Purple|#b39ddb','Red|#cc0000']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-12-pro', array['128GB','256GB','512GB']::text[], array['Graphite|#424242','Silver|#c0c0c0','Gold|#d4af37','Pacific Blue|#435b8a']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-12-pro-max', array['128GB','256GB','512GB']::text[], array['Graphite|#424242','Silver|#c0c0c0','Gold|#d4af37','Pacific Blue|#435b8a']::text[], '{"connectivity":["5G"]}'::jsonb),
		-- 13 series
		('iphone-13', array['128GB','256GB','512GB']::text[], array['Midnight|#0b0b0b','Starlight|#f4f1ea','Blue|#0b72d2','Pink|#ffb6c1','Green|#a8e6cf','Red|#cc0000']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-13-mini', array['128GB','256GB','512GB']::text[], array['Midnight|#0b0b0b','Starlight|#f4f1ea','Blue|#0b72d2','Pink|#ffb6c1','Green|#a8e6cf','Red|#cc0000']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-13-pro', array['128GB','256GB','512GB','1TB']::text[], array['Graphite|#424242','Silver|#c0c0c0','Gold|#d4af37','Sierra Blue|#7aa5d3','Alpine Green|#2e7d32']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-13-pro-max', array['128GB','256GB','512GB','1TB']::text[], array['Graphite|#424242','Silver|#c0c0c0','Gold|#d4af37','Sierra Blue|#7aa5d3','Alpine Green|#2e7d32']::text[], '{"connectivity":["5G"]}'::jsonb),
		-- SE 3rd gen (2022)
		('iphone-se-3rd-gen', array['64GB','128GB','256GB']::text[], array['Midnight|#0b0b0b','Starlight|#f4f1ea','Red|#cc0000']::text[], '{"connectivity":["5G"]}'::jsonb),
		-- 14 series
		('iphone-14', array['128GB','256GB','512GB']::text[], array['Midnight|#0b0b0b','Starlight|#f4f1ea','Blue|#6bb6ff','Purple|#a78bfa','Yellow|#fff176','Red|#cc0000']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-14-plus', array['128GB','256GB','512GB']::text[], array['Midnight|#0b0b0b','Starlight|#f4f1ea','Blue|#6bb6ff','Purple|#a78bfa','Yellow|#fff176','Red|#cc0000']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-14-pro', array['128GB','256GB','512GB','1TB']::text[], array['Space Black|#1c1c1e','Silver|#c0c0c0','Gold|#d4af37','Deep Purple|#6a5acd']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-14-pro-max', array['128GB','256GB','512GB','1TB']::text[], array['Space Black|#1c1c1e','Silver|#c0c0c0','Gold|#d4af37','Deep Purple|#6a5acd']::text[], '{"connectivity":["5G"]}'::jsonb),
		-- 15 series
		('iphone-15', array['128GB','256GB','512GB']::text[], array['Black|#121212','Blue|#6bb6ff','Green|#a8e6cf','Yellow|#fff176','Pink|#ffb6c1']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-15-plus', array['128GB','256GB','512GB']::text[], array['Black|#121212','Blue|#6bb6ff','Green|#a8e6cf','Yellow|#fff176','Pink|#ffb6c1']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-15-pro', array['128GB','256GB','512GB','1TB']::text[], array['Natural Titanium|#878787','Blue Titanium|#335fa3','White Titanium|#f5f5f7','Black Titanium|#1c1c1e']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-15-pro-max', array['256GB','512GB','1TB']::text[], array['Natural Titanium|#878787','Blue Titanium|#335fa3','White Titanium|#f5f5f7','Black Titanium|#1c1c1e']::text[], '{"connectivity":["5G"]}'::jsonb),
		-- 16 series (placeholders similar to 15)
		('iphone-16', array['128GB','256GB','512GB']::text[], array['Black|#121212','Blue|#6bb6ff','Green|#a8e6cf','Yellow|#fff176','Pink|#ffb6c1']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-16-plus', array['128GB','256GB','512GB']::text[], array['Black|#121212','Blue|#6bb6ff','Green|#a8e6cf','Yellow|#fff176','Pink|#ffb6c1']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-16-pro', array['128GB','256GB','512GB','1TB']::text[], array['Natural Titanium|#878787','Blue Titanium|#335fa3','White Titanium|#f5f5f7','Black Titanium|#1c1c1e']::text[], '{"connectivity":["5G"]}'::jsonb),
		('iphone-16-pro-max', array['256GB','512GB','1TB']::text[], array['Natural Titanium|#878787','Blue Titanium|#335fa3','White Titanium|#f5f5f7','Black Titanium|#1c1c1e']::text[], '{"connectivity":["5G"]}'::jsonb)
	) as t(slug, storages, colors, options)
)
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select pm.id as model_id, null as variant_id, p.colors, p.storages, coalesce(p.options, '{}'::jsonb)
from preset p
join public.product_models pm on pm.slug = p.slug
join public.product_families f on pm.family_id = f.id and f.slug = 'iphone'
join public.brands b on f.brand_id = b.id and b.slug = 'apple'
on conflict (model_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options; 