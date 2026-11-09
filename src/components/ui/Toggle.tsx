import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, id, checked, onChange, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const toggleId = id || generatedId;

    return (
      <label
        htmlFor={toggleId}
        className={cn(
          'inline-flex items-center gap-2 text-xs font-medium text-ink bg-chip border border-line rounded-full px-3 py-1 cursor-pointer select-none transition-colors hover:border-accent',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
      >
        <input
          ref={ref}
          id={toggleId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="accent-accent w-3.5 h-3.5 cursor-pointer rounded"
          {...props}
        />
        <span>{label}</span>
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
