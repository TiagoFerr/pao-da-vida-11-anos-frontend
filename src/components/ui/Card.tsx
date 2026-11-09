import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('bg-panel border border-line rounded-[18px] shadow-panel overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
