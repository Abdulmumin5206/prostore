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
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
};

export default FilterTag; 