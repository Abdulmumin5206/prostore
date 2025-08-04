import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppleHeadline, ApplePrice } from './Typography';

interface ProductOffer {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
  tags: string[];
  originalPrice?: string;
}

const BestOffersSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  
  const filterTags = [
    { id: 'bestseller', name: 'Best Seller' },
    { id: 'recommended', name: 'Recommended' },
    { id: 'new', name: 'New' }
  ];
  
  const productOffers: ProductOffer[] = [
    {
      id: 'iphone-16-black',
      name: 'Apple iPhone 16 128 GB Black',
      price: '$999',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-black-select-202409?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1718808501962',
      link: '/store/iphone-16-black',
      tags: ['bestseller', 'recommended']
    },
    {
      id: 'jbl-partybox',
      name: 'JBL PartyBox 320, 240W, Black',
      price: '$449',
      originalPrice: '$499',
      image: 'https://www.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw1c9c4cde/JBL_PartyBox_320_Hero_x1.png',
      link: '/store/jbl-partybox',
      tags: ['bestseller']
    },
    {
      id: 'iphone-16-teal',
      name: 'Apple iPhone 16 128 GB Teal',
      price: '$999',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-teal-select-202409?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1718808498442',
      link: '/store/iphone-16-teal',
      tags: ['new']
    },
    {
      id: 'iphone-16-blue',
      name: 'Apple iPhone 16 128 GB Blue',
      price: '$999',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-blue-select-202409?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1718808500329',
      link: '/store/iphone-16-blue',
      tags: ['recommended']
    },
    {
      id: 'iphone-16-black-pro',
      name: 'Apple iPhone 16 Pro 128 GB Black',
      price: '$1099',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-black-select-202409?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1718498793073',
      link: '/store/iphone-16-pro-black',
      tags: ['new', 'recommended']
    },
    {
      id: 'airpods-pro',
      name: 'Apple AirPods Pro (2nd Gen)',
      price: '$249',
      originalPrice: '$279',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1660803972361',
      link: '/store/airpods-pro',
      tags: ['bestseller']
    },
    {
      id: 'apple-watch-se',
      name: 'Apple Watch SE',
      price: '$249',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/watch-se-digitalmat-gallery-1-202309?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1693271766726',
      link: '/store/apple-watch-se',
      tags: ['bestseller']
    },
    {
      id: 'macbook-air',
      name: 'MacBook Air M3',
      price: '$1099',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-m3-midnight-select-202403?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1707780024707',
      link: '/store/macbook-air',
      tags: ['new', 'recommended']
    },
    // Second row products
    {
      id: 'ipad-pro',
      name: 'iPad Pro 13-inch M4 Chip',
      price: '$1299',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-cell-silver-202403?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1709825260746',
      link: '/store/ipad-pro',
      tags: ['new']
    },
    {
      id: 'apple-pencil-pro',
      name: 'Apple Pencil Pro',
      price: '$129',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/apple-pencil-pro-witb-202405?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1714057242692',
      link: '/store/apple-pencil-pro',
      tags: ['new']
    },
    {
      id: 'homepod-mini',
      name: 'HomePod mini',
      price: '$99',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/homepod-mini-select-blue-202110?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1632925511000',
      link: '/store/homepod-mini',
      tags: ['recommended']
    },
    {
      id: 'airtag',
      name: 'AirTag',
      price: '$29',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/airtag-single-select-202104?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1617761671000',
      link: '/store/airtag',
      tags: ['bestseller']
    }
  ];
  
  const filteredProducts = activeFilter 
    ? productOffers.filter(product => product.tags.includes(activeFilter))
    : productOffers;
  
  const displayedProducts = showMore 
    ? filteredProducts 
    : filteredProducts.slice(0, 8);
  
  return (
    <section className="py-16 px-4 bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <AppleHeadline>Best Offers</AppleHeadline>
          
          <div className="flex flex-wrap gap-2">
            {filterTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setActiveFilter(activeFilter === tag.id ? null : tag.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === tag.id
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-gray-200 dark:bg-black text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-900'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
              className="px-6 py-3 mb-4 bg-gray-200 dark:bg-black text-gray-800 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-900 transition-colors"
            >
              {showMore ? 'Show Less' : 'Show More Products'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default BestOffersSection; 