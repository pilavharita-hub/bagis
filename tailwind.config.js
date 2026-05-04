/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        red: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        ink: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c2c2c2',
          400: '#a0a0a0',
          500: '#808080',
          600: '#606060',
          700: '#484848',
          800: '#2e2e2e',
          900: '#1a1a1a',
          950: '#0a0a0a',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'ticker': 'ticker 45s linear infinite',
        'pulse-red': 'pulseRed 2.5s ease-in-out infinite',
        'count-flash': 'countFlash 0.35s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'glow-red': 'glowRed 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'draw-line': 'drawLine 1.2s cubic-bezier(0.16,1,0.3,1) forwards',
        'reveal-up': 'revealUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        countFlash: {
          '0%': { color: '#f43f5e', transform: 'scale(1.15)' },
          '100%': { color: 'inherit', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowRed: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(225,29,72,0.2), 0 0 60px rgba(225,29,72,0.06)' },
          '50%': { boxShadow: '0 0 50px rgba(225,29,72,0.45), 0 0 100px rgba(225,29,72,0.12)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(225,29,72,0.15)' },
          '50%': { borderColor: 'rgba(225,29,72,0.45)' },
        },
        drawLine: {
          '0%': { width: '0%', opacity: '0' },
          '100%': { width: '100%', opacity: '1' },
        },
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      boxShadow: {
        'glow-red': '0 0 24px rgba(225,29,72,0.35)',
        'glow-red-lg': '0 0 60px rgba(225,29,72,0.5), 0 0 120px rgba(225,29,72,0.15)',
        'glow-red-sm': '0 0 12px rgba(225,29,72,0.25)',
        'inner-red': 'inset 0 1px 0 rgba(225,29,72,0.2)',
        'card': '0 2px 20px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03)',
        'card-hover': '0 8px 50px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.05)',
        'deep': '0 24px 80px rgba(0,0,0,0.6)',
        'hero': '0 40px 120px rgba(0,0,0,0.8)',
        'lifted': '0 16px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
