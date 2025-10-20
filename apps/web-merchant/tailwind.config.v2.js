/**
 * Tailwind CSS Configuration v2.0
 * "Precision OS" Design System
 *
 * Updated to use dryjets-tokens-v2.ts
 * Light mode default, dark mode supported
 * Clean, minimal, enterprise-grade
 */

const { tokensV2, componentPresets } = require('../../packages/ui/dryjets-tokens-v2');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'], // Enable dark mode with class strategy
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /**
       * Colors - Refined palette from tokensV2
       */
      colors: {
        // Primary action color
        primary: tokensV2.colors.primary,

        // Semantic colors
        success: tokensV2.colors.success,
        warning: tokensV2.colors.warning,
        danger: tokensV2.colors.danger,
        accent: tokensV2.colors.accent,

        // Gray scale (refined)
        gray: tokensV2.colors.gray,

        // Light mode colors
        'light-bg': tokensV2.colors.light.background,
        'light-surface': tokensV2.colors.light.surface,
        'light-surface-elevated': tokensV2.colors.light.surfaceElevated,
        'light-border': tokensV2.colors.light.border,
        'light-border-subtle': tokensV2.colors.light.borderSubtle,
        'light-text': tokensV2.colors.light.textPrimary,
        'light-text-secondary': tokensV2.colors.light.textSecondary,
        'light-text-tertiary': tokensV2.colors.light.textTertiary,

        // Dark mode colors
        'dark-bg': tokensV2.colors.dark.background,
        'dark-surface': tokensV2.colors.dark.surface,
        'dark-surface-elevated': tokensV2.colors.dark.surfaceElevated,
        'dark-border': tokensV2.colors.dark.border,
        'dark-border-subtle': tokensV2.colors.dark.borderSubtle,
        'dark-text': tokensV2.colors.dark.textPrimary,
        'dark-text-secondary': tokensV2.colors.dark.textSecondary,
        'dark-text-tertiary': tokensV2.colors.dark.textTertiary,

        // Status colors
        status: tokensV2.colors.status,

        // Shadcn/UI compatibility (keep for existing components)
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
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Legacy compatibility (for gradual migration)
        'background-DEFAULT': tokensV2.colors.dark.background,
        'background-darker': tokensV2.colors.dark.background,
        'background-lighter': tokensV2.colors.dark.surface,
        'background-subtle': tokensV2.colors.dark.surfaceElevated,
        'border-DEFAULT': tokensV2.colors.dark.border,
        'foreground-DEFAULT': tokensV2.colors.dark.textPrimary,
        'foreground-secondary': tokensV2.colors.dark.textSecondary,
        'foreground-tertiary': tokensV2.colors.dark.textTertiary,
      },

      /**
       * Typography - Precise font system
       */
      fontFamily: {
        display: tokensV2.typography.fontFamily.display,
        sans: tokensV2.typography.fontFamily.sans,
        mono: tokensV2.typography.fontFamily.mono,
      },

      fontSize: tokensV2.typography.fontSize,

      fontWeight: tokensV2.typography.fontWeight,

      /**
       * Spacing - Strict 8pt grid
       */
      spacing: tokensV2.spacing,

      /**
       * Border Radius - Subtle, not pill-shaped
       */
      borderRadius: {
        ...tokensV2.borderRadius,
        // Shadcn/UI compatibility
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      /**
       * Box Shadow - Subtle elevation
       */
      boxShadow: {
        ...tokensV2.shadows,
        // Legacy compatibility
        'glow-primary': tokensV2.shadows.focus,
      },

      /**
       * Z-Index - Layering system
       */
      zIndex: tokensV2.zIndex,

      /**
       * Animation - Fast, purposeful motion
       */
      animation: {
        'fade-in': `fadeIn ${tokensV2.animation.duration.base} ${tokensV2.animation.easing.easeOut}`,
        'fade-out': `fadeOut ${tokensV2.animation.duration.base} ${tokensV2.animation.easing.easeIn}`,
        'slide-up': `slideUp ${tokensV2.animation.duration.base} ${tokensV2.animation.easing.easeOut}`,
        'slide-down': `slideDown ${tokensV2.animation.duration.base} ${tokensV2.animation.easing.easeOut}`,
        'slide-in-right': `slideInRight ${tokensV2.animation.duration.base} ${tokensV2.animation.easing.easeOut}`,
        'slide-out-right': `slideOutRight ${tokensV2.animation.duration.base} ${tokensV2.animation.easing.easeIn}`,
        'scale-in': `scaleIn ${tokensV2.animation.duration.fast} ${tokensV2.animation.easing.easeOut}`,
        shimmer: `shimmer 2s linear infinite`,
        spin: `spin 1s linear infinite`,
        pulse: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
      },

      keyframes: {
        ...tokensV2.animation.keyframes,
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },

      /**
       * Transition Duration
       */
      transitionDuration: {
        instant: tokensV2.animation.duration.instant,
        fast: tokensV2.animation.duration.fast,
        base: tokensV2.animation.duration.base,
        slow: tokensV2.animation.duration.slow,
        slower: tokensV2.animation.duration.slower,
      },

      /**
       * Transition Timing Function
       */
      transitionTimingFunction: {
        'ease-out': tokensV2.animation.easing.easeOut,
        'ease-in': tokensV2.animation.easing.easeIn,
        'ease-in-out': tokensV2.animation.easing.easeInOut,
        spring: tokensV2.animation.easing.spring,
      },

      /**
       * Max Width (for content containers)
       */
      maxWidth: {
        container: tokensV2.layout.maxWidth,
        content: tokensV2.layout.contentMaxWidth,
      },

      /**
       * Breakpoints (mobile-first)
       */
      screens: tokensV2.breakpoints,
    },
  },
  plugins: [
    require('tailwindcss-animate'),

    // Custom plugin for component utilities
    function ({ addUtilities }) {
      addUtilities({
        // Button component utilities
        '.btn-primary': {
          backgroundColor: componentPresets.button.primary.background,
          color: componentPresets.button.primary.color,
          boxShadow: componentPresets.button.primary.shadow,
          '&:hover': {
            backgroundColor: componentPresets.button.primary.hover.background,
            boxShadow: componentPresets.button.primary.hover.shadow,
            transform: componentPresets.button.primary.hover.transform,
          },
        },

        // Card component utilities
        '.card-default': {
          backgroundColor: componentPresets.card.default.background,
          border: componentPresets.card.default.border,
          boxShadow: componentPresets.card.default.shadow,
          borderRadius: componentPresets.card.default.radius,
        },

        '.card-interactive': {
          backgroundColor: componentPresets.card.interactive.background,
          border: componentPresets.card.interactive.border,
          boxShadow: componentPresets.card.interactive.shadow,
          borderRadius: componentPresets.card.interactive.radius,
          cursor: 'pointer',
          transition: 'all 200ms ease-out',
          '&:hover': {
            border: componentPresets.card.interactive.hover.border,
            boxShadow: componentPresets.card.interactive.hover.shadow,
            transform: componentPresets.card.interactive.hover.transform,
          },
        },

        // Status indicator utilities
        '.status-online': {
          backgroundColor: componentPresets.status.online.background,
          color: componentPresets.status.online.color,
        },

        '.status-processing': {
          backgroundColor: componentPresets.status.processing.background,
          color: componentPresets.status.processing.color,
        },

        '.status-error': {
          backgroundColor: componentPresets.status.error.background,
          color: componentPresets.status.error.color,
        },
      });
    },
  ],
};
