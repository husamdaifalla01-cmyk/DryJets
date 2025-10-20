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
        // PRECISION OS V2.0 - CSS Variable References
        primary: {
          DEFAULT: 'var(--primary-DEFAULT)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        success: {
          DEFAULT: 'var(--success-DEFAULT)',
          50: 'var(--success-50)',
          100: 'var(--success-100)',
          200: 'var(--success-200)',
          300: 'var(--success-300)',
          400: 'var(--success-400)',
          500: 'var(--success-500)',
          600: 'var(--success-600)',
          700: 'var(--success-700)',
          800: 'var(--success-800)',
          900: 'var(--success-900)',
        },
        warning: {
          DEFAULT: 'var(--warning-DEFAULT)',
          50: 'var(--warning-50)',
          100: 'var(--warning-100)',
          200: 'var(--warning-200)',
          300: 'var(--warning-300)',
          400: 'var(--warning-400)',
          500: 'var(--warning-500)',
          600: 'var(--warning-600)',
          700: 'var(--warning-700)',
          800: 'var(--warning-800)',
          900: 'var(--warning-900)',
        },
        danger: {
          DEFAULT: 'var(--danger-DEFAULT)',
          50: 'var(--danger-50)',
          100: 'var(--danger-100)',
          200: 'var(--danger-200)',
          300: 'var(--danger-300)',
          400: 'var(--danger-400)',
          500: 'var(--danger-500)',
          600: 'var(--danger-600)',
          700: 'var(--danger-700)',
          800: 'var(--danger-800)',
          900: 'var(--danger-900)',
        },

        // Background System (works in light AND dark mode)
        background: {
          DEFAULT: 'var(--background-DEFAULT)',
          darker: 'var(--background-darker)',
          lighter: 'var(--background-lighter)',
          subtle: 'var(--background-subtle)',
          card: 'var(--background-card)',
          elevated: 'var(--background-elevated)',
        },

        // Foreground System
        foreground: {
          DEFAULT: 'var(--foreground-DEFAULT)',
          secondary: 'var(--foreground-secondary)',
          tertiary: 'var(--foreground-tertiary)',
          muted: 'var(--foreground-muted)',
          disabled: 'var(--foreground-disabled)',
        },

        // Border System
        border: {
          DEFAULT: 'var(--border-DEFAULT)',
          subtle: 'var(--border-subtle)',
          focus: 'var(--border-focus)',
          hover: 'var(--border-hover)',
        },

        // Legacy compatibility (keep for backward compatibility)
        brand: {
          primary: tokens.colors.primary.DEFAULT,
          eco: tokens.colors.success.DEFAULT,
          warning: tokens.colors.warning.DEFAULT,
          error: tokens.colors.danger.DEFAULT,
        },
        eco: tokens.colors.success,
        error: tokens.colors.danger,

        // Shadcn/UI HSL colors (for shadcn components only)
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
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
        sans: ['var(--font-inter)', ...tokens.typography.fontFamily.sans],
        mono: tokens.typography.fontFamily.mono,
        heading: ['var(--font-poppins)', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight,
      spacing: tokens.spacing,
      boxShadow: {
        ...tokens.shadows,
        // Precision OS Glows (using CSS variables)
        'glow-primary': 'var(--shadow-glow-primary)',
        'glow-success': 'var(--shadow-glow-success)',
        'glow-warning': 'var(--shadow-glow-warning)',
        'glow-danger': 'var(--shadow-glow-danger)',
        // Legacy shadows (keep for backward compatibility)
        'lift': '0 4px 12px rgba(10, 120, 255, 0.15)',
        'lift-lg': '0 8px 24px rgba(10, 120, 255, 0.2)',
        'glow': tokens.shadows['glow-primary'],
        'eco-glow': tokens.shadows['glow-success'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0066FF 0%, #00A86B 100%)',
        'eco-gradient': 'linear-gradient(135deg, #00A86B 0%, #33BF87 100%)',
        'primary-gradient': 'linear-gradient(135deg, #0066FF 0%, #3399FF 100%)',
        'warning-gradient': 'linear-gradient(135deg, #FF9500 0%, #FFA633 100%)',
        'error-gradient': 'linear-gradient(135deg, #FF3B30 0%, #FF473F 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 0.6s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
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
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
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
        '150': '150ms',
        '200': '200ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: tokens.zIndex,
      width: {
        'sidebar': 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-collapsed)',
      },
      height: {
        'header': 'var(--header-height)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
