import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { AppleHeadline, AppleProductTitle, AppleProductSubtitle, Text, ApplePrice, AppleCaption, AppleSubheadline } from './Typography';
import Spacing from './Spacing';
import { useNavigate } from 'react-router-dom';

interface IPhoneCategory {
  id: string;
  name: string;
  subtitle?: string;
  image: string;
  price: string;
  monthly?: string;
}

const IPhoneCategoriesSection: React.FC = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  // iPhone categories data
  const categories: IPhoneCategory[] = [
    {
      id: 'iphone-16-pro',
      name: 'iPhone 16 Pro',
      subtitle: 'iPhone 16 Pro Max',
      image: '/Iphone_main/iphone_16pro_promax.jpg',
      price: 'From $999',
      monthly: 'or $41.62/mo. for 24 mo.*'
    },
    {
      id: 'iphone-16',
      name: 'iPhone 16',
      subtitle: 'iPhone 16 Plus',
      image: '/Iphone_main/iphone_16_plus.jpg',
      price: 'From $799',
      monthly: 'or $33.29/mo. for 24 mo.*'
    },
    {
      id: 'iphone-16e',
      name: 'iPhone 16e',
      image: '/Iphone_main/iphone_16e.jpg',
      price: 'From $599',
      monthly: 'or $24.95/mo. for 24 mo.*'
    },
    {
      id: 'iphone-15',
      name: 'iPhone 15',
      subtitle: 'iPhone 15 Plus',
      image: '/Iphone_main/iphone_15_plus.jpg',
      price: 'From $699',
      monthly: 'or $29.12/mo. for 24 mo.*'
    },
    {
      id: 'iphone-se',
      name: 'iPhone SE',
      image: '/Iphone_main/iphone_16e.jpg', // Reusing image as placeholder
      price: 'From $429',
      monthly: 'or $17.87/mo. for 24 mo.*'
    },
    {
      id: 'compare',
      name: 'Compare',
      subtitle: 'Find the iPhone that\'s right for you',
      image: '/Iphone_main/iphone_16pro_promax.jpg', // Reusing image as placeholder
      price: 'Compare all models',
    },
    {
      id: 'accessories',
      name: 'Accessories',
      subtitle: 'Cases, chargers, and more',
      image: '/Iphone_main/iphone_16_plus.jpg', // Reusing image as placeholder
      price: 'Shop iPhone accessories',
    },
    {
      id: 'see-all',
      name: 'See All',
      subtitle: 'Explore the complete iPhone lineup',
      image: '/Iphone_main/iphone_15_plus.jpg', // This will be replaced with an icon
      price: 'Browse full store',
    }
  ];

  // Initialize card refs array
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, categories.length);
  }, [categories.length]);

  // Calculate card width and max scroll on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && cardRefs.current[0]) {
        const containerWidth = containerRef.current.clientWidth;
        const firstCardWidth = cardRefs.current[0].offsetWidth;
        const cardMargin = parseInt(window.getComputedStyle(cardRefs.current[0]).marginRight) || 20;
        const totalCardWidth = firstCardWidth + cardMargin;
        
        // Check if we're on a large screen (e.g., 27-inch monitor)
        const isLarge = window.innerWidth >= 1800;
        setIsLargeScreen(isLarge);
        
        setContainerWidth(containerWidth);
        setCardWidth(totalCardWidth);
        setMaxScroll(cardsContainerRef.current!.scrollWidth - containerWidth);
      }
    };

    // Initial calculation after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      updateDimensions();
    }, 100);

    window.addEventListener('resize', updateDimensions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Scroll left - exactly one card
  const scrollLeft = () => {
    if (containerRef.current) {
      // Find the nearest card position to the left
      const currentPosition = scrollPosition;
      let newPosition = 0;
      
      // Find the previous card's position
      for (let i = categories.length - 1; i >= 0; i--) {
        const cardPosition = i * cardWidth;
        if (cardPosition < currentPosition - 10) { // Small threshold to handle rounding errors
          newPosition = cardPosition;
          break;
        }
      }
      
      setScrollPosition(newPosition);
      containerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  // Scroll right - exactly one card
  const scrollRight = () => {
    if (containerRef.current) {
      // Find the nearest card position to the right
      const currentPosition = scrollPosition;
      let newPosition = 0;
      
      // Find the next card's position
      for (let i = 0; i < categories.length; i++) {
        const cardPosition = i * cardWidth;
        if (cardPosition > currentPosition + 10) { // Small threshold to handle rounding errors
          newPosition = cardPosition;
          break;
        }
      }
      
      // Ensure we don't scroll beyond max
      newPosition = Math.min(newPosition, maxScroll);
      
      setScrollPosition(newPosition);
      containerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle scroll event to update position
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollLeft);
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20 2xl:py-24 bg-[#f5f5f7] dark:bg-black">
      <div className="pl-0 pr-0">
        <div className="pl-12 md:pl-16 lg:pl-12 xl:pl-16 2xl:pl-32 3xl:pl-44 max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl mr-0">
          <AppleHeadline>iPhone.</AppleHeadline>
          <Spacing size="sm" />
          <AppleSubheadline>
            The best way to buy the products you love.
          </AppleSubheadline>
        </div>
        
        <div className="mt-4 md:mt-5 lg:mt-6 relative">
          {/* Left scroll button */}
          <button 
            onClick={scrollLeft}
            className={`absolute left-4 md:left-8 lg:left-4 xl:left-8 2xl:left-24 3xl:left-36 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 2xl:p-3 shadow-lg ${
              scrollPosition <= 0 ? 'opacity-0 cursor-default' : 'opacity-100 cursor-pointer'
            } transition-opacity duration-300 items-center justify-center`}
            disabled={scrollPosition <= 0}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 2xl:h-8 2xl:w-8 text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* Cards container with horizontal scroll */}
          <div 
            ref={containerRef}
            className="overflow-x-auto scrollbar-hide"
            onScroll={handleScroll}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingRight: '0' }}
          >
            <div 
              ref={cardsContainerRef}
              className="flex pl-12 md:pl-16 lg:pl-12 xl:pl-16 2xl:pl-32 3xl:pl-44 py-4 pr-0"
            >
              {categories.map((category, index) => (
                <div 
                  key={category.id}
                  ref={el => cardRefs.current[index] = el}
                  className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] xl:w-[340px] 2xl:w-[380px] 3xl:w-[420px] mr-5 md:mr-6 2xl:mr-8"
                >
                  {category.id === 'see-all' ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-6 cursor-pointer transition-all duration-500 ease-out transform hover:scale-[1.02]" onClick={() => navigate('/products?category=iPhone')}>
                      <div className="w-24 h-24 2xl:w-28 2xl:h-28 3xl:w-32 3xl:h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <ArrowRight className="w-12 h-12 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 text-white" />
                      </div>
                      <div className="text-center">
                        <ApplePrice className="text-lg 2xl:text-xl 3xl:text-2xl text-gray-600 dark:text-gray-300">
                          See All
                        </ApplePrice>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm transition-all duration-500 ease-out overflow-hidden h-full flex flex-col transform hover:scale-[1.02] hover:shadow-md">
                      {/* Card Header - Apple Intelligence Tag */}
                      <div className="px-5 2xl:px-6 pt-4 2xl:pt-5 pb-2">
                        <AppleCaption transform="uppercase" weight="medium" className="tracking-wider 2xl:text-base">
                          APPLE INTELLIGENCE
                        </AppleCaption>
                      </div>
                      
                      {/* Card Title */}
                      <div className="px-5 2xl:px-6 pb-4">
                        <div>
                          <ApplePrice className="2xl:text-2xl 3xl:text-3xl">
                            {category.name}
                          </ApplePrice>
                          <div className="h-6 2xl:h-8 -mt-1">
                            <ApplePrice className="2xl:text-2xl 3xl:text-3xl">
                              {category.subtitle || ''}
                            </ApplePrice>
                          </div>
                        </div>
                      </div>
                      
                      {/* Card Image */}
                      <div className="flex justify-center items-center px-5 2xl:px-6 py-3 h-48 2xl:h-64 3xl:h-72">
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="max-h-36 2xl:max-h-48 3xl:max-h-56 max-w-full w-auto h-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Color Options */}
                      <div className="flex justify-center space-x-2 2xl:space-x-3 py-2 2xl:py-3">
                        <div className="w-4 h-4 2xl:w-5 2xl:h-5 rounded-full bg-[#f0e4d4] border border-gray-300"></div>
                        <div className="w-4 h-4 2xl:w-5 2xl:h-5 rounded-full bg-[#e3e5e3] border border-gray-300"></div>
                        <div className="w-4 h-4 2xl:w-5 2xl:h-5 rounded-full bg-[#3a3a3c]"></div>
                      </div>
                      
                      {/* Spacer to push price to bottom */}
                      <div className="flex-grow"></div>
                      
                      {/* Price and Explore Button - at the bottom */}
                      <div className="px-5 2xl:px-6 pt-2 pb-4 2xl:pb-6">
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <ApplePrice className="2xl:text-xl 3xl:text-2xl">
                              {category.price}
                            </ApplePrice>
                            {category.monthly && (
                              <Text size="sm" color="tertiary" className="mt-1 2xl:text-base">
                                {category.monthly}
                              </Text>
                            )}
                          </div>
                          <button className="bg-blue-600 text-white rounded-full px-6 py-2 2xl:px-8 2xl:py-3 text-sm 2xl:text-base font-medium transition-all duration-300 hover:bg-blue-700 hover:shadow-md" onClick={() => {
                            if (category.id === 'accessories') {
                              navigate('/products?category=Accessories&subcategory=iPhone');
                            } else if (category.id === 'compare') {
                              navigate('/products?category=iPhone');
                            } else {
                              navigate(`/products?category=iPhone&subcategory=${encodeURIComponent(category.name)}`);
                            }
                          }}>
                            Explore
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Right scroll button */}
          <button 
            onClick={scrollRight}
            className={`absolute right-4 md:right-8 lg:right-4 xl:right-8 2xl:right-24 3xl:right-36 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 2xl:p-3 shadow-lg ${
              scrollPosition >= maxScroll ? 'opacity-0 cursor-default' : 'opacity-100 cursor-pointer'
            } transition-opacity duration-300 items-center justify-center`}
            disabled={scrollPosition >= maxScroll}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 2xl:h-8 2xl:w-8 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default IPhoneCategoriesSection; 