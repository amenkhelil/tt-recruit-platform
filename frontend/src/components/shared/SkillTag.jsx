import React from 'react';
import { Check, X, Tag } from 'lucide-react';

export const SkillTag = ({
  skill,
  type = 'default', // 'default' | 'matched' | 'missing'
  size = 'md',
  className = '',
}) => {
  const types = {
    default: 'bg-slate-900 text-white hover:bg-slate-800 shadow-2xs',
    matched: 'bg-emerald-500 text-white font-medium shadow-sm ring-2 ring-emerald-400/20',
    missing: 'bg-rose-50 text-rose-700 border border-rose-200 font-medium',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200',
    tt: 'bg-tt-blue/10 text-tt-blue font-semibold border border-tt-blue/20',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg transition-colors ${
        types[type] || types.default
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {type === 'matched' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
      {type === 'missing' && <X className="w-3.5 h-3.5 text-rose-500 stroke-[3]" />}
      {type === 'default' && <Tag className="w-3 h-3 text-slate-400" />}
      <span>{skill}</span>
    </span>
  );
};
