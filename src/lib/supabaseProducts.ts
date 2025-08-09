import { supabase } from './supabaseClient';
import type { AnyProduct, Category } from '../types/products';

export type ProductType = 'new' | 'secondhand';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

async function api(path: string, options: RequestInit = {}) {
  const isForm = options.body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isForm) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as any),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try { const j = await res.json(); msg = j.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json().catch(() => ({}));
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addCategory(name: string): Promise<Category> {
  const res = await api('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return res.category as Category;
}

function tableFor(type: ProductType) {
  return type === 'new' ? 'new_products' : 'secondhand_products';
}

export async function fetchProducts(type: ProductType): Promise<AnyProduct[]> {
  const tbl = tableFor(type);
  const { data, error } = await supabase
    .from(tbl)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const products = (data || []).map((p: any) => ({ ...p, product_type: type })) as AnyProduct[];
  return products;
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  const res = await api('/api/admin/upload', { method: 'POST', body: form });
  return res.url as string;
}

export type UpsertProductInput = {
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category_id?: string | null;
  stock_quantity?: number;
  attributes?: Record<string, unknown>;
  condition?: string | null; // only for secondhand
};

export async function createProduct(type: ProductType, input: UpsertProductInput) {
  await api(`/api/admin/products/${type}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateProduct(type: ProductType, id: string, input: UpsertProductInput) {
  await api(`/api/admin/products/${type}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(type: ProductType, id: string) {
  await api(`/api/admin/products/${type}/${id}`, { method: 'DELETE' });
} 