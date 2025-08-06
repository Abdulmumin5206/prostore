import React, { useState, useEffect } from 'react';
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
    colors: ['#1c1c1e', '#7d7e80', '#e3ccb4', '#bfd0dd', '#f5f5f7'],
    priceFrom: '$549',
    monthlyFrom: '$91.50/mo. for 6 mo.',
    tags: ['airpods', 'pro']
  }
];

// Available filters
const categories = ['All', 'iPhone', 'Mac', 'iPad', 'Watch', 'AirPods'];
const tags = ['All', 'new', 'pro', 'laptop'];

const ProductsPage: React.FC = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(sampleProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

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

      // Filter by tag
      if (selectedTag !== 'All') {
        result = result.filter(product => product.tags.includes(selectedTag));
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
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, selectedTag, searchQuery, sortBy]);

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedTag('All');
    setSearchQuery('');
    setSortBy('default');
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-black/90 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <H1 className="text-xl font-medium">Store</H1>
          </div>
          <div className="relative w-full max-w-xs ml-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-none text-gray-900 dark:text-white focus:outline-none focus:ring-0"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'block' : 'hidden'} w-64 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-60px)] overflow-y-auto sticky top-[60px]`}>
          <div className="p-6">
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block w-full text-left px-2 py-1.5 rounded-md ${
                      selectedCategory === category 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Tags</h3>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`block w-full text-left px-2 py-1.5 rounded-md ${
                      selectedTag === tag 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Sort By</h3>
              <div className="space-y-2">
                {[
                  { value: 'default', label: 'Featured' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'name', label: 'Name' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`block w-full text-left px-2 py-1.5 rounded-md ${
                      sortBy === option.value 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Active Filters */}
            {(selectedCategory !== 'All' || selectedTag !== 'All' || searchQuery) && (
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    {selectedCategory}
                    <button 
                      onClick={() => setSelectedCategory('All')} 
                      className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedTag !== 'All' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                    {selectedTag}
                    <button 
                      onClick={() => setSelectedTag('All')} 
                      className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
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
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </Text>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product)}
                    className="cursor-pointer group"
                  >
                    <div className="overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 aspect-square mb-4 transition-transform duration-300 group-hover:scale-[1.02]">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <Text size="xs" color="secondary" className="mb-1">{product.category}</Text>
                      <Text size="base" className="font-medium mb-1">{product.name}</Text>
                      <div className="flex space-x-2 mb-2">
                        {product.colors.map((color, index) => (
                          <div 
                            key={index} 
                            className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700" 
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <Text className="font-medium">{product.priceFrom}</Text>
                      <Text size="xs" color="secondary">{product.monthlyFrom}</Text>
                    </div>
                  </div>
                ))}
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
          </div>
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