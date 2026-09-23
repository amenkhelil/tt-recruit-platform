import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ text = 'Chargement en cours...', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-tt-blue/20 animate-ping" />
        <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-tt-blue relative`} />
      </div>
      {text && <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};

export const Skeleton = ({ className = '', rounded = 'rounded-lg' }) => {
  return (
    <div className={`animate-pulse bg-slate-200/80 ${rounded} ${className}`} />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft space-y-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
};
