import React, { useState } from 'react';
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
    ],
    characteristics: {
      display: '6.7-inch Super Retina XDR display with ProMotion technology',
      processor: 'A18 Bionic chip with 6-core CPU and 5-core GPU',
      camera: 'Pro camera system with 48MP main camera, 12MP ultra-wide, and 12MP telephoto',
      battery: 'Up to 28 hours of video playback',
      storage: '128GB, 256GB, 512GB, or 1TB options',
      connectivity: '5G capable, Wi-Fi 6E, Bluetooth 5.3',
      security: 'Face ID, Touch ID, and advanced encryption'
    },
    nasiyaDetails: {
      eligibility: 'Available for all customers with valid ID and proof of income',
      requirements: 'Minimum 3 months employment, clean credit history',
      documents: 'Passport, employment certificate, bank statement',
      process: 'Online application with instant approval, delivery within 24 hours',
      benefits: 'No hidden fees, flexible payment schedules, early repayment options'
    }
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
  const [activeTab, setActiveTab] = useState<'description' | 'characteristics' | 'nasiya'>('description');
  
  // Fallback product data if the ID doesn't match
  const product = productData[productId as keyof typeof productData] || {
    name: 'Product Not Found',
    color: '',
    basePrice: 0,
    description: 'The requested product could not be found.',
    features: [],
    images: [],
    colors: [],
    storage: [],
    characteristics: {},
    nasiyaDetails: {}
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
        <nav className="flex items-center">
          <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Text size="xs" color="tertiary">Home</Text>
          </Link>
          <span className="mx-1.5">
            <Text size="xs" color="tertiary">›</Text>
          </span>
          <Link to="/store" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Text size="xs" color="tertiary">Store</Text>
          </Link>
          <span className="mx-1.5">
            <Text size="xs" color="tertiary">›</Text>
          </span>
          <Link to="/iphone" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Text size="xs" color="tertiary">iPhone</Text>
          </Link>
          <span className="mx-1.5">
            <Text size="xs" color="tertiary">›</Text>
          </span>
          <Text size="xs" color="secondary">{product.name}</Text>
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
                    <Text color="tertiary">Image not available</Text>
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
                <AppleProductTitle className="text-4xl">{product.name}</AppleProductTitle>
              </div>
              
              {/* Color options */}
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
                        title={color.name}
                      >
                        <span 
                          className="w-8 h-8 rounded-full" 
                          style={{backgroundColor: color.value}}
                        ></span>
                      </button>
                    ))}
                  </div>
                  <Text size="sm" color="tertiary" className="mt-2">{currentColor}</Text>
                </div>
              )}
              
              {/* Storage options */}
              {product.storage && product.storage.length > 0 && (
                <div className="mb-8">
                  <Label size="xs" transform="uppercase" color="tertiary" className="mb-4">Storage</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.storage.map((option, index) => {
                      const basePrice = product.storage[0].price;
                      const priceDifference = option.price - basePrice;
                      const isSelected = selectedStorage === index;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedStorage(index)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-400 text-blue-600 dark:text-blue-400' 
                              : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium">{option.size}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {index === 0 ? '+$0' : `+$${priceDifference}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Payment Options - cleaner design */}
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
                    <Text 
                      size="sm" 
                      weight={selectedPaymentType === 'full' ? "medium" : "normal"}
                      color={selectedPaymentType === 'full' ? "accent" : "inherit"}
                      align="center"
                    >
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
                    <Text 
                      size="sm" 
                      weight={selectedPaymentType === 'nasiya' ? "medium" : "normal"}
                      color={selectedPaymentType === 'nasiya' ? "accent" : "inherit"}
                      align="center"
                    >
                      Nasiya
                    </Text>
                  </button>
                </div>
                
                {/* Price display - cleaner presentation */}
                {selectedPaymentType === 'full' ? (
                  <div className="mb-8">
                    <ApplePrice className="text-3xl">${totalPrice}</ApplePrice>
                    <Text size="sm" color="tertiary" className="mt-1">One-time payment</Text>
                  </div>
                ) : (
                  <div className="mb-8">
                    {/* Installment plan selection */}
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
                            <Text size="xs" color="inherit">
                              {months} months
                            </Text>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <ApplePrice className="text-3xl">${totalMonthlyPayment}</ApplePrice>
                    <Text size="sm" color="tertiary" className="mt-1">
                      per month for {selectedInstallmentPlan} months
                    </Text>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex justify-between text-xs mb-1">
                        <Text size="xs" color="tertiary">Base price:</Text>
                        <Text size="xs" color="secondary">${totalPrice}</Text>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <Text size="xs" color="tertiary">Nasiya markup (30%):</Text>
                        <Text size="xs" color="secondary">+${totalNasiyaPrice - totalPrice}</Text>
                      </div>
                      <div className="flex justify-between text-xs font-medium pt-1 border-t border-gray-200 dark:border-gray-800">
                        <Text size="xs" color="secondary" weight="medium">Total cost:</Text>
                        <Text size="xs" color="primary" weight="medium">${totalNasiyaPrice}</Text>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
              
            </div>
          </div>
        </ContentBlock>
      </Section>
      
      {/* Detailed Description Section */}
      <Section background="light" size="lg">
        <ContentBlock spacing="md">
          <div className="py-8">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 transition-colors ${
                  activeTab === 'description'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Text size="sm" weight="medium" color="inherit">Description</Text>
              </button>
              <button
                onClick={() => setActiveTab('characteristics')}
                className={`px-6 py-3 transition-colors ${
                  activeTab === 'characteristics'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Text size="sm" weight="medium" color="inherit">Characteristics</Text>
              </button>
              <button
                onClick={() => setActiveTab('nasiya')}
                className={`px-6 py-3 transition-colors ${
                  activeTab === 'nasiya'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Text size="sm" weight="medium" color="inherit">Nasiya Details</Text>
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="max-w-4xl">
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div>
                    <H3 className="mb-4">About This Product</H3>
                    <AppleProductDescription className="mb-6">
                      {product.description}
                    </AppleProductDescription>
                    
                    <H4 className="mb-3">Key Features</H4>
                    <ul className="space-y-2 mb-6">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                          <Text color="secondary">{feature}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <H3 className="mb-4">Product Overview</H3>
                    <AppleProductDescription>
                      Experience the future of mobile technology with the iPhone 16. This revolutionary device combines cutting-edge innovation with timeless design, delivering an unparalleled user experience that adapts to your lifestyle.
                    </AppleProductDescription>
                  </div>
                  
                  <div>
                    <H4 className="mb-3">What's New</H4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                        <Text color="secondary">Revolutionary A18 Bionic chip for lightning-fast performance</Text>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                        <Text color="secondary">Advanced camera system with AI-powered photography</Text>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                        <Text color="secondary">All-day battery life that keeps up with your busy schedule</Text>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 mr-3"></div>
                        <Text color="secondary">Enhanced security with Face ID and advanced encryption</Text>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <H4 className="mb-3">Perfect For</H4>
                    <AppleProductDescription>
                      Whether you're a creative professional, a business executive, or someone who simply appreciates the best technology has to offer, the iPhone 16 is designed to exceed your expectations. Its powerful capabilities make it perfect for photography, gaming, productivity, and everyday use.
                    </AppleProductDescription>
                  </div>
                </div>
              )}
              
              {activeTab === 'characteristics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <H4 className="mb-3">Display</H4>
                      <Text color="secondary">{product.characteristics?.display}</Text>
                    </div>
                    <div>
                      <H4 className="mb-3">Processor</H4>
                      <Text color="secondary">{product.characteristics?.processor}</Text>
                    </div>
                    <div>
                      <H4 className="mb-3">Camera</H4>
                      <Text color="secondary">{product.characteristics?.camera}</Text>
                    </div>
                    <div>
                      <H4 className="mb-3">Battery</H4>
                      <Text color="secondary">{product.characteristics?.battery}</Text>
                    </div>
                    <div>
                      <H4 className="mb-3">Storage</H4>
                      <Text color="secondary">{product.characteristics?.storage}</Text>
                    </div>
                    <div>
                      <H4 className="mb-3">Connectivity</H4>
                      <Text color="secondary">{product.characteristics?.connectivity}</Text>
                    </div>
                    <div>
                      <H4 className="mb-3">Security</H4>
                      <Text color="secondary">{product.characteristics?.security}</Text>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'nasiya' && (
                <div className="space-y-6">
                  <div>
                    <H3 className="mb-4">Nasiya Payment Information</H3>
                    <AppleProductDescription>
                      We offer flexible payment options through our trusted nasiya partners, making premium technology accessible to everyone.
                    </AppleProductDescription>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <H4 className="mb-3">Eligibility</H4>
                      <Text color="secondary">{product.nasiyaDetails?.eligibility}</Text>
                    </div>
                    <div>
                      <H4 className="mb-3">Requirements</H4>
                      <Text color="secondary">{product.nasiyaDetails?.requirements}</Text>
                    </div>
                    <div>
                      <H4 className="mb-3">Required Documents</H4>
                      <Text color="secondary">{product.nasiyaDetails?.documents}</Text>
                    </div>
                    <div>
                      <H4 className="mb-3">Application Process</H4>
                      <Text color="secondary">{product.nasiyaDetails?.process}</Text>
                    </div>
                    <div className="md:col-span-2">
                      <H4 className="mb-3">Benefits</H4>
                      <Text color="secondary">{product.nasiyaDetails?.benefits}</Text>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
                    <H4 className="text-blue-900 dark:text-blue-100 mb-2">Important Notes</H4>
                    <ul className="space-y-1">
                      <li className="flex items-start">
                        <div className="w-1 h-1 bg-blue-800 dark:bg-blue-200 rounded-full mt-2 mr-2"></div>
                        <Text size="sm" color="inherit" className="text-blue-800 dark:text-blue-200">30% markup applies to all nasiya payments</Text>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1 h-1 bg-blue-800 dark:bg-blue-200 rounded-full mt-2 mr-2"></div>
                        <Text size="sm" color="inherit" className="text-blue-800 dark:text-blue-200">Early repayment available with no penalties</Text>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1 h-1 bg-blue-800 dark:bg-blue-200 rounded-full mt-2 mr-2"></div>
                        <Text size="sm" color="inherit" className="text-blue-800 dark:text-blue-200">Insurance coverage included for device protection</Text>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1 h-1 bg-blue-800 dark:bg-blue-200 rounded-full mt-2 mr-2"></div>
                        <Text size="sm" color="inherit" className="text-blue-800 dark:text-blue-200">24/7 customer support for payment-related queries</Text>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
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
              <Text size="sm" weight="medium" color="primary">{product.name}</Text>
              <Caption>
                {currentColor}{currentStorage ? ` • ${currentStorage}` : ''}
              </Caption>
            </div>
            
            {/* Quantity selector */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={decreaseQuantity}
                className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                disabled={quantity <= 1}
              >
                <span className="text-sm">-</span>
              </button>
              <span className="w-4 text-center text-gray-800 dark:text-gray-200 font-medium text-sm">
                {quantity}
              </span>
              <button 
                onClick={increaseQuantity}
                className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <span className="text-sm">+</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Price summary */}
            <div className="text-right hidden sm:block">
              <Text size="sm" weight="medium" color="primary">{currentPriceDisplay}</Text>
              {selectedPaymentType === 'nasiya' && (
                <Caption>Total: ${totalNasiyaPrice}</Caption>
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