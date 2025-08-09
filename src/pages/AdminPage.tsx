import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminPage() {
  return (
    <div className="min-h-[60vh] bg-white dark:bg-black text-black dark:text-white p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/new-products" className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 bg-white dark:bg-zinc-900 hover:shadow-lg transition">
            <div className="text-2xl font-semibold mb-2">New Products</div>
            <p className="text-zinc-600 dark:text-zinc-400">Manage brand new inventory</p>
          </Link>
          <Link to="/admin/secondhand-products" className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 bg-white dark:bg-zinc-900 hover:shadow-lg transition">
            <div className="text-2xl font-semibold mb-2">Secondhand Products</div>
            <p className="text-zinc-600 dark:text-zinc-400">Manage used inventory</p>
          </Link>
        </div>
        <div className="mt-8">
          <Link to="/admin/categories" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Manage categories</Link>
        </div>
      </div>
    </div>
  );
} 