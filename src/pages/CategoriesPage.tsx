import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { cardGrids } from '../components/NavDropdown'

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState<string>(searchParams.get('q') || '')
  const searchDebounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (searchInput) params.set('q', searchInput); else params.delete('q')
      setSearchParams(params, { replace: true })
    }, 300)
    return () => { if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current) }
  }, [searchInput])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    if (q) navigate(`/products?q=${encodeURIComponent(q)}`)
  }

  const sections: string[] = ['Store','Mac','iPad','iPhone','Watch','AirPods','Accessories']

  return (
    <div className="max-w-laptop mx-auto px-section-x pb-16">
      <div className="py-3 md:py-6">
        <h1 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-gray-100">Categories</h1>
      </div>

      {/* Search */}
      <form onSubmit={submitSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
            placeholder="Search products, categories..."
          />
        </div>
      </form>

      {/* Image-based nav-style grids */}
      <div className="space-y-5">
        {sections.map((key) => {
          const cards = (cardGrids as Record<string, { title: string; href: string; imagePath: string }[]>)[key]
          if (!cards || cards.length === 0) return null
          return (
            <div key={key} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{key}</h2>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                  {cards.map((card) => (
                    <Link key={card.title} to={card.href} className="group focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 rounded-md">
                      <div className="overflow-hidden rounded-md bg-[#fafafa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm transition-colors duration-200">
                        <div className="aspect-[4/3] w-full overflow-hidden bg-white dark:bg-black">
                          <img src={card.imagePath} alt={card.title} className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
                        </div>
                        <div className="px-2 py-1 text-center border-t border-gray-200 dark:border-gray-800">
                          <div className="text-[10px] font-medium text-gray-900 dark:text-gray-100 truncate">{card.title}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategoriesPage


