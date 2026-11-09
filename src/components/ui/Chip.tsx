import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ className, active = false, children, ...props }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border transition-colors select-none',
        active
          ? 'bg-accent text-on-accent border-accent'
          : 'bg-panel text-muted border-line hover:border-accent/50',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
