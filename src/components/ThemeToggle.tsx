import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors duration-300 focus:outline-none"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white dark:bg-gray-200 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-5' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <MoonIcon className="w-2.5 h-2.5 text-gray-700" />
        ) : (
          <SunIcon className="w-2.5 h-2.5 text-yellow-500" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;