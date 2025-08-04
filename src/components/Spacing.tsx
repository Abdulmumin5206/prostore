import React from 'react';

interface SpacingProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Spacing component for consistent vertical spacing between elements
 */
const Spacing: React.FC<SpacingProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-element-y-sm',
    md: 'h-element-y',
    lg: 'h-element-y-lg',
  };

  return <div className={sizeClasses[size]} />;
};

export default Spacing; 