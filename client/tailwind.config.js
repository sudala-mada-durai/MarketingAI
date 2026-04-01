/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#edfaf6',
          100: '#d0f3e9',
          200: '#a4e7d4',
          300: '#6fd5bc',
          400: '#3dbfa0',
          500: '#00D4AA',
          600: '#00b891',
          700: '#009074',
          800: '#006f5a',
          900: '#004d3f',
        },
        dark: {
          950: '#060608',
          900: '#0a0e1a',
          800: '#111827',
          700: '#1f2937',
          600: '#374151',
          500: '#4b5563',
        },
        accent: {
          500: '#818CF8',
          glow: 'rgba(129, 140, 248, 0.3)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #00D4AA 0%, #0ea5e9 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
