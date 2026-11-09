import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'default' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors select-none rounded-full border gap-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variants
          variant === 'primary' && 'bg-accent border-accent text-on-accent hover:opacity-90',
          variant === 'gold' && 'bg-gold border-gold text-[#1B1405] font-semibold hover:opacity-90',
          variant === 'default' && 'bg-chip border-line text-ink hover:border-accent',
          variant === 'danger' && 'border-danger text-danger hover:bg-danger/10',
          variant === 'ghost' && 'border-transparent bg-transparent text-ink hover:bg-chip',
          // Sizes
          size === 'sm' && 'text-xs px-3 py-1',
          size === 'md' && 'text-sm px-4 py-2',
          size === 'lg' && 'text-base px-6 py-2.5',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
