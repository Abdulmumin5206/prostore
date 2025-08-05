import React from 'react';
import CategorySection from '../components/CategorySection';
import { H1, AppleHeadline, AppleLink, Text } from '../components/Typography';

const StorePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      <div className="pt-8 px-section-x">
        <div className="max-w-laptop mx-auto">
          <div className="flex justify-between items-start mb-16">
            <H1>Store</H1>
            <div className="text-right">
              <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">
                <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full mr-2 flex items-center justify-center transition-colors duration-300">
                  <span className="text-white text-xs">?</span>
                </div>
                <Text size="sm">Need shopping help?</Text>
              </div>
              <AppleLink href="#">Ask a Specialist ↗</AppleLink>
              
              <div className="flex items-center text-gray-700 dark:text-gray-300 mt-4 transition-colors duration-300">
                <div className="w-6 h-6 bg-gray-700 dark:bg-gray-600 rounded-full mr-2 flex items-center justify-center transition-colors duration-300">
                  <span className="text-white text-xs">⌾</span>
                </div>
                <Text size="sm">Visit an Apple Store</Text>
              </div>
              <AppleLink href="#">Find one near you ↗</AppleLink>
            </div>
          </div>
        </div>
      </div>
      
      <CategorySection />
      
      <section className="py-16 px-section-x bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
        <div className="max-w-laptop mx-auto">
          <AppleHeadline className="mb-8">
            The latest. <span className="text-gray-600 dark:text-gray-400">Take a look at what's new right now.</span>
          </AppleHeadline>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for latest products */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 h-80 flex items-center justify-center shadow-sm">
              <Text className="text-xl text-gray-800 dark:text-gray-200">Latest Product Coming Soon</Text>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 h-80 flex items-center justify-center shadow-sm">
              <Text className="text-xl text-gray-800 dark:text-gray-200">Latest Product Coming Soon</Text>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 h-80 flex items-center justify-center shadow-sm">
              <Text className="text-xl text-gray-800 dark:text-gray-200">Latest Product Coming Soon</Text>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StorePage; 