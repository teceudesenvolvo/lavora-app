import React from 'react';

const Button = ({ children, primary, className = '', href, onClick, type = 'button' }) => (
  <a 
    href={href} 
    onClick={onClick}
    className={`btn ${primary ? 'btn-primary' : 'btn-secondary'} ${className}`}
    type={type}
  >
    {children}
  </a>
);

export default Button;