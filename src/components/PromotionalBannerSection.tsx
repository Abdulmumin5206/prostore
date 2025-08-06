import React from 'react';

const PromotionalBannerSection: React.FC = () => {
  return (
    <section className="py-8 md:py-12 lg:py-16 2xl:py-20 bg-[#f5f5f7] dark:bg-black">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-32 3xl:px-44">
        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm transition-all duration-500 ease-out transform hover:scale-[1.02] hover:shadow-md cursor-pointer">
          <div className="w-full h-64 md:h-80 lg:h-96">
            <img 
              src="/Iphone_main/iphone_16pro_promax.jpg" 
              alt="Promotional Offer" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBannerSection; 