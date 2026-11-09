import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-muted">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'w-full bg-chip text-ink border border-line rounded-[10px] px-3 py-2 text-sm placeholder:text-muted/60 transition-colors',
            'focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold',
            error && 'border-danger focus:border-danger focus:ring-danger',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger min-h-[1em]">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
