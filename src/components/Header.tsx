import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Apple, ShoppingBag, User } from 'lucide-react';
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
	const isProductPage = location.pathname.startsWith('/store/') || location.pathname.startsWith('/products');
	const stickyEnabled = !isProductPage;
	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const headerRef = useRef<HTMLElement>(null);
	const navDropdownRef = useRef<HTMLDivElement>(null);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [stickyOffset, setStickyOffset] = useState<number>(40);
	
	// Measure banner + utility bar heights to determine sticky threshold
	useEffect(() => {
		const recalcOffset = () => {
			const banner = document.getElementById('top-promotional-banner');
			const util = document.getElementById('top-utility-bar');
			const offset = (banner?.offsetHeight ?? 0) + (util?.offsetHeight ?? 0);
			setStickyOffset(offset || 40);
		};

		recalcOffset();
		window.addEventListener('resize', recalcOffset);
		return () => window.removeEventListener('resize', recalcOffset);
	}, []);
	
	// Handle scroll events with throttling
	useEffect(() => {
		let ticking = false;
		
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					// Make header sticky when scrolling past top banner + utility bar unless disabled
					setIsSticky(stickyEnabled && window.scrollY > stickyOffset);
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
	}, [stickyEnabled, stickyOffset]);

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
				className={`bg-white dark:bg-black text-black dark:text-white w-full z-50 ${
					stickyEnabled && isSticky ? 'fixed top-0 shadow-md' : 'relative'
				}`}
				onMouseLeave={handleHeaderMouseLeave}
				style={{ borderBottom: isDropdownVisible ? 'none' : undefined }}
			>
				<div className="max-w-laptop mx-auto px-section-x">
					<nav className="relative h-12">
						{/* Centered nav */}
						<div className="absolute inset-0 flex items-center justify-center">
							{navItems.map((item) => (
								<div
									key={item.name}
									className={`relative h-12 flex items-center nav-item mx-4 ${
										activeDropdown === item.name ? 'font-medium' : ''
									}`}
									onMouseEnter={() => handleNavMouseEnter(item.name)}
								>
									<Link
										to={item.href}
										className={`transition-colors duration-200 ${
											location.pathname === item.href ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
										}`}
										onClick={closeDropdownNow}
									>
										<Text 
											size="xs" 
											weight={activeDropdown === item.name ? "medium" : "normal"} 
											color="inherit"
											className="hover:text-gray-800 dark:hover:text-gray-200"
										>
											{item.name}
										</Text>
									</Link>
								</div>
							))}
						</div>

						{/* Left logo */}
						<div className="absolute left-0 inset-y-0 flex items-center">
							<Link to="/" className="flex items-center">
								<Apple className="h-4 w-4" />
							</Link>
						</div>

						{/* Right actions */}
						<div className="absolute right-0 inset-y-0 flex items-center space-x-4">
							<ThemeToggle />
							<Link
								to="/cart"
								className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
								onClick={closeDropdownNow}
								aria-label="Cart"
							>
								<ShoppingBag className="h-4 w-4" />
							</Link>
							{user || isAdminOverride ? (
								<div className="flex items-center space-x-3">
									<Link
										to="/admin"
										className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
										onClick={closeDropdownNow}
									>
										<User className="h-4 w-4" />
									</Link>
									<button
										onClick={signOut}
										className="text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
									>
										Sign Out
									</button>
								</div>
							) : (
								<div className="flex items-center space-x-3">
									<Link
										to="/signin"
										className="text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
										onClick={closeDropdownNow}
									>
										Sign In
									</Link>
									<Link
										to="/signup"
										className="text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200"
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