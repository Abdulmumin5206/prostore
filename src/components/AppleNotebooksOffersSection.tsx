import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppleHeadline, AppleSubheadline, ApplePrice } from './Typography';

interface NotebookOffer {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
  tags: string[];
  originalPrice?: string;
  description?: string;
}

const AppleNotebooksOffersSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  
  const filterTags = [
    { id: 'macbook-air', name: 'MacBook Air' },
    { id: 'macbook-pro', name: 'MacBook Pro' },
    { id: 'accessories', name: 'Accessories' }
  ];
  
  const notebookOffers: NotebookOffer[] = [
    {
      id: 'macbook-air-m3-13',
      name: 'MacBook Air 13-inch M3 Chip',
      price: '$1,099',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-m3-midnight-select-202403?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1707780024707',
      link: '/store/macbook-air-m3-13',
      tags: ['macbook-air'],
      description: 'The most versatile Mac with M3 chip'
    },
    {
      id: 'macbook-air-m3-15',
      name: 'MacBook Air 15-inch M3 Chip',
      price: '$1,299',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-15-m3-midnight-select-202403?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1707780024707',
      link: '/store/macbook-air-m3-15',
      tags: ['macbook-air'],
      description: 'Bigger screen, same incredible performance'
    },
    {
      id: 'macbook-pro-14-m3',
      name: 'MacBook Pro 14-inch M3 Chip',
      price: '$1,599',
      originalPrice: '$1,799',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-m3-max-prospaceblack-select-202310?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1696962662666',
      link: '/store/macbook-pro-14-m3',
      tags: ['macbook-pro'],
      description: 'Pro performance for creative professionals'
    },
    {
      id: 'macbook-pro-16-m3',
      name: 'MacBook Pro 16-inch M3 Chip',
      price: '$2,499',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-16-m3-max-prospaceblack-select-202310?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1696962662666',
      link: '/store/macbook-pro-16-m3',
      tags: ['macbook-pro'],
      description: 'The ultimate Mac for power users'
    },
    {
      id: 'macbook-pro-14-m3-pro',
      name: 'MacBook Pro 14-inch M3 Pro',
      price: '$1,999',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-m3-pro-prospaceblack-select-202310?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1696962662666',
      link: '/store/macbook-pro-14-m3-pro',
      tags: ['macbook-pro'],
      description: 'Next-level performance with M3 Pro'
    },
    {
      id: 'macbook-pro-16-m3-pro',
      name: 'MacBook Pro 16-inch M3 Pro',
      price: '$2,499',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-16-m3-pro-prospaceblack-select-202310?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1696962662666',
      link: '/store/macbook-pro-16-m3-pro',
      tags: ['macbook-pro'],
      description: 'Maximum power for demanding workflows'
    },
    {
      id: 'magic-keyboard',
      name: 'Magic Keyboard with Touch ID',
      price: '$99',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MMMR3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1645719947833',
      link: '/store/magic-keyboard',
      tags: ['accessories'],
      description: 'Perfect companion for your Mac'
    },
    {
      id: 'magic-mouse',
      name: 'Magic Mouse',
      price: '$79',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MMMQ3?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1645719947833',
      link: '/store/magic-mouse',
      tags: ['accessories'],
      description: 'Wireless mouse with multi-touch surface'
    },
    // Second row products
    {
      id: 'airpods-pro',
      name: 'AirPods Pro (2nd generation)',
      price: '$249',
      originalPrice: '$279',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1660803972361',
      link: '/store/airpods-pro',
      tags: ['accessories'],
      description: 'Active noise cancellation for Mac'
    },
    {
      id: 'apple-care-mac',
      name: 'AppleCare+ for Mac',
      price: '$179',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/applecare-plus-mac-select-202108?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1629922152000',
      link: '/store/applecare-mac',
      tags: ['accessories'],
      description: 'Extended coverage and support'
    },
    {
      id: 'thunderbolt-cable',
      name: 'Thunderbolt 4 Pro Cable',
      price: '$129',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/thunderbolt-4-pro-cable-2m-select-202110?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1633020644000',
      link: '/store/thunderbolt-cable',
      tags: ['accessories'],
      description: 'High-speed data and power delivery'
    },
    {
      id: 'macbook-sleeve',
      name: 'MacBook Sleeve',
      price: '$59',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-sleeve-13-15-select-202108?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1629922152000',
      link: '/store/macbook-sleeve',
      tags: ['accessories'],
      description: 'Premium protection for your MacBook'
    }
  ];
  
  const filteredProducts = activeFilter 
    ? notebookOffers.filter(product => product.tags.includes(activeFilter))
    : notebookOffers;
  
  const displayedProducts = showMore 
    ? filteredProducts 
    : filteredProducts.slice(0, 8);
  
  return (
    <section className="py-16 px-4 bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="space-y-2">
            <AppleHeadline>Laptops.</AppleHeadline>
            <AppleSubheadline>
              Discover the perfect Mac for your needs
            </AppleSubheadline>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setActiveFilter(activeFilter === tag.id ? null : tag.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === tag.id
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {displayedProducts.map((product) => (
            <Link 
              key={product.id}
              to={product.link}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="p-4">
                <div className="aspect-square flex items-center justify-center mb-4 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center">
                    <ApplePrice className="text-lg">{product.price}</ApplePrice>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-500 line-through ml-2">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          {filteredProducts.length > 8 && (
            <button 
              onClick={() => setShowMore(!showMore)}
              className="px-6 py-3 mb-4 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              {showMore ? 'Show Less' : 'Show More Notebooks'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default AppleNotebooksOffersSection; 