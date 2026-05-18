/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0B0C10',
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F4E4BC',
          dark: '#8B7320',
        },
        felt: {
          DEFAULT: '#0D4F3C',
          dark: '#062E24',
          light: '#126B52',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      animation: {
        'flash-win': 'flashWin 0.6s ease-out',
        'shake-loss': 'shakeLoss 0.5s ease-in-out',
        'float-up': 'floatUp 1.2s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'modal-flash': 'modalFlash 1s ease-in-out infinite',
        'reel-blur': 'reelBlur 0.08s linear infinite',
        'scanline': 'scanline 4s linear infinite',
        'card-deal': 'cardDeal 0.35s ease-out forwards',
      },
      keyframes: {
        flashWin: {
          '0%, 100%': { boxShadow: 'inset 0 0 0 transparent' },
          '50%': { boxShadow: 'inset 0 0 80px rgba(13, 79, 60, 0.35)' },
        },
        shakeLoss: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' },
        },
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-52px) scale(1.15)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.25)' },
          '50%': { boxShadow: '0 0 45px rgba(212, 175, 55, 0.55)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        modalFlash: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.92', transform: 'scale(1.015)' },
        },
        reelBlur: {
          '0%, 100%': { filter: 'blur(0px)' },
          '50%': { filter: 'blur(1px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        cardDeal: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
