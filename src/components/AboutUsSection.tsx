import React from 'react';
import { Text, AppleHeadline, AppleSubheadline } from './Typography';
import Section from './Section';
import ContentBlock from './ContentBlock';
import Spacing from './Spacing';

const AboutUsSection: React.FC = () => {
  // Store location cards
  const storeCards = [
    {
      id: 'store-1',
      name: 'Apple Topanga',
      address: '6600 Topanga Canyon Boulevard',
      city: 'Canoga Park, CA 91303',
      hours: 'Opens at 10:00 a.m.',
      image: 'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800',
      link: '/stores/topanga'
    },
    {
      id: 'store-2',
      name: 'Apple Promenade Temecula',
      address: '40764 Winchester Road',
      city: 'Temecula, CA 92591',
      hours: 'Opens at 10:00 a.m.',
      image: 'https://images.pexels.com/photos/2079438/pexels-photo-2079438.jpeg?auto=compress&cs=tinysrgb&w=800',
      link: '/stores/temecula'
    },
    {
      id: 'store-3',
      name: 'Apple Quaker Bridge',
      address: '150 Quaker Bridge Mall',
      city: 'Lawrence Township, NJ 08648',
      hours: 'Open until 9:00 p.m.',
      image: 'https://images.pexels.com/photos/5082581/pexels-photo-5082581.jpeg?auto=compress&cs=tinysrgb&w=800',
      link: '/stores/quaker-bridge'
    }
  ];

  return (
    <>
      {/* Store Locations Section */}
      <Section background="light" size="lg">
        <ContentBlock spacing="md">
          <AppleHeadline>Stores in United States</AppleHeadline>
        </ContentBlock>
        
        <ContentBlock spacing="md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {storeCards.map((store) => (
              <div 
                key={store.id} 
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
              >
                <div className="flex flex-col h-full">
                  {/* Store Image */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <img 
                      src={store.image} 
                      alt={store.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Store Info */}
                  <div className="p-6 flex flex-col flex-grow">
                    <Text size="xl" weight="semibold" color="primary" className="mb-1">
                      {store.name}
                    </Text>
                    <Text size="sm" color="secondary" className="mb-0.5">
                      {store.address}
                    </Text>
                    <Text size="sm" color="secondary" className="mb-4">
                      {store.city}
                    </Text>
                    
                    <div className="mt-auto">
                      <Text size="sm" color="secondary">
                        {store.hours}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ContentBlock>
      </Section>

      {/* Apple Vision Pro Demo Section */}
      <Section background="light" size="lg">
        <ContentBlock spacing="md">
          <div className="text-center mb-12">
            <AppleHeadline>Come see the best of Apple at our stores.</AppleHeadline>
            <AppleSubheadline className="mt-4">Shop our products and get expert advice in person.</AppleSubheadline>
          </div>
        </ContentBlock>
        
        <ContentBlock spacing="md">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
              <div className="flex flex-col lg:flex-row">
                {/* Left Section - Text Content */}
                <div className="lg:w-1/2 p-12 flex flex-col justify-center">
                  <Text size="sm" color="secondary" className="mb-4">
                    Only at Apple
                  </Text>
                  <Text size="3xl" weight="semibold" color="primary" className="mb-6">
                    Experience Apple Vision Pro.
                  </Text>
                  <Text size="lg" color="secondary" className="mb-8">
                    Sign up for a demo at an Apple Store near you.
                  </Text>
                  <Text size="lg" color="accent" className="font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                    Book a demo &gt;
                  </Text>
                </div>
                
                {/* Right Section - Image Content */}
                <div className="lg:w-1/2">
                  <div className="relative w-full h-full aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden">
                    <img 
                      src="https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg?auto=compress&cs=tinysrgb&w=800" 
                      alt="Apple Vision Pro demo in store" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentBlock>
      </Section>

      {/* Two Cards Section */}
      <Section background="light" size="lg">
        <ContentBlock spacing="md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* College Offer Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
              <div className="flex flex-col h-full">
                {/* Card Image */}
                <div className="relative w-full aspect-[3/2] overflow-hidden">
                  <img 
                    src="https://images.pexels.com/photos/2079438/pexels-photo-2079438.jpeg?auto=compress&cs=tinysrgb&w=800" 
                    alt="Apple products for college" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                {/* Card Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <Text size="sm" color="secondary" className="mb-3">
                    Limited-Time Offer
                  </Text>
                  <Text size="xl" weight="semibold" color="primary" className="mb-6">
                    Save on Mac and iPad for college, choose AirPods or an eligible accessory.
                  </Text>
                  
                  <div className="mt-auto">
                    <Text size="lg" color="accent" className="font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                      Shop &gt;
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Apple Intelligence Session Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
              <div className="flex flex-col h-full">
                {/* Card Image */}
                <div className="relative w-full aspect-[3/2] overflow-hidden">
                  <img 
                    src="https://images.pexels.com/photos/5082581/pexels-photo-5082581.jpeg?auto=compress&cs=tinysrgb&w=800" 
                    alt="Apple Intelligence session" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                {/* Card Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <Text size="sm" color="secondary" className="mb-3">
                    Today at Apple
                  </Text>
                  <Text size="xl" weight="semibold" color="primary" className="mb-6">
                    Explore Apple Intelligence in a free session at your Apple Store.
                  </Text>
                  
                  <div className="mt-auto">
                    <Text size="lg" color="accent" className="font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                      Sign up &gt;
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentBlock>
      </Section>
    </>
  );
};

export default AboutUsSection; 