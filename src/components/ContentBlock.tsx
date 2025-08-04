import React, { ReactNode } from 'react';

interface ContentBlockProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'none';
}

/**
 * ContentBlock component for consistent spacing between content blocks
 */
const ContentBlock: React.FC<ContentBlockProps> = ({
  children,
  className = '',
  spacing = 'md',
}) => {
  const spacingClasses = {
    none: '',
    sm: 'mb-content-y-sm',
    md: 'mb-content-y',
    lg: 'mb-content-y-lg',
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

export default ContentBlock; 