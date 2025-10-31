import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

/**
 * REFINED MINIMAL DESIGN SYSTEM
 * Marketing Domination Engine
 *
 * Brand Identity: Minimal, Stylish, Creative, Strategic
 * Visual Direction: Modern SaaS (Linear, Stripe, Vercel)
 * Design Principles: Clean, Sophisticated, Delightful
 */

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Background Layers (Sophisticated Dark)
        'bg-base': '#0C0C0F',
        'bg-surface': '#161618',
        'bg-elevated': '#1F1F23',
        'bg-hover': '#28282C',

        // Primary Brand (Indigo)
        'primary': '#6366F1',
        'primary-light': '#818CF8',
        'primary-dark': '#4F46E5',

        // Accent Colors
        'accent-success': '#10B981',
        'accent-warning': '#F59E0B',
        'accent-error': '#EF4444',
        'accent-info': '#3B82F6',

        // Text Hierarchy
        'text-primary': '#FAFAFA',
        'text-secondary': '#A1A1AA',
        'text-tertiary': '#71717A',
        'text-disabled': '#52525B',

        // Borders & Dividers
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'border-default': 'rgba(255, 255, 255, 0.12)',
        'border-strong': 'rgba(255, 255, 255, 0.18)',

        // Backward compatibility with shadcn
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FAFAFA',
        },
        muted: {
          DEFAULT: '#161618',
          foreground: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#10B981',
          foreground: '#FAFAFA',
        },
        popover: {
          DEFAULT: '#161618',
          foreground: '#FAFAFA',
        },
        card: {
          DEFAULT: '#161618',
          foreground: '#FAFAFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.5rem', { lineHeight: '3rem' }],
      },
      borderRadius: {
        // Moderate curves for refined aesthetic
        none: '0',
        sm: '8px',
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      keyframes: {
        // Fade animations
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        // Slide animations
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // Scale animations
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-up': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' },
        },
        // Shimmer effect (for skeleton loading)
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        // Pulse (subtle)
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        // Accordion (shadcn compatibility)
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out',
        'fade-out': 'fade-out 200ms ease-out',
        'slide-up': 'slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'slide-in-left': 'slide-in-left 300ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'scale-up': 'scale-up 200ms ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'accordion-down': 'accordion-down 200ms ease-out',
        'accordion-up': 'accordion-up 200ms ease-out',
      },
      boxShadow: {
        // Subtle elevation shadows
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.15)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.20)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
        'brand-gradient-vertical': 'linear-gradient(180deg, #6366F1 0%, #818CF8 100%)',
        'success-gradient': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
        'danger-gradient': 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%)',
      },
    },
  },
  plugins: [animate],
} satisfies Config

export default config
