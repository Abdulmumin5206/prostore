import React, { useState, useEffect, useRef } from 'react';
import { Text, H1 } from '../components/Typography';
import ProductCard from '../components/ProductCard';
import FilterTag from '../components/FilterTag';
import ProductModal from '../components/ProductModal';

// Product data interface
interface Product {
  id: string;
  category: string;
  name: string;
  image: string;
  images: string[]; // Array of multiple images
  colors: string[];
  priceFrom: string;
  monthlyFrom: string;
  tags: string[];
}

// Sample product data
const sampleProducts: Product[] = [
  {
    id: 'iphone-15-pro',
    category: 'iPhone',
    name: 'iPhone 15 Pro',
    image: 'https://images.pexels.com/photos/5750001/pexels-photo-5750001.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/5750001/pexels-photo-5750001.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7795634/pexels-photo-7795634.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/13936668/pexels-photo-13936668.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: ['#555555', '#e3d0c0', '#f1f2ed'],
    priceFrom: '$999',
    monthlyFrom: '$41.62/mo. for 24 mo.',
    tags: ['iphone', 'new', 'pro']
  },
  {
    id: 'iphone-15',
    category: 'iPhone',
    name: 'iPhone 15',
    image: 'https://images.pexels.com/photos/13936668/pexels-photo-13936668.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/13936668/pexels-photo-13936668.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/5750001/pexels-photo-5750001.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7795634/pexels-photo-7795634.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: ['#1c1c1e', '#f9e5c9', '#7e808e', '#6e3d33', '#bfd0dd'],
    priceFrom: '$799',
    monthlyFrom: '$33.29/mo. for 24 mo.',
    tags: ['iphone', 'new']
  },
  {
    id: 'macbook-pro-16',
    category: 'Mac',
    name: 'MacBook Pro 16"',
    image: 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: ['#1c1c1e', '#f5f5f7'],
    priceFrom: '$2499',
    monthlyFrom: '$208.25/mo. for 12 mo.',
    tags: ['mac', 'laptop', 'pro']
  },
  {
    id: 'macbook-air',
    category: 'Mac',
    name: 'MacBook Air',
    image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: ['#1c1c1e', '#f5f5f7', '#7d7e80', '#e3ccb4'],
    priceFrom: '$999',
    monthlyFrom: '$83.25/mo. for 12 mo.',
    tags: ['mac', 'laptop']
  },
  {
    id: 'ipad-pro',
    category: 'iPad',
    name: 'iPad Pro',
    image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1334598/pexels-photo-1334598.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1716659/pexels-photo-1716659.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: ['#1c1c1e', '#f5f5f7'],
    priceFrom: '$799',
    monthlyFrom: '$66.58/mo. for 12 mo.',
    tags: ['ipad', 'pro']
  },
  {
    id: 'ipad-air',
    category: 'iPad',
    name: 'iPad Air',
    image: 'https://images.pexels.com/photos/1334598/pexels-photo-1334598.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1334598/pexels-photo-1334598.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1716659/pexels-photo-1716659.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: ['#1c1c1e', '#f5f5f7', '#7d7e80', '#e3ccb4', '#bfd0dd'],
    priceFrom: '$599',
    monthlyFrom: '$49.91/mo. for 12 mo.',
    tags: ['ipad']
  },
  {
    id: 'apple-watch-9',
    category: 'Watch',
    name: 'Apple Watch Series 9',
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/437038/pexels-photo-437038.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: ['#1c1c1e', '#f5f5f7', '#e3ccb4', '#bfd0dd'],
    priceFrom: '$399',
    monthlyFrom: '$33.25/mo. for 12 mo.',
    tags: ['watch', 'new']
  },
  {
    id: 'apple-watch-ultra',
    category: 'Watch',
    name: 'Apple Watch Ultra 2',
    image: 'https://images.pexels.com/photos/437038/pexels-photo-437038.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/437038/pexels-photo-437038.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: ['#7d7e80', '#f5f5f7'],
    priceFrom: '$799',
    monthlyFrom: '$66.58/mo. for 12 mo.',
    tags: ['watch', 'pro', 'new']
  },
  {
    id: 'airpods-pro',
    category: 'AirPods',
    name: 'AirPods Pro',
    image: 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/7156886/pexels-photo-7156886.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: ['#f5f5f7'],
    priceFrom: '$249',
    monthlyFrom: '$41.50/mo. for 6 mo.',
    tags: ['airpods', 'pro']
  },
  {
    id: 'airpods-max',
    category: 'AirPods',
    name: 'AirPods Max',
    image: 'https://images.pexels.com/photos/7156886/pexels-photo-7156886.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/7156886/pexels-photo-7156886.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    colors: ['#1c1c1e', '#7d7e80', '#e3ccb4', '#bfd0dd', '#f5f5f7'],
    priceFrom: '$549',
    monthlyFrom: '$91.50/mo. for 6 mo.',
    tags: ['airpods', 'pro']
  }
];

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

const ProductsPage: React.FC = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(sampleProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [visibleProducts, setVisibleProducts] = useState<number>(12); // Show 3 rows of 4 products initially
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
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

  // Apply filters when dependencies change
  useEffect(() => {
    // Set loading state
    setIsLoading(true);
    
    // Simulate a small delay to show loading state (can be removed in production)
    const timeoutId = setTimeout(() => {
      let result = [...sampleProducts];

      // Filter by category
      if (selectedCategory !== 'All') {
        result = result.filter(product => product.category === selectedCategory);
      }

      // Filter by subcategory
      if (selectedSubcategory) {
        result = result.filter(product => 
          product.name.toLowerCase().includes(selectedSubcategory.toLowerCase())
        );
      }

      // Filter by tag
      if (selectedTag !== 'All') {
        result = result.filter(product => product.tags.includes(selectedTag));
      }

      // Filter by price range
      if (selectedPriceRange.min > 0 || selectedPriceRange.max < 3000) {
        result = result.filter(product => {
          const price = parseFloat(product.priceFrom.replace('$', ''));
          return price >= selectedPriceRange.min && price <= selectedPriceRange.max;
        });
      }

      // Filter by brand
      if (selectedBrand !== 'All') {
        result = result.filter(product => product.category === selectedBrand);
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
          product.name.toLowerCase().includes(selectedStorage.toLowerCase())
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
          result = result.filter(product => product.tags.includes('AppleCare+'));
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
          product.category.toLowerCase().includes(query)
        );
      }

      // Apply sorting
      if (sortBy === 'price-low') {
        result.sort((a, b) => parseFloat(a.priceFrom.replace('$', '')) - parseFloat(b.priceFrom.replace('$', '')));
      } else if (sortBy === 'price-high') {
        result.sort((a, b) => parseFloat(b.priceFrom.replace('$', '')) - parseFloat(a.priceFrom.replace('$', '')));
      } else if (sortBy === 'name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
      }

      setFilteredProducts(result);
      setVisibleProducts(12); // Reset pagination when filters change
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, selectedSubcategory, selectedTag, selectedQuickFilter, searchQuery, sortBy, selectedPriceRange, selectedBrand, selectedCondition, selectedAvailability, selectedStorage, selectedColor, selectedWarranty]);

  // Toggle filter expansion
  const toggleFilterExpansion = (filterName: string) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubcategory('');
    setSelectedTag('All');
    setSelectedQuickFilter(null);
    setSearchQuery('');
    setSortBy('default');
    setExpandedCategory(null);
    setSelectedPriceRange({ min: 0, max: 3000 });
    setSelectedBrand('All');
    setSelectedCondition('All');
    setSelectedAvailability('All');
    setSelectedStorage('All');
    setSelectedColor('All');
    setSelectedWarranty('All');
    setExpandedFilters({}); // Reset expanded filters
    setShowAllFilterSections(false); // Hide additional filter sections
  };

  // Handle category click
  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory('All');
      setSelectedSubcategory('');
      setExpandedCategory(null);
    } else {
      setSelectedCategory(categoryName);
      setSelectedSubcategory('');
      setExpandedCategory(categoryName);
    }
  };

  // Handle subcategory click
  const handleSubcategoryClick = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
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
  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCartItems(prev => [...prev, productId]);
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
      [type]: value
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
        </div>
      </header>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar - Modified to show all content without scrolling */}
        <aside className="w-56 pr-4 py-8">
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

        {/* Main Content */}
        <main className="flex-1 py-8 px-4">
          {/* Quick Filters and Sort */}
          <div className="mb-6 flex flex-wrap justify-between items-center">
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleQuickFilterClick(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedQuickFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                >
                  {filter}
                </button>
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
                    onClick={() => setSelectedSubcategory('')} 
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
          <div className="mb-6">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Showing {Math.min(visibleProducts, filteredProducts.length)} of {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </Text>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        className="overflow-hidden rounded-xl aspect-square mb-4 transition-transform duration-300 group-hover:scale-[1.02]"
                        onMouseMove={(e) => handleProductImageHover(product.id, e)}
                        onMouseLeave={() => handleProductImageLeave(product.id)}
                      >
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
                        <Text size="xs" color="secondary" className="mb-1">{product.category}</Text>
                        <Text size="base" className="font-bold mb-2 text-black dark:text-white">{product.name}</Text>
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