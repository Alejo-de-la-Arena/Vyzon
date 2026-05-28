import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Neutros ──────────────────────────────────
        bone: {
          DEFAULT: '#F5F0E8',
          muted:   '#C8C2B6',
          subtle:  '#8A867D',
          faint:   '#4A4844',
        },
        gray: {
          800: '#1A1A1A',
          900: '#0D0D0D',
        },
        // ── Acento ───────────────────────────────────
        cyan: {
          DEFAULT: '#00E5FF',
          glow:    '#00E5FF40',
          muted:   '#00A8BD',
          subtle:  '#00E5FF15',
        },
        // ── Semánticos ────────────────────────────────
        error:   '#FF4444',
        success: '#00FF88',
      },

      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        'display-2xl': ['clamp(4rem, 10vw, 9rem)',         { lineHeight: '0.92', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-xl':  ['clamp(3rem, 7vw, 6.5rem)',        { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg':  ['clamp(2rem, 4.5vw, 4rem)',        { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md':  ['clamp(1.5rem, 3vw, 2.5rem)',      { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-lg':     ['clamp(1.125rem, 1.5vw, 1.25rem)', { lineHeight: '1.6' }],
        'body-md':     ['1rem',     { lineHeight: '1.6' }],
        'body-sm':     ['0.875rem', { lineHeight: '1.5' }],
        'label':       ['0.75rem',  { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '500' }],
        'mono-lg':     ['clamp(0.875rem, 1.2vw, 1rem)', { lineHeight: '1.5' }],
        'mono-sm':     ['0.75rem',  { lineHeight: '1.4' }],
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        'section':    'clamp(5rem, 10vw, 10rem)',
        'section-sm': 'clamp(3rem, 6vw, 6rem)',
      },

      borderRadius: {
        'none': '0px',
        'sm':   '2px',
        'md':   '4px',
        'lg':   '8px',
        'xl':   '12px',
        'pill': '9999px',
      },

      boxShadow: {
        'glow-cyan': '0 0 30px #00E5FF40, 0 0 60px #00E5FF20',
        'glow-sm':   '0 0 15px #00E5FF30',
        'card':      'inset 0 1px 0 #F5F0E810, 0 1px 0 #00000040',
      },

      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'expo-in':  'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'back-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':   'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        '250':  '250ms',
        '350':  '350ms',
        '500':  '500ms',
        '800':  '800ms',
        '1200': '1200ms',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '1' },
        },
        'noise': {
          '0%,  100%': { transform: 'translate(0,0)' },
          '10%':       { transform: 'translate(-1%,-1%)' },
          '20%':       { transform: 'translate(1%,0%)' },
          '30%':       { transform: 'translate(0%,1%)' },
          '40%':       { transform: 'translate(1%,-1%)' },
          '50%':       { transform: 'translate(-1%,1%)' },
          '60%':       { transform: 'translate(0%,-1%)' },
          '70%':       { transform: 'translate(-1%,0%)' },
          '80%':       { transform: 'translate(1%,1%)' },
          '90%':       { transform: 'translate(0%,0%)' },
        },
        'scroll-hint': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '50%':      { transform: 'translateY(8px)', opacity: '1' },
        },
      },

      animation: {
        'fade-in':      'fade-in 0.6s ease-out forwards',
        'slide-up':     'slide-up 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards',
        'cursor-blink': 'cursor-blink 1s step-end infinite',
        'pulse-dot':    'pulse-dot 2s ease-in-out infinite',
        'noise':        'noise 0.3s steps(2) infinite',
        'scroll-hint':  'scroll-hint 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
