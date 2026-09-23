import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/80 transition-all duration-200 ${
        glass ? 'glass-panel' : 'bg-white'
      } ${
        hover
          ? 'hover:shadow-card hover:border-tt-blue/30 hover:-translate-y-0.5 cursor-pointer'
          : 'shadow-soft'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-5 sm:p-6 border-b border-slate-100 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-bold text-slate-900 tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-500 mt-1 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-5 sm:p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl ${className}`}>
    {children}
  </div>
);
