/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Refined dark palette with subtle warmth
        background: '#09090b',
        surface: '#111113',
        'surface-2': '#18181b',
        'surface-3': '#1f1f23',
        border: '#27272a',
        'border-subtle': '#1e1e21',

        // Text hierarchy
        'text-primary': '#fafafa',
        'text-secondary': '#d4d4d8',
        'text-muted': '#71717a',
        'text-faint': '#52525b',

        // Accent - refined teal/emerald for fintech
        accent: '#10b981',
        'accent-muted': '#059669',
        'accent-subtle': 'rgba(16, 185, 129, 0.1)',

        // Semantic colors
        positive: '#22c55e',
        negative: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.5rem' }],
        lg: ['1rem', { lineHeight: '1.625rem' }],
        xl: ['1.125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.875rem' }],
        '3xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0',
        wide: '0.02em',
        wider: '0.04em',
        widest: '0.08em',
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        'medium': '0 4px 16px -4px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
