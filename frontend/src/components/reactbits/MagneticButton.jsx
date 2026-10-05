import React from 'react';

export default function MagneticButton({ children, className = '', onClick, style = {}, disabled = false, ...props }) {
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
      {...props}
    >
      {children}
    </button>
  );
}
