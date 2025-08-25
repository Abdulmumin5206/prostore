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

  // Mobile-only carousel state (infinite with side peeks)
  const [mCurrentIndex, setMCurrentIndex] = useState(1); // start at first real slide (after leading clone)
  const [mIsTransitioning, setMIsTransitioning] = useState(false);
  const mAutoPlayRef = useRef<number | null>(null);
  const mTouchStart = useRef<number | null>(null);
  const mTouchEnd = useRef<number | null>(null);
  const mContainerRef = useRef<HTMLDivElement>(null);
  const [mContainerWidth, setMContainerWidth] = useState(0);
  const mGap = 12; // px gap between cards
  const mSlideFraction = 0.86; // show small portions of left/right cards

  useEffect(() => {
    const handleResize = () => {
      setMContainerWidth(mContainerRef.current?.offsetWidth || 0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mSlidesWithClones: HeroSlide[] = [
    heroSlides[heroSlides.length - 1],
    ...heroSlides,
    heroSlides[0]
  ];

  const mSlideWidth = Math.max(0, mContainerWidth * mSlideFraction);
  const mOffsetToCenter = (mContainerWidth - mSlideWidth) / 2;
  const mTranslateX = -(mCurrentIndex * (mSlideWidth + mGap)) + mOffsetToCenter;

  const handleMNext = () => {
    if (mIsTransitioning) return;
    setMIsTransitioning(true);
    setMCurrentIndex(prev => prev + 1);
  };

  const handleMPrev = () => {
    if (mIsTransitioning) return;
    setMIsTransitioning(true);
    setMCurrentIndex(prev => prev - 1);
  };

  const handleMTransitionEnd = () => {
    // Seamless loop: jump without transition when reaching clones
    if (mCurrentIndex === 0) {
      setMIsTransitioning(false);
      setMCurrentIndex(heroSlides.length);
      return;
    }
    if (mCurrentIndex === heroSlides.length + 1) {
      setMIsTransitioning(false);
      setMCurrentIndex(1);
      return;
    }
    setMIsTransitioning(false);
  };

  // Simple auto-play for mobile carousel (slide movement only)
  useEffect(() => {
    mAutoPlayRef.current = window.setTimeout(() => {
      handleMNext();
    }, 4000);
    return () => {
      if (mAutoPlayRef.current) clearTimeout(mAutoPlayRef.current);
    };
  }, [mCurrentIndex, mContainerWidth]);

  // Touch handlers for mobile slider
  const onMobileTouchStart = (e: React.TouchEvent) => {
    mTouchEnd.current = null;
    mTouchStart.current = e.targetTouches[0].clientX;
  };

  const onMobileTouchMove = (e: React.TouchEvent) => {
    mTouchEnd.current = e.targetTouches[0].clientX;
  };

  const onMobileTouchEnd = () => {
    if (!mTouchStart.current || !mTouchEnd.current || mIsTransitioning) return;
    const distance = mTouchStart.current - mTouchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) handleMNext();
    if (isRightSwipe) handleMPrev();
  };

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
      {/* Mobile Hero Carousel (infinite with side peeks) */}
      <section className="block md:hidden w-full mt-3">
        <div
          className="w-full overflow-hidden"
          ref={mContainerRef}
          onTouchStart={onMobileTouchStart}
          onTouchMove={onMobileTouchMove}
          onTouchEnd={onMobileTouchEnd}
        >
          <div
            className="flex items-stretch"
            style={{
              gap: `${mGap}px`,
              transform: `translateX(${mTranslateX}px)`,
              transition: mIsTransitioning ? 'transform 500ms ease-in-out' : 'none'
            }}
            onTransitionEnd={handleMTransitionEnd}
          >
            {mSlidesWithClones.map((slide, idx) => (
              <div
                key={`m-${idx}-${slide.id}`}
                className="flex-none overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                style={{ width: `${mSlideWidth}px`, height: '28vh' }}
              >
                <img
                  src={slide.image}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading={idx === mCurrentIndex ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Carousel Section */}
      <div className="max-w-laptop mx-auto px-section-x mt-3">
        <section 
          className="hidden md:block relative h-[28vh] md:h-[70vh] overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
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