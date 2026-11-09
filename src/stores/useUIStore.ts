import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info';
  isToastVisible: boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set, get) => {
  // Inicialização do tema baseada no localStorage ou no sistema
  const savedTheme = typeof window !== 'undefined' ? (localStorage.getItem('pao-theme') as 'light' | 'dark' | null) : null;
  const initialTheme = savedTheme || (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', initialTheme);
  }

  return {
    theme: initialTheme,
    setTheme: (theme) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pao-theme', theme);
      }
      set({ theme });
    },
    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(nextTheme);
    },
    toastMessage: null,
    toastType: 'info',
    isToastVisible: false,
    showToast: (message, type = 'info') => {
      set({ toastMessage: message, toastType: type, isToastVisible: true });
      setTimeout(() => {
        set({ isToastVisible: false });
      }, 3500);
    },
    hideToast: () => {
      set({ isToastVisible: false });
    },
  };
});
