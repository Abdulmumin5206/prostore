import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface ProductSliderProps {
  children: ReactNode[];
  slidesPerViewMobile?: number;
  slidesPerViewTablet?: number;
  slidesPerViewDesktop?: number;
  slidesPerViewLargeDesktop?: number;
  className?: string;
}

const ProductSlider: React.FC<ProductSliderProps> = ({
  children,
  slidesPerViewMobile = 1,
  slidesPerViewTablet = 2,
  slidesPerViewDesktop = 3,
  slidesPerViewLargeDesktop = 4,
  className = '',
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [slidesPerView, setSlidesPerView] = useState(slidesPerViewLargeDesktop);
  const sliderRef = useRef<HTMLDivElement>(null);
  const maxSlides = useRef(0);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Calculate max slides based on window width and update slidesPerView
  useEffect(() => {
    const updateSlidesPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setSlidesPerView(slidesPerViewMobile);
      } else if (width < 1024) {
        setSlidesPerView(slidesPerViewTablet);
      } else if (width < 1280) {
        setSlidesPerView(slidesPerViewDesktop);
      } else {
        setSlidesPerView(slidesPerViewLargeDesktop);
      }
    };

    // Calculate max slides
    const calculateMaxSlides = () => {
      maxSlides.current = Math.max(0, Math.ceil(React.Children.count(children) / slidesPerView) - 1);
    };

    updateSlidesPerView();
    calculateMaxSlides();

    const handleResize = () => {
      updateSlidesPerView();
      calculateMaxSlides();
      // Reset current slide if needed
      if (currentSlide > maxSlides.current) {
        setCurrentSlide(maxSlides.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [
    children, 
    currentSlide, 
    slidesPerView, 
    slidesPerViewMobile, 
    slidesPerViewTablet, 
    slidesPerViewDesktop, 
    slidesPerViewLargeDesktop
  ]);

  const nextSlide = () => {
    if (isTransitioning || currentSlide >= maxSlides.current) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => prev + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning || currentSlide <= 0) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => prev - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Touch event handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentSlide < maxSlides.current) {
      nextSlide();
    }
    
    if (isRightSwipe && currentSlide > 0) {
      prevSlide();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Slider Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevSlide}
          disabled={isTransitioning || currentSlide <= 0}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
            currentSlide <= 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          disabled={isTransitioning || currentSlide >= maxSlides.current}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
            currentSlide >= maxSlides.current ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Slider Container */}
      <div 
        className="overflow-hidden"
        ref={sliderRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }}
        >
          {React.Children.map(children, (child, index) => (
            <div 
              key={index} 
              className={`flex-shrink-0 px-3 transition-opacity duration-300`}
              style={{ 
                width: `${100 / slidesPerView}%`,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      {maxSlides.current > 0 && (
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
      )}
    </div>
  );
};

export default ProductSlider; 