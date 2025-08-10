import React, { useEffect, useMemo, useState } from 'react'
import { listBrands, listCategories, createBrand, createCategory, createProductWithSku, Brand, Category } from '../../lib/db'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

type Step = 1 | 2 | 3 | 4 | 5 | 6

type Condition = 'new' | 'second_hand'

const defaultColors = ['#000000', '#ffffff', '#1c1c1e', '#f5f5f7', '#7d7e80', '#bfd0dd', '#e3ccb4']
const defaultStorages = ['64GB','128GB','256GB','512GB','1TB']

type Props = { onSaved?: () => void }

const AdminProductWizard: React.FC<Props> = ({ onSaved }) => {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [condition, setCondition] = useState<Condition>('new')
  const [brandId, setBrandId] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [family, setFamily] = useState<string>('iPhone')
  const [model, setModel] = useState<string>('')
  const [variant, setVariant] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [published, setPublished] = useState<boolean>(false)

  const [storage, setStorage] = useState<string>('128GB')
  const [color, setColor] = useState<string>('#1c1c1e')

  const [basePrice, setBasePrice] = useState<string>('999')
  const [currency, setCurrency] = useState<string>('USD')
  const [discountPercent, setDiscountPercent] = useState<string>('')
  const [discountAmount, setDiscountAmount] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('10')

  const [images, setImages] = useState<{ url: string; is_primary?: boolean }[]>([])

  const previewCard = useMemo(() => ({
    id: 'preview',
    category: family || 'Product',
    name: title || 'New Product',
    image: images[0]?.url || '/hero/blue gradient electronic sale promotion banner.webp',
    colors: [color],
    priceFrom: `$${Number(basePrice || '0').toFixed(2)}`,
    monthlyFrom: `$${(Number(basePrice || '0')/24).toFixed(2)}/mo. for 24 mo.`,
  }), [family, title, images, color, basePrice])

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

  const canNext = () => {
    if (step === 1) return true
    if (step === 2) return Boolean(brandId && categoryId && title)
    if (step === 3) return Boolean(storage && color)
    if (step === 4) return Boolean(basePrice && quantity)
    if (step === 5) return images.length > 0
    return true
  }

  const onSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await createProductWithSku({
        brand_id: brandId,
        category_id: categoryId,
        family: family || null,
        model: model || null,
        variant: variant || null,
        title,
        description: description || null,
        published,
        images: images.map((im, i) => ({ url: im.url, is_primary: i === 0 })),
        sku: {
          condition,
          attributes: { storage, color },
          price: {
            currency,
            base_price: Number(basePrice),
            discount_percent: discountPercent ? Number(discountPercent) : null,
            discount_amount: discountAmount ? Number(discountAmount) : null,
          },
          inventory: { quantity: Number(quantity) },
        },
      })
      setSuccess('Product saved successfully.')
      if (onSaved) onSaved()
      setStep(6)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold">Add Product Wizard</h2>
        <div className="text-xs text-white/60">Step {step} / 6</div>
      </div>

      {error && (
        <div className="m-4 p-3 text-sm rounded-lg bg-red-500/10 border border-red-400/20 text-red-200">{error}</div>
      )}
      {success && (
        <div className="m-4 p-3 text-sm rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-200">{success}</div>
      )}

      <div className="p-4 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-sm text-white/80">Product Type</div>
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
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60">Brand</label>
              <div className="flex gap-2 mt-1">
                <select className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={brandId} onChange={e=>setBrandId(e.target.value)}>
                  <option value="">Select brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button className="text-xs px-2 rounded-md bg-white/10 border border-white/10" onClick={addBrandInline}>+ New</button>
              </div>
            </div>
            <div>
              <label className="text-xs text.white/60">Category</label>
              <div className="flex gap-2 mt-1">
                <select className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button className="text-xs px-2 rounded-md bg-white/10 border border-white/10" onClick={addCategoryInline}>+ New</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60">Family</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={family} onChange={e=>setFamily(e.target.value)} placeholder="e.g., iPhone" />
            </div>
            <div>
              <label className="text-xs text-white/60">Model</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={model} onChange={e=>setModel(e.target.value)} placeholder="e.g., 13" />
            </div>
            <div>
              <label className="text-xs text-white/60">Variant</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={variant} onChange={e=>setVariant(e.target.value)} placeholder="e.g., Pro Max" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/60">Title</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Product title shown to users" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-white/60">Description</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Short description" />
            </div>
            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" className="accent-white" checked={published} onChange={e=>setPublished(e.target.checked)} /> Publish now</label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60">Storage</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" value={storage} onChange={e=>setStorage(e.target.value)}>
                {defaultStorages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/60">Color</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {defaultColors.map(c => (
                  <button key={c} className={`h-8 w-8 rounded-full border ${color===c?'ring-2 ring-white':''}`} style={{ backgroundColor: c }} onClick={()=>setColor(c)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/60">Upload Images</label>
              <input type="file" multiple onChange={e=>handleUploadImages(e.target.files)} className="block mt-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        )}

        {step === 6 && (
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
                <li>Brand: {brands.find(b=>b.id===brandId)?.name || '-'}</li>
                <li>Category: {categories.find(c=>c.id===categoryId)?.name || '-'}</li>
                <li>Family/Model/Variant: {[family, model, variant].filter(Boolean).join(' / ') || '-'}</li>
                <li>Attributes: Storage {storage}, Color {color}</li>
                <li>Price: {currency} {basePrice} {discountPercent && `(−${discountPercent}%)`} {discountAmount && `(−${discountAmount})`}</li>
                <li>Quantity: {quantity}</li>
                <li>Images: {images.length}</li>
                <li>Published: {published ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
        <div className="text-xs text-white/50">{!isSupabaseConfigured ? 'Supabase not configured; wizard UI only' : loading ? 'Working...' : ''}</div>
        <div className="flex gap-2">
          {step>1 && <button className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10" onClick={()=>setStep((s)=> (Math.max(1, s-1) as Step))}>Back</button>}
          {step<6 && <button disabled={!canNext()} className={`text-xs px-3 py-1.5 rounded-lg border ${canNext()?'bg-white text-black border-white':'bg-white/10 border-white/10 text-white/40'}`} onClick={()=>setStep((s)=> (Math.min(6, s+1) as Step))}>Next</button>}
          {step===6 && <button disabled={loading || !isSupabaseConfigured} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black" onClick={onSave}>Save Product</button>}
        </div>
      </div>
    </div>
  )
}

export default AdminProductWizard 