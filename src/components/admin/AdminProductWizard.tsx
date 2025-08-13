import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import AdminSelect, { AdminSelectOption } from './AdminSelect'

type Step = 1 | 2

type Condition = 'new' | 'second_hand' | null

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
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false)

  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [presetStorages, setPresetStorages] = useState<string[] | null>(null)
  const [presetColors, setPresetColors] = useState<string[] | null>(null)

  // New state for proper line/model structure
  const [productLines, setProductLines] = useState<{ value: string; label: string }[]>([])
  const [selectedLine, setSelectedLine] = useState<string>('')

  const [condition, setCondition] = useState<Condition>(null)
  const [brandId, setBrandId] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [modelId, setModelId] = useState<string>('')
  const [variantId, setVariantId] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [published, setPublished] = useState<boolean>(false)

  const [storage, setStorage] = useState<string>('')
  const [color, setColor] = useState<string>('')
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
  const modelName = useMemo(() => models.find(m=>m.id===modelId)?.name || '', [models, modelId])
  const variantName = useMemo(() => variants.find(v=>v.id===variantId)?.name || '', [variants, variantId])

  const titleSuggestion = useMemo(() => {
    const parts = [brandName, selectedLine, modelName, variantName, storage]
    const base = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
    const conditionLabel = condition === 'second_hand' ? 'Second‑hand' : condition === 'new' ? 'New' : ''
    if (!base) return ''
    // Simple SEO-friendly suggestion
    const suffix = conditionLabel ? ` – ${conditionLabel}` : ''
    return `${base}${suffix} | Best Price in ${currency}`
  }, [brandName, selectedLine, modelName, variantName, storage, condition, currency])

  // Derive parsed colors from presets or defaults for rendering and selection
  const availableColors = useMemo(() => {
    const source = (presetColors ?? defaultColors)
    return source.map(parseColorToken)
  }, [presetColors])

  const previewCard = useMemo(() => ({
    id: 'preview',
    category: selectedLine || 'Product',
    name: title || 'New Product',
    image: images[0]?.url || '/hero/blue gradient electronic sale promotion banner.webp',
    colors: color ? [color] : [],
    priceFrom: `$${Number(basePrice || '0').toFixed(2)}`,
    monthlyFrom: `$${(Number(basePrice || '0')/24).toFixed(2)}/mo. for 24 mo.`,
  }), [selectedLine, title, images, color, basePrice])

  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0)
  useEffect(() => {
    // Reset to first image when image list changes
    setPreviewImageIndex(0)
  }, [images])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)

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

  // Auto-derive category based on selected line (Apple product)
  function computeCategoryForLine(lineName: string): { slug: string; name: string } | null {
    const n = lineName.toLowerCase()
    if (!n) return null
    if (n.includes('iphone')) return { slug: 'phones', name: 'Phones' }
    if (n.includes('ipad')) return { slug: 'tablets', name: 'Tablets' }
    if (n.includes('macbook') || n.includes('mac')) return { slug: 'laptops', name: 'Laptops' }
    if (n.includes('imac') || n.includes('mac mini') || n.includes('mac studio')) return { slug: 'desktops', name: 'Desktops' }
    if (n.includes('watch')) return { slug: 'wearables', name: 'Wearables' }
    if (n.includes('airpods')) return { slug: 'audio', name: 'Audio' }
    if (n.includes('tv')) return { slug: 'tv', name: 'TV' }
    if (n.includes('homepod')) return { slug: 'smart-home', name: 'Smart Home' }
    return { slug: 'accessories', name: 'Accessories' }
  }

  // Create product lines from families data
  useEffect(() => {
    if (families.length === 0) return
    
    // Group families by main product line
    const lineMap = new Map<string, string[]>()
    
    families.forEach(family => {
      const familyName = family.name.toLowerCase()
      let mainLine = ''
      
      if (familyName.includes('ipad')) {
        mainLine = 'iPad'
      } else if (familyName.includes('iphone')) {
        mainLine = 'iPhone'
      } else if (familyName.includes('macbook') || familyName.includes('mac')) {
        mainLine = 'Mac'
      } else if (familyName.includes('watch')) {
        mainLine = 'Apple Watch'
      } else if (familyName.includes('airpods')) {
        mainLine = 'AirPods'
      } else {
        mainLine = family.name // For other products
      }
      
      if (!lineMap.has(mainLine)) {
        lineMap.set(mainLine, [])
      }
      lineMap.get(mainLine)!.push(family.id)
    })
    
    const lines = Array.from(lineMap.keys()).map(line => ({
      value: line,
      label: line
    }))
    
    setProductLines(lines)
  }, [families])

  // Filter models based on selected line
  const availableModels = useMemo(() => {
    if (!selectedLine || families.length === 0) return []
    
    const lineFamilies = families.filter(family => {
      const familyName = family.name.toLowerCase()
      const lineName = selectedLine.toLowerCase()
      
      if (lineName === 'ipad') {
        return familyName.includes('ipad')
      } else if (lineName === 'iphone') {
        return familyName.includes('iphone')
      } else if (lineName === 'mac') {
        return familyName.includes('macbook') || familyName.includes('mac')
      } else if (lineName === 'apple watch') {
        return familyName.includes('watch')
      } else if (lineName === 'airpods') {
        return familyName.includes('airpods')
      }
      
      return family.name === selectedLine
    })
    
    return lineFamilies
  }, [selectedLine, families])

  // Load families when brand changes
  useEffect(() => {
    setFamilies([]); setSelectedLine('')
    setModels([]); setModelId('')
    setVariants([]); setVariantId('')
    // Reset option-related selections when brand changes
    setStorage('')
    setColor('')
    setColorName('')
    if (!brandId || !isSupabaseConfigured) return
    ;(async ()=>{
      try {
        const fams = await listFamilies(brandId)
        setFamilies(fams)
      } catch (e:any) { setError(e.message) }
    })()
  }, [brandId])

  // Load models when line changes
  useEffect(() => {
    setModels([]); setModelId('')
    setVariants([]); setVariantId('')
    // Also reset option selections when line changes
    setStorage('')
    setColor('')
    setColorName('')
    if (!selectedLine || !isSupabaseConfigured) return
    
    // Get all models from families in the selected line
    const lineFamilyIds = availableModels.map(f => f.id)
    if (lineFamilyIds.length === 0) return
    
    ;(async ()=>{
      try {
        // Fetch models for all families in the selected line
        const allModels = await Promise.all(
          lineFamilyIds.map(familyId => listModels(familyId))
        )
        const flattenedModels = allModels.flat()
        setModels(flattenedModels)
      } catch (e:any) { setError(e.message) }
    })()
  }, [selectedLine, availableModels])

  // Update category when line changes
  useEffect(() => {
    // Clear category when line cleared
    if (!selectedLine) { setCategoryId(''); return }
    
    const mapping = computeCategoryForLine(selectedLine)
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
  }, [selectedLine, categories])

  // Additionally clear selection-dependent inputs
  useEffect(() => { setVariantId('') }, [modelId])
  useEffect(() => { setModelId(''); setVariantId('') }, [selectedLine])
  useEffect(() => { /* already cleared above on brand change */ }, [brandId])

  // Load variants when model changes
  useEffect(() => {
    setVariants([]); setVariantId('')
    // Reset storage/color when model changes
    setStorage('')
    setColor('')
    setColorName('')
    if (!modelId || !isSupabaseConfigured) return
    ;(async ()=>{
      try {
        const vs = await listVariants(modelId)
        setVariants(vs)
      } catch (e:any) { setError(e.message) }
    })()
  }, [modelId])

  // Clear storage/color when variant changes too
  useEffect(() => {
    if (!variantId) return
    setStorage('')
    setColor('')
    setColorName('')
  }, [variantId])

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
          } else {
            setPresetStorages(null)
            setPresetColors(null)
          }
        }
        if (modelId) {
          const preset = await getOptionPresetForModel(modelId)
          if (preset) {
            setPresetStorages(preset.storages ?? null)
            setPresetColors(preset.colors ?? null)
          } else {
            setPresetStorages(null)
            setPresetColors(null)
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
      // Note: This will trigger the useEffect that updates productLines
    } catch (e:any) { setError(e.message) }
  }

  const addModelInline = async () => {
    if (!selectedLine) { alert('Select a line first'); return }
    const name = prompt('New model name')?.trim()
    if (!name) return
    try {
      // For now, we'll need to select a family first, but this could be improved
      alert('Please select a specific model from the dropdown first, then add variants')
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
        condition && brandId && selectedLine && categoryId &&
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
        family: selectedLine || null,
        model: modelName || null,
        variant: variantName || null,
        title,
        description: null,
        published,
        images: images.map((im, i) => ({ url: im.url, is_primary: i === 0 })),
        sku: {
          condition: (condition as 'new'|'second_hand'),
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
      setShowSuccessModal(true)
      if (onSaved) onSaved()
      resetForm()
      // auto hide success after 2.5s
      setTimeout(()=> setSuccess(null), 2500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setError(null)
    setSuccess(null)
    setCondition(null)
    setBrandId('')
    setCategoryId('')
    setSelectedLine('')
    setModelId('')
    setVariantId('')
    setTitle('')
    setPublished(false)
    setStorage('')
    setColor('')
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
    setPresetStorages(null)
    setPresetColors(null)
  }

  return (
    <div className={`rounded-2xl bg-white/5 border relative ${condition === 'new' ? 'border-emerald-500/40' : condition === 'second_hand' ? 'border-rose-500/40' : 'border-white/10'}`}>
      {/* toast (suppressed when modal is open) */}
      {success && !showSuccessModal && (
        <div className="absolute top-2 right-2 z-10 px-3 py-2 rounded-md bg-emerald-500 text-black text-xs shadow">
          {success}
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold">Add Product</h2>
        <div className="text-xs text-white/60">{step === 1 ? 'Build' : 'Preview'}</div>
      </div>

      {error && (
        <div className="m-4 p-3 text-sm rounded-lg bg-red-500/10 border border-red-400/20 text-red-200">{error}</div>
      )}
      {success && !showSuccessModal && (
        <div className="m-4 p-3 text-sm rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-200">{success}</div>
      )}

      <div className="p-4 space-y-4">
        {/* Condition toggle - only on step 1 */}
        {step === 1 && (
          <div className="space-y-2">
            <div className="text-sm text-white/80">Condition</div>
            <div className={`inline-flex rounded-lg border ${condition==='new' ? 'border-emerald-500/40' : condition==='second_hand' ? 'border-rose-500/40' : 'border-white/10'}`}>
              <button
                type="button"
                onClick={() => setCondition('new')}
                className={`px-4 py-2 text-sm rounded-l-lg border-r ${condition==='new' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/0 text-white/80 border-white/10 hover:bg-white/5'}`}
              >
                New
              </button>
              <button
                type="button"
                onClick={() => setCondition('second_hand')}
                className={`px-4 py-2 text-sm rounded-r-lg ${condition==='second_hand' ? 'bg-rose-500 text-black border-rose-400' : 'bg-white/0 text-white/80 hover:bg-white/5'}`}
                style={{ borderLeftWidth: 0, borderColor: condition==='second_hand' ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.1)' }}
              >
                Second‑hand
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-white/60">Brand</label>
              <AdminSelect
                disabled={!condition}
                value={brandId}
                onChange={setBrandId}
                placeholder={condition ? 'Select brand' : 'Select condition first'}
                options={brands.map(b => ({ value: b.id, label: b.name })) as AdminSelectOption[]}
              />
            </div>
            <div>
              <label className="text-xs text-white/60">Line</label>
              <AdminSelect
                disabled={!brandId}
                value={selectedLine}
                onChange={setSelectedLine}
                placeholder={brandId ? 'Select line' : 'Select brand first'}
                options={productLines}
              />
            </div>
            <div>
              <label className="text-xs text-white/60">Model</label>
              <AdminSelect
                disabled={!selectedLine}
                value={modelId}
                onChange={setModelId}
                placeholder={selectedLine ? 'Select model' : 'Select line first'}
                options={models.map(m => ({ value: m.id, label: m.name + (m.release_year ? ` — ${m.release_year}` : '') })) as AdminSelectOption[]}
              />
            </div>
            <div>
              <label className="text-xs text-white/60">Variant</label>
              <AdminSelect
                disabled={!modelId}
                value={variantId}
                onChange={setVariantId}
                placeholder={modelId ? 'Select variant' : 'Select model first'}
                options={variants.map(v => ({ value: v.id, label: v.name })) as AdminSelectOption[]}
              />
            </div>
            <div>
              <label className="text-xs text-white/60">Storage</label>
              <AdminSelect
                disabled={!modelId}
                value={storage}
                onChange={setStorage}
                placeholder={modelId ? 'Select storage' : 'Select model first'}
                options={(presetStorages ?? defaultStorages).map(s => ({ value: s, label: s }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/60">Color</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {availableColors.map(({ name, hex }) => (
                  <div key={name + hex} className="relative group">
                    <button
                      className={`h-8 w-8 rounded-full border ${color===hex?'ring-2 ring-white':''} ${!modelId ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: hex }}
                      onClick={() => { if (!modelId) return; setColor(hex); setColorName(name) }}
                    />
                    {/* Enhanced tooltip showing color name */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {name || hex}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Title moved below Storage/Color */}
            <div className="md:col-span-4">
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
            <div>
              <label className="text-xs text-white/60">Currency</label>
              <input className="w-full bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm" value={currency} onChange={e=>setCurrency(e.target.value)} />
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
            <div className="md:col-span-4">
              <label className="text-xs text-white/60">Images</label>
              <div
                className={`mt-2 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/20'}`}
                onDragOver={(e)=>{ e.preventDefault(); setIsDragging(true) }}
                onDragLeave={()=> setIsDragging(false)}
                onDrop={(e)=>{ e.preventDefault(); setIsDragging(false); const f=e.dataTransfer.files; if (f && f.length) handleUploadImages(f) }}
                onClick={()=> fileInputRef.current?.click()}
              >
                <div className="text-xs text-white/70">Drag & drop images here, or click to browse</div>
              </div>
              <input ref={fileInputRef} type="file" multiple onChange={e=>handleUploadImages(e.target.files)} className="hidden" />
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
              <div className="md:col-span-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-white/60 mb-2">Second‑hand Details</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-white/60">Grade</label>
                    <AdminSelect
                      value={secondHandGrade}
                      onChange={(v)=>setSecondHandGrade(v as any)}
                      options={[{value:'A',label:'A'},{value:'B',label:'B'},{value:'C',label:'C'}]}
                    />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-white/80 mb-1.5">Preview</div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="text-xs text-white/60">{previewCard.category}</div>
                <div className="font-semibold mt-0.5 text-sm md:text-base">{previewCard.name}</div>
                <div className="mt-2">
                  <img
                    src={(images[previewImageIndex]?.url) || previewCard.image}
                    className="rounded-lg w-full h-44 object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {images.map((im, idx) => (
                      <button
                        key={idx}
                        className={`h-14 w-14 flex-shrink-0 rounded-md border ${idx===previewImageIndex? 'ring-2 ring-white border-white' : 'border-white/10'}`}
                        onClick={()=> setPreviewImageIndex(idx)}
                      >
                        <img src={im.url} className="h-full w-full object-cover rounded-md" />
                      </button>
                    ))}
                  </div>
                )}
                {previewCard.colors.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {previewCard.colors.map((c,i)=> (
                      <div key={i} className="w-4 h-4 rounded-full border" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}
                <div className="text-sm mt-2">From {previewCard.priceFrom}</div>
                <div className="text-xs text-white/60">or {previewCard.monthlyFrom}</div>
              </div>
            </div>
            <div className="self-start">
              <div className="text-sm text-white/80 mb-1.5">Summary</div>
              <ul className="text-xs text-white/80 space-y-1">
                <li>Brand: {brandName || '-'}</li>
                <li>Category: {categories.find(c=>c.id===categoryId)?.name || '-'}</li>
                <li>Line/Model/Variant: {[selectedLine, modelName, variantName].filter(Boolean).join(' / ') || '-'}</li>
                <li>Attributes: Storage {storage}, Color {color}</li>
                <li>Price: {currency} {basePrice} {discountPercent && `(−${discountPercent}%)`} {discountAmount && `(−${discountAmount})`}</li>
                <li>Quantity: {quantity}</li>
                <li>Images: {images.length}</li>
                <li>Title: {title || titleSuggestion || '-'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
        <div className="text-xs text-white/50">{!isSupabaseConfigured ? 'Supabase not configured; wizard UI only' : loading ? 'Working...' : ''}</div>
        <div className="flex gap-2">
          <button type="button" className="text-xs px-3 py-1.5 rounded-lg bg-white/0 hover:bg-white/10 border border-white/10" onClick={resetForm} disabled={loading}>Clear</button>
          {step>1 && <button className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10" onClick={()=>setStep(1)} disabled={loading}>Back</button>}
          {step<2 && <button disabled={!canNext() || loading} className={`text-xs px-3 py-1.5 rounded-lg border ${canNext() && !loading?'bg-white text-black border-white':'bg-white/10 border-white/10 text-white/40'}`} onClick={()=>setStep(2)}>Preview</button>}
          {step===2 && <button disabled={loading || !isSupabaseConfigured} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black" onClick={onSave}>Save Product</button>}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-black border border-white/10 p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-7.378 7.377a1 1 0 01-1.415 0L3.296 9.768a1 1 0 111.415-1.415l3.2 3.2 6.67-6.67a1 1 0 011.415 0z" clipRule="evenodd"/></svg>
              <div className="font-semibold">Success</div>
            </div>
            <div className="text-sm text-white/80 mb-4">Product has been saved{published ? ' and published' : ''} successfully.</div>
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-lg bg-white text-black border border-white"
                onClick={() => { setShowSuccessModal(false); setSuccess(null) }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProductWizard 