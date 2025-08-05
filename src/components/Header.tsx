import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Apple, Search, ShoppingBag } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NavDropdown from './NavDropdown';
import NavOverlay from './NavOverlay';

const Header = () => {
  const location = useLocation();
  const [isSticky, setIsSticky] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navDropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle scroll events with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Make header sticky when scrolling past the banner (40px height)
          setIsSticky(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdown when navigating to a different page
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

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

  const handleNavMouseEnter = (name: string) => {
    setActiveDropdown(name);
  };

  const handleHeaderMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <>
      <header 
        ref={headerRef}
        className={`bg-black dark:bg-black text-white w-full z-50 ${
          isSticky ? 'fixed top-0 shadow-md' : 'absolute top-10'
        }`}
        onMouseLeave={handleHeaderMouseLeave}
        style={{ borderBottom: activeDropdown ? 'none' : undefined }}
      >
        <div className="max-w-laptop mx-auto px-section-x">
          <nav className="flex items-center justify-between h-12 relative">
            <Link to="/" className="flex items-center">
              <Apple className="h-4 w-4" />
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative h-12 flex items-center nav-item"
                  onMouseEnter={() => handleNavMouseEnter(item.name)}
                >
                  <Link
                    to={item.href}
                    className={`text-xs font-normal tracking-tight hover:text-gray-300 dark:hover:text-gray-200 transition-colors duration-200 ${
                      location.pathname === item.href ? 'text-white dark:text-gray-100' : 'text-gray-300 dark:text-gray-400'
                    }`}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Search className="h-4 w-4 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 cursor-pointer transition-colors duration-200" />
              <ShoppingBag className="h-4 w-4 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 cursor-pointer transition-colors duration-200" />
            </div>
          </nav>
        </div>
        
        {/* Dropdown menus */}
        <div className="nav-dropdown" ref={navDropdownRef}>
          {navItems.map((item) => (
            <NavDropdown
              key={item.name}
              name={item.name}
              isVisible={activeDropdown === item.name}
            />
          ))}
        </div>
      </header>
      
      {/* Background overlay */}
      <NavOverlay 
        isVisible={activeDropdown !== null} 
        onClick={() => setActiveDropdown(null)}
      />
    </>
  );
};

export default Header;