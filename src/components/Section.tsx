import React, { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  background?: 'white' | 'light' | 'dark' | 'black';
  containerWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Section component for consistent spacing and layout across the application
 */
const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  size = 'md',
  background = 'light',
  containerWidth = 'xl',
}) => {
  // Size classes (vertical padding)
  const sizeClasses = {
    sm: 'py-section-y-sm',
    md: 'py-section-y',
    lg: 'py-section-y-lg',
  };

  // Background classes
  const backgroundClasses = {
    white: 'bg-white dark:bg-gray-900',
    light: 'bg-[#f5f5f7] dark:bg-black',
    dark: 'bg-gray-900 dark:bg-gray-800 text-white',
    black: 'bg-black dark:bg-black text-white',
  };

  // Container width classes
  const containerClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    xl: 'max-w-7xl',
    lg: 'max-w-6xl',
    full: 'w-full',
  };

  return (
    <section className={`${sizeClasses[size]} px-section-x ${backgroundClasses[background]} transition-colors duration-300 ${className}`}>
      <div className={`${containerClasses[containerWidth]} mx-auto`}>
        {children}
      </div>
    </section>
  );
};

export default Section; 