import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  AppleHeadline,
  AppleSubheadline,
  AppleProductDescription, 
  ApplePrice, 
  Text 
} from '../components/Typography';
import Button from '../components/Button';
import Section from '../components/Section';
import ContentBlock from '../components/ContentBlock';

// Mock product data - in a real app, this would come from an API
const productData = {
  'iphone-16-black': {
    name: 'iPhone 16',
    color: 'Black',
    basePrice: 1299,
    description: 'The most powerful iPhone ever with A18 chip, advanced camera system, and all-day battery life.',
    features: [
      '6.7-inch Super Retina XDR display',
      'A18 Bionic chip',
      'Pro camera system',
      'Up to 28 hours of video playback',
      'Face ID'
    ],
    images: [
      'https://placehold.co/600x800/222/white?text=iPhone+16+Black+Front',
      'https://placehold.co/600x800/222/white?text=iPhone+16+Black+Back',
      'https://placehold.co/600x800/222/white?text=iPhone+16+Black+Side',
      'https://placehold.co/600x800/222/white?text=iPhone+16+Black+Camera',
    ],
    colors: [
      { name: 'Black', value: '#222222' },
      { name: 'Silver', value: '#E0E0E0' },
      { name: 'Gold', value: '#F9D8AD' },
      { name: 'Deep Blue', value: '#1E3A5F' }
    ],
    storage: [
      { size: '128GB', price: 1299 },
      { size: '256GB', price: 1399 },
      { size: '512GB', price: 1599 },
      { size: '1TB', price: 1799 }
    ]
  }
};

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [selectedPaymentType, setSelectedPaymentType] = useState<'full' | 'nasiya'>('full');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(0);
  const [selectedInstallmentPlan, setSelectedInstallmentPlan] = useState<6 | 12 | 24>(12);
  
  // Fallback product data if the ID doesn't match
  const product = productData[productId as keyof typeof productData] || {
    name: 'Product Not Found',
    color: '',
    basePrice: 0,
    description: 'The requested product could not be found.',
    features: [],
    images: [],
    colors: [],
    storage: []
  };

  // Get current price based on selected storage option
  const basePrice = product.storage && product.storage.length > 0 
    ? product.storage[selectedStorage].price 
    : product.basePrice;

  // Calculate nasiya markup (30% more than full payment)
  const nasiyaMarkup = 1.3;
  const nasiyaTotalPrice = Math.round(basePrice * nasiyaMarkup);
  
  // Calculate monthly payment based on selected plan
  const monthlyPayment = Math.round(nasiyaTotalPrice / selectedInstallmentPlan);

  // Calculate total price based on quantity
  const totalPrice = basePrice * quantity;
  const totalNasiyaPrice = nasiyaTotalPrice * quantity;
  const totalMonthlyPayment = monthlyPayment * quantity;

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  // Get current color and storage information
  const currentColor = product.colors && product.colors.length > 0 
    ? product.colors[selectedColor].name 
    : product.color;
  
  const currentStorage = product.storage && product.storage.length > 0 
    ? product.storage[selectedStorage].size 
    : '';

  // Get current price display based on payment type
  const currentPriceDisplay = selectedPaymentType === 'full' 
    ? `$${totalPrice}` 
    : `$${totalMonthlyPayment}/mo for ${selectedInstallmentPlan} months`;

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Breadcrumb navigation - simplified and more subtle */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center text-xs text-gray-400 dark:text-gray-500">
          <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Home</Link>
          <span className="mx-1.5">›</span>
          <Link to="/store" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Store</Link>
          <span className="mx-1.5">›</span>
          <Link to="/iphone" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">iPhone</Link>
          <span className="mx-1.5">›</span>
          <span className="text-gray-600 dark:text-gray-300">{product.name}</span>
        </nav>
      </div>
      
      <Section background="light" size="lg">
        <ContentBlock spacing="md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-8">
            {/* Left side - Product Images - Simplified and more focused */}
            <div className="flex flex-col">
              <div className="mb-6 flex items-center justify-center h-[600px]">
                {product.images.length > 0 ? (
                  <img 
                    src={product.images[selectedImage]} 
                    alt={`${product.name} ${product.color}`} 
                    className="max-h-full max-w-full object-contain transition-all duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <Text>Image not available</Text>
                  </div>
                )}
              </div>
              
              {/* Thumbnail gallery - more subtle and minimal */}
              <div className="flex justify-center space-x-3">
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
                    <img 
                      src={image} 
                      alt={`${product.name} thumbnail ${index + 1}`} 
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Right side - Product Details - Cleaner and more spacious */}
            <div className="flex flex-col">
              {/* Product title - simplified header */}
              <div className="mb-8">
                <AppleHeadline className="text-4xl font-medium">{product.name}</AppleHeadline>
              </div>
              
              {/* Color options */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <Text className="text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Color</Text>
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
                        title={color.name}
                      >
                        <span 
                          className="w-8 h-8 rounded-full" 
                          style={{backgroundColor: color.value}}
                        ></span>
                      </button>
                    ))}
                  </div>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">{currentColor}</Text>
                </div>
              )}
              
              {/* Storage options */}
              {product.storage && product.storage.length > 0 && (
                <div className="mb-8">
                  <Text className="text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Storage</Text>
                  <div className="flex flex-wrap gap-2">
                    {product.storage.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedStorage(index)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          selectedStorage === index 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
                            : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium">{option.size}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">${option.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Payment Options - cleaner design */}
              <div className="mb-10">
                <Text className="text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Payment Options</Text>
                <div className="flex space-x-3 mb-8">
                  <button
                    onClick={() => setSelectedPaymentType('full')}
                    className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                      selectedPaymentType === 'full' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400' 
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <Text className={`text-center ${selectedPaymentType === 'full' ? 'font-medium text-blue-600 dark:text-blue-400' : ''}`}>
                      Full Payment
                    </Text>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPaymentType('nasiya')}
                    className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                      selectedPaymentType === 'nasiya' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400' 
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <Text className={`text-center ${selectedPaymentType === 'nasiya' ? 'font-medium text-blue-600 dark:text-blue-400' : ''}`}>
                      Nasiya
                    </Text>
                  </button>
                </div>
                
                {/* Price display - cleaner presentation */}
                {selectedPaymentType === 'full' ? (
                  <div className="mb-8">
                    <ApplePrice className="text-3xl">${totalPrice}</ApplePrice>
                    <Text size="sm" className="text-gray-500 dark:text-gray-400 mt-1">One-time payment</Text>
                  </div>
                ) : (
                  <div className="mb-8">
                    {/* Installment plan selection */}
                    <div className="mb-4">
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">Select payment period:</Text>
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
                            {months} months
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <ApplePrice className="text-3xl">${totalMonthlyPayment}</ApplePrice>
                    <Text size="sm" className="text-gray-500 dark:text-gray-400 mt-1">
                      per month for {selectedInstallmentPlan} months
                    </Text>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Base price:</span>
                        <span className="text-gray-700 dark:text-gray-300">${totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Nasiya markup (30%):</span>
                        <span className="text-gray-700 dark:text-gray-300">+${totalNasiyaPrice - totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium pt-1 border-t border-gray-200 dark:border-gray-800">
                        <span className="text-gray-700 dark:text-gray-300">Total cost:</span>
                        <span className="text-gray-900 dark:text-gray-100">${totalNasiyaPrice}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Quantity selector - minimal design */}
                <div className="mb-8">
                  <Text className="text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Quantity</Text>
                  <div className="flex items-center">
                    <button 
                      onClick={decreaseQuantity}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <span className="text-lg">-</span>
                    </button>
                    <span className="mx-4 w-6 text-center text-gray-800 dark:text-gray-200 font-medium">
                      {quantity}
                    </span>
                    <button 
                      onClick={increaseQuantity}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Product description and features - moved to bottom */}
              <div className="mb-10 border-t border-gray-200 dark:border-gray-800 pt-8">
                <Text className="text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">About This Product</Text>
                <AppleProductDescription className="text-base mb-8 max-w-md">{product.description}</AppleProductDescription>
                
                <Text className="text-sm uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Key Features</Text>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full mr-3"></div>
                      <Text className="text-gray-700 dark:text-gray-300">{feature}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ContentBlock>
      </Section>
      
      {/* Persistent product summary bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Product thumbnail */}
            {product.images.length > 0 && (
              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Product info summary */}
            <div>
              <Text className="font-medium text-gray-900 dark:text-white text-sm">{product.name}</Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {currentColor}{currentStorage ? ` • ${currentStorage}` : ''} • Qty: {quantity}
              </Text>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Price summary */}
            <div className="text-right hidden sm:block">
              <Text className="font-medium text-gray-900 dark:text-white text-sm">{currentPriceDisplay}</Text>
              {selectedPaymentType === 'nasiya' && (
                <Text className="text-xs text-gray-500 dark:text-gray-400">Total: ${totalNasiyaPrice}</Text>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="small"
                className="text-xs py-2 px-3 hidden sm:block"
              >
                Save
              </Button>
              <Button 
                variant="primary" 
                size="small"
                className="text-xs py-2 px-3"
              >
                Add to Bag
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage; 