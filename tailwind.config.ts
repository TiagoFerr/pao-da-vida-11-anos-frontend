import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    screens: {
      sm: '560px',
      md: '768px',
      tablet: '980px',
      lg: '1024px',
      desktop: '1280px',
      xl: '1400px',
    },
    extend: {
      colors: {
        // Marca Oficial Crescer & Edificar (Manual Atualizado)
        ce: {
          porcelana: 'var(--ce-porcelana)',
          verde: 'var(--ce-verde)',
          marfim: 'var(--ce-marfim)',
          bege: 'var(--ce-bege)',
          creme: 'var(--ce-bege)',
          oliva: 'var(--ce-marfim)',
          dourado: 'var(--ce-dourado)',
          preto: 'var(--ce-preto)',
        },
        // Tokens de Interface Semânticos (Light & Dark)
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        chip: 'var(--chip)',
        accent: 'var(--accent)',
        'on-accent': 'var(--on-accent)',
        gold: 'var(--gold)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        identidade: ['"Squeeze"', '"Deco"', '"Bebas Neue"', 'Anton', 'sans-serif'],
        combinacao: ['"Classic"', '"Editor"', '"Montserrat"', 'Inter', 'sans-serif'],
        title: ['"Bebas Neue"', 'Anton', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '10px',
        md: '14px',
        lg: '18px',
        full: '999px',
      },
      boxShadow: {
        panel: 'var(--shadow)',
      },
    },
  },
  plugins: [],
} satisfies Config;
