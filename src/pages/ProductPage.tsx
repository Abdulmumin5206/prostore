import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  H1, H2, H3, H4,
  Text, Caption, Label,
  AppleHeadline,
  AppleSubheadline,
  AppleProductDescription, 
  ApplePrice, 
  AppleProductTitle
} from '../components/Typography';
import Button from '../components/Button';
import Section from '../components/Section';
import ContentBlock from '../components/ContentBlock';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { PublicProduct } from '../lib/db';
import { useCart } from '../contexts/CartContext';
import { guessColorName } from '../lib/colorNames';

interface DetailProduct {
  id: string;
  name: string;
  category?: string;
  description?: string | null;
  images: string[];
  colors: string[];
  storage: string[];
  ramOptions?: string[];
  currency: string;
  basePrice: number; // effective price
  colorToImages?: Record<string, string[]>; // images tagged to a color
  colorNames?: Record<string, string>; // hex -> human name
  specs?: Record<string, any>; // technical specs/characteristics
  brand?: string;
  family?: string | null;
  model?: string | null;
  variant?: string | null;
}

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { items, addItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<DetailProduct | null>(null);

  const [selectedPaymentType, setSelectedPaymentType] = useState<'full' | 'nasiya'>('full');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(0);
  const [selectedRam, setSelectedRam] = useState(0);
  const [selectedInstallmentPlan, setSelectedInstallmentPlan] = useState<6 | 12 | 24>(12);
  const [activeTab, setActiveTab] = useState<'description' | 'characteristics' | 'nasiya'>('description');
  const [discount, setDiscount] = useState<number>(10); // Adding discount state with default 10%

  // Favorites (persisted locally)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('favorites');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const isFavorite = useMemo(() => {
    if (!product) return false;
    return favorites.includes(product.id);
  }, [favorites, product]);
  const toggleFavorite = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!product) return;
    setFavorites(prev => {
      const next = prev.includes(product.id) ? prev.filter(x => x !== product.id) : [...prev, product.id];
      try { localStorage.setItem('favorites', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Touch swipe state for image carousel
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;
  
  // State for fullscreen image modal
  const [showFullImage, setShowFullImage] = useState(false);
  const [fullImageIndex, setFullImageIndex] = useState(0);

  // Show compact summary bar at top after scrolling past half the page
  const [showTopSummary, setShowTopSummary] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
      const threshold = maxScroll * 0.35; // appear a bit earlier (~35% scroll)
      setShowTopSummary(scrollTop > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!productId) {
        setError('No product specified');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        if (!isSupabaseConfigured || !supabase) {
          // Fallback minimal placeholder when Supabase not configured
          if (isMounted) {
            setProduct({
              id: productId,
              name: 'Product',
              category: '',
              description: 'Product details are unavailable in demo mode.',
              images: [],
              colors: [],
              storage: [],
              currency: 'USD',
              basePrice: 0,
              colorToImages: {},
              colorNames: {},
              specs: {},
            });
          }
          setLoading(false);
          return;
        }

        // Fetch rows for this product from the public view
        const { data: rows, error: rowsErr } = await supabase
          .from('public_products_view')
          .select('*')
          .eq('product_id', productId);
        if (rowsErr) throw rowsErr;

        const list = (rows || []) as unknown as PublicProduct[];
        if (!list || list.length === 0) {
          if (isMounted) {
            setProduct({
              id: productId,
              name: 'Product Not Found',
              category: '',
              description: 'The requested product could not be found.',
              images: [],
              colors: [],
              storage: [],
              currency: 'USD',
              basePrice: 0,
              colorToImages: {},
              colorNames: {},
              specs: {},
            });
          }
          setLoading(false);
          return;
        }

        // Fetch all product images with optional color tag and sort
        const { data: imagesRows, error: imagesErr } = await supabase
          .from('product_images')
          .select('url, is_primary, sort_order, color')
          .eq('product_id', productId);
        if (imagesErr) throw imagesErr;

        const sortedImagesRaw = (imagesRows || [])
          .sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((x: any) => x);
        const sortedImages = sortedImagesRaw.map((x: any) => x.url as string);
        const colorToImages: Record<string, string[]> = {};
        for (const row of sortedImagesRaw) {
          const c = (row as any).color as string | null;
          if (c) {
            if (!colorToImages[c]) colorToImages[c] = [];
            colorToImages[c].push(row.url as string);
          }
        }
        const universalImagesSorted = sortedImagesRaw
          .filter((row: any) => !(row as any).color)
          .map((x: any) => x.url as string);

        // Aggregate attributes
        const colorSet = new Set<string>();
        const storageSet = new Set<string>();
        const ramSet = new Set<string>();
        const colorNames: Record<string, string> = {};
        let minPrice = Number.POSITIVE_INFINITY;
        let currency: string = 'USD';
        for (const r of list) {
          const attrs: any = (r as any).attributes || {};
          if (typeof attrs.color === 'string' && attrs.color) colorSet.add(attrs.color);
          if (typeof attrs.storage === 'string' && attrs.storage) storageSet.add(attrs.storage);
          if (typeof attrs.ram === 'string' && attrs.ram) ramSet.add(attrs.ram);
          if (typeof attrs.color === 'string' && typeof attrs.color_name === 'string' && attrs.color && attrs.color_name) {
            colorNames[attrs.color] = attrs.color_name;
          }
          if (typeof r.effective_price === 'number') minPrice = Math.min(minPrice, Number(r.effective_price));
          if (r.currency) currency = r.currency;
        }

        const r0 = list[0];
        const detail: DetailProduct = {
          id: r0.product_id,
          name: r0.title,
          category: r0.category,
          description: r0.description,
          images: universalImagesSorted.length > 0 ? universalImagesSorted : (r0.primary_image ? [r0.primary_image] : []),
          colors: Array.from(colorSet),
          storage: Array.from(storageSet),
          ramOptions: Array.from(ramSet),
          currency,
          basePrice: Number.isFinite(minPrice) ? minPrice : Number(r0.effective_price ?? 0),
          colorToImages,
          colorNames,
          brand: r0.brand,
          family: r0.family,
          model: r0.model,
          variant: r0.variant,
        };

        // Prefer model-level content when available (automatic across products of same model)
        try {
          let appliedFromModelContent = false;
          // 1) If product has a variant (e.g., Plus/Pro), fetch variant-specific content ONLY
          if (r0.variant && String(r0.variant).trim().length > 0) {
            const { data: variantRows } = await supabase
              .from('product_model_content')
              .select('description, specs')
              .eq('brand', r0.brand)
              .eq('family', r0.family)
              .eq('model', r0.model)
              .eq('variant', r0.variant);
            if (Array.isArray(variantRows) && variantRows.length > 0) {
              const mc = variantRows[0] as any;
              if (mc?.description) (detail as any).description = mc.description;
              if (mc?.specs && typeof mc.specs === 'object') (detail as any).specs = mc.specs as Record<string, any>;
              appliedFromModelContent = true;
            }
          }
          // 2) If product has NO variant (base), allow model-level content with variant=NULL
          if (!appliedFromModelContent && (!r0.variant || String(r0.variant).trim().length === 0)) {
            const { data: modelRows } = await supabase
              .from('product_model_content')
              .select('description, specs')
              .eq('brand', r0.brand)
              .eq('family', r0.family)
              .eq('model', r0.model)
              .is('variant', null);
            if (Array.isArray(modelRows) && modelRows.length > 0) {
              const mc = modelRows[0] as any;
              if (mc?.description) (detail as any).description = mc.description;
              if (mc?.specs && typeof mc.specs === 'object') (detail as any).specs = mc.specs as Record<string, any>;
              appliedFromModelContent = true;
            }
          }
        } catch (e) {
          // ignore when table not present or no rows; fall back to per-product values
        }

        // Fetch product-level specs for Characteristics tab (fallback if model-level specs absent)
        try {
          if (!(detail as any).specs) {
            const { data: productRows } = await supabase
              .from('products')
              .select('specs')
              .eq('id', productId);
            if (Array.isArray(productRows) && productRows.length > 0) {
              const s = (productRows[0] as any).specs;
              if (s && typeof s === 'object') {
                (detail as any).specs = s as Record<string, any>;
              }
            }
          }
        } catch (e) {
          // ignore specs fetch errors to avoid blocking the product page
        }

        if (isMounted) setProduct(detail);
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load product');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const decreaseQuantity = () => { if (quantity > 1) setQuantity(quantity - 1); };
  const increaseQuantity = () => { setQuantity(quantity + 1); };

  const currentColor = useMemo(() => {
    if (!product || !product.colors || product.colors.length === 0) return '';
    const idx = Math.max(0, Math.min(selectedColor, product.colors.length - 1));
    return product.colors[idx];
  }, [product, selectedColor]);

  const currentStorage = useMemo(() => {
    if (!product || !product.storage || product.storage.length === 0) return '';
    const idx = Math.max(0, Math.min(selectedStorage, product.storage.length - 1));
    return product.storage[idx];
  }, [product, selectedStorage]);
  
  const currentRam = useMemo(() => {
    if (!product || !product.ramOptions || product.ramOptions.length === 0) return '';
    const idx = Math.max(0, Math.min(selectedRam, product.ramOptions.length - 1));
    return product.ramOptions[idx];
  }, [product, selectedRam]);

  const imagesForCurrentSelection = useMemo(() => {
    if (!product) return [] as string[];
    const universalImages = product.images || [];
    const colorImages = currentColor && product.colorToImages ? (product.colorToImages[currentColor] || []) : [];
    // Include universal images plus color-specific, keeping order with color-specific first
    const combined = [...colorImages, ...universalImages];
    // De-duplicate while preserving order
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const url of combined) {
      if (!seen.has(url)) { seen.add(url); deduped.push(url); }
    }
    return deduped;
  }, [product, currentColor]);

  const currentColorLabel = useMemo(() => {
    if (!product) return '';
    return (product.colorNames && product.colorNames[currentColor]) ? product.colorNames[currentColor] : (guessColorName(currentColor) || currentColor);
  }, [product, currentColor]);

  const selectedTitle = useMemo(() => {
    if (!product) return '';
    const parts = [product.name, currentRam || '', currentStorage || '', currentColorLabel || ''].filter(Boolean);
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }, [product, currentRam, currentStorage, currentColorLabel]);

  const currentItemId = useMemo(() => {
    if (!product) return '';
    return `${product.id}:${currentRam}:${currentStorage}:${currentColor}`;
  }, [product, currentRam, currentStorage, currentColor]);

  // Derive a high-level UI category (e.g., iPhone, Mac) for breadcrumb linking to Store with filters
  const uiCategory = useMemo(() => {
    if (!product) return '';
    const brand = (product.brand || '').toLowerCase();
    const haystack = [product.family, product.model, product.variant, product.category, product.name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (brand === 'apple') {
      if (haystack.includes('iphone')) return 'iPhone';
      if (haystack.includes('ipad')) return 'iPad';
      if (
        haystack.includes('macbook') ||
        haystack.includes('imac') ||
        haystack.includes('mac mini') ||
        haystack.includes('mac studio') ||
        haystack.includes('mac pro') ||
        haystack.includes('mac')
      ) return 'Mac';
      if (haystack.includes('watch')) return 'Watch';
      if (haystack.includes('airpods')) return 'AirPods';
      if (haystack.includes('apple tv') || haystack.includes('homepod')) return 'TV & Home';
    }

    const dbCat = (product.category || '').toLowerCase();
    if (dbCat === 'phones') return 'iPhone';
    if (dbCat === 'tablets') return 'iPad';
    if (dbCat === 'wearables') return 'Watch';
    if (dbCat === 'audio') return 'AirPods';
    if (dbCat === 'accessories') return 'Accessories';
    if (dbCat === 'laptops' || dbCat === 'desktops') return 'Mac';
    if (dbCat === 'tv' || dbCat === 'smart home') return 'TV & Home';

    return product.category || '';
  }, [product]);

  const inCartQuantity = useMemo(() => {
    const found = items.find(i => i.id === currentItemId);
    return found ? found.quantity : 0;
  }, [items, currentItemId]);

  const basePrice = product?.basePrice ?? 0;
  const discountAmount = selectedPaymentType === 'full' ? (basePrice * (discount / 100)) : 0;
  const discountedPrice = basePrice - discountAmount;
  const nasiyaMarkup = 1.3;
  const nasiyaTotalPrice = Math.round((selectedPaymentType === 'full' ? discountedPrice : basePrice) * nasiyaMarkup) * quantity;
  const monthlyPayment = Math.round(((selectedPaymentType === 'full' ? discountedPrice : basePrice) * nasiyaMarkup) / selectedInstallmentPlan) * quantity;
  const totalPrice = discountedPrice * quantity;

  const currentPriceDisplay = selectedPaymentType === 'full' 
    ? `${product?.currency === 'USD' ? '$' : product?.currency || ''}${totalPrice}` 
    : `${product?.currency === 'USD' ? '$' : product?.currency || ''}${monthlyPayment}/mo for ${selectedInstallmentPlan} months`;

  const formatSpecLabel = (label: string): string => {
    return label
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  const formatSpecValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      try {
        return Object.entries(value).map(([k, v]) => `${formatSpecLabel(k)}: ${String(v)}`).join(', ');
      } catch {
        return JSON.stringify(value);
      }
    }
    return String(value);
  };

  const handleAddToBag = () => {
    if (!product) return;
    const itemId = `${product.id}:${currentRam}:${currentStorage}:${currentColor}`;
    addItem({
      id: itemId,
      name: `${product.name}${currentRam ? ' ' + currentRam : ''}${currentStorage ? ' ' + currentStorage : ''}${currentColorLabel ? ' ' + currentColorLabel : ''}`,
      image: imagesForCurrentSelection[0] || product.images[0] || '',
      unitPrice: basePrice,
      currency: product.currency || 'USD',
    }, quantity);
  };

  // Image carousel helpers
  const imagesCount = imagesForCurrentSelection.length || 0;
  const stepSize = 2; // show two images side-by-side, advance by two
 
  // Vertical thumbnails slider state
  const [thumbOffset, setThumbOffset] = useState(0);
  const visibleThumbs = 6;
  const maxThumbOffset = Math.max(0, imagesCount - visibleThumbs);
  const thumbsStart = Math.min(thumbOffset, maxThumbOffset);
  const canThumbPrev = thumbsStart > 0;
  const canThumbNext = thumbsStart < maxThumbOffset;
  const showThumbs = (imagesForCurrentSelection.length || 0) > 0;

  const nextImage = () => {
    if (!imagesCount) return;
    setSelectedImage((prev) => (prev + stepSize) % imagesCount);
  };
  const prevImage = () => {
    if (!imagesCount) return;
    setSelectedImage((prev) => (prev - stepSize + imagesCount * 1000) % imagesCount);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  // Function to open fullscreen image
  const openFullImage = (index: number) => {
    setFullImageIndex(index);
    setShowFullImage(true);
  };

  // Function to close fullscreen image
  const closeFullImage = () => {
    setShowFullImage(false);
  };

  // Function to navigate fullscreen images
  const nextFullImage = () => {
    if (!imagesCount) return;
    setFullImageIndex((prev) => (prev + 1) % imagesCount);
  };

  const prevFullImage = () => {
    if (!imagesCount) return;
    setFullImageIndex((prev) => (prev - 1 + imagesCount) % imagesCount);
  };

  const isM4Air = useMemo(() => {
    const modelName = (product?.model || '').toLowerCase();
    const familyName = (product?.family || '').toLowerCase();
    return familyName.includes('macbook air') && modelName.includes('m4');
  }, [product]);

  const m4AirGpuCpuText = useMemo(() => {
    if (!product || !isM4Air) return '';
    const variantText = (product.variant || '').toLowerCase();
    const is15 = variantText.includes('15');
    const is136 = !is15; // assume 13.6" when not 15 for M4 Air seeds
    const cpuCores = 10;
    let gpuCores = 10;
    if (is15) {
      gpuCores = 10;
    } else if (is136) {
      const ram = (currentRam || '').toUpperCase();
      const storage = (currentStorage || '').toUpperCase();
      if (ram === '16GB' && storage === '256GB') {
        gpuCores = 8;
      } else {
        gpuCores = 10;
      }
    }
    return `Processor: ${cpuCores}-core CPU • Graphics: ${gpuCores}-core GPU`;
  }, [product, isM4Air, currentRam, currentStorage]);

  return (
    <div className="min-h-screen pb-20 bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      {/* Header spacer to ensure content is never hidden under the header */}
      <div className="h-2 md:h-2"></div>
      {/* Breadcrumb navigation */}
                  <div className="max-w-7xl mx-auto px-4 pt-1 pb-1">
        <nav className="flex items-center text-gray-700 dark:text-gray-300" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
            <Text size="sm" color="secondary">Home</Text>
          </Link>
          <span className="mx-1.5"><Text size="sm" color="tertiary">›</Text></span>
          {uiCategory ? (
            <>
              <Link
                to={`/products?category=${encodeURIComponent(uiCategory)}`}
                className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                <Text size="sm" color="secondary">{uiCategory}</Text>
              </Link>
              <span className="mx-1.5"><Text size="sm" color="tertiary">›</Text></span>
            </>
          ) : (
            <>
              <Link to="/products" className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                <Text size="sm" color="secondary">Store</Text>
              </Link>
              <span className="mx-1.5"><Text size="sm" color="tertiary">›</Text></span>
            </>
          )}
          {product?.name && (
            <Link
              to={`/products?category=${encodeURIComponent(uiCategory || 'All')}&q=${encodeURIComponent(product.name)}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
            >
              <Text size="sm" color="secondary">{product.name}</Text>
            </Link>
          )}
        </nav>
      </div>

      <Section background="light" size="lg" containerWidth="xl" className="pb-6">
        <ContentBlock spacing="none">
          {loading ? (
            <div className="py-8 text-center">
              <Text>Loading product…</Text>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <Text color="error">{error}</Text>
            </div>
          ) : !product ? (
            <div className="py-8 text-center">
              <Text>Product not found.</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 py-4">
              <div className="lg:col-span-8 xl:col-span-8">
                <AppleProductTitle size="sm">{product.name}</AppleProductTitle>
                {product.category && (
                  <Text size="sm" color="tertiary" className="mt-1">{product.category}</Text>
                )}
              </div>
                {/* Left side - Product Images */}
                <div className="flex flex-col lg:col-span-8">
                  <div className="flex gap-4">
                    {/* Vertical thumbnails (desktop/tablet) */}
                    {imagesForCurrentSelection.length > 0 && (
                      <div className="hidden sm:flex sm:flex-col items-center gap-3 max-h-[460px] md:max-h-[480px] lg:max-h-[500px] xl:max-h-[520px] relative">
                        <div className="flex flex-col gap-3 overflow-hidden" style={{ maxHeight: '100%' }}>
                          {/* Up arrow - positioned inside at top */}
                          {imagesCount > visibleThumbs && (
                            <button
                              type="button"
                              onClick={() => setThumbOffset((v) => Math.max(0, v - 1))}
                              disabled={!canThumbPrev}
                              className={`absolute top-0 left-0 right-0 h-12 flex justify-center items-center z-10 bg-gradient-to-b from-white/90 to-transparent dark:from-gray-800/90 dark:to-transparent ${!canThumbPrev ? 'opacity-40 cursor-not-allowed' : 'hover:from-white hover:dark:from-gray-800'}`}
                              aria-label="Previous thumbnails"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7 text-gray-700 dark:text-gray-300">
                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          
                          {(imagesForCurrentSelection.slice(thumbsStart, thumbsStart + visibleThumbs)).map((image, index) => {
                            const actualIndex = thumbsStart + index;
                            return (
                              <button
                                key={actualIndex}
                                onClick={() => setSelectedImage(actualIndex)}
                                className={`rounded-md h-16 w-14 md:h-20 md:w-16 flex-shrink-0 overflow-hidden transition-all duration-300 ${
                                  selectedImage === actualIndex 
                                    ? 'border border-black dark:border-white' 
                                    : 'opacity-60 hover:opacity-100'
                                }`}
                                aria-label={`Thumbnail ${actualIndex + 1}`}
                              >
                                <img src={image} alt={`${product?.name || 'Product'} thumbnail ${actualIndex + 1}`} className="h-full w-full object-cover" />
                              </button>
                            );
                          })}
                          
                          {/* Down arrow - positioned inside at bottom */}
                          {imagesCount > visibleThumbs && (
                            <button
                              type="button"
                              onClick={() => setThumbOffset((v) => Math.min(maxThumbOffset, v + 1))}
                              disabled={!canThumbNext}
                              className={`absolute bottom-0 left-0 right-0 h-12 flex justify-center items-center z-10 bg-gradient-to-t from-white/90 to-transparent dark:from-gray-800/90 dark:to-transparent ${!canThumbNext ? 'opacity-40 cursor-not-allowed' : 'hover:from-white hover:dark:from-gray-800'}`}
                              aria-label="Next thumbnails"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7 text-gray-700 dark:text-gray-300">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Two large image containers */}
                    <div className="flex-1 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Left large container (current image) */}
                      <div 
                        className="relative flex items-center justify-center h-[440px] md:h-[480px] lg:h-[520px] rounded-xl overflow-hidden cursor-pointer"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        onClick={() => imagesForCurrentSelection.length > 0 && openFullImage(selectedImage)}
                      >
                        {imagesForCurrentSelection.length > 0 ? (
                          <img 
                            src={imagesForCurrentSelection[selectedImage]} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <Text color="tertiary">Image not available</Text>
                          </div>
                        )}

                        {imagesForCurrentSelection.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/70 hover:bg-white shadow"
                            aria-label="Previous image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Right large container (next image) */}
                      <div 
                        className="relative flex items-center justify-center h-[440px] md:h-[480px] lg:h-[520px] rounded-xl overflow-hidden cursor-pointer"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        onClick={() => imagesForCurrentSelection.length > 1 && openFullImage((selectedImage + 1) % imagesForCurrentSelection.length)}
                      >
                        {imagesForCurrentSelection.length > 1 ? (
                          <img 
                            src={imagesForCurrentSelection[(selectedImage + 1) % imagesForCurrentSelection.length]} 
                            alt={`${product.name} alt view`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <Text color="tertiary">Add more images to preview here</Text>
                          </div>
                        )}

                        {imagesForCurrentSelection.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/70 hover:bg-white shadow"
                            aria-label="Next image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal thumbnails for mobile */}
                  {imagesForCurrentSelection.length > 1 && (
                    <div className="flex justify-center space-x-2 sm:hidden">
                      {imagesForCurrentSelection.map((image, index) => (
                        <button 
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`rounded-md h-16 w-14 flex-shrink-0 overflow-hidden transition-all duration-300 ${
                            selectedImage === index 
                              ? 'border border-black dark:border-white' 
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side - Product Details */}
                <div className="flex flex-col lg:col-span-4 xl:col-span-4">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm px-5 pt-4 pb-3">
                  
                  
                                      {product.colors && product.colors.length > 0 && (
                      <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color, index) => {
                          const label = product.colorNames?.[color] || guessColorName(color) || color;
                          return (
                            <button
                              key={color + index}
                              onClick={() => { setSelectedColor(index); setSelectedImage(0); }}
                              className={`px-4 py-2 rounded-lg border transition-all ${
                                selectedColor === index 
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
                                  : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                              }`}
                              aria-label={`Select color ${label}`}
                            >
                              <div className="text-sm font-medium">{label}</div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex items-center">
                        <Text size="sm" weight="medium" color="secondary" className="mr-2">Selected color:</Text>
                        <Text size="sm" color="primary">{currentColorLabel}</Text>
                      </div>
                    </div>
                  )}

                  {product.storage && product.storage.length > 0 && (
                    <div className="mb-4">
                      {product.ramOptions && product.ramOptions.length > 0 && (
                        <>
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {product.ramOptions.map((option, index) => (
                                <button
                                  key={option + index}
                                  onClick={() => setSelectedRam(index)}
                                  className={`px-4 py-2 rounded-lg border transition-all ${
                                    selectedRam === index 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
                                      : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  <div className="text-sm font-medium">{option}</div>
                                </button>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center">
                              <Text size="sm" weight="medium" color="secondary" className="mr-2">Selected memory:</Text>
                              <Text size="sm" color="primary">{currentRam}</Text>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {product.storage.map((option, index) => (
                          <button
                            key={option + index}
                            onClick={() => setSelectedStorage(index)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              selectedStorage === index 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
                                : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">{option}</div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center">
                        <Text size="sm" weight="medium" color="secondary" className="mr-2">Selected storage:</Text>
                        <Text size="sm" color="primary">{currentStorage}</Text>
                      </div>
                      {isM4Air && (
                        <div className="mt-3">
                          <Text size="sm" color="secondary">{m4AirGpuCpuText}</Text>
                        </div>
                      )}
                    </div>
                  )}

                    {/* Payment Options */}
  <div>
    <div className="flex space-x-3 mb-4">
      <button
        onClick={() => setSelectedPaymentType('full')}
        className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
          selectedPaymentType === 'full' 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400' 
            : 'border-gray-200 dark:border-gray-800'
        }`}
      >
        <Text size="sm" weight={selectedPaymentType === 'full' ? 'medium' : 'normal'} color={selectedPaymentType === 'full' ? 'accent' : 'inherit'} align="center">Full Payment</Text>
      </button>
      <button
        onClick={() => setSelectedPaymentType('nasiya')}
        className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
          selectedPaymentType === 'nasiya' 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400' 
            : 'border-gray-200 dark:border-gray-800'
        }`}
      >
        <Text size="sm" weight={selectedPaymentType === 'nasiya' ? 'medium' : 'normal'} color={selectedPaymentType === 'nasiya' ? 'accent' : 'inherit'} align="center">Nasiya</Text>
      </button>
    </div>

                    {selectedPaymentType === 'full' ? (
                      <div className="mb-4">
                        <div className="flex flex-col">
                          {discount > 0 && (
                            <div className="mb-1 flex items-center">
                              <Text size="sm" className="line-through text-gray-400">
                                {product.currency === 'USD' ? '$' : product.currency}{basePrice * quantity}
                              </Text>
                              <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                -{discount}%
                              </span>
                            </div>
                          )}
                          <ApplePrice className="text-3xl text-indigo-600 dark:text-indigo-500 font-semibold">
                            {product.currency === 'USD' ? '$' : product.currency}{totalPrice}
                          </ApplePrice>
                          <Text size="sm" color="tertiary" className="mt-1">One-time payment</Text>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="mb-4">
                          <Text size="sm" weight="medium" color="secondary" className="mb-2">Select payment period:</Text>
                          <div className="flex space-x-2">
                            {[6, 12, 24].map((months) => (
                              <button
                                key={months}
                                onClick={() => setSelectedInstallmentPlan(months as 6 | 12 | 24)}
                                className={`px-4 py-2 text-sm rounded-md transition-all ${
                                  selectedInstallmentPlan === months
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <Text size="sm" color="inherit">{months} months</Text>
                              </button>
                            ))}
                          </div>
                        </div>

                        <ApplePrice className="text-3xl text-indigo-600 dark:text-indigo-500 font-semibold">
                          {product.currency === 'USD' ? '$' : product.currency}{monthlyPayment}
                        </ApplePrice>
                        <Text size="sm" color="tertiary" className="mt-1">per month for {selectedInstallmentPlan} months</Text>
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                          <div className="flex justify-between text-sm mb-2">
                            <Text size="sm" color="tertiary">Base price:</Text>
                            <Text size="sm" color="secondary">{product.currency === 'USD' ? '$' : product.currency}{basePrice * quantity}</Text>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <Text size="sm" color="tertiary">Nasiya markup (30%):</Text>
                            <Text size="sm" color="secondary">{product.currency === 'USD' ? '+$' : '+' + product.currency}{nasiyaTotalPrice - (basePrice * quantity)}</Text>
                          </div>
                          <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200 dark:border-gray-800">
                            <Text size="sm" color="secondary" weight="medium">Total cost:</Text>
                            <Text size="sm" className="text-indigo-600 dark:text-indigo-500 font-semibold">{product.currency === 'USD' ? '$' : product.currency}{nasiyaTotalPrice}</Text>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <div className="flex gap-2 mb-2">
                        <Button 
                          variant="outline" 
                          size="medium" 
                          className="flex-[3] py-2 flex items-center justify-center h-[42px]"
                          aria-label="One-click buy"
                        >
                          <span className="text-sm">One Click Buy</span>
                        </Button>
                        <button
                          type="button"
                          onClick={toggleFavorite}
                          aria-pressed={isFavorite}
                          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          className={`flex-1 py-2 flex items-center justify-center h-[42px] rounded-lg border transition-all ${isFavorite ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            className="w-5 h-5"
                            fill={isFavorite ? 'currentColor' : 'none'}
                            stroke={isFavorite ? 'none' : 'currentColor'}
                            strokeWidth={1.8}
                          >
                            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                          </svg>
                        </button>
                      </div>
                      {inCartQuantity > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-lg h-[42px]">
                            <button
                              type="button"
                              onClick={() => updateQuantity(currentItemId, Math.max(0, inCartQuantity - 1))}
                              className="w-10 h-[40px] flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-l-lg"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-10 text-center text-sm font-medium text-gray-900 dark:text-gray-100">{inCartQuantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(currentItemId, inCartQuantity + 1)}
                              className="w-10 h-[40px] flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-r-lg"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <Button
                            variant="primary"
                            size="medium"
                            className="flex-1 py-2 text-sm h-[42px]"
                            onClick={() => navigate('/cart')}
                          >
                            Go to Bag
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="primary" 
                          size="medium" 
                          className="w-full py-2 text-sm h-[42px]" 
                          onClick={handleAddToBag}
                        >
                          Add to Bag
                        </Button>
                      )}
                    </div>

                  </div>
                  </div>
                </div>
            </div>
          )}
        </ContentBlock>
      </Section>

      {/* Fullscreen Image Modal */}
      {showFullImage && imagesForCurrentSelection.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button 
              onClick={closeFullImage}
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/70 z-10"
              aria-label="Close fullscreen view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button
              onClick={prevFullImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/70 text-white"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <img 
              src={imagesForCurrentSelection[fullImageIndex]} 
              alt={`${product?.name || 'Product'} full view`} 
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            
            <button
              onClick={nextFullImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/70 text-white"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="bg-gray-800/70 px-4 py-2 rounded-full">
                <Text size="sm" color="primary" className="text-white">{fullImageIndex + 1} / {imagesForCurrentSelection.length}</Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Description Section */}
      {product && (
        <Section background="light" size="lg" containerWidth="xl" className="pt-0">
          <ContentBlock spacing="sm">
            <div className="py-4">
              <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4">
                <button onClick={() => setActiveTab('description')} className={`px-6 py-3 transition-colors ${activeTab === 'description' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  <Text size="sm" weight="medium" color="inherit">Description</Text>
                </button>
                <button onClick={() => setActiveTab('characteristics')} className={`px-6 py-3 transition-colors ${activeTab === 'characteristics' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  <Text size="sm" weight="medium" color="inherit">Characteristics</Text>
                </button>
                <button onClick={() => setActiveTab('nasiya')} className={`px-6 py-3 transition-colors ${activeTab === 'nasiya' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  <Text size="sm" weight="medium" color="inherit">Nasiya</Text>
                </button>
              </div>
              {activeTab === 'description' && (
                <div className="space-y-6 max-w-4xl">
                  <div>
                    <H3 className="mb-4">About This Product</H3>
                    <AppleProductDescription className="mb-4">{product?.description || 'No description available yet.'}</AppleProductDescription>
                  </div>
                </div>
              )}
              {activeTab === 'characteristics' && (
                <div className="space-y-6 max-w-4xl">
                  <div>
                    <H3 className="mb-4">Characteristics</H3>
                    {product?.specs && Object.keys(product.specs || {}).length > 0 ? (
                      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specification</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                              {Object.entries(product.specs || {}).map(([key, value], idx) => (
                                <tr key={key} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-950'}>
                                  <td className="px-4 py-3 align-top w-1/3">
                                    <Text size="sm" color="secondary">{formatSpecLabel(key)}</Text>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Text size="sm" color="primary">{formatSpecValue(value)}</Text>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <Text size="sm" color="tertiary">No characteristics available yet.</Text>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'nasiya' && (
                <div className="space-y-6 max-w-4xl">
                  <div>
                    <H3 className="mb-4">Nasiya</H3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 space-y-2">
                      <div className="flex justify-between text-sm">
                        <Text size="sm" color="tertiary">Monthly payment ({selectedInstallmentPlan} months):</Text>
                        <Text size="sm" color="primary">{product.currency === 'USD' ? '$' : product.currency}{monthlyPayment}</Text>
                      </div>
                      <div className="flex justify-between text-sm">
                        <Text size="sm" color="tertiary">Base price x {quantity}:</Text>
                        <Text size="sm" color="secondary">{product.currency === 'USD' ? '$' : product.currency}{basePrice * quantity}</Text>
                      </div>
                      <div className="flex justify-between text-sm">
                        <Text size="sm" color="tertiary">Markup (30%):</Text>
                        <Text size="sm" color="secondary">{product.currency === 'USD' ? '+$' : '+' + product.currency}{nasiyaTotalPrice - (basePrice * quantity)}</Text>
                      </div>
                      <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-200 dark:border-gray-800">
                        <Text size="sm" color="secondary" weight="medium">Total cost:</Text>
                        <Text size="sm" className="text-indigo-600 dark:text-indigo-500 font-semibold">{product.currency === 'USD' ? '$' : product.currency}{nasiyaTotalPrice}</Text>
                      </div>
                    </div>
                    <Text size="xs" color="tertiary" className="mt-2">Detailed installment terms and conditions will appear here.</Text>
                  </div>
                </div>
              )}
            </div>
          </ContentBlock>
        </Section>
      )}

      {/* Floating product summary bar at top (appears after half-page scroll) */}
      {product && showTopSummary && (
                 <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {imagesForCurrentSelection.length > 0 && (
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <img src={imagesForCurrentSelection[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <Text size="sm" weight="medium" color="primary">{selectedTitle || product.name}</Text>
                <Caption>
                  {currentColorLabel}{currentRam ? ` • ${currentRam}` : ''}{currentStorage ? ` • ${currentStorage}` : ''}
                </Caption>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={decreaseQuantity} className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors" disabled={quantity <= 1}>
                  <span className="text-sm">-</span>
                </button>
                <span className="w-4 text-center text-gray-800 dark:text-gray-200 font-medium text-sm">{quantity}</span>
                <button onClick={increaseQuantity} className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <span className="text-sm">+</span>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <Text size="sm" weight="medium" className="text-indigo-600 dark:text-indigo-500 font-semibold">{currentPriceDisplay}</Text>
                {selectedPaymentType === 'full' && discount > 0 && (
                  <Text size="xs" className="text-gray-500 dark:text-gray-400">
                    was {product.currency === 'USD' ? '$' : product.currency}{basePrice * quantity}
                  </Text>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  aria-pressed={isFavorite}
                  className={`text-xs py-2 px-3 hidden sm:flex items-center gap-1 rounded-md border transition-all ${isFavorite ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    className="w-4 h-4"
                    fill={isFavorite ? 'currentColor' : 'none'}
                    stroke={isFavorite ? 'none' : 'currentColor'}
                    strokeWidth={1.8}
                  >
                    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                  </svg>
                  <span>{isFavorite ? 'Saved' : 'Save'}</span>
                </button>
                {inCartQuantity > 0 ? (
                  <Button variant="primary" size="small" className="text-xs py-2 px-3" onClick={() => navigate('/cart')}>Go to Bag</Button>
                ) : (
                  <Button variant="primary" size="small" className="text-xs py-2 px-3" onClick={handleAddToBag}>Add to Bag</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage; 