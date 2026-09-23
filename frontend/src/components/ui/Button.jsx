import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  iconLeft: IconLeft,
  iconRight: IconRight,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none rounded-xl';

  const variants = {
    primary: 'bg-tt-blue text-white hover:bg-tt-blue-dark focus:ring-tt-blue/50 shadow-sm hover:shadow active:scale-[0.99]',
    gradient: 'tt-gradient text-white hover:opacity-95 focus:ring-tt-blue/50 shadow-md hover:shadow-hover hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-tt-blue/30 hover:border-slate-400',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500/50 shadow-sm',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/50 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        IconLeft && <IconLeft className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
    </button>
  );
};
