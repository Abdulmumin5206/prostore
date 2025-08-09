import React, { useEffect, useState } from 'react';
import { addCategory, fetchCategories } from '../lib/supabaseProducts';
import type { Category } from '../types/products';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function create() {
    const name = prompt('New category name');
    if (!name) return;
    try {
      const cat = await addCategory(name);
      setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e: any) {
      alert(e?.message || 'Add category failed');
    }
  }

  return (
    <div className="min-h-[60vh] bg-white dark:bg-black text-black dark:text-white p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Categories</h1>
          <button className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700" onClick={create}>Add</button>
        </div>
        {loading && <div className="p-8 text-center">Loading…</div>}
        {error && <div className="p-4 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}
        {!loading && !error && (
          <ul className="space-y-2">
            {categories.map(c => (
              <li key={c.id} className="border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 bg-white dark:bg-zinc-900">{c.name}</li>
            ))}
            {categories.length === 0 && <li className="text-zinc-500">No categories</li>}
          </ul>
        )}
      </div>
    </div>
  );
} 