import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#101114',
        muted: '#6B7280',
        line: '#E7EAF0',
        accent: '#1D4ED8',
        graphite: '#20242C',
      },
      boxShadow: {
        soft: '0 24px 70px rgba(16, 17, 20, 0.08)',
        glass: '0 16px 50px rgba(35, 45, 70, 0.10)',
      },
      borderRadius: {
        premium: '28px',
      },
    },
  },
  plugins: [],
} satisfies Config;
