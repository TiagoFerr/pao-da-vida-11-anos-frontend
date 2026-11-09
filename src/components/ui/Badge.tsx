import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Determina se a cor de texto sobre o fundo deve ser clara ou escura
export function getContrastColor(hexColor?: string): string {
  if (!hexColor) return '#FFFFFF';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? '#16231A' : '#FFFFFF';
}

export const Badge: React.FC<BadgeProps> = ({
  color = 'var(--ce-verde)',
  size = 'md',
  className,
  children,
  style,
  ...props
}) => {
  const textColor = getContrastColor(color);

  return (
    <span
      className={cn(
        'inline-grid place-items-center rounded-full font-serif font-semibold shrink-0 select-none shadow-sm',
        size === 'sm' && 'w-6 h-6 text-xs',
        size === 'md' && 'w-8 h-8 text-sm',
        size === 'lg' && 'w-10 h-10 text-base',
        className
      )}
      style={{
        backgroundColor: color,
        color: textColor,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
