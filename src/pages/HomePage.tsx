import React, { useState, useEffect, useRef } from 'react';
import CategorySection from '../components/CategorySection';
import BestOffersSection from '../components/BestOffersSection';
import AppleNotebooksOffersSection from '../components/AppleNotebooksOffersSection';
import PromotionalBanner from '../components/PromotionalBanner';
import { AppleProductTitle, AppleProductSubtitle, AppleProductDescription, ApplePrice } from '../components/Typography';
import Button from '../components/Button';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  primaryButton: string;
  secondaryButton: string;
  image: string;
  color: string;
  price?: string;
  discount?: string;
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
      id: 'iphone-16-pro',
      title: 'iPhone 16 Pro',
      subtitle: 'Pro. Beyond.',
      description: 'Experience the most advanced iPhone ever with A18 Pro chip, titanium design, and revolutionary camera system.',
      primaryButton: 'Buy from $999',
      secondaryButton: 'Learn more',
      image: 'https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'from-purple-500 to-pink-500',
      price: '$999',
      discount: 'Save $100'
    },
    {
      id: 'macbook-air',
      title: 'MacBook Air',
      subtitle: 'Powerful. Portable.',
      description: 'The most versatile Mac with M3 chip, all-day battery life, and stunning Liquid Retina display.',
      primaryButton: 'Buy from $1,099',
      secondaryButton: 'Compare',
      image: 'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'from-blue-500 to-cyan-500',
      price: '$1,099',
      discount: 'Free AirPods'
    },
    {
      id: 'ipad-pro',
      title: 'iPad Pro',
      subtitle: 'Your next computer is not a computer.',
      description: 'The ultimate iPad experience with M4 chip, stunning Liquid Retina XDR display, and Apple Pencil Pro.',
      primaryButton: 'Buy from $799',
      secondaryButton: 'Watch the film',
      image: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'from-green-500 to-emerald-500',
      price: '$799',
      discount: 'Trade in up to $400'
    },
    {
      id: 'apple-watch',
      title: 'Apple Watch Series 10',
      subtitle: 'Smarter. Brighter. Mightier.',
      description: 'The most advanced Apple Watch with breakthrough health innovations and stunning new design.',
      primaryButton: 'Buy from $399',
      secondaryButton: 'Order now',
      image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'from-red-500 to-orange-500',
      price: '$399',
      discount: 'Free engraving'
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
      <section 
        className="relative h-[70vh] overflow-hidden"
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
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-10`} />
                
                {/* Content Container */}
                <div className="relative h-full flex items-center justify-center px-section-x">
                  <div className="max-w-laptop mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <div className="text-center lg:text-left space-y-6">
                      <div className="space-y-2">
                        <AppleProductTitle>
                          {slide.title}
                        </AppleProductTitle>
                        <AppleProductSubtitle>
                          {slide.subtitle}
                        </AppleProductSubtitle>
                      </div>
                      
                      <AppleProductDescription className="max-w-lg">
                        {slide.description}
                      </AppleProductDescription>

                      {/* Price and Discount */}
                      {(slide.price || slide.discount) && (
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-lg">
                          {slide.price && (
                            <ApplePrice>
                              {slide.price}
                            </ApplePrice>
                          )}
                          {slide.discount && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {slide.discount}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Button variant="primary" size="large">
                          {slide.primaryButton}
                        </Button>
                        <Button variant="outline" size="large">
                          {slide.secondaryButton}
                        </Button>
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="flex justify-center lg:justify-end">
                      <div className="relative">
                        <div className="w-80 h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                            loading={index === currentSlide ? "eager" : "lazy"}
                          />
                        </div>
                        {/* Glow effect */}
                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${slide.color} opacity-20 blur-xl -z-10`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-all duration-200 z-20 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-all duration-200 z-20 ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
          aria-label="Next slide"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white dark:bg-white scale-125 shadow-lg' 
                  : 'bg-white/30 dark:bg-gray-600 hover:bg-white/75 dark:hover:bg-gray-400'
              } ${isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index ? 'true' : 'false'}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              isAutoPlaying 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
            aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              {isAutoPlaying ? (
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              ) : (
                <path d="M8 5v14l11-7z"/>
              )}
            </svg>
          </button>
        </div>
      </section>
      
      {/* Best Offers Section */}
      <BestOffersSection />
      
      {/* Promotional Banner */}
      <PromotionalBanner />
      
      {/* Apple Notebooks Offers Section */}
      <AppleNotebooksOffersSection />
      
      {/* Category Section */}
      <CategorySection />
    </div>
  );
};

export default HomePage;