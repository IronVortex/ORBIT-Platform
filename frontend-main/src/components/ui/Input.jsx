import React from "react";
import { forwardRef } from 'react';
import '../../styles/ui.css';

const Input = forwardRef(({
  label,
  helperText,
  error,
  className = '',
  disabled,
  ...props
}, ref) => {
  const errorClass = error ? 'orbit-input-error' : '';
  
  return (
    <div className={`orbit-input-wrapper ${className}`}>
      {label && <label className="orbit-input-label">{label}</label>}
      <input
        ref={ref}
        className={`orbit-input ${errorClass}`}
        disabled={disabled}
        aria-invalid={!!error}
        {...props}
      />
      {(helperText || error) && (
        <span className={`orbit-input-helper ${error ? 'error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
