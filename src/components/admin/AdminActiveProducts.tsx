import React, { useEffect, useMemo, useState } from 'react'
import OptimizedImage from '../OptimizedImage'
import {
	AdminProductSummary,
	listAdminProducts,
	listSkusForProduct,
	AdminSku,
	updateSkuPrice,
	setSkuActive,
} from '../../lib/db'
import { Search as SearchIcon } from 'lucide-react'

const pill = 'px-2 py-0.5 rounded border text-[10px]'

const field = 'w-[84px] px-2 py-1 rounded bg-white/10 border border-white/15 text-xs text-white placeholder:text-white/40'

const currency = '$'

const SkuRow: React.FC<{
	sku: AdminSku
	onSaved: () => void
}> = ({ sku, onSaved }) => {
	const [base, setBase] = useState<string>(sku.basePrice != null ? String(sku.basePrice) : '')
	const [pct, setPct] = useState<string>(sku.discountPercent != null ? String(sku.discountPercent) : '')
	const [amt, setAmt] = useState<string>(sku.discountAmount != null ? String(sku.discountAmount) : '')
	const [savingPrice, setSavingPrice] = useState<boolean>(false)
	const [toggling, setToggling] = useState<boolean>(false)

	useEffect(() => {
		setBase(sku.basePrice != null ? String(sku.basePrice) : '')
		setPct(sku.discountPercent != null ? String(sku.discountPercent) : '')
		setAmt(sku.discountAmount != null ? String(sku.discountAmount) : '')
	}, [sku.id])

	const attrColor = (sku.attributes?.color as string) || ''
	const attrStorage = (sku.attributes?.storage as string) || ''

	const effective = useMemo(() => {
		const b = Number(base)
		if (!isFinite(b)) return null
		const a = Number(amt)
		const p = Number(pct)
		if (isFinite(a)) return Math.max(0, b - a)
		if (isFinite(p)) return Math.max(0, b * (1 - p / 100))
		return b
	}, [base, amt, pct])

	const savePrice = async () => {
		const b = Number(base)
		if (!isFinite(b)) return
		const p = Number(pct)
		const a = Number(amt)
		setSavingPrice(true)
		try {
			await updateSkuPrice(sku.id, {
				base_price: b,
				currency: sku.currency || 'USD',
				discount_percent: isFinite(p) ? p : null,
				discount_amount: isFinite(a) ? a : null,
			})
			onSaved()
		} finally {
			setSavingPrice(false)
		}
	}

	const toggleActive = async () => {
		setToggling(true)
		try {
			await setSkuActive(sku.id, !sku.isActive)
			onSaved()
		} finally {
			setToggling(false)
		}
	}

	return (
		<tr className="border-t border-white/10">
			<td className="px-2 py-2">
				<div className="text-[11px] text-white/80">{sku.skuCode || sku.id.slice(0, 8)}</div>
				<div className="mt-1 flex items-center gap-1 flex-wrap">
					{attrStorage && <span className={`${pill} bg-white/5 border-white/20`}>{attrStorage}</span>}
					{attrColor && (
						<span className={`${pill} bg-white/5 border-white/20 inline-flex items-center gap-1`}>
							<span className="inline-block h-2.5 w-2.5 rounded-full border border-white/30" style={{ backgroundColor: String(attrColor) }} />
							{attrColor}
						</span>
					)}
					<span className={`${pill} ${sku.condition === 'new' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'}`}>{sku.condition === 'new' ? 'New' : 'Second‑hand'}</span>
				</div>
			</td>
			<td className="px-2 py-2 text-xs">
				<div className="flex items-center gap-2 flex-wrap">
					<div className="flex items-center gap-1">
						<span className="text-white/50">{currency}</span>
						<input className={field} placeholder="Base" value={base} onChange={(e)=>setBase(e.target.value)} />
					</div>
					<div className="flex items-center gap-1">
						<span className="text-white/50">-%</span>
						<input className={field} placeholder="Disc %" value={pct} onChange={(e)=>{ setPct(e.target.value); setAmt('') }} />
					</div>
					<div className="flex items-center gap-1">
						<span className="text-white/50">-{currency}</span>
						<input className={field} placeholder="Disc $" value={amt} onChange={(e)=>{ setAmt(e.target.value); setPct('') }} />
					</div>
					<button onClick={savePrice} disabled={savingPrice} className={`text-xs px-2.5 py-1 rounded border ${savingPrice ? 'opacity-60 cursor-not-allowed bg-white/10 border-white/15' : 'bg-white/10 hover:bg-white/15 border-white/15'}`}>{savingPrice ? 'Saving…' : 'Save'}</button>
				</div>
				{effective != null && (
					<div className="mt-1 text-[11px] text-white/60">Effective: {currency}{effective.toFixed(2)}</div>
				)}
			</td>
			<td className="px-2 py-2 text-xs text-right">
				<button onClick={toggleActive} disabled={toggling} className={`text-xs px-2.5 py-1 rounded-md border ${sku.isActive ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-white/10 text-white/70 border-white/20'} ${toggling ? 'opacity-60 cursor-not-allowed' : ''}`}>{sku.isActive ? 'In stock' : 'Out of stock'}</button>
			</td>
		</tr>
	)
}

const ProductSkusTable: React.FC<{ productId: string }> = ({ productId }) => {
	const [skus, setSkus] = useState<AdminSku[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	const refresh = async () => {
		setError(null)
		setLoading(true)
		try {
			const rows = await listSkusForProduct(productId)
			setSkus(rows)
		} catch (e: any) {
			setError(e.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { refresh() }, [productId])

	return (
		<div className="mt-2">
			{loading && <div className="text-xs text-white/60">Loading SKUs…</div>}
			{error && <div className="text-xs text-red-300">{error}</div>}
			{!loading && skus.length === 0 && <div className="text-xs text-white/60">No SKUs.</div>}
			{skus.length > 0 && (
				<table className="min-w-full text-xs">
					<thead className="text-white/60">
						<tr className="border-t border-b border-white/10">
							<th className="text-left font-medium px-2 py-2">SKU</th>
							<th className="text-left font-medium px-2 py-2">Price & Discount</th>
							<th className="text-right font-medium px-2 py-2">Availability</th>
						</tr>
					</thead>
					<tbody>
						{skus.map(sku => (
							<SkuRow key={sku.id} sku={sku} onSaved={refresh} />
						))}
					</tbody>
				</table>
			)}
		</div>
	)
}

const AdminActiveProducts: React.FC = () => {
	const [rows, setRows] = useState<AdminProductSummary[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [search, setSearch] = useState<string>('')
	const [expanded, setExpanded] = useState<Set<string>>(new Set())

	const refresh = async () => {
		setError(null)
		setLoading(true)
		try {
			const all = await listAdminProducts(200)
			setRows(all.filter(r => r.published))
		} catch (e: any) {
			setError(e.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { refresh() }, [])

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase()
		return rows.filter((p) => {
			if (!q) return true
			return [
				p.title?.toLowerCase() ?? '',
				p.brandName?.toLowerCase() ?? '',
				p.categoryName?.toLowerCase() ?? '',
				(p.productCode ?? '').toLowerCase(),
				(p.skuCode ?? '').toLowerCase(),
			].some((f) => f.includes(q))
		})
	}, [rows, search])

	const toggleExpand = (id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	return (
		<section className="rounded-2xl bg-white/5 border border-white/10">
			<div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-white/10">
				<h2 className="text-sm font-semibold">Active Products</h2>
				<div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
					<SearchIcon className="h-4 w-4 text-white/40" />
					<input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by title, brand, PRD-/SKU-" className="bg-transparent text-sm outline-none placeholder:text-white/40 w-56 lg:w-72" />
				</div>
			</div>
			{loading && <div className="px-3 sm:px-4 py-3 text-xs text-white/60">Loading…</div>}
			{error && <div className="px-3 sm:px-4 py-3 text-xs text-red-300">{error}</div>}
			{!loading && filtered.length === 0 && <div className="px-3 sm:px-4 py-3 text-xs text-white/60">No active products.</div>}
			<div className="divide-y divide-white/10">
				{filtered.map((p) => (
					<div key={p.productId} className="px-3 sm:px-4 py-3">
						<div className="flex items-center gap-3 sm:gap-4">
							<button onClick={() => toggleExpand(p.productId)} className="h-8 w-8 shrink-0 rounded-md border border-white/10 bg-white/5 text-xs">{expanded.has(p.productId) ? '−' : '+'}</button>
							<OptimizedImage
								src={p.primaryImage || ''}
								alt={p.title}
								width={96}
								height={96}
								fit="cover"
								quality={70}
								className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-md border border-white/10 bg-white/5"
							/>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{p.title}</p>
								<p className="text-xs text-white/60 truncate">{p.brandName} • {p.categoryName}</p>
								{(p.productCode || p.skuCode) && (
									<p className="text-[10px] text-white/40 mt-0.5 truncate">{p.productCode ? `Product: ${p.productCode}` : ''}{p.productCode && p.skuCode ? ' • ' : ''}{p.skuCode ? `SKU: ${p.skuCode}` : ''}</p>
								)}
							</div>
						</div>
						{expanded.has(p.productId) && (
							<div className="mt-3">
								<ProductSkusTable productId={p.productId} />
							</div>
						)}
					</div>
				))}
			</div>
		</section>
	)
}

export default AdminActiveProducts 