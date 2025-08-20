import React, { useEffect, useState, useMemo } from 'react'
import {
  listBrands,
  listFamilies,
  listModels,
  listVariants,
  Brand,
  Family,
  Model,
  Variant,
  getOptionPresetForVariant,
  upsertOptionPresetForVariant,
  getModelContent,
  upsertModelContent,
} from '../../lib/db'
import { guessColorName, normalizeHex } from '../../lib/colorNames'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

const pill = 'px-2 py-1 rounded-md text-xs border transition-colors'

const Toast: React.FC<{ type: 'success' | 'error'; message: string; onClose: () => void }> = ({ type, message, onClose }) => (
  <div className={`fixed right-4 top-4 z-50 px-3 py-2 rounded-md text-xs shadow-lg border ${
    type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' : 'bg-red-500/20 text-red-200 border-red-500/40'
  }`}>
    <div className="flex items-center gap-2">
      <span>{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100">✕</button>
    </div>
  </div>
)

function parseColorToken(token: string): { name: string; hex: string } {
  if (!token) return { name: '', hex: '#000000' }
  const parts = token.split('|')
  if (parts.length === 2) {
    return { name: parts[0], hex: parts[1] }
  }
  // fallback: token might be just hex or name
  const isHex = /^#?[0-9a-fA-F]{3,8}$/.test(token)
  return isHex ? { name: token.toUpperCase(), hex: token.startsWith('#') ? token : `#${token}` } : { name: token, hex: '#000000' }
}

const VariantPresetEditor: React.FC<{ variantId: string }> = ({ variantId }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [colors, setColors] = useState<string[]>([])
  const [storages, setStorages] = useState<string[]>([])

  const fetchPreset = async () => {
    setError(null)
    try {
      const preset = await getOptionPresetForVariant(variantId)
      const c = preset?.colors ?? []
      const s = preset?.storages ?? []
      setColors(c)
      setStorages(s)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => { fetchPreset() }, [variantId])

  const parsedColors = colors.map(parseColorToken).map(({ name, hex }) => {
    const normalized = normalizeHex(hex)
    const finalName = name && name !== hex ? name : (guessColorName(normalized) || normalized)
    return { name: finalName, hex: normalized }
  })

  return (
    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 relative">
      {!loaded ? (
        <div className="text-xs text-white/60">Loading preset…</div>
      ) : (
        <>
          {error && <div className="text-xs text-red-300 mb-2">{error}</div>}
          <div className="text-xs text-white/60 mb-2">Variant Preset</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs mb-1 text-white/70">Colors</div>
              <div className="flex flex-wrap gap-2">
                {parsedColors.length ? parsedColors.map(({name, hex}) => (
                  <span key={name+hex} className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs border bg-white/10 border-white/20">
                    <span className="inline-block h-3 w-3 rounded-full border border-white/30" style={{ backgroundColor: hex }} />
                    <span className="truncate max-w-[160px]" title={`${name} ${hex}`}>{name}</span>
                    <span className="opacity-60">{hex.toUpperCase()}</span>
                  </span>
                )) : <span className="text-[10px] text-white/40">No colors</span>}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1 text-white/70">Storages</div>
              <div className="flex flex-wrap gap-2">
                {storages.length ? storages.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border bg-white/10 border-white/20">{s}</span>
                )) : <span className="text-[10px] text-white/40">No storages</span>}
              </div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-white/50">Read‑only. Presets come from SQL seeds.</div>
        </>
      )}
    </div>
  )
}

const VariantContentEditor: React.FC<{ brandName: string; familyName: string; modelName: string; variantName: string | null }> = ({ brandName, familyName, modelName, variantName }) => {
	const [description, setDescription] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [saving, setSaving] = useState<boolean>(false)
	const [saved, setSaved] = useState<boolean>(false)

	useEffect(() => {
		let mounted = true
		const fetchContent = async () => {
			if (!brandName || !familyName || !modelName) return
			setLoading(true)
			setError(null)
			setSaved(false)
			try {
				const content = await getModelContent({
					brand: brandName,
					family: familyName,
					model: modelName,
					variant: variantName && variantName.trim().length > 0 ? variantName : null,
				})
				if (!mounted) return
				setDescription((content?.description as string) || '')
			} catch (e: any) {
				if (!mounted) return
				setError(e.message)
			} finally {
				if (mounted) setLoading(false)
			}
		}
		fetchContent()
		return () => { mounted = false }
	}, [brandName, familyName, modelName, variantName])

	const handleSave = async () => {
		if (!brandName || !familyName || !modelName) return
		setSaving(true)
		setError(null)
		setSaved(false)
		try {
			await upsertModelContent({
				brand: brandName,
				family: familyName,
				model: modelName,
				variant: variantName && variantName.trim().length > 0 ? variantName : null,
				description: description || null,
			})
			setSaved(true)
		} catch (e: any) {
			setError(e.message)
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 relative">
			<div className="flex items-center justify-between">
				<div className="text-xs text-white/60 mb-2">Description ({variantName ? 'Variant' : 'Model'})</div>
				{saved && <span className="text-[11px] text-emerald-300">Saved</span>}
			</div>
			{loading ? (
				<div className="text-xs text-white/60">Loading description…</div>
			) : (
				<>
					{error && <div className="text-xs text-red-300 mb-2">{error}</div>}
					<textarea
						className="w-full min-h-[120px] p-2 rounded-md bg-white/10 border border-white/20 text-white text-xs"
						placeholder="Write a clear description for this model/variant…"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
					<div className="mt-2 flex items-center gap-2">
						<button
							onClick={handleSave}
							disabled={saving}
							className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${saving ? 'opacity-60 cursor-not-allowed bg-white/10 border-white/15' : 'bg-white/10 hover:bg-white/20 border-white/10'}`}
						>
							{saving ? 'Saving…' : 'Save Description'}
						</button>
						<span className="text-[11px] text-white/50">Applies to all products of this model/variant.</span>
					</div>
				</>
			)}
		</div>
	)
}

const VariantCharacteristicsEditor: React.FC<{ brandId: string | null; brandName: string; familyName: string; modelName: string; variantName: string | null }> = ({ brandId, brandName, familyName, modelName, variantName }) => {
  const [jsonText, setJsonText] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [saved, setSaved] = useState<boolean>(false)
  const [preservedDescription, setPreservedDescription] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchSpecs = async () => {
      if (!brandName || !familyName || !modelName) return
      setLoading(true)
      setError(null)
      setSaved(false)
      try {
        const content = await getModelContent({
          brand: brandName,
          family: familyName,
          model: modelName,
          variant: variantName && variantName.trim().length > 0 ? variantName : null,
        })
        if (!mounted) return
        setPreservedDescription((content?.description as string) || null)
        const specsObj = (content?.specs && typeof content.specs === 'object') ? content.specs as Record<string, any> : {}
        const hasKeys = specsObj && Object.keys(specsObj).length > 0
        setJsonText(hasKeys ? JSON.stringify(specsObj, null, 2) : '')
      } catch (e: any) {
        if (!mounted) return
        setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchSpecs()
    return () => { mounted = false }
  }, [brandName, familyName, modelName, variantName])

  const prefillFromAnyProduct = async () => {
    if (!isSupabaseConfigured || !supabase) return
    if (!brandId || !familyName || !modelName) return
    setError(null)
    try {
      let query = supabase
        .from('products')
        .select('specs')
        .eq('brand_id', brandId)
        .eq('family', familyName)
        .eq('model', modelName)
        .limit(1)
      if (variantName && variantName.trim().length > 0) {
        query = query.eq('variant', variantName)
      } else {
        query = query.is('variant', null)
      }
      const { data, error: selErr } = await query
      if (selErr) throw selErr
      const row = Array.isArray(data) && data.length > 0 ? data[0] as any : null
      const fallbackSpecs = row?.specs && typeof row.specs === 'object' ? row.specs : {}
      if (fallbackSpecs && Object.keys(fallbackSpecs).length > 0) {
        setJsonText(JSON.stringify(fallbackSpecs, null, 2))
      } else {
        setError('No existing characteristics found on a sample product.')
      }
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      let parsed: any = {}
      const trimmed = jsonText.trim()
      if (trimmed.length > 0) {
        try {
          parsed = JSON.parse(trimmed)
          if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Characteristics must be a JSON object (key-value map).')
          }
        } catch (e: any) {
          throw new Error('Invalid JSON. Please fix formatting before saving.')
        }
      }
      await upsertModelContent({
        brand: brandName,
        family: familyName,
        model: modelName,
        variant: variantName && variantName.trim().length > 0 ? variantName : null,
        description: preservedDescription ?? null,
        specs: parsed,
      })
      setSaved(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 relative">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/60 mb-2">Characteristics ({variantName ? 'Variant' : 'Model'})</div>
        {saved && <span className="text-[11px] text-emerald-300">Saved</span>}
      </div>
      {loading ? (
        <div className="text-xs text-white/60">Loading characteristics…</div>
      ) : (
        <>
          {error && <div className="text-xs text-red-300 mb-2">{error}</div>}
          <textarea
            className="w-full min-h-[180px] p-2 rounded-md bg-white/10 border border-white/20 text-white text-xs font-mono"
            placeholder='{"display":"6.1","chip":"A18","battery":"..."}'
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${saving ? 'opacity-60 cursor-not-allowed bg-white/10 border-white/15' : 'bg-white/10 hover:bg-white/20 border-white/10'}`}
            >
              {saving ? 'Saving…' : 'Save Characteristics'}
            </button>
            <button
              onClick={prefillFromAnyProduct}
              disabled={!brandId}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${!brandId ? 'opacity-60 cursor-not-allowed bg-white/10 border-white/15' : 'bg-white/10 hover:bg-white/20 border-white/10'}`}
            >
              Load from existing product
            </button>
            <span className="text-[11px] text-white/50">JSON object; existing description is preserved.</span>
          </div>
        </>
      )}
    </div>
  )
}

const VariantNasiyaEditor: React.FC<{ brandName: string; familyName: string; modelName: string; variantName: string | null }> = ({ brandName, familyName, modelName, variantName }) => {
  const [markup, setMarkup] = useState<number>(1.3)
  const [plansText, setPlansText] = useState<string>('6,12,24')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [saved, setSaved] = useState<boolean>(false)
  const [preservedDescription, setPreservedDescription] = useState<string | null>(null)
  const [preservedSpecs, setPreservedSpecs] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchNasiya = async () => {
      if (!brandName || !familyName || !modelName) return
      setLoading(true)
      setError(null)
      setSaved(false)
      try {
        const content = await getModelContent({
          brand: brandName,
          family: familyName,
          model: modelName,
          variant: variantName && variantName.trim().length > 0 ? variantName : null,
        })
        if (!mounted) return
        setPreservedDescription((content?.description as string) || null)
        setPreservedSpecs((content?.specs && typeof content.specs === 'object') ? content.specs as Record<string, any> : {})
        const n = (content?.nasiya && typeof content.nasiya === 'object') ? content.nasiya as any : {}
        if (typeof n.markup === 'number' && isFinite(n.markup) && n.markup > 0) setMarkup(n.markup)
        if (Array.isArray(n.plans) && n.plans.length > 0) setPlansText((n.plans as any[]).join(','))
      } catch (e: any) {
        if (!mounted) return
        setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchNasiya()
    return () => { mounted = false }
  }, [brandName, familyName, modelName, variantName])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const trimmed = String(plansText || '').trim()
      let plans: number[] = [6, 12, 24]
      if (trimmed.length > 0) {
        plans = trimmed.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isInteger(n) && n > 0)
        if (plans.length === 0) throw new Error('Plans must include at least one positive integer (e.g., 6,12,24).')
      }
      const mk = Number(markup)
      if (!isFinite(mk) || mk <= 1) throw new Error('Markup must be a number > 1 (e.g., 1.3 for +30%).')

      await upsertModelContent({
        brand: brandName,
        family: familyName,
        model: modelName,
        variant: variantName && variantName.trim().length > 0 ? variantName : null,
        description: preservedDescription ?? null,
        specs: preservedSpecs ?? {},
        nasiya: { markup: mk, plans },
      })
      setSaved(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 relative">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/60 mb-2">Nasiya Settings ({variantName ? 'Variant' : 'Model'})</div>
        {saved && <span className="text-[11px] text-emerald-300">Saved</span>}
      </div>
      {loading ? (
        <div className="text-xs text-white/60">Loading nasiya…</div>
      ) : (
        <>
          {error && <div className="text-xs text-red-300 mb-2">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-white/60 mb-1">Markup multiplier (e.g., 1.3 = +30%)</div>
              <input
                type="number"
                step="0.01"
                min="1.01"
                className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white text-xs"
                value={markup}
                onChange={(e) => setMarkup(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Allowed plans (comma-separated months)</div>
              <input
                type="text"
                className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white text-xs"
                value={plansText}
                onChange={(e) => setPlansText(e.target.value)}
                placeholder="6,12,24"
              />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${saving ? 'opacity-60 cursor-not-allowed bg-white/10 border-white/15' : 'bg-white/10 hover:bg-white/20 border-white/10'}`}
            >
              {saving ? 'Saving…' : 'Save Nasiya Settings'}
            </button>
            <span className="text-[11px] text-white/50">Description/specs preserved on save.</span>
          </div>
        </>
      )}
    </div>
  )
}

const AdminCatalogManager: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [families, setFamilies] = useState<Family[] | null>(null)
  const [models, setModels] = useState<Model[] | null>(null)
  const [variants, setVariants] = useState<Variant[] | null>(null)

  const [brandId, setBrandId] = useState<string | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [modelId, setModelId] = useState<string | null>(null)
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null)
  const [activeVariantName, setActiveVariantName] = useState<string | null>(null)
  // Removed model viewer; we only show the variant editor panel

  useEffect(() => {
    (async () => {
      const b = await listBrands()
      setBrands(b)
    })()
  }, [])

  // Group families by main product lines
  const groupedFamilies = useMemo(() => {
    if (!families) return null
    
    const groups = new Map<string, Family[]>()
    
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
        mainLine = 'Other'
      }
      
      if (!groups.has(mainLine)) {
        groups.set(mainLine, [])
      }
      groups.get(mainLine)!.push(family)
    })
    
    return Array.from(groups.entries()).map(([line, fams]) => ({
      line,
      families: fams
    }))
  }, [families])

  // Close editor when context changes
  useEffect(() => { setActiveVariantId(null); setActiveVariantName(null) }, [brandId])
  useEffect(() => { setActiveVariantId(null); setActiveVariantName(null) }, [familyId])
  useEffect(() => { setActiveVariantId(null); setActiveVariantName(null) }, [modelId])

  useEffect(() => {
    setFamilies(null); setModels(null); setVariants(null); setFamilyId(null); setModelId(null)
    if (!brandId) return
    ;(async () => {
      const f = await listFamilies(brandId)
      setFamilies(f)
    })()
  }, [brandId])

  useEffect(() => {
    setModels(null); setVariants(null); setModelId(null)
    if (!familyId) return
    ;(async () => {
      const m = await listModels(familyId)
      setModels(m)
    })()
  }, [familyId])

  useEffect(() => {
    setVariants(null)
    if (!modelId) return
    ;(async () => {
      const v = await listVariants(modelId)
      setVariants(v)
    })()
  }, [modelId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/60">Manage brands, families, models and variants. View variant presets (read‑only).</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs mb-2 text-white/60">Brands</div>
          <div className="space-y-1">
            {brands.map((b) => (
              <button key={b.id} onClick={()=>setBrandId(b.id)}
                      className={`w-full text-left ${pill} ${brandId===b.id? 'bg-white text-black border-white' : 'bg-white/0 text-white/80 hover:bg-white/10 border-white/10'}`}>{b.name}</button>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs mb-2 text-white/60">Product Lines</div>
          {!brandId && <div className="text-xs text-white/50">Select a brand</div>}
          {groupedFamilies && (
            <div className="space-y-2">
              {groupedFamilies.map(({ line, families: fams }) => (
                <div key={line} className="space-y-1">
                  <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{line}</div>
                  {fams.map((f) => (
                    <button key={f.id} onClick={()=>setFamilyId(f.id)}
                            className={`w-full text-left ${pill} ${familyId===f.id? 'bg-white text-black border-white' : 'bg-white/0 text-white/80 hover:bg-white/10 border-white/10'}`}>{f.name}</button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs mb-2 text-white/60">Models</div>
          {!familyId && <div className="text-xs text-white/50">Select a family</div>}
          {models && (
            <div className="space-y-1">
              {models.map((m) => (
                <button key={m.id} onClick={()=>{ setModelId(m.id); setActiveVariantId(null); setActiveVariantName(null) }}
                        className={`w-full text-left ${pill} ${modelId===m.id? 'bg-white text-black border-white' : 'bg-white/0 text-white/80 hover:bg-white/10 border-white/10'}`}>{m.name}</button>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs mb-2 text-white/60">Variants</div>
          {!modelId && <div className="text-xs text-white/50">Select a model</div>}
          {variants && (
            <div className="space-y-2">
              {variants.map((v) => (
                <div key={v.id} className="rounded-lg border border-white/10 flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors duration-200">
                  <span className="text-sm mr-3 flex-1 min-w-0 group relative">
                    <span className="block group-hover:text-white transition-colors duration-200">{v.name}</span>
                    {/* Tooltip for long names */}
                    {v.name.length > 30 && (
                      <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        {v.name}
                      </div>
                    )}
                  </span>
                  <button
                    onClick={() => { setActiveVariantId(v.id); setActiveVariantName(v.name) }}
                    className="text-xs px-2 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 transition-colors duration-200 flex-shrink-0"
                  >
                    {activeVariantId === v.id ? 'Viewing…' : 'View'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Bottom full-width viewer */}
      {activeVariantId && (
        <section className="rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold truncate">Editing Variant: {activeVariantName}</h3>
            <button onClick={() => { setActiveVariantId(null); setActiveVariantName(null) }}
                    className="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/10">Close</button>
          </div>
          <div className="p-4 space-y-4">
            <VariantPresetEditor variantId={activeVariantId} />

            {/* Description editor (model/variant content) */}
            <VariantContentEditor 
              brandName={brands.find(b => b.id === brandId)?.name || ''}
              familyName={families?.find(f => f.id === familyId!)?.name || ''}
              modelName={models?.find(m => m.id === modelId!)?.name || ''}
              variantName={activeVariantName || null}
            />

            {/* Characteristics (specs) editor */}
            <VariantCharacteristicsEditor
              brandId={brandId}
              brandName={brands.find(b => b.id === brandId)?.name || ''}
              familyName={families?.find(f => f.id === familyId!)?.name || ''}
              modelName={models?.find(m => m.id === modelId!)?.name || ''}
              variantName={activeVariantName || null}
            />

            {/* Nasiya settings editor */}
            <VariantNasiyaEditor
              brandName={brands.find(b => b.id === brandId)?.name || ''}
              familyName={families?.find(f => f.id === familyId!)?.name || ''}
              modelName={models?.find(m => m.id === modelId!)?.name || ''}
              variantName={activeVariantName || null}
            />
          </div>
        </section>
      )}
      {/* Model viewer removed per request */}
    </div>
  )
}

export default AdminCatalogManager 