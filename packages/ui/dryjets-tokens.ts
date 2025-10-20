/**
 * DryJets Design System Tokens
 *
 * Enterprise-grade design system for offline-first laundromat OS
 * Inspired by modern control centers with tactile, industrial aesthetics
 */

export const tokens = {
  colors: {
    // Primary - Deep Tech Blue (neon glow for primary actions)
    primary: {
      DEFAULT: '#0A78FF',
      50: '#E5F2FF',
      100: '#CCE5FF',
      200: '#99CCFF',
      300: '#66B2FF',
      400: '#3399FF',
      500: '#0A78FF', // Base
      600: '#0860CC',
      700: '#064899',
      800: '#043066',
      900: '#021833',
      glow: 'rgba(10, 120, 255, 0.4)', // For shadows/glows
    },

    // Success - Teal (operational states, confirmations)
    success: {
      DEFAULT: '#00B7A5',
      50: '#E5F9F7',
      100: '#CCF3EF',
      200: '#99E7DF',
      300: '#66DBCF',
      400: '#33CFBF',
      500: '#00B7A5', // Base
      600: '#009284',
      700: '#006E63',
      800: '#004942',
      900: '#002521',
      glow: 'rgba(0, 183, 165, 0.3)',
    },

    // Warning - Amber (alerts, attention needed)
    warning: {
      DEFAULT: '#FFB020',
      50: '#FFF8E5',
      100: '#FFF1CC',
      200: '#FFE399',
      300: '#FFD566',
      400: '#FFC733',
      500: '#FFB020', // Base
      600: '#CC8D1A',
      700: '#996A13',
      800: '#66460D',
      900: '#332306',
      glow: 'rgba(255, 176, 32, 0.3)',
    },

    // Danger - Red (critical alerts, errors)
    danger: {
      DEFAULT: '#FF3B30',
      50: '#FFE8E6',
      100: '#FFD1CD',
      200: '#FFA39B',
      300: '#FF7569',
      400: '#FF4737',
      500: '#FF3B30', // Base
      600: '#CC2F26',
      700: '#99231D',
      800: '#661813',
      900: '#330C0A',
      glow: 'rgba(255, 59, 48, 0.4)',
    },

    // Background - Matte Deep Navy (industrial control panel aesthetic)
    background: {
      DEFAULT: '#0F1419',
      darker: '#0A0E12',
      lighter: '#1A1F26',
      subtle: '#252A33',
      card: '#1E2329',
      elevated: '#272D35',
    },

    // Foreground - High contrast text
    foreground: {
      DEFAULT: '#FFFFFF',
      secondary: '#A0AEC0',
      tertiary: '#718096',
      muted: '#4A5568',
      disabled: '#2D3748',
    },

    // Border - Subtle separators
    border: {
      DEFAULT: '#2D3748',
      subtle: '#1A202C',
      focus: '#0A78FF',
      hover: '#4A5568',
    },

    // Accent - Purple (premium features, highlights)
    accent: {
      DEFAULT: '#9B59B6',
      50: '#F3E8F7',
      100: '#E7D1EF',
      200: '#CFA3DF',
      300: '#B775CF',
      400: '#9F47BF',
      500: '#9B59B6', // Base
      600: '#7C4792',
      700: '#5D356E',
      800: '#3E2449',
      900: '#1F1225',
      glow: 'rgba(155, 89, 182, 0.3)',
    },

    // Equipment Status
    equipment: {
      operational: '#00B7A5', // Green/Teal
      maintenance: '#FFB020', // Amber
      offline: '#718096', // Gray
      critical: '#FF3B30', // Red
    },

    // Network Status
    network: {
      online: '#00B7A5',
      syncing: '#0A78FF',
      offline: '#FF3B30',
      pending: '#FFB020',
    },
  },

  typography: {
    fontFamily: {
      sans: ['Inter Tight', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      display: ['Satoshi', 'Inter Tight', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem',
    DEFAULT: '0.5rem',
    md: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  shadows: {
    // Subtle elevation
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',

    // Neon glows for interactive elements
    'glow-primary': '0 0 20px rgba(10, 120, 255, 0.4), 0 0 40px rgba(10, 120, 255, 0.2)',
    'glow-success': '0 0 20px rgba(0, 183, 165, 0.3), 0 0 40px rgba(0, 183, 165, 0.15)',
    'glow-warning': '0 0 20px rgba(255, 176, 32, 0.3), 0 0 40px rgba(255, 176, 32, 0.15)',
    'glow-danger': '0 0 20px rgba(255, 59, 48, 0.4), 0 0 40px rgba(255, 59, 48, 0.2)',

    // Inner shadows for depth
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
    'inner-lg': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.4)',
  },

  animation: {
    // Timing functions
    timingFunction: {
      'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      'ease-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },

    // Durations
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
        xl: '3.5rem',
      },
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
        xl: '1.25rem 2.5rem',
      },
    },

    card: {
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
      borderRadius: '0.75rem',
      background: '#1E2329',
    },

    input: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      borderRadius: '0.5rem',
      background: '#252A33',
    },

    sidebar: {
      width: '280px',
      widthCollapsed: '80px',
      background: '#0F1419',
    },

    header: {
      height: '64px',
      background: '#1A1F26',
    },
  },

  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
    toast: 1500,
  },

  // Breakpoints (mobile-first)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

/**
 * Button Variant Presets
 */
export const buttonVariants = {
  primary: {
    default: {
      background: 'linear-gradient(135deg, #0A78FF 0%, #0860CC 100%)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 0 20px rgba(10, 120, 255, 0.4)',
    },
    hover: {
      background: 'linear-gradient(135deg, #3399FF 0%, #0A78FF 100%)',
      boxShadow: '0 0 30px rgba(10, 120, 255, 0.6)',
      transform: 'translateY(-1px)',
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: '0 0 15px rgba(10, 120, 255, 0.3)',
    },
  },

  success: {
    default: {
      background: 'linear-gradient(135deg, #00B7A5 0%, #009284 100%)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 0 20px rgba(0, 183, 165, 0.3)',
    },
    hover: {
      background: 'linear-gradient(135deg, #33CFBF 0%, #00B7A5 100%)',
      boxShadow: '0 0 30px rgba(0, 183, 165, 0.5)',
    },
  },

  danger: {
    default: {
      background: 'linear-gradient(135deg, #FF3B30 0%, #CC2F26 100%)',
      color: '#FFFFFF',
      border: 'none',
      boxShadow: '0 0 20px rgba(255, 59, 48, 0.4)',
    },
    hover: {
      background: 'linear-gradient(135deg, #FF4737 0%, #FF3B30 100%)',
      boxShadow: '0 0 30px rgba(255, 59, 48, 0.6)',
    },
  },

  outline: {
    default: {
      background: 'transparent',
      color: '#0A78FF',
      border: '1px solid #0A78FF',
      boxShadow: 'none',
    },
    hover: {
      background: 'rgba(10, 120, 255, 0.1)',
      boxShadow: '0 0 15px rgba(10, 120, 255, 0.2)',
    },
  },

  ghost: {
    default: {
      background: 'transparent',
      color: '#A0AEC0',
      border: 'none',
      boxShadow: 'none',
    },
    hover: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: '#FFFFFF',
    },
  },
} as const;

/**
 * Status Badge Presets
 */
export const statusBadges = {
  online: {
    background: 'rgba(0, 183, 165, 0.1)',
    color: '#00B7A5',
    border: '1px solid rgba(0, 183, 165, 0.3)',
    dotColor: '#00B7A5',
  },
  syncing: {
    background: 'rgba(10, 120, 255, 0.1)',
    color: '#0A78FF',
    border: '1px solid rgba(10, 120, 255, 0.3)',
    dotColor: '#0A78FF',
    animation: 'pulse',
  },
  offline: {
    background: 'rgba(255, 59, 48, 0.1)',
    color: '#FF3B30',
    border: '1px solid rgba(255, 59, 48, 0.3)',
    dotColor: '#FF3B30',
  },
  pending: {
    background: 'rgba(255, 176, 32, 0.1)',
    color: '#FFB020',
    border: '1px solid rgba(255, 176, 32, 0.3)',
    dotColor: '#FFB020',
  },
} as const;

export type DesignTokens = typeof tokens;
export type ButtonVariants = typeof buttonVariants;
export type StatusBadges = typeof statusBadges;