import React, { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'font-medium rounded-lg transition-all duration-300 focus:outline-none';
  
  // Size classes
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-[#0071e3] hover:opacity-90 text-white shadow-sm hover:shadow',
    secondary: 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow',
    outline: 'border-2 border-[#0071e3] text-[#0071e3] hover:bg-[#0071e3] hover:text-white',
    text: 'text-[#0071e3] hover:underline',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 