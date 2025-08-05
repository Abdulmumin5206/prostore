import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Define the types for dropdown items
export type DropdownSection = {
  title: string;
  items: { name: string; href: string }[];
};

export type DropdownContent = {
  sections: DropdownSection[];
};

// Define dropdown contents for each nav item
export const dropdownContents: Record<string, DropdownContent> = {
  'Store': {
    sections: [
      {
        title: 'Shop',
        items: [
          { name: 'Shop the Latest', href: '/store/latest' },
          { name: 'Mac', href: '/mac' },
          { name: 'iPad', href: '/ipad' },
          { name: 'iPhone', href: '/iphone' },
          { name: 'Apple Watch', href: '/watch' },
          { name: 'Apple Vision Pro', href: '/vision' },
          { name: 'Accessories', href: '/accessories' },
        ]
      },
      {
        title: 'Quick Links',
        items: [
          { name: 'Find a Store', href: '/store/find' },
          { name: 'Order Status', href: '/store/order' },
          { name: 'Apple Trade In', href: '/store/trade-in' },
          { name: 'Financing', href: '/store/financing' },
          { name: 'Personal Setup', href: '/store/setup' },
          { name: 'College Student Offer', href: '/store/education' },
        ]
      },
      {
        title: 'Shop Special Stores',
        items: [
          { name: 'Certified Refurbished', href: '/store/refurbished' },
          { name: 'Education', href: '/store/education' },
          { name: 'Business', href: '/store/business' },
          { name: 'Veterans and Military', href: '/store/military' },
          { name: 'Government', href: '/store/government' },
        ]
      }
    ]
  },
  'Mac': {
    sections: [
      {
        title: 'Explore Mac',
        items: [
          { name: 'Explore All Mac', href: '/mac' },
          { name: 'MacBook Air', href: '/mac/macbook-air' },
          { name: 'MacBook Pro', href: '/mac/macbook-pro' },
          { name: 'iMac', href: '/mac/imac' },
          { name: 'Mac mini', href: '/mac/mac-mini' },
          { name: 'Mac Studio', href: '/mac/mac-studio' },
          { name: 'Mac Pro', href: '/mac/mac-pro' },
          { name: 'Displays', href: '/mac/displays' },
        ]
      },
      {
        title: 'Shop Mac',
        items: [
          { name: 'Shop Mac', href: '/shop/mac' },
          { name: 'Mac Accessories', href: '/shop/mac/accessories' },
          { name: 'Apple Trade In', href: '/shop/trade-in' },
          { name: 'Financing', href: '/shop/financing' },
        ]
      }
    ]
  },
  'iPad': {
    sections: [
      {
        title: 'Explore iPad',
        items: [
          { name: 'Explore All iPad', href: '/ipad' },
          { name: 'iPad Pro', href: '/ipad/ipad-pro' },
          { name: 'iPad Air', href: '/ipad/ipad-air' },
          { name: 'iPad', href: '/ipad/ipad' },
          { name: 'iPad mini', href: '/ipad/ipad-mini' },
          { name: 'Apple Pencil', href: '/ipad/apple-pencil' },
          { name: 'Keyboards', href: '/ipad/keyboards' },
        ]
      },
      {
        title: 'Shop iPad',
        items: [
          { name: 'Shop iPad', href: '/shop/ipad' },
          { name: 'iPad Accessories', href: '/shop/ipad/accessories' },
          { name: 'Apple Trade In', href: '/shop/trade-in' },
          { name: 'Financing', href: '/shop/financing' },
        ]
      }
    ]
  },
  'iPhone': {
    sections: [
      {
        title: 'Explore iPhone',
        items: [
          { name: 'Explore All iPhone', href: '/iphone' },
          { name: 'iPhone 15 Pro', href: '/iphone/iphone-15-pro' },
          { name: 'iPhone 15', href: '/iphone/iphone-15' },
          { name: 'iPhone 14', href: '/iphone/iphone-14' },
          { name: 'iPhone 13', href: '/iphone/iphone-13' },
          { name: 'iPhone SE', href: '/iphone/iphone-se' },
        ]
      },
      {
        title: 'Shop iPhone',
        items: [
          { name: 'Shop iPhone', href: '/shop/iphone' },
          { name: 'iPhone Accessories', href: '/shop/iphone/accessories' },
          { name: 'Apple Trade In', href: '/shop/trade-in' },
          { name: 'Carrier Deals', href: '/shop/iphone/carrier-deals' },
          { name: 'Financing', href: '/shop/financing' },
        ]
      },
      {
        title: 'More from iPhone',
        items: [
          { name: 'iPhone Support', href: '/support/iphone' },
          { name: 'iOS 17', href: '/ios/ios-17' },
          { name: 'iPhone Privacy', href: '/iphone/privacy' },
          { name: 'iCloud+', href: '/icloud' },
          { name: 'Wallet', href: '/wallet' },
          { name: 'Siri', href: '/siri' },
        ]
      }
    ]
  },
  'Watch': {
    sections: [
      {
        title: 'Explore Watch',
        items: [
          { name: 'Explore All Apple Watch', href: '/watch' },
          { name: 'Apple Watch Series 9', href: '/watch/series-9' },
          { name: 'Apple Watch Ultra 2', href: '/watch/ultra-2' },
          { name: 'Apple Watch SE', href: '/watch/se' },
          { name: 'Apple Watch Nike', href: '/watch/nike' },
        ]
      },
      {
        title: 'Shop Watch',
        items: [
          { name: 'Shop Apple Watch', href: '/shop/watch' },
          { name: 'Apple Watch Studio', href: '/shop/watch/studio' },
          { name: 'Apple Watch Bands', href: '/shop/watch/bands' },
          { name: 'Apple Watch Accessories', href: '/shop/watch/accessories' },
          { name: 'Apple Trade In', href: '/shop/trade-in' },
          { name: 'Financing', href: '/shop/financing' },
        ]
      }
    ]
  },
  'Vision': {
    sections: [
      {
        title: 'Explore Vision',
        items: [
          { name: 'Apple Vision Pro', href: '/vision-pro' },
          { name: 'Apps & Games', href: '/vision-pro/apps' },
          { name: 'visionOS', href: '/visionos' },
        ]
      },
      {
        title: 'Shop Vision',
        items: [
          { name: 'Shop Apple Vision Pro', href: '/shop/vision-pro' },
          { name: 'Apple Vision Pro Accessories', href: '/shop/vision-pro/accessories' },
          { name: 'Financing', href: '/shop/financing' },
        ]
      }
    ]
  },
  'AirPods': {
    sections: [
      {
        title: 'Explore Audio',
        items: [
          { name: 'Explore All AirPods', href: '/airpods' },
          { name: 'AirPods Pro', href: '/airpods-pro' },
          { name: 'AirPods', href: '/airpods' },
          { name: 'AirPods Max', href: '/airpods-max' },
          { name: 'Apple Music', href: '/apple-music' },
        ]
      },
      {
        title: 'Shop Audio',
        items: [
          { name: 'Shop AirPods', href: '/shop/airpods' },
          { name: 'AirPods Accessories', href: '/shop/airpods/accessories' },
        ]
      }
    ]
  },
  'TV & Home': {
    sections: [
      {
        title: 'Explore TV & Home',
        items: [
          { name: 'Explore TV & Home', href: '/tv-home' },
          { name: 'Apple TV 4K', href: '/tv-home/apple-tv-4k' },
          { name: 'HomePod', href: '/tv-home/homepod' },
          { name: 'HomePod mini', href: '/tv-home/homepod-mini' },
        ]
      },
      {
        title: 'Shop TV & Home',
        items: [
          { name: 'Shop Apple TV 4K', href: '/shop/tv-home/apple-tv-4k' },
          { name: 'Shop HomePod', href: '/shop/tv-home/homepod' },
          { name: 'Shop HomePod mini', href: '/shop/tv-home/homepod-mini' },
          { name: 'TV & Home Accessories', href: '/shop/tv-home/accessories' },
        ]
      }
    ]
  },
  'Entertainment': {
    sections: [
      {
        title: 'Explore Entertainment',
        items: [
          { name: 'Apple One', href: '/apple-one' },
          { name: 'Apple TV+', href: '/apple-tv-plus' },
          { name: 'Apple Music', href: '/apple-music' },
          { name: 'Apple Arcade', href: '/apple-arcade' },
          { name: 'Apple Fitness+', href: '/fitness-plus' },
          { name: 'Apple News+', href: '/news-plus' },
          { name: 'Apple Podcasts', href: '/podcasts' },
          { name: 'Apple Books', href: '/books' },
          { name: 'App Store', href: '/app-store' },
        ]
      }
    ]
  },
  'Accessories': {
    sections: [
      {
        title: 'Shop Accessories',
        items: [
          { name: 'Shop All Accessories', href: '/shop/accessories' },
          { name: 'Mac', href: '/shop/accessories/mac' },
          { name: 'iPad', href: '/shop/accessories/ipad' },
          { name: 'iPhone', href: '/shop/accessories/iphone' },
          { name: 'Apple Watch', href: '/shop/accessories/watch' },
          { name: 'AirPods', href: '/shop/accessories/airpods' },
          { name: 'Apple Vision Pro', href: '/shop/accessories/vision-pro' },
          { name: 'TV & Home', href: '/shop/accessories/tv-home' },
        ]
      },
      {
        title: 'Explore Accessories',
        items: [
          { name: 'Made by Apple', href: '/shop/accessories/made-by-apple' },
          { name: 'Beats by Dr. Dre', href: '/shop/accessories/beats' },
          { name: 'AirTag', href: '/airtag' },
        ]
      }
    ]
  },
  'Support': {
    sections: [
      {
        title: 'Explore Support',
        items: [
          { name: 'iPhone', href: '/support/iphone' },
          { name: 'Mac', href: '/support/mac' },
          { name: 'iPad', href: '/support/ipad' },
          { name: 'Watch', href: '/support/watch' },
          { name: 'AirPods', href: '/support/airpods' },
          { name: 'Music', href: '/support/music' },
          { name: 'TV', href: '/support/tv' },
        ]
      },
      {
        title: 'Get Help',
        items: [
          { name: 'Community', href: '/support/community' },
          { name: 'Check Coverage', href: '/support/coverage' },
          { name: 'Repair', href: '/support/repair' },
          { name: 'Contact Us', href: '/support/contact' },
        ]
      }
    ]
  }
};

interface NavDropdownProps {
  name: string;
  isVisible: boolean;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ name, isVisible }) => {
  const content = dropdownContents[name];
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [displayedName, setDisplayedName] = useState(name);
  
  // Update displayed content when name changes
  useEffect(() => {
    if (isVisible) {
      // Simple update with a slight delay to allow height calculation
      const timer = setTimeout(() => {
        setDisplayedName(name);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Update immediately when dropdown is closed
      setDisplayedName(name);
    }
  }, [name, isVisible]);
  
  // Measure content height
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [displayedName, isVisible]);
  
  if (!content) return null;
  
  const displayContent = dropdownContents[displayedName];
  
  if (!displayContent) return null;
  
  return (
    <div 
      ref={dropdownRef}
      className="absolute left-0 w-full bg-white backdrop-blur-md border-t border-gray-200 overflow-hidden transition-all duration-300 ease-out"
      style={{ 
        top: '48px',
        marginTop: '-1px',
        height: isVisible ? `${contentHeight}px` : '0px',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div 
        ref={contentRef} 
        className="max-w-laptop mx-auto px-section-x py-8 grid grid-cols-1 md:grid-cols-3 gap-8 transition-opacity duration-200"
      >
        {displayContent.sections.map((section, index) => (
          <div key={index}>
            <h3 className="text-gray-500 text-xs font-medium mb-2">{section.title}</h3>
            <ul className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Link 
                    to={item.href} 
                    className="text-xs font-normal text-gray-800 hover:text-gray-600 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavDropdown; 