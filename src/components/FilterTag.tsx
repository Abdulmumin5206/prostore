import React from 'react';

interface FilterTagProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-gray-600 text-white hover:bg-gray-500 dark:bg-gray-300 dark:text-gray-900 dark:hover:bg-gray-400'
          : 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
      }`}
    >
      {label}
    </button>
  );
};

export default FilterTag; 