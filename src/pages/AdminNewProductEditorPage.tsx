import React, { useEffect, useMemo, useState } from 'react';
import { Text, H1 } from '../components/Typography';
import { addCategory, fetchCategories, fetchProductById, uploadImage, createProduct, updateProduct } from '../lib/supabaseProducts';
import type { AnyProduct, Category } from '../types/products';
import { useNavigate, useParams } from 'react-router-dom';

// --- Catalog types and data (same as list page) ---

type ConfigurationOption = { label: string };

type Submodel = {
  name: string;
  chips?: string[];
  sizes?: string[];
  configurations?: ConfigurationOption[];
  colors?: string[];
};

type Model = {
  name: string;
  submodels?: Submodel[];
  chips?: string[];
  sizes?: string[];
  configurations?: ConfigurationOption[];
  colors?: string[];
};

type BrandCatalog = { [brand: string]: Model[] };

const BRAND_CATALOG: BrandCatalog = {
  Apple: [
    {
      name: 'Mac',
      submodels: [
        {
          name: 'MacBook Air',
          chips: ['M1', 'M2', 'M3', 'M4'],
          sizes: ['13', '15'],
          configurations: [
            { label: '8GB/256GB (8-core GPU)' },
            { label: '16GB/512GB (10-core GPU)' },
            { label: '24GB/1TB (10-core GPU)' },
          ],
          colors: ['Midnight', 'Starlight', 'Silver', 'Space Gray'],
        },
        {
          name: 'MacBook Pro',
          chips: ['M3', 'M3 Pro', 'M3 Max', 'M4'],
          sizes: ['14', '16'],
          configurations: [
            { label: '16GB/512GB' },
            { label: '32GB/1TB' },
          ],
          colors: ['Space Black', 'Silver'],
        },
      ],
    },
    {
      name: 'iPhone',
      submodels: [
        {
          name: 'iPhone 15',
          configurations: [
            { label: '128GB' },
            { label: '256GB' },
            { label: '512GB' },
          ],
          colors: ['Blue', 'Pink', 'Green', 'Yellow', 'Black'],
        },
        {
          name: 'iPhone 15 Pro',
          configurations: [
            { label: '128GB' },
            { label: '256GB' },
            { label: '512GB' },
            { label: '1TB' },
          ],
          colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
        },
      ],
    },
    {
      name: 'iPad',
      submodels: [
        {
          name: 'iPad Pro',
          sizes: ['11', '13'],
          configurations: [
            { label: '256GB' },
            { label: '512GB' },
            { label: '1TB' },
          ],
          colors: ['Silver', 'Space Black'],
        },
      ],
    },
  ],
  Samsung: [
    {
      name: 'Galaxy S',
      submodels: [
        {
          name: 'Galaxy S24',
          configurations: [
            { label: '128GB' },
            { label: '256GB' },
          ],
          colors: ['Onyx Black', 'Marble Gray', 'Cobalt Violet', 'Amber Yellow'],
        },
        {
          name: 'Galaxy S24 Ultra',
          configurations: [
            { label: '256GB' },
            { label: '512GB' },
            { label: '1TB' },
          ],
          colors: ['Titanium Black', 'Titanium Gray', 'Titanium Violet'],
        },
      ],
    },
    {
      name: 'Galaxy Tab',
      submodels: [
        {
          name: 'Galaxy Tab S9',
          sizes: ['11', '12.4', '14.6'],
          configurations: [
            { label: '8GB/256GB' },
            { label: '12GB/512GB' },
          ],
          colors: ['Graphite', 'Beige'],
        },
      ],
    },
  ],
};

function composeSeoName(params: {
  brand?: string;
  model?: string;
  submodel?: string;
  chip?: string;
  size?: string;
  configuration?: string;
  color?: string;
}): string {
  const parts: string[] = [];
  if (params.brand) parts.push(params.brand);
  if (params.model) parts.push(params.model);
  if (params.submodel) parts.push(params.submodel);
  if (params.size) parts.push(`${params.size}\"`);
  if (params.chip) parts.push(params.chip);
  if (params.configuration) parts.push(params.configuration);
  if (params.color) parts.push(params.color);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export default function AdminNewProductEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  // Form hierarchical state
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [submodel, setSubmodel] = useState<string>('');
  const [chip, setChip] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [configuration, setConfiguration] = useState<string>('');
  const [color, setColor] = useState<string>('');

  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load categories and, if editing, load product
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const cats = await fetchCategories();
        setDbCategories(cats);
        if (isEdit && id) {
          const prod = await fetchProductById('new', id);
          if (prod) {
            const attrs = (prod as any).attributes || {};
            setBrand(attrs.brand || '');
            setModel(attrs.model || '');
            setSubmodel(attrs.submodel || '');
            setChip(attrs.chip || '');
            setSize(attrs.size || '');
            setConfiguration(attrs.configuration || '');
            setColor(attrs.color || '');

            setName(prod.name || '');
            setNameTouched(true);
            setDescription(prod.description || '');
            setPrice(prod.price || 0);
            setStockQuantity((prod as any).stock_quantity ?? '');
            setExistingImageUrl(prod.image_url || '');
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  // Derived options
  const brandOptions = useMemo(() => Object.keys(BRAND_CATALOG), []);
  const modelOptions = useMemo(() => (brand ? BRAND_CATALOG[brand]?.map(m => m.name) ?? [] : []), [brand]);
  const selectedModelObj = useMemo(() => (brand ? BRAND_CATALOG[brand]?.find(m => m.name === model) : undefined), [brand, model]);
  const submodelOptions = useMemo(() => selectedModelObj?.submodels?.map(s => s.name) ?? [], [selectedModelObj]);
  const selectedSubmodelObj = useMemo(() => selectedModelObj?.submodels?.find(s => s.name === submodel), [selectedModelObj, submodel]);
  const chipOptions = useMemo(() => selectedSubmodelObj?.chips ?? selectedModelObj?.chips ?? [], [selectedModelObj, selectedSubmodelObj]);
  const sizeOptions = useMemo(() => selectedSubmodelObj?.sizes ?? selectedModelObj?.sizes ?? [], [selectedModelObj, selectedSubmodelObj]);
  const configurationOptions = useMemo(() => (selectedSubmodelObj?.configurations ?? selectedModelObj?.configurations ?? []).map(c => c.label), [selectedModelObj, selectedSubmodelObj]);
  const colorOptions = useMemo(() => selectedSubmodelObj?.colors ?? selectedModelObj?.colors ?? [], [selectedModelObj, selectedSubmodelObj]);

  // Auto-generate name unless user has edited it
  useEffect(() => {
    if (nameTouched) return;
    const generated = composeSeoName({ brand, model, submodel, chip, size, configuration, color });
    setName(generated);
  }, [brand, model, submodel, chip, size, configuration, color, nameTouched]);

  // Reset deeper selections when parents change
  useEffect(() => {
    setModel('');
    setSubmodel('');
    setChip('');
    setSize('');
    setConfiguration('');
    setColor('');
  }, [brand]);
  useEffect(() => {
    setSubmodel('');
    setChip('');
    setSize('');
    setConfiguration('');
    setColor('');
  }, [model]);
  useEffect(() => {
    setChip('');
    setSize('');
    setConfiguration('');
    setColor('');
  }, [submodel]);

  // Image preview
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl('');
    }
  }, [imageFile]);

  async function resolveBrandCategoryId(brandName: string): Promise<string | null> {
    if (!brandName) return null;
    let cat = dbCategories.find((c) => c.name.toLowerCase() === brandName.toLowerCase());
    if (!cat) {
      try {
        const created = await addCategory(brandName);
        setDbCategories((prev) => [...prev, created]);
        cat = created;
      } catch {
        // ignore
      }
    }
    return cat ? cat.id : null;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'new');
      }

      const categoryId = await resolveBrandCategoryId(brand);
      const payload: any = {
        name: name.trim(),
        description: description || null,
        price: Number(price || 0),
        stock_quantity: stockQuantity === '' ? undefined : Number(stockQuantity),
        category_id: categoryId,
        image_url: imageUrl ?? (isEdit ? existingImageUrl : undefined),
        attributes: {
          brand: brand || null,
          model: model || null,
          submodel: submodel || null,
          chip: chip || null,
          size: size || null,
          configuration: configuration || null,
          color: color || null,
        },
      };

      if (isEdit && id) {
        await updateProduct('new', id, payload);
      } else {
        await createProduct('new', payload);
      }
      navigate('/admin/new-products');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center gap-3">
          <H1 className="text-xl font-semibold">{isEdit ? 'Edit Product' : 'Add Product'}</H1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/new-products')} className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700">Back</button>
            <button form="product-form" disabled={saving} className="px-3 py-2 rounded bg-zinc-900 text-white dark:bg-white dark:text-black">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="max-w-6xl mx-auto p-6">Loading…</div>
      ) : (
        <div className="w-full max-w-6xl h-full mx-auto grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Form */}
          <div className="p-6">
            <form id="product-form" onSubmit={handleSave} className="space-y-4">
              {/* Brand */}
              <div>
                <label className="block text-sm mb-1">Brand</label>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} required className="w-full border rounded px-3 py-2 bg-transparent">
                  <option value="" disabled>Select brand</option>
                  {brandOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {/* Model */}
              <div>
                <label className="block text-sm mb-1">Model</label>
                <select value={model} onChange={(e) => setModel(e.target.value)} required className="w-full border rounded px-3 py-2 bg-transparent" disabled={!brand}>
                  <option value="" disabled>Select model</option>
                  {modelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {/* Submodel */}
              {submodelOptions.length > 0 && (
                <div>
                  <label className="block text-sm mb-1">Submodel</label>
                  <select value={submodel} onChange={(e) => setSubmodel(e.target.value)} required className="w-full border rounded px-3 py-2 bg-transparent" disabled={!model}>
                    <option value="" disabled>Select submodel</option>
                    {submodelOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              {/* Chip */}
              {chipOptions.length > 0 && (
                <div>
                  <label className="block text-sm mb-1">Chip</label>
                  <select value={chip} onChange={(e) => setChip(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent">
                    <option value="">Select chip (optional)</option>
                    {chipOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              {/* Size */}
              {sizeOptions.length > 0 && (
                <div>
                  <label className="block text-sm mb-1">Size</label>
                  <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent">
                    <option value="">Select size (optional)</option>
                    {sizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              {/* Configuration */}
              {configurationOptions.length > 0 && (
                <div>
                  <label className="block text-sm mb-1">Configuration</label>
                  <select value={configuration} onChange={(e) => setConfiguration(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent">
                    <option value="">Select configuration (optional)</option>
                    {configurationOptions.map((cfg) => <option key={cfg} value={cfg}>{cfg}</option>)}
                  </select>
                </div>
              )}
              {/* Color */}
              {colorOptions.length > 0 && (
                <div>
                  <label className="block text-sm mb-1">Color</label>
                  <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent">
                    <option value="">Select color (optional)</option>
                    {colorOptions.map((col) => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              )}

              {/* Name (SEO) */}
              <div>
                <label className="block text-sm mb-1">Product Name (SEO)</label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameTouched(true); }}
                  required
                  placeholder={'e.g., Apple Mac MacBook Air 13" M3 16GB/512GB Midnight'}
                  className="w-full border rounded px-3 py-2 bg-transparent"
                />
              </div>
              {/* Price */}
              <div>
                <label className="block text-sm mb-1">Price</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} required className="w-full border rounded px-3 py-2 bg-transparent" />
              </div>
              {/* Quantity (optional) */}
              <div>
                <label className="block text-sm mb-1">Quantity (optional)</label>
                <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border rounded px-3 py-2 bg-transparent" />
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 bg-transparent" />
              </div>
              {/* Image */}
              <div>
                <label className="block text-sm mb-1">Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full" />
              </div>
            </form>
          </div>

          {/* Right: Live Preview */}
          <div className="p-6 border-l border-zinc-200 dark:border-zinc-800 bg-[#f5f5f7] dark:bg-black">
            <div className="text-sm font-medium mb-3">Live preview</div>
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800 max-w-md">
              <div className="relative">
                <div className="overflow-hidden rounded-b-none aspect-square">
                  <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-600 text-white">New</span>
                  <img
                    src={imagePreviewUrl || existingImageUrl || 'https://via.placeholder.com/800x600?text=Preview'}
                    alt={name || 'Preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="p-4">
                <Text size="xs" color="secondary" className="mb-1">{brand || 'Brand'}</Text>
                <Text size="base" className="font-bold mb-2 text-black dark:text-white">{name || 'Product Name'}</Text>
                <Text className="font-bold mb-1 text-black dark:text-white text-lg">{price ? `$${Number(price).toFixed(2)}` : '$0.00'}</Text>
                <Text size="xs" color="secondary" className="mb-1">{price ? `$${(Number(price) / 24).toFixed(2)}/mo. for 24 mo.` : ''}</Text>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 