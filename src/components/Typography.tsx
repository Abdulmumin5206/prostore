import React, { ReactNode } from 'react';

interface TypographyProps {
  children: ReactNode;
  className?: string;
}

// Heading components
export const H1: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h1 className={`text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`}>
    {children}
  </h1>
);

export const H2: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h2 className={`text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`}>
    {children}
  </h2>
);

export const H3: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h3 className={`text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

export const H4: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h4 className={`text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`}>
    {children}
  </h4>
);

export const H5: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h5 className={`text-xl md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`}>
    {children}
  </h5>
);

// Text components
export const Text: React.FC<TypographyProps & { size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' }> = 
  ({ children, className = '', size = 'base' }) => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };
    
    return (
      <p className={`${sizeClasses[size]} text-gray-600 dark:text-gray-300 tracking-tight ${className}`}>
        {children}
      </p>
    );
  };

// Apple-specific text styles
export const AppleHeadline: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h2 className={`text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`}>
    {children}
  </h2>
);

export const AppleSubheadline: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-2xl md:text-3xl font-light tracking-tight text-gray-600 dark:text-gray-300 ${className}`}>
    {children}
  </p>
);

export const AppleProductTitle: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h3 className={`text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

export const AppleProductSubtitle: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-xl md:text-2xl font-light tracking-tight text-gray-600 dark:text-gray-300 ${className}`}>
    {children}
  </p>
);

export const AppleProductDescription: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-base md:text-lg tracking-tight text-gray-600 dark:text-gray-400 ${className}`}>
    {children}
  </p>
);

export const AppleCaption: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-sm tracking-tight text-gray-500 dark:text-gray-500 ${className}`}>
    {children}
  </p>
);

export const ApplePrice: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <span className={`text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`}>
    {children}
  </span>
);

export const AppleLink: React.FC<TypographyProps & { href?: string }> = 
  ({ children, className = '', href = '#' }) => (
    <a 
      href={href}
      className={`text-blue-600 dark:text-blue-400 hover:underline tracking-tight ${className}`}
    >
      {children}
    </a>
  );

// Default export for convenience
const Typography = {
  H1, H2, H3, H4, H5, Text,
  AppleHeadline, AppleSubheadline,
  AppleProductTitle, AppleProductSubtitle, AppleProductDescription,
  AppleCaption, ApplePrice, AppleLink
};

export default Typography; 