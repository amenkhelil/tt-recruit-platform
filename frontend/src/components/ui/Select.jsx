import React from 'react';

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  helperText,
  required = false,
  className = '',
  placeholder = 'Sélectionner...',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`block w-full appearance-none rounded-xl border bg-white py-2.5 pl-3.5 pr-10 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tt-blue/30 focus:border-tt-blue disabled:bg-slate-50 disabled:text-slate-500 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900'
              : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const isObj = typeof opt === 'object' && opt !== null;
            const val = isObj ? opt.value : opt;
            const lbl = isObj ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>

        {/* Chevron down */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
