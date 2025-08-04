import React from 'react';

const PromotionalBanner: React.FC = () => {
  return (
    <section className="pt-4 pb-16 px-4 bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl">
          <img 
            src="https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=1200" 
            alt="Promotional Banner"
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner; 