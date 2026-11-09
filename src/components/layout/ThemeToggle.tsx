import * as React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className={cn(
        'w-8 h-8 rounded-full border border-line bg-chip text-muted inline-grid place-items-center hover:border-accent hover:text-ink transition-colors',
        className
      )}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};
