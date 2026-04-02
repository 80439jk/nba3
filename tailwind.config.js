/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1628',
          900: '#1a2b47',
          800: '#1e3a5f',
          700: '#2c4875',
          600: '#3b5a8f',
          500: '#4a6fa5',
          400: '#6b8bb8',
          300: '#8ba7cb',
          200: '#abc3de',
          100: '#ccdaf0',
          50: '#e6eff9',
        },
        amber: {
          600: '#d97706',
          500: '#f59e0b',
          400: '#fbbf24',
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
