import React from 'react';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  required = false,
  className = '',
  rows = 4,
  id,
  maxLength,
  value,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col space-y-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-semibold text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        {maxLength && typeof value === 'string' && (
          <span className="text-xs text-slate-400">
            {value.length} / {maxLength}
          </span>
        )}
      </div>

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        required={required}
        className={`block w-full rounded-xl border bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue disabled:bg-slate-50 disabled:text-slate-500 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 placeholder:text-rose-300'
            : 'border-slate-200 hover:border-slate-300'
        } ${className}`}
        {...props}
      />

      {error && (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
