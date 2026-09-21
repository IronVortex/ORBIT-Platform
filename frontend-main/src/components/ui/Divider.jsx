import React from "react";
import '../../styles/ui.css';

const Divider = ({ className = '', ...props }) => {
  return <div className={`orbit-divider ${className}`} role="separator" {...props} />;
};

export default Divider;
