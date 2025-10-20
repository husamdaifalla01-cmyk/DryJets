const { tokens } = require('../../packages/ui/dryjets-tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // DryJetsOS Design System Tokens
        ...tokens.colors,

        // Legacy compatibility (keep for backward compatibility)
        brand: {
          primary: tokens.colors.primary.DEFAULT,
          eco: tokens.colors.success.DEFAULT,
          warning: tokens.colors.warning.DEFAULT,
          error: tokens.colors.danger.DEFAULT,
        },
        eco: tokens.colors.success,
        error: tokens.colors.danger,

        // Shadcn/UI compatible colors (keep for UI components)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        ...tokens.borderRadius,
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        ...tokens.typography.fontFamily,
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'], // Keep legacy
      },
      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight,
      spacing: tokens.spacing,
      boxShadow: {
        ...tokens.shadows,
        // Legacy shadows (keep for backward compatibility)
        'lift': '0 4px 12px rgba(10, 120, 255, 0.15)',
        'lift-lg': '0 8px 24px rgba(10, 120, 255, 0.2)',
        'glow': tokens.shadows['glow-primary'],
        'eco-glow': tokens.shadows['glow-success'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0A78FF 0%, #00B7A5 100%)',
        'eco-gradient': 'linear-gradient(135deg, #00B7A5 0%, #33CFBF 100%)',
        'primary-gradient': 'linear-gradient(135deg, #0A78FF 0%, #339DFF 100%)',
        'warning-gradient': 'linear-gradient(135deg, #FFB020 0%, #FFC733 100%)',
        'error-gradient': 'linear-gradient(135deg, #FF3B30 0%, #FF4737 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 0.6s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        countUp: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionDuration: {
        'fast': '120ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: tokens.zIndex,
    },
  },
  plugins: [require('tailwindcss-animate')],
};
