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
        // Marca Oficial Crescer & Edificar
        ce: {
          verde: 'var(--ce-verde)',
          dourado: 'var(--ce-dourado)',
          creme: 'var(--ce-creme)',
          oliva: 'var(--ce-oliva)',
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
