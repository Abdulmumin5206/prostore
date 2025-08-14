import React, { useState, useEffect, useRef } from 'react';
import { Text, H1 } from '../components/Typography';
import ProductCard from '../components/ProductCard';
import FilterTag from '../components/FilterTag';
import ProductModal from '../components/ProductModal';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { listPublicProducts, PublicProduct } from '../lib/db';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

// Fetch live products when Supabase is configured
async function fetchLiveProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return []
  try {
    const rows: PublicProduct[] = await listPublicProducts()
    // Fetch extra images for hover if available
    let productIdToImages: Record<string, string[]> = {}
    if (supabase) {
      const productIds = Array.from(new Set(rows.map(r => r.product_id)))
      if (productIds.length > 0) {
        const { data: imagesRows, error } = await supabase
          .from('product_images')
          .select('product_id, url, is_primary, sort_order')
          .in('product_id', productIds)
        if (!error && imagesRows) {
          const grouped: Record<string, { url: string; is_primary: boolean; sort_order: number }[]> = {}
          for (const row of imagesRows as any[]) {
            const pid = row.product_id as string
            if (!grouped[pid]) grouped[pid] = []
            grouped[pid].push({ url: row.url, is_primary: row.is_primary, sort_order: row.sort_order })
          }
          productIdToImages = Object.fromEntries(
            Object.entries(grouped).map(([pid, arr]) => [
              pid,
              arr
                .sort((a,b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
                .map(x => x.url)
            ])
          )
        }
      }
    }

    // Group by product_id to aggregate variants across SKUs
    const byProduct: Record<string, PublicProduct[]> = {}
    for (const r of rows) {
      if (!byProduct[r.product_id]) byProduct[r.product_id] = []
      byProduct[r.product_id].push(r)
    }

    return Object.values(byProduct).map(group => {
      const r0 = group[0]
      const images = productIdToImages[r0.product_id] ?? [r0.primary_image || '']
      // Unique colors (hex) and storages
      const colorSet = new Set<string>()
      const storageSet = new Set<string>()
      let minPrice = Number.POSITIVE_INFINITY
      for (const r of group) {
        const attrs: any = (r as any).attributes || {}
        if (typeof attrs.color === 'string' && attrs.color) {
          colorSet.add(attrs.color)
        }
        if (typeof attrs.storage === 'string' && attrs.storage) {
          storageSet.add(attrs.storage)
        }
        if (typeof r.effective_price === 'number') {
          minPrice = Math.min(minPrice, Number(r.effective_price))
        }
      }
      const colors = Array.from(colorSet)
      const storages = Array.from(storageSet)
      const price = Number.isFinite(minPrice) ? minPrice : Number(r0.effective_price)

      return {
        id: r0.product_id,
        category: r0.category,
        brand: r0.brand,
        family: r0.family,
        model: r0.model,
        variant: r0.variant,
        name: r0.title,
        image: images[0] || '',
        images,
        colors,
        storages,
        priceFrom: `${r0.currency === 'USD' ? '$' : ''}${Number(price).toFixed(2)}`,
        monthlyFrom: `${r0.currency === 'USD' ? '$' : ''}${(Number(price)/24).toFixed(2)}/mo. for 24 mo.`,
        tags: [r0.brand.toLowerCase(), r0.category.toLowerCase(), r0.condition === 'second_hand' ? 'second-hand' : 'new']
      }
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Falling back to empty product list due to error', e)
    return []
  }
}


// Product data interface
interface Product {
  id: string;
  category: string;
  brand: string;
  family?: string | null;
  model?: string | null;
  variant?: string | null;
  name: string;
  image: string;
  images: string[]; // Array of multiple images
  colors: string[];
  storages: string[];
  priceFrom: string;
  monthlyFrom: string;
  tags: string[];
}

// Sample product data
const sampleProducts: Product[] = [];

// Available filters with subcategories
const categories = [
  { name: 'All', subcategories: [] },
  { 
    name: 'iPhone', 
    subcategories: ['iPhone 15 Pro', 'iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone SE', 'Compare']
  },
  { 
    name: 'Mac', 
    subcategories: ['MacBook Pro', 'MacBook Air', 'iMac', 'Mac mini', 'Mac Studio', 'Mac Pro', 'Compare']
  },
  { 
    name: 'iPad', 
    subcategories: ['iPad Pro', 'iPad Air', 'iPad', 'iPad mini', 'Compare']
  },
  { 
    name: 'Watch', 
    subcategories: ['Apple Watch Series 9', 'Apple Watch Ultra 2', 'Apple Watch SE', 'Compare']
  },
  { 
    name: 'AirPods', 
    subcategories: ['AirPods Pro', 'AirPods Max', 'AirPods (3rd generation)', 'Compare']
  },
  { 
    name: 'TV & Home', 
    subcategories: ['Apple TV 4K', 'HomePod mini', 'HomePod', 'Siri Remote']
  },
  { 
    name: 'Accessories', 
    subcategories: ['Cases & Protection', 'Charging', 'Audio', 'Storage', 'Cables & Adapters']
  },
  { 
    name: 'Services', 
    subcategories: ['AppleCare+', 'Apple One', 'Apple Music', 'iCloud+', 'Apple TV+', 'Apple Fitness+']
  }
];

const tags = [
  'All', 'new', 'pro', 'laptop', 'wireless', 'waterproof', '5G', 'M2', 'M3', 'Retina', 
  'Touch ID', 'Face ID', 'MagSafe', 'USB-C', 'Thunderbolt', 'Wi-Fi 6', 'Bluetooth 5.0', 
  'AppleCare+', 'Trade In', 'Free Delivery', 'Student Discount', 'Business', 'Education'
];
const quickFilters = ['Deals', 'New', 'Second Hand', 'Bestsellers'];

// Mapping from UI categories to DB categories/tokens
const UI_CATEGORY_PRESETS: Record<string, { dbCategories?: string[]; nameContains?: string[]; brand?: string }> = {
  'iPhone': { dbCategories: ['Phones'], nameContains: ['iphone'], brand: 'Apple' },
  'Mac': { dbCategories: ['Laptops', 'Desktops'], nameContains: ['mac', 'macbook', 'imac', 'mac mini', 'mac pro', 'mac studio'], brand: 'Apple' },
  'iPad': { dbCategories: ['Tablets'], nameContains: ['ipad'], brand: 'Apple' },
  'Watch': { dbCategories: ['Wearables'], nameContains: ['watch'], brand: 'Apple' },
  'AirPods': { dbCategories: ['Audio'], nameContains: ['airpods'], brand: 'Apple' },
  'TV & Home': { dbCategories: ['TV', 'Smart Home'], nameContains: ['apple tv', 'homepod'], brand: 'Apple' },
  'Accessories': { dbCategories: ['Accessories'], nameContains: ['case', 'charger', 'cable', 'adapter', 'keyboard', 'mouse'] },
}

function matchesUiCategory(product: Product, uiCategory: string): boolean {
  if (uiCategory === 'All') return true
  const preset = UI_CATEGORY_PRESETS[uiCategory]
  if (!preset) return (product.category || '').toLowerCase() === uiCategory.toLowerCase()
  const brandOk = preset.brand ? (product.brand || '').toLowerCase() === preset.brand.toLowerCase() : true
  const dbOk = preset.dbCategories ? preset.dbCategories.some(dc => (product.category || '').toLowerCase() === dc.toLowerCase()) : false
  const haystack = [product.name, product.family || '', product.model || '', product.variant || ''].join(' ').toLowerCase()
  const tokensOk = preset.nameContains ? preset.nameContains.some(tok => haystack.includes(tok.toLowerCase())) : false
  return brandOk && (dbOk || tokensOk)
}

function getUiCategoryLabel(product: Product): string {
	// If user already filtered by category, prefer that
	// Otherwise infer from presets
	for (const [ui, preset] of Object.entries(UI_CATEGORY_PRESETS)) {
		if (matchesUiCategory(product, ui)) return ui
	}
	// Fallback to DB category
	return product.category
}

const ProductsPage: React.FC = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [sourceProducts, setSourceProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [visibleProducts, setVisibleProducts] = useState<number>(12); // Show 3 rows of 4 products initially
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { addItem } = useCart();
  
  // Price range filters
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 3000 });
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 3000 });
  
  // Additional filters
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [selectedStorage, setSelectedStorage] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [selectedWarranty, setSelectedWarranty] = useState<string>('All');

  // New state for hover image functionality
  const [hoveredProductImages, setHoveredProductImages] = useState<{[key: string]: number}>({});

  // New state for expanded filter sections
  const [expandedFilters, setExpandedFilters] = useState<{[key: string]: boolean}>({});
  const [showAllFilterSections, setShowAllFilterSections] = useState<boolean>(false);

  const toggleFilterExpansion = (filterName: string) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // Track that the initial fetch has completed to avoid flicker
  const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);

  // Debounced search input state
  const [searchInput, setSearchInput] = useState<string>('');
  const searchDebounceRef = useRef<number | null>(null);

  // Mobile filters drawer toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Read and write query params for initial filters
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const cat = searchParams.get('category');
    const sub = searchParams.get('subcategory');
    const brand = searchParams.get('brand');
    const q = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (cat) setSelectedCategory(cat);
    if (sub) setSelectedSubcategory(sub);
    if (brand) setSelectedBrand(brand);
    if (q) setSearchInput(q);
    if (minPrice || maxPrice) {
      setSelectedPriceRange({
        min: minPrice ? Number(minPrice) : 0,
        max: maxPrice ? Number(maxPrice) : 3000,
      });
    }
    // Expand the selected category by default when provided
    if (cat) setExpandedCategory('All' === cat ? null : cat);
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const live = await fetchLiveProducts();
      setSourceProducts(live);
      setFilteredProducts(live);
      setIsLoading(false);
      setHasLoadedOnce(true);
    })();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    // Avoid triggering loading state before the first load completes
    if (!hasLoadedOnce) return;

    let result = [...sourceProducts];

    // Filter by category (map UI categories to DB categories/tokens)
    if (selectedCategory !== 'All') {
      result = result.filter(product => matchesUiCategory(product, selectedCategory));
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(selectedSubcategory.toLowerCase())
      );
    }

    // Filter by tag
    if (selectedTag !== 'All') {
      result = result.filter(product => product.tags.includes(selectedTag.toLowerCase()));
    }

    // Filter by price range
    if (selectedPriceRange.min > 0 || selectedPriceRange.max < 3000) {
      result = result.filter(product => {
        const price = parseFloat(product.priceFrom.replace('$', ''));
        return price >= selectedPriceRange.min && price <= selectedPriceRange.max;
      });
    }

    // Filter by brand (fix to use tags where brand is stored in lowercase)
    if (selectedBrand !== 'All') {
      result = result.filter(product => product.tags.includes(selectedBrand.toLowerCase()));
    }

    // Filter by condition
    if (selectedCondition !== 'All') {
      // Simulate condition filtering
      if (selectedCondition === 'New') {
        result = result.filter(product => product.tags.includes('new'));
      } else if (selectedCondition === 'Refurbished') {
        result = result.filter((_, index) => index % 4 === 0);
      } else if (selectedCondition === 'Used') {
        result = result.filter((_, index) => index % 3 === 0);
      }
    }

    // Filter by availability
    if (selectedAvailability !== 'All') {
      // Simulate availability filtering
      if (selectedAvailability === 'In Stock') {
        result = result.filter((_, index) => index % 2 === 0);
      } else if (selectedAvailability === 'Pre-order') {
        result = result.filter((_, index) => index % 5 === 0);
      }
    }

    // Filter by storage
    if (selectedStorage !== 'All') {
      result = result.filter(product => 
        product.storages.some(storage => storage.toLowerCase() === selectedStorage.toLowerCase())
      );
    }

    // Filter by color
    if (selectedColor !== 'All') {
      result = result.filter(product => 
        product.colors.some(color => {
          const colorMap: { [key: string]: string[] } = {
            'Black': ['#1c1c1e', '#555555'],
            'White': ['#f5f5f7', '#f1f2ed'],
            'Gold': ['#e3d0c0', '#f9e5c9', '#e3ccb4'],
            'Blue': ['#bfd0dd'],
            'Silver': ['#7e808e', '#7d7e80']
          };
          return colorMap[selectedColor]?.includes(color);
        })
      );
    }

    // Filter by warranty
    if (selectedWarranty !== 'All') {
      if (selectedWarranty === 'AppleCare+') {
        result = result.filter(product => product.tags.includes('applecare+'));
      }
    }

    // Filter by quick filter
    if (selectedQuickFilter) {
      switch (selectedQuickFilter) {
        case 'Deals':
          // Simulate deals by filtering products under $600
          result = result.filter(product => 
            parseFloat(product.priceFrom.replace('$', '')) < 600
          );
          break;
        case 'New':
          result = result.filter(product => product.tags.includes('new'));
          break;
        case 'Second Hand':
          // Simulate second hand by taking random products (in a real app, you'd have a property for this)
          result = result.filter((_, index) => index % 3 === 0);
          break;
        case 'Bestsellers':
          // Simulate bestsellers (in a real app, you'd have a property for this)
          result = result.filter((_, index) => index % 4 === 0 || index % 5 === 0);
          break;
        default:
          break;
      }
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        (product.category || '').toLowerCase().includes(query) ||
        (product.brand || '').toLowerCase().includes(query) ||
        (product.family || '').toLowerCase().includes(query) ||
        (product.model || '').toLowerCase().includes(query) ||
        (product.variant || '').toLowerCase().includes(query)
      );
    }

    // Sort results
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => parseFloat(a.priceFrom.replace('$', '')) - parseFloat(b.priceFrom.replace('$', '')));
        break;
      case 'price-high':
        result.sort((a, b) => parseFloat(b.priceFrom.replace('$', '')) - parseFloat(a.priceFrom.replace('$', '')));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [selectedCategory, selectedSubcategory, selectedTag, selectedQuickFilter, selectedPriceRange, selectedBrand, selectedCondition, selectedAvailability, selectedStorage, selectedColor, selectedWarranty, searchQuery, sortBy, sourceProducts, hasLoadedOnce]);

  // Debounce search input and update query params
  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(() => {
      setSearchQuery(searchInput);
      const params = new URLSearchParams(searchParams);
      if (searchInput) params.set('q', searchInput); else params.delete('q');
      setSearchParams(params, { replace: true });
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchInput]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubcategory('');
    setSelectedTag('All');
    setSelectedQuickFilter(null);
    setSelectedBrand('All');
    setSelectedCondition('All');
    setSelectedAvailability('All');
    setSelectedStorage('All');
    setSelectedColor('All');
    setSelectedWarranty('All');
    setSelectedPriceRange({ min: 0, max: 3000 });
    setSearchInput('');
    setSortBy('default');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Handle category click
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setExpandedCategory(category);
    setSelectedSubcategory('');
    setSelectedTag('All');
    setSelectedQuickFilter(null);

    // Update query parameters when category changes
    const params = new URLSearchParams(searchParams);
    if (category && category !== 'All') params.set('category', category); else params.delete('category');
    params.delete('subcategory');
    params.delete('brand');
    setSearchParams(params, { replace: true });
  };

  // Handle subcategory click
  const handleSubcategoryClick = (subcategory: string) => {
    setSelectedSubcategory(subcategory);

    const params = new URLSearchParams(searchParams);
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    params.set('subcategory', subcategory);
    setSearchParams(params, { replace: true });
  };

  // Handle quick filter click
  const handleQuickFilterClick = (filter: string) => {
    if (selectedQuickFilter === filter) {
      setSelectedQuickFilter(null);
    } else {
      setSelectedQuickFilter(filter);
    }
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Add to cart
  const parseCurrency = (priceFrom: string): { currency: string; amount: number } => {
    const hasDollar = priceFrom.trim().startsWith('$');
    const amount = parseFloat(priceFrom.replace(/[^0-9.]/g, '')) || 0;
    return { currency: hasDollar ? 'USD' : 'USD', amount };
  };

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCartItems(prev => [...prev, productId]);
    const product = filteredProducts.find(p => p.id === productId) || sourceProducts.find(p => p.id === productId);
    if (product) {
      const { amount, currency } = parseCurrency(product.priceFrom);
      addItem({
        id: product.id,
        name: product.name,
        image: product.image,
        unitPrice: amount,
        currency,
      }, 1);
    }
    // Show a brief notification or animation here if desired
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Show more products
  const handleShowMore = () => {
    setVisibleProducts(prev => Math.min(prev + 12, filteredProducts.length));
  };

  // Handle price range change
  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    setSelectedPriceRange(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  // Handle mouse move to change product image
  const handleProductImageHover = (productId: string, event: React.MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left; // x position within the element
    const width = rect.width;
    
    // Get the product
    const product = filteredProducts.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;
    
    // Determine which image to show based on cursor position
    let imageIndex = 0;
    const numImages = product.images.length;
    const sectionWidth = width / numImages;
    
    // Calculate which section the cursor is in
    for (let i = 0; i < numImages; i++) {
      if (x >= i * sectionWidth && x < (i + 1) * sectionWidth) {
        imageIndex = i;
        break;
      }
    }
    
    // Update the image index for this product
    setHoveredProductImages(prev => ({
      ...prev,
      [productId]: imageIndex
    }));
  };
  
  // Reset image on mouse leave
  const handleProductImageLeave = (productId: string) => {
    setHoveredProductImages(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  // Test card images (from public folder)
  const testCardImages = [
    '/Iphone_main/iphone_16pro_promax.jpg',
    '/Iphone_main/iphone_16_plus.jpg',
    '/Iphone_main/iphone_15_plus.jpg',
    '/Iphone_main/iphone_16e.jpg',
  ];

  // Handle hover for test card image
  const handleTestCardImageHover = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const numImages = testCardImages.length;
    const sectionWidth = width / numImages;
    let imageIndex = 0;
    for (let i = 0; i < numImages; i++) {
      if (x >= i * sectionWidth && x < (i + 1) * sectionWidth) {
        imageIndex = i;
        break;
      }
    }
    setHoveredProductImages(prev => ({ ...prev, ['test-card']: imageIndex }));
  };

  const handleTestCardImageLeave = () => {
    setHoveredProductImages(prev => {
      const next = { ...prev };
      delete next['test-card'];
      return next;
    });
  };

  // Test product for modal and labels
  const testProduct: Product = {
	id: 'test-card',
	category: 'Test Category',
	brand: 'Apple',
	family: 'iPhone',
	model: 'Test',
	variant: null,
	name: 'Test Product Name',
	image: testCardImages[0],
	images: testCardImages,
	colors: ['#111827', '#9CA3AF', '#F59E0B', '#3B82F6'],
	storages: ['128GB', '256GB'],
	priceFrom: '$999.00',
	monthlyFrom: '$41.63/mo. for 24 mo.',
	tags: ['test', 'iphone', 'new']
};

  // Second hardcoded card (Second hand)
  const testCard2Images = [
    '/macbook_main/mac-card-40-macbook-air-202503.jpg',
    '/macbook_main/mac-card-40-macbookpro-14-16-202410.jpg',
    '/macbook_main/mac-card-40-imac-202410.jpg',
    '/macbook_main/mac-card-40-mac-mini-202410.jpg',
  ];

  const handleTestCard2ImageHover = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const numImages = testCard2Images.length;
    const sectionWidth = width / numImages;
    let imageIndex = 0;
    for (let i = 0; i < numImages; i++) {
      if (x >= i * sectionWidth && x < (i + 1) * sectionWidth) {
        imageIndex = i;
        break;
      }
    }
    setHoveredProductImages(prev => ({ ...prev, ['test-card-2']: imageIndex }));
  };

  const handleTestCard2ImageLeave = () => {
    setHoveredProductImages(prev => {
      const next = { ...prev };
      delete next['test-card-2'];
      return next;
    });
  };

  const testProductSecondHand: Product = {
	id: 'test-card-2',
	category: 'Second Hand',
	brand: 'Apple',
	family: 'Mac',
	model: 'Refurbished',
	variant: null,
	name: 'Refurbished Mac Selection',
	image: testCard2Images[0],
	images: testCard2Images,
	colors: ['#1f2937', '#9ca3af'],
	storages: ['256GB', '512GB'],
	priceFrom: '$699.00',
	monthlyFrom: '$29.13/mo. for 24 mo.',
	tags: ['test', 'mac', 'second-hand']
};

  // Define which filter sections to show initially
  const initialFilterSections = ['Categories', 'Price Range', 'Brand'];
  const additionalFilterSections = ['Condition', 'Availability', 'Storage', 'Color', 'Warranty', 'Tags'];

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-[#f5f5f7]/90 dark:bg-black/90 border-b border-gray-200 dark:border-gray-800 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <H1 className="text-xl font-medium">Store</H1>
          <div className="relative w-full max-w-xs ml-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-none text-gray-900 dark:text-white focus:outline-none focus:ring-0"
            />
            <div className="absolute left-3 top-2.5 text-gray-400" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button
            className="ml-3 md:hidden inline-flex items-center px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium shadow-sm"
            onClick={() => setMobileFiltersOpen(true)}
            aria-label="Open filters"
          >
            Filters
          </button>
        </div>
      </header>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar - Desktop */}
        <aside className="w-56 pr-4 py-8 hidden md:block">
          <div className="space-y-8">
            {/* Categories - Always visible */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.slice(0, expandedFilters['categories'] ? categories.length : 4).map((category) => (
                  <div key={category.name}>
                    <button
                      onClick={() => handleCategoryClick(category.name)}
                      className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                        selectedCategory === category.name 
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        {category.subcategories.length > 0 && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-3 w-3 transition-transform ${expandedCategory === category.name ? 'rotate-90' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                    
                    {/* Subcategories */}
                    {expandedCategory === category.name && category.subcategories.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {category.subcategories.slice(0, expandedFilters[`subcategories-${category.name}`] ? category.subcategories.length : 4).map((subcategory) => (
                          <button
                            key={subcategory}
                            onClick={() => handleSubcategoryClick(subcategory)}
                            className={`block w-full text-left px-2 py-1 rounded-md text-xs ${
                              selectedSubcategory === subcategory 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-medium' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                            }`}
                          >
                            {subcategory}
                          </button>
                        ))}
                        
                        {category.subcategories.length > 4 && (
                          <button
                            onClick={() => toggleFilterExpansion(`subcategories-${category.name}`)}
                            className="block w-full text-left px-2 py-1 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {expandedFilters[`subcategories-${category.name}`] ? 'See less' : `See ${category.subcategories.length - 4} more`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {categories.length > 4 && (
                  <button
                    onClick={() => toggleFilterExpansion('categories')}
                    className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                  >
                    {expandedFilters['categories'] ? 'See less' : `See ${categories.length - 4} more`}
                  </button>
                )}
              </div>
            </div>

            {/* Price Range - Always visible */}
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
                <div className="text-xs text-gray-500">
                  ${selectedPriceRange.min} - ${selectedPriceRange.max}
                </div>
              </div>
            </div>

            {/* Brand - Always visible */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Brand</h3>
              <div className="space-y-2">
                {['All', 'Apple', 'Beats', 'Belkin', 'Logitech'].slice(0, expandedFilters['brands'] ? 5 : 4).map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                      selectedBrand === brand 
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
                
                {['All', 'Apple', 'Beats', 'Belkin', 'Logitech'].length > 4 && (
                  <button
                    onClick={() => toggleFilterExpansion('brands')}
                    className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {expandedFilters['brands'] ? 'See less' : 'See more'}
                  </button>
                )}
              </div>
            </div>

            {/* See more filters button */}
            {!showAllFilterSections && (
              <button
                onClick={() => setShowAllFilterSections(true)}
                className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                See more filters
              </button>
            )}

            {/* Additional filters - Only visible when expanded */}
            {showAllFilterSections && (
              <>
                {/* Condition */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Condition</h3>
                  <div className="space-y-2">
                    {['All', 'New', 'Refurbished', 'Used'].map((condition) => (
                      <button
                        key={condition}
                        onClick={() => setSelectedCondition(condition)}
                        className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                          selectedCondition === condition 
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Availability</h3>
                  <div className="space-y-2">
                    {['All', 'In Stock', 'Pre-order', 'Out of Stock'].slice(0, expandedFilters['availability'] ? 4 : 3).map((availability) => (
                      <button
                        key={availability}
                        onClick={() => setSelectedAvailability(availability)}
                        className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                          selectedAvailability === availability 
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        {availability}
                      </button>
                    ))}
                    
                    {['All', 'In Stock', 'Pre-order', 'Out of Stock'].length > 3 && (
                      <button
                        onClick={() => toggleFilterExpansion('availability')}
                        className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {expandedFilters['availability'] ? 'See less' : 'See more'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Storage</h3>
                  <div className="space-y-2">
                    {['All', '128GB', '256GB', '512GB', '1TB', '2TB'].slice(0, expandedFilters['storage'] ? 6 : 4).map((storage) => (
                      <button
                        key={storage}
                        onClick={() => setSelectedStorage(storage)}
                        className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                          selectedStorage === storage 
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        {storage}
                      </button>
                    ))}
                    
                    {['All', '128GB', '256GB', '512GB', '1TB', '2TB'].length > 4 && (
                      <button
                        onClick={() => toggleFilterExpansion('storage')}
                        className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {expandedFilters['storage'] ? 'See less' : 'See more'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Color</h3>
                  <div className="space-y-2">
                    {['All', 'Black', 'White', 'Gold', 'Blue', 'Silver'].slice(0, expandedFilters['colors'] ? 6 : 4).map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                          selectedColor === color 
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                    
                    {['All', 'Black', 'White', 'Gold', 'Blue', 'Silver'].length > 4 && (
                      <button
                        onClick={() => toggleFilterExpansion('colors')}
                        className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {expandedFilters['colors'] ? 'See less' : 'See more'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Warranty */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Warranty</h3>
                  <div className="space-y-2">
                    {['All', 'AppleCare+', 'Standard', 'Extended'].map((warranty) => (
                      <button
                        key={warranty}
                        onClick={() => setSelectedWarranty(warranty)}
                        className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                          selectedWarranty === warranty 
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        {warranty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tags</h3>
                  <div className="space-y-2">
                    {tags.slice(0, expandedFilters['tags'] ? tags.length : 4).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                          selectedTag === tag 
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    
                    {tags.length > 4 && (
                      <button
                        onClick={() => toggleFilterExpansion('tags')}
                        className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {expandedFilters['tags'] ? 'See less' : `See ${tags.length - 4} more`}
                      </button>
                    )}
                  </div>
                </div>

                {/* See fewer filters button */}
                <button
                  onClick={() => setShowAllFilterSections(false)}
                  className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  See fewer filters
                </button>
              </>
            )}

            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </aside>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)}></div>
            <div className="relative ml-auto h-full w-80 max-w-full bg-white dark:bg-gray-900 shadow-xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <Text weight="semibold">Filters</Text>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800"
                  aria-label="Close filters"
                >
                  Close
                </button>
              </div>
              {/* Clone of sidebar content */}
              <div className="space-y-8">
                {/* Categories - Always visible */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
                  <div className="space-y-1">
                    {categories.slice(0, expandedFilters['categories'] ? categories.length : 4).map((category) => (
                      <div key={category.name}>
                        <button
                          onClick={() => handleCategoryClick(category.name)}
                          className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                            selectedCategory === category.name 
                              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{category.name}</span>
                            {category.subcategories.length > 0 && (
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-3 w-3 transition-transform ${expandedCategory === category.name ? 'rotate-90' : ''}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                        
                        {/* Subcategories */}
                        {expandedCategory === category.name && category.subcategories.length > 0 && (
                          <div className="ml-4 mt-1 space-y-1">
                            {category.subcategories.slice(0, expandedFilters[`subcategories-${category.name}`] ? category.subcategories.length : 4).map((subcategory) => (
                              <button
                                key={subcategory}
                                onClick={() => handleSubcategoryClick(subcategory)}
                                className={`block w-full text-left px-2 py-1 rounded-md text-xs ${
                                  selectedSubcategory === subcategory 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-medium' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
                                }`}
                              >
                                {subcategory}
                              </button>
                            ))}
                            
                            {category.subcategories.length > 4 && (
                              <button
                                onClick={() => toggleFilterExpansion(`subcategories-${category.name}`)}
                                className="block w-full text-left px-2 py-1 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {expandedFilters[`subcategories-${category.name}`] ? 'See less' : `See ${category.subcategories.length - 4} more`}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {categories.length > 4 && (
                      <button
                        onClick={() => toggleFilterExpansion('categories')}
                        className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                      >
                        {expandedFilters['categories'] ? 'See less' : `See ${categories.length - 4} more`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Price Range - Always visible */}
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
                    <div className="text-xs text-gray-500">
                      ${selectedPriceRange.min} - ${selectedPriceRange.max}
                    </div>
                  </div>
                </div>

                {/* Brand - Always visible */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Brand</h3>
                  <div className="space-y-2">
                    {['All', 'Apple', 'Beats', 'Belkin', 'Logitech'].slice(0, expandedFilters['brands'] ? 5 : 4).map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                          selectedBrand === brand 
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                    
                    {['All', 'Apple', 'Beats', 'Belkin', 'Logitech'].length > 4 && (
                      <button
                        onClick={() => toggleFilterExpansion('brands')}
                        className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {expandedFilters['brands'] ? 'See less' : 'See more'}
                      </button>
                    )}
                  </div>
                </div>

                {/* See more filters button */}
                {!showAllFilterSections && (
                  <button
                    onClick={() => setShowAllFilterSections(true)}
                    className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    See more filters
                  </button>
                )}

                {/* Additional filters - Only visible when expanded */}
                {showAllFilterSections && (
                  <>
                    {/* Condition */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Condition</h3>
                      <div className="space-y-2">
                        {['All', 'New', 'Refurbished', 'Used'].map((condition) => (
                          <button
                            key={condition}
                            onClick={() => setSelectedCondition(condition)}
                            className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                              selectedCondition === condition 
                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                            }`}
                          >
                            {condition}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Availability</h3>
                      <div className="space-y-2">
                        {['All', 'In Stock', 'Pre-order', 'Out of Stock'].slice(0, expandedFilters['availability'] ? 4 : 3).map((availability) => (
                          <button
                            key={availability}
                            onClick={() => setSelectedAvailability(availability)}
                            className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                              selectedAvailability === availability 
                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                            }`}
                          >
                            {availability}
                          </button>
                        ))}
                        
                        {['All', 'In Stock', 'Pre-order', 'Out of Stock'].length > 3 && (
                          <button
                            onClick={() => toggleFilterExpansion('availability')}
                            className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {expandedFilters['availability'] ? 'See less' : 'See more'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Storage */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Storage</h3>
                      <div className="space-y-2">
                        {['All', '128GB', '256GB', '512GB', '1TB', '2TB'].slice(0, expandedFilters['storage'] ? 6 : 4).map((storage) => (
                          <button
                            key={storage}
                            onClick={() => setSelectedStorage(storage)}
                            className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                              selectedStorage === storage 
                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                            }`}
                          >
                            {storage}
                          </button>
                        ))}
                        
                        {['All', '128GB', '256GB', '512GB', '1TB', '2TB'].length > 4 && (
                          <button
                            onClick={() => toggleFilterExpansion('storage')}
                            className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {expandedFilters['storage'] ? 'See less' : 'See more'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Color</h3>
                      <div className="space-y-2">
                        {['All', 'Black', 'White', 'Gold', 'Blue', 'Silver'].slice(0, expandedFilters['colors'] ? 6 : 4).map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                              selectedColor === color 
                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                        
                        {['All', 'Black', 'White', 'Gold', 'Blue', 'Silver'].length > 4 && (
                          <button
                            onClick={() => toggleFilterExpansion('colors')}
                            className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {expandedFilters['colors'] ? 'See less' : 'See more'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Warranty */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Warranty</h3>
                      <div className="space-y-2">
                        {['All', 'AppleCare+', 'Standard', 'Extended'].map((warranty) => (
                          <button
                            key={warranty}
                            onClick={() => setSelectedWarranty(warranty)}
                            className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                              selectedWarranty === warranty 
                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                            }`}
                          >
                            {warranty}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tags</h3>
                      <div className="space-y-2">
                        {tags.slice(0, expandedFilters['tags'] ? tags.length : 4).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`block w-full text-left px-2 py-1.5 rounded-md text-sm ${
                              selectedTag === tag 
                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium shadow-sm' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                        
                        {tags.length > 4 && (
                          <button
                            onClick={() => toggleFilterExpansion('tags')}
                            className="block w-full text-left px-2 py-1.5 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {expandedFilters['tags'] ? 'See less' : `See ${tags.length - 4} more`}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* See fewer filters button */}
                    <button
                      onClick={() => setShowAllFilterSections(false)}
                      className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      See fewer filters
                    </button>
                  </>
                )}

                <button
                  onClick={resetFilters}
                  className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 py-8 px-4">
          {/* Quick Filters and Sort */}
          <div className="mb-6 flex flex-wrap justify-between items-center">
            {/* Quick Filter Tags */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
              {quickFilters.map((filter) => (
                <FilterTag
                  key={filter}
                  label={filter}
                  isActive={selectedQuickFilter === filter}
                  onClick={() => handleQuickFilterClick(filter)}
                />
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium shadow-sm"
              >
                <span className="mr-1">Sort By: </span>
                <span className="font-medium">
                  {sortBy === 'default' && 'Featured'}
                  {sortBy === 'price-low' && 'Price: Low to High'}
                  {sortBy === 'price-high' && 'Price: High to Low'}
                  {sortBy === 'name' && 'Name'}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isSortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {[
                      { value: 'default', label: 'Featured' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'name', label: 'Name' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          sortBy === option.value
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        role="menuitem"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== 'All' || selectedSubcategory || selectedTag !== 'All' || selectedQuickFilter || searchQuery || selectedPriceRange.min > 0 || selectedPriceRange.max < 3000 || selectedBrand !== 'All' || selectedCondition !== 'All' || selectedAvailability !== 'All' || selectedStorage !== 'All' || selectedColor !== 'All' || selectedWarranty !== 'All') && (
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm">
                  {selectedCategory}
                  <button 
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedSubcategory('');
                      setExpandedCategory(null);
                    }} 
                    className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedSubcategory && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                  {selectedSubcategory}
                  <button 
                    onClick={() => { setSelectedSubcategory(''); const p=new URLSearchParams(searchParams); p.delete('subcategory'); setSearchParams(p,{replace:true}); }} 
                    className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {(selectedPriceRange.min > 0 || selectedPriceRange.max < 3000) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                  ${selectedPriceRange.min} - ${selectedPriceRange.max}
                  <button 
                    onClick={() => setSelectedPriceRange({ min: 0, max: 3000 })} 
                    className="ml-1 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedBrand !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                  {selectedBrand}
                  <button 
                    onClick={() => setSelectedBrand('All')} 
                    className="ml-1 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedCondition !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200">
                  {selectedCondition}
                  <button 
                    onClick={() => setSelectedCondition('All')} 
                    className="ml-1 text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedAvailability !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200">
                  {selectedAvailability}
                  <button 
                    onClick={() => setSelectedAvailability('All')} 
                    className="ml-1 text-teal-500 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedStorage !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200">
                  {selectedStorage}
                  <button 
                    onClick={() => setSelectedStorage('All')} 
                    className="ml-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedColor !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200">
                  {selectedColor}
                  <button 
                    onClick={() => setSelectedColor('All')} 
                    className="ml-1 text-pink-500 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedWarranty !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                  {selectedWarranty}
                  <button 
                    onClick={() => setSelectedWarranty('All')} 
                    className="ml-1 text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm">
                  "{searchQuery}"
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && (
            <div className="mb-6">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Showing {Math.min(visibleProducts, filteredProducts.length)} of {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </Text>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col h-full relative rounded-2xl overflow-hidden">
                    <div className="overflow-hidden rounded-xl aspect-square mb-4 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                    <div className="px-3 mb-2 space-y-2">
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                      <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    </div>
                    <div className="px-3 pb-3">
                      <div className="h-9 w-full bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Hardcoded test card */}
                <div 
                  key="test-card" 
                  className="flex flex-col h-full relative group rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white dark:bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-0"></div>
                  <div className="cursor-pointer flex-grow relative z-10" onClick={() => handleProductClick(testProduct)}>
                    <div
                      className="overflow-hidden rounded-xl aspect-square mb-4 transition-transform duration-300 group-hover:scale-[1.02] relative"
                      onMouseMove={handleTestCardImageHover}
                      onMouseLeave={handleTestCardImageLeave}
                    >
                      {/* Badges */}
                      {testProduct.tags?.includes('new') && (
                        <span className="absolute left-2 top-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-600 text-white">New</span>
                      )}
                      <img
                        src={testCardImages[hoveredProductImages['test-card'] ?? 0]}
                        alt="Test Product"
                        className="w-full h-full object-cover transition-opacity duration-300"
                        loading="lazy"
                      />
                      {/* Image indicator dots - only visible on hover */}
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {testCardImages.map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              (hoveredProductImages['test-card'] ?? 0) === idx
                                ? 'bg-blue-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          ></span>
                        ))}
                      </div>
                    </div>
                    <div className="px-3 mb-2">
                      <Text size="xs" color="secondary" className="mb-1">{testProduct.category}</Text>
                      <Text size="base" className="font-bold mb-2 text-black dark:text-white">{testProduct.name}</Text>
                      <div className="flex items-center gap-1.5 mb-2">
                        {testProduct.colors.map((color, idx) => (
                          <span
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-700"
                            style={{ backgroundColor: color }}
                            aria-label={`Color option ${idx + 1}`}
                          />
                        ))}
                      </div>
                      <Text className="font-bold mb-1 text-black dark:text-white text-lg">{testProduct.priceFrom}</Text>
                      <Text size="xs" color="secondary" className="mb-1">{testProduct.monthlyFrom}</Text>
                    </div>
                  </div>
                  <div className="px-3 pb-3 relative z-10">
                    <button
                      onClick={(e) => handleAddToCart('test-card', e)}
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Hardcoded second-hand test card */}
                <div 
                  key="test-card-2" 
                  className="flex flex-col h-full relative group rounded-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white dark:bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-0"></div>
                  <div className="cursor-pointer flex-grow relative z-10" onClick={() => handleProductClick(testProductSecondHand)}>
                    <div
                      className="overflow-hidden rounded-xl aspect-square mb-4 transition-transform duration-300 group-hover:scale-[1.02] relative"
                      onMouseMove={handleTestCard2ImageHover}
                      onMouseLeave={handleTestCard2ImageLeave}
                    >
                      {/* Badges */}
                      {testProductSecondHand.tags?.includes('second-hand') && (
                        <span className="absolute left-2 top-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-600 text-white">Second hand</span>
                      )}
                      <img
                        src={testCard2Images[hoveredProductImages['test-card-2'] ?? 0]}
                        alt="Second Hand Product"
                        className="w-full h-full object-cover transition-opacity duration-300"
                        loading="lazy"
                      />
                      {/* Image indicator dots - only visible on hover */}
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {testCard2Images.map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              (hoveredProductImages['test-card-2'] ?? 0) === idx
                                ? 'bg-blue-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          ></span>
                        ))}
                      </div>
                    </div>
                    <div className="px-3 mb-2">
                      <Text size="xs" color="secondary" className="mb-1">{testProductSecondHand.category}</Text>
                      <Text size="base" className="font-bold mb-2 text-black dark:text-white">{testProductSecondHand.name}</Text>
                      <div className="flex items-center gap-1.5 mb-2">
                        {testProductSecondHand.colors.map((color, idx) => (
                          <span
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-700"
                            style={{ backgroundColor: color }}
                            aria-label={`Color option ${idx + 1}`}
                          />
                        ))}
                      </div>
                      <Text className="font-bold mb-1 text-black dark:text-white text-lg">{testProductSecondHand.priceFrom}</Text>
                      <Text size="xs" color="secondary" className="mb-1">{testProductSecondHand.monthlyFrom}</Text>
                    </div>
                  </div>
                  <div className="px-3 pb-3 relative z-10">
                    <button
                      onClick={(e) => handleAddToCart('test-card-2', e)}
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Add to Cart
                    </button>
                  </div>
                </div>
                {filteredProducts.slice(0, visibleProducts).map((product) => (
                  <div 
                    key={product.id} 
                    className="flex flex-col h-full relative group rounded-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white dark:bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-0"></div>
                    <div 
                      onClick={() => handleProductClick(product)}
                      className="cursor-pointer flex-grow relative z-10"
                    >
                      <div 
                        className="overflow-hidden rounded-xl aspect-square mb-4 transition-transform duration-300 group-hover:scale-[1.02] relative"
                        onMouseMove={(e) => handleProductImageHover(product.id, e)}
                        onMouseLeave={() => handleProductImageLeave(product.id)}
                      >
                        {/* Badges */}
                        {product.tags?.includes('new') && (
                          <span className="absolute left-2 top-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-600 text-white">New</span>
                        )}
                        {product.tags?.includes('second-hand') && (
                          <span className="absolute left-2 top-2 z-10 mt-6 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-600 text-white">Second hand</span>
                        )}
                        <img 
                          src={hoveredProductImages[product.id] !== undefined && product.images ? 
                            product.images[hoveredProductImages[product.id]] : product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-opacity duration-300"
                          loading="lazy"
                        />
                        {/* Image indicator dots - only visible on hover */}
                        {product.images && product.images.length > 1 && (
                          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {product.images.map((_, idx) => (
                              <span 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full ${
                                  hoveredProductImages[product.id] === idx 
                                    ? 'bg-blue-500' 
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              ></span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="px-3 mb-2">
                        <Text size="xs" color="secondary" className="mb-1">{getUiCategoryLabel(product)}</Text>
                        <Text size="base" className="font-bold mb-2 text-black dark:text-white">{product.name}</Text>
                        {/* Color swatches */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-2">
                            {product.colors.slice(0, 6).map((color, idx) => (
                              <span
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-700"
                                style={{ backgroundColor: color }}
                                aria-label={`Color option ${idx + 1}`}
                              />
                            ))}
                            {product.colors.length > 6 && (
                              <span className="text-xs text-gray-500">+{product.colors.length - 6}</span>
                            )}
                          </div>
                        )}
                        <Text className="font-bold mb-1 text-black dark:text-white text-lg">{product.priceFrom}</Text>
                        <Text size="xs" color="secondary" className="mb-1">{product.monthlyFrom}</Text>
                      </div>
                    </div>
                    <div className="px-3 pb-3 relative z-10">
                      <button
                        onClick={(e) => handleAddToCart(product.id, e)}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show More Button */}
              {visibleProducts < filteredProducts.length && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleShowMore}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Show More
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <Text size="lg" className="mb-4">No products found matching your criteria.</Text>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
      
      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductsPage; 