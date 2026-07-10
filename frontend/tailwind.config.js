/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fcf8f2',
          100: '#f7eddcf',
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
      }
    },
  },
  plugins: [],
}
