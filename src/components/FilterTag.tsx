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
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
      }`}
    >
      {label}
    </button>
  );
};

export default FilterTag; 