import React from "react";
import '../../styles/ui.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  const baseClass = 'orbit-btn';
  const variantClass = `orbit-btn-${variant}`;
  const disabledClass = disabled || isLoading ? 'orbit-btn-disabled' : '';

  return (
    <button 
      className={`${baseClass} ${variantClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="orbit-spinner orbit-spinner-sm" style={{ marginRight: '8px' }}></span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
