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
					{ name: 'Shop the Latest', href: '/products' },
					{ name: 'Mac', href: '/products?category=Mac' },
					{ name: 'iPad', href: '/products?category=iPad' },
					{ name: 'iPhone', href: '/products?category=iPhone' },
					{ name: 'Apple Watch', href: '/products?category=Watch' },
					{ name: 'Apple Vision Pro', href: '/products?category=Vision' },
					{ name: 'Accessories', href: '/products?category=Accessories' },
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
					{ name: 'Explore All Mac', href: '/products?category=Mac' },
					{ name: 'MacBook Air', href: '/products?category=Mac&subcategory=MacBook%20Air' },
					{ name: 'MacBook Pro', href: '/products?category=Mac&subcategory=MacBook%20Pro' },
					{ name: 'iMac', href: '/products?category=Mac&subcategory=iMac' },
					{ name: 'Mac mini', href: '/products?category=Mac&subcategory=Mac%20mini' },
					{ name: 'Mac Studio', href: '/products?category=Mac&subcategory=Mac%20Studio' },
					{ name: 'Mac Pro', href: '/products?category=Mac&subcategory=Mac%20Pro' },
					{ name: 'Displays', href: '/products?category=Mac&subcategory=Displays' },
				]
			},
			{
				title: 'Shop Mac',
				items: [
					{ name: 'Shop Mac', href: '/products?category=Mac' },
					{ name: 'Mac Accessories', href: '/products?category=Accessories&subcategory=Mac' },
					{ name: 'Apple Trade In', href: '/store/trade-in' },
					{ name: 'Financing', href: '/store/financing' },
				]
			}
		]
	},
	'iPad': {
		sections: [
			{
				title: 'Explore iPad',
				items: [
					{ name: 'Explore All iPad', href: '/products?category=iPad' },
					{ name: 'iPad Pro', href: '/products?category=iPad&subcategory=iPad%20Pro' },
					{ name: 'iPad Air', href: '/products?category=iPad&subcategory=iPad%20Air' },
					{ name: 'iPad', href: '/products?category=iPad&subcategory=iPad' },
					{ name: 'iPad mini', href: '/products?category=iPad&subcategory=iPad%20mini' },
					{ name: 'Apple Pencil', href: '/products?category=iPad&subcategory=Apple%20Pencil' },
					{ name: 'Keyboards', href: '/products?category=iPad&subcategory=Keyboards' },
				]
			},
			{
				title: 'Shop iPad',
				items: [
					{ name: 'Shop iPad', href: '/products?category=iPad' },
					{ name: 'iPad Accessories', href: '/products?category=Accessories&subcategory=iPad' },
					{ name: 'Apple Trade In', href: '/store/trade-in' },
					{ name: 'Financing', href: '/store/financing' },
				]
			}
		]
	},
	'iPhone': {
		sections: [
			{
				title: 'Explore iPhone',
				items: [
					{ name: 'Explore All iPhone', href: '/products?category=iPhone' },
					{ name: 'iPhone 15 Pro', href: '/products?category=iPhone&subcategory=iPhone%2015%20Pro' },
					{ name: 'iPhone 15', href: '/products?category=iPhone&subcategory=iPhone%2015' },
					{ name: 'iPhone 14', href: '/products?category=iPhone&subcategory=iPhone%2014' },
					{ name: 'iPhone 13', href: '/products?category=iPhone&subcategory=iPhone%2013' },
					{ name: 'iPhone SE', href: '/products?category=iPhone&subcategory=iPhone%20SE' },
				]
			},
			{
				title: 'Shop iPhone',
				items: [
					{ name: 'Shop iPhone', href: '/products?category=iPhone' },
					{ name: 'iPhone Accessories', href: '/products?category=Accessories&subcategory=iPhone' },
					{ name: 'Apple Trade In', href: '/store/trade-in' },
					{ name: 'Carrier Deals', href: '/store/iphone/carrier-deals' },
					{ name: 'Financing', href: '/store/financing' },
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
					{ name: 'Explore All Apple Watch', href: '/products?category=Watch' },
					{ name: 'Apple Watch Series 9', href: '/products?category=Watch&subcategory=Series%209' },
					{ name: 'Apple Watch Ultra 2', href: '/products?category=Watch&subcategory=Ultra%202' },
					{ name: 'Apple Watch SE', href: '/products?category=Watch&subcategory=SE' },
					{ name: 'Apple Watch Nike', href: '/products?category=Watch&subcategory=Nike' },
				]
			},
			{
				title: 'Shop Watch',
				items: [
					{ name: 'Shop Apple Watch', href: '/products?category=Watch' },
					{ name: 'Apple Watch Studio', href: '/products?category=Watch&subcategory=Studio' },
					{ name: 'Apple Watch Bands', href: '/products?category=Accessories&subcategory=Watch' },
					{ name: 'Apple Watch Accessories', href: '/products?category=Accessories&subcategory=Watch' },
					{ name: 'Apple Trade In', href: '/store/trade-in' },
					{ name: 'Financing', href: '/store/financing' },
				]
			}
		]
	},
	'Vision': {
		sections: [
			{
				title: 'Explore Vision',
				items: [
					{ name: 'Apple Vision Pro', href: '/products?category=Vision' },
					{ name: 'Apps & Games', href: '/vision-pro/apps' },
					{ name: 'visionOS', href: '/visionos' },
				]
			},
			{
				title: 'Shop Vision',
				items: [
					{ name: 'Shop Apple Vision Pro', href: '/products?category=Vision' },
					{ name: 'Apple Vision Pro Accessories', href: '/products?category=Accessories&subcategory=Vision%20Pro' },
					{ name: 'Financing', href: '/store/financing' },
				]
			}
		]
	},
	'AirPods': {
		sections: [
			{
				title: 'Explore Audio',
				items: [
					{ name: 'Explore All AirPods', href: '/products?category=AirPods' },
					{ name: 'AirPods Pro', href: '/products?category=AirPods&subcategory=AirPods%20Pro' },
					{ name: 'AirPods', href: '/products?category=AirPods&subcategory=AirPods' },
					{ name: 'AirPods Max', href: '/products?category=AirPods&subcategory=AirPods%20Max' },
					{ name: 'Apple Music', href: '/apple-music' },
				]
			},
			{
				title: 'Shop Audio',
				items: [
					{ name: 'Shop AirPods', href: '/products?category=AirPods' },
					{ name: 'AirPods Accessories', href: '/products?category=Accessories&subcategory=AirPods' },
				]
			}
		]
	},
	'TV & Home': {
		sections: [
			{
				title: 'Explore TV & Home',
				items: [
					{ name: 'Explore TV & Home', href: '/products?category=TV%20%26%20Home' },
					{ name: 'Apple TV 4K', href: '/products?category=TV%20%26%20Home&subcategory=Apple%20TV%204K' },
					{ name: 'HomePod', href: '/products?category=TV%20%26%20Home&subcategory=HomePod' },
					{ name: 'HomePod mini', href: '/products?category=TV%20%26%20Home&subcategory=HomePod%20mini' },
				]
			},
			{
				title: 'Shop TV & Home',
				items: [
					{ name: 'Shop Apple TV 4K', href: '/products?category=TV%20%26%20Home&subcategory=Apple%20TV%204K' },
					{ name: 'Shop HomePod', href: '/products?category=TV%20%26%20Home&subcategory=HomePod' },
					{ name: 'Shop HomePod mini', href: '/products?category=TV%20%26%20Home&subcategory=HomePod%20mini' },
					{ name: 'TV & Home Accessories', href: '/products?category=Accessories&subcategory=TV%20%26%20Home' },
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
					{ name: 'Shop All Accessories', href: '/products?category=Accessories' },
					{ name: 'Mac', href: '/products?category=Accessories&subcategory=Mac' },
					{ name: 'iPad', href: '/products?category=Accessories&subcategory=iPad' },
					{ name: 'iPhone', href: '/products?category=Accessories&subcategory=iPhone' },
					{ name: 'Apple Watch', href: '/products?category=Accessories&subcategory=Watch' },
					{ name: 'AirPods', href: '/products?category=Accessories&subcategory=AirPods' },
					{ name: 'Apple Vision Pro', href: '/products?category=Accessories&subcategory=Vision%20Pro' },
					{ name: 'TV & Home', href: '/products?category=Accessories&subcategory=TV%20%26%20Home' },
				]
			},
			{
				title: 'Explore Accessories',
				items: [
					{ name: 'Made by Apple', href: '/products?category=Accessories&subcategory=Made%20by%20Apple' },
					{ name: 'Beats by Dr. Dre', href: '/products?category=Accessories&subcategory=Beats' },
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
	onNavigate?: () => void;
}

type StoreCard = {
	title: string;
	href: string;
	imagePath: string;
};

const storeCards: StoreCard[] = [
	{
		title: 'MacBook Air',
		href: '/products?category=Mac&subcategory=MacBook%20Air',
		imagePath: '/header/store/macbook%20air.jpg',
	},
	{
		title: 'MacBook Pro',
		href: '/products?category=Mac&subcategory=MacBook%20Pro',
		imagePath: '/header/store/macbook%20pro.jpg',
	},
	{
		title: 'iPhone 16',
		href: '/products?category=iPhone&subcategory=iPhone%2016',
		imagePath: '/header/store/iphone_16e.jpg',
	},
	{
		title: 'iPhone 16 Pro / Pro Max',
		href: '/products?category=iPhone&subcategory=iPhone%2016%20Pro',
		imagePath: '/header/store/iphone_16pro_promax.jpg',
	},
	{
		title: 'iPhone 16 Plus',
		href: '/products?category=iPhone&subcategory=iPhone%2016%20Plus',
		imagePath: '/header/store/iphone_16_plus.jpg',
	},
	{
		title: 'AirPods',
		href: '/products?category=AirPods',
		imagePath: '/header/store/airpods4.jpg',
	},
	{
		title: 'Apple Watch Ultra 2',
		href: '/products?category=Watch&subcategory=Ultra%202',
		imagePath: '/header/store/applewatchultra2.jpg',
	},
	{
		title: 'iPad',
		href: '/products?category=iPad',
		imagePath: '/header/store/Ipad.jpg',
	},
];

export type NavCard = {
	title: string;
	href: string;
	imagePath: string;
};

const macCards: NavCard[] = [
	{ title: 'MacBook Air 13"', href: '/products?category=Mac&subcategory=MacBook%20Air', imagePath: '/header/mac/macbook%20air%2013.jpg' },
	{ title: 'MacBook Air 15"', href: '/products?category=Mac&subcategory=MacBook%20Air', imagePath: '/header/mac/macbook%20air%2015.jpg' },
	{ title: 'MacBook Pro 14"', href: '/products?category=Mac&subcategory=MacBook%20Pro', imagePath: '/header/mac/macbook%20pro%2014.jpg' },
	{ title: 'MacBook Pro 16"', href: '/products?category=Mac&subcategory=MacBook%20Pro', imagePath: '/header/mac/macbook%20pro%2016.jpg' },
];

const iPhoneCards: NavCard[] = [
	{ title: 'iPhone 16', href: '/products?category=iPhone&subcategory=iPhone%2016', imagePath: '/header/iPhone/iphone_16e.jpg' },
	{ title: 'iPhone 16 Pro / Pro Max', href: '/products?category=iPhone&subcategory=iPhone%2016%20Pro', imagePath: '/header/iPhone/iphone_16pro_promax.jpg' },
	{ title: 'iPhone 16 Plus', href: '/products?category=iPhone&subcategory=iPhone%2016%20Plus', imagePath: '/header/iPhone/iphone_16_plus.jpg' },
	{ title: 'iPhone 15 Plus', href: '/products?category=iPhone&subcategory=iPhone%2015%20Plus', imagePath: '/header/iPhone/iphone_15_plus.jpg' },
];

const iPadCards: NavCard[] = [
	{ title: 'iPad Pro', href: '/products?category=iPad&subcategory=iPad%20Pro', imagePath: '/header/Ipad/ipad-card-40-pro-202405.jpg' },
	{ title: 'iPad Air', href: '/products?category=iPad&subcategory=iPad%20Air', imagePath: '/header/Ipad/ipad-card-40-air-202405.jpg' },
	{ title: 'iPad', href: '/products?category=iPad&subcategory=iPad', imagePath: '/header/Ipad/ipad-card-40-ipad-202410.jpg' },
	{ title: 'iPad mini', href: '/products?category=iPad&subcategory=iPad%20mini', imagePath: '/header/Ipad/ipad-card-40-ipad-mini-202410.jpg' },
];

const watchCards: NavCard[] = [
	{ title: 'Apple Watch Series 10', href: '/products?category=Watch&subcategory=Series%2010', imagePath: '/header/Iwatch/watch-card-40-s10-202409.jpg' },
	{ title: 'Apple Watch Ultra 2', href: '/products?category=Watch&subcategory=Ultra%202', imagePath: '/header/Iwatch/watch-card-40-ultra2-202409.jpg' },
	{ title: 'Apple Watch SE', href: '/products?category=Watch&subcategory=SE', imagePath: '/header/Iwatch/watch-card-40-se-202503.jpg' },
];

const airPodsCards: NavCard[] = [
	{ title: 'AirPods Pro (2nd gen)', href: '/products?category=AirPods&subcategory=AirPods%20Pro', imagePath: '/header/AirPods/airpods-pro-2-hero-select-202409.png' },
	{ title: 'AirPods (4th gen, ANC)', href: '/products?category=AirPods&subcategory=AirPods%204', imagePath: '/header/AirPods/airpods-4-anc-select-202409.png' },
	{ title: 'AirPods Max', href: '/products?category=AirPods&subcategory=AirPods%20Max', imagePath: '/header/AirPods/airpods-max-hero-select-202409.jpg' },
];

const accessoriesCards: NavCard[] = [
	{ title: 'All Accessories', href: '/products?category=Accessories', imagePath: '/header/accesoires/ipad-card-50-all-accessories-202405.jpg' },
	{ title: 'iPhone Accessories', href: '/products?category=Accessories&subcategory=iPhone', imagePath: '/header/accesoires/iphone-card-40-accessories-202503.jpg' },
	{ title: 'Watch Accessories', href: '/products?category=Accessories&subcategory=Watch', imagePath: '/header/accesoires/watch-card-40-acc-202503.jpg' },
];

export const cardGrids: Record<string, NavCard[]> = {
	Store: storeCards,
	Mac: macCards,
	iPad: iPadCards,
	iPhone: iPhoneCards,
	Watch: watchCards,
	AirPods: airPodsCards,
	Accessories: accessoriesCards,
};

const NavDropdown: React.FC<NavDropdownProps> = ({ name, isVisible, onNavigate }) => {
	const content = dropdownContents[name];
	const dropdownRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [contentHeight, setContentHeight] = useState(0);
	const [displayedName, setDisplayedName] = useState(name);
	
	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(() => { setDisplayedName(name); }, 50);
			return () => clearTimeout(timer);
		} else {
			setDisplayedName(name);
		}
	}, [name, isVisible]);
	
	useEffect(() => { if (contentRef.current) setContentHeight(contentRef.current.scrollHeight); }, [displayedName, isVisible]);
	
	if (!content) return null;
	const displayContent = dropdownContents[displayedName];
	if (!displayContent) return null;
	
	return (
		<div 
			ref={dropdownRef}
			className="absolute left-0 w-full bg-white dark:bg-gray-900 backdrop-blur-md overflow-hidden transition-all duration-300 ease-out"
			style={{ top: '48px', height: isVisible ? `${contentHeight}px` : '0px', opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? 'auto' : 'none' }}
		>
			<div ref={contentRef} className="max-w-laptop mx-auto px-section-x pt-3 pb-5 transition-opacity duration-200">
				{cardGrids[displayedName] ? (
					<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
						{cardGrids[displayedName].map((card) => (
							<Link key={card.title} to={card.href} onClick={onNavigate} className="group focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 rounded-md">
								<div className="overflow-hidden rounded-md bg-[#fafafa] dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm transition-colors duration-200">
									<div className="aspect-[4/3] w-full overflow-hidden bg-white dark:bg-black">
										<img src={card.imagePath} alt={card.title} className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
									</div>
									<div className="px-2 py-1 text-center border-t border-gray-200 dark:border-gray-800">
										<div className="text-[10px] font-medium text-gray-900 dark:text-gray-100 truncate">{card.title}</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{displayContent.sections.map((section, index) => (
							<div key={index}>
								<h3 className="text-gray-500 dark:text-gray-400 text-[11px] font-medium mb-1.5">{section.title}</h3>
								<ul className="space-y-1.5">
									{section.items.map((item, itemIndex) => (
										<li key={itemIndex}>
											<Link to={item.href} onClick={onNavigate} className="text-[11px] font-normal text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
												{item.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default NavDropdown; 