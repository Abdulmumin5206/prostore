import React from 'react';
import { Link } from 'react-router-dom';
import { AppleHeadline, AppleSubheadline, AppleProductTitle, AppleProductDescription, ApplePrice } from './Typography';
import Section from './Section';
import ContentBlock from './ContentBlock';
import Spacing from './Spacing';
import Button from './Button';

interface MacProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  link: string;
  features: string[];
}

const AppleNotebooksSection: React.FC = () => {
  const macProducts: MacProduct[] = [
    {
      id: 'macbook-air-m3',
      name: 'MacBook Air M3',
      description: 'The most versatile MacBook Air ever. Now with the M3 chip.',
      price: 'From $1099',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-m3-midnight-select-202403?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1707780024707',
      link: '/mac/macbook-air-m3',
      features: ['M3 chip', 'Up to 18-core GPU', 'Up to 24GB unified memory']
    },
    {
      id: 'macbook-pro-14',
      name: 'MacBook Pro 14"',
      description: 'Supercharged by M3 Pro and M3 Max. Built for pros.',
      price: 'From $1999',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-14-m3-max-pro-spaceblack-select-202310?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1696962662664',
      link: '/mac/macbook-pro-14',
      features: ['M3 Pro or M3 Max', 'Up to 22-core GPU', 'Up to 128GB unified memory']
    },
    {
      id: 'macbook-pro-16',
      name: 'MacBook Pro 16"',
      description: 'The most powerful MacBook Pro ever. Now with M3 Pro and M3 Max.',
      price: 'From $2499',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-pro-16-m3-max-pro-spaceblack-select-202310?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1696962662664',
      link: '/mac/macbook-pro-16',
      features: ['M3 Pro or M3 Max', 'Up to 40-core GPU', 'Up to 128GB unified memory']
    }
  ];

  return (
    <Section background="light" size="sm">
      <ContentBlock spacing="md">
        <AppleHeadline>Apple Notebooks</AppleHeadline>
        <Spacing size="sm" />
        <AppleSubheadline>
          Discover the perfect Mac for your needs
        </AppleSubheadline>
      </ContentBlock>
      
      <ContentBlock spacing="none">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {macProducts.map((product) => (
            <Link 
              key={product.id}
              to={product.link}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="aspect-square flex items-center justify-center mb-4 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                
                <div className="space-y-3">
                  <AppleProductTitle className="text-xl">
                    {product.name}
                  </AppleProductTitle>
                  
                  <AppleProductDescription className="text-sm">
                    {product.description}
                  </AppleProductDescription>
                  
                  <div className="space-y-2">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2">
                    <ApplePrice className="text-lg">{product.price}</ApplePrice>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ContentBlock>
      
      <ContentBlock spacing="none" className="text-center pt-4">
        <Button variant="primary" size="medium">
          Shop Mac
        </Button>
      </ContentBlock>
    </Section>
  );
};

export default AppleNotebooksSection; 