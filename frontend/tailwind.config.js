/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tt: {
          blue: '#005baa',
          'blue-dark': '#003d73',
          'blue-light': '#1a7bd9',
          'blue-soft': '#e8f2fc',
          navy: '#0b192c',
          purple: '#6d28d9',
          cyan: '#0284c7',
          coral: '#f43f5e',
          gold: '#eab308'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 91, 170, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -5px rgba(11, 25, 44, 0.06), 0 4px 10px -2px rgba(11, 25, 44, 0.03)',
        'hover': '0 20px 35px -8px rgba(0, 91, 170, 0.15), 0 6px 15px -3px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 25px rgba(0, 91, 170, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
