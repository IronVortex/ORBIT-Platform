import React from "react";
import '../../styles/ui.css';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`orbit-card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
