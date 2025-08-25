import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, ShoppingBag, User, Store, Grid, Globe, Moon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'

const MobileBottomBar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdminOverride, signOut } = useAuth()
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [language, setLanguage] = useState<string>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'UZ'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('lang', language)
  }, [language])

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path)

  const handleAccount = () => { setIsCategoriesOpen(false); setIsAccountOpen(false); navigate('/account') }
  const closeAccount = () => setIsAccountOpen(false)

  const goProducts = () => navigate('/products')
  const openCategories = () => { setIsAccountOpen(false); setIsCategoriesOpen(false); navigate('/categories') }
  const closeCategories = () => setIsCategoriesOpen(false)

  const categories = [
    { name: 'Mac', href: '/products?category=Mac' },
    { name: 'iPad', href: '/products?category=iPad' },
    { name: 'iPhone', href: '/products?category=iPhone' },
    { name: 'Watch', href: '/products?category=Watch' },
    { name: 'AirPods', href: '/products?category=AirPods' },
    { name: 'Accessories', href: '/products?category=Accessories' },
  ]

  return (
    <>
      {/* Account Sheet */}
      {isAccountOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeAccount} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl p-4 space-y-3">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto" />
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Account</div>
              <button onClick={closeAccount} className="text-xs text-gray-500">Close</button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-800 dark:text-gray-200">Language</span>
              </div>
              <select
                aria-label="Language selector"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                <option value="UZ">Uzbek</option>
                <option value="RU">Russian</option>
                <option value="EN">English</option>
              </select>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-800 dark:text-gray-200">Appearance</span>
              </div>
              <ThemeToggle />
            </div>

            {/* Auth */}
            {user || isAdminOverride ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-200">
                  <User className="h-4 w-4" />
                  <span>Signed in</span>
                </div>
                <button onClick={signOut} className="text-sm text-red-600">Sign Out</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/signin" onClick={closeAccount} className="text-center text-sm py-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">Sign In</Link>
                <Link to="/signup" onClick={closeAccount} className="text-center text-sm py-2 rounded-full bg-black text-white dark:bg-white dark:text-black">Sign Up</Link>
              </div>
            )}

            {/* Quick contacts moved from utility bar */}
            <div className="pt-1 border-t border-gray-200 dark:border-gray-800 space-y-1">
              <a href="tel:+998711234567" className="block text-[11px] text-gray-600 dark:text-gray-400">+998 71 123 45 67</a>
              <a href="tel:+998901234567" className="block text-[11px] text-gray-600 dark:text-gray-400">+998 90 123 45 67</a>
            </div>
          </div>
        </div>
      )}

      {/* Categories Sheet */}
      {isCategoriesOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeCategories} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl p-4 space-y-3">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto" />
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Categories</div>
              <button onClick={closeCategories} className="text-xs text-gray-500">Close</button>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              {categories.map((cat) => (
                <Link key={cat.name} to={cat.href} onClick={closeCategories} className="text-center text-[12px] py-2 rounded-lg bg-[#fafafa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-laptop mx-auto px-3">
          <div className="h-14 flex items-center justify-between">
            <Link to="/" className={`flex flex-col items-center gap-0.5 flex-1 ${location.pathname === '/' ? 'text-black dark:text-white' : 'text-gray-500'}`}>
              <Home className="h-5 w-5" />
              <span className="text-[10px]">Home</span>
            </Link>
            <button onClick={goProducts} className={`flex flex-col items-center gap-0.5 flex-1 ${location.pathname.startsWith('/products') ? 'text-black dark:text-white' : 'text-gray-500'}`}>
              <Store className="h-5 w-5" />
              <span className="text-[10px]">Store</span>
            </button>
            <button onClick={openCategories} className={`flex flex-col items-center gap-0.5 flex-1 ${isCategoriesOpen ? 'text-black dark:text-white' : 'text-gray-500'}`}>
              <Grid className="h-5 w-5" />
              <span className="text-[10px]">Categories</span>
            </button>
            <Link to="/cart" className={`flex flex-col items-center gap-0.5 flex-1 ${isActive('/cart') ? 'text-black dark:text-white' : 'text-gray-500'}`}>
              <ShoppingBag className="h-5 w-5" />
              <span className="text-[10px]">Bag</span>
            </Link>
            <button onClick={handleAccount} className={`flex flex-col items-center gap-0.5 flex-1 ${isAccountOpen ? 'text-black dark:text-white' : 'text-gray-500'}`}>
              <User className="h-5 w-5" />
              <span className="text-[10px]">Account</span>
            </button>
          </div>
        </div>
      </nav>
      {/* Spacer for safe area */}
      <div className="h-14 md:hidden" />
    </>
  )
}

export default MobileBottomBar


