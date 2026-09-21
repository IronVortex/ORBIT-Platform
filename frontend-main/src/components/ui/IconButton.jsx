import React from "react";
import '../../styles/ui.css';

const IconButton = ({ children, className = '', ...props }) => {
  return (
    <button className={`orbit-icon-btn ${className}`} {...props}>
      {children}
    </button>
  );
};

export default IconButton;
