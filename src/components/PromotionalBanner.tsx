import React from 'react';
import Section from './Section';
import ContentBlock from './ContentBlock';

const PromotionalBanner: React.FC = () => {
  return (
    <Section background="light" size="sm" className="pt-2">
      <ContentBlock spacing="none">
        <div className="w-full h-56 md:h-72 lg:h-80 overflow-hidden rounded-xl">
          <img 
            src="https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=1200" 
            alt="Promotional Banner"
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
          />
        </div>
      </ContentBlock>
    </Section>
  );
};

export default PromotionalBanner; 