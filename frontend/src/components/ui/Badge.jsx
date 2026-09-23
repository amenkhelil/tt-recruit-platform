import React from 'react';

export const Badge = ({
  children,
  variant = 'blue',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    tt: 'bg-tt-blue/10 text-tt-blue border-tt-blue/20',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    gradient: 'tt-gradient text-white border-transparent',
  };

  const dotColors = {
    blue: 'bg-blue-500',
    tt: 'bg-tt-blue',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    purple: 'bg-purple-500',
    slate: 'bg-slate-400',
    gradient: 'bg-white',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-medium px-3.5 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs font-medium tracking-tight ${
        variants[variant] || variants.blue
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            dotColors[variant] || dotColors.blue
          }`}
        />
      )}
      {children}
    </span>
  );
};
