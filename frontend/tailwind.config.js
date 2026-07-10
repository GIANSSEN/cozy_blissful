/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cozy Blissful brand palette
        cream: {
          50:  '#fdfcfa',
          100: '#faf8f5',
          200: '#f3ede4',
          300: '#e9e0d2',
          400: '#d9cebb',
        },
        emerald: {
          950: '#021a12',
          900: '#062c22',
          800: '#0a3d30',
          700: '#0f5040',
          600: '#166f57',
          500: '#1e9e7e',
          400: '#34c99e',
          300: '#6ddcb9',
          200: '#a8efd8',
          100: '#d4f7ed',
          50:  '#edfdf7',
        },
        gold: {
          900: '#6b5a2e',
          800: '#856e37',
          700: '#a08742',
          600: '#bfa15f',
          500: '#d4b87a',
          400: '#e3cc97',
          300: '#eddbaf',
          200: '#f5e9cc',
          100: '#faf3e4',
        },
        brand: {
          50:  '#fcf8f2',
          100: '#f7eddc',
          200: '#eedab6',
          300: '#e1bf85',
          400: '#d19e53',
          500: '#c5843b',
          600: '#b66f31',
          700: '#985528',
          800: '#7a4525',
          900: '#643921',
          950: '#361d0f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        // Luxury Claymorphism shadow system
        'clay-card':   '20px 20px 40px #eae6df, -20px -20px 40px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.8), inset -4px -4px 8px rgba(0,0,0,0.03)',
        'clay-sm':     '8px 8px 20px #eae6df, -8px -8px 20px #ffffff, inset 2px 2px 5px rgba(255,255,255,0.7), inset -2px -2px 5px rgba(0,0,0,0.03)',
        'clay-btn':    '6px 6px 12px #d1cac0, -6px -6px 12px #ffffff, inset 2px 2px 4px rgba(255,255,255,0.5)',
        'clay-inset':  'inset 4px 4px 8px #eae6df, inset -4px -4px 8px #ffffff',
        'clay-inset-sm': 'inset 2px 2px 5px #e5e0d8, inset -2px -2px 5px #ffffff',
        'clay-emerald':'8px 8px 24px rgba(6,44,34,0.25), -4px -4px 12px rgba(255,255,255,0.15), inset 2px 2px 6px rgba(255,255,255,0.1)',
        'clay-gold':   '6px 6px 16px rgba(191,161,95,0.35), -4px -4px 10px rgba(255,255,255,0.5), inset 2px 2px 4px rgba(255,255,255,0.4)',
        'clay-pill':   '4px 4px 10px #ddd8cf, -4px -4px 10px #ffffff',
      },
      borderRadius: {
        'clay': '20px',
        'clay-lg': '28px',
        'clay-xl': '36px',
      },
    },
  },
  plugins: [],
}
