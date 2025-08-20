import 'dotenv/config'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'
import mime from 'mime-types'

// Types for CSV rows
interface CsvRow {
  brand: string
  category: string
  family?: string
  model?: string
  variant?: string
  title: string
  description?: string
  published?: string
  condition?: 'new' | 'second_hand'
  storage?: string
  color?: string
  ram?: string
  connectivity?: string
  currency?: string
  base_price: string
  discount_percent?: string
  discount_amount?: string
  quantity: string
  images?: string
}

interface SkuInput {
  condition: 'new' | 'second_hand'
  attributes: Record<string, any>
  is_active: boolean
  price: { currency: string; base_price: number; discount_percent?: number | null; discount_amount?: number | null }
  inventory: { quantity: number }
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function parseBoolean(value: any, defaultValue = false): boolean {
  if (value == null) return defaultValue
  const s = String(value).trim().toLowerCase()
  return s === 'true' || s === '1' || s === 'yes' || s === 'y'
}

function parseNumber(value: any, defaultValue: number | null = null): number | null {
  if (value == null || String(value).trim() === '') return defaultValue
  const n = Number(String(value).replace(/[,\s]/g, ''))
  if (Number.isNaN(n)) return defaultValue
  return n
}

function normalizeDelimiter(list: string | undefined | null): string[] {
  if (!list) return []
  // Accept | ; , as separators
  return list
    .split(/\s*[|;,]\s*/g)
    .map(s => s.trim())
    .filter(Boolean)
}

function toSkuAttributes(row: CsvRow): Record<string, any> {
  const attrs: Record<string, any> = {}
  if (row.storage) attrs.storage = row.storage
  if (row.color) attrs.color = row.color
  if (row.ram) attrs.ram = row.ram
  if (row.connectivity) attrs.connectivity = row.connectivity
  return attrs
}

function generateProductPublicId(input: { family?: string | null; model?: string | null; variant?: string | null; title: string }): string {
  const parts = [input.family || '', input.model || '', input.variant || '', input.title]
    .filter(Boolean)
    .join(' ')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return parts.slice(0, 60)
}

function generateSkuCode(input: { productPublicId: string; condition: 'new' | 'second_hand'; attributes: Record<string, any> }): string {
  const attrs: string[] = []
  if (input.attributes.storage) attrs.push(String(input.attributes.storage))
  if (input.attributes.ram) attrs.push(String(input.attributes.ram))
  if (input.attributes.color) attrs.push(String(input.attributes.color))
  if ((input.attributes as any).chip_tier) attrs.push(String((input.attributes as any).chip_tier))
  if (input.attributes.connectivity) attrs.push(String(input.attributes.connectivity))
  const suffix = attrs.filter(Boolean).join('-').toUpperCase().replace(/[^A-Z0-9]+/g, '-')
  const base = `${input.productPublicId}-${input.condition === 'second_hand' ? 'USED' : 'NEW'}`
  const code = suffix ? `${base}-${suffix}` : base
  return code.slice(0, 80)
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function getOrCreateByName(
  supabase: SupabaseClient,
  table: 'brands' | 'categories',
  name: string
): Promise<string> {
  const slug = slugify(name)
  const { data: found, error: findErr } = await supabase
    .from(table)
    .select('id')
    .or(`slug.eq.${slug},name.eq.${name}`)
    .maybeSingle()
  if (findErr) throw findErr
  if (found?.id) return found.id as string

  const { data: created, error: insErr } = await supabase
    .from(table)
    .insert({ name, slug })
    .select('id')
    .single()
  if (insErr) throw insErr
  return (created as any).id as string
}

type ProductGroupKey = string

function makeProductKey(row: CsvRow): ProductGroupKey {
  return [row.brand, row.category, row.family || '', row.model || '', row.variant || '', row.title].join('||')
}

function parseArgs(): { file: string; imagesDir?: string; dryRun: boolean } {
  const args = process.argv.slice(2)
  let file = ''
  let imagesDir: string | undefined
  let dryRun = false
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if ((a === '--file' || a === '-f') && i + 1 < args.length) {
      file = args[++i]
    } else if ((a === '--images-dir' || a === '-i') && i + 1 < args.length) {
      imagesDir = args[++i]
    } else if (a === '--dry-run') {
      dryRun = true
    }
  }
  if (!file) {
    throw new Error('Usage: tsx scripts/import-products.ts --file <path-to-csv> [--images-dir <folder>] [--dry-run]')
  }
  return { file, imagesDir, dryRun }
}

async function uploadLocalImageAndGetUrl(
  supabase: SupabaseClient,
  localPath: string,
  imagesDir?: string
): Promise<string> {
  const absolutePath = path.isAbsolute(localPath)
    ? localPath
    : path.join(imagesDir || process.cwd(), localPath)
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Image not found: ${absolutePath}`)
  }
  const fileBuffer = fs.readFileSync(absolutePath)
  const ext = path.extname(absolutePath)
  const contentType = (mime.lookup(ext) || 'application/octet-stream') as string
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const storagePath = `products/${fileName}`
  const { error: upErr } = await supabase.storage.from('product-images').upload(storagePath, fileBuffer, {
    contentType,
    upsert: false,
  })
  if (upErr) throw upErr
  const { data } = supabase.storage.from('product-images').getPublicUrl(storagePath)
  return data.publicUrl
}

async function insertProduct(
  supabase: SupabaseClient,
  input: {
    brand_id: string
    category_id: string
    family?: string | null
    model?: string | null
    variant?: string | null
    title: string
    description?: string | null
    published: boolean
    images: { url: string; is_primary?: boolean; sort_order?: number }[]
  }
): Promise<string> {
  const productPublicId = generateProductPublicId({
    family: input.family ?? null,
    model: input.model ?? null,
    variant: input.variant ?? null,
    title: input.title,
  })

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
  if (productErr) throw productErr

  const productId = (product as any).id as string

  if (input.images && input.images.length > 0) {
    const { error: imgErr } = await supabase.from('product_images').insert(
      input.images.map((im, idx) => ({
        product_id: productId,
        url: im.url,
        is_primary: im.is_primary ?? idx === 0,
        sort_order: im.sort_order ?? idx,
      }))
    )
    if (imgErr) throw imgErr
  }

  return productId
}

async function insertSkuCascade(
  supabase: SupabaseClient,
  productId: string,
  skuInput: SkuInput,
  productPublicId: string
): Promise<string> {
  const skuCode = generateSkuCode({
    productPublicId,
    condition: skuInput.condition,
    attributes: skuInput.attributes,
  })

  const { data: sku, error: skuErr } = await supabase
    .from('product_skus')
    .insert({
      product_id: productId,
      condition: skuInput.condition,
      attributes: skuInput.attributes,
      is_active: skuInput.is_active,
      sku_code: skuCode,
    })
    .select('id')
    .single()
  if (skuErr) throw skuErr

  const skuId = (sku as any).id as string

  const { error: priceErr } = await supabase.from('sku_prices').insert({
    sku_id: skuId,
    currency: skuInput.price.currency,
    base_price: skuInput.price.base_price,
    discount_percent: skuInput.price.discount_percent ?? null,
    discount_amount: skuInput.price.discount_amount ?? null,
  })
  if (priceErr) throw priceErr

  const { error: invErr } = await supabase.from('sku_inventory').insert({
    sku_id: skuId,
    quantity: skuInput.inventory.quantity,
  })
  if (invErr) throw invErr

  return skuId
}

async function main() {
  const { file, imagesDir, dryRun } = parseArgs()

  let supabase: SupabaseClient | null = null
  if (!dryRun) {
    const supabaseUrl = requireEnv('SUPABASE_URL')
    const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
    supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })
  }

  if (!fs.existsSync(file)) {
    throw new Error(`CSV file not found: ${file}`)
  }

  const csvContent = fs.readFileSync(file, 'utf-8')
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[]

  if (rows.length === 0) {
    console.log('No rows found in CSV.')
    return
  }

  // Group by product
  const groups = new Map<ProductGroupKey, CsvRow[]>()
  for (const row of rows) {
    const key = makeProductKey(row)
    const arr = groups.get(key) || []
    arr.push(row)
    groups.set(key, arr)
  }

  console.log(`Found ${groups.size} products from ${rows.length} CSV rows`) 

  let createdProducts = 0
  let createdSkus = 0

  for (const [, groupRows] of groups.entries()) {
    const first = groupRows[0]

    let brandId: string
    let categoryId: string
    if (dryRun) {
      brandId = 'DRYRUN_BRAND'
      categoryId = 'DRYRUN_CATEGORY'
    } else {
      brandId = await getOrCreateByName(supabase!, 'brands', first.brand)
      categoryId = await getOrCreateByName(supabase!, 'categories', first.category)
    }

    const published = parseBoolean(first.published, false)

    // Prepare images
    const imageItems = normalizeDelimiter(first.images)
    const imageRecords: { url: string; is_primary?: boolean; sort_order?: number }[] = []

    for (let i = 0; i < imageItems.length; i++) {
      const raw = imageItems[i]
      let url = raw
      if (!/^https?:\/\//i.test(raw)) {
        if (dryRun) {
          url = `DRYRUN://${raw}`
        } else {
          url = await uploadLocalImageAndGetUrl(supabase!, raw, imagesDir)
        }
      }
      imageRecords.push({ url, is_primary: i === 0, sort_order: i })
    }

    const productInput = {
      brand_id: brandId,
      category_id: categoryId,
      family: first.family || null,
      model: first.model || null,
      variant: first.variant || null,
      title: first.title,
      description: first.description || null,
      published,
      images: imageRecords,
    }

    const productPublicId = generateProductPublicId({
      family: productInput.family,
      model: productInput.model,
      variant: productInput.variant,
      title: productInput.title,
    })

    let productId: string
    if (dryRun) {
      productId = 'DRYRUN_PRODUCT_ID'
    } else {
      productId = await insertProduct(supabase!, productInput)
      createdProducts++
    }

    for (const row of groupRows) {
      const skuInput: SkuInput = {
        condition: (row.condition || 'new') as 'new' | 'second_hand',
        attributes: toSkuAttributes(row),
        is_active: true,
        price: {
          currency: (row.currency || 'USD').toUpperCase(),
          base_price: parseNumber(row.base_price, 0) || 0,
          discount_percent: parseNumber(row.discount_percent ?? null, null),
          discount_amount: parseNumber(row.discount_amount ?? null, null),
        },
        inventory: { quantity: parseNumber(row.quantity, 0) || 0 },
      }

      if (dryRun) {
        createdSkus++
        continue
      }

      await insertSkuCascade(supabase!, productId, skuInput, productPublicId)
      createdSkus++
    }

    console.log(`Imported product: ${first.title} (${groupRows.length} SKU${groupRows.length > 1 ? 's' : ''})`)
  }

  console.log(`\nDone. Created ${createdProducts} products and ${createdSkus} SKUs.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
}) 