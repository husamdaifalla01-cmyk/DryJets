# DryJets Design Vision — "Precision OS"

**Version:** 2.0 (Complete Redesign)
**Date:** October 19, 2025
**Status:** In Development

---

## Executive Summary

DryJets is transforming from a functional laundromat management platform into a **world-class enterprise SaaS product** that competes with and surpasses CleanCloud, LinenTech, and legacy ERP systems.

This redesign focuses on creating an **authentically premium, meticulously crafted** user experience that feels like it was designed by a world-class product team—not assembled from templates.

---

## Design Philosophy

### 1. **Precision Over Flash**
- Eliminate gratuitous gradients and neon glows
- Use color **strategically** for meaning, not decoration
- Every pixel serves a purpose
- Whitespace is a design element, not empty space

### 2. **Enterprise-Grade Polish**
- Feels like a $50,000+/year enterprise tool
- UI that earns trust immediately
- Professional, confident, timeless
- Not playful—serious but approachable

### 3. **Contextual Intelligence**
- UI adapts to user context and workflow
- Information architecture prioritizes task completion
- Every action has clear visual feedback
- Progressive disclosure—show what matters, hide complexity

### 4. **Motion with Purpose**
- No animation for animation's sake
- Motion clarifies relationships and transitions
- Subtle, fast, responsive (60fps)
- Enhances comprehension, doesn't distract

### 5. **Authentic Identity**
- Not a Linear clone, not a Stripe clone
- DryJets has its own visual language
- Industrial elegance meets digital precision
- Reflects the craft of professional laundry services

---

## Visual Direction

### Color Strategy

**BEFORE (Current):**
- Overuse of gradients (purple-blue-cyan everywhere)
- Neon glows on everything
- Too many colors competing for attention
- Feels like a gaming dashboard, not enterprise SaaS

**AFTER (New Vision):**

#### Primary Palette — "Industrial Precision"
```
Base Colors (Strategic use only):
- Primary Action: #0066FF (Pure Blue, no gradients by default)
- Success State: #00A86B (Kelly Green)
- Warning State: #FF9500 (Amber)
- Critical State: #FF3B30 (Apple Red)
- Accent/Premium: #6366F1 (Indigo, for premium features only)
```

#### Neutral Foundation — "Polished Steel"
```
Light Mode:
- Background: #FFFFFF
- Surface: #F8F9FA
- Surface Elevated: #FFFFFF + shadow
- Border: #E5E7EB
- Border Subtle: #F3F4F6
- Text Primary: #111827
- Text Secondary: #6B7280
- Text Tertiary: #9CA3AF

Dark Mode (Control Center):
- Background: #0A0A0B (Near black, not navy)
- Surface: #161618
- Surface Elevated: #1E1E21
- Border: #2A2A2D
- Border Subtle: #1A1A1D
- Text Primary: #FAFAFA
- Text Secondary: #A1A1A6
- Text Tertiary: #636366
```

#### Semantic Colors
```
Status Colors (subtle, not neon):
- Online/Operational: #10B981 (Emerald)
- Processing/Syncing: #3B82F6 (Blue)
- Warning/Attention: #F59E0B (Amber)
- Error/Offline: #EF4444 (Red)
- Neutral/Inactive: #9CA3AF (Gray)
```

### Typography System

**Font Stack:**
```css
--font-display: 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Monaco, monospace;
```

**Type Scale (Precise, not arbitrary):**
```
Display (Hero sections):
- 5xl: 48px / 56px / -0.02em / 700
- 4xl: 36px / 44px / -0.01em / 700

Headings:
- 3xl: 30px / 38px / -0.01em / 600
- 2xl: 24px / 32px / -0.01em / 600
- xl: 20px / 28px / -0.01em / 600
- lg: 18px / 26px / 0 / 600

Body:
- base: 15px / 22px / 0 / 400 (Primary body text)
- sm: 14px / 20px / 0 / 400
- xs: 13px / 18px / 0 / 400
- 2xs: 12px / 16px / 0 / 500 (Labels, metadata)
```

**Typography Rules:**
- Tight letter spacing on large headings (-0.02em)
- Regular weight (400) for body, medium (500) for UI labels, semibold (600) for headings
- Line height: 1.5 for body, tighter for headings
- No ALL CAPS except for tiny labels (10-11px utility labels)

### Spacing & Layout

**8pt Grid System (Strict adherence):**
```
Space tokens (rem):
- 0: 0
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 5: 1.25rem (20px)
- 6: 1.5rem (24px)
- 8: 2rem (32px)
- 10: 2.5rem (40px)
- 12: 3rem (48px)
- 16: 4rem (64px)
- 20: 5rem (80px)
- 24: 6rem (96px)
```

**Layout Rules:**
- Max content width: 1440px (centered)
- Sidebar: 240px expanded, 64px collapsed
- Header: 56px height
- Cards: 16px padding (compact), 24px (default), 32px (spacious)
- Section spacing: 48px vertical, 32px horizontal

### Border Radius

**Subtle, not pill-shaped:**
```
- xs: 4px (Badges, small buttons)
- sm: 6px (Inputs, small cards)
- md: 8px (Default - buttons, cards)
- lg: 12px (Large cards, modals)
- xl: 16px (Hero cards, page-level surfaces)
- full: 9999px (Avatars, status dots only)
```

**No 2xl rounded corners** - too playful for enterprise.

### Shadows & Elevation

**Subtle, not dramatic:**
```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

**Colored shadows (use sparingly):**
- Only on interactive elements in hover/focus state
- Opacity: 0.15 max
- Example: `0 0 0 3px rgba(0, 102, 255, 0.1)` for focus rings

### Motion Design

**Principles:**
1. **Fast and responsive** - Nothing over 300ms
2. **Natural easing** - cubic-bezier curves, never linear
3. **Purpose-driven** - Animation clarifies, doesn't distract

**Duration Tokens:**
```
- instant: 0ms (no transition, immediate)
- fast: 150ms (hover states, simple transitions)
- base: 200ms (default for most UI)
- slow: 300ms (page transitions, complex animations)
- slower: 500ms (rare, only for storytelling moments)
```

**Easing Curves:**
```
- ease-out: cubic-bezier(0, 0, 0.2, 1) // Default for enter animations
- ease-in: cubic-bezier(0.4, 0, 1, 1) // Exit animations
- ease-in-out: cubic-bezier(0.4, 0, 0.2, 1) // Transitions
- spring: cubic-bezier(0.34, 1.56, 0.64, 1) // Playful interactions (use sparingly)
```

**Animation Patterns:**
```typescript
// Fade in (default for content)
opacity: 0 → 1
duration: 200ms
easing: ease-out

// Slide up (cards, modals)
transform: translateY(8px) → translateY(0)
opacity: 0 → 1
duration: 200ms
easing: ease-out

// Scale in (popovers, tooltips)
transform: scale(0.95) → scale(1)
opacity: 0 → 1
duration: 150ms
easing: ease-out

// Hover lift (interactive cards)
transform: translateY(0) → translateY(-2px)
box-shadow: sm → md
duration: 150ms
easing: ease-out
```

---

## Component Design Principles

### Buttons

**BEFORE:**
- Gradient backgrounds everywhere
- Neon glow shadows
- Too many variants

**AFTER:**
```
Primary: Solid blue (#0066FF), white text, subtle shadow, 8px radius
Secondary: Transparent bg, blue text, blue border, no shadow
Ghost: Transparent bg, gray text, hover state gray bg
Danger: Solid red, white text
Success: Solid green, white text

Sizes:
- xs: 28px height, 12px/16px padding, 13px text
- sm: 32px height, 12px/20px padding, 14px text
- md: 36px height, 16px/24px padding, 15px text (default)
- lg: 40px height, 16px/28px padding, 15px text

States:
- Default: shadow-sm
- Hover: shadow-md, translateY(-1px), brightness(110%)
- Active: shadow-none, translateY(0), brightness(95%)
- Disabled: opacity 50%, cursor not-allowed
- Focus: 3px blue ring (ring-offset-2)
```

### Cards

**BEFORE:**
- Dark navy backgrounds (#1E2329)
- Neon borders
- Inconsistent padding

**AFTER:**
```
Background: Surface color (light: white, dark: #161618)
Border: 1px solid border color (#E5E7EB light, #2A2A2D dark)
Radius: 8px (default), 12px (large cards)
Padding: 24px (default), 16px (compact), 32px (spacious)
Shadow: shadow-sm (default), shadow-md (elevated, hover)

Hover state (interactive cards):
- Shadow: sm → md
- Border: border → border-gray-300
- Transform: translateY(-2px)
- Transition: 150ms ease-out

No gradient backgrounds unless specific data visualization needs
```

### Inputs & Forms

**AFTER:**
```
Height: 36px (md), 32px (sm), 40px (lg)
Background: Surface color
Border: 1px solid border color
Radius: 6px
Padding: 12px 16px
Font: 15px regular

States:
- Default: border-gray-300, shadow-none
- Hover: border-gray-400
- Focus: border-blue-500, ring-4 ring-blue-500/10
- Error: border-red-500, ring-4 ring-red-500/10
- Disabled: bg-gray-100, text-gray-400, cursor-not-allowed

Label: 14px medium, text-gray-700, mb-2
Helper text: 13px regular, text-gray-500, mt-1
Error text: 13px medium, text-red-600, mt-1
```

### Badges

**BEFORE:**
- Loud colors, thick borders
- Overused

**AFTER:**
```
Sizes:
- sm: 20px height, 8px/10px padding, 12px text (uppercase, 500 weight)
- md: 24px height, 10px/12px padding, 13px text

Variants:
- Default: gray-100 bg, gray-700 text, no border
- Primary: blue-50 bg, blue-700 text
- Success: green-50 bg, green-700 text
- Warning: amber-50 bg, amber-700 text
- Error: red-50 bg, red-700 text
- Outline: transparent bg, border, colored text

Use sparingly - not every status needs a badge
```

### Data Visualization

**Charts:**
- Clean, minimal axis lines
- Subtle grid lines (#F3F4F6)
- Bold data lines/bars (2-3px stroke)
- Color palette: Blue (primary data), Green (positive), Red (negative), Gray (neutral)
- No gradients in charts (solid fills)
- Tooltips: white bg, shadow-lg, 8px radius, 12px padding

**KPI Cards:**
- Primary metric: 36px bold
- Label: 14px medium, text-gray-600
- Change indicator: 14px semibold, with icon (↑↓)
- Trend sparkline: subtle, gray, 1px stroke
- No background gradients—use border-left accent color instead

---

## Page Layouts

### Dashboard Layout

**Structure:**
```
┌─────────────────────────────────────────────────┐
│ Sidebar (240px)   │ Main Content              │
│                   │                             │
│ [Logo]            │ ┌─────────────────────────┐│
│                   │ │ Header (56px)           ││
│ Navigation        │ │ [Search] [Notifications]││
│ - Dashboard       │ └─────────────────────────┘│
│ - Orders          │                             │
│ - Equipment       │ ┌─────────────────────────┐│
│ - Analytics       │ │ Page Content            ││
│ - Settings        │ │ [Page Title]            ││
│                   │ │                         ││
│                   │ │ [Content Grid]          ││
│                   │ │                         ││
│ [User Menu]       │ │                         ││
└─────────────────────────────────────────────────┘
```

**Header:**
- 56px height, white bg (light), dark-surface (dark)
- Border bottom: 1px solid border-color
- Left: Page title (20px semibold)
- Right: Search (⌘K), Notifications (bell), Network status, User menu

**Sidebar:**
- 240px expanded, 64px collapsed
- Background: surface color (not darker than main)
- Border right: 1px solid border-color
- Logo: 48px height
- Nav items: 40px height, 8px radius, 12px padding
- Active state: bg-blue-50, text-blue-700, 3px left border-blue-600
- Hover: bg-gray-100
- Collapse toggle: bottom of sidebar

**Content Area:**
- Max width: 1200px, centered
- Padding: 32px horizontal, 24px vertical
- Section spacing: 48px vertical

---

## Navigation Patterns

### Command Bar (⌘K)

**Inspiration: Linear, Raycast, GitHub**

**Trigger:**
- Keyboard: Cmd+K (Mac), Ctrl+K (Windows)
- Click: Search input in header

**Design:**
```
- Modal overlay: backdrop-blur-sm, bg-black/50
- Panel: 600px width, centered, shadow-2xl
- Input: 48px height, 16px text, no border
- Results: grouped by category, 40px height per item
- Keyboard navigation: arrow keys, enter to select
- Icon + Label + Keyboard shortcut (right-aligned)
- Recent searches, quick actions, global search
```

### Right Panel (Quick Actions)

**Trigger:**
- Floating action button (bottom-right)
- Keyboard: Cmd+Shift+A

**Design:**
```
- Slide in from right
- 400px width
- Full height
- Create order, send invoice, schedule maintenance, etc.
- Form fields inline, submit at bottom
```

---

## Dark Mode Strategy

**Default:** Dark mode by default for "Control Center" aesthetic
**Toggle:** System preference + manual override

**Light mode:** Optional, for users who prefer it (full support)

**Implementation:**
- CSS variables for all colors
- `data-theme="light"` or `data-theme="dark"` on `<html>`
- No separate class names—seamless switching

---

## Accessibility Standards

- WCAG 2.1 Level AA minimum
- All interactive elements: 44x44px minimum touch target
- Color contrast: 4.5:1 for text, 3:1 for UI elements
- Keyboard navigation: all actions accessible
- Focus indicators: visible 3px ring on all interactive elements
- Screen reader labels: aria-label on all icon-only buttons
- Semantic HTML: proper heading hierarchy, landmark regions

---

## Performance Goals

- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: 95+ (Performance, Accessibility, Best Practices)
- Bundle size: <500kb (initial JS), code splitting for routes
- All animations: 60fps (use transform/opacity only, no layout thrashing)

---

## Design System Naming Convention

**Component Structure:**
```
/components
  /ui (atomic components)
    /button
      Button.tsx
      Button.stories.tsx
      Button.test.tsx
    /card
    /input
    /badge
  /layout (layout components)
    /sidebar
    /header
    /command-bar
  /modules (domain components)
    /orders
      OrderCard.tsx
      OrderList.tsx
      OrderDetail.tsx
    /equipment
    /analytics
```

**Component API Consistency:**
```typescript
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  children?: ReactNode
  // ... specific props
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
✅ Design tokens v2 (colors, typography, spacing)
✅ Base components (Button, Card, Input, Badge)
✅ Layout system (Sidebar, Header, Container)

### Phase 2: Navigation (Week 2)
- Command Bar (⌘K)
- Right panel (quick actions)
- Enhanced sidebar with keyboard shortcuts

### Phase 3: Dashboard Redesign (Week 3)
- KPI cards redesign
- Chart components
- Real-time data widgets

### Phase 4: Module Pages (Week 4-6)
- Orders module redesign
- Equipment module redesign
- Analytics module redesign

### Phase 5: Advanced Features (Week 7-8)
- Notifications system
- Settings panels
- User management

### Phase 6: Polish & Documentation (Week 9-10)
- Micro-interactions
- Motion refinement
- Storybook documentation
- Design system guide

---

## Success Metrics

**User Experience:**
- Task completion time: -40% vs current
- User satisfaction: 9+ NPS score
- Support tickets (UI confusion): -60%

**Performance:**
- Page load: <2s (was 3-4s)
- Interaction latency: <100ms
- Lighthouse: 95+ (all categories)

**Business:**
- Customer perception: "Enterprise-grade"
- Sales cycle: -30% (demo to close)
- Churn: -20% (better retention)

---

## Inspiration Board

**Reference Products:**
- Linear (navigation, command bar, polish)
- Stripe Dashboard (data density, clarity)
- Notion (smooth interactions, hierarchy)
- Apple Developer Portal (premium feel)
- Figma (canvas interactions, precision)
- Vercel Dashboard (minimalism, speed)

**Not Copying, But Learning From:**
- Typography systems (Inter Tight, precision)
- Spacing discipline (8pt grid)
- Color restraint (less is more)
- Motion purpose (enhance, don't distract)

---

## Brand Personality

**DryJets feels:**
- Professional, not playful
- Confident, not flashy
- Efficient, not cluttered
- Modern, not trendy
- Trustworthy, not salesy

**DryJets is NOT:**
- A gaming dashboard (no neon everywhere)
- A startup MVP (no corners cut)
- A template (authentic, custom)
- Boring (delightful micro-interactions)

---

## Final Note

This redesign is about **earning trust through craft**. Every pixel, every transition, every color choice should signal to users: "This product was made by people who care about excellence."

We're building software that merchants will use every day, all day. It needs to feel like a **trusted partner**, not just a tool.

Let's make DryJets unmistakably **world-class**.
