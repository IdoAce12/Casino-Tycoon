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
        'fiery-float-up': 'fieryFloatUp 1.4s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'modal-flash': 'modalFlash 1s ease-in-out infinite',
        'reel-blur': 'reelBlur 0.08s linear infinite',
        'scanline': 'scanline 4s linear infinite',
        'card-deal': 'cardDeal 0.35s ease-out forwards',
        'win-shake': 'winShake 0.55s ease-in-out',
        'inferno-line': 'infernoLine 0.85s ease-in-out infinite',
        'inferno-celebrate': 'infernoCelebrate 1.1s ease-in-out infinite',
        'inferno-brand-pulse': 'infernoBrandPulse 2s ease-in-out infinite',
        'card-inferno': 'cardInferno 1.2s ease-in-out infinite',
        'heat-glow-t': 'heatGlowT 2.5s ease-in-out infinite',
        'heat-glow-qa': 'heatGlowQa 2s ease-in-out infinite',
        'cascade-drop': 'cascadeDrop 0.45s ease-out forwards',
        'neon-cabinet-pulse': 'neonCabinetPulse 2.5s ease-in-out infinite',
        'royale-shimmer': 'royaleShimmer 3s ease-in-out infinite',
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
        fieryFloatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'brightness(1)' },
          '40%': { opacity: '1', transform: 'translateY(-18px) scale(1.12)', filter: 'brightness(1.35)' },
          '100%': { opacity: '0', transform: 'translateY(-64px) scale(1.2)', filter: 'brightness(1.1)' },
        },
        winShake: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '15%': { transform: 'translate(-3px, 2px)' },
          '30%': { transform: 'translate(3px, -2px)' },
          '45%': { transform: 'translate(-2px, -3px)' },
          '60%': { transform: 'translate(2px, 3px)' },
          '75%': { transform: 'translate(-1px, 1px)' },
        },
        infernoLine: {
          '0%, 100%': { strokeOpacity: '0.65', filter: 'drop-shadow(0 0 4px #ff6b00)' },
          '50%': { strokeOpacity: '1', filter: 'drop-shadow(0 0 14px #ff2200) drop-shadow(0 0 24px #ffaa00)' },
        },
        infernoBurn: {
          '0%': { opacity: '1', transform: 'scale(1)', filter: 'brightness(1.2)' },
          '35%': { opacity: '1', transform: 'scale(1.15)', filter: 'brightness(1.8) saturate(1.5)' },
          '100%': { opacity: '0', transform: 'scale(0.2)', filter: 'brightness(2) blur(4px)' },
        },
        infernoBrandPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(255, 90, 0, 0.45), inset 0 0 8px rgba(255, 60, 0, 0.2)' },
          '50%': { boxShadow: '0 0 28px rgba(255, 120, 0, 0.75), inset 0 0 16px rgba(255, 80, 0, 0.35)' },
        },
        cardInferno: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(255, 100, 0, 0.5), inset 0 -8px 20px rgba(255, 60, 0, 0.25)' },
          '50%': { boxShadow: '0 0 32px rgba(255, 50, 0, 0.85), inset 0 -12px 28px rgba(255, 120, 0, 0.45)' },
        },
        heatGlowT: {
          '0%, 100%': { boxShadow: 'inset 0 0 0 2px rgba(220, 38, 38, 0.35), 0 0 24px rgba(239, 68, 68, 0.25)' },
          '50%': { boxShadow: 'inset 0 0 0 3px rgba(251, 146, 60, 0.55), 0 0 40px rgba(249, 115, 22, 0.45)' },
        },
        heatGlowQa: {
          '0%, 100%': { boxShadow: 'inset 0 0 0 3px rgba(251, 191, 36, 0.5), 0 0 48px rgba(255, 200, 50, 0.4)' },
          '50%': { boxShadow: 'inset 0 0 0 4px rgba(255, 230, 120, 0.85), 0 0 64px rgba(255, 215, 0, 0.65)' },
        },
        cascadeDrop: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        neonCabinetPulse: {
          '0%, 100%': { opacity: '0.55', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.15)' },
        },
        royaleShimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.95' },
        },
      },
    },
  },
  plugins: [],
};
