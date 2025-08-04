import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface MacProduct {
  id: string;
  name: string;
  image: string;
  colors: string[];
  priceFrom: string;
  monthlyFrom: string;
  buyLink: string;
}

const MacPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const macProducts: MacProduct[] = [
    {
      id: 'macbook-air',
      name: 'MacBook Air',
      image: 'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=800',
      colors: ['#2C3E50', '#7F8C8D', '#F39C12', '#E74C3C'],
      priceFrom: '$999',
      monthlyFrom: '$83.25/mo. for 12 mo.*',
      buyLink: '#'
    },
    {
      id: 'macbook-pro',
      name: 'MacBook Pro',
      image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
      colors: ['#2C3E50', '#7F8C8D'],
      priceFrom: '$1599',
      monthlyFrom: '$133.25/mo. for 12 mo.*',
      buyLink: '#'
    },
    {
      id: 'imac',
      name: 'iMac',
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=800',
      colors: ['#3498DB', '#E74C3C', '#F1C40F', '#2ECC71', '#9B59B6', '#FF6B6B', '#4ECDC4'],
      priceFrom: '$1299',
      monthlyFrom: '$108.25/mo. for 12 mo.*',
      buyLink: '#'
    },
    {
      id: 'mac-mini',
      name: 'Mac mini',
      image: 'https://images.pexels.com/photos/147411/italy-mountain-technology-computer-147411.jpeg?auto=compress&cs=tinysrgb&w=800',
      colors: ['#7F8C8D'],
      priceFrom: '$599',
      monthlyFrom: '$49.91/mo. for 12 mo.*',
      buyLink: '#'
    },
    {
      id: 'mac-studio',
      name: 'Mac Studio',
      image: 'https://images.pexels.com/photos/583846/pexels-photo-583846.jpeg?auto=compress&cs=tinysrgb&w=800',
      colors: ['#7F8C8D'],
      priceFrom: '$1999',
      monthlyFrom: '$166.58/mo. for 12 mo.*',
      buyLink: '#'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, macProducts.length - 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, macProducts.length - 3)) % Math.max(1, macProducts.length - 3));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 py-12 px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-16">
            <h1 className="text-5xl font-semibold text-black dark:text-white transition-colors duration-300">Shop Mac</h1>
            <div className="text-right">
              <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">
                <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full mr-2 flex items-center justify-center transition-colors duration-300">
                  <span className="text-white text-xs">?</span>
                </div>
                <span className="text-sm">Need shopping help?</span>
              </div>
              <a href="#" className="text-blue-600 dark:text-blue-400 text-sm hover:underline transition-colors duration-300">Ask a Mac Specialist ↗</a>
              
              <div className="flex items-center text-gray-700 dark:text-gray-300 mt-4 transition-colors duration-300">
                <div className="w-6 h-6 bg-gray-700 dark:bg-gray-600 rounded-full mr-2 flex items-center justify-center transition-colors duration-300">
                  <span className="text-white text-xs">⌾</span>
                </div>
                <span className="text-sm">Visit an Apple Store</span>
              </div>
              <a href="#" className="text-blue-600 dark:text-blue-400 text-sm hover:underline transition-colors duration-300">Find one near you ↗</a>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="border-b border-gray-200 dark:border-gray-700 mb-16 transition-colors duration-300">
            <ul className="flex space-x-8">
              {[
                'All Models',
                'Shopping Guides',
                'Ways to Save',
                'The Apple Store Difference',
                'Accessories',
                'Setup and Support',
                'The Mac Experience',
                'Special Stores'
              ].map((tab, index) => (
                <li key={tab}>
                  <a
                    href="#"
                    className={`block py-4 text-sm transition-colors duration-200 ${
                      index === 0
                        ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Products Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-black dark:text-white mb-2 transition-colors duration-300">All models.</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">Take your pick.</p>
          </div>

          {/* Product Carousel */}
          <div className="relative">
            <div className="flex items-center">
              <button
                onClick={prevSlide}
                className="absolute left-0 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200"
                style={{ transform: 'translateX(-50%)' }}
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-colors duration-300" />
              </button>

              <div className="overflow-hidden mx-8">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
                >
                  {macProducts.map((product) => (
                    <div key={product.id} className="w-1/3 flex-shrink-0 px-4">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-2xl font-semibold text-black dark:text-white mb-8 transition-colors duration-300">{product.name}</h3>
                        
                        <div className="mb-8 flex justify-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-48 h-32 object-cover rounded-lg"
                          />
                        </div>

                        {/* Color Options */}
                        <div className="flex justify-center space-x-2 mb-8">
                          {product.colors.map((color, index) => (
                            <div
                              key={index}
                              className={`w-4 h-4 rounded-full border-2 ${
                                index === 0 ? 'border-gray-400' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
                            From {product.priceFrom} or {product.monthlyFrom}
                          </p>
                          <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200">
                            Buy
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={nextSlide}
                className="absolute right-0 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200"
                style={{ transform: 'translateX(50%)' }}
              >
                <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-colors duration-300" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.max(1, macProducts.length - 2) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    currentSlide === index ? 'bg-gray-800 dark:bg-gray-200' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacPage;