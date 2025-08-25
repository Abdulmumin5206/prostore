import React, { useState, useEffect, useRef } from 'react';
import CategorySection from '../components/CategorySection';
import IPhoneCategoriesSection from '../components/IPhoneCategoriesSection';
import MacBookCategoriesSection from '../components/MacBookCategoriesSection';
import HotDealsCategoriesSection from '../components/HotDealsCategoriesSection';
import PromotionalBannerSection from '../components/PromotionalBannerSection';
import AboutUsSection from '../components/AboutUsSection';

interface HeroSlide {
  id: string;
  image: string;
}

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const heroSlides: HeroSlide[] = [
    {
      id: 'slide-1',
      image: '/hero/blue gradient electronic sale promotion banner.webp'
    },
    {
      id: 'slide-2',
      image: 'https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'slide-3',
      image: 'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      id: 'slide-4',
      image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !isTransitioning) {
      autoPlayRef.current = window.setTimeout(() => {
        nextSlide();
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, currentSlide, isTransitioning]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Touch handlers for swipe support
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isTransitioning) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      {/* Hero Carousel Section */}
      <div className="max-w-laptop mx-auto px-section-x mt-3">
        <section 
          className="relative h-[28vh] md:h-[70vh] overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Carousel Container */}
          <div className="relative h-full">
            {heroSlides.map((slide, index) => {
              // Calculate position for each slide
              let position = index - currentSlide;
              if (position < 0 && Math.abs(position) > Math.floor(heroSlides.length / 2)) {
                position += heroSlides.length;
              } else if (position > 0 && position > Math.floor(heroSlides.length / 2)) {
                position -= heroSlides.length;
              }
              
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    position === 0 
                      ? 'opacity-100 translate-x-0 z-10' 
                      : position < 0 
                        ? 'opacity-0 -translate-x-full z-0' 
                        : 'opacity-0 translate-x-full z-0'
                  }`}
                  aria-hidden={position !== 0}
                >
                  {/* Static Image */}
                  <div className="relative h-full">
                    <img
                      src={slide.image}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={index === currentSlide ? "eager" : "lazy"}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className={`absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-all duration-200 z-20 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className={`absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-all duration-200 z-20 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1.5 md:space-x-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-white dark:bg-white scale-110 shadow-lg' 
                    : 'bg-white/30 dark:bg-gray-600 hover:bg-white/75 dark:hover:bg-gray-400'
                } ${isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={currentSlide === index ? 'true' : 'false'}
              />
            ))}
          </div>
        </section>
      </div>
      
      {/* iPhone Categories Section */}
      <IPhoneCategoriesSection />
      
      {/* MacBook Categories Section */}
      <MacBookCategoriesSection />
      
      {/* Promotional Banner Section */}
      <PromotionalBannerSection />
      
      {/* Hot Deals Categories Section */}
      <HotDealsCategoriesSection />
      
      {/* Category Section */}
      <CategorySection />
      
      {/* About Us Section */}
      <AboutUsSection />
    </div>
  );
};

export default HomePage;