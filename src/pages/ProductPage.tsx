import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  H1, H2, H3, H4,
  Text, Caption, Label,
  AppleHeadline,
  AppleSubheadline,
  AppleProductDescription, 
  ApplePrice, 
  AppleProductTitle
} from '../components/Typography';
import Button from '../components/Button';
import Section from '../components/Section';
import ContentBlock from '../components/ContentBlock';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { PublicProduct } from '../lib/db';
import { useCart } from '../contexts/CartContext';

interface DetailProduct {
  id: string;
  name: string;
  category?: string;
  description?: string | null;
  images: string[];
  colors: string[];
  storage: string[];
  currency: string;
  basePrice: number; // effective price
}

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addItem } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<DetailProduct | null>(null);

  const [selectedPaymentType, setSelectedPaymentType] = useState<'full' | 'nasiya'>('full');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(0);
  const [selectedInstallmentPlan, setSelectedInstallmentPlan] = useState<6 | 12 | 24>(12);
  const [activeTab, setActiveTab] = useState<'description' | 'characteristics' | 'nasiya'>('description');

  // Touch swipe state for image carousel
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!productId) {
        setError('No product specified');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        if (!isSupabaseConfigured || !supabase) {
          // Fallback minimal placeholder when Supabase not configured
          if (isMounted) {
            setProduct({
              id: productId,
              name: 'Product',
              category: '',
              description: 'Product details are unavailable in demo mode.',
              images: [],
              colors: [],
              storage: [],
              currency: 'USD',
              basePrice: 0,
            });
          }
          setLoading(false);
          return;
        }

        // Fetch rows for this product from the public view
        const { data: rows, error: rowsErr } = await supabase
          .from('public_products_view')
          .select('*')
          .eq('product_id', productId);
        if (rowsErr) throw rowsErr;

        const list = (rows || []) as unknown as PublicProduct[];
        if (!list || list.length === 0) {
          if (isMounted) {
            setProduct({
              id: productId,
              name: 'Product Not Found',
              category: '',
              description: 'The requested product could not be found.',
              images: [],
              colors: [],
              storage: [],
              currency: 'USD',
              basePrice: 0,
            });
          }
          setLoading(false);
          return;
        }

        // Fetch all product images (including non-primary) and sort
        const { data: imagesRows, error: imagesErr } = await supabase
          .from('product_images')
          .select('url, is_primary, sort_order')
          .eq('product_id', productId);
        if (imagesErr) throw imagesErr;

        const sortedImages = (imagesRows || [])
          .sort((a: any, b: any) => Number(b.is_primary) - Number(a.is_primary) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((x: any) => x.url as string);

        // Aggregate attributes
        const colorSet = new Set<string>();
        const storageSet = new Set<string>();
        let minPrice = Number.POSITIVE_INFINITY;
        let currency: string = 'USD';
        for (const r of list) {
          const attrs: any = (r as any).attributes || {};
          if (typeof attrs.color === 'string' && attrs.color) colorSet.add(attrs.color);
          if (typeof attrs.storage === 'string' && attrs.storage) storageSet.add(attrs.storage);
          if (typeof r.effective_price === 'number') minPrice = Math.min(minPrice, Number(r.effective_price));
          if (r.currency) currency = r.currency;
        }

        const r0 = list[0];
        const detail: DetailProduct = {
          id: r0.product_id,
          name: r0.title,
          category: r0.category,
          description: r0.description,
          images: sortedImages.length > 0 ? sortedImages : (r0.primary_image ? [r0.primary_image] : []),
          colors: Array.from(colorSet),
          storage: Array.from(storageSet),
          currency,
          basePrice: Number.isFinite(minPrice) ? minPrice : Number(r0.effective_price ?? 0),
        };
        if (isMounted) setProduct(detail);
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Failed to load product');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const decreaseQuantity = () => { if (quantity > 1) setQuantity(quantity - 1); };
  const increaseQuantity = () => { setQuantity(quantity + 1); };

  const currentColor = useMemo(() => {
    if (!product || !product.colors || product.colors.length === 0) return '';
    const idx = Math.max(0, Math.min(selectedColor, product.colors.length - 1));
    return product.colors[idx];
  }, [product, selectedColor]);

  const currentStorage = useMemo(() => {
    if (!product || !product.storage || product.storage.length === 0) return '';
    const idx = Math.max(0, Math.min(selectedStorage, product.storage.length - 1));
    return product.storage[idx];
  }, [product, selectedStorage]);

  const basePrice = product?.basePrice ?? 0;
  const nasiyaMarkup = 1.3;
  const nasiyaTotalPrice = Math.round(basePrice * nasiyaMarkup) * quantity;
  const monthlyPayment = Math.round((basePrice * nasiyaMarkup) / selectedInstallmentPlan) * quantity;
  const totalPrice = basePrice * quantity;

  const currentPriceDisplay = selectedPaymentType === 'full' 
    ? `${product?.currency === 'USD' ? '$' : product?.currency || ''}${totalPrice}` 
    : `${product?.currency === 'USD' ? '$' : product?.currency || ''}${monthlyPayment}/mo for ${selectedInstallmentPlan} months`;

  const handleAddToBag = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      image: product.images[0] || '',
      unitPrice: basePrice,
      currency: product.currency || 'USD',
    }, quantity);
  };

  // Image carousel helpers
  const imagesCount = product?.images?.length || 0;
  const stepSize = 2; // show two images side-by-side, advance by two
 
  // Vertical thumbnails slider state
  const [thumbOffset, setThumbOffset] = useState(0);
  const visibleThumbs = 6;
  const maxThumbOffset = Math.max(0, imagesCount - visibleThumbs);
  const thumbsStart = Math.min(thumbOffset, maxThumbOffset);
  const canThumbPrev = thumbsStart > 0;
  const canThumbNext = thumbsStart < maxThumbOffset;
  const showThumbs = (product?.images?.length || 0) > 0;

  const nextImage = () => {
    if (!imagesCount) return;
    setSelectedImage((prev) => (prev + stepSize) % imagesCount);
  };
  const prevImage = () => {
    if (!imagesCount) return;
    setSelectedImage((prev) => (prev - stepSize + imagesCount * 1000) % imagesCount);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumb navigation */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center">
          <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Text size="xs" color="tertiary">Home</Text>
          </Link>
          <span className="mx-1.5"><Text size="xs" color="tertiary">›</Text></span>
          <Link to="/products" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Text size="xs" color="tertiary">Store</Text>
          </Link>
          <span className="mx-1.5"><Text size="xs" color="tertiary">›</Text></span>
          <Text size="xs" color="secondary">{product?.name || 'Product'}</Text>
        </nav>
      </div>

      <Section background="light" size="lg">
        <ContentBlock spacing="md">
          {loading ? (
            <div className="py-16 text-center">
              <Text>Loading product…</Text>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <Text color="error">{error}</Text>
            </div>
          ) : !product ? (
            <div className="py-16 text-center">
              <Text>Product not found.</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-8">
              <div className="lg:col-span-9">
                <AppleProductTitle size="sm">{product.name}</AppleProductTitle>
                {product.category && (
                  <Text size="sm" color="tertiary" className="mt-1">{product.category}</Text>
                )}
              </div>
                {/* Left side - Product Images */}
                <div className="flex flex-col lg:col-span-9">
                  <div className="flex gap-4">
                    {/* Vertical thumbnails (desktop/tablet) */}
                    {product.images.length > 0 && (
                      <div className="hidden sm:flex sm:flex-col items-center gap-3 max-h-[520px]">
                        {/* Up arrow */}
                        {imagesCount > visibleThumbs && (
                          <button
                            type="button"
                            onClick={() => setThumbOffset((v) => Math.max(0, v - 1))}
                            disabled={!canThumbPrev}
                            className={`p-1.5 rounded-full bg-white/80 dark:bg-gray-800/70 shadow ${!canThumbPrev ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white'}`}
                            aria-label="Previous thumbnails"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 6l4 5H6l4-5z" clipRule="evenodd"/></svg>
                          </button>
                        )}
                        <div className="flex flex-col gap-3 overflow-hidden" style={{ maxHeight: '520px' }}>
                          {(product.images.slice(thumbsStart, thumbsStart + visibleThumbs)).map((image, index) => {
                            const actualIndex = thumbsStart + index;
                            return (
                              <button
                                key={actualIndex}
                                onClick={() => setSelectedImage(actualIndex)}
                                className={`rounded-md h-16 w-16 flex-shrink-0 overflow-hidden transition-all duration-300 ${
                                  selectedImage === actualIndex 
                                    ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-950' 
                                    : 'opacity-60 hover:opacity-100'
                                }`}
                                aria-label={`Thumbnail ${actualIndex + 1}`}
                              >
                                <img src={image} alt={`${product?.name || 'Product'} thumbnail ${actualIndex + 1}`} className="h-full w-full object-cover" />
                              </button>
                            );
                          })}
                        </div>
                        {/* Down arrow */}
                        {imagesCount > visibleThumbs && (
                          <button
                            type="button"
                            onClick={() => setThumbOffset((v) => Math.min(maxThumbOffset, v + 1))}
                            disabled={!canThumbNext}
                            className={`p-1.5 rounded-full bg-white/80 dark:bg-gray-800/70 shadow ${!canThumbNext ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white'}`}
                            aria-label="Next thumbnails"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 14l-4-5h8l-4 5z" clipRule="evenodd"/></svg>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Two large image containers */}
                    <div className="flex-1 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Left large container (current image) */}
                      <div 
                        className="relative flex items-center justify-center h-[520px] rounded-xl overflow-hidden"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                      >
                        {product.images.length > 0 ? (
                          <img 
                            src={product.images[selectedImage]} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <Text color="tertiary">Image not available</Text>
                          </div>
                        )}

                        {product.images.length > 1 && (
                          <button
                            type="button"
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/70 hover:bg-white shadow"
                            aria-label="Previous image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Right large container (next image) */}
                      <div 
                        className="relative flex items-center justify-center h-[520px] rounded-xl overflow-hidden"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                      >
                        {product.images.length > 1 ? (
                          <img 
                            src={product.images[(selectedImage + 1) % product.images.length]} 
                            alt={`${product.name} alt view`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <Text color="tertiary">Add more images to preview here</Text>
                          </div>
                        )}

                        {product.images.length > 1 && (
                          <button
                            type="button"
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/70 hover:bg-white shadow"
                            aria-label="Next image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal thumbnails for mobile */}
                  {product.images.length > 1 && (
                    <div className="flex justify-center space-x-3 sm:hidden">
                      {product.images.map((image, index) => (
                        <button 
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`rounded-md h-16 w-16 flex-shrink-0 overflow-hidden transition-all duration-300 ${
                            selectedImage === index 
                              ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-950' 
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side - Product Details */}
                <div className="flex flex-col lg:col-span-3">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
                  
 
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-8">
                      <Label size="xs" transform="uppercase" color="tertiary" className="mb-4">Color</Label>
                      <div className="flex flex-wrap gap-3">
                        {product.colors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(index)}
                            className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${
                              selectedColor === index 
                                ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-950' 
                                : ''
                            }`}
                            title={color}
                          >
                            <span className="w-8 h-8 rounded-full" style={{backgroundColor: color}}></span>
                          </button>
                        ))}
                      </div>
                      <Text size="sm" color="tertiary" className="mt-2">{currentColor}</Text>
                    </div>
                  )}

                  {product.storage && product.storage.length > 0 && (
                    <div className="mb-8">
                      <Label size="xs" transform="uppercase" color="tertiary" className="mb-4">Storage</Label>
                      <div className="flex flex-wrap gap-2">
                        {product.storage.map((option, index) => (
                          <button
                            key={option + index}
                            onClick={() => setSelectedStorage(index)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              selectedStorage === index 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
                                : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">{option}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Options */}
                  <div className="mb-10">
                    <Label size="xs" transform="uppercase" color="tertiary" className="mb-4">Payment Options</Label>
                    <div className="flex space-x-3 mb-8">
                      <button
                        onClick={() => setSelectedPaymentType('full')}
                        className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                          selectedPaymentType === 'full' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400' 
                            : 'border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        <Text size="sm" weight={selectedPaymentType === 'full' ? 'medium' : 'normal'} color={selectedPaymentType === 'full' ? 'accent' : 'inherit'} align="center">Full Payment</Text>
                      </button>
                      <button
                        onClick={() => setSelectedPaymentType('nasiya')}
                        className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                          selectedPaymentType === 'nasiya' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400' 
                            : 'border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        <Text size="sm" weight={selectedPaymentType === 'nasiya' ? 'medium' : 'normal'} color={selectedPaymentType === 'nasiya' ? 'accent' : 'inherit'} align="center">Nasiya</Text>
                      </button>
                    </div>

                    {selectedPaymentType === 'full' ? (
                      <div className="mb-8">
                        <ApplePrice className="text-3xl">{product.currency === 'USD' ? '$' : product.currency}{totalPrice}</ApplePrice>
                        <Text size="sm" color="tertiary" className="mt-1">One-time payment</Text>
                      </div>
                    ) : (
                      <div className="mb-8">
                        <div className="mb-4">
                          <Text size="xs" color="tertiary" className="mb-2">Select payment period:</Text>
                          <div className="flex space-x-2">
                            {[6, 12, 24].map((months) => (
                              <button
                                key={months}
                                onClick={() => setSelectedInstallmentPlan(months as 6 | 12 | 24)}
                                className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                                  selectedInstallmentPlan === months
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <Text size="xs" color="inherit">{months} months</Text>
                              </button>
                            ))}
                          </div>
                        </div>

                        <ApplePrice className="text-3xl">{product.currency === 'USD' ? '$' : product.currency}{monthlyPayment}</ApplePrice>
                        <Text size="sm" color="tertiary" className="mt-1">per month for {selectedInstallmentPlan} months</Text>
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex justify-between text-xs mb-1">
                            <Text size="xs" color="tertiary">Base price:</Text>
                            <Text size="xs" color="secondary">{product.currency === 'USD' ? '$' : product.currency}{totalPrice}</Text>
                          </div>
                          <div className="flex justify-between text-xs mb-1">
                            <Text size="xs" color="tertiary">Nasiya markup (30%):</Text>
                            <Text size="xs" color="secondary">{product.currency === 'USD' ? '+$' : '+' + product.currency}{nasiyaTotalPrice - totalPrice}</Text>
                          </div>
                          <div className="flex justify-between text-xs font-medium pt-1 border-t border-gray-200 dark:border-gray-800">
                            <Text size="xs" color="secondary" weight="medium">Total cost:</Text>
                            <Text size="xs" color="primary" weight="medium">{product.currency === 'USD' ? '$' : product.currency}{nasiyaTotalPrice}</Text>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                  </div>
                </div>
            </div>
          )}
        </ContentBlock>
      </Section>

      {/* Detailed Description Section */}
      {product?.description && (
        <Section background="light" size="lg">
          <ContentBlock spacing="md">
            <div className="py-8">
              <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8">
                <button onClick={() => setActiveTab('description')} className={`px-6 py-3 transition-colors ${activeTab === 'description' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  <Text size="sm" weight="medium" color="inherit">Description</Text>
                </button>
              </div>
              {activeTab === 'description' && (
                <div className="space-y-6 max-w-4xl">
                  <div>
                    <H3 className="mb-4">About This Product</H3>
                    <AppleProductDescription className="mb-6">{product?.description}</AppleProductDescription>
                  </div>
                </div>
              )}
            </div>
          </ContentBlock>
        </Section>
      )}

      {/* Persistent product summary bar at bottom */}
      {product && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {product.images.length > 0 && (
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <Text size="sm" weight="medium" color="primary">{product.name}</Text>
                <Caption>
                  {currentColor}{currentStorage ? ` • ${currentStorage}` : ''}
                </Caption>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={decreaseQuantity} className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors" disabled={quantity <= 1}>
                  <span className="text-sm">-</span>
                </button>
                <span className="w-4 text-center text-gray-800 dark:text-gray-200 font-medium text-sm">{quantity}</span>
                <button onClick={increaseQuantity} className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <span className="text-sm">+</span>
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <Text size="sm" weight="medium" color="primary">{currentPriceDisplay}</Text>
                {selectedPaymentType === 'nasiya' && (
                  <Caption>Total: {product.currency === 'USD' ? '$' : product.currency}{nasiyaTotalPrice}</Caption>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="small" className="text-xs py-2 px-3 hidden sm:block">Save</Button>
                <Button variant="primary" size="small" className="text-xs py-2 px-3" onClick={handleAddToBag}>Add to Bag</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage; 