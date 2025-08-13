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
} from '../../lib/db'

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

  const parsedColors = colors.map(parseColorToken)

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
                <button key={m.id} onClick={()=>setModelId(m.id)}
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
          <div className="p-4">
            <VariantPresetEditor variantId={activeVariantId} />
          </div>
        </section>
      )}
    </div>
  )
}

export default AdminCatalogManager 