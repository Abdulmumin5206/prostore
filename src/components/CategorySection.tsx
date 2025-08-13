import React from 'react';
import { Link } from 'react-router-dom';
import { Text, AppleHeadline, AppleSubheadline } from './Typography';
import Section from './Section';
import ContentBlock from './ContentBlock';
import Spacing from './Spacing';

interface Category {
	id: string;
	name: string;
	image: string;
	link: string;
}

const CategorySection: React.FC = () => {
	// Limiting to 8 categories (2 rows of 4)
	const categories: Category[] = [
		{
			id: 'mac',
			name: 'Mac',
			image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-mac-nav-202203?wid=200&hei=130&fmt=png-alpha&.v=1645051958490',
			link: '/products?category=Mac'
		},
		{
			id: 'iphone',
			name: 'iPhone',
			image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-iphone-nav-202309?wid=200&hei=130&fmt=png-alpha&.v=1692971740452',
			link: '/products?category=iPhone'
		},
		{
			id: 'ipad',
			name: 'iPad',
			image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-ipad-nav-202210?wid=200&hei=130&fmt=png-alpha&.v=1664912135437',
			link: '/products?category=iPad'
		},
		{
			id: 'apple-watch',
			name: 'Apple Watch',
			image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-watch-nav-202309?wid=200&hei=130&fmt=png-alpha&.v=1693703822208',
			link: '/products?category=Watch'
		},
		{
			id: 'vision-pro',
			name: 'Apple Vision Pro',
			image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-vision-nav-202401?wid=200&hei=130&fmt=png-alpha&.v=1702402144761',
			link: '/products?category=Vision'
		},
		{
			id: 'airpods',
			name: 'AirPods',
			image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-airpods-nav-202209?wid=200&hei=130&fmt=png-alpha&.v=1660676485885',
			link: '/products?category=AirPods'
		},
		{
			id: 'airtag',
			name: 'AirTag',
			image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-airtags-nav-202108?wid=200&hei=130&fmt=png-alpha&.v=1625783380000',
			link: '/airtag'
		},
		{
			id: 'apple-tv',
			name: 'Apple TV 4K',
			image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/store-card-13-appletv-nav-202210?wid=200&hei=130&fmt=png-alpha&.v=1664628458484',
			link: '/products?category=TV%20%26%20Home'
		}
	];

	return (
		<Section background="light" size="sm">
			<ContentBlock spacing="md">
				<AppleHeadline>Store.</AppleHeadline>
				<Spacing size="sm" />
				<AppleSubheadline>
					The best way to buy the products you love.
				</AppleSubheadline>
			</ContentBlock>
			
			<ContentBlock spacing="none">
				<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
					{categories.slice(0, 8).map((category) => (
						<Link 
							key={category.id} 
							to={category.link}
							className="flex flex-col items-center group"
						>
							<div className="w-full aspect-square mb-3 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-sm">
								<img 
									src={category.image} 
									alt={category.name} 
									className="w-4/5 h-4/5 object-contain"
									loading="lazy"
								/>
							</div>
							<Text size="sm" weight="medium" color="primary" align="center">
								{category.name}
							</Text>
						</Link>
					))}
				</div>
			</ContentBlock>
		</Section>
	);
};

export default CategorySection; 