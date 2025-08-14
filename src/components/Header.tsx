import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Apple, Search, ShoppingBag, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NavDropdown from './NavDropdown';
import { dropdownContents } from './NavDropdown';
import NavOverlay from './NavOverlay';
import { Text } from './Typography';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, signOut, isAdminOverride } = useAuth();
  const [isSticky, setIsSticky] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
    setIsDropdownVisible(false);
  }, [location.pathname]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const navItems = [
    { name: 'Store', href: '/products' },
    { name: 'Mac', href: '/products?category=Mac' },
    { name: 'iPad', href: '/products?category=iPad' },
    { name: 'iPhone', href: '/products?category=iPhone' },
    { name: 'Watch', href: '/products?category=Watch' },
    { name: 'AirPods', href: '/products?category=AirPods' },
    { name: 'Accessories', href: '/products?category=Accessories' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const handleNavMouseEnter = (name: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (dropdownContents[name]) {
      setActiveDropdown(name);
      setIsDropdownVisible(true);
    } else {
      setActiveDropdown(null);
      setIsDropdownVisible(false);
    }
  };

  const handleHeaderMouseLeave = () => {
    // Add a small delay before closing to make it feel more natural
    hoverTimeoutRef.current = setTimeout(() => {
      setIsDropdownVisible(false);
      // Keep the active dropdown name until the animation completes
      setTimeout(() => {
        if (!isDropdownVisible) {
          setActiveDropdown(null);
        }
      }, 500);
    }, 150);
  };

  const closeDropdownNow = () => {
    setIsDropdownVisible(false);
    setActiveDropdown(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  return (
    <>
      <header 
        ref={headerRef}
        className={`bg-black dark:bg-black text-white w-full z-50 ${
          isSticky ? 'fixed top-0 shadow-md' : 'absolute top-10'
        }`}
        onMouseLeave={handleHeaderMouseLeave}
        style={{ borderBottom: isDropdownVisible ? 'none' : undefined }}
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
                  className={`relative h-12 flex items-center nav-item ${
                    activeDropdown === item.name ? 'font-medium' : ''
                  }`}
                  onMouseEnter={() => handleNavMouseEnter(item.name)}
                >
                  <Link
                    to={item.href}
                    className={`transition-colors duration-200 ${
                      location.pathname === item.href ? 'text-white dark:text-gray-100' : 'text-gray-300 dark:text-gray-400'
                    }`}
                    onClick={closeDropdownNow}
                  >
                    <Text 
                      size="xs" 
                      weight={activeDropdown === item.name ? "medium" : "normal"} 
                      color="inherit"
                      className="hover:text-gray-300 dark:hover:text-gray-200"
                    >
                      {item.name}
                    </Text>
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Search className="h-4 w-4 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 cursor-pointer transition-colors duration-200" />
              <Link
                to="/cart"
                className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                onClick={closeDropdownNow}
                aria-label="Cart"
              >
                <ShoppingBag className="h-4 w-4" />
              </Link>
              
              {/* Auth Section */}
              {user || isAdminOverride ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/admin"
                    className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                    onClick={closeDropdownNow}
                  >
                    <User className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-xs text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/signin"
                    className="text-xs text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors duration-200"
                    onClick={closeDropdownNow}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="text-xs bg-white text-black px-3 py-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    onClick={closeDropdownNow}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
        
        {/* Single dropdown container with dynamic content */}
        <div className="nav-dropdown" ref={navDropdownRef}>
          {activeDropdown && (
            <NavDropdown
              key="dropdown"
              name={activeDropdown}
              isVisible={isDropdownVisible}
              onNavigate={closeDropdownNow}
            />
          )}
        </div>
      </header>
      
      {/* Background overlay */}
      <NavOverlay 
        isVisible={isDropdownVisible} 
        onClick={closeDropdownNow}
      />
    </>
  );
};

export default Header;