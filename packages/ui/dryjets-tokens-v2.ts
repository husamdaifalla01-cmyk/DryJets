/**
 * DryJets Design System Tokens v2.0
 * "Precision OS" - Enterprise-grade design system
 *
 * Inspired by Linear, Stripe, Notion, and Apple
 * Philosophy: Refined minimalism, purposeful motion, authentic brand
 */

export const tokensV2 = {
  /**
   * Color System
   * Philosophy: Strategic use of color, not decoration
   * Less gradients, more precision
   */
  colors: {
    // Primary Action Color (Pure blue, no gradients)
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#0066FF', // Base - Primary actions
      600: '#0052CC',
      700: '#003D99',
      800: '#002966',
      900: '#001433',
      DEFAULT: '#0066FF',
    },

    // Success State (Kelly Green)
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#00A86B', // Base
      600: '#008656',
      700: '#006441',
      800: '#00432B',
      900: '#002116',
      DEFAULT: '#00A86B',
    },

    // Warning State (Amber)
    warning: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#FF9500', // Base
      600: '#CC7700',
      700: '#995900',
      800: '#663C00',
      900: '#331E00',
      DEFAULT: '#FF9500',
    },

    // Critical State (Apple Red)
    danger: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#FF3B30', // Base
      600: '#CC2F26',
      700: '#99231D',
      800: '#661813',
      900: '#330C0A',
      DEFAULT: '#FF3B30',
    },

    // Accent/Premium (Indigo - use sparingly)
    accent: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1', // Base
      600: '#4F52C1',
      700: '#3B3D91',
      800: '#282960',
      900: '#141430',
      DEFAULT: '#6366F1',
    },

    // Light Mode Foundation
    light: {
      background: '#FFFFFF',
      surface: '#F8F9FA',
      surfaceElevated: '#FFFFFF',
      border: '#E5E7EB',
      borderSubtle: '#F3F4F6',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
      textDisabled: '#D1D5DB',
    },

    // Dark Mode Foundation (Control Center)
    dark: {
      background: '#0A0A0B',
      surface: '#161618',
      surfaceElevated: '#1E1E21',
      border: '#2A2A2D',
      borderSubtle: '#1A1A1D',
      textPrimary: '#FAFAFA',
      textSecondary: '#A1A1A6',
      textTertiary: '#636366',
      textDisabled: '#3A3A3C',
    },

    // Semantic Status Colors (subtle, not neon)
    status: {
      online: '#10B981', // Emerald
      processing: '#3B82F6', // Blue
      warning: '#F59E0B', // Amber
      error: '#EF4444', // Red
      neutral: '#9CA3AF', // Gray
      offline: '#6B7280', // Gray
    },

    // Neutral Gray Scale (Refined)
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#0A0A0B',
    },
  },

  /**
   * Typography System
   * Font Stack: Inter Tight (display), Inter (body), JetBrains Mono (code)
   * Precise type scale with tight letter spacing on large text
   */
  typography: {
    fontFamily: {
      display: [
        'Inter Tight',
        '-apple-system',
        'BlinkMacSystemFont',
        'system-ui',
        'sans-serif',
      ],
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'system-ui',
        'sans-serif',
      ],
      mono: [
        'JetBrains Mono',
        'SF Mono',
        'Monaco',
        'Courier New',
        'monospace',
      ],
    },

    // Precise type scale (size / line-height / letter-spacing / weight)
    fontSize: {
      // Display (Hero sections)
      '5xl': [
        '48px',
        { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' },
      ],
      '4xl': [
        '36px',
        { lineHeight: '44px', letterSpacing: '-0.01em', fontWeight: '700' },
      ],

      // Headings
      '3xl': [
        '30px',
        { lineHeight: '38px', letterSpacing: '-0.01em', fontWeight: '600' },
      ],
      '2xl': [
        '24px',
        { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' },
      ],
      xl: [
        '20px',
        { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' },
      ],
      lg: [
        '18px',
        { lineHeight: '26px', letterSpacing: '0', fontWeight: '600' },
      ],

      // Body
      base: ['15px', { lineHeight: '22px', letterSpacing: '0', fontWeight: '400' }],
      sm: ['14px', { lineHeight: '20px', letterSpacing: '0', fontWeight: '400' }],
      xs: ['13px', { lineHeight: '18px', letterSpacing: '0', fontWeight: '400' }],
      '2xs': ['12px', { lineHeight: '16px', letterSpacing: '0', fontWeight: '500' }],
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  /**
   * Spacing System
   * Strict 8pt grid
   */
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
  },

  /**
   * Border Radius
   * Subtle, not pill-shaped (no 2xl)
   */
  borderRadius: {
    none: '0',
    xs: '4px',
    sm: '6px',
    md: '8px', // Default
    lg: '12px',
    xl: '16px',
    full: '9999px', // Avatars, status dots only
  },

  /**
   * Shadows & Elevation
   * Subtle, not dramatic
   */
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl':
      '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

    // Colored shadows (use sparingly, only for focus/hover)
    focus: '0 0 0 3px rgba(0, 102, 255, 0.1)',
    focusDanger: '0 0 0 3px rgba(255, 59, 48, 0.1)',
  },

  /**
   * Motion System
   * Fast, responsive, purposeful
   */
  animation: {
    // Duration tokens
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },

    // Easing curves
    easing: {
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)', // Default for enter
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)', // Exit
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // Transitions
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Playful (use sparingly)
    },

    // Keyframes
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(8px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideDown: {
        '0%': { transform: 'translateY(-8px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      shimmer: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
      spin: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
    },
  },

  /**
   * Component Tokens
   * Precise specifications for common components
   */
  components: {
    button: {
      height: {
        xs: '28px',
        sm: '32px',
        md: '36px', // Default
        lg: '40px',
      },
      padding: {
        xs: '12px 16px',
        sm: '12px 20px',
        md: '16px 24px',
        lg: '16px 28px',
      },
      fontSize: {
        xs: '13px',
        sm: '14px',
        md: '15px',
        lg: '15px',
      },
      radius: '8px',
    },

    card: {
      padding: {
        compact: '16px',
        default: '24px',
        spacious: '32px',
      },
      radius: {
        default: '8px',
        large: '12px',
      },
    },

    input: {
      height: {
        sm: '32px',
        md: '36px',
        lg: '40px',
      },
      padding: {
        sm: '8px 12px',
        md: '12px 16px',
        lg: '12px 20px',
      },
      fontSize: {
        sm: '14px',
        md: '15px',
        lg: '15px',
      },
      radius: '6px',
    },

    badge: {
      height: {
        sm: '20px',
        md: '24px',
      },
      padding: {
        sm: '8px 10px',
        md: '10px 12px',
      },
      fontSize: {
        sm: '12px',
        md: '13px',
      },
      radius: '4px',
    },

    sidebar: {
      widthExpanded: '240px',
      widthCollapsed: '64px',
      itemHeight: '40px',
      itemPadding: '12px',
      itemRadius: '8px',
    },

    header: {
      height: '56px',
      padding: '0 24px',
    },

    modal: {
      radius: '12px',
      padding: '24px',
      maxWidth: '600px',
    },
  },

  /**
   * Layout Tokens
   */
  layout: {
    maxWidth: '1440px',
    contentMaxWidth: '1200px',
    containerPadding: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px',
    },
    sectionSpacing: {
      mobile: '32px',
      desktop: '48px',
    },
  },

  /**
   * Z-Index Layers
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    toast: 1600,
  },

  /**
   * Breakpoints (mobile-first)
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

/**
 * Component Variant Presets
 * Precise specifications for common component patterns
 */

export const componentPresets = {
  // Button variants (no gradients, solid colors)
  button: {
    primary: {
      background: '#0066FF',
      color: '#FFFFFF',
      border: 'none',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      hover: {
        background: '#0052CC',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-1px)',
      },
      active: {
        background: '#003D99',
        shadow: 'none',
        transform: 'translateY(0)',
      },
      focus: {
        ring: '0 0 0 3px rgba(0, 102, 255, 0.1)',
      },
    },

    secondary: {
      background: 'transparent',
      color: '#0066FF',
      border: '1px solid #0066FF',
      shadow: 'none',
      hover: {
        background: 'rgba(0, 102, 255, 0.05)',
        border: '1px solid #0052CC',
      },
      active: {
        background: 'rgba(0, 102, 255, 0.1)',
      },
      focus: {
        ring: '0 0 0 3px rgba(0, 102, 255, 0.1)',
      },
    },

    ghost: {
      background: 'transparent',
      color: '#6B7280',
      border: 'none',
      shadow: 'none',
      hover: {
        background: '#F3F4F6',
        color: '#111827',
      },
      active: {
        background: '#E5E7EB',
      },
    },

    danger: {
      background: '#FF3B30',
      color: '#FFFFFF',
      border: 'none',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      hover: {
        background: '#CC2F26',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-1px)',
      },
      focus: {
        ring: '0 0 0 3px rgba(255, 59, 48, 0.1)',
      },
    },

    success: {
      background: '#00A86B',
      color: '#FFFFFF',
      border: 'none',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      hover: {
        background: '#008656',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-1px)',
      },
    },
  },

  // Card variants
  card: {
    default: {
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      radius: '8px',
    },
    elevated: {
      background: '#FFFFFF',
      border: 'none',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      radius: '8px',
    },
    interactive: {
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      radius: '8px',
      hover: {
        border: '1px solid #D1D5DB',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-2px)',
      },
    },
  },

  // Badge variants
  badge: {
    default: {
      background: '#F3F4F6',
      color: '#374151',
      border: 'none',
    },
    primary: {
      background: '#EFF6FF',
      color: '#0066FF',
      border: 'none',
    },
    success: {
      background: '#ECFDF5',
      color: '#00A86B',
      border: 'none',
    },
    warning: {
      background: '#FFF7ED',
      color: '#FF9500',
      border: 'none',
    },
    danger: {
      background: '#FEF2F2',
      color: '#FF3B30',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: '#6B7280',
      border: '1px solid #E5E7EB',
    },
  },

  // Status indicator variants
  status: {
    online: {
      background: 'rgba(16, 185, 129, 0.1)',
      color: '#10B981',
      dot: '#10B981',
    },
    processing: {
      background: 'rgba(59, 130, 246, 0.1)',
      color: '#3B82F6',
      dot: '#3B82F6',
      animation: 'pulse',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.1)',
      color: '#F59E0B',
      dot: '#F59E0B',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#EF4444',
      dot: '#EF4444',
    },
    neutral: {
      background: 'rgba(156, 163, 175, 0.1)',
      color: '#9CA3AF',
      dot: '#9CA3AF',
    },
  },
} as const;

// Type exports
export type TokensV2 = typeof tokensV2;
export type ComponentPresets = typeof componentPresets;

// Default export
export default {
  tokens: tokensV2,
  presets: componentPresets,
};
