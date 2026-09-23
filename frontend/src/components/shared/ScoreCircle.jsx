import React from 'react';

export const ScoreCircle = ({
  score = 0,
  size = 140,
  strokeWidth = 10,
  title = 'Score Global',
  subtitle = 'Matching IA',
  className = '',
}) => {
  const normalizedScore = Math.min(Math.max(Math.round(score || 0), 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getGradientId = () => {
    if (normalizedScore >= 75) return 'grad-emerald';
    if (normalizedScore >= 50) return 'grad-blue';
    if (normalizedScore >= 30) return 'grad-amber';
    return 'grad-rose';
  };

  const getTextColor = () => {
    if (normalizedScore >= 75) return 'text-emerald-600';
    if (normalizedScore >= 50) return 'text-tt-blue';
    if (normalizedScore >= 30) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#005baa" />
            </linearGradient>
            <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="grad-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${getGradientId()})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold tracking-tight ${getTextColor()}`}>
            {normalizedScore}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {subtitle}
          </span>
        </div>
      </div>

      {title && (
        <span className="mt-2 text-sm font-bold text-slate-800 tracking-tight">
          {title}
        </span>
      )}
    </div>
  );
};
