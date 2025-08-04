import React from 'react';
import { Link } from 'react-router-dom';
import { Apple, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: 'Shop and Learn',
      links: [
        { name: 'Store', href: '/store' },
        { name: 'Mac', href: '/mac' },
        { name: 'iPad', href: '/ipad' },
        { name: 'iPhone', href: '/iphone' },
        { name: 'Watch', href: '/watch' },
        { name: 'Vision', href: '/vision' },
        { name: 'AirPods', href: '/airpods' },
        { name: 'TV & Home', href: '/tv-home' },
        { name: 'AirTag', href: '/airtag' },
        { name: 'Accessories', href: '/accessories' },
        { name: 'Gift Cards', href: '/gift-card' },
      ]
    },
    {
      title: 'Apple Wallet',
      links: [
        { name: 'Wallet', href: '#' },
        { name: 'Apple Card', href: '#' },
        { name: 'Apple Pay', href: '#' },
        { name: 'Apple Cash', href: '#' },
      ]
    },
    {
      title: 'Account',
      links: [
        { name: 'Manage Your Apple ID', href: '#' },
        { name: 'Apple Store Account', href: '#' },
        { name: 'iCloud.com', href: '#' },
      ]
    },
    {
      title: 'Entertainment',
      links: [
        { name: 'Apple One', href: '#' },
        { name: 'Apple TV+', href: '/entertainment' },
        { name: 'Apple Music', href: '#' },
        { name: 'Apple Arcade', href: '#' },
        { name: 'Apple Fitness+', href: '#' },
        { name: 'Apple News+', href: '#' },
        { name: 'Apple Podcasts', href: '#' },
        { name: 'App Store', href: '#' },
      ]
    },
    {
      title: 'Apple Store',
      links: [
        { name: 'Find a Store', href: '#' },
        { name: 'Genius Bar', href: '#' },
        { name: 'Today at Apple', href: '#' },
        { name: 'Apple Summer Camp', href: '#' },
        { name: 'Apple Store App', href: '#' },
        { name: 'Certified Refurbished', href: '#' },
        { name: 'Apple Trade In', href: '#' },
        { name: 'Financing', href: '#' },
        { name: 'Carrier Deals at Apple', href: '#' },
        { name: 'Order Status', href: '#' },
        { name: 'Shopping Help', href: '#' },
      ]
    },
    {
      title: 'For Business',
      links: [
        { name: 'Apple and Business', href: '#' },
        { name: 'Shop for Business', href: '#' },
      ]
    },
    {
      title: 'For Education',
      links: [
        { name: 'Apple and Education', href: '#' },
        { name: 'Shop for K-12', href: '#' },
        { name: 'Shop for College', href: '#' },
      ]
    },
    {
      title: 'For Healthcare',
      links: [
        { name: 'Apple in Healthcare', href: '#' },
        { name: 'Health on Apple Watch', href: '#' },
        { name: 'Health Records on iPhone', href: '#' },
      ]
    },
    {
      title: 'Apple Values',
      links: [
        { name: 'Accessibility', href: '#' },
        { name: 'Education', href: '#' },
        { name: 'Environment', href: '#' },
        { name: 'Inclusion and Diversity', href: '#' },
        { name: 'Privacy', href: '#' },
        { name: 'Racial Equity and Justice', href: '#' },
        { name: 'Supplier Responsibility', href: '#' },
      ]
    },
    {
      title: 'About Apple',
      links: [
        { name: 'Newsroom', href: '#' },
        { name: 'Apple Leadership', href: '#' },
        { name: 'Career Opportunities', href: '#' },
        { name: 'Investors', href: '#' },
        { name: 'Ethics & Compliance', href: '#' },
        { name: 'Events', href: '#' },
        { name: 'Contact Apple', href: '#' },
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#f5f5f7] dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Footer Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold mb-4 text-black dark:text-white">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-700 pt-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Apple Logo and Copyright */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center">
                <Apple className="h-6 w-6 text-black dark:text-white" />
              </Link>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Copyright © 2024 Apple Inc. All rights reserved.
              </span>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors duration-200">
            Privacy Policy
          </a>
          <span>|</span>
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors duration-200">
            Terms of Use
          </a>
          <span>|</span>
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors duration-200">
            Sales and Refunds
          </a>
          <span>|</span>
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors duration-200">
            Legal
          </a>
          <span>|</span>
          <a href="#" className="hover:text-black dark:hover:text-white transition-colors duration-200">
            Site Map
          </a>
        </div>

        {/* Country/Region */}
        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
          <span>United States</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 