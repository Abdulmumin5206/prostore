import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
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
  { key: 'products', label: 'Products', icon: Package },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
]

const AdminPage: React.FC = () => {
  const { signOut } = useAuth()
  const [active, setActive] = useState<string>('dashboard')

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/50 border-b border-white/10">
        <div className="max-w-[120rem] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-white/60 hover:text-white transition-colors">Back to Store</Link>
            <span className="text-white/30">/</span>
            <span className="font-semibold">ProStore Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <SearchIcon className="h-4 w-4 text-white/40" />
              <input
                placeholder="Search…"
                className="bg-transparent text-sm outline-none placeholder:text-white/40 w-56"
              />
            </div>
            <ThemeToggle />
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-[120rem] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="md:sticky md:top-16 h-fit">
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
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-6 p-3 rounded-lg bg-amber-500/10 border border-amber-400/20 text-amber-200">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              Dev tip
            </div>
            <p className="mt-1 text-xs text-amber-200/80">
              This dashboard is UI-only. Wire it to your backend later. You can sign in via dev override on the sign-in page.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="space-y-6">
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

          {/* Products */}
          <section className="rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-sm font-semibold">Products</h2>
              <div className="flex items-center gap-2">
                <button className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add product
                </button>
              </div>
            </div>
            <ul className="divide-y divide-white/10">
              {[
                {
                  id: 'iphone-16-pro',
                  name: 'iPhone 16 Pro Max',
                  price: '$1,199',
                  stock: 32,
                  img: '/header/iPhone/iphone_16pro_promax.jpg'
                },
                {
                  id: 'macbook-pro-16',
                  name: 'MacBook Pro 16"',
                  price: '$2,499',
                  stock: 12,
                  img: '/header/mac/macbook pro 16.jpg'
                },
                {
                  id: 'airpods-pro-2',
                  name: 'AirPods Pro (2nd gen)',
                  price: '$249',
                  stock: 120,
                  img: '/header/AirPods/airpods-pro-2-hero-select-202409.png'
                },
              ].map((p) => (
                <li key={p.id} className="px-4 py-3 flex items-center gap-4">
                  <img src={p.img} alt={p.name} className="h-12 w-12 object-cover rounded-md border border-white/10 bg-white/5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-white/60">{p.id}</p>
                  </div>
                  <div className="hidden sm:block text-sm w-24">{p.price}</div>
                  <div className="hidden sm:block text-xs w-28">
                    <span className={`px-2 py-0.5 rounded border ${p.stock > 20 ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'}`}>
                      Stock: {p.stock}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/10">Edit</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10">Disable</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  )
}

export default AdminPage 