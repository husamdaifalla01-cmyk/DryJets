# MARKETING DOMINATION ENGINE
## Complete Frontend Implementation Plan & Prompt Batching Document

**Version**: 1.0
**Date**: 2025-10-27
**Scope**: End-to-end frontend development for Marketing Domination Engine
**Backend Status**: ✅ 100% Complete (10 services, 40+ REST endpoints)
**Frontend Status**: 🚀 Ready to build (0% → 100%)

---

## 🎯 EXECUTIVE SUMMARY

This document provides a complete, step-by-step implementation plan for building the Marketing Domination Engine frontend. Every button, every click, every interaction is mapped and defined. Nothing is missed.

**What's Covered:**
- 🎨 Bold brand strategy (anti-basic design philosophy)
- 🏗️ Complete UI architecture (40+ endpoint mapping)
- 📦 8 batched implementation phases (prompt-by-prompt)
- 🔄 Full routing and navigation flows
- ⚡ Every interaction defined with functionality
- 🧪 Quality gates and validation checklist

**Tech Stack:**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Custom design tokens
- shadcn/ui (customized beyond recognition)
- Framer Motion (bold animations)
- Zustand (state management)
- React Query (API layer)
- React Hook Form + Zod (validation)

---

## 🎨 PART 1: BRAND STRATEGY & DESIGN PHILOSOPHY

### Brand Identity: "DOMINATION"

**Brand Personality:**
- **Bold**: We don't follow trends, we set them
- **Powerful**: AI that actually works, not smoke and mirrors
- **Precise**: Mathematical accuracy, surgical execution
- **Autonomous**: Zero human intervention required
- **Cutting-Edge**: Future-forward technology today

**Visual Direction: "NEO-PRECISION"**

Inspired by:
- Military command centers (precision, control)
- Financial trading platforms (data density, real-time updates)
- Aerospace UI design (clarity under pressure)
- Cyberpunk aesthetics (neon accents, dark mode first)
- Swiss design principles (grid systems, typography)

**Anti-Pattern Manifesto:**

What we **DO NOT** do:
- ❌ Rounded corners everywhere (overused, soft, consumer-grade)
- ❌ Pastel gradients (weak, uninspired)
- ❌ Card-based layouts exclusively (boring, predictable)
- ❌ Generic shadows (depth without purpose)
- ❌ Standard button styles (everyone looks the same)
- ❌ Typical dashboard grids (12-column bootstrap prison)

What we **DO** instead:
- ✅ Sharp angles with purpose (2px, 4px radius max on specific elements)
- ✅ Bold neon accents (#00FF41, #FF0080, #00D9FF) on dark backgrounds
- ✅ Panel-based layouts with border emphasis (1px, 2px colored borders)
- ✅ Glow effects for interaction states (not shadows)
- ✅ Command-style buttons (rectangular, uppercase, bold)
- ✅ Asymmetric grid systems (break the 12-column mold)

### Color System: "NEON COMMAND"

```css
/* Dark Foundation */
--bg-primary: #0A0A0F;        /* Deep space black */
--bg-secondary: #12121A;      /* Panel background */
--bg-tertiary: #1A1A24;       /* Card background */
--bg-elevated: #22222E;       /* Hover states */

/* Neon Accents */
--neon-cyan: #00D9FF;         /* Primary actions */
--neon-green: #00FF41;        /* Success states */
--neon-magenta: #FF0080;      /* Warnings/alerts */
--neon-purple: #A855F7;       /* Premium features */
--neon-yellow: #FFE600;       /* Highlights */

/* Text Hierarchy */
--text-primary: #FFFFFF;      /* Headings, key data */
--text-secondary: #A0A0B2;    /* Body text */
--text-tertiary: #6B6B7A;     /* Labels, metadata */
--text-disabled: #3E3E48;     /* Disabled states */

/* Borders & Dividers */
--border-default: #2A2A38;    /* Standard borders */
--border-emphasis: #3E3E50;   /* Section dividers */
--border-active: var(--neon-cyan); /* Active elements */

/* Status Colors */
--status-active: #00FF41;
--status-paused: #FFE600;
--status-failed: #FF0080;
--status-generating: #00D9FF;
```

### Typography System: "COMMAND MONO"

```css
/* Primary Font: Inter (Variable) */
--font-sans: 'Inter', -apple-system, system-ui, sans-serif;

/* Monospace Font: JetBrains Mono (for data, metrics) */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;

/* Type Scale */
--text-xs: 0.75rem;    /* 12px - Labels, tags */
--text-sm: 0.875rem;   /* 14px - Body text */
--text-base: 1rem;     /* 16px - Default */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Section headers */
--text-2xl: 1.5rem;    /* 24px - Page headers */
--text-3xl: 2rem;      /* 32px - Hero text */
--text-4xl: 2.5rem;    /* 40px - Dashboard metrics */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;     /* For metrics, numbers */
```

### Spacing System: "PRECISION GRID"

```css
/* Base unit: 4px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Component Patterns: "COMMAND UI"

**Buttons:**
```tsx
// Command Button (Primary)
<button className="
  h-10 px-6
  bg-transparent border-2 border-neon-cyan
  text-neon-cyan font-semibold text-sm uppercase tracking-wide
  hover:bg-neon-cyan hover:text-bg-primary
  transition-all duration-200
  relative overflow-hidden
  before:absolute before:inset-0 before:bg-neon-cyan before:opacity-0 before:transition-opacity
  hover:before:opacity-10
  focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-bg-primary
">
  EXECUTE COMMAND
</button>

// Ghost Button (Secondary)
<button className="
  h-10 px-6
  bg-transparent border border-border-emphasis
  text-text-secondary font-medium text-sm
  hover:border-neon-cyan hover:text-neon-cyan
  transition-all duration-200
">
  Cancel
</button>

// Danger Button
<button className="
  h-10 px-6
  bg-transparent border-2 border-neon-magenta
  text-neon-magenta font-semibold text-sm uppercase
  hover:bg-neon-magenta hover:text-bg-primary
  glow-magenta-sm hover:glow-magenta-md
">
  TERMINATE
</button>
```

**Panels:**
```tsx
// Command Panel
<div className="
  bg-bg-secondary
  border-l-2 border-neon-cyan
  p-6
  relative
  before:absolute before:top-0 before:left-0 before:w-1 before:h-full
  before:bg-gradient-to-b before:from-neon-cyan before:to-transparent
  before:opacity-50
">
  {/* Content */}
</div>

// Data Panel
<div className="
  bg-bg-tertiary
  border border-border-emphasis
  p-6
  hover:border-border-active hover:glow-cyan-sm
  transition-all duration-300
">
  {/* Content */}
</div>
```

**Input Fields:**
```tsx
// Command Input
<input className="
  h-12 px-4
  bg-bg-tertiary
  border border-border-emphasis
  text-text-primary font-mono text-sm
  placeholder:text-text-tertiary
  focus:outline-none focus:border-neon-cyan focus:glow-cyan-sm
  transition-all duration-200
" />

// Inline Edit Input
<input className="
  h-10 px-3
  bg-transparent
  border-b-2 border-border-default
  text-text-primary
  focus:outline-none focus:border-neon-cyan
  transition-colors duration-200
" />
```

**Status Indicators:**
```tsx
// Status Badge
<span className="
  inline-flex items-center gap-2
  h-6 px-3
  bg-bg-elevated border border-status-active
  text-status-active text-xs font-mono uppercase
  glow-green-xs
">
  <span className="w-2 h-2 rounded-full bg-status-active animate-pulse" />
  ACTIVE
</span>

// Metric Display
<div className="
  flex flex-col gap-1
  p-4
  bg-bg-secondary border-l-2 border-neon-cyan
">
  <span className="text-text-tertiary text-xs font-mono uppercase tracking-wide">
    TOTAL REACH
  </span>
  <span className="text-text-primary text-3xl font-black font-mono tabular-nums">
    2,547,892
  </span>
  <span className="text-neon-green text-xs font-mono">
    +24.7% ↗
  </span>
</div>
```

**Animations:**
```css
/* Glow Keyframes */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 5px var(--neon-cyan), 0 0 10px var(--neon-cyan); }
  50% { box-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan), 0 0 30px var(--neon-cyan); }
}

/* Scan Line (for loading states) */
@keyframes scan-line {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

/* Data Stream (for real-time updates) */
@keyframes data-stream {
  0% { opacity: 0; transform: translateY(-10px); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateY(10px); }
}

/* Command Blink (for active states) */
@keyframes command-blink {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.4; }
}
```

---

## 🏗️ PART 2: APPLICATION ARCHITECTURE

### App Structure

```
apps/marketing-admin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Home/Dashboard
│   │   ├── profiles/                 # Profile Management
│   │   │   ├── page.tsx              # List all profiles
│   │   │   ├── new/                  # Create profile wizard
│   │   │   │   └── page.tsx
│   │   │   └── [id]/                 # Profile details
│   │   │       ├── page.tsx          # Overview
│   │   │       ├── connections/      # Platform connections
│   │   │       │   └── page.tsx
│   │   │       ├── strategy/         # Strategy & analysis
│   │   │       │   └── page.tsx
│   │   │       ├── content/          # Content repurposing
│   │   │       │   └── page.tsx
│   │   │       ├── campaigns/        # Campaign management
│   │   │       │   ├── page.tsx      # List campaigns
│   │   │       │   ├── new/          # Launch campaign
│   │   │       │   │   └── page.tsx
│   │   │       │   └── [campaignId]/ # Campaign details
│   │   │       │       └── page.tsx
│   │   │       ├── publishing/       # Publishing queue
│   │   │       │   └── page.tsx
│   │   │       └── analytics/        # Analytics
│   │   │           └── page.tsx
│   │   └── mission-control/          # Real-time dashboard
│   │       └── page.tsx
│   ├── components/                   # React components
│   │   ├── ui/                       # Base UI components (shadcn)
│   │   ├── command/                  # Command UI components
│   │   │   ├── CommandButton.tsx
│   │   │   ├── CommandPanel.tsx
│   │   │   ├── CommandInput.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── MetricDisplay.tsx
│   │   │   └── DataTable.tsx
│   │   ├── profiles/                 # Profile-specific components
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── ProfileWizard.tsx
│   │   │   └── ProfileStats.tsx
│   │   ├── connections/              # Platform connection components
│   │   │   ├── PlatformCard.tsx
│   │   │   ├── OAuthFlowModal.tsx
│   │   │   └── ConnectionHealth.tsx
│   │   ├── strategy/                 # Strategy components
│   │   │   ├── LandscapeChart.tsx
│   │   │   ├── SWOTMatrix.tsx
│   │   │   └── StrategyTimeline.tsx
│   │   ├── content/                  # Content components
│   │   │   ├── RepurposingPreview.tsx
│   │   │   ├── PlatformOutputs.tsx
│   │   │   └── ContentEditor.tsx
│   │   ├── campaigns/                # Campaign components
│   │   │   ├── CampaignWizard.tsx
│   │   │   ├── ProgressTracker.tsx
│   │   │   └── CampaignCard.tsx
│   │   └── analytics/                # Analytics components
│   │       ├── PerformanceChart.tsx
│   │       ├── PlatformComparison.tsx
│   │       └── ROICalculator.tsx
│   ├── lib/                          # Utilities
│   │   ├── api/                      # API client
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── profiles.ts           # Profile API calls
│   │   │   ├── connections.ts        # Connection API calls
│   │   │   ├── strategy.ts           # Strategy API calls
│   │   │   ├── content.ts            # Content API calls
│   │   │   ├── campaigns.ts          # Campaign API calls
│   │   │   └── analytics.ts          # Analytics API calls
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useProfile.ts
│   │   │   ├── useCampaign.ts
│   │   │   └── useRealtime.ts
│   │   ├── store/                    # Zustand stores
│   │   │   ├── profileStore.ts
│   │   │   ├── campaignStore.ts
│   │   │   └── uiStore.ts
│   │   └── utils/                    # Helpers
│   │       ├── formatters.ts
│   │       ├── validators.ts
│   │       └── constants.ts
│   └── styles/
│       └── globals.css               # Tailwind + custom styles
└── tailwind.config.js                # Custom design tokens
```

### Routing Map (40+ Endpoints → UI)

| Endpoint | Method | UI Screen | Route |
|----------|--------|-----------|-------|
| **PROFILE MANAGEMENT** |
| `/marketing/profiles` | POST | Create Profile Wizard | `/profiles/new` |
| `/marketing/profiles` | GET | Profile List | `/profiles` |
| `/marketing/profiles/:id` | GET | Profile Overview | `/profiles/[id]` |
| `/marketing/profiles/:id` | PUT | Edit Profile Modal | (modal in `/profiles/[id]`) |
| `/marketing/profiles/:id` | DELETE | Delete Confirmation | (modal in `/profiles/[id]`) |
| `/marketing/profiles/:id/stats` | GET | Profile Stats Panel | (component in `/profiles/[id]`) |
| `/marketing/profiles/:id/activate` | POST | Activate Button | (button in `/profiles/[id]`) |
| `/marketing/profiles/:id/pause` | POST | Pause Button | (button in `/profiles/[id]`) |
| `/marketing/profiles/:id/archive` | POST | Archive Button | (button in `/profiles/[id]`) |
| **PLATFORM CONNECTIONS** |
| `/marketing/profiles/:id/connections` | GET | Connections Dashboard | `/profiles/[id]/connections` |
| `/marketing/profiles/:id/connections/oauth/initiate` | POST | Connect Platform Modal | (modal in connections page) |
| `/marketing/profiles/:id/connections/oauth/complete` | POST | OAuth Callback Handler | (automatic on callback) |
| `/marketing/profiles/:id/connections/api-key` | POST | API Key Form Modal | (modal in connections page) |
| `/marketing/profiles/:id/connections/:platform` | DELETE | Disconnect Button | (button in connection card) |
| `/marketing/profiles/:id/connections/:platform/health` | GET | Health Status Badge | (badge in connection card) |
| **STRATEGY & ANALYSIS** |
| `/marketing/profiles/:id/analyze-landscape` | POST | Analyze Landscape Button | `/profiles/[id]/strategy` |
| `/marketing/profiles/:id/landscape` | GET | Landscape Dashboard | `/profiles/[id]/strategy` (tab 1) |
| `/marketing/profiles/:id/generate-strategy` | POST | Generate Strategy Button | `/profiles/[id]/strategy` |
| `/marketing/profiles/:id/strategy` | GET | Strategy Dashboard | `/profiles/[id]/strategy` (tab 2) |
| **CONTENT REPURPOSING** |
| `/marketing/profiles/:id/repurpose` | POST | Repurpose Content Form | `/profiles/[id]/content` |
| `/marketing/profiles/:id/repurposing-rules` | GET | Repurposing Rules Config | `/profiles/[id]/content` (settings) |
| **COST CALCULATION** |
| `/marketing/profiles/:id/calculate-cost` | POST | Cost Calculator Form | `/profiles/[id]/campaigns/new` (step 3) |
| `/marketing/profiles/:id/quick-estimate` | GET | Quick Estimate Widget | (sidebar widget) |
| `/marketing/profiles/:id/recommend-budget` | POST | Budget Recommendation | `/profiles/[id]/campaigns/new` (step 2) |
| **PUBLISHING** |
| `/marketing/profiles/:id/publish` | POST | Publish Content Button | `/profiles/[id]/publishing` |
| `/marketing/profiles/:id/publishing-stats` | GET | Publishing Stats Panel | `/profiles/[id]/publishing` |
| `/marketing/profiles/:id/inventory` | GET | Content Inventory Table | `/profiles/[id]/publishing` (tab 2) |
| `/marketing/profiles/:id/domains` | GET | Domain Tracker Panel | `/profiles/[id]/analytics` |
| `/marketing/profiles/:id/performance` | GET | Performance Charts | `/profiles/[id]/analytics` |
| **AUTONOMOUS CAMPAIGNS** |
| `/marketing/profiles/:id/launch-campaign` | POST | Launch Campaign Wizard | `/profiles/[id]/campaigns/new` |
| `/marketing/profiles/:id/campaigns/:campaignId/state` | GET | Campaign Progress View | `/profiles/[id]/campaigns/[campaignId]` |
| `/marketing/profiles/:id/campaigns/:campaignId/pause` | POST | Pause Campaign Button | (button in campaign view) |
| `/marketing/profiles/:id/campaigns/:campaignId/resume` | POST | Resume Campaign Button | (button in campaign view) |

### Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│ SIDEBAR NAVIGATION                                          │
├─────────────────────────────────────────────────────────────┤
│ ⚡ Mission Control              → /mission-control          │
│ 📊 Profiles                     → /profiles                 │
│   ├─ Profile 1                  → /profiles/[id]            │
│   │   ├─ Overview               → /profiles/[id]            │
│   │   ├─ Connections            → /profiles/[id]/connections│
│   │   ├─ Strategy               → /profiles/[id]/strategy   │
│   │   ├─ Content                → /profiles/[id]/content    │
│   │   ├─ Campaigns              → /profiles/[id]/campaigns  │
│   │   ├─ Publishing             → /profiles/[id]/publishing │
│   │   └─ Analytics              → /profiles/[id]/analytics  │
│   └─ + New Profile              → /profiles/new             │
│ ⚙️ Settings                     → /settings                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 PART 3: PROMPT BATCHING - 8 IMPLEMENTATION PHASES

Each phase is a complete, standalone prompt that builds a specific part of the application. Execute in order.

### BATCH 1: DESIGN SYSTEM FOUNDATION

**Objective**: Establish custom design tokens, base components, and layout system

**Files to Create/Modify**:
1. `tailwind.config.js` - Custom design tokens
2. `src/styles/globals.css` - Custom CSS, animations
3. `src/components/ui/` - Base shadcn components (customized)
4. `src/components/command/` - Command UI components
5. `src/app/layout.tsx` - Root layout with providers

**Implementation Details**:

**1.1 Tailwind Configuration**
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
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
        // Dark Foundation
        'bg-primary': '#0A0A0F',
        'bg-secondary': '#12121A',
        'bg-tertiary': '#1A1A24',
        'bg-elevated': '#22222E',

        // Neon Accents
        'neon-cyan': '#00D9FF',
        'neon-green': '#00FF41',
        'neon-magenta': '#FF0080',
        'neon-purple': '#A855F7',
        'neon-yellow': '#FFE600',

        // Text
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0B2',
        'text-tertiary': '#6B6B7A',
        'text-disabled': '#3E3E48',

        // Borders
        'border-default': '#2A2A38',
        'border-emphasis': '#3E3E50',
        'border-active': '#00D9FF',

        // Status
        'status-active': '#00FF41',
        'status-paused': '#FFE600',
        'status-failed': '#FF0080',
        'status-generating': '#00D9FF',
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
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'scan-line': 'scan-line 2s linear infinite',
        'data-stream': 'data-stream 1.5s ease-in-out infinite',
        'command-blink': 'command-blink 1s step-end infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-in',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 5px var(--neon-cyan), 0 0 10px var(--neon-cyan)'
          },
          '50%': {
            boxShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan), 0 0 30px var(--neon-cyan)'
          },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'data-stream': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        'command-blink': {
          '0%, 50%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0.4' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow-cyan-xs': '0 0 5px rgba(0, 217, 255, 0.5)',
        'glow-cyan-sm': '0 0 10px rgba(0, 217, 255, 0.5), 0 0 20px rgba(0, 217, 255, 0.3)',
        'glow-cyan-md': '0 0 15px rgba(0, 217, 255, 0.6), 0 0 30px rgba(0, 217, 255, 0.4)',
        'glow-green-xs': '0 0 5px rgba(0, 255, 65, 0.5)',
        'glow-green-sm': '0 0 10px rgba(0, 255, 65, 0.5), 0 0 20px rgba(0, 255, 65, 0.3)',
        'glow-magenta-xs': '0 0 5px rgba(255, 0, 128, 0.5)',
        'glow-magenta-sm': '0 0 10px rgba(255, 0, 128, 0.5), 0 0 20px rgba(255, 0, 128, 0.3)',
        'glow-magenta-md': '0 0 15px rgba(255, 0, 128, 0.6), 0 0 30px rgba(255, 0, 128, 0.4)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

**1.2 Global Styles**
```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #0A0A0F;
    --bg-secondary: #12121A;
    --bg-tertiary: #1A1A24;
    --neon-cyan: #00D9FF;
  }

  * {
    @apply border-border-default;
  }

  body {
    @apply bg-bg-primary text-text-primary font-sans;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-bg-secondary;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-border-emphasis;
    border-radius: 0;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-neon-cyan;
  }
}

@layer components {
  /* Command Button */
  .btn-command {
    @apply h-10 px-6 bg-transparent border-2 border-neon-cyan text-neon-cyan font-semibold text-sm uppercase tracking-wide;
    @apply hover:bg-neon-cyan hover:text-bg-primary transition-all duration-200;
    @apply focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-bg-primary;
  }

  /* Command Panel */
  .panel-command {
    @apply bg-bg-secondary border-l-2 border-neon-cyan p-6 relative;
    @apply before:absolute before:top-0 before:left-0 before:w-1 before:h-full;
    @apply before:bg-gradient-to-b before:from-neon-cyan before:to-transparent before:opacity-50;
  }

  /* Data Panel */
  .panel-data {
    @apply bg-bg-tertiary border border-border-emphasis p-6;
    @apply hover:border-border-active hover:shadow-glow-cyan-sm transition-all duration-300;
  }

  /* Command Input */
  .input-command {
    @apply h-12 px-4 bg-bg-tertiary border border-border-emphasis;
    @apply text-text-primary font-mono text-sm placeholder:text-text-tertiary;
    @apply focus:outline-none focus:border-neon-cyan focus:shadow-glow-cyan-sm transition-all duration-200;
  }
}

@layer utilities {
  .text-gradient-cyan {
    @apply bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent;
  }

  .border-gradient-cyan {
    border-image: linear-gradient(90deg, #00D9FF, #A855F7) 1;
  }
}
```

**1.3 Command UI Components**

Create these components in `src/components/command/`:

- `CommandButton.tsx` - Primary action buttons
- `CommandPanel.tsx` - Panel containers with neon borders
- `CommandInput.tsx` - Input fields with command styling
- `StatusBadge.tsx` - Status indicators with glow effects
- `MetricDisplay.tsx` - Large metric displays
- `DataTable.tsx` - Command-style data tables

**Testing Checklist**:
- [ ] All design tokens properly configured
- [ ] Dark mode works correctly
- [ ] Animations run smoothly (60fps)
- [ ] Glow effects render correctly
- [ ] Typography scales properly
- [ ] All command components render with correct styles

---

### BATCH 2: PROFILE MANAGEMENT

**Objective**: Build complete profile CRUD interface with wizard, list, and detail views

**Screens to Build**:
1. Profile List (`/profiles`) - Grid of profile cards
2. Create Profile Wizard (`/profiles/new`) - Multi-step form
3. Profile Overview (`/profiles/[id]`) - Dashboard with stats
4. Edit Profile Modal - Inline editing

**API Endpoints Used**:
- GET `/marketing/profiles` - List profiles
- POST `/marketing/profiles` - Create profile
- GET `/marketing/profiles/:id` - Get profile
- PUT `/marketing/profiles/:id` - Update profile
- DELETE `/marketing/profiles/:id` - Delete profile
- GET `/marketing/profiles/:id/stats` - Get stats
- POST `/marketing/profiles/:id/activate` - Activate
- POST `/marketing/profiles/:id/pause` - Pause
- POST `/marketing/profiles/:id/archive` - Archive

**Component Tree**:
```
/profiles
├── page.tsx
│   ├── <ProfileGrid />
│   │   ├── <ProfileCard /> (×N)
│   │   │   ├── <StatusBadge />
│   │   │   ├── <MetricDisplay />
│   │   │   └── <CommandButton />
│   │   └── <CreateProfileCard />
│   └── <QuickStatsPanel />

/profiles/new
├── page.tsx
│   └── <ProfileWizard />
│       ├── Step 1: Basic Info
│       ├── Step 2: Target Audience
│       ├── Step 3: Brand Voice
│       ├── Step 4: Goals
│       └── Step 5: Review & Create

/profiles/[id]
├── page.tsx
│   ├── <ProfileHeader />
│   │   ├── <StatusBadge />
│   │   └── <ProfileActions />
│   ├── <ProfileStats />
│   │   └── <MetricDisplay /> (×6)
│   └── <ProfileTabNav />
```

**State Management** (Zustand):
```typescript
// src/lib/store/profileStore.ts
interface ProfileStore {
  profiles: MarketingProfile[];
  activeProfile: MarketingProfile | null;
  setActiveProfile: (profile: MarketingProfile) => void;
  fetchProfiles: () => Promise<void>;
  createProfile: (data: CreateProfileDto) => Promise<void>;
  updateProfile: (id: string, data: UpdateProfileDto) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}
```

**Testing Checklist**:
- [ ] Profile list loads and displays all profiles
- [ ] Create wizard validates all steps
- [ ] Create wizard saves profile successfully
- [ ] Profile detail page loads with stats
- [ ] Edit modal updates profile correctly
- [ ] Delete confirmation works
- [ ] Activate/Pause/Archive buttons work
- [ ] Navigation between screens works
- [ ] Loading states display correctly
- [ ] Error states display correctly

---

### BATCH 3: PLATFORM CONNECTIONS

**Objective**: Build platform connection management with OAuth flows and health monitoring

**Screens to Build**:
1. Connections Dashboard (`/profiles/[id]/connections`)
2. Connect Platform Modal (OAuth initiation)
3. OAuth Callback Handler
4. API Key Connection Form
5. Connection Health Monitor

**API Endpoints Used**:
- GET `/marketing/profiles/:id/connections` - List connections
- POST `/marketing/profiles/:id/connections/oauth/initiate` - Start OAuth
- POST `/marketing/profiles/:id/connections/oauth/complete` - Complete OAuth
- POST `/marketing/profiles/:id/connections/api-key` - Connect with API key
- DELETE `/marketing/profiles/:id/connections/:platform` - Disconnect
- GET `/marketing/profiles/:id/connections/:platform/health` - Check health

**Platforms to Support**:
- Twitter/X
- LinkedIn
- Facebook
- Instagram
- TikTok
- YouTube
- WordPress
- Medium
- Ghost

**Component Tree**:
```
/profiles/[id]/connections
├── page.tsx
│   ├── <ConnectionsGrid />
│   │   ├── <PlatformCard platform="twitter" /> (×9)
│   │   │   ├── <PlatformIcon />
│   │   │   ├── <ConnectionStatus />
│   │   │   ├── <HealthBadge />
│   │   │   └── <ConnectButton />
│   │   └── <ConnectPlatformButton />
│   └── <ConnectionsSummary />
│       └── <MetricDisplay />

<OAuthFlowModal />
├── Step 1: Platform Selection
├── Step 2: Authorization (external)
└── Step 3: Confirmation

<ApiKeyModal />
├── <CommandInput name="apiKey" />
├── <CommandInput name="apiSecret" />
└── <CommandButton>CONNECT</CommandButton>
```

**OAuth Flow Implementation**:
```typescript
// src/lib/hooks/useOAuth.ts
const useOAuth = () => {
  const initiateOAuth = async (platform: string) => {
    // 1. Call /oauth/initiate
    const { authUrl, state } = await api.initiateOAuth(profileId, platform);

    // 2. Save state to localStorage
    localStorage.setItem('oauth_state', state);

    // 3. Redirect to platform
    window.location.href = authUrl;
  };

  const handleCallback = async (code: string, state: string) => {
    // 1. Verify state matches
    const savedState = localStorage.getItem('oauth_state');
    if (state !== savedState) throw new Error('Invalid state');

    // 2. Complete OAuth
    await api.completeOAuth(profileId, platform, code);

    // 3. Refresh connections
    await fetchConnections();

    // 4. Redirect to connections page
    router.push(`/profiles/${profileId}/connections`);
  };

  return { initiateOAuth, handleCallback };
};
```

**Real-time Health Monitoring**:
```typescript
// Poll health every 30 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const health = await api.checkHealth(profileId, platform);
    setHealthStatus(health);
  }, 30000);

  return () => clearInterval(interval);
}, [profileId, platform]);
```

**Testing Checklist**:
- [ ] All 9 platforms display correctly
- [ ] OAuth flow initiates for each platform
- [ ] OAuth callback completes successfully
- [ ] API key connection works
- [ ] Disconnect confirmation modal works
- [ ] Health monitoring updates in real-time
- [ ] Connection status badges show correct state
- [ ] Error handling for failed connections
- [ ] Success notifications display
- [ ] Loading states during connection

---

### BATCH 4: STRATEGY & ANALYSIS

**Objective**: Build landscape analysis and strategy generation interfaces with visualizations

**Screens to Build**:
1. Strategy Dashboard (`/profiles/[id]/strategy`)
   - Tab 1: Landscape Analysis
   - Tab 2: Marketing Strategy
2. Analysis Results Display
3. Strategy Timeline View
4. Competitor Intelligence Panel

**API Endpoints Used**:
- POST `/marketing/profiles/:id/analyze-landscape` - Trigger analysis
- GET `/marketing/profiles/:id/landscape` - Get cached analysis
- POST `/marketing/profiles/:id/generate-strategy` - Generate strategy
- GET `/marketing/profiles/:id/strategy` - Get strategy

**Component Tree**:
```
/profiles/[id]/strategy
├── page.tsx
│   ├── <StrategyTabs />
│   │   ├── Tab 1: Landscape
│   │   │   ├── <LandscapeHeader />
│   │   │   │   ├── <MetricDisplay title="TAM" />
│   │   │   │   ├── <MetricDisplay title="SAM" />
│   │   │   │   └── <CommandButton>RE-ANALYZE</CommandButton>
│   │   │   ├── <MarketSizeChart />
│   │   │   ├── <CompetitorGrid />
│   │   │   │   └── <CompetitorCard /> (×10)
│   │   │   ├── <SWOTMatrix />
│   │   │   │   ├── Strengths (×5)
│   │   │   │   ├── Weaknesses (×5)
│   │   │   │   ├── Opportunities (×5)
│   │   │   │   └── Threats (×5)
│   │   │   ├── <ContentGapsPanel />
│   │   │   └── <RecommendationsPanel />
│   │   └── Tab 2: Strategy
│   │       ├── <StrategyHeader />
│   │       │   ├── <StatusBadge />
│   │       │   └── <CommandButton>REGENERATE</CommandButton>
│   │       ├── <PositioningPanel />
│   │       ├── <ContentStrategyPanel />
│   │       │   ├── Pillar Topics (×5)
│   │       │   └── Content Mix Chart
│   │       ├── <ChannelStrategyPanel />
│   │       │   └── Platform Priority List
│   │       ├── <CampaignRoadmap />
│   │       │   └── <CampaignCard /> (×6)
│   │       └── <BudgetAllocation />
│   │           └── Budget Breakdown Chart
```

**Visualization Components**:

**SWOT Matrix**:
```tsx
<div className="grid grid-cols-2 gap-4">
  {/* Strengths */}
  <div className="panel-command border-l-neon-green">
    <h3>STRENGTHS</h3>
    {strengths.map(s => (
      <div className="flex items-start gap-2">
        <Check className="text-neon-green" />
        <span>{s}</span>
      </div>
    ))}
  </div>

  {/* Weaknesses */}
  <div className="panel-command border-l-neon-magenta">
    <h3>WEAKNESSES</h3>
    {/* ... */}
  </div>

  {/* Opportunities */}
  <div className="panel-command border-l-neon-cyan">
    <h3>OPPORTUNITIES</h3>
    {/* ... */}
  </div>

  {/* Threats */}
  <div className="panel-command border-l-neon-yellow">
    <h3>THREATS</h3>
    {/* ... */}
  </div>
</div>
```

**Competitor Intelligence**:
```tsx
<CompetitorCard competitor={comp}>
  <CompetitorLogo src={comp.logo} />
  <div>
    <h4>{comp.name}</h4>
    <StatusBadge status={comp.status} />
  </div>
  <div className="grid grid-cols-3 gap-4">
    <MetricDisplay
      label="CONTENT VOL"
      value={comp.contentVolume}
    />
    <MetricDisplay
      label="ENGAGEMENT"
      value={comp.avgEngagement}
    />
    <MetricDisplay
      label="PLATFORMS"
      value={comp.platforms.length}
    />
  </div>
  <CommandButton size="sm">
    ANALYZE
  </CommandButton>
</CompetitorCard>
```

**Campaign Roadmap Timeline**:
```tsx
<div className="relative">
  {/* Timeline line */}
  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border-emphasis" />

  {campaigns.map((campaign, idx) => (
    <div className="relative pl-20 pb-8">
      {/* Timeline node */}
      <div className="absolute left-6 top-2 w-4 h-4 border-2 border-neon-cyan bg-bg-primary" />

      {/* Campaign card */}
      <div className="panel-data">
        <div className="flex items-start justify-between">
          <div>
            <h4>{campaign.name}</h4>
            <p className="text-text-tertiary text-sm">
              Week {campaign.week} - {campaign.duration}
            </p>
          </div>
          <StatusBadge status="planned" />
        </div>

        <div className="mt-4">
          <p>{campaign.description}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <MetricDisplay label="CONTENT" value={campaign.contentPieces} />
          <MetricDisplay label="PLATFORMS" value={campaign.platforms} />
          <MetricDisplay label="BUDGET" value={`$${campaign.budget}`} />
        </div>
      </div>
    </div>
  ))}
</div>
```

**Loading States**:
```tsx
// While analyzing (5-10 seconds)
<div className="panel-command">
  <div className="flex items-center gap-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
    <div>
      <h3>ANALYZING LANDSCAPE</h3>
      <p className="text-text-tertiary text-sm">
        Processing market data, analyzing 127 competitors...
      </p>
    </div>
  </div>

  {/* Progress bar */}
  <div className="mt-4 h-1 bg-bg-tertiary">
    <div
      className="h-full bg-neon-cyan transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>
```

**Testing Checklist**:
- [ ] Analyze landscape button triggers analysis
- [ ] Loading state displays during analysis
- [ ] Analysis results display correctly
- [ ] SWOT matrix populates with data
- [ ] Competitor grid displays all competitors
- [ ] Generate strategy button works
- [ ] Strategy tabs switch correctly
- [ ] Campaign roadmap renders timeline
- [ ] Budget allocation chart displays
- [ ] Re-analyze updates cached data
- [ ] Error handling for failed analysis

---

### BATCH 5: CONTENT REPURPOSING

**Objective**: Build content repurposing interface with preview and customization

**Screens to Build**:
1. Content Repurposing Dashboard (`/profiles/[id]/content`)
2. Upload/Paste Content Form
3. Repurposing Rules Configuration
4. Platform Output Previews
5. Bulk Edit Interface

**API Endpoints Used**:
- POST `/marketing/profiles/:id/repurpose` - Repurpose content
- GET `/marketing/profiles/:id/repurposing-rules` - Get default rules

**Component Tree**:
```
/profiles/[id]/content
├── page.tsx
│   ├── <ContentInputPanel />
│   │   ├── <ContentTypeSelector />
│   │   │   ├── Blog Post
│   │   │   ├── Video Script
│   │   │   └── Podcast Transcript
│   │   ├── <ContentInput />
│   │   │   ├── Paste Text
│   │   │   ├── Upload File
│   │   │   └── Import URL
│   │   └── <CommandButton>REPURPOSE</CommandButton>
│   ├── <RepurposingRulesPanel />
│   │   ├── <PlatformToggle /> (×9)
│   │   ├── <OutputQuantitySlider />
│   │   └── <ToneSelector />
│   └── <OutputPreviewPanel />
│       ├── <PlatformTabs />
│       │   ├── Twitter (×10 posts)
│       │   ├── LinkedIn (×5 posts)
│       │   ├── Facebook (×3 posts)
│       │   ├── Instagram (×3 captions)
│       │   ├── TikTok (×2 scripts)
│       │   └── YouTube (×1 script)
│       ├── <OutputCard /> (×N)
│       │   ├── <OutputPreview />
│       │   ├── <CharacterCount />
│       │   ├── <ValidationBadge />
│       │   └── <OutputActions />
│       │       ├── <CommandButton>EDIT</CommandButton>
│       │       ├── <CommandButton>COPY</CommandButton>
│       │       └── <CommandButton>PUBLISH</CommandButton>
│       └── <BulkActions />
│           ├── <CommandButton>PUBLISH ALL</CommandButton>
│           └── <CommandButton>EXPORT</CommandButton>
```

**Content Input Interface**:
```tsx
<div className="panel-data">
  <h3>SOURCE CONTENT</h3>

  {/* Input method tabs */}
  <Tabs value={inputMethod}>
    <TabsList>
      <TabsTrigger value="paste">PASTE TEXT</TabsTrigger>
      <TabsTrigger value="upload">UPLOAD FILE</TabsTrigger>
      <TabsTrigger value="url">IMPORT URL</TabsTrigger>
    </TabsList>

    <TabsContent value="paste">
      <textarea
        className="input-command h-64 w-full font-mono"
        placeholder="Paste your blog post, article, or content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-between mt-2">
        <span className="text-text-tertiary text-sm">
          {wordCount} words
        </span>
        <span className="text-text-tertiary text-sm">
          Est. {Math.ceil(wordCount / 1000)} min read
        </span>
      </div>
    </TabsContent>

    <TabsContent value="upload">
      <div className="border-2 border-dashed border-border-emphasis h-64 flex items-center justify-center">
        <input type="file" onChange={handleUpload} />
        <div className="text-center">
          <Upload className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <p>Drop file here or click to upload</p>
          <p className="text-text-tertiary text-sm">
            Supports .txt, .md, .docx
          </p>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="url">
      <input
        className="input-command w-full"
        placeholder="https://example.com/blog/post"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <CommandButton onClick={handleFetchUrl}>
        FETCH CONTENT
      </CommandButton>
    </TabsContent>
  </Tabs>
</div>
```

**Repurposing Rules Configuration**:
```tsx
<div className="panel-data">
  <h3>REPURPOSING RULES</h3>

  {/* Platform selection */}
  <div>
    <h4 className="text-sm text-text-tertiary uppercase mb-4">
      TARGET PLATFORMS
    </h4>
    <div className="grid grid-cols-3 gap-4">
      {platforms.map(platform => (
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedPlatforms.includes(platform)}
            className="sr-only"
          />
          <div className={cn(
            "w-5 h-5 border-2 transition-all",
            selectedPlatforms.includes(platform)
              ? "border-neon-cyan bg-neon-cyan"
              : "border-border-emphasis group-hover:border-neon-cyan"
          )}>
            {selectedPlatforms.includes(platform) && (
              <Check className="w-4 h-4 text-bg-primary" />
            )}
          </div>
          <PlatformIcon platform={platform} />
          <span>{platform}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Output quantity */}
  <div className="mt-6">
    <h4 className="text-sm text-text-tertiary uppercase mb-4">
      OUTPUT QUANTITY
    </h4>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-xs text-text-tertiary">
          TWITTER POSTS
        </label>
        <input
          type="range"
          min="5"
          max="20"
          value={rules.twitter}
          className="w-full"
        />
        <span className="text-neon-cyan font-mono">
          {rules.twitter}
        </span>
      </div>
      {/* Repeat for other platforms */}
    </div>
  </div>

  {/* Tone/style */}
  <div className="mt-6">
    <h4 className="text-sm text-text-tertiary uppercase mb-4">
      BRAND VOICE
    </h4>
    <select className="input-command w-full">
      <option>Professional</option>
      <option>Casual</option>
      <option>Witty</option>
      <option>Educational</option>
      <option>Inspirational</option>
    </select>
  </div>
</div>
```

**Output Preview Cards**:
```tsx
<div className="grid grid-cols-2 gap-4">
  {outputs.map(output => (
    <div className="panel-data group">
      {/* Platform badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PlatformIcon platform={output.platform} />
          <span className="text-sm font-mono uppercase">
            {output.platform}
          </span>
        </div>
        <ValidationBadge
          score={output.validationScore}
          errors={output.errors}
        />
      </div>

      {/* Content preview */}
      <div className="bg-bg-primary p-4 border-l-2 border-neon-cyan">
        <p className="text-sm whitespace-pre-wrap">
          {output.content}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between mt-4 text-xs text-text-tertiary font-mono">
        <span>
          {output.characterCount} / {output.maxCharacters} chars
        </span>
        <span>
          {output.hashtags?.length || 0} hashtags
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <CommandButton size="sm" onClick={() => handleEdit(output)}>
          EDIT
        </CommandButton>
        <CommandButton size="sm" variant="ghost" onClick={() => handleCopy(output)}>
          COPY
        </CommandButton>
        <CommandButton size="sm" onClick={() => handlePublish(output)}>
          PUBLISH
        </CommandButton>
      </div>
    </div>
  ))}
</div>
```

**Real-time Repurposing Progress**:
```tsx
// Show progress while AI generates (15-30 seconds for 50+ posts)
<div className="panel-command">
  <div className="flex items-center gap-4">
    <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
    <div>
      <h3>REPURPOSING CONTENT</h3>
      <p className="text-text-tertiary text-sm">
        Generating {totalOutputs} platform-optimized posts...
      </p>
    </div>
  </div>

  {/* Platform progress */}
  <div className="mt-6 space-y-2">
    {platforms.map(platform => (
      <div className="flex items-center gap-4">
        <PlatformIcon platform={platform} />
        <div className="flex-1">
          <div className="h-1 bg-bg-tertiary">
            <div
              className="h-full bg-neon-cyan transition-all"
              style={{ width: `${progress[platform]}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-mono text-text-tertiary">
          {generated[platform]} / {target[platform]}
        </span>
      </div>
    ))}
  </div>
</div>
```

**Testing Checklist**:
- [ ] Content input accepts paste/upload/URL
- [ ] Word count displays correctly
- [ ] Platform toggles work
- [ ] Quantity sliders update rules
- [ ] Repurpose button triggers generation
- [ ] Progress indicator shows real-time status
- [ ] Output previews display correctly
- [ ] Validation badges show correct scores
- [ ] Edit modal allows inline editing
- [ ] Copy button copies to clipboard
- [ ] Publish button works
- [ ] Bulk actions work
- [ ] Export generates file

---

### BATCH 6: CAMPAIGN LAUNCH & ORCHESTRATION

**Objective**: Build autonomous campaign wizard and real-time progress monitoring

**Screens to Build**:
1. Campaign Launch Wizard (`/profiles/[id]/campaigns/new`)
2. Campaign List (`/profiles/[id]/campaigns`)
3. Campaign Detail/Progress (`/profiles/[id]/campaigns/[campaignId]`)
4. Mission Control Dashboard (`/mission-control`)

**API Endpoints Used**:
- POST `/marketing/profiles/:id/launch-campaign` - Launch campaign
- GET `/marketing/profiles/:id/campaigns/:campaignId/state` - Get state
- POST `/marketing/profiles/:id/campaigns/:campaignId/pause` - Pause
- POST `/marketing/profiles/:id/campaigns/:campaignId/resume` - Resume

**Campaign Launch Wizard Steps**:
```
Step 1: Campaign Details
  - Name
  - Duration (days)
  - Mode (full_auto, semi_auto, hybrid)

Step 2: Content Preferences
  - Blog posts quantity
  - Videos quantity
  - Social posts quantity

Step 3: Platform Selection
  - Select target platforms (×9)

Step 4: Budget & Cost Estimate
  - Set budget
  - View cost breakdown
  - ROI projection

Step 5: Review & Launch
  - Review all settings
  - Confirm launch
```

**Wizard Component**:
```tsx
<div className="max-w-4xl mx-auto">
  {/* Progress indicator */}
  <div className="flex items-center justify-between mb-12">
    {steps.map((step, idx) => (
      <>
        <div className={cn(
          "flex flex-col items-center",
          currentStep >= idx ? "opacity-100" : "opacity-40"
        )}>
          <div className={cn(
            "w-10 h-10 flex items-center justify-center border-2 font-mono font-bold",
            currentStep === idx && "border-neon-cyan text-neon-cyan shadow-glow-cyan-sm",
            currentStep > idx && "border-neon-green text-neon-green",
            currentStep < idx && "border-border-emphasis text-text-tertiary"
          )}>
            {currentStep > idx ? <Check /> : idx + 1}
          </div>
          <span className="text-xs text-text-tertiary mt-2 uppercase">
            {step.label}
          </span>
        </div>

        {idx < steps.length - 1 && (
          <div className={cn(
            "flex-1 h-0.5 mx-4",
            currentStep > idx ? "bg-neon-green" : "bg-border-emphasis"
          )} />
        )}
      </>
    ))}
  </div>

  {/* Step content */}
  <div className="panel-data">
    {currentStep === 0 && <Step1CampaignDetails />}
    {currentStep === 1 && <Step2ContentPreferences />}
    {currentStep === 2 && <Step3PlatformSelection />}
    {currentStep === 3 && <Step4BudgetEstimate />}
    {currentStep === 4 && <Step5ReviewLaunch />}
  </div>

  {/* Navigation */}
  <div className="flex justify-between mt-6">
    <CommandButton
      variant="ghost"
      onClick={handleBack}
      disabled={currentStep === 0}
    >
      BACK
    </CommandButton>

    <CommandButton
      onClick={handleNext}
      disabled={!isStepValid(currentStep)}
    >
      {currentStep === steps.length - 1 ? "LAUNCH CAMPAIGN" : "NEXT"}
    </CommandButton>
  </div>
</div>
```

**Campaign Progress Monitor**:
```tsx
// Real-time campaign state (poll every 2 seconds during execution)
<div className="panel-command">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div>
      <h2>{campaign.name}</h2>
      <p className="text-text-tertiary text-sm">
        Launched {formatDistanceToNow(campaign.startedAt)} ago
      </p>
    </div>
    <StatusBadge status={state.phase} />
  </div>

  {/* Overall progress */}
  <div className="mt-8">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-text-tertiary font-mono uppercase">
        OVERALL PROGRESS
      </span>
      <span className="text-2xl font-bold font-mono text-neon-cyan">
        {state.progress}%
      </span>
    </div>
    <div className="h-2 bg-bg-tertiary">
      <div
        className="h-full bg-gradient-to-r from-neon-cyan to-neon-green transition-all duration-500"
        style={{ width: `${state.progress}%` }}
      />
    </div>
  </div>

  {/* Current step */}
  <div className="mt-6 p-4 bg-bg-primary border-l-2 border-neon-cyan">
    <div className="flex items-center gap-3">
      <Loader2 className="w-5 h-5 text-neon-cyan animate-spin" />
      <div>
        <span className="text-xs text-text-tertiary uppercase">
          CURRENT STEP
        </span>
        <p className="font-medium">{state.currentStep}</p>
      </div>
    </div>
  </div>

  {/* Steps checklist */}
  <div className="mt-6 space-y-2">
    {allSteps.map(step => {
      const isCompleted = state.stepsCompleted.includes(step);
      const isCurrent = state.currentStep === step;

      return (
        <div className={cn(
          "flex items-center gap-3 p-3 border-l-2 transition-all",
          isCompleted && "border-neon-green",
          isCurrent && "border-neon-cyan bg-bg-tertiary",
          !isCompleted && !isCurrent && "border-border-default opacity-50"
        )}>
          <div className={cn(
            "w-6 h-6 flex items-center justify-center",
            isCompleted && "text-neon-green",
            isCurrent && "text-neon-cyan animate-command-blink"
          )}>
            {isCompleted ? <CheckCircle /> : <Circle />}
          </div>
          <span className="font-mono text-sm">{step}</span>
        </div>
      );
    })}
  </div>

  {/* Metrics */}
  <div className="mt-8 grid grid-cols-4 gap-4">
    <MetricDisplay
      label="CONTENT CREATED"
      value={state.metrics.contentCreated}
      trend={`+${state.metrics.contentCreated}`}
    />
    <MetricDisplay
      label="CONTENT REPURPOSED"
      value={state.metrics.contentRepurposed}
      trend={`+${state.metrics.contentRepurposed}`}
    />
    <MetricDisplay
      label="CONTENT PUBLISHED"
      value={state.metrics.contentPublished}
      trend={`+${state.metrics.contentPublished}`}
    />
    <MetricDisplay
      label="BUDGET USED"
      value={`$${state.metrics.budgetUsed.toFixed(2)}`}
      subtitle={`$${state.metrics.budgetRemaining.toFixed(2)} remaining`}
    />
  </div>

  {/* Activity log */}
  <div className="mt-8">
    <h3 className="text-sm text-text-tertiary uppercase mb-4">
      ACTIVITY LOG
    </h3>
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {state.logs.map(log => (
        <div className="flex items-start gap-3 text-sm">
          <span className="text-text-tertiary font-mono text-xs">
            {format(log.timestamp, 'HH:mm:ss')}
          </span>
          <div className={cn(
            "w-2 h-2 mt-1.5 rounded-full",
            log.level === 'info' && "bg-neon-cyan",
            log.level === 'warning' && "bg-neon-yellow",
            log.level === 'error' && "bg-neon-magenta"
          )} />
          <span>{log.message}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Actions */}
  <div className="mt-6 flex gap-4">
    {state.phase !== 'completed' && (
      <>
        {state.phase !== 'paused' ? (
          <CommandButton onClick={handlePause}>
            PAUSE CAMPAIGN
          </CommandButton>
        ) : (
          <CommandButton onClick={handleResume}>
            RESUME CAMPAIGN
          </CommandButton>
        )}
      </>
    )}
    <CommandButton variant="ghost" onClick={handleViewResults}>
      VIEW RESULTS
    </CommandButton>
  </div>
</div>
```

**Mission Control Dashboard** (Real-time overview of all campaigns):
```tsx
<div className="grid grid-cols-12 gap-6">
  {/* Header */}
  <div className="col-span-12">
    <h1 className="text-3xl font-bold text-gradient-cyan">
      MISSION CONTROL
    </h1>
    <p className="text-text-tertiary">
      Real-time campaign monitoring and autonomous execution
    </p>
  </div>

  {/* Global stats */}
  <div className="col-span-3">
    <MetricDisplay
      label="ACTIVE CAMPAIGNS"
      value={activeCampaigns.length}
      icon={<Zap className="text-neon-cyan" />}
    />
  </div>
  <div className="col-span-3">
    <MetricDisplay
      label="TOTAL REACH (30D)"
      value={formatNumber(totalReach)}
      trend="+24.7%"
    />
  </div>
  <div className="col-span-3">
    <MetricDisplay
      label="CONTENT PUBLISHED"
      value={totalPublished}
      trend="+156"
    />
  </div>
  <div className="col-span-3">
    <MetricDisplay
      label="TOTAL ROI"
      value={`${totalROI}%`}
      trend="+12.3%"
    />
  </div>

  {/* Active campaigns */}
  <div className="col-span-8">
    <div className="panel-data">
      <h3>ACTIVE CAMPAIGNS</h3>
      <div className="mt-4 space-y-4">
        {activeCampaigns.map(campaign => (
          <CampaignProgressCard campaign={campaign} />
        ))}
      </div>
    </div>
  </div>

  {/* Real-time activity feed */}
  <div className="col-span-4">
    <div className="panel-command">
      <h3>LIVE ACTIVITY</h3>
      <div className="mt-4 space-y-3">
        {activityFeed.map(activity => (
          <div className="flex items-start gap-3 animate-slide-down">
            <div className="w-2 h-2 mt-2 bg-neon-cyan rounded-full animate-glow-pulse" />
            <div>
              <p className="text-sm">{activity.message}</p>
              <span className="text-xs text-text-tertiary font-mono">
                {formatDistanceToNow(activity.timestamp)} ago
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Performance charts */}
  <div className="col-span-12">
    <div className="panel-data">
      <h3>PERFORMANCE OVERVIEW</h3>
      <PerformanceChart data={chartData} />
    </div>
  </div>
</div>
```

**Testing Checklist**:
- [ ] Campaign wizard validates each step
- [ ] Cost calculator displays accurate estimates
- [ ] Launch button starts campaign
- [ ] Campaign state polls every 2 seconds
- [ ] Progress bar updates in real-time
- [ ] Steps checklist shows current progress
- [ ] Metrics update as campaign executes
- [ ] Activity log streams new entries
- [ ] Pause button pauses campaign
- [ ] Resume button resumes campaign
- [ ] Mission control loads all campaigns
- [ ] Real-time activity feed updates
- [ ] Navigation between campaigns works

---

### BATCH 7: PUBLISHING & ANALYTICS

**Objective**: Build publishing queue and cross-platform analytics

**Screens to Build**:
1. Publishing Queue (`/profiles/[id]/publishing`)
2. Content Inventory (`/profiles/[id]/publishing?tab=inventory`)
3. Analytics Dashboard (`/profiles/[id]/analytics`)
4. Platform Performance Comparison

**API Endpoints Used**:
- POST `/marketing/profiles/:id/publish` - Publish content
- GET `/marketing/profiles/:id/publishing-stats` - Publishing stats
- GET `/marketing/profiles/:id/inventory` - Content inventory
- GET `/marketing/profiles/:id/domains` - Tracked domains
- GET `/marketing/profiles/:id/performance` - Cross-platform performance

**Publishing Queue Interface**:
```tsx
<div className="grid grid-cols-12 gap-6">
  {/* Queue header */}
  <div className="col-span-12">
    <div className="flex items-center justify-between">
      <div>
        <h2>PUBLISHING QUEUE</h2>
        <p className="text-text-tertiary text-sm">
          {scheduledCount} scheduled · {publishedCount} published today
        </p>
      </div>
      <CommandButton onClick={handlePublishNow}>
        PUBLISH NOW
      </CommandButton>
    </div>
  </div>

  {/* Filter/sort */}
  <div className="col-span-12">
    <div className="flex items-center gap-4">
      <select className="input-command">
        <option>All Platforms</option>
        <option>Twitter</option>
        <option>LinkedIn</option>
        <option>Facebook</option>
      </select>

      <select className="input-command">
        <option>All Status</option>
        <option>Scheduled</option>
        <option>Published</option>
        <option>Failed</option>
      </select>

      <div className="flex-1" />

      <button className="btn-command">
        CALENDAR VIEW
      </button>
    </div>
  </div>

  {/* Queue list */}
  <div className="col-span-12">
    <div className="panel-data">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-emphasis">
            <th className="text-left p-4 text-xs text-text-tertiary uppercase font-mono">
              Content
            </th>
            <th className="text-left p-4 text-xs text-text-tertiary uppercase font-mono">
              Platform
            </th>
            <th className="text-left p-4 text-xs text-text-tertiary uppercase font-mono">
              Scheduled For
            </th>
            <th className="text-left p-4 text-xs text-text-tertiary uppercase font-mono">
              Status
            </th>
            <th className="text-right p-4 text-xs text-text-tertiary uppercase font-mono">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {queueItems.map(item => (
            <tr className="border-b border-border-default hover:bg-bg-elevated transition-colors group">
              <td className="p-4">
                <div>
                  <p className="font-medium line-clamp-1">{item.title}</p>
                  <p className="text-sm text-text-tertiary line-clamp-2">
                    {item.content}
                  </p>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={item.platform} />
                  <span className="text-sm">{item.platform}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="text-sm font-mono">
                  <div>{format(item.scheduledFor, 'MMM dd, yyyy')}</div>
                  <div className="text-text-tertiary">
                    {format(item.scheduledFor, 'HH:mm')}
                  </div>
                </div>
              </td>
              <td className="p-4">
                <StatusBadge status={item.status} />
              </td>
              <td className="p-4">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-bg-tertiary">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-bg-tertiary">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-bg-tertiary text-neon-magenta">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
```

**Analytics Dashboard**:
```tsx
<div className="grid grid-cols-12 gap-6">
  {/* Time range selector */}
  <div className="col-span-12">
    <div className="flex items-center gap-4">
      <select className="input-command">
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Last 90 days</option>
        <option>All time</option>
      </select>
    </div>
  </div>

  {/* Key metrics */}
  <div className="col-span-3">
    <div className="panel-data">
      <MetricDisplay
        label="TOTAL REACH"
        value={formatNumber(analytics.totalReach)}
        trend="+24.7%"
        chart={<SparklineChart data={reachData} />}
      />
    </div>
  </div>
  <div className="col-span-3">
    <div className="panel-data">
      <MetricDisplay
        label="ENGAGEMENT"
        value={formatNumber(analytics.totalEngagement)}
        trend="+18.3%"
        chart={<SparklineChart data={engagementData} />}
      />
    </div>
  </div>
  <div className="col-span-3">
    <div className="panel-data">
      <MetricDisplay
        label="CONVERSIONS"
        value={analytics.totalConversions}
        trend="+31.2%"
        chart={<SparklineChart data={conversionsData} />}
      />
    </div>
  </div>
  <div className="col-span-3">
    <div className="panel-data">
      <MetricDisplay
        label="AVG ENGAGEMENT RATE"
        value={`${analytics.avgEngagementRate}%`}
        trend="+2.1%"
      />
    </div>
  </div>

  {/* Performance chart */}
  <div className="col-span-8">
    <div className="panel-data">
      <h3>PERFORMANCE TREND</h3>
      <PerformanceChart
        data={analytics.performanceTrend}
        metrics={['reach', 'engagement', 'conversions']}
      />
    </div>
  </div>

  {/* Top platforms */}
  <div className="col-span-4">
    <div className="panel-data">
      <h3>TOP PLATFORMS</h3>
      <div className="mt-4 space-y-4">
        {analytics.platformComparison.map((platform, idx) => (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-text-tertiary">
                  {idx + 1}
                </span>
                <PlatformIcon platform={platform.platform} />
                <span className="font-medium">{platform.platform}</span>
              </div>
              <span className="font-mono font-bold text-neon-cyan">
                {formatNumber(platform.reach)}
              </span>
            </div>
            <div className="h-1 bg-bg-tertiary">
              <div
                className="h-full bg-neon-cyan"
                style={{
                  width: `${(platform.reach / analytics.totalReach) * 100}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-text-tertiary">
              <span>Engagement: {platform.engagementRate.toFixed(1)}%</span>
              <span>Conversion: {platform.conversionRate.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Content performance table */}
  <div className="col-span-12">
    <div className="panel-data">
      <h3>TOP PERFORMING CONTENT</h3>
      <table className="w-full mt-4">
        <thead>
          <tr className="border-b border-border-emphasis">
            <th className="text-left p-4 text-xs text-text-tertiary uppercase">Title</th>
            <th className="text-left p-4 text-xs text-text-tertiary uppercase">Platform</th>
            <th className="text-right p-4 text-xs text-text-tertiary uppercase">Reach</th>
            <th className="text-right p-4 text-xs text-text-tertiary uppercase">Engagement</th>
            <th className="text-right p-4 text-xs text-text-tertiary uppercase">Conversions</th>
            <th className="text-right p-4 text-xs text-text-tertiary uppercase">ROI</th>
          </tr>
        </thead>
        <tbody>
          {topContent.map(content => (
            <tr className="border-b border-border-default hover:bg-bg-elevated">
              <td className="p-4">
                <p className="font-medium line-clamp-1">{content.title}</p>
                <p className="text-xs text-text-tertiary">
                  {format(content.publishedAt, 'MMM dd, yyyy')}
                </p>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={content.platform} size="sm" />
                  <span className="text-sm">{content.platform}</span>
                </div>
              </td>
              <td className="p-4 text-right font-mono">
                {formatNumber(content.reach)}
              </td>
              <td className="p-4 text-right font-mono">
                {formatNumber(content.engagement)}
              </td>
              <td className="p-4 text-right font-mono">
                {content.conversions}
              </td>
              <td className="p-4 text-right">
                <span className="text-neon-green font-mono font-bold">
                  +{content.roi}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
```

**Testing Checklist**:
- [ ] Publishing queue loads scheduled posts
- [ ] Filter/sort works correctly
- [ ] Publish now button works
- [ ] Edit modal opens for queue items
- [ ] Delete confirmation works
- [ ] Analytics dashboard loads data
- [ ] Time range selector updates charts
- [ ] Performance chart renders correctly
- [ ] Platform comparison accurate
- [ ] Top content table sorts by performance
- [ ] Sparkline charts render
- [ ] Export analytics button works

---

### BATCH 8: POLISH & OPTIMIZATION

**Objective**: Add final touches, loading states, error handling, and optimizations

**Tasks**:
1. Comprehensive loading states for all async operations
2. Error boundaries and error handling
3. Toast notifications for all actions
4. Keyboard shortcuts
5. Responsive design refinement
6. Performance optimization
7. Accessibility improvements
8. SEO optimization

**Loading States**:
```tsx
// Global loading component
<div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="panel-command">
    <div className="flex items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-2 border-neon-cyan border-t-transparent animate-spin" />
        <div className="absolute inset-2 border-2 border-neon-purple border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
      </div>
      <div>
        <h3 className="font-mono uppercase">PROCESSING</h3>
        <p className="text-text-tertiary text-sm">{loadingMessage}</p>
      </div>
    </div>
  </div>
</div>

// Skeleton loaders
<div className="panel-data">
  <div className="animate-pulse">
    <div className="h-6 bg-bg-tertiary w-1/3 mb-4" />
    <div className="h-4 bg-bg-tertiary w-full mb-2" />
    <div className="h-4 bg-bg-tertiary w-5/6 mb-2" />
    <div className="h-4 bg-bg-tertiary w-4/6" />
  </div>
</div>
```

**Error Handling**:
```tsx
// Error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="panel-command border-l-neon-magenta">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-neon-magenta" />
            <div>
              <h3 className="text-neon-magenta">SYSTEM ERROR</h3>
              <p className="text-text-secondary mt-2">
                {this.state.error.message}
              </p>
              <CommandButton
                className="mt-4"
                onClick={() => this.setState({ hasError: false })}
              >
                RETRY
              </CommandButton>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// API error handling
const handleApiError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    toast.error('AUTHENTICATION FAILED', {
      description: 'Session expired. Please log in again.',
    });
    router.push('/login');
  } else if (error.response?.status === 403) {
    toast.error('ACCESS DENIED', {
      description: 'Insufficient permissions.',
    });
  } else if (error.response?.status === 429) {
    toast.error('RATE LIMIT EXCEEDED', {
      description: 'Too many requests. Please try again later.',
    });
  } else {
    toast.error('OPERATION FAILED', {
      description: error.message || 'An unexpected error occurred.',
    });
  }
};
```

**Toast Notifications**:
```tsx
// Custom toast component
<Toaster
  position="bottom-right"
  toastOptions={{
    className: 'panel-command',
    style: {
      background: 'var(--bg-secondary)',
      border: '2px solid var(--neon-cyan)',
      color: 'var(--text-primary)',
    },
    success: {
      icon: <CheckCircle className="text-neon-green" />,
      style: {
        borderColor: 'var(--neon-green)',
      },
    },
    error: {
      icon: <XCircle className="text-neon-magenta" />,
      style: {
        borderColor: 'var(--neon-magenta)',
      },
    },
  }}
/>

// Usage
toast.success('CAMPAIGN LAUNCHED', {
  description: 'Autonomous execution in progress...',
});
```

**Keyboard Shortcuts**:
```tsx
// Global shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K = Command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(true);
    }

    // Cmd/Ctrl + N = New profile
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      router.push('/profiles/new');
    }

    // Cmd/Ctrl + / = Toggle sidebar
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault();
      toggleSidebar();
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Responsive Design**:
```tsx
// Mobile nav
<div className="lg:hidden">
  <button
    className="btn-command"
    onClick={() => setMobileNavOpen(true)}
  >
    <Menu />
  </button>
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* ... */}
</div>

// Mobile-optimized metric display
<div className="panel-data">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <span className="text-xs text-text-tertiary">TOTAL REACH</span>
    <span className="text-2xl sm:text-3xl font-bold font-mono">
      2,547,892
    </span>
  </div>
</div>
```

**Performance Optimizations**:
```tsx
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Memoized expensive components
const MemoizedChart = memo(PerformanceChart);

// Virtualized lists for large datasets
<VirtualizedList
  items={allPosts}
  itemHeight={80}
  renderItem={(post) => <PostCard post={post} />}
/>

// Code splitting
const MissionControl = lazy(() => import('./mission-control/page'));
const Analytics = lazy(() => import('./analytics/page'));
```

**Accessibility**:
```tsx
// ARIA labels
<button
  className="btn-command"
  aria-label="Launch autonomous campaign"
  aria-describedby="campaign-description"
>
  LAUNCH CAMPAIGN
</button>

// Focus management
useEffect(() => {
  if (modalOpen) {
    firstInputRef.current?.focus();
  }
}, [modalOpen]);

// Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  {/* ... */}
</div>
```

**Testing Checklist**:
- [ ] All loading states display correctly
- [ ] Error boundaries catch and display errors
- [ ] Toast notifications work for all actions
- [ ] Keyboard shortcuts functional
- [ ] Mobile responsive on all screens
- [ ] Performance metrics acceptable (Lighthouse > 90)
- [ ] Accessibility audit passes (WCAG AA)
- [ ] All interactions have feedback
- [ ] Optimistic UI updates work
- [ ] Offline handling graceful

---

## 📋 PART 4: QUALITY GATES & VALIDATION

### Pre-Launch Checklist

**Functionality**:
- [ ] All 40+ API endpoints integrated
- [ ] All forms validate correctly
- [ ] All buttons have onClick handlers
- [ ] All links navigate correctly
- [ ] All modals open/close properly
- [ ] All tabs switch correctly
- [ ] All dropdowns populate
- [ ] All tooltips display
- [ ] All notifications trigger
- [ ] All real-time updates work

**Data Flow**:
- [ ] Profile CRUD operations work
- [ ] Platform connections authenticated
- [ ] OAuth flows complete successfully
- [ ] Landscape analysis generates
- [ ] Strategy generation works
- [ ] Content repurposing creates outputs
- [ ] Campaign launches execute
- [ ] Publishing queue schedules
- [ ] Analytics fetch correctly
- [ ] Real-time polling works

**Design**:
- [ ] All colors match design tokens
- [ ] Typography consistent throughout
- [ ] Spacing follows 4px grid
- [ ] Animations run at 60fps
- [ ] Glow effects render correctly
- [ ] No rounded corners (except specific elements)
- [ ] Sharp angles on panels
- [ ] Command UI style consistent
- [ ] Dark mode works everywhere
- [ ] Brand identity clear

**Performance**:
- [ ] Initial page load < 3s
- [ ] Time to interactive < 5s
- [ ] Lighthouse performance > 90
- [ ] No layout shifts
- [ ] Images optimized
- [ ] Code split effectively
- [ ] API calls batched
- [ ] Real-time updates efficient
- [ ] Memory usage reasonable
- [ ] No console errors

**Accessibility**:
- [ ] All images have alt text
- [ ] All buttons have ARIA labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA
- [ ] Screen reader compatible
- [ ] Form labels associated
- [ ] Error messages clear
- [ ] Skip navigation links
- [ ] Semantic HTML used

**Responsive**:
- [ ] Mobile (375px) works
- [ ] Tablet (768px) works
- [ ] Desktop (1440px) works
- [ ] Ultra-wide (1920px+) works
- [ ] Touch targets minimum 44px
- [ ] Text readable on small screens
- [ ] Navigation accessible on mobile
- [ ] Tables scroll horizontally
- [ ] Modals fit viewport
- [ ] Charts responsive

---

## 🎯 PART 5: EXECUTION SUMMARY

### What Gets Built:

**8 Core Screens**:
1. Profile List & Overview
2. Platform Connections Dashboard
3. Strategy & Analysis
4. Content Repurposing Studio
5. Campaign Launch Wizard
6. Campaign Progress Monitor
7. Publishing Queue & Inventory
8. Analytics Dashboard

**50+ Components**:
- 10+ Command UI components
- 15+ Profile components
- 10+ Connection components
- 8+ Strategy components
- 12+ Content components
- 10+ Campaign components
- 8+ Analytics components
- 5+ Layout components

**Complete API Integration**:
- 40+ endpoint integrations
- Real-time WebSocket connections
- OAuth flow implementations
- Error handling for all calls
- Retry logic for failures
- Loading states for all async ops

**State Management**:
- Profile store
- Campaign store
- UI store
- React Query cache
- Local storage persistence

**Design System**:
- Custom Tailwind config
- 100+ design tokens
- 20+ animations
- Glow effect system
- Command UI patterns

### Timeline Estimate:

**Batch 1 (Design System)**: 4-6 hours
**Batch 2 (Profiles)**: 6-8 hours
**Batch 3 (Connections)**: 8-10 hours
**Batch 4 (Strategy)**: 6-8 hours
**Batch 5 (Content)**: 8-10 hours
**Batch 6 (Campaigns)**: 10-12 hours
**Batch 7 (Publishing/Analytics)**: 8-10 hours
**Batch 8 (Polish)**: 6-8 hours

**Total**: 56-72 hours of focused development

---

## 🚀 NEXT STEPS

1. **Review & Approve Plan**: Confirm this approach matches vision
2. **Execute Batch 1**: Establish design foundation
3. **Test & Validate**: Ensure design tokens work correctly
4. **Execute Batches 2-8**: Build features sequentially
5. **Quality Gates**: Validate each batch before proceeding
6. **Final Polish**: Optimize and refine
7. **Deploy**: Launch to production

---

**This plan ensures**:
- ✅ Zero missed interactions
- ✅ Every button functional
- ✅ Complete routing
- ✅ Unique brand identity
- ✅ No basic design patterns
- ✅ Full end-to-end workflows
- ✅ All 40+ endpoints integrated
- ✅ Real-time updates working
- ✅ Production-ready quality

**Ready to execute? Let's build this.**
