import React, { useState, useEffect, useRef } from 'react';

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
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, currentSlide]);

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
    if (!touchStart || !touchEnd) return;
    
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
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Carousel Section */}
      <section 
        className="relative h-screen overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Carousel Container */}
        <div className="relative h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-10`} />
              
              {/* Content Container */}
              <div className="relative h-full flex items-center justify-center px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Text Content */}
                  <div className="text-center lg:text-left space-y-6">
                    <div className="space-y-2">
                      <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {slide.title}
                      </h1>
                      <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 font-light">
                        {slide.subtitle}
                      </p>
                    </div>
                    
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-lg">
                      {slide.description}
                    </p>

                    {/* Price and Discount */}
                    {(slide.price || slide.discount) && (
                      <div className="flex flex-col sm:flex-row items-center gap-4 text-lg">
                        {slide.price && (
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {slide.price}
                          </span>
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
                      <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                        {slide.primaryButton}
                      </button>
                      <button className="border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-200 transform hover:scale-105">
                        {slide.secondaryButton}
                      </button>
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
                        />
                      </div>
                      {/* Glow effect */}
                      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${slide.color} opacity-20 blur-xl -z-10`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 z-10"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 z-10"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                currentSlide === index 
                  ? 'bg-white dark:bg-gray-200 scale-125' 
                  : 'bg-white/50 dark:bg-gray-600/50 hover:bg-white/75 dark:hover:bg-gray-600/75'
              }`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isAutoPlaying 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              {isAutoPlaying ? (
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              ) : (
                <path d="M8 5v14l11-7z"/>
              )}
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;