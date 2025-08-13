# Catalog delete guide (safe patterns)

Use these queries in the Supabase SQL editor. They are scoped by brand/family/model/variant slugs so you only remove what you intend. All deletes honor ON DELETE CASCADE (variants → presets, product → skus/prices/inventory/images).

## Preview counts before deleting
```sql
-- Models in a family
select count(*) models
from public.product_models m
join public.product_families f on m.family_id=f.id
join public.brands b on f.brand_id=b.id
where b.slug='apple' and f.slug='FAMILY_SLUG';

-- Variants in a family
select count(*) variants
from public.product_variants v
join public.product_models m on v.model_id=m.id
join public.product_families f on m.family_id=f.id
join public.brands b on f.brand_id=b.id
where b.slug='apple' and f.slug='FAMILY_SLUG';
```

## Delete a single variant
```sql
delete from public.product_variants v
using public.product_models m, public.product_families f, public.brands b
where v.model_id=m.id and m.family_id=f.id and f.brand_id=b.id
  and b.slug='apple' and f.slug='FAMILY_SLUG'
  and m.slug='MODEL_SLUG' and v.slug='VARIANT_SLUG';
```

## Delete a whole model (removes its variants + presets)
```sql
delete from public.product_models m
using public.product_families f, public.brands b
where m.family_id=f.id and f.brand_id=b.id
  and b.slug='apple' and f.slug='FAMILY_SLUG'
  and m.slug='MODEL_SLUG';
```

## Delete an entire family (removes all models/variants/presets)
```sql
delete from public.product_families f
using public.brands b
where f.brand_id=b.id and b.slug='apple' and f.slug='FAMILY_SLUG';
```

## Also remove created Products for that family (optional)
Products store `family` as text, so remove them explicitly if you want a clean storefront.
```sql
with brand as (select id from public.brands where slug='apple')
delete from public.products p
where p.brand_id=(select id from brand)
  and lower(p.family) = lower('FAMILY NAME');
```

## MacBook Air examples
- Remove variant: M3 15-inch
```sql
-- family slug: macbook-air, model slug: macbook-air-m3, variant slug: 15
-- Delete only this variant
delete from public.product_variants v
using public.product_models m, public.product_families f, public.brands b
where v.model_id=m.id and m.family_id=f.id and f.brand_id=b.id
  and b.slug='apple' and f.slug='macbook-air'
  and m.slug='macbook-air-m3' and v.slug='15';
```
- Remove a model: MacBook Air (M2)
```sql
delete from public.product_models m
using public.product_families f, public.brands b
where m.family_id=f.id and f.brand_id=b.id
  and b.slug='apple' and f.slug='macbook-air'
  and m.slug='macbook-air-m2';
```
- Remove the entire family: MacBook Air
```sql
delete from public.product_families f
using public.brands b
where f.brand_id=b.id and b.slug='apple' and f.slug='macbook-air';

-- Optional: also remove created products
with brand as (select id from public.brands where slug='apple')
delete from public.products p
where p.brand_id=(select id from brand) and lower(p.family)='macbook air';
```

## MacBook Pro examples
- Remove variant: M3 16-inch
```sql
delete from public.product_variants v
using public.product_models m, public.product_families f, public.brands b
where v.model_id=m.id and m.family_id=f.id and f.brand_id=b.id
  and b.slug='apple' and f.slug='macbook-pro'
  and m.slug='macbook-pro-m3' and v.slug='16';
```
- Remove a model: MacBook Pro (M1)
```sql
delete from public.product_models m
using public.product_families f, public.brands b
where m.family_id=f.id and f.brand_id=b.id
  and b.slug='apple' and f.slug='macbook-pro'
  and m.slug='macbook-pro-m1';
```
- Remove the entire family: MacBook Pro
```sql
delete from public.product_families f
using public.brands b
where f.brand_id=b.id and b.slug='apple' and f.slug='macbook-pro';

with brand as (select id from public.brands where slug='apple')
delete from public.products p
where p.brand_id=(select id from brand) and lower(p.family)='macbook pro';
```

## Recover/seed again
- MacBook Air: run `docs/seed-apple-macbook-air.sql`
- MacBook Pro: run `docs/seed-apple-macbook-pro.sql`
- iPhone base+variants: run `docs/seed-apple-iphone-variants.sql`

## Permissions
These deletes require you to be authenticated with a profile `role = 'admin'` (matches RLS policies). If you receive RLS errors, re-check your profile role and session. 