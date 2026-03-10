/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"Cabinet Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0fdf9',
          100: '#ccfbee',
          200: '#99f5dc',
          300: '#5eeac4',
          400: '#2dd4a8',
          500: '#0fb98d',
          600: '#059472',
          700: '#06775d',
          800: '#095f4b',
          900: '#094e3e',
        },
        dark: {
          950: '#07090f',
          900: '#0d1017',
          850: '#111520',
          800: '#161b27',
          700: '#1e2535',
          600: '#28334a',
          500: '#3a4a6b',
          400: '#5a6e96',
          300: '#8496bc',
          200: '#b0bdd6',
          100: '#d8dfee',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
      }
    },
  },
  plugins: [],
}