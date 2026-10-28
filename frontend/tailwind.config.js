const v = name => `rgb(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Orange — accent: headings, icons, highlights
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Brown — primary: buttons, solid fills, logo tiles
        bark: {
          50:  '#faf5f0',
          100: '#f2e6d9',
          200: '#e4ccb3',
          300: '#d2a985',
          400: '#bb8058',
          500: '#a0623b',
          600: '#8b4f2c',
          700: '#6f3e24',
          800: '#57311f',
          900: '#43261a',
          950: '#26150e',
        },
        // Surfaces + text are CSS vars (index.css) so `.theme-dark` can flip a band to espresso
        ink: {
          DEFAULT: v('ink-950'),
          950: v('ink-950'),
          900: v('ink-900'),
          800: v('ink-800'),
          700: v('ink-700'),
          600: v('ink-600'),
          500: v('ink-500'),
          400: v('ink-400'),
        },
        line: {
          DEFAULT: v('line'),
          soft:    v('line-soft'),
          bright:  v('line-bright'),
        },
        fg: {
          DEFAULT: v('fg'),
          muted:   v('fg-muted'),
          subtle:  v('fg-subtle'),
          faint:   v('fg-faint'),
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.03em',
        tight:    '-0.02em',
      },
      boxShadow: {
        'glow-sm':  '0 0 16px rgba(249, 115, 22, 0.12)',
        'glow':     '0 0 32px rgba(249, 115, 22, 0.16), 0 0 64px rgba(249, 115, 22, 0.06)',
        'glow-lg':  '0 0 64px rgba(249, 115, 22, 0.2), 0 0 128px rgba(249, 115, 22, 0.08)',
        'card':     '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-lg':  '0 4px 24px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
        'float':    '0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)',
        'inset-t':  'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease forwards',
        'slide-up':     'slideUp 0.5s cubic-bezier(.16,1,.3,1) forwards',
        'slide-in-r':   'slideInRight 0.4s cubic-bezier(.16,1,.3,1) forwards',
        'scale-in':     'scaleIn 0.3s cubic-bezier(.16,1,.3,1) forwards',
        'shimmer':      'shimmer 2s infinite',
        'pulse-slow':   'pulse 4s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'gradient':     'gradientShift 8s ease infinite',
        'border-spin':  'borderSpin 4s linear infinite',
        'blink':        'blink 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:      { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        scaleIn:      { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        gradientShift:{ '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        borderSpin:   { '100%': { transform: 'rotate(360deg)' } },
        blink:        { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
      },
    },
  },
  plugins: [],
}
