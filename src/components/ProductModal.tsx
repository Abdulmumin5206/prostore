import React from 'react';
import { X } from 'lucide-react';
import { Text, AppleProductTitle, ApplePrice } from './Typography';
import Button from './Button';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    category: string;
    name: string;
    image: string;
    colors: string[];
    storages?: string[];
    priceFrom: string;
    monthlyFrom: string;
    description?: string;
  } | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-xl"
        onClick={handleModalClick}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl p-6">
            <img 
              src={product.image} 
              alt={product.name}
              className="max-h-80 object-contain"
            />
          </div>
          
          {/* Product Details */}
          <div>
            <div className="mb-2">
              <Text size="sm" color="tertiary" className="uppercase tracking-wider">{product.category}</Text>
            </div>
            
            <AppleProductTitle className="mb-4">{product.name}</AppleProductTitle>
            
            <div className="mb-6">
              <Text className="mb-4">
                {product.description || "Experience innovation at your fingertips with this premium device. Designed for performance and elegance, it's the perfect addition to your digital lifestyle."}
              </Text>
            </div>
            
            {/* Color Options */}
            <div className="mb-6">
              <Text weight="medium" className="mb-2">Available Colors:</Text>
              <div className="flex space-x-3">
                {product.colors.map((color, index) => (
                  <div 
                    key={index}
                    className={`w-8 h-8 rounded-full border cursor-pointer ${
                      index === 0 ? 'border-gray-400 ring-2 ring-blue-500' : 'border-gray-200 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Color option ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Storage Options */}
            {product.storages && product.storages.length > 0 && (
              <div className="mb-6">
                <Text weight="medium" className="mb-2">Storage:</Text>
                <div className="flex flex-wrap gap-2">
                  {product.storages.map((s, idx) => (
                    <span key={idx} className={`px-3 py-1 rounded-md border text-sm ${idx===0? 'bg-blue-50 dark:bg-blue-900/10 border-blue-400 text-blue-600 dark:text-blue-300':'border-gray-300 dark:border-gray-600'}`}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pricing */}
            <div className="mb-6">
              <ApplePrice className="text-2xl mb-1">
                {product.priceFrom}
              </ApplePrice>
              <Text color="tertiary">{product.monthlyFrom}</Text>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="primary">Add to Bag</Button>
              <Button variant="secondary">Learn more</Button>
            </div>
          </div>
        </div>
        
        {/* Additional Product Details */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Text weight="medium" className="mb-4">Product Features</Text>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-blue-500">•</div>
                  <Text size="sm">High-performance technology</Text>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-blue-500">•</div>
                  <Text size="sm">Premium build quality</Text>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-blue-500">•</div>
                  <Text size="sm">Advanced functionality</Text>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-blue-500">•</div>
                  <Text size="sm">Intuitive user experience</Text>
                </li>
              </ul>
            </div>
            <div>
              <Text weight="medium" className="mb-4">In The Box</Text>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-blue-500">•</div>
                  <Text size="sm">{product.name}</Text>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-blue-500">•</div>
                  <Text size="sm">USB-C Charging Cable</Text>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 text-blue-500">•</div>
                  <Text size="sm">Documentation</Text>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal; 