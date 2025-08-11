import React from 'react';
import { Link } from 'react-router-dom';
import { Text, AppleHeadline, AppleSubheadline, AppleProductTitle, AppleProductDescription, ApplePrice } from './Typography';
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
    // MacBook Air models
    {
      id: 'macbook-air-13-m4',
      name: 'MacBook Air 13" (M4)',
      description: 'The most powerful MacBook Air ever. Now with the M4 chip.',
      price: 'From $1199',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-m3-midnight-select-202403?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1707780024707',
      link: '/mac/macbook-air-13/m4',
      features: ['M4 chip', 'Up to 10-core CPU', 'Up to 32GB unified memory', 'Up to 20 hours battery life']
    },
    {
      id: 'macbook-air-15-m4',
      name: 'MacBook Air 15" (M4)',
      description: 'Incredibly thin. Impressively large. Supercharged by M4.',
      price: 'From $1299',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-m3-midnight-select-202403?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1707780024707',
      link: '/mac/macbook-air-15/m4',
      features: ['M4 chip', 'Up to 10-core CPU', 'Up to 32GB unified memory', 'Up to 18 hours battery life']
    },
    {
      id: 'macbook-air-13-m3',
      name: 'MacBook Air 13" (M3)',
      description: 'The world\'s best consumer laptop now with the M3 chip.',
      price: 'From $1099',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-m3-midnight-select-202403?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1707780024707',
      link: '/mac/macbook-air-13/m3',
      features: ['M3 chip', 'Up to 10-core GPU', 'Up to 24GB unified memory', 'Up to 18 hours battery life']
    },
    
    // MacBook Pro models
    {
      id: 'macbook-pro-13-m4',
      name: 'MacBook Pro 13" (M4)',
      description: 'Pro power. Pro portability. Pro level performance with M4.',
      price: 'From $1299',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202206?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1664497359481',
      link: '/mac/macbook-pro-13/m4',
      features: ['M4 chip', 'Up to 12-core GPU', 'Up to 32GB unified memory', 'Up to 20 hours battery life']
    },
    {
      id: 'macbook-pro-15-m4',
      name: 'MacBook Pro 15" (M4)',
      description: 'The ultimate pro laptop. Now with M4 Pro and M4 Max.',
      price: 'From $1999',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202206?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1664497359481',
      link: '/mac/macbook-pro-15/m4',
      features: ['M4 Pro or M4 Max', 'Up to 40-core GPU', 'Up to 96GB unified memory', 'Up to 22 hours battery life']
    },
    {
      id: 'macbook-pro-13-m3',
      name: 'MacBook Pro 13" (M3)',
      description: 'Pro anywhere. With the power-efficient performance of M3.',
      price: 'From $1299',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202206?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1664497359481',
      link: '/mac/macbook-pro-13/m3',
      features: ['M3 chip', 'Up to 10-core GPU', 'Up to 24GB unified memory', 'Up to 18 hours battery life']
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
                      <div key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        <Text size="xs" color="tertiary">
                          {feature}
                        </Text>
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