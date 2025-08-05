import React from 'react';

interface NavOverlayProps {
  isVisible: boolean;
  onClick?: () => void;
}

const NavOverlay: React.FC<NavOverlayProps> = ({ isVisible, onClick }) => {
  return (
    <div 
      className={`fixed inset-0 backdrop-blur-sm z-40 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ top: '48px', marginTop: '-1px' }} // Aligned with the dropdown
      onClick={onClick}
    />
  );
};

export default NavOverlay; 