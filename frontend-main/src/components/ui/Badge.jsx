import React from "react";
import '../../styles/ui.css';

const Badge = ({ children, variant = 'neutral', className = '', ...props }) => {
  return (
    <span className={`orbit-badge orbit-badge-${variant} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
