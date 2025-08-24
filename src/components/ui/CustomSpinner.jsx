import React from 'react';

const CustomSpinner = ({ size = 'sm', className = '' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-8 h-8';
  
  return (
    <div className={`spinner ${sizeClass} ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default CustomSpinner;
