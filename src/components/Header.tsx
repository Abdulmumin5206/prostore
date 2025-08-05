import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Apple, Search, ShoppingBag } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import TopPromotionalSection from './TopPromotionalSection';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Store', href: '/store' },
    { name: 'Mac', href: '/mac' },
    { name: 'iPad', href: '/ipad' },
    { name: 'iPhone', href: '/iphone' },
    { name: 'Watch', href: '/watch' },
    { name: 'Vision', href: '/vision' },
    { name: 'AirPods', href: '/airpods' },
    { name: 'TV & Home', href: '/tv-home' },
    { name: 'Entertainment', href: '/entertainment' },
    { name: 'Accessories', href: '/accessories' },
    { name: 'Support', href: '/support' },
  ];

  return (
    <header className="bg-black dark:bg-black text-white sticky top-0 z-50 transition-colors duration-300">
      <TopPromotionalSection />
      <div className="max-w-laptop mx-auto px-section-x">
        <nav className="flex items-center justify-between h-12">
          <Link to="/" className="flex items-center">
            <Apple className="h-4 w-4" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-xs font-normal tracking-tight hover:text-gray-300 dark:hover:text-gray-200 transition-colors duration-200 ${
                  location.pathname === item.href ? 'text-white dark:text-gray-100' : 'text-gray-300 dark:text-gray-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Search className="h-4 w-4 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 cursor-pointer transition-colors duration-200" />
            <ShoppingBag className="h-4 w-4 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 cursor-pointer transition-colors duration-200" />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;