import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import AdminProductWizard from '../components/admin/AdminProductWizard'
import AdminCatalogManager from '../components/admin/AdminCatalogManager'
import { listAdminProducts, setProductPublished, setSkuActive, AdminProductSummary, deleteProduct } from '../lib/db'
import { setProductsPublished, deleteProducts } from '../lib/db'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  MoreVertical,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Search as SearchIcon
} from 'lucide-react'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'add-product', label: 'Add Product', icon: Plus },
  { key: 'catalog', label: 'Products', icon: Package },
  { key: 'catalog-manager', label: 'Catalog Manager', icon: Package },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
]

const AdminPage: React.FC = () => {
  const { signOut } = useAuth()
  const [active, setActive] = useState<string>('catalog')
  const [adminProducts, setAdminProducts] = useState<AdminProductSummary[]>([])
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [conditionFilter, setConditionFilter] = useState<'all'|'new'|'second_hand'>('all')
  const [bulkWorking, setBulkWorking] = useState<boolean>(false)
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false)

  const refreshProducts = async () => {
    try {
      setLoadingProducts(true)
      const rows = await listAdminProducts(100)
      setAdminProducts(rows)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => { refreshProducts() }, [])

  const filtered = adminProducts.filter((p) => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || [
      p.title?.toLowerCase() ?? '',
      p.brandName?.toLowerCase() ?? '',
      p.categoryName?.toLowerCase() ?? '',
      (p.productCode ?? '').toLowerCase(),
      (p.skuCode ?? '').toLowerCase(),
    ].some((f) => f.includes(q))
    const matchesCondition = conditionFilter === 'all' || p.condition === conditionFilter
    return matchesSearch && matchesCondition
  })

  const allSelected = filtered.length > 0 && filtered.every(p => selectedIds.has(p.productId))
  const someSelected = selectedIds.size > 0

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev: Set<string>) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev: Set<string>) => {
      if (filtered.length === 0) return new Set()
      const everySelected = filtered.every(p => prev.has(p.productId))
      if (everySelected) return new Set()
      return new Set(filtered.map(p => p.productId))
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const performBulkPublish = async (published: boolean) => {
    if (selectedIds.size === 0) return
    setBulkWorking(true)
    try {
      await setProductsPublished(Array.from(selectedIds as Set<string>), published)
      clearSelection()
      await refreshProducts()
    } finally {
      setBulkWorking(false)
    }
  }

  const performBulkDelete = async () => {
    if (selectedIds.size === 0) return
    const count = selectedIds.size
    if (!confirm(`Delete ${count} product${count > 1 ? 's' : ''}? This cannot be undone.`)) return
    setBulkWorking(true)
    try {
      await deleteProducts(Array.from(selectedIds as Set<string>))
      clearSelection()
      await refreshProducts()
    } finally {
      setBulkWorking(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white overflow-x-hidden">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/50 border-b border-white/10">
        <div className="max-w-[120rem] mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="text-sm text-white/60 hover:text-white transition-colors">Back to Store</Link>
            <span className="text-white/30 hidden sm:inline">/</span>
            <span className="font-semibold text-sm sm:text-base">ProStore Admin</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop search */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <SearchIcon className="hidden" />
              <SearchIcon className="h-4 w-4 text-white/40" />
              <input
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                placeholder="Search by title, brand, category, PRD- or SKU- code"
                className="bg-transparent text-sm outline-none placeholder:text-white/40 w-56 lg:w-72"
              />
            </div>
            {/* Mobile search toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5"
              aria-label="Search"
              onClick={() => setShowMobileSearch((v) => !v)}
            >
              <SearchIcon className="h-4 w-4" />
            </button>
            <ThemeToggle />
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
        {/* Mobile search bar */}
        {showMobileSearch && (
          <div className="md:hidden border-t border-white/10">
            <div className="max-w-[120rem] mx-auto px-3 py-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <SearchIcon className="h-4 w-4 text-white/40" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e)=>setSearch(e.target.value)}
                  placeholder="Search products, PRD-/SKU- code"
                  className="bg-transparent text-sm outline-none placeholder:text-white/40 w-full"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Body */}
      <div className="max-w-[120rem] mx-auto px-3 sm:px-4 py-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 lg:gap-6 pb-24 md:pb-6">
        {/* Sidebar */}
        <aside className="hidden md:sticky md:top-16 md:block h-fit">
          <nav className="space-y-1">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  active === key
                    ? 'bg-white text-black border-white'
                    : 'bg-white/0 text-white/80 hover:bg-white/10 border-white/10'
                }`}
                aria-current={active === key ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 p-3 rounded-lg bg-amber-500/10 border border-amber-400/20 text-amber-200">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              Dev tip
            </div>
            <p className="mt-1 text-xs text-amber-200/80">
              This dashboard is wired to Supabase. Use the product wizard below to add products.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="space-y-6">
          {active === 'catalog' && (
            <section className="rounded-2xl bg-white/5 border border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold">Products</h2>
                  <div className="hidden md:flex items-center gap-2 ml-2 text-xs">
                    <span className="text-white/50">Type:</span>
                    <button onClick={()=>setConditionFilter('all')} className={`px-2.5 py-1.5 rounded-lg border transition-colors ${conditionFilter==='all' ? 'bg-white text-black border-white' : 'bg-white/0 text-white/80 border-white/10 hover:bg-white/10'}`}>All</button>
                    <button onClick={()=>setConditionFilter('new')} className={`px-2.5 py-1.5 rounded-lg border transition-colors ${conditionFilter==='new' ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/0 text-white/80 border-emerald-500/40 hover:bg-emerald-500/10'}`}>New</button>
                    <button onClick={()=>setConditionFilter('second_hand')} className={`px-2.5 py-1.5 rounded-lg border transition-colors ${conditionFilter==='second_hand' ? 'bg-rose-500 text-black border-rose-400' : 'bg-white/0 text-white/80 border-rose-500/40 hover:bg-rose-500/10'}`}>Second‑hand</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="inline-flex items-center gap-2 text-xs text-white/70">
                    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-black/20" checked={allSelected} onChange={toggleSelectAllFiltered} />
                    <span className="hidden sm:inline">Select all</span>
                    <span className="sm:hidden">All</span>
                  </label>
                  <button onClick={refreshProducts} className="text-xs px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10">Refresh</button>
                </div>
              </div>

              <div className="divide-y divide-white/10">
                {loadingProducts && <div className="px-3 sm:px-4 py-3 text-xs text-white/60">Loading…</div>}
                {!loadingProducts && filtered.length === 0 && (
                  <div className="px-3 sm:px-4 py-3 text-xs text-white/60">No products yet.</div>
                )}
                {filtered.map((p) => (
                  <div key={p.productId} className="px-3 sm:px-4 py-3 flex items-center gap-3 sm:gap-4">
                    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-black/20" checked={selectedIds.has(p.productId)} onChange={() => toggleSelectOne(p.productId)} />
                    <Link to={`/store/${p.productId}`} target="_blank" className="shrink-0">
                      <img src={p.primaryImage || ''} alt={p.title} className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-md border border-white/10 bg-white/5" />
                    </Link>
                    <Link to={`/store/${p.productId}`} target="_blank" className="flex-1 min-w-0 group">
                      <p className="text-sm font-medium truncate group-hover:underline">{p.title || `${p.brandName ?? ''} ${p.categoryName ?? ''}`.trim()}</p>
                      <p className="text-xs text-white/60 flex flex-wrap items-center gap-2">
                        <span className="truncate">{p.brandName} • {p.categoryName}</span>
                        {p.condition && (
                          <span className={`px-1.5 py-0.5 rounded border text-[10px] ${p.condition==='new' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'}`}>{p.condition==='new'?'New':'Second‑hand'}</span>
                        )}
                      </p>
                      {(p.productCode || p.skuCode) && (
                        <p className="text-[10px] text-white/40 mt-0.5 truncate">{p.productCode ? `Product: ${p.productCode}` : ''}{p.productCode && p.skuCode ? ' • ' : ''}{p.skuCode ? `SKU: ${p.skuCode}` : ''}</p>
                      )}
                    </Link>
                    <div className="hidden lg:block text-xs w-24 text-right">
                      {p.effectivePrice != null ? (
                        <span className="font-semibold">${p.effectivePrice.toFixed(2)}</span>
                      ) : (
                        <span className="text-white/60">—</span>
                      )}
                    </div>
                    <div className="hidden md:block text-xs w-28">
                      <span className={`px-2 py-0.5 rounded border ${p.published ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-white/10 text-white/70 border-white/20'}`}>{p.published ? 'Published' : 'Hidden'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={async ()=>{ const makeVisible = !p.published; await setProductPublished(p.productId, makeVisible); if (p.skuId) { await setSkuActive(p.skuId!, makeVisible) }; refreshProducts(); }} className="text-xs px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/10">{p.published ? 'Hide' : 'Publish'}</button>
                      <button onClick={async ()=>{ if (confirm('Delete this product? This cannot be undone.')) { await deleteProduct(p.productId); refreshProducts(); } }} className="text-xs px-2.5 py-1.5 rounded-md bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === 'add-product' && (
            <AdminProductWizard onSaved={refreshProducts} />
          )}

          {active === 'dashboard' && (
            <>
              {/* Overview cards */}
              <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Revenue</span>
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="mt-3 text-2xl font-semibold">$48,920</div>
                    <div className="mt-1 text-xs text-emerald-300 inline-flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" /> +12.4% vs last week
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Orders</span>
                      <ShoppingCart className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="mt-3 text-2xl font-semibold">1,284</div>
                    <div className="mt-1 text-xs text-white/60">Avg $38 per order</div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Active Customers</span>
                      <Users className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="mt-3 text-2xl font-semibold">6,432</div>
                    <div className="mt-1 text-xs text-white/60">+324 this month</div>
                  </div>

                  <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Fulfillment</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="mt-3 text-2xl font-semibold">96.2%</div>
                    <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-[96%] bg-emerald-500"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Orders */}
              <section className="rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h2 className="text-sm font-semibold">Recent Orders</h2>
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-white/60">
                      <tr className="border-b border-white/10">
                        <th className="text-left font-medium px-4 py-3">Order</th>
                        <th className="text-left font-medium px-4 py-3">Customer</th>
                        <th className="text-left font-medium px-4 py-3">Total</th>
                        <th className="text-left font-medium px-4 py-3">Status</th>
                        <th className="text-right font-medium px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'ORD-10293', name: 'Jane Cooper', total: '$1,299.00', status: 'Paid' },
                        { id: 'ORD-10292', name: 'Wade Warren', total: '$249.00', status: 'Pending' },
                        { id: 'ORD-10291', name: 'Esther Howard', total: '$3,499.00', status: 'Paid' },
                        { id: 'ORD-10290', name: 'Guy Hawkins', total: '$89.00', status: 'Refunded' },
                      ].map((o) => (
                        <tr key={o.id} className="border-b border-white/5">
                          <td className="px-4 py-3 font-medium">{o.id}</td>
                          <td className="px-4 py-3 text-white/80">{o.name}</td>
                          <td className="px-4 py-3">{o.total}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium border ${
                                o.status === 'Paid'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : o.status === 'Pending'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-white/10 text-white/70 border-white/20'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/10 border border-white/10">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {active === 'catalog-manager' && (
            <section className="rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-white/10">
                <h2 className="text-sm font-semibold">Catalog Manager</h2>
              </div>
              <div className="p-3 sm:p-4">
                <AdminCatalogManager />
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Mobile bulk action bar */}
      {someSelected && (
        <div className="md:hidden fixed bottom-16 inset-x-0 z-40">
          <div className="mx-3 rounded-xl border border-white/10 bg-black/80 backdrop-blur p-2 flex items-center justify-between">
            <div className="text-xs text-white/70">{selectedIds.size} selected</div>
            <div className="flex items-center gap-2">
              <button disabled={bulkWorking} onClick={() => performBulkPublish(true)} className="text-xs px-2.5 py-1.5 rounded-md bg-emerald-500 text-black disabled:opacity-50">Publish</button>
              <button disabled={bulkWorking} onClick={() => performBulkPublish(false)} className="text-xs px-2.5 py-1.5 rounded-md bg-white/10 border border-white/10 disabled:opacity-50">Hide</button>
              <button disabled={bulkWorking} onClick={performBulkDelete} className="text-xs px-2.5 py-1.5 rounded-md bg-red-500 text-black disabled:opacity-50">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar (mobile only) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="max-w-[120rem] mx-auto grid grid-cols-5">
          {navItems.slice(0,5).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActive(key); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={`flex flex-col items-center justify-center gap-1 py-2 text-[11px] ${active===key ? 'text-white' : 'text-white/70'}`}
              aria-current={active === key ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate max-w-20">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default AdminPage