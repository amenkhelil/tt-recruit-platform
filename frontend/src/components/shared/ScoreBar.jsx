import React from 'react';

export const ScoreBar = ({
  label,
  score = 0,
  icon: Icon,
  description,
  color = 'blue', // 'blue' | 'emerald' | 'amber' | 'purple'
  className = '',
}) => {
  const normalized = Math.min(Math.max(Math.round(score || 0), 0), 100);

  const colors = {
    blue: {
      bar: 'bg-gradient-to-r from-tt-blue to-tt-cyan',
      text: 'text-tt-blue',
      bg: 'bg-blue-50',
    },
    emerald: {
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    amber: {
      bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
      text: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    purple: {
      bar: 'bg-gradient-to-r from-purple-600 to-indigo-500',
      text: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  };

  const current = colors[color] || colors.blue;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          {Icon && (
            <div className={`p-1 rounded-md ${current.bg}`}>
              <Icon className={`w-3.5 h-3.5 ${current.text}`} />
            </div>
          )}
          <span className="font-semibold text-slate-700">{label}</span>
        </div>
        <span className={`font-bold ${current.text}`}>{normalized}%</span>
      </div>

      {description && (
        <p className="text-xs text-slate-400">{description}</p>
      )}

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${current.bar} transition-all duration-1000 ease-out`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
};
