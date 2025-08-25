import React, { useEffect, useState } from 'react';
import { Phone, Globe } from 'lucide-react';

const TopUtilityBar: React.FC = () => {
	const [language, setLanguage] = useState<string>(() => {
		return (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'UZ';
	});

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('lang', language);
		}
	}, [language]);

	return (
		<div id="top-utility-bar" className="bg-white dark:bg-black text-gray-700 dark:text-gray-300 w-full">
			<div className="max-w-laptop mx-auto px-section-x">
				<div className="h-8 flex items-center justify-between text-[11px] leading-none">
					{/* Language selector */}
					<div className="flex items-center space-x-2">
						<Globe className="h-3.5 w-3.5 text-gray-500" />
						<select
							aria-label="Language selector"
							value={language}
							onChange={(e) => setLanguage(e.target.value)}
							className="bg-transparent text-gray-700 focus:outline-none cursor-pointer"
						>
							<option value="UZ">Uzbek</option>
							<option value="RU">Russian</option>
							<option value="EN">English</option>
						</select>
					</div>

					{/* Quick call numbers */}
					<div className="flex items-center space-x-4">
						<a href="tel:+998711234567" className="flex items-center space-x-1 hover:text-gray-900 transition-colors">
							<Phone className="h-3.5 w-3.5 text-gray-500" />
							<span>+998 71 123 45 67</span>
						</a>
						<a href="tel:+998901234567" className="hidden sm:flex items-center space-x-1 hover:text-gray-900 transition-colors">
							<Phone className="h-3.5 w-3.5 text-gray-500" />
							<span>+998 90 123 45 67</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TopUtilityBar; 