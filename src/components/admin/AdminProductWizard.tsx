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
  createProductWithSkus,
} from '../../lib/db'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import AdminSelect, { AdminSelectOption } from './AdminSelect'
import { guessColorName, normalizeHex } from '../../lib/colorNames'
import ProductCard from '../ProductCard'
import { AppleProductTitle, Text, Label, ApplePrice, H3, Caption } from '../Typography'

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
  const [titleManuallyEdited, setTitleManuallyEdited] = useState<boolean>(false)

  const [storage, setStorage] = useState<string>('')
  const [color, setColor] = useState<string>('')
  const [colorName, setColorName] = useState<string>('')
  const [selectedStorages, setSelectedStorages] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [lastSelectedStorage, setLastSelectedStorage] = useState<string>('')
  const [lastSelectedColorHex, setLastSelectedColorHex] = useState<string>('')

  const [basePrice, setBasePrice] = useState<string>('999')
  const [currency, setCurrency] = useState<string>('USD')
  const [discountPercent, setDiscountPercent] = useState<string>('')
  const [discountAmount, setDiscountAmount] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('10')

  const [images, setImages] = useState<{ url: string; is_primary?: boolean; color?: string | null }[]>([])

  const [secondHandGrade, setSecondHandGrade] = useState<'A'|'B'|'C'>('A')
  const [secondHandBatteryHealth, setSecondHandBatteryHealth] = useState<string>('')
  const [secondHandSerial, setSecondHandSerial] = useState<string>('')
  const [secondHandNotes, setSecondHandNotes] = useState<string>('')

  const brandName = useMemo(() => brands.find(b=>b.id===brandId)?.name || '', [brands, brandId])
  const modelName = useMemo(() => models.find(m=>m.id===modelId)?.name || '', [models, modelId])
  const variantName = useMemo(() => variants.find(v=>v.id===variantId)?.name || '', [variants, variantId])

  // Derive parsed colors from presets or defaults for rendering and selection
  const availableColors = useMemo(() => {
    const source = (presetColors ?? defaultColors)
    return source.map(parseColorToken).map(({ name, hex }) => {
      const normalized = normalizeHex(hex)
      const finalName = name && name !== hex ? name : (guessColorName(normalized) || normalized)
      return { name: finalName, hex: normalized }
    })
  }, [presetColors])

  const colorLabelByHex = useMemo(() => {
    const map: Record<string, string> = {}
    for (const { name, hex } of availableColors) {
      if (name && name !== hex) map[hex] = name
    }
    return map
  }, [availableColors])

  // Simple, user-facing title suggestion: Model, Storage, Color
  const simpleTitleSuggestion = useMemo(() => {
    const baseParts = [modelName, variantName].filter(Boolean)
    const baseName = (baseParts.length > 0 ? baseParts.join(' ') : [selectedLine, modelName, variantName].filter(Boolean).join(' ')).trim()
    if (!baseName) return ''

    const storageChoiceRaw = (lastSelectedStorage || selectedStorages[selectedStorages.length - 1] || storage || '').trim()
    const storageChoice = storageChoiceRaw.replace(/\s?(GB|TB)$/i, ' $1')
    const colorHex = (lastSelectedColorHex || selectedColors[selectedColors.length - 1] || color || '').trim()
    const colorLabel = colorHex ? (colorLabelByHex[colorHex] || guessColorName(colorHex) || colorHex) : ''

    if (storageChoice && colorLabel) return `${baseName}, ${storageChoice} ${colorLabel}`
    if (storageChoice) return `${baseName}, ${storageChoice}`
    if (colorLabel) return `${baseName}, ${colorLabel}`
    return baseName
  }, [modelName, variantName, selectedLine, lastSelectedStorage, selectedStorages, storage, lastSelectedColorHex, selectedColors, color, colorLabelByHex])

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

  // Keep single-value storage synced (for title suggestion compatibility)
  useEffect(() => {
    if (selectedStorages.length > 0) {
      setStorage(selectedStorages[0])
    } else if (storage) {
      setStorage('')
    }
  }, [selectedStorages])

  // Clear multi-selects when dependencies change
  useEffect(() => { setSelectedStorages([]); setSelectedColors([]); setLastSelectedStorage(''); setLastSelectedColorHex('') }, [brandId])
  useEffect(() => { setSelectedStorages([]); setSelectedColors([]); setLastSelectedStorage(''); setLastSelectedColorHex('') }, [selectedLine])
  useEffect(() => { setSelectedStorages([]); setSelectedColors([]); setLastSelectedStorage(''); setLastSelectedColorHex('') }, [modelId])
  useEffect(() => { setSelectedStorages([]); setSelectedColors([]); setLastSelectedStorage(''); setLastSelectedColorHex('') }, [variantId])

  // Auto-apply simple title unless user manually edits
  useEffect(() => {
    if (!titleManuallyEdited) {
      setTitle(simpleTitleSuggestion)
    }
  }, [simpleTitleSuggestion, titleManuallyEdited])

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
      setImages(prev => [...prev, ...uploaded.map(x => ({ url: x.url, color: null }))])
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
        (selectedStorages.length > 0) && (selectedColors.length > 0) &&
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
      const { product_id, sku_ids } = await createProductWithSkus({
        brand_id: brandId,
        category_id: categoryId,
        family: selectedLine || null,
        model: modelName || null,
        variant: variantName || null,
        title,
        description: null,
        published: true,
        images: images.map((im, i) => ({ url: im.url, is_primary: i === 0, color: im.color ?? null })),
        skus: selectedStorages.flatMap(s => selectedColors.map(c => ({
          condition: (condition as 'new'|'second_hand'),
          attributes: { storage: s, color: c, ...(colorLabelByHex[c] ? { color_name: colorLabelByHex[c] } : {}) },
          price: {
            currency,
            base_price: Number(basePrice),
            discount_percent: discountPercent ? Number(discountPercent) : null,
            discount_amount: discountAmount ? Number(discountAmount) : null,
          },
          inventory: { quantity: Number(quantity) },
        }))),
      })

      // If second-hand, optionally create an initial unique unit
      if (condition === 'second_hand') {
        const firstSku = sku_ids?.[0]
        if (firstSku) await createSecondHandItem({
          sku_id: firstSku,
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
    setTitleManuallyEdited(false)
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
    setSelectedStorages([])
    setSelectedColors([])
    setLastSelectedStorage('')
    setLastSelectedColorHex('')
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
              <label className="text-xs text-white/60">Storages</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {(presetStorages ?? defaultStorages).map((s: string) => {
                  const active = selectedStorages.includes(s)
                  return (
                    <button
                      type="button"
                      key={s}
                      disabled={!modelId}
                      onClick={() => {
                        if (!modelId) return
                        setSelectedStorages(prev => {
                          const wasActive = prev.includes(s)
                          let next: string[]
                          if (condition === 'second_hand') {
                            next = wasActive ? [] : [s]
                          } else {
                            next = wasActive ? prev.filter(x => x !== s) : [...prev, s]
                          }
                          setLastSelectedStorage(wasActive ? (next[0] || '') : s)
                          return next
                        })
                      }}
                      className={`px-3 py-1.5 rounded-md border text-xs ${active ? 'border-white bg-white text-black' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/60">Colors</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {availableColors.map(({ name, hex }) => {
                  const active = selectedColors.includes(hex)
                  return (
                    <div key={name + hex} className="relative group">
                      <button
                        className={`h-8 w-8 rounded-full border ${active?'ring-2 ring-white':''} ${!modelId ? 'opacity-40 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: hex }}
                        onClick={() => {
                          if (!modelId) return
                          setSelectedColors(prev => {
                            const wasActive = prev.includes(hex)
                            let next: string[]
                            if (condition === 'second_hand') {
                              next = wasActive ? [] : [hex]
                            } else {
                              next = wasActive ? prev.filter(x => x !== hex) : [...prev, hex]
                            }
                            setLastSelectedColorHex(wasActive ? (next[0] || '') : hex)
                            return next
                          })
                        }}
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {name || hex}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Title moved below Storage/Color */}
            <div className="md:col-span-4">
              <label className="text-xs text-white/60">Title</label>
              <div className="flex gap-2 items-center mt-1">
                <input className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={title} onChange={e=>{ setTitle(e.target.value); setTitleManuallyEdited(true) }} placeholder="e.g., iPhone 16 Plus, 512 GB Black" />
              </div>
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
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                    <div className="relative aspect-[4/5] bg-black/20 flex items-center justify-center">
                      <img src={im.url} className="w-full h-full object-contain" />
                      <button className={`absolute top-2 left-2 text-[10px] px-2 py-1 rounded ${idx===0?'bg-white text-black':'bg-white/10 border border-white/20'}`} onClick={()=>{
                        const arr=[...images];
                        const [chosen]=arr.splice(idx,1)
                        arr.unshift(chosen)
                        setImages(arr)
                      }}>Primary</button>
                    </div>
                    <div className="p-2">
                      <select
                        className="w-full text-[11px] bg-white/5 border border-white/15 rounded-md px-2 py-1"
                        value={im.color ?? ''}
                        onChange={e => {
                          const val = e.target.value || null
                          setImages(prev => prev.map((p,i) => i===idx ? { ...p, color: val } : p))
                        }}
                      >
                        <option value="">All colors</option>
                        {selectedColors.map((c: string) => (
                          <option key={c} value={c}>{colorLabelByHex[c] || c}</option>
                        ))}
                      </select>
                      <div className="mt-1 text-[10px] text-white/70 truncate" title={im.url}>
                        {(() => {
                          try {
                            const path = new URL(im.url).pathname
                            const base = path.split('/').pop() || ''
                            return base
                          } catch {
                            const raw = im.url.split('?')[0]
                            return (raw.split('/').pop() || im.url)
                          }
                        })()}
                      </div>
                    </div>
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
          <div className="space-y-6">
            {/* Enhanced Product Preview - Matching ProductPage Layout */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-sm text-white/80 mb-4">Product Preview</div>
              
              {/* Product Title Section */}
              <div className="mb-6">
                <AppleProductTitle size="sm" className="text-white">
                  {title || simpleTitleSuggestion || 'New Product'}
                </AppleProductTitle>
                <Text size="sm" color="tertiary" className="mt-1">
                  {selectedLine || categories.find(c=>c.id===categoryId)?.name || 'Product'}
                </Text>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left side - Product Images (9 columns) */}
                <div className="flex flex-col lg:col-span-9">
                  <div className="flex gap-4">
                    {/* Vertical thumbnails (desktop/tablet) */}
                    {images.length > 0 && (
                      <div className="hidden sm:flex sm:flex-col items-center gap-3 max-h-[520px]">
                        {/* Up arrow */}
                        {images.length > 6 && (
                          <button
                            type="button"
                            className="p-1.5 rounded-full bg-white/80 shadow hover:bg-white"
                            aria-label="Previous thumbnails"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-800">
                              <path fillRule="evenodd" d="M10 6l4 5H6l4-5z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        )}
                        
                        <div className="flex flex-col gap-3 overflow-hidden" style={{ maxHeight: '520px' }}>
                          {images.slice(0, 6).map((img, index) => (
                            <button
                              key={index}
                              onClick={() => setPreviewImageIndex(index)}
                              className={`rounded-md h-16 w-16 flex-shrink-0 overflow-hidden transition-all duration-300 ${
                                previewImageIndex === index 
                                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black/20' 
                                  : 'opacity-60 hover:opacity-100'
                              }`}
                              aria-label={`Thumbnail ${index + 1}`}
                            >
                              <img src={img.url} alt={`Product thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                        
                        {/* Down arrow */}
                        {images.length > 6 && (
                          <button
                            type="button"
                            className="p-1.5 rounded-full bg-white/80 shadow hover:bg-white"
                            aria-label="Next thumbnails"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-800">
                              <path fillRule="evenodd" d="M10 14l-4-5h8l-4 5z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Two large image containers */}
                    <div className="flex-1 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Left large container (current image) */}
                      <div className="relative flex items-center justify-center h-[520px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {images.length > 0 ? (
                          <img 
                            src={images[previewImageIndex]?.url || images[0]?.url} 
                            alt={title || simpleTitleSuggestion}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <Text color="tertiary">Image not available</Text>
                          </div>
                        )}

                        {images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPreviewImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow"
                            aria-label="Previous image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-800">
                              <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Right large container (next image) */}
                      <div className="relative flex items-center justify-center h-[520px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {images.length > 1 ? (
                          <img 
                            src={images[(previewImageIndex + 1) % images.length]?.url} 
                            alt={`${title || simpleTitleSuggestion} alt view`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <Text color="tertiary">Add more images to preview here</Text>
                          </div>
                        )}

                        {images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPreviewImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow"
                            aria-label="Next image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-800">
                              <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal thumbnails for mobile */}
                  {images.length > 1 && (
                    <div className="flex justify-center space-x-3 sm:hidden">
                      {images.slice(0, 5).map((img, index) => (
                        <button 
                          key={index}
                          onClick={() => setPreviewImageIndex(index)}
                          className={`rounded-md h-16 w-16 flex-shrink-0 overflow-hidden transition-all duration-300 ${
                            previewImageIndex === index 
                              ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black/20' 
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img.url} alt={`Product thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side - Product Details (3 columns) */}
                <div className="flex flex-col lg:col-span-3">
                  <div className="rounded-2xl border border-white/20 bg-white/10 shadow-sm p-6 space-y-8">
                    
                    {/* Color Selection */}
                    {selectedColors.length > 0 && (
                      <div>
                        <Label size="xs" transform="uppercase" color="tertiary" className="mb-4">Color</Label>
                        <div className="flex flex-wrap gap-3">
                          {selectedColors.map((colorHex, index) => (
                            <button
                              key={colorHex}
                              onClick={() => {
                                setLastSelectedColorHex(colorHex)
                                // Switch to corresponding image if available
                                const colorImage = images.findIndex(img => img.color === colorHex)
                                if (colorImage !== -1) setPreviewImageIndex(colorImage)
                              }}
                              className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${
                                lastSelectedColorHex === colorHex || (index === 0 && !lastSelectedColorHex)
                                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black/20' 
                                  : ''
                              }`}
                              title={colorLabelByHex[colorHex] || colorHex}
                            >
                              <span className="w-8 h-8 rounded-full" style={{backgroundColor: colorHex}}></span>
                            </button>
                          ))}
                        </div>
                        <Text size="sm" color="tertiary" className="mt-2">
                          {colorLabelByHex[lastSelectedColorHex] || colorLabelByHex[selectedColors[0]] || selectedColors[0] || 'Select a color'}
                        </Text>
                      </div>
                    )}

                    {/* Storage Selection */}
                    {selectedStorages.length > 0 && (
                      <div>
                        <Label size="xs" transform="uppercase" color="tertiary" className="mb-4">Storage</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedStorages.map((storageOption, index) => (
                            <button
                              key={storageOption}
                              onClick={() => setLastSelectedStorage(storageOption)}
                              className={`px-4 py-2 rounded-lg border transition-all ${
                                lastSelectedStorage === storageOption || (index === 0 && !lastSelectedStorage)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
                                  : 'border-white/20 text-white/70'
                              }`}
                            >
                              <div className="text-sm font-medium">{storageOption}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment Options */}
                    <div>
                      <Label size="xs" transform="uppercase" color="tertiary" className="mb-4">Payment Options</Label>
                      <div className="flex space-x-3 mb-8">
                        <button
                          className="flex-1 py-3 px-4 rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400"
                        >
                          <Text size="sm" weight="medium" color="accent" align="center">Full Payment</Text>
                        </button>
                        <button
                          className="flex-1 py-3 px-4 rounded-lg border border-white/20"
                        >
                          <Text size="sm" weight="normal" align="center" className="text-white/70">Nasiya</Text>
                        </button>
                      </div>

                      {/* Full Payment Display */}
                      <div className="mb-8">
                        <ApplePrice className="text-3xl text-white">
                          {currency === 'USD' ? '$' : currency}{Number(basePrice || '0').toFixed(2)}
                        </ApplePrice>
                        <Text size="sm" color="tertiary" className="mt-1">One-time payment</Text>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <Text size="sm" weight="medium" className="text-emerald-300">In Stock</Text>
                      </div>
                      <Text size="sm" color="tertiary">
                        {quantity || '0'} {condition === 'second_hand' ? 'refurbished unit' : 'new units'} available
                      </Text>
                      {condition === 'second_hand' && secondHandGrade && (
                        <Text size="sm" color="tertiary">
                          Grade: {secondHandGrade} • {secondHandBatteryHealth}% Battery
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-sm text-white/80 mb-4">Product Summary</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Brand:</span>
                      <span className="text-white">{brandName || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Category:</span>
                      <span className="text-white">{categories.find(c=>c.id===categoryId)?.name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Model:</span>
                      <span className="text-white">{[selectedLine, modelName, variantName].filter(Boolean).join(' ') || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Condition:</span>
                      <span className={`text-sm px-2 py-0.5 rounded ${condition === 'new' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                        {condition === 'new' ? 'New' : 'Refurbished'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Storage Options:</span>
                      <span className="text-white text-right">{selectedStorages.length ? selectedStorages.join(', ') : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Color Options:</span>
                      <span className="text-white text-right">{selectedColors.length ? selectedColors.map(c => colorLabelByHex[c] || c).join(', ') : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Images:</span>
                      <span className="text-white">{images.length} uploaded</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Stock:</span>
                      <span className="text-white">{quantity || '0'} units</span>
                    </div>
                  </div>
                </div>
              </div>
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
            <div className="text-sm text-white/80 mb-4">Product has been saved and published successfully.</div>
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