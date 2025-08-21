import React from 'react';
import { AppleProductTitle, Text, Label } from './Typography';
import Button from './Button';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  id: string;
  category: string;
  name: string;
  image: string;
  colors: string[];
  priceFrom: string;
  monthlyFrom: string;
  buyLink?: string;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  category,
  name,
  image,
  colors,
  priceFrom,
  monthlyFrom,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {/* Category Label */}
      <Label className="mb-2 uppercase text-xs tracking-wider">{category}</Label>
      
      {/* Product Name */}
      <AppleProductTitle className="mb-6">{name}</AppleProductTitle>
      
      {/* Product Image */}
      <div className="mb-6 flex-grow flex items-center justify-center bg-white">
        <OptimizedImage
          src={image}
          alt={name}
          width={480}
          height={288}
          fit="contain"
          quality={70}
          className="w-full h-48 object-contain object-center transform scale-90 bg-white"
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
      </div>
      
      {/* Color Options */}
      <div className="flex justify-center space-x-2 mb-6">
        {colors.map((color, colorIndex) => (
          <div
            key={colorIndex}
            className={`w-4 h-4 rounded-full border ${
              colorIndex === 0 ? 'border-gray-400' : 'border-gray-200 dark:border-gray-600'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Color option ${colorIndex + 1}`}
          />
        ))}
      </div>
      
      {/* Pricing */}
      <div className="text-center mb-6">
        <Text weight="semibold" className="mb-1">From {priceFrom}</Text>
        <Text size="sm" color="tertiary" className="mb-4">or {monthlyFrom}</Text>
      </div>
      
      {/* Buy Button */}
      <Button 
        variant="primary" 
        size="small" 
        className="mx-auto bg-[#0071e3] hover:opacity-90"
      >
        Buy
      </Button>
    </div>
  );
};

export default ProductCard; 