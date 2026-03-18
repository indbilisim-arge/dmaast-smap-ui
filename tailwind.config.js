/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0fa',
          100: '#cce1f5',
          200: '#99c3eb',
          300: '#66a5e0',
          400: '#3387d6',
          500: '#0066b3',
          600: '#00528f',
          700: '#003d6b',
          800: '#002948',
          900: '#001424',
        },
        secondary: {
          50: '#e8f5f3',
          100: '#d1ebe7',
          200: '#a3d7cf',
          300: '#75c3b7',
          400: '#47af9f',
          500: '#2a9d8f',
          600: '#227e72',
          700: '#195e56',
          800: '#113f39',
          900: '#081f1d',
        },
        delivery: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
        },
        cost: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        },
        stock: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        resource: {
          light: '#ede9fe',
          DEFAULT: '#8b5cf6',
          dark: '#6d28d9',
        },
        energy: {
          light: '#fce7f3',
          DEFAULT: '#ec4899',
          dark: '#be185d',
        },
        alert: {
          critical: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
        },
        surface: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};
