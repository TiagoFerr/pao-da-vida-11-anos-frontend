import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  message: string | null;
  visible: boolean;
  onClose?: () => void;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, visible, type = 'info' }) => {
  if (!visible || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-sm font-medium shadow-lg select-none transition-all duration-300',
        'animate-in fade-in slide-in-from-bottom-2',
        type === 'success' && 'bg-accent text-on-accent',
        type === 'error' && 'bg-danger text-white',
        type === 'info' && 'bg-accent text-on-accent'
      )}
    >
      {message}
    </div>
  );
};
