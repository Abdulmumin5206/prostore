import React, { useEffect, useMemo, useState } from 'react';
import { Text, H1 } from '../components/Typography';
import { fetchCategories, fetchProducts, deleteProduct, updateProduct } from '../lib/supabaseProducts';
import type { AnyProduct, Category } from '../types/products';
import { useNavigate } from 'react-router-dom';

// UI product used for rendering preview/list
type UiProduct = {
  id: string;
  category: string; // brand shown as category
  name: string;
  image: string;
  images: string[];
  priceFrom: string;
  monthlyFrom: string;
};

export default function AdminNewProductsPage() {
  // Data state
  const [dbProducts, setDbProducts] = useState<AnyProduct[]>([]);
  const [uiProducts, setUiProducts] = useState<UiProduct[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  const [visibleProducts, setVisibleProducts] = useState(12);

  // Sidebar filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 3000 });

  const navigate = useNavigate();

  // Quick edit state (inline modal)
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickPrice, setQuickPrice] = useState<number>(0);
  const [savingQuick, setSavingQuick] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts('new'),
        ]);
        setDbCategories(cats);
        setDbProducts(prods);

        const categoriesMap = new Map<string, string>();
        cats.forEach((c) => categoriesMap.set(c.id, c.name));
        const PLACEHOLDER_IMG = 'https://via.placeholder.com/800x600?text=Product';
        const mapped: UiProduct[] = prods.map((r: AnyProduct) => {
          const categoryName = (r.category_id && categoriesMap.get(r.category_id)) || r.category || 'Uncategorized';
          const priceNum = Number(r.price || 0);
          const monthly = priceNum > 0 ? `$${(priceNum / 24).toFixed(2)}/mo. for 24 mo.` : '';
          return {
            id: r.id,
            category: categoryName,
            name: r.name,
            image: r.image_url || PLACEHOLDER_IMG,
            images: [r.image_url || PLACEHOLDER_IMG],
            priceFrom: `$${priceNum.toFixed(2)}`,
            monthlyFrom: monthly,
          };
        });
        setUiProducts(mapped);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = [...uiProducts];

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (selectedPriceRange.min > 0 || selectedPriceRange.max < 3000) {
      result = result.filter((p) => {
        const price = parseFloat(p.priceFrom.replace('$', ''));
        return price >= selectedPriceRange.min && price <= selectedPriceRange.max;
      });
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => parseFloat(a.priceFrom.replace('$', '')) - parseFloat(b.priceFrom.replace('$', '')));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => parseFloat(b.priceFrom.replace('$', '')) - parseFloat(a.priceFrom.replace('$', '')));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [uiProducts, selectedCategory, selectedPriceRange, searchQuery, sortBy]);

  async function refreshProducts() {
    const cats = await fetchCategories();
    const prods = await fetchProducts('new');
    setDbCategories(cats);
    setDbProducts(prods);
    const categoriesMap = new Map<string, string>();
    cats.forEach((c) => categoriesMap.set(c.id, c.name));
    const PLACEHOLDER_IMG = 'https://via.placeholder.com/800x600?text=Product';
    const mapped: UiProduct[] = prods.map((r: AnyProduct) => {
      const categoryName = (r.category_id && categoriesMap.get(r.category_id)) || r.category || 'Uncategorized';
      const priceNum = Number(r.price || 0);
      const monthly = priceNum > 0 ? `$${(priceNum / 24).toFixed(2)}/mo. for 24 mo.` : '';
      return {
        id: r.id,
        category: categoryName,
        name: r.name,
        image: r.image_url || PLACEHOLDER_IMG,
        images: [r.image_url || PLACEHOLDER_IMG],
        priceFrom: `$${priceNum.toFixed(2)}`,
        monthlyFrom: monthly,
      };
    });
    setUiProducts(mapped);
  }

  function startAdd() {
    navigate('/admin/new-products/new');
  }

  function startEdit(id: string) {
    // Open quick edit modal with name and price
    const prod = dbProducts.find((p) => p.id === id);
    if (!prod) return;
    setQuickEditId(id);
    setQuickName(prod.name || '');
    setQuickPrice(Number(prod.price || 0));
    setQuickEditOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    await deleteProduct('new', id);
    await refreshProducts();
  }

  const categoriesUi = useMemo(() => {
    return ['All', ...dbCategories.map((c) => c.name)];
  }, [dbCategories]);

  function handleShowMore() {
    setVisibleProducts((prev) => Math.min(prev + 12, filtered.length));
  }

  function handlePriceRangeChange(type: 'min' | 'max', value: number) {
    setSelectedPriceRange((prev) => ({ ...prev, [type]: value }));
  }

  async function handleQuickSave(e: React.FormEvent) {
    e.preventDefault();
    if (!quickEditId) return;
    setSavingQuick(true);
    try {
      await updateProduct('new', quickEditId, {
        name: quickName.trim(),
        price: Number(quickPrice || 0),
      } as any);
      await refreshProducts();
      setQuickEditOpen(false);
      setQuickEditId(null);
      setQuickName('');
      setQuickPrice(0);
    } finally {
      setSavingQuick(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      {/* Header with search and Add Product */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#f5f5f7]/90 dark:bg-black/90 border-b border-gray-200 dark:border-gray-800 pt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center gap-3">
          <H1 className="text-xl font-medium">New Products (Admin)</H1>
          <div className="flex items-center gap-3 w-full max-w-lg ml-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-none text-gray-900 dark:text-white focus:outline-none focus:ring-0"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button onClick={startAdd} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
              Add Product
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar */}
        <aside className="w-56 pr-4 py-8">
          <div className="space-y-8">
            {/* Categories (brands) filter */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-1">
                {categoriesUi.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                      selectedCategory === cat
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Price Range</h3>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={selectedPriceRange.min || ''}
                    onChange={(e) => handlePriceRangeChange('min', Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <span className="text-gray-500 self-center text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={selectedPriceRange.max || ''}
                    onChange={(e) => handlePriceRangeChange('max', Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="text-xs text-gray-500">${selectedPriceRange.min} - ${selectedPriceRange.max}</div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPriceRange({ min: 0, max: 3000 });
                setSearchQuery('');
                setSortBy('default');
              }}
              className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-8 px-4">
          {/* Sort */}
          <div className="mb-6 flex flex-wrap justify-between items-center">
            <div />
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium shadow-sm"
              >
                <option value="default">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Showing {Math.min(visibleProducts, filtered.length)} of {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            </Text>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500"></div>
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.slice(0, visibleProducts).map((product) => (
                  <div key={product.id} className="flex flex-col h-full relative group rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-white dark:bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-0"></div>
                    <div className="cursor-default flex-grow relative z-10">
                      <div className="overflow-hidden rounded-xl aspect-square mb-4 transition-transform duration-300 group-hover:scale-[1.02]">
                        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-600 text-white">New</span>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300" loading="lazy" />
                      </div>
                      <div className="px-3 mb-2">
                        <Text size="xs" color="secondary" className="mb-1">{product.category}</Text>
                        <Text size="base" className="font-bold mb-2 text-black dark:text-white">{product.name}</Text>
                        <Text className="font-bold mb-1 text-black dark:text-white text-lg">{product.priceFrom}</Text>
                        <Text size="xs" color="secondary" className="mb-1">{product.monthlyFrom}</Text>
                      </div>
                    </div>
                    <div className="px-3 pb-3 relative z-10 flex gap-2">
                      <button onClick={() => startEdit(product.id)} className="flex-1 py-2 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              {visibleProducts < filtered.length && (
                <div className="flex justify-center mt-8">
                  <button onClick={handleShowMore} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Show More
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <Text size="lg" className="mb-4">No products found.</Text>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedPriceRange({ min: 0, max: 3000 });
                  setSearchQuery('');
                  setSortBy('default');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Quick Edit Modal */}
      {quickEditOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Quick Edit</div>
              <button className="text-zinc-500" onClick={() => { setQuickEditOpen(false); setQuickEditId(null); }}>✕</button>
            </div>
            <form onSubmit={handleQuickSave} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input value={quickName} onChange={(e) => setQuickName(e.target.value)} required className="w-full border rounded px-3 py-2 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm mb-1">Price</label>
                <input type="number" step="0.01" value={quickPrice} onChange={(e) => setQuickPrice(Number(e.target.value))} required className="w-full border rounded px-3 py-2 bg-transparent" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700" onClick={() => { setQuickEditOpen(false); setQuickEditId(null); }}>Cancel</button>
                <button disabled={savingQuick} className="px-3 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-black">{savingQuick ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
