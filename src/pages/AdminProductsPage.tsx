import React, { useEffect, useMemo, useState } from 'react';
import type { AnyProduct, Category, SecondhandProduct } from '../types/products';
import { addCategory, createProduct, deleteProduct, fetchCategories, fetchProducts, ProductType, updateProduct, uploadImage } from '../lib/supabaseProducts';

export default function AdminProductsPage({ type }: { type: ProductType }) {
  const [products, setProducts] = useState<AnyProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc'>('newest');

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [condition, setCondition] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts(type),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [type]);

  const filtered = useMemo(() => {
    let items = products;
    if (selectedCategoryId !== 'all') {
      items = items.filter(p => p.category_id === selectedCategoryId);
    }
    switch (sort) {
      case 'oldest':
        items = [...items].sort((a, b) => a.created_at.localeCompare(b.created_at));
        break;
      case 'price_asc':
        items = [...items].sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        items = [...items].sort((a, b) => b.price - a.price);
        break;
      default:
        items = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return items;
  }, [products, selectedCategoryId, sort]);

  function resetForm() {
    setEditId(null);
    setName('');
    setDescription('');
    setPrice(0);
    setStockQuantity(0);
    setCondition('');
    setCategoryId('');
    setImageFile(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, type === 'new' ? 'new' : 'secondhand');
      }

      const payload: any = {
        name,
        description: description || null,
        price: Number(price || 0),
        stock_quantity: Number(stockQuantity || 0),
        category_id: categoryId || null,
        image_url: imageUrl ?? undefined,
      };
      if (type === 'secondhand') payload.condition = condition || null;

      if (editId) {
        await updateProduct(type, editId, payload);
      } else {
        await createProduct(type, payload);
      }

      // refresh
      const updated = await fetchProducts(type);
      setProducts(updated);
      setFormOpen(false);
      resetForm();
    } catch (e: any) {
      alert(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(p: AnyProduct) {
    setEditId(p.id);
    setName(p.name);
    setDescription(p.description || '');
    setPrice(p.price);
    setStockQuantity((p as any).stock_quantity ?? 0);
    setCategoryId(p.category_id || '');
    if ('condition' in p && p.product_type === 'secondhand') setCondition((p as SecondhandProduct).condition || '');
    setFormOpen(true);
  }

  async function handleDelete(p: AnyProduct) {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(type, p.id);
      setProducts(prev => prev.filter(x => x.id !== p.id));
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    }
  }

  async function handleAddCategory() {
    const name = prompt('New category name');
    if (!name) return;
    try {
      const cat = await addCategory(name);
      setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e: any) {
      alert(e?.message || 'Add category failed');
    }
  }

  const title = type === 'new' ? 'New Products' : 'Secondhand Products';

  return (
    <div className="min-h-[60vh] bg-white dark:bg-black text-black dark:text-white p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage products, images, and categories</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700" onClick={() => setFormOpen(true)}>Add Product</button>
            <button className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700" onClick={handleAddCategory}>Add Category</button>
          </div>
        </div>

        <div className="mb-4 flex gap-3 flex-wrap">
          <select className="border rounded px-2 py-1 bg-transparent" value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value as any)}>
            <option value="all">All categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="border rounded px-2 py-1 bg-transparent" value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {loading && <div className="p-8 text-center">Loading…</div>}
        {error && <div className="p-4 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div key={`${p.product_type}-${p.id}`} className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">{type}</div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{p.description}</div>
                  <div className="mt-2 font-medium">${p.price.toFixed(2)}</div>
                  <div className="text-xs text-zinc-500">Stock: {(p as any).stock_quantity ?? 0}</div>
                  {type === 'secondhand' && (
                    <div className="text-xs text-zinc-500">Condition: {(p as SecondhandProduct).condition || 'N/A'}</div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button className="px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700" onClick={() => startEdit(p)}>Edit</button>
                    <button className="px-2 py-1 text-sm rounded border border-red-300 text-red-700" onClick={() => handleDelete(p)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full p-8 text-center text-zinc-600 dark:text-zinc-400">No products found.</div>
            )}
          </div>
        )}

        {formOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-xl rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold">{editId ? 'Edit' : 'Add'} Product</div>
                <button className="text-zinc-500" onClick={() => { setFormOpen(false); resetForm(); }}>✕</button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border rounded px-3 py-2 bg-transparent" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Price</label>
                    <input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} required className="w-full border rounded px-3 py-2 bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Stock Quantity</label>
                    <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} required className="w-full border rounded px-3 py-2 bg-transparent" />
                  </div>
                </div>
                {type === 'secondhand' && (
                  <div>
                    <label className="block text-sm mb-1">Condition</label>
                    <input value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent" />
                  </div>
                )}
                <div>
                  <label className="block text-sm mb-1">Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full border rounded px-3 py-2 bg-transparent">
                    <option value="" disabled>Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full" />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700" onClick={() => { setFormOpen(false); resetForm(); }}>Cancel</button>
                  <button disabled={saving} className="px-3 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-black">{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 