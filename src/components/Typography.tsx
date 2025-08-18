import React, { ReactNode } from 'react';

// Define type for font weights
type FontWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

// Define type for text colors
type TextColor = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'accent' 
  | 'error' 
  | 'success' 
  | 'warning'
  | 'inherit';

// Define type for text alignment
type TextAlign = 'left' | 'center' | 'right' | 'justify';

// Define type for text transforms
type TextTransform = 'uppercase' | 'lowercase' | 'capitalize' | 'normal';

// Define type for text sizes
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

// Base typography props interface
interface TypographyProps {
  children: ReactNode;
  className?: string;
  weight?: FontWeight;
  color?: TextColor;
  align?: TextAlign;
  transform?: TextTransform;
  truncate?: boolean;
  italic?: boolean;
  underline?: boolean;
}

// Helper function to get weight classes
const getWeightClass = (weight?: FontWeight): string => {
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };
  return weight ? weightClasses[weight] : '';
};

// Helper function to get color classes
const getColorClass = (color?: TextColor): string => {
  const colorClasses = {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    tertiary: 'text-gray-500 dark:text-gray-400',
    accent: 'text-[#0071e3] dark:text-[#0071e3]',
    error: 'text-red-600 dark:text-red-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    inherit: 'text-inherit',
  };
  return color ? colorClasses[color] : '';
};

// Helper function to get alignment classes
const getAlignClass = (align?: TextAlign): string => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };
  return align ? alignClasses[align] : '';
};

// Helper function to get transform classes
const getTransformClass = (transform?: TextTransform): string => {
  const transformClasses = {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    normal: 'normal-case',
  };
  return transform ? transformClasses[transform] : '';
};

// Helper function to get size classes
const getSizeClass = (size: TextSize): string => {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };
  return sizeClasses[size];
};

// Heading components
export const H1: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'semibold',
  color = 'primary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-5xl md:text-6xl tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <h1 className={classes}>{children}</h1>;
};

export const H2: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'semibold',
  color = 'primary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-4xl md:text-5xl tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <h2 className={classes}>{children}</h2>;
};

export const H3: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'semibold',
  color = 'primary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-3xl md:text-4xl tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <h3 className={classes}>{children}</h3>;
};

export const H4: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'semibold',
  color = 'primary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-2xl md:text-3xl tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <h4 className={classes}>{children}</h4>;
};

export const H5: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'semibold',
  color = 'primary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-xl md:text-2xl tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <h5 className={classes}>{children}</h5>;
};

// Text component with size prop
export const Text: React.FC<TypographyProps & { size?: TextSize }> = ({ 
  children, 
  className = '', 
  size = 'base',
  weight = 'normal',
  color = 'secondary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    getSizeClass(size),
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    'tracking-tight',
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <p className={classes}>{children}</p>;
};

// Display text (for large, impactful text)
export const Display: React.FC<TypographyProps & { size?: '1' | '2' }> = ({
  children,
  className = '',
  size = '1',
  weight = 'bold',
  color = 'primary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const sizeClass = size === '1' ? 'text-7xl md:text-8xl' : 'text-6xl md:text-7xl';
  
  const classes = [
    sizeClass,
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    'tracking-tighter',
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <h1 className={classes}>{children}</h1>;
};

// Label component for form labels and small text
export const Label: React.FC<TypographyProps & { size?: 'xs' | 'sm' | 'base' }> = ({
  children,
  className = '',
  size = 'sm',
  weight = 'medium',
  color = 'secondary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    getSizeClass(size),
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    'tracking-tight',
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <label className={classes}>{children}</label>;
};

// Caption component for small, auxiliary text
export const Caption: React.FC<TypographyProps> = ({
  children,
  className = '',
  weight = 'normal',
  color = 'tertiary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-xs',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    'tracking-tight',
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <p className={classes}>{children}</p>;
};

// Link component
export const Link: React.FC<TypographyProps & { href?: string; size?: TextSize }> = ({
  children,
  className = '',
  href = '#',
  size = 'base',
  weight = 'normal',
  color = 'accent',
  align,
  transform,
  truncate,
  italic,
  underline = true
}) => {
  const classes = [
    getSizeClass(size),
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    'tracking-tight hover:opacity-80 transition-opacity',
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <a href={href} className={classes}>{children}</a>;
};

// Apple-specific text styles (enhanced with our new system)
export const AppleHeadline: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'semibold',
  color = 'primary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-3xl md:text-4xl tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <h2 className={classes}>{children}</h2>;
};

export const AppleSubheadline: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'light',
  color = 'secondary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-xl md:text-2xl tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <p className={classes}>{children}</p>;
};

export const AppleProductTitle: React.FC<TypographyProps & { size?: 'sm' | 'md' | 'lg' }> = ({ 
  children, 
  className = '',
  weight = 'semibold',
  color = 'primary',
  align,
  transform,
  truncate,
  italic,
  underline,
  size = 'md'
}) => {
  const sizeClass = size === 'sm'
    ? 'text-xl md:text-2xl'
    : size === 'lg'
      ? 'text-3xl md:text-4xl'
      : 'text-2xl md:text-3xl';

  const classes = [
    sizeClass,
    'tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <h3 className={classes}>{children}</h3>;
};

export const AppleProductSubtitle: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'light',
  color = 'secondary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-lg md:text-xl tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <p className={classes}>{children}</p>;
};

export const AppleProductDescription: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'normal',
  color = 'secondary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-sm md:text-base tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <p className={classes}>{children}</p>;
};

export const AppleCaption: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'normal',
  color = 'tertiary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-xs tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <p className={classes}>{children}</p>;
};

export const ApplePrice: React.FC<TypographyProps> = ({ 
  children, 
  className = '',
  weight = 'semibold',
  color = 'primary',
  align,
  transform,
  truncate,
  italic,
  underline
}) => {
  const classes = [
    'text-xl md:text-2xl tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <span className={classes}>{children}</span>;
};

export const AppleLink: React.FC<TypographyProps & { href?: string }> = ({ 
  children, 
  className = '', 
  href = '#',
  weight = 'normal',
  color = 'accent',
  align,
  transform,
  truncate,
  italic,
  underline = true
}) => {
  const classes = [
    'hover:opacity-80 transition-opacity tracking-tight',
    getWeightClass(weight),
    getColorClass(color),
    getAlignClass(align),
    getTransformClass(transform),
    truncate ? 'truncate' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    className
  ].filter(Boolean).join(' ');
  
  return <a href={href} className={classes}>{children}</a>;
};

// Default export for convenience
const Typography = {
  H1, H2, H3, H4, H5, Text,
  Display, Label, Caption, Link,
  AppleHeadline, AppleSubheadline,
  AppleProductTitle, AppleProductSubtitle, AppleProductDescription,
  AppleCaption, ApplePrice, AppleLink
};

export default Typography; 