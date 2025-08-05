import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { H1, H2, Text, AppleHeadline, AppleLink, AppleProductTitle, AppleSubheadline, Caption } from '../components/Typography';
import Button from '../components/Button';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slidesPerView = 3;
  const maxSlides = useRef(0);

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

  // Calculate max slides based on window width
  useEffect(() => {
    const calculateSlidesPerView = () => {
      if (window.innerWidth < 640) {
        return 1;
      } else if (window.innerWidth < 1024) {
        return 2;
      } else {
        return 3;
      }
    };

    const handleResize = () => {
      const visibleSlides = calculateSlidesPerView();
      maxSlides.current = Math.max(0, macProducts.length - visibleSlides);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [macProducts.length]);

  const nextSlide = () => {
    if (isTransitioning || maxSlides.current === 0) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlides.current));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      {/* Header Section */}
      <div className="bg-[#f5f5f7] dark:bg-black py-12 px-section-x transition-colors duration-300">
        <div className="max-w-laptop mx-auto">
          <div className="flex justify-between items-start mb-16">
            <H1>Shop Mac</H1>
            <div className="text-right">
              <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">
                <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full mr-2 flex items-center justify-center transition-colors duration-300">
                  <span className="text-white text-xs">?</span>
                </div>
                <Text size="sm" color="accent">Need shopping help?</Text>
              </div>
              <AppleLink href="#">Ask a Mac Specialist ↗</AppleLink>
              
              <div className="flex items-center text-gray-700 dark:text-gray-300 mt-4 transition-colors duration-300">
                <div className="w-6 h-6 bg-gray-700 dark:bg-gray-600 rounded-full mr-2 flex items-center justify-center transition-colors duration-300">
                  <span className="text-white text-xs">⌾</span>
                </div>
                <Text size="sm" color="secondary">Visit an Apple Store</Text>
              </div>
              <AppleLink href="#">Find one near you ↗</AppleLink>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="border-b border-gray-200 dark:border-gray-700 mb-16 transition-colors duration-300">
            <ul className="flex space-x-8 overflow-x-auto scrollbar-hide">
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
                    className={`block py-4 whitespace-nowrap transition-colors duration-200 ${
                      index === 0
                        ? 'text-black dark:text-white border-b-2 border-black dark:border-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <Text 
                      size="sm" 
                      weight={index === 0 ? "medium" : "normal"}
                      color="inherit"
                    >
                      {tab}
                    </Text>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Products Section */}
          <div className="mb-8">
            <AppleHeadline className="mb-2">All models.</AppleHeadline>
            <AppleSubheadline>Take your pick.</AppleSubheadline>
          </div>

          {/* Product Carousel */}
          <div className="relative">
            <div className="flex items-center">
              <button
                onClick={prevSlide}
                disabled={isTransitioning || currentSlide === 0}
                className={`absolute left-0 z-10 w-12 h-12 bg-white dark:bg-gray-900 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 ${
                  isTransitioning || currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                }`}
                style={{ transform: 'translateX(-50%)' }}
                aria-label="Previous products"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-colors duration-300" />
              </button>

              <div className="overflow-hidden mx-8">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }}
                >
                  {macProducts.map((product, index) => (
                    <div key={product.id} className={`w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-4 transition-opacity duration-300 ${
                      index < currentSlide ? 'opacity-0' : 'opacity-100'
                    }`}>
                      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300">
                        <AppleProductTitle className="mb-8">{product.name}</AppleProductTitle>
                        
                        <div className="mb-8 flex justify-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-48 h-32 object-cover rounded-lg"
                            loading={index < currentSlide + slidesPerView ? "eager" : "lazy"}
                          />
                        </div>

                        {/* Color Options */}
                        <div className="flex justify-center space-x-2 mb-8">
                          {product.colors.map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className={`w-4 h-4 rounded-full border-2 ${
                                colorIndex === 0 ? 'border-gray-400' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        <div className="text-center">
                          <Text size="sm" color="secondary" className="mb-4">
                            From {product.priceFrom} or {product.monthlyFrom}
                          </Text>
                          <Button variant="primary" size="small">
                            Buy
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={nextSlide}
                disabled={isTransitioning || currentSlide >= maxSlides.current}
                className={`absolute right-0 z-10 w-12 h-12 bg-white dark:bg-gray-900 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 ${
                  isTransitioning || currentSlide >= maxSlides.current ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                }`}
                style={{ transform: 'translateX(50%)' }}
                aria-label="Next products"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300 transition-colors duration-300" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: maxSlides.current + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    currentSlide === index ? 'bg-gray-800 dark:bg-gray-200 scale-125' : 'bg-gray-300 dark:bg-gray-600'
                  } ${isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={`Go to product set ${index + 1}`}
                  aria-current={currentSlide === index ? 'true' : 'false'}
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