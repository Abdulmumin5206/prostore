import React from 'react';
import { H1, Text } from '../components/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const currencyFormat = (value: number, currency: string) => {
	try {
		return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
	} catch {
		return `$${value.toFixed(2)}`;
	}
};

const CartPage: React.FC = () => {
	const { items, updateQuantity, removeItem, clear, subtotal } = useCart();

	const currency = items[0]?.currency || 'USD';

	return (
		<div className="bg-[#f5f5f7] dark:bg-black transition-colors duration-300">
			<div className="max-w-laptop mx-auto px-section-x py-16">
				<H1 align="center" className="mb-6">Your Bag</H1>
				{items.length === 0 ? (
					<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 text-center">
						<Text color="secondary" className="mb-6">Your bag is empty.</Text>
						<RouterLink
							to="/products"
							className="inline-block bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-full hover:opacity-90 transition-colors duration-200"
						>
							Continue shopping
						</RouterLink>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 space-y-4">
							{items.map(item => (
								<div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 flex gap-4 items-center">
									<img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
									<div className="flex-1 min-w-0">
										<Text size="base" className="text-black dark:text-white font-medium truncate">{item.name}</Text>
										<Text size="sm" color="secondary">{currencyFormat(item.unitPrice, item.currency)} each</Text>
									</div>
									<div className="flex items-center gap-2">
										<button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white">-</button>
										<Text size="base" className="w-8 text-center text-black dark:text-white">{item.quantity}</Text>
										<button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white">+</button>
									</div>
									<div className="w-24 text-right">
										<Text className="text-black dark:text-white font-medium">{currencyFormat(item.unitPrice * item.quantity, item.currency)}</Text>
										<button onClick={() => removeItem(item.id)} className="text-xs text-red-600 dark:text-red-400 mt-1">Remove</button>
									</div>
								</div>
							))}
						</div>
						<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 h-fit">
							<Text className="text-black dark:text-white font-medium mb-4">Order Summary</Text>
							<div className="flex justify-between mb-2">
								<Text color="secondary">Subtotal</Text>
								<Text className="text-black dark:text-white">{currencyFormat(subtotal, currency)}</Text>
							</div>
							<div className="flex justify-between mb-6">
								<Text color="secondary">Shipping</Text>
								<Text className="text-black dark:text-white">Calculated at checkout</Text>
							</div>
							<button className="w-full py-3 bg-black text-white dark:bg-white dark:text-black rounded-full hover:opacity-90 transition-colors duration-200">Checkout</button>
							<button onClick={clear} className="w-full mt-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:opacity-80">Clear cart</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CartPage; 