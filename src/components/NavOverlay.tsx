import React from 'react';

interface NavOverlayProps {
  isVisible: boolean;
  onClick?: () => void;
}

const NavOverlay: React.FC<NavOverlayProps> = ({ isVisible, onClick }) => {
  return (
    <div 
      className={`fixed inset-0 z-40 transition-opacity duration-500 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ 
        top: '80px', 
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClick}
    />
  );
};

export default NavOverlay; 