import React, { useCallback, useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'
import { listBrands, listCategories, createBrand, createCategory, createProductWithSkus, NewProductWithSkusInput } from '../../lib/db'

function splitMulti(list: string | undefined | null): string[] {
  if (!list) return []
  return list.split(/\s*[|;,]\s*/g).map(s => s.trim()).filter(Boolean)
}

async function getOrCreateBrandIdByName(name: string): Promise<string> {
  const brands = await listBrands()
  const found = brands.find(b => b.name.toLowerCase() === name.toLowerCase())
  if (found) return found.id
  const created = await createBrand(name)
  return created.id
}

async function getOrCreateCategoryIdByName(name: string): Promise<string> {
  const cats = await listCategories()
  const found = cats.find(c => c.name.toLowerCase() === name.toLowerCase())
  if (found) return found.id
  const created = await createCategory(name)
  return created.id
}

type CsvRow = {
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

function normalizePublicUrl(raw: string): string {
  if (/^https?:\/\//i.test(raw)) return raw
  return raw.startsWith('/') ? raw : `/${raw}`
}

const AdminCsvImporter: React.FC = () => {
  const [dragOver, setDragOver] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const onBrowse = () => fileInputRef.current?.click()

  const addLog = useCallback((line: string) => setLogs(prev => [...prev, line]), [])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setError(null)
    setLogs([])
    setWorking(true)
    try {
      const text = await file.text()
      const result = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim() })
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message)
      }
      const parsedData = (result.data || []) as CsvRow[]
      const rows = parsedData.filter((r: CsvRow) => r && r.title && r.brand && r.category && r.base_price && r.quantity)
      if (rows.length === 0) {
        addLog('No valid rows found in CSV.')
        setWorking(false)
        return
      }

      // Group rows by product identity
      const groups = new Map<string, CsvRow[]>()
      for (const row of rows) {
        const key = [row.brand, row.category, row.family || '', row.model || '', row.variant || '', row.title].join('||')
        const arr = groups.get(key) || []
        arr.push(row)
        groups.set(key, arr)
      }

      addLog(`Found ${groups.size} products from ${rows.length} rows`)

      for (const [, groupRows] of groups.entries()) {
        const first = groupRows[0]
        const brandId = await getOrCreateBrandIdByName(first.brand)
        const categoryId = await getOrCreateCategoryIdByName(first.category)

        const imageUrls = (first.images ? splitMulti(first.images) : []).map(normalizePublicUrl)
        const images = imageUrls.map((url, idx) => ({ url, is_primary: idx === 0, sort_order: idx }))

        const productInput: Omit<NewProductWithSkusInput, 'skus'> & { skus: NewProductWithSkusInput['skus'] } = {
          brand_id: brandId,
          category_id: categoryId,
          family: first.family || null,
          model: first.model || null,
          variant: first.variant || null,
          title: first.title,
          description: first.description || null,
          published: parseBoolean(first.published, true),
          images,
          skus: [],
        }

        for (const row of groupRows) {
          productInput.skus.push({
            condition: (row.condition || 'new') as 'new' | 'second_hand',
            attributes: {
              ...(row.storage ? { storage: row.storage } : {}),
              ...(row.color ? { color: row.color } : {}),
              ...(row.ram ? { ram: row.ram } : {}),
              ...(row.connectivity ? { connectivity: row.connectivity } : {}),
            },
            is_active: true,
            price: {
              currency: (row.currency || 'USD').toUpperCase(),
              base_price: parseNumber(row.base_price, 0) || 0,
              discount_percent: parseNumber(row.discount_percent ?? null, null) ?? undefined,
              discount_amount: parseNumber(row.discount_amount ?? null, null) ?? undefined,
            },
            inventory: { quantity: parseNumber(row.quantity, 0) || 0 },
          })
        }

        await createProductWithSkus(productInput)
        addLog(`Imported: ${first.title} (${groupRows.length} SKU${groupRows.length > 1 ? 's' : ''})`)
      }

      addLog('All done!')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setWorking(false)
    }
  }, [addLog])

  const onDrop = async (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault()
    setDragOver(false)
    await handleFiles(ev.dataTransfer.files)
  }

  const onSelectFile = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(ev.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const quickImports = useMemo(() => ([
    {
      title: 'iPhone 16 Pro Max 256GB - Natural Titanium',
      brand: 'Apple',
      category: 'Phones',
      family: 'iPhone',
      model: 'iPhone 16',
      variant: 'Pro Max',
      images: ['/Iphone_main/iphone_16pro_promax.jpg'],
      sku: {
        condition: 'new' as const,
        attributes: { storage: '256GB', color: 'Natural Titanium', connectivity: '5G' },
        price: { currency: 'USD', base_price: 1399 },
        inventory: { quantity: 5 },
      }
    },
    {
      title: 'iPhone 16 Plus 128GB - Blue',
      brand: 'Apple',
      category: 'Phones',
      family: 'iPhone',
      model: 'iPhone 16',
      variant: 'Plus',
      images: ['/Iphone_main/iphone_16_plus.jpg'],
      sku: {
        condition: 'new' as const,
        attributes: { storage: '128GB', color: 'Blue', connectivity: '5G' },
        price: { currency: 'USD', base_price: 999 },
        inventory: { quantity: 8 },
      }
    },
    {
      title: 'MacBook Pro 14" (M3) 16GB/512GB - Space Black',
      brand: 'Apple',
      category: 'Laptops',
      family: 'MacBook Pro',
      model: '14-inch',
      variant: null as string | null,
      images: ['/macbook_main/mac-card-40-macbookpro-14-16-202410.jpg'],
      sku: {
        condition: 'new' as const,
        attributes: { ram: '16GB', storage: '512GB', color: 'Space Black' },
        price: { currency: 'USD', base_price: 1999 },
        inventory: { quantity: 4 },
      }
    },
  ]), [])

  const doQuickImport = async () => {
    setError(null)
    setLogs([])
    setWorking(true)
    try {
      for (const item of quickImports) {
        const brandId = await getOrCreateBrandIdByName(item.brand)
        const categoryId = await getOrCreateCategoryIdByName(item.category)
        const images = item.images.map((u, idx) => ({ url: normalizePublicUrl(u), is_primary: idx === 0, sort_order: idx }))
        const input: NewProductWithSkusInput = {
          brand_id: brandId,
          category_id: categoryId,
          family: item.family,
          model: item.model,
          variant: item.variant,
          title: item.title,
          description: null,
          published: true,
          images,
          skus: [
            {
              condition: item.sku.condition,
              attributes: item.sku.attributes,
              is_active: true,
              price: item.sku.price,
              inventory: item.sku.inventory,
            }
          ],
        }
        await createProductWithSkus(input)
        addLog(`Imported sample: ${item.title}`)
      }
      addLog('Sample import completed!')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-white/60">Drop a CSV with columns like: brand,category,family,model,variant,title,description,published,condition,storage,color,ram,connectivity,currency,base_price,discount_percent,discount_amount,quantity,images</div>
      <div
        onDragOver={(e)=>{ e.preventDefault(); setDragOver(true) }}
        onDragLeave={()=>setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-xl border p-6 text-center ${dragOver ? 'border-white bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
      >
        <div className="text-sm">Drag & drop CSV here</div>
        <div className="text-xs text-white/60 mt-1">or</div>
        <button onClick={onBrowse} className="mt-2 text-xs px-3 py-1.5 rounded-md bg-white text-black">Browse CSV</button>
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={onSelectFile} hidden />
      </div>

      <div className="flex items-center gap-2">
        <button onClick={doQuickImport} disabled={working} className="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50">Quick import: public images</button>
      </div>

      {error && <div className="text-xs text-red-300">{error}</div>}
      <div className="rounded-md bg-black/40 border border-white/10 p-2 text-[11px] text-white/70 max-h-56 overflow-auto whitespace-pre-wrap">
        {logs.length ? logs.join('\n') : 'No logs yet.'}
      </div>
    </div>
  )
}

export default AdminCsvImporter 