import React from 'react';

const Button = ({ children, primary, className = '', href, onClick, type = 'button' }) => {
  const classes = `btn ${primary ? 'btn-primary' : 'btn-secondary'} ${className}`;

  if (href) {
    return (
      <a 
        href={href} 
        onClick={onClick}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={classes}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;