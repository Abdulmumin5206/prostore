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

export type NewProductInput = {
  brand_id: string
  category_id: string
  family?: string | null
  model?: string | null
  variant?: string | null
  title: string
  description?: string | null
  published: boolean
  images: { url: string; is_primary?: boolean; sort_order?: number }[]
  sku: {
    condition: 'new' | 'second_hand'
    attributes: Record<string, any>
    is_active?: boolean
    price: { currency?: string; base_price: number; discount_percent?: number | null; discount_amount?: number | null }
    inventory: { quantity: number }
  }
}

export async function createProductWithSku(input: NewProductInput): Promise<{ product_id: string; sku_id: string }>
{
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured')

  // Insert product
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
    })
    .select('id')
    .single()

  if (productErr || !product) throw productErr

  // Insert sku
  const { data: sku, error: skuErr } = await supabase
    .from('product_skus')
    .insert({
      product_id: product.id,
      condition: input.sku.condition,
      attributes: input.sku.attributes,
      is_active: input.sku.is_active ?? true,
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
      }))
    )
    if (imgErr) throw imgErr
  }

  return { product_id: product.id, sku_id: sku.id }
}

// Admin listing types
export type AdminProductSummary = {
  productId: string
  title: string
  published: boolean
  brandName?: string | null
  categoryName?: string | null
  primaryImage?: string | null
  skuId?: string | null
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
      title,
      published,
      brands!inner(name),
      categories!inner(name),
      product_skus(
        id,
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
    return {
      productId: row.id,
      title: row.title,
      published: row.published,
      brandName: row.brands?.name ?? null,
      categoryName: row.categories?.name ?? null,
      primaryImage: primary?.url ?? null,
      skuId: sku?.id ?? null,
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
  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) throw error
} 