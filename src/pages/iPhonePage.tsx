import React from 'react';
import { AppleHeadline, AppleSubheadline, Text } from '../components/Typography';
import ProductCard from '../components/ProductCard';
import ProductSlider from '../components/ProductSlider';

interface IPhoneProduct {
  id: string;
  category: string;
  name: string;
  image: string;
  colors: string[];
  priceFrom: string;
  monthlyFrom: string;
  buyLink: string;
}

const IPhonePage = () => {
  const iPhoneProducts: IPhoneProduct[] = [
    {
      id: 'iphone-16-pro',
      category: 'APPLE INTELLIGENCE',
      name: 'iPhone 16 Pro & iPhone 16 Pro Max',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484426d1?q=80&w=2070&auto=format&fit=crop',
      colors: ['#F3E5AB', '#505050', '#F5F5F7', '#2E2E2E'],
      priceFrom: '$999',
      monthlyFrom: '$41.62/mo. for 24 mo.*',
      buyLink: '#'
    },
    {
      id: 'iphone-16',
      category: 'APPLE INTELLIGENCE',
      name: 'iPhone 16 & iPhone 16 Plus',
      image: 'https://images.unsplash.com/photo-1695048133299-e5e8c7dfe9c1?q=80&w=2070&auto=format&fit=crop',
      colors: ['#A7C7E7', '#FF69B4', '#F5F5F7', '#2E2E2E'],
      priceFrom: '$799',
      monthlyFrom: '$33.29/mo. for 24 mo.*',
      buyLink: '#'
    },
    {
      id: 'iphone-16e',
      category: 'APPLE INTELLIGENCE',
      name: 'iPhone 16e',
      image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=2080&auto=format&fit=crop',
      colors: ['#F5F5F7', '#2E2E2E'],
      priceFrom: '$599',
      monthlyFrom: '$24.95/mo. for 24 mo.*',
      buyLink: '#'
    },
    {
      id: 'iphone-15',
      category: 'IPHONE 15',
      name: 'iPhone 15 & iPhone 15 Plus',
      image: 'https://images.unsplash.com/photo-1695048133230-8f21e68d5a50?q=80&w=2070&auto=format&fit=crop',
      colors: ['#FFB6C1', '#F5F5F7', '#2E2E2E', '#E0FFFF'],
      priceFrom: '$699',
      monthlyFrom: '$29.12/mo. for 24 mo.*',
      buyLink: '#'
    },
    {
      id: 'iphone-se',
      category: 'IPHONE SE',
      name: 'iPhone SE',
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=2129&auto=format&fit=crop',
      colors: ['#FF0000', '#F5F5F7', '#2E2E2E'],
      priceFrom: '$429',
      monthlyFrom: '$17.87/mo. for 24 mo.*',
      buyLink: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-gray-900 transition-colors duration-300">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <AppleHeadline className="text-4xl md:text-5xl mb-4">Shop iPhone</AppleHeadline>
          <AppleSubheadline className="max-w-2xl mx-auto">
            All models. Take your pick.
          </AppleSubheadline>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12 overflow-x-auto pb-2">
          <div className="flex space-x-6 md:space-x-8">
            <button className="text-sm font-medium text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white pb-1">
              All Models
            </button>
            <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white pb-1">
              Shopping Guides
            </button>
            <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white pb-1">
              Ways to Save
            </button>
            <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white pb-1">
              Sustainability
            </button>
            <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white pb-1">
              Accessories
            </button>
          </div>
        </div>

        {/* Product Slider Section */}
        <ProductSlider
          slidesPerViewMobile={1}
          slidesPerViewTablet={2}
          slidesPerViewDesktop={3}
          slidesPerViewLargeDesktop={4}
        >
          {iPhoneProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              category={product.category}
              name={product.name}
              image={product.image}
              colors={product.colors}
              priceFrom={product.priceFrom}
              monthlyFrom={product.monthlyFrom}
              buyLink={product.buyLink}
            />
          ))}
        </ProductSlider>

        {/* Support Section */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <Text size="sm" color="accent">Need shopping help?</Text>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <Text size="sm" color="accent">Find one near you</Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPhonePage; 