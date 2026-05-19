/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f7f2',
          100: '#c2ebe0',
          200: '#9ddecc',
          300: '#72cfb6',
          400: '#3dbf9f',
          500: '#1D9E75',
          600: '#178a65',
          700: '#117454',
          800: '#0b5c42',
          900: '#064530',
        },
        dark: {
          950: '#080f0c',
          900: '#0f1a14',
          800: '#152018',
          700: '#1c2b21',
          600: '#243529',
          500: '#2d4034',
        },
        surface: {
          DEFAULT: '#1a2820',
          hover: '#1f3127',
          border: '#2a3d31',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(29,158,117,0.25), transparent)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
