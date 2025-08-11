import React, { useEffect, useMemo, useState } from 'react'
import {
  listBrands,
  listCategories,
  createBrand,
  createCategory,
  createProductWithSku,
  Brand,
  Category,
  listFamilies,
  createFamily,
  listModels,
  createModel,
  listVariants,
  createVariant,
  Family,
  Model,
  Variant,
  getOptionPresetForModel,
  getOptionPresetForVariant,
  createSecondHandItem,
} from '../../lib/db'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

type Step = 1 | 2

type Condition = 'new' | 'second_hand'

const defaultColors = ['#000000', '#ffffff', '#1c1c1e', '#f5f5f7', '#7d7e80', '#bfd0dd', '#e3ccb4']
const defaultStorages = ['64GB','128GB','256GB','512GB','1TB']

// Helper to parse color tokens from presets: "Name|#HEX" or just "#HEX"/name
function parseColorToken(token: string): { name: string; hex: string } {
  if (!token) return { name: '', hex: '#000000' }
  const parts = token.split('|')
  if (parts.length === 2) {
    return { name: parts[0], hex: parts[1] }
  }
  const isHex = /^#?[0-9a-fA-F]{3,8}$/.test(token)
  return isHex
    ? { name: token.toUpperCase(), hex: token.startsWith('#') ? token : `#${token}` }
    : { name: token, hex: '#000000' }
}

type Props = { onSaved?: () => void }

const AdminProductWizard: React.FC<Props> = ({ onSaved }) => {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [presetStorages, setPresetStorages] = useState<string[] | null>(null)
  const [presetColors, setPresetColors] = useState<string[] | null>(null)

  const [condition, setCondition] = useState<Condition>('new')
  const [brandId, setBrandId] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [familyId, setFamilyId] = useState<string>('')
  const [modelId, setModelId] = useState<string>('')
  const [variantId, setVariantId] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [published, setPublished] = useState<boolean>(false)

  const [storage, setStorage] = useState<string>('128GB')
  const [color, setColor] = useState<string>('#1c1c1e')
  const [colorName, setColorName] = useState<string>('')

  const [basePrice, setBasePrice] = useState<string>('999')
  const [currency, setCurrency] = useState<string>('USD')
  const [discountPercent, setDiscountPercent] = useState<string>('')
  const [discountAmount, setDiscountAmount] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('10')

  const [images, setImages] = useState<{ url: string; is_primary?: boolean }[]>([])

  const [secondHandGrade, setSecondHandGrade] = useState<'A'|'B'|'C'>('A')
  const [secondHandBatteryHealth, setSecondHandBatteryHealth] = useState<string>('')
  const [secondHandSerial, setSecondHandSerial] = useState<string>('')
  const [secondHandNotes, setSecondHandNotes] = useState<string>('')

  const brandName = useMemo(() => brands.find(b=>b.id===brandId)?.name || '', [brands, brandId])
  const familyName = useMemo(() => families.find(f=>f.id===familyId)?.name || '', [families, familyId])
  const modelName = useMemo(() => models.find(m=>m.id===modelId)?.name || '', [models, modelId])
  const variantName = useMemo(() => variants.find(v=>v.id===variantId)?.name || '', [variants, variantId])

  const titleSuggestion = useMemo(() => {
    const parts = [brandName, familyName, modelName, variantName, storage]
    const base = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
    const conditionLabel = condition === 'second_hand' ? 'Second‑hand' : 'New'
    if (!base) return ''
    // Simple SEO-friendly suggestion
    return `${base} – ${conditionLabel} | Best Price in ${currency}`
  }, [brandName, familyName, modelName, variantName, storage, condition, currency])

  // Derive parsed colors from presets or defaults for rendering and selection
  const availableColors = useMemo(() => {
    const source = (presetColors ?? defaultColors)
    return source.map(parseColorToken)
  }, [presetColors])

  const previewCard = useMemo(() => ({
    id: 'preview',
    category: familyName || 'Product',
    name: title || 'New Product',
    image: images[0]?.url || '/hero/blue gradient electronic sale promotion banner.webp',
    colors: [color],
    priceFrom: `$${Number(basePrice || '0').toFixed(2)}`,
    monthlyFrom: `$${(Number(basePrice || '0')/24).toFixed(2)}/mo. for 24 mo.`,
  }), [familyName, title, images, color, basePrice])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    ;(async () => {
      try {
        const [b, c] = await Promise.all([listBrands(), listCategories()])
        setBrands(b)
        setCategories(c)
      } catch (e: any) {
        setError(e.message)
      }
    })()
  }, [])

  // Auto-derive category based on selected family (Apple product)
  function computeCategoryForFamily(famName: string): { slug: string; name: string } | null {
    const n = famName.toLowerCase()
    if (!n) return null
    if (n.includes('iphone')) return { slug: 'phones', name: 'Phones' }
    if (n.includes('ipad')) return { slug: 'tablets', name: 'Tablets' }
    if (n.includes('macbook')) return { slug: 'laptops', name: 'Laptops' }
    if (n.includes('imac') || n.includes('mac mini') || n.includes('mac studio')) return { slug: 'desktops', name: 'Desktops' }
    if (n.includes('watch')) return { slug: 'wearables', name: 'Wearables' }
    if (n.includes('airpods')) return { slug: 'audio', name: 'Audio' }
    if (n.includes('tv')) return { slug: 'tv', name: 'TV' }
    if (n.includes('homepod')) return { slug: 'smart-home', name: 'Smart Home' }
    return { slug: 'accessories', name: 'Accessories' }
  }

  useEffect(() => {
    // Clear category when family cleared
    if (!familyId) { setCategoryId(''); return }
    const fam = families.find(f => f.id === familyId)
    const mapping = computeCategoryForFamily(fam?.name || '')
    if (!mapping) return
    const existing = categories.find(c => c.slug.toLowerCase() === mapping.slug)
    if (existing) {
      setCategoryId(existing.id)
    } else {
      ;(async () => {
        try {
          const created = await createCategory(mapping.name)
          setCategories(prev => [...prev, created])
          setCategoryId(created.id)
        } catch {}
      })()
    }
  }, [familyId, families, categories])

  // Load families when brand changes
  useEffect(() => {
    setFamilies([]); setFamilyId('')
    setModels([]); setModelId('')
    setVariants([]); setVariantId('')
    if (!brandId || !isSupabaseConfigured) return
    ;(async ()=>{
      try {
        const fams = await listFamilies(brandId)
        setFamilies(fams)
      } catch (e:any) { setError(e.message) }
    })()
  }, [brandId])

  // Additionally clear selection-dependent inputs
  useEffect(() => { setVariantId('') }, [modelId])
  useEffect(() => { setModelId(''); setVariantId('') }, [familyId])
  useEffect(() => { /* already cleared above on brand change */ }, [brandId])

  // Load models when family changes
  useEffect(() => {
    setModels([]); setModelId('')
    setVariants([]); setVariantId('')
    if (!familyId || !isSupabaseConfigured) return
    ;(async ()=>{
      try {
        const ms = await listModels(familyId)
        setModels(ms)
      } catch (e:any) { setError(e.message) }
    })()
  }, [familyId])

  // Load variants when model changes
  useEffect(() => {
    setVariants([]); setVariantId('')
    if (!modelId || !isSupabaseConfigured) return
    ;(async ()=>{
      try {
        const vs = await listVariants(modelId)
        setVariants(vs)
      } catch (e:any) { setError(e.message) }
    })()
  }, [modelId])

  // Load option presets when variant or model changes
  useEffect(() => {
    setPresetStorages(null)
    setPresetColors(null)
    if (!isSupabaseConfigured) return
    ;(async ()=>{
      try {
        if (variantId) {
          const preset = await getOptionPresetForVariant(variantId)
          if (preset) {
            setPresetStorages(preset.storages ?? null)
            setPresetColors(preset.colors ?? null)
            return
          }
        }
        if (modelId) {
          const preset = await getOptionPresetForModel(modelId)
          if (preset) {
            setPresetStorages(preset.storages ?? null)
            setPresetColors(preset.colors ?? null)
          }
        }
      } catch (e:any) { /* non-fatal */ }
    })()
  }, [variantId, modelId])

  const handleUploadImages = async (files: FileList | null) => {
    if (!files || !supabase) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const uploaded: { url: string }[] = []
      for (const file of Array.from(files)) {
        const path = `products/${Date.now()}-${file.name}`
        const { error: upErr } = await supabase.storage
          .from('product-images')
          .upload(path, file, { upsert: false })
        if (upErr) throw upErr
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        uploaded.push({ url: data.publicUrl })
      }
      setImages(prev => [...prev, ...uploaded])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const addBrandInline = async () => {
    const name = prompt('New brand name')?.trim()
    if (!name) return
    try {
      const b = await createBrand(name)
      setBrands(prev => [...prev, b])
      setBrandId(b.id)
    } catch (e: any) { setError(e.message) }
  }

  const addCategoryInline = async () => {
    const name = prompt('New category name')?.trim()
    if (!name) return
    try {
      const c = await createCategory(name)
      setCategories(prev => [...prev, c])
      setCategoryId(c.id)
    } catch (e: any) { setError(e.message) }
  }

  const addFamilyInline = async () => {
    if (!brandId) { alert('Select a brand first'); return }
    const name = prompt('New family name')?.trim()
    if (!name) return
    try {
      const f = await createFamily(brandId, name)
      setFamilies(prev => [...prev, f])
      setFamilyId(f.id)
    } catch (e:any) { setError(e.message) }
  }

  const addModelInline = async () => {
    if (!familyId) { alert('Select a family first'); return }
    const name = prompt('New model name')?.trim()
    if (!name) return
    try {
      const m = await createModel(familyId, name)
      setModels(prev => [...prev, m])
      setModelId(m.id)
    } catch (e:any) { setError(e.message) }
  }

  const addVariantInline = async () => {
    if (!modelId) { alert('Select a model first'); return }
    const name = prompt('New variant name')?.trim()
    if (!name) return
    try {
      const v = await createVariant(modelId, name)
      setVariants(prev => [...prev, v])
      setVariantId(v.id)
    } catch (e:any) { setError(e.message) }
  }

  const canNext = () => {
    if (step === 1) {
      return Boolean(
        brandId && categoryId &&
        storage && color &&
        basePrice && quantity &&
        images.length > 0
      )
    }
    return true
  }

  const onSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const { product_id, sku_id } = await createProductWithSku({
        brand_id: brandId,
        category_id: categoryId,
        family: familyName || null,
        model: modelName || null,
        variant: variantName || null,
        title,
        description: description || null,
        published,
        images: images.map((im, i) => ({ url: im.url, is_primary: i === 0 })),
        sku: {
          condition,
          attributes: { storage, color, ...(colorName ? { color_name: colorName } : {}) },
          price: {
            currency,
            base_price: Number(basePrice),
            discount_percent: discountPercent ? Number(discountPercent) : null,
            discount_amount: discountAmount ? Number(discountAmount) : null,
          },
          inventory: { quantity: Number(quantity) },
        },
      })

      // If second-hand, optionally create an initial unique unit
      if (condition === 'second_hand') {
        await createSecondHandItem({
          sku_id,
          grade: secondHandGrade,
          serial_number: secondHandSerial || null,
          battery_health: secondHandBatteryHealth ? Number(secondHandBatteryHealth) : null,
          included_accessories: null,
          notes: secondHandNotes || null,
          price_override: null,
        })
      }

      setSuccess('Product saved successfully.')
      if (onSaved) onSaved()
      // reset minimal form state
      setStep(1)
      setCondition('new')
      setBrandId('')
      setCategoryId('')
      setFamilyId('')
      setModelId('')
      setVariantId('')
      setTitle('')
      setDescription('')
      setPublished(false)
      setStorage('128GB')
      setColor('#1c1c1e')
      setColorName('')
      setBasePrice('999')
      setCurrency('USD')
      setDiscountPercent('')
      setDiscountAmount('')
      setQuantity('10')
      setImages([])
      setSecondHandGrade('A')
      setSecondHandBatteryHealth('')
      setSecondHandSerial('')
      setSecondHandNotes('')
      // auto hide success after 2.5s
      setTimeout(()=> setSuccess(null), 2500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 relative">
      {/* toast */}
      {success && (
        <div className="absolute top-2 right-2 z-10 px-3 py-2 rounded-md bg-emerald-500 text-black text-xs shadow">
          {success}
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold">Add Product</h2>
        <div className="text-xs text-white/60">{step === 1 ? 'Build' : 'Preview & Publish'}</div>
      </div>

      {error && (
        <div className="m-4 p-3 text-sm rounded-lg bg-red-500/10 border border-red-400/20 text-red-200">{error}</div>
      )}
      {success && (
        <div className="m-4 p-3 text-sm rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-200">{success}</div>
      )}

      <div className="p-4 space-y-6">
        {/* Condition toggle - always visible */}
        <div className="space-y-2">
          <div className="text-sm text-white/80">Condition</div>
          <div className="flex gap-3">
            {(['new','second_hand'] as Condition[]).map(c => (
              <button key={c}
                className={`px-3 py-2 rounded-lg border ${condition===c? 'bg-white text-black border-white':'bg-white/0 text-white/80 border-white/10'}`}
                onClick={() => setCondition(c)}>
                {c === 'new' ? 'New' : 'Second‑hand'}
              </button>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60">Brand</label>
              <div className="flex gap-2 mt-1">
                <select className="flex-1 bg-white text-black border border-white/10 rounded-lg px-3 py-2 text-sm" value={brandId} onChange={e=>setBrandId(e.target.value)}>
                  <option value="">Select brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button className="text-xs px-2 rounded-md bg-white/10 border border-white/10" onClick={addBrandInline}>+ New</button>
              </div>
            </div>
            {/* Removed Category manual selection; it is auto-set from family */}
            <div>
              <label className="text-xs text-white/60">Product line (family)</label>
              <div className="flex gap-2 mt-1">
                <select disabled={!brandId} className="flex-1 disabled:opacity-50 bg-white text-black border border-white/10 rounded-lg px-3 py-2 text-sm" value={familyId} onChange={e=>setFamilyId(e.target.value)}>
                  <option value="">{brandId ? 'Select product line' : 'Select brand first'}</option>
                  {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <button className="text-xs px-2 rounded-md bg-white/10 border border-white/10" onClick={addFamilyInline}>+ New</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60">Model</label>
              <div className="flex gap-2 mt-1">
                <select disabled={!familyId} className="flex-1 disabled:opacity-50 bg-white text-black border border-white/10 rounded-lg px-3 py-2 text-sm" value={modelId} onChange={e=>setModelId(e.target.value)}>
                  <option value="">{familyId ? 'Select model' : 'Select product line first'}</option>
                  {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button className="text-xs px-2 rounded-md bg-white/10 border border-white/10" onClick={addModelInline}>+ New</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60">Variant</label>
              <div className="flex gap-2 mt-1">
                <select disabled={!modelId} className="flex-1 disabled:opacity-50 bg-white text-black border border-white/10 rounded-lg px-3 py-2 text-sm" value={variantId} onChange={e=>setVariantId(e.target.value)}>
                  <option value="">{modelId ? 'Select variant' : 'Select model first'}</option>
                  {variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <button className="text-xs px-2 rounded-md bg-white/10 border border-white/10" onClick={addVariantInline}>+ New</button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/60">Title</label>
              <div className="flex gap-2 items-center mt-1">
                <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Product title shown to users" />
                {titleSuggestion && (
                  <button type="button" className="text-xs px-2 py-1 rounded-md bg-white/10 border border-white/10" onClick={()=>setTitle(titleSuggestion)}>Use suggestion</button>
                )}
              </div>
              {titleSuggestion && (
                <div className="text-xs text-white/50 mt-1">Suggested: {titleSuggestion}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/60">Description</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description" />
            </div>
            <div>
              <label className="text-xs text-white/60">Storage</label>
              <select className="w-full bg-white text-black border border-white/10 rounded-lg px-3 py-2 text-sm" value={storage} onChange={e=>setStorage(e.target.value)}>
                {(presetStorages ?? defaultStorages).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60">Color</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {availableColors.map(({ name, hex }) => (
                  <button
                    key={name + hex}
                    className={`h-8 w-8 rounded-full border ${color===hex?'ring-2 ring-white':''}`}
                    style={{ backgroundColor: hex }}
                    title={name || hex}
                    onClick={() => { setColor(hex); setColorName(name) }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60">Currency</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={currency} onChange={e=>setCurrency(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/60">Base Price</label>
              <input type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={basePrice} onChange={e=>setBasePrice(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/60">Quantity</label>
              <input type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={quantity} onChange={e=>setQuantity(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/60">Discount % (optional)</label>
              <input type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={discountPercent} onChange={e=>setDiscountPercent(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/60">Discount Amount (optional)</label>
              <input type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={discountAmount} onChange={e=>setDiscountAmount(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/60">Images</label>
              <input type="file" multiple onChange={e=>handleUploadImages(e.target.files)} className="block mt-2 text-sm" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {images.map((im, idx) => (
                  <div key={idx} className="relative">
                    <img src={im.url} className="w-full h-32 object-cover rounded-lg border border-white/10" />
                    <button className={`absolute top-2 left-2 text-[10px] px-2 py-1 rounded ${idx===0?'bg-white text-black':'bg-white/10 border border-white/20'}`} onClick={()=>{
                      const arr=[...images];
                      const [chosen]=arr.splice(idx,1)
                      arr.unshift(chosen)
                      setImages(arr)
                    }}>Primary</button>
                  </div>
                ))}
              </div>
            </div>

            {condition === 'second_hand' && (
              <div className="md:col-span-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-white/60 mb-2">Second‑hand Details</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-white/60">Grade</label>
                    <select className="w-full bg-white text-black border border-white/10 rounded-lg px-3 py-2 text-sm" value={secondHandGrade} onChange={e=>setSecondHandGrade(e.target.value as any)}>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/60">Battery Health %</label>
                    <input type="number" min="0" max="100" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={secondHandBatteryHealth} onChange={e=>setSecondHandBatteryHealth(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-white/60">Serial Number</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={secondHandSerial} onChange={e=>setSecondHandSerial(e.target.value)} />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs text-white/60">Notes</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={secondHandNotes} onChange={e=>setSecondHandNotes(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-white/80 mb-2">Preview Card</div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-xs text-white/60">{previewCard.category}</div>
                <div className="font-semibold mt-1">{previewCard.name}</div>
                <img src={previewCard.image} className="mt-4 rounded-lg w-full h-40 object-cover" />
                <div className="flex gap-2 mt-4">
                  {previewCard.colors.map((c,i)=> (
                    <div key={i} className="w-4 h-4 rounded-full border" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="text-sm mt-3">From {previewCard.priceFrom}</div>
                <div className="text-xs text-white/60">or {previewCard.monthlyFrom}</div>
              </div>
            </div>
            <div className="self-start">
              <div className="text-sm text-white/80 mb-2">Summary</div>
              <ul className="text-sm text-white/80 space-y-1">
                <li>Type: {condition}</li>
                <li>Brand: {brandName || '-'}</li>
                <li>Category: {categories.find(c=>c.id===categoryId)?.name || '-'}</li>
                <li>Family/Model/Variant: {[familyName, modelName, variantName].filter(Boolean).join(' / ') || '-'}</li>
                <li>Attributes: Storage {storage}, Color {color}</li>
                <li>Price: {currency} {basePrice} {discountPercent && `(−${discountPercent}%)`} {discountAmount && `(−${discountAmount})`}</li>
                <li>Quantity: {quantity}</li>
                <li>Images: {images.length}</li>
                <li>Title: {title || titleSuggestion || '-'}</li>
                <li>Description: {description || '-'}</li>
              </ul>
              <div className="mt-3">
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" className="accent-white" checked={published} onChange={e=>setPublished(e.target.checked)} /> Publish on save</label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
        <div className="text-xs text-white/50">{!isSupabaseConfigured ? 'Supabase not configured; wizard UI only' : loading ? 'Working...' : ''}</div>
        <div className="flex gap-2">
          {step>1 && <button className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10" onClick={()=>setStep(1)}>Back</button>}
          {step<2 && <button disabled={!canNext()} className={`text-xs px-3 py-1.5 rounded-lg border ${canNext()?'bg-white text-black border-white':'bg-white/10 border-white/10 text-white/40'}`} onClick={()=>setStep(2)}>Preview</button>}
          {step===2 && <button disabled={loading || !isSupabaseConfigured} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black" onClick={onSave}>Save Product</button>}
        </div>
      </div>
    </div>
  )
}

export default AdminProductWizard 