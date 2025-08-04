import React from 'react';
import { Link } from 'react-router-dom';
import { AppleHeadline, AppleSubheadline } from './Typography';

interface Category {
  id: string;
  name: string;
  image: string;
  link: string;
}

const CategorySection: React.FC = () => {
  const categories: Category[] = [
    {
      id: 'mac',
      name: 'Mac',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-mac-nav-202203?wid=200&hei=130&fmt=png-alpha&.v=1645051958490',
      link: '/mac'
    },
    {
      id: 'iphone',
      name: 'iPhone',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-iphone-nav-202309?wid=200&hei=130&fmt=png-alpha&.v=1692971740452',
      link: '/'
    },
    {
      id: 'ipad',
      name: 'iPad',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-ipad-nav-202210?wid=200&hei=130&fmt=png-alpha&.v=1664912135437',
      link: '/ipad'
    },
    {
      id: 'apple-watch',
      name: 'Apple Watch',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-watch-nav-202309?wid=200&hei=130&fmt=png-alpha&.v=1693703822208',
      link: '/watch'
    },
    {
      id: 'vision-pro',
      name: 'Apple Vision Pro',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-vision-nav-202401?wid=200&hei=130&fmt=png-alpha&.v=1702402144761',
      link: '/vision'
    },
    {
      id: 'airpods',
      name: 'AirPods',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-airpods-nav-202209?wid=200&hei=130&fmt=png-alpha&.v=1660676485885',
      link: '/airpods'
    },
    {
      id: 'airtag',
      name: 'AirTag',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-airtags-nav-202108?wid=200&hei=130&fmt=png-alpha&.v=1625783380000',
      link: '/airtag'
    },
    {
      id: 'apple-tv',
      name: 'Apple TV 4K',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-appletv-nav-202210?wid=200&hei=130&fmt=png-alpha&.v=1664628458484',
      link: '/tv-home'
    },
    {
      id: 'homepod',
      name: 'HomePod',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-homepod-nav-202301?wid=200&hei=130&fmt=png-alpha&.v=1670389216654',
      link: '/tv-home'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-accessories-nav-202309?wid=200&hei=130&fmt=png-alpha&.v=1692803114952',
      link: '/accessories'
    },
    {
      id: 'gift-card',
      name: 'Apple Gift Card',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-giftcards-nav-202209?wid=200&hei=130&fmt=png-alpha&.v=1660329772099',
      link: '/gift-card'
    }
  ];

  return (
    <section className="py-16 px-4 bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <AppleHeadline>Store.</AppleHeadline>
          <AppleSubheadline>
            The best way to buy the products you love.
          </AppleSubheadline>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={category.link}
              className="flex flex-col items-center group"
            >
              <div className="w-full aspect-square mb-4 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-sm">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-4/5 h-4/5 object-contain"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection; 