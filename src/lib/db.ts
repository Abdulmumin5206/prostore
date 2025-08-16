import { supabase, isSupabaseConfigured } from './supabase'

export type PublicProduct = {
  product_id: string
  title: string
  description: string | null
  family: string | null
  model: string | null
  variant: string | null
  brand: string
  category: string
  primary_image: string | null
  sku_id: string
  condition: 'new' | 'second_hand'
  attributes: Record<string, any>
  currency: string
  effective_price: number
  quantity: number | null
}

export type Brand = { id: string; name: string; slug: string }
export type Category = { id: string; name: string; slug: string }
export type Family = { id: string; brand_id: string; name: string; slug: string }
export type Model = { id: string; family_id: string; name: string; slug: string; release_year?: number | null; display_order?: number | null }
export type Variant = { id: string; model_id: string; name: string; slug: string }
export type OptionPreset = { 
  id: string; 
  model_id: string | null; 
  variant_id: string | null; 
  colors: string[]; 
  storages: string[];
  options?: {
    ram_options?: string[];
    gpu_cores?: number[];
    chip_tiers?: string[];
    [key: string]: any;
  }
}

export async function listPublicProducts(): Promise<PublicProduct[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase.from('public_products_view').select('*')
  if (error) throw error
  return (data as any[]) as PublicProduct[]
}

export async function listBrands(): Promise<Brand[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase.from('brands').select('*').order('name')
  if (error) throw error
  return data as Brand[]
}

export async function listCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data as Category[]
}

export async function createBrand(name: string): Promise<Brand> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const { data, error } = await supabase.from('brands').insert({ name, slug }).select('*').single()
  if (error) throw error
  return data as Brand
}

export async function createCategory(name: string): Promise<Category> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const { data, error } = await supabase.from('categories').insert({ name, slug }).select('*').single()
  if (error) throw error
  return data as Category
}

// Families / Models / Variants taxonomy helpers
export async function listFamilies(brandId: string): Promise<Family[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('product_families')
    .select('*')
    .eq('brand_id', brandId)
    .order('name')
  if (error) throw error
  return data as Family[]
}

export async function createFamily(brandId: string, name: string): Promise<Family> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const { data, error } = await supabase
    .from('product_families')
    .insert({ brand_id: brandId, name, slug })
    .select('*')
    .single()
  if (error) throw error
  return data as Family
}

export async function listModels(familyId: string): Promise<Model[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('product_models')
    .select('*')
    .eq('family_id', familyId)
    .order('release_year', { ascending: false, nullsFirst: false })
    .order('display_order', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true })
  if (error) throw error
  return data as Model[]
}

export async function createModel(familyId: string, name: string): Promise<Model> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const { data, error } = await supabase
    .from('product_models')
    .insert({ family_id: familyId, name, slug })
    .select('*')
    .single()
  if (error) throw error
  return data as Model
}

export async function listVariants(modelId: string): Promise<Variant[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('model_id', modelId)
    .order('display_order', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true })
  if (error) throw error
  return data as Variant[]
}

export async function createVariant(modelId: string, name: string): Promise<Variant> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  const { data, error } = await supabase
    .from('product_variants')
    .insert({ model_id: modelId, name, slug })
    .select('*')
    .single()
  if (error) throw error
  return data as Variant
}

export async function getOptionPresetForModel(modelId: string): Promise<OptionPreset | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from('product_option_presets')
    .select('*')
    .eq('model_id', modelId)
    .maybeSingle()
  if (error) throw error
  return (data as any) ?? null
}

export async function getOptionPresetForVariant(variantId: string): Promise<OptionPreset | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase
    .from('product_option_presets')
    .select('*')
    .eq('variant_id', variantId)
    .maybeSingle()
  if (error) throw error
  return (data as any) ?? null
}

export async function upsertOptionPresetForModel(modelId: string, colors: string[], storages: string[]): Promise<OptionPreset> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { data: existing, error: selErr } = await supabase
    .from('product_option_presets')
    .select('*')
    .eq('model_id', modelId)
    .single()
  if (selErr && (selErr as any).code !== 'PGRST116') throw selErr
  if (existing) {
    const { data, error } = await supabase
      .from('product_option_presets')
      .update({ colors, storages })
      .eq('id', (existing as any).id)
      .select('*')
      .single()
    if (error) throw error
    return data as OptionPreset
  } else {
    const { data, error } = await supabase
      .from('product_option_presets')
      .insert({ model_id: modelId, variant_id: null, colors, storages })
      .select('*')
      .single()
    if (error) throw error
    return data as OptionPreset
  }
}

export async function upsertOptionPresetForVariant(variantId: string, colors: string[], storages: string[]): Promise<OptionPreset> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { data: existing, error: selErr } = await supabase
    .from('product_option_presets')
    .select('*')
    .eq('variant_id', variantId)
    .single()
  if (selErr && (selErr as any).code !== 'PGRST116') throw selErr
  if (existing) {
    const { data, error } = await supabase
      .from('product_option_presets')
      .update({ colors, storages })
      .eq('id', (existing as any).id)
      .select('*')
      .single()
    if (error) throw error
    return data as OptionPreset
  } else {
    const { data, error } = await supabase
      .from('product_option_presets')
      .insert({ model_id: null, variant_id: variantId, colors, storages })
      .select('*')
      .single()
    if (error) throw error
    return data as OptionPreset
  }
}

export type NewProductInput = {
  brand_id: string
  category_id: string
  family?: string | null
  model?: string | null
  variant?: string | null
  title: string
  description?: string | null
  published: boolean
  images: { url: string; is_primary?: boolean; sort_order?: number; color?: string | null }[]
  sku: {
    condition: 'new' | 'second_hand'
    attributes: Record<string, any>
    is_active?: boolean
    price: { currency?: string; base_price: number; discount_percent?: number | null; discount_amount?: number | null }
    inventory: { quantity: number }
  }
}

export type NewSkuInput = {
  condition: 'new' | 'second_hand'
  attributes: Record<string, any>
  is_active?: boolean
  price: { currency?: string; base_price: number; discount_percent?: number | null; discount_amount?: number | null }
  inventory: { quantity: number }
}

export type NewProductWithSkusInput = Omit<NewProductInput, 'sku'> & { skus: NewSkuInput[] }

export async function createProductWithSku(input: NewProductInput): Promise<{ product_id: string; sku_id: string }>
{
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')

  // Insert product
  const productPublicId = generateProductPublicId(input)
  const { data: product, error: productErr } = await supabase
    .from('products')
    .insert({
      brand_id: input.brand_id,
      category_id: input.category_id,
      family: input.family ?? null,
      model: input.model ?? null,
      variant: input.variant ?? null,
      title: input.title,
      description: input.description ?? null,
      published: input.published,
      public_id: productPublicId,
    })
    .select('id')
    .single()

  if (productErr || !product) throw productErr

  // Insert sku
  const skuCode = generateSkuCode({
    productPublicId,
    condition: input.sku.condition,
    attributes: input.sku.attributes,
  })
  const { data: sku, error: skuErr } = await supabase
    .from('product_skus')
    .insert({
      product_id: product.id,
      condition: input.sku.condition,
      attributes: input.sku.attributes,
      is_active: input.sku.is_active ?? true,
      sku_code: skuCode,
    })
    .select('id')
    .single()

  if (skuErr || !sku) throw skuErr

  // Insert price
  const price = input.sku.price
  const { error: priceErr } = await supabase
    .from('sku_prices')
    .insert({
      sku_id: sku.id,
      currency: price.currency ?? 'USD',
      base_price: price.base_price,
      discount_percent: price.discount_percent ?? null,
      discount_amount: price.discount_amount ?? null,
    })

  if (priceErr) throw priceErr

  // Insert inventory
  const { error: invErr } = await supabase
    .from('sku_inventory')
    .insert({ sku_id: sku.id, quantity: input.sku.inventory.quantity })
  if (invErr) throw invErr

  // Insert images
  if (input.images && input.images.length > 0) {
    const { error: imgErr } = await supabase.from('product_images').insert(
      input.images.map((im, idx) => ({
        product_id: product.id,
        url: im.url,
        is_primary: im.is_primary ?? idx === 0,
        sort_order: im.sort_order ?? idx,
        color: im.color ?? null,
      }))
    )
    if (imgErr) throw imgErr
  }

  return { product_id: product.id, sku_id: sku.id }
}

export async function createProductWithSkus(input: NewProductWithSkusInput): Promise<{ product_id: string; sku_ids: string[] }>
{
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')

  const productPublicId = generateProductPublicId(input)
  const { data: product, error: productErr } = await supabase
    .from('products')
    .insert({
      brand_id: input.brand_id,
      category_id: input.category_id,
      family: input.family ?? null,
      model: input.model ?? null,
      variant: input.variant ?? null,
      title: input.title,
      description: input.description ?? null,
      published: input.published,
      public_id: productPublicId,
    })
    .select('id')
    .single()
  if (productErr || !product) throw productErr

  // Insert images once per product
  if (input.images && input.images.length > 0) {
    const { error: imgErr } = await supabase.from('product_images').insert(
      input.images.map((im, idx) => ({
        product_id: product.id,
        url: im.url,
        is_primary: im.is_primary ?? idx === 0,
        sort_order: im.sort_order ?? idx,
        color: im.color ?? null,
      }))
    )
    if (imgErr) throw imgErr
  }

  const skuIds: string[] = []
  for (const skuInput of input.skus) {
    const skuCode = generateSkuCode({
      productPublicId,
      condition: skuInput.condition,
      attributes: skuInput.attributes,
    })
    const { data: sku, error: skuErr } = await supabase
      .from('product_skus')
      .insert({
        product_id: product.id,
        condition: skuInput.condition,
        attributes: skuInput.attributes,
        is_active: skuInput.is_active ?? true,
        sku_code: skuCode,
      })
      .select('id')
      .single()
    if (skuErr || !sku) throw skuErr

    const price = skuInput.price
    const { error: priceErr } = await supabase
      .from('sku_prices')
      .insert({
        sku_id: sku.id,
        currency: price.currency ?? 'USD',
        base_price: price.base_price,
        discount_percent: price.discount_percent ?? null,
        discount_amount: price.discount_amount ?? null,
      })
    if (priceErr) throw priceErr

    const { error: invErr } = await supabase
      .from('sku_inventory')
      .insert({ sku_id: sku.id, quantity: skuInput.inventory.quantity })
    if (invErr) throw invErr

    skuIds.push(sku.id)
  }

  return { product_id: product.id, sku_ids: skuIds }
}

export function generateProductPublicId(input: { brand_id: string; category_id: string; family?: string | null; model?: string | null; variant?: string | null; title: string }): string {
  // Simple readable slug: e.g., APP-IPH-IPHONE-16-PRO-MAX
  const parts = [
    // Brand and category are UUIDs; we cannot resolve names here without extra queries, so use title breakdown
    (input.family || '').toString(),
    (input.model || '').toString(),
    (input.variant || '').toString(),
    input.title,
  ]
    .filter(Boolean)
    .join(' ')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Truncate to reasonable length
  return parts.slice(0, 60)
}

export function generateSkuCode(input: { productPublicId: string; condition: 'new' | 'second_hand'; attributes: Record<string, any> }): string {
  const attrs: string[] = []
  if (input.attributes.storage) attrs.push(String(input.attributes.storage))
  if (input.attributes.ram) attrs.push(String(input.attributes.ram))
  if (input.attributes.color) attrs.push(String(input.attributes.color))
  if ((input.attributes as any).chip_tier) attrs.push(String((input.attributes as any).chip_tier))
  if (input.attributes.connectivity) attrs.push(String(input.attributes.connectivity))
  const suffix = attrs
    .filter(Boolean)
    .join('-')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
  const base = `${input.productPublicId}-${input.condition === 'second_hand' ? 'USED' : 'NEW'}`
  const code = suffix ? `${base}-${suffix}` : base
  return code.slice(0, 80)
}

// Create second-hand unique unit for an existing SKU
export async function createSecondHandItem(params: {
  sku_id: string
  grade: 'A' | 'B' | 'C'
  serial_number?: string | null
  battery_health?: number | null
  included_accessories?: any
  notes?: string | null
  price_override?: number | null
}): Promise<{ id: string }> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('second_hand_items')
    .insert({
      sku_id: params.sku_id,
      grade: params.grade,
      serial_number: params.serial_number ?? null,
      battery_health: params.battery_health ?? null,
      included_accessories: params.included_accessories ?? null,
      notes: params.notes ?? null,
      price_override: params.price_override ?? null,
      status: 'available',
    })
    .select('id')
    .single()
  if (error) throw error
  return data as { id: string }
}

export async function findProductByPublicId(publicId: string): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from('products').select('id').eq('public_id', publicId).single()
  if (error && (error as any).code !== 'PGRST116') throw error
  return (data as any) ?? null
}

export async function findSkuByCode(skuCode: string): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data, error } = await supabase.from('product_skus').select('id').eq('sku_code', skuCode).single()
  if (error && (error as any).code !== 'PGRST116') throw error
  return (data as any) ?? null
}

// Admin listing types
export type AdminProductSummary = {
  productId: string
  productCode?: string | null
  title: string
  published: boolean
  brandName?: string | null
  categoryName?: string | null
  primaryImage?: string | null
  skuId?: string | null
  skuCode?: string | null
  skuActive?: boolean | null
  condition?: 'new' | 'second_hand' | null
  effectivePrice?: number | null
  quantity?: number | null
}

export async function listAdminProducts(limit = 50): Promise<AdminProductSummary[]> {
  if (!isSupabaseConfigured || !supabase) return []

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      public_id,
      code,
      title,
      published,
      brands!inner(name),
      categories!inner(name),
      product_skus(
        id,
        sku_code,
        short_code,
        condition,
        is_active,
        sku_prices(base_price, discount_percent, discount_amount),
        sku_inventory(quantity)
      ),
      product_images(url, is_primary, sort_order)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data as any[]).map((row: any): AdminProductSummary => {
    const images = (row.product_images || []) as Array<{url: string; is_primary: boolean; sort_order: number}>
    const primary = images.sort((a,b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0]
    const sku = (row.product_skus && row.product_skus[0]) || null
    let effectivePrice: number | null = null
    if (sku && sku.sku_prices) {
      const p = sku.sku_prices
      effectivePrice = p.base_price
      if (p.discount_amount != null) effectivePrice = p.base_price - p.discount_amount
      else if (p.discount_percent != null) effectivePrice = p.base_price * (1 - p.discount_percent/100)
    }
    const humanProductCode = (row as any).code ?? (row as any).public_id ?? null
    const humanSkuCode = sku?.short_code ?? sku?.sku_code ?? null
    return {
      productId: row.id,
      productCode: humanProductCode,
      title: row.title,
      published: row.published,
      brandName: row.brands?.name ?? null,
      categoryName: row.categories?.name ?? null,
      primaryImage: primary?.url ?? null,
      skuId: sku?.id ?? null,
      skuCode: humanSkuCode,
      skuActive: sku?.is_active ?? null,
      condition: sku?.condition ?? null,
      effectivePrice,
      quantity: sku?.sku_inventory?.quantity ?? null,
    }
  })
}

export async function setProductPublished(productId: string, published: boolean): Promise<void> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('products').update({ published }).eq('id', productId)
  if (error) throw error
}

export async function setSkuActive(skuId: string, isActive: boolean): Promise<void> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('product_skus').update({ is_active: isActive }).eq('id', skuId)
  if (error) throw error
}

export async function deleteProduct(productId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  try {
    const { data: imgs } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', productId)
    const marker = '/storage/v1/object/public/product-images/'
    const paths = (imgs ?? [])
      .map((r: any) => {
        const url: string = r.url
        const idx = url.indexOf(marker)
        if (idx === -1) return null
        const raw = url.substring(idx + marker.length)
        const noQuery = raw.split('?')[0].split('#')[0]
        return decodeURIComponent(noQuery)
      })
      .filter((p: string | null): p is string => !!p)
    if (paths.length > 0) {
      await supabase.storage.from('product-images').remove(paths)
    }
  } catch {}
  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) throw error
}

// Add: batch operations for products
export async function setProductsPublished(productIds: string[], published: boolean): Promise<void> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  if (!productIds || productIds.length === 0) return
  const { error } = await supabase.from('products').update({ published }).in('id', productIds)
  if (error) throw error
}

export async function deleteProducts(productIds: string[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  if (!productIds || productIds.length === 0) return
  try {
    const { data: imgs } = await supabase
      .from('product_images')
      .select('url')
      .in('product_id', productIds)
    const marker = '/storage/v1/object/public/product-images/'
    const paths = (imgs ?? [])
      .map((r: any) => {
        const url: string = r.url
        const idx = url.indexOf(marker)
        if (idx === -1) return null
        const raw = url.substring(idx + marker.length)
        const noQuery = raw.split('?')[0].split('#')[0]
        return decodeURIComponent(noQuery)
      })
      .filter((p: string | null): p is string => !!p)
    if (paths.length > 0) {
      await supabase.storage.from('product-images').remove(paths)
    }
  } catch {}
  const { error } = await supabase.from('products').delete().in('id', productIds)
  if (error) throw error
} 

// Add: delete a variant by id
export async function deleteVariant(variantId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('product_variants').delete().eq('id', variantId)
  if (error) throw error
} 