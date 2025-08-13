-- Seed core categories and brands (idempotent)
insert into public.categories(name, slug)
select * from (values
  ('Phones','phones'),
  ('Tablets','tablets'),
  ('Laptops','laptops'),
  ('Desktops','desktops'),
  ('Wearables','wearables'),
  ('Audio','audio'),
  ('TV','tv'),
  ('Smart Home','smart-home'),
  ('Accessories','accessories')
) as v(name, slug)
where not exists (select 1 from public.categories c where c.slug = v.slug);

insert into public.brands(name, slug)
select * from (values
  ('Apple','apple'),
  ('Samsung','samsung'),
  ('Dyson','dyson'),
  ('Sony','sony'),
  ('Dell','dell')
) as v(name, slug)
where not exists (select 1 from public.brands b where b.slug = v.slug); 