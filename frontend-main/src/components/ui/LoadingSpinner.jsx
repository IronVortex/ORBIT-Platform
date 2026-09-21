import React from "react";
import '../../styles/ui.css';

const LoadingSpinner = ({ size = 'md', className = '', ...props }) => {
  return (
    <div 
      className={`orbit-spinner orbit-spinner-${size} ${className}`} 
      role="status" 
      aria-label="Loading"
      {...props} 
    />
  );
};

export default LoadingSpinner;
