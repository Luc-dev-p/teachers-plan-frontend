/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0F2B46',
        navy: '#1E6091',
        sky: '#48A9C5',
        snow: '#F8FAFC',
        danger: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-midnight': 'linear-gradient(135deg, #1E6091, #48A9C5)',
      },
    },
  },
  plugins: [],
};