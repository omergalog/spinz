/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],

  theme: {
    extend: {

      // ── Colors ──────────────────────────────
      colors: {
        bg: {
          base:    '#0A0A0A',
          surface: '#161616',
          raised:  '#1C1C1C',
        },
        accent: {
          yellow: '#E8FF00',
          orange: '#FF4D00',
        },
        text: {
          primary: '#F5F5F5',
          muted:   '#888888',
          faint:   '#444444',
        },
        border: {
          DEFAULT: '#2A2A2A',
          subtle:  '#1C1C1C',
        },
        whatsapp: '#25D366',
      },

      // ── Typography ───────────────────────────
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        hebrew:  ['"Heebo"', 'sans-serif'],
      },

      // ── Font sizes (display scale) ───────────
      fontSize: {
        'display-2xl': ['clamp(72px,11vw,148px)', { lineHeight: '1',   letterSpacing: '0.02em' }],
        'display-xl':  ['clamp(52px, 7vw, 88px)', { lineHeight: '1',   letterSpacing: '0.02em' }],
        'display-lg':  ['clamp(40px, 6vw, 72px)', { lineHeight: '1.1', letterSpacing: '0.02em' }],
        'display-md':  ['clamp(36px, 4vw, 48px)', { lineHeight: '1',   letterSpacing: '0.03em' }],
      },

      // ── Spacing extras ───────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '128': '32rem',
      },

      // ── Border radius ────────────────────────
      borderRadius: {
        none: '0px',   // project default — square corners everywhere
      },

      // ── Box shadows ──────────────────────────
      boxShadow: {
        'glow-yellow': '0 0 40px rgba(232,255,0,0.18)',
        'glow-orange': '0 0 40px rgba(255,77,0,0.18)',
        'glow-green':  '0 0 24px rgba(37,211,102,0.35)',
      },

      // ── Backdrop blur ────────────────────────
      backdropBlur: {
        navbar: '16px',
      },

      // ── Keyframes / animations ───────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '25%':      { transform: 'translate(-1%,-1%)' },
          '50%':      { transform: 'translate(1%, 1%)' },
          '75%':      { transform: 'translate(-1%, 1%)' },
        },
      },
      animation: {
        'fade-up':  'fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':  'fade-in 0.6s ease both',
        grain:      'grain 8s steps(1) infinite',
      },
    },
  },

  plugins: [],
};
