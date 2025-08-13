-- Normalize iPhone taxonomy to base models + variants and seed variant presets
-- Safe to run multiple times (idempotent)

-- 0) Resolve Apple/iPhone ids
with brand as (
	select id from public.brands where slug = 'apple'
), fam as (
	select pf.id as family_id
	from public.product_families pf
	join brand on pf.brand_id = brand.id
	where pf.slug = 'iphone'
)
-- 1) Delete existing variants under iPhone (so we can reseed cleanly)
delete from public.product_variants v
using public.product_models m, fam
where v.model_id = m.id and m.family_id = fam.family_id;

-- 2) Remove non-base iPhone models (Pro/Pro Max/Plus/Mini/XS/XR/etc.)
with fam_ctx as (
	select pf.id as family_id
	from public.product_families pf
	join public.brands b on b.id = pf.brand_id
	where b.slug = 'apple' and pf.slug = 'iphone'
), doomed as (
	select pm.id
	from public.product_models pm
	join fam_ctx on pm.family_id = fam_ctx.family_id
	where pm.slug in (
		-- plus/mini/pro/pro-max generations
		'iphone-6-plus','iphone-6s-plus','iphone-7-plus','iphone-8-plus',
		'iphone-12-mini','iphone-12-pro','iphone-12-pro-max',
		'iphone-13-mini','iphone-13-pro','iphone-13-pro-max',
		'iphone-14-plus','iphone-14-pro','iphone-14-pro-max',
		'iphone-15-plus','iphone-15-pro','iphone-15-pro-max',
		'iphone-16-plus','iphone-16-pro','iphone-16-pro-max',
		-- X generation siblings treated as variants
		'iphone-xr','iphone-xs','iphone-xs-max',
		-- 11 Pro models
		'iphone-11-pro','iphone-11-pro-max'
	)
)
delete from public.product_models pm using doomed d where pm.id = d.id;

-- 3) Ensure base models exist (only one per generation) and set display order (newest first)
insert into public.product_models(family_id, name, slug, display_order)
select pf.id as family_id, t.name, t.slug, t.display_order
from public.product_families pf
join public.brands b on b.id = pf.brand_id
cross join (values
	('iPhone 16', 'iphone-16', 100),
	('iPhone 15', 'iphone-15', 90),
	('iPhone 14', 'iphone-14', 80),
	('iPhone 13', 'iphone-13', 70),
	('iPhone 12', 'iphone-12', 60),
	('iPhone 11', 'iphone-11', 50),
	('iPhone X', 'iphone-x', 45),
	('iPhone 8', 'iphone-8', 40),
	('iPhone 7', 'iphone-7', 30),
	('iPhone 6s', 'iphone-6s', 20),
	('iPhone 6', 'iphone-6', 10),
	('iPhone SE (3rd gen)', 'iphone-se-3rd-gen', 65),
	('iPhone SE (2nd gen)', 'iphone-se-2nd-gen', 55)
) as t(name, slug, display_order)
where b.slug = 'apple' and pf.slug = 'iphone'
on conflict (family_id, slug) do update set display_order = excluded.display_order;

-- 4) Insert variants for each base model with full names and display order
with fam as (
	select pf.id as family_id
	from public.product_families pf
	join public.brands b on b.id = pf.brand_id
	where b.slug = 'apple' and pf.slug = 'iphone'
), m as (
	select id, slug, name from public.product_models pm
	join fam on pm.family_id = fam.family_id
), v(src_model_slug, variant_name, variant_slug, display_order) as (
	values
	-- Legacy Plus
	('iphone-6','iPhone 6','base', 20),('iphone-6','iPhone 6 Plus','plus', 10),
	('iphone-6s','iPhone 6s','base', 20),('iphone-6s','iPhone 6s Plus','plus', 10),
	('iphone-7','iPhone 7','base', 20),('iphone-7','iPhone 7 Plus','plus', 10),
	('iphone-8','iPhone 8','base', 20),('iphone-8','iPhone 8 Plus','plus', 10),
	-- X generation as variants
	('iphone-x','iPhone X','x', 40),('iphone-x','iPhone XR','xr', 30),('iphone-x','iPhone XS','xs', 20),('iphone-x','iPhone XS Max','xs-max', 10),
	-- 11
	('iphone-11','iPhone 11','base', 40),('iphone-11','iPhone 11 Pro','pro', 30),('iphone-11','iPhone 11 Pro Max','pro-max', 20),
	-- 12
	('iphone-12','iPhone 12 mini','mini', 40),('iphone-12','iPhone 12','base', 30),('iphone-12','iPhone 12 Pro','pro', 20),('iphone-12','iPhone 12 Pro Max','pro-max', 10),
	-- 13
	('iphone-13','iPhone 13 mini','mini', 40),('iphone-13','iPhone 13','base', 30),('iphone-13','iPhone 13 Pro','pro', 20),('iphone-13','iPhone 13 Pro Max','pro-max', 10),
	-- 14
	('iphone-14','iPhone 14','base', 40),('iphone-14','iPhone 14 Plus','plus', 30),('iphone-14','iPhone 14 Pro','pro', 20),('iphone-14','iPhone 14 Pro Max','pro-max', 10),
	-- 15
	('iphone-15','iPhone 15','base', 40),('iphone-15','iPhone 15 Plus','plus', 30),('iphone-15','iPhone 15 Pro','pro', 20),('iphone-15','iPhone 15 Pro Max','pro-max', 10),
	-- 16
	('iphone-16','iPhone 16','base', 40),('iphone-16','IPhone 16 Plus','plus', 30),('iphone-16','iPhone 16 Pro','pro', 20),('iphone-16','iPhone 16 Pro Max','pro-max', 10),
	-- SE
	('iphone-se-2nd-gen','iPhone SE (2nd gen)','base', 10),('iphone-se-3rd-gen','iPhone SE (3rd gen)','base', 10)
)
insert into public.product_variants(model_id, name, slug, display_order)
select m.id, v.variant_name, v.variant_slug, v.display_order
from v
join m on m.slug = v.src_model_slug
on conflict (model_id, slug) do update set name = excluded.name, display_order = excluded.display_order;

-- 5) Seed variant-specific option presets (colors/storages)
-- Note: we focus on modern generations; legacy share base/plus storages/colors similar to model presets
with fam as (
	select pf.id as family_id
	from public.product_families pf
	join public.brands b on b.id = pf.brand_id
	where b.slug = 'apple' and pf.slug = 'iphone'
), variants as (
	select pv.id, pm.slug as model_slug, pv.slug as variant_slug
	from public.product_variants pv
	join public.product_models pm on pv.model_id = pm.id
	join fam on pm.family_id = fam.family_id
), preset as (
	select * from (
		values
		-- 11
		('iphone-11','base', array['64GB','128GB','256GB']::text[], array['Black|#121212','White|#f5f5f7','Green|#a8e6cf','Yellow|#fff176','Purple|#b39ddb','Red|#cc0000']::text[]),
		('iphone-11','pro', array['64GB','256GB','512GB']::text[], array['Midnight Green|#004d40','Space Gray|#545454','Silver|#c0c0c0','Gold|#d4af37']::text[]),
		('iphone-11','pro-max', array['64GB','256GB','512GB']::text[], array['Midnight Green|#004d40','Space Gray|#545454','Silver|#c0c0c0','Gold|#d4af37']::text[]),
		-- 12
		('iphone-12','mini', array['64GB','128GB','256GB']::text[], array['Black|#121212','White|#f5f5f7','Blue|#0b72d2','Green|#a8e6cf','Purple|#b39ddb','Red|#cc0000']::text[]),
		('iphone-12','base', array['64GB','128GB','256GB']::text[], array['Black|#121212','White|#f5f5f7','Blue|#0b72d2','Green|#a8e6cf','Purple|#b39ddb','Red|#cc0000']::text[]),
		('iphone-12','pro', array['128GB','256GB','512GB']::text[], array['Graphite|#424242','Silver|#c0c0c0','Gold|#d4af37','Pacific Blue|#435b8a']::text[]),
		('iphone-12','pro-max', array['128GB','256GB','512GB']::text[], array['Graphite|#424242','Silver|#c0c0c0','Gold|#d4af37','Pacific Blue|#435b8a']::text[]),
		-- 13
		('iphone-13','mini', array['128GB','256GB','512GB']::text[], array['Midnight|#0b0b0b','Starlight|#f4f1ea','Blue|#0b72d2','Pink|#ffb6c1','Green|#a8e6cf','Red|#cc0000']::text[]),
		('iphone-13','base', array['128GB','256GB','512GB']::text[], array['Midnight|#0b0b0b','Starlight|#f4f1ea','Blue|#0b72d2','Pink|#ffb6c1','Green|#a8e6cf','Red|#cc0000']::text[]),
		('iphone-13','pro', array['128GB','256GB','512GB','1TB']::text[], array['Graphite|#424242','Silver|#c0c0c0','Gold|#d4af37','Sierra Blue|#7aa5d3','Alpine Green|#2e7d32']::text[]),
		('iphone-13','pro-max', array['128GB','256GB','512GB','1TB']::text[], array['Graphite|#424242','Silver|#c0c0c0','Gold|#d4af37','Sierra Blue|#7aa5d3','Alpine Green|#2e7d32']::text[]),
		-- 14
		('iphone-14','base', array['128GB','256GB','512GB']::text[], array['Midnight|#0b0b0b','Starlight|#f4f1ea','Blue|#6bb6ff','Purple|#a78bfa','Yellow|#fff176','Red|#cc0000']::text[]),
		('iphone-14','plus', array['128GB','256GB','512GB']::text[], array['Midnight|#0b0b0b','Starlight|#f4f1ea','Blue|#6bb6ff','Purple|#a78bfa','Yellow|#fff176','Red|#cc0000']::text[]),
		('iphone-14','pro', array['128GB','256GB','512GB','1TB']::text[], array['Space Black|#1c1c1e','Silver|#c0c0c0','Gold|#d4af37','Deep Purple|#6a5acd']::text[]),
		('iphone-14','pro-max', array['128GB','256GB','512GB','1TB']::text[], array['Space Black|#1c1c1e','Silver|#c0c0c0','Gold|#d4af37','Deep Purple|#6a5acd']::text[]),
		-- 15
		('iphone-15','base', array['128GB','256GB','512GB']::text[], array['Black|#121212','Blue|#6bb6ff','Green|#a8e6cf','Yellow|#fff176','Pink|#ffb6c1']::text[]),
		('iphone-15','plus', array['128GB','256GB','512GB']::text[], array['Black|#121212','Blue|#6bb6ff','Green|#a8e6cf','Yellow|#fff176','Pink|#ffb6c1']::text[]),
		('iphone-15','pro', array['128GB','256GB','512GB','1TB']::text[], array['Natural Titanium|#878787','Blue Titanium|#335fa3','White Titanium|#f5f5f7','Black Titanium|#1c1c1e']::text[]),
		('iphone-15','pro-max', array['256GB','512GB','1TB']::text[], array['Natural Titanium|#878787','Blue Titanium|#335fa3','White Titanium|#f5f5f7','Black Titanium|#1c1c1e']::text[]),
		-- 16 (placeholder similar to 15)
		('iphone-16','base', array['128GB','256GB','512GB']::text[], array['Black|#121212','Blue|#6bb6ff','Green|#a8e6cf','Yellow|#fff176','Pink|#ffb6c1']::text[]),
		('iphone-16','plus', array['128GB','256GB','512GB']::text[], array['Black|#121212','Blue|#6bb6ff','Green|#a8e6cf','Yellow|#fff176','Pink|#ffb6c1']::text[]),
		('iphone-16','pro', array['128GB','256GB','512GB','1TB']::text[], array['Natural Titanium|#878787','Blue Titanium|#335fa3','White Titanium|#f5f5f7','Black Titanium|#1c1c1e']::text[]),
		('iphone-16','pro-max', array['256GB','512GB','1TB']::text[], array['Natural Titanium|#878787','Blue Titanium|#335fa3','White Titanium|#f5f5f7','Black Titanium|#1c1c1e']::text[]),
		-- SE
		('iphone-se-2nd-gen','base', array['64GB','128GB','256GB']::text[], array['Black|#121212','White|#f5f5f7','Red|#cc0000']::text[]),
		('iphone-se-3rd-gen','base', array['64GB','128GB','256GB']::text[], array['Midnight|#0b0b0b','Starlight|#f4f1ea','Red|#cc0000']::text[])
	) as t(model_slug, variant_slug, storages, colors)
)
insert into public.product_option_presets(model_id, variant_id, colors, storages, options)
select null as model_id, v.id as variant_id, p.colors, p.storages, '{}'::jsonb
from preset p
join variants v on v.model_slug = p.model_slug and v.variant_slug = p.variant_slug
on conflict (variant_id) do update set colors = excluded.colors, storages = excluded.storages, options = excluded.options; 