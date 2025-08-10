-- Seed presets for iPhone models (12 to 16)
-- Assumes Apple brand, iPhone family, and corresponding models/variants exist
-- Adjust UUIDs below by querying your product_models and product_variants tables.

-- Example template for inserting presets by model (replace :MODEL_ID and arrays):
-- insert into public.product_option_presets (model_id, colors, storages)
-- values ('00000000-0000-0000-0000-000000000000', array['#color1','#color2'], array['128GB','256GB']);

-- iPhone 12 (colors, storages may vary by sub-model; here for base 12)
-- insert into public.product_option_presets (model_id, colors, storages)
-- values ('<IPHONE_12_MODEL_ID>', array['#1c1c1e','#f5f5f7','#bfd0dd','#e3ccb4'], array['64GB','128GB','256GB']);

-- iPhone 13
-- insert into public.product_option_presets (model_id, colors, storages)
-- values ('<IPHONE_13_MODEL_ID>', array['#1c1c1e','#f5f5f7','#bfd0dd','#e3ccb4','#7d7e80'], array['128GB','256GB','512GB']);

-- iPhone 14
-- insert into public.product_option_presets (model_id, colors, storages)
-- values ('<IPHONE_14_MODEL_ID>', array['#1c1c1e','#f5f5f7','#bfd0dd','#e3ccb4','#ff69b4'], array['128GB','256GB','512GB']);

-- iPhone 15
-- insert into public.product_option_presets (model_id, colors, storages)
-- values ('<IPHONE_15_MODEL_ID>', array['#1c1c1e','#f5f5f7','#bfd0dd','#e3ccb4','#ffb6c1'], array['128GB','256GB','512GB']);

-- iPhone 16
-- insert into public.product_option_presets (model_id, colors, storages)
-- values ('<IPHONE_16_MODEL_ID>', array['#1c1c1e','#f5f5f7','#bfd0dd','#e3ccb4'], array['128GB','256GB','512GB','1TB']);

-- If you maintain separate variants (e.g., Pro/Pro Max), prefer variant-level presets:
-- insert into public.product_option_presets (variant_id, colors, storages)
-- values ('<IPHONE_15_PRO_VARIANT_ID>', array['#1c1c1e','#f5f5f7','#7d7e80'], array['256GB','512GB','1TB']); 