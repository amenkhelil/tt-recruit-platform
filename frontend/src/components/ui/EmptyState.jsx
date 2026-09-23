import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  className = '',
  children,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 ${className}`}>
      {Icon && (
        <div className="h-16 w-16 rounded-2xl bg-white shadow-soft border border-slate-100 flex items-center justify-center text-tt-blue mb-4 transition-transform hover:scale-105">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant={actionVariant} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
