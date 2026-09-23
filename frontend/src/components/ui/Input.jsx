import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  iconLeft: IconLeft,
  iconRight: IconRight,
  required = false,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        {IconLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <IconLeft className="h-4 w-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`block w-full rounded-xl border bg-white py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            IconLeft ? 'pl-10' : 'pl-3.5'
          } ${IconRight ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 placeholder:text-rose-300'
              : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />

        {IconRight && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
            <IconRight className="h-4 w-4" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-600 animate-fadeIn">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
