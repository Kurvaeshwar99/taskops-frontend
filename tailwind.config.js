/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        slate: {
          950: '#0a0e1a',
          900: '#0f1629',
          850: '#131c35',
          800: '#1a2540',
          700: '#243050',
          600: '#2e3d66',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        emerald: {
          400: '#34d399',
        },
        rose: {
          400: '#fb7185',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(12px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.15)',
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.15)',
        'inner-slate': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
