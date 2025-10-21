# Migration Guide: v1 → v2 Design System

**Version:** 2.0
**Date:** October 19, 2025
**Status:** Ready for gradual migration

---

## Overview

This guide helps you migrate from the current design system (v1) to the new "Precision OS" design system (v2). The migration is **non-breaking** — v2 components coexist with v1, allowing gradual adoption.

---

## Philosophy Changes

### Before (v1): Industrial Control Panel
- Dark navy backgrounds by default
- Neon glows and gradients everywhere
- Gaming/hacker aesthetic
- Flash over function

### After (v2): Enterprise Precision
- Light backgrounds by default (white/light gray)
- Solid colors, subtle shadows
- Professional, timeless aesthetic
- Function over flash

---

## Component Migration

### 1. Button Component

#### v1 (Current)
```tsx
import { Button } from '@/components/ui/button';

<Button className="bg-gradient-to-r from-blue-600 to-cyan-600 shadow-glow-primary">
  Save Changes
</Button>
```

#### v2 (New)
```tsx
import { Button } from '@/components/ui/button-v2';

<Button variant="primary" size="md">
  Save Changes
</Button>

// With icon
<Button variant="primary" iconBefore={<Save className="h-4 w-4" />}>
  Save Changes
</Button>

// Loading state
<Button variant="primary" loading>
  Saving...
</Button>
```

#### Migration Steps
1. Change import from `button` to `button-v2`
2. Remove `className` for gradients/glows
3. Use `variant` prop instead: `primary`, `secondary`, `ghost`, `danger`, `success`, `outline`, `link`
4. Use `size` prop: `xs`, `sm`, `md`, `lg`
5. Use `iconBefore`/`iconAfter` for icons
6. Use `loading` prop for loading state

#### Size Changes
- v1: 40px (md), 48px (lg) → v2: 32px (sm), 36px (md), 40px (lg)
- Smaller by default for modern feel

---

### 2. Card Component

#### v1 (Current)
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card className="bg-[#1E2329] border-2 border-blue-500/20">
  <CardHeader>
    <CardTitle>Analytics</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### v2 (New)
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardDivider,
} from '@/components/ui/card-v2';

<Card variant="default" padding="default">
  <CardHeader>
    <CardTitle size="md">Analytics</CardTitle>
    <CardDescription>Key metrics overview</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button variant="ghost" size="sm">View More</Button>
  </CardFooter>
</Card>
```

#### Migration Steps
1. Change import from `card` to `card-v2`
2. Remove dark background classes (`bg-[#1E2329]`)
3. Remove colored borders (`border-blue-500/20`)
4. Use `variant` prop: `default`, `elevated`, `interactive`, `outline`, `ghost`
5. Use `padding` prop: `none`, `compact`, `default`, `spacious`
6. Add `CardDescription` for subtitle
7. Use `CardDivider` for visual separation
8. Use `CardFooter` for actions

#### Key Changes
- Background: Dark navy → White (light mode) / Near-black (dark mode)
- Borders: Colored/thick → Neutral/1px
- Shadow: None/neon glow → Subtle elevation

---

### 3. Badge Component

#### v1 (Current)
```tsx
import { Badge } from '@/components/ui/badge';

<Badge className="bg-blue-500/10 text-blue-700 border-2 border-blue-500/20">
  New Feature
</Badge>
```

#### v2 (New)
```tsx
import { Badge } from '@/components/ui/badge-v2';

<Badge variant="primary" size="md">
  New Feature
</Badge>

// With status dot
<Badge variant="success" showDot>
  Online
</Badge>

// Pill shape
<Badge variant="accent" pill>
  Pro
</Badge>
```

#### Migration Steps
1. Change import from `badge` to `badge-v2`
2. Remove `className` for colors/borders
3. Use `variant` prop: `default`, `primary`, `success`, `warning`, `danger`, `accent`, `outline`
4. Use `size` prop: `sm`, `md`
5. Use `showDot` for status indicator
6. Use `pill` for rounded shape

#### Key Changes
- Colors: Loud/neon → Subtle backgrounds
- Borders: Thick colored → None (or thin neutral for outline variant)
- Use sparingly: Not every status needs a badge

---

### 4. Input Component

#### v1 (Current)
```tsx
import { Input } from '@/components/ui/input';

<div>
  <label>Email</label>
  <Input type="email" placeholder="Enter email" />
</div>
```

#### v2 (New)
```tsx
import { Input, FormField } from '@/components/ui/input-v2';
import { Mail } from 'lucide-react';

// Simple usage
<FormField
  label="Email Address"
  required
  helperText="We'll never share your email"
>
  <Input
    type="email"
    placeholder="Enter your email"
    iconBefore={<Mail className="h-4 w-4" />}
  />
</FormField>

// With error state
<FormField
  label="Password"
  error="Password must be at least 8 characters"
>
  <Input
    type="password"
    variant="error"
    placeholder="Enter password"
  />
</FormField>

// Textarea
<FormField label="Description">
  <Textarea placeholder="Enter description..." rows={4} />
</FormField>
```

#### Migration Steps
1. Change import from `input` to `input-v2`
2. Wrap in `FormField` component for label/error/helper text
3. Use `variant` prop for validation states: `default`, `error`, `success`
4. Use `inputSize` prop: `sm`, `md`, `lg`
5. Use `iconBefore`/`iconAfter` for icons
6. Use `Textarea` for multi-line input

#### New Components
- `FormField`: Wrapper with label, error, helper text
- `Label`: Standalone label with required indicator
- `HelperText`: Gray helper text below input
- `ErrorText`: Red error message
- `Textarea`: Multi-line text input

---

## Color System Migration

### v1 Colors → v2 Colors

| v1 | v2 | Usage |
|----|----|----|
| `#0A78FF` (primary with gradients) | `#0066FF` (solid) | Primary actions |
| `#00B7A5` (teal) | `#00A86B` (kelly green) | Success states |
| `#FFB020` (amber) | `#FF9500` (amber) | Warning states |
| `#FF3B30` (red) | `#FF3B30` (red) | Error states |
| `#0F1419` (dark navy) | `#FFFFFF` (light mode) / `#0A0A0B` (dark mode) | Background |
| `#1E2329` (card bg) | `#FFFFFF` (light) / `#161618` (dark) | Card surface |
| `#2D3748` (border) | `#E5E7EB` (light) / `#2A2A2D` (dark) | Borders |

### Tailwind Class Migration

```tsx
// Before
className="bg-gradient-to-r from-blue-600 to-cyan-600"
// After
className="bg-[#0066FF]"

// Before
className="shadow-glow-primary"
// After
className="shadow-sm hover:shadow-md"

// Before
className="bg-[#1E2329] border-2 border-blue-500/20"
// After
className="bg-white dark:bg-[#161618] border border-[#E5E7EB] dark:border-[#2A2A2D]"

// Before
className="text-foreground-secondary"
// After
className="text-[#6B7280] dark:text-[#A1A1A6]"
```

---

## Tailwind Config Migration

### Step 1: Backup Current Config
```bash
cp tailwind.config.js tailwind.config.v1.backup.js
```

### Step 2: Switch to v2 Config
```bash
cp tailwind.config.v2.js tailwind.config.js
```

### Step 3: Update Package.json (if needed)
Ensure you have the v2 tokens:
```json
{
  "dependencies": {
    "@dryjets/ui": "workspace:*"
  }
}
```

### Step 4: Rebuild
```bash
npm run build
```

---

## Layout Changes

### Sidebar

#### v1 (Current)
```tsx
// 280px width, dark navy background
<aside className="w-280 bg-background-darker">
```

#### v2 (New)
```tsx
// 240px width, matches theme (light/dark)
<aside className="w-60 bg-white dark:bg-[#0A0A0B]">
```

**Changes:**
- Width: 280px → 240px
- Background: Always dark → Respects theme
- Border: None → 1px right border

### Header

#### v1 (Current)
```tsx
// 64px height, dark background
<header className="h-16 bg-background-lighter">
```

#### v2 (New)
```tsx
// 56px height, clean background
<header className="h-14 bg-white dark:bg-[#161618] border-b border-[#E5E7EB] dark:border-[#2A2A2D]">
```

**Changes:**
- Height: 64px → 56px
- Background: Dark → Light (with dark mode support)
- Border: None → Bottom border for separation

---

## Typography Migration

### Font Size Changes

```tsx
// Before (arbitrary rem values)
className="text-sm" // 0.875rem = 14px
className="text-base" // 1rem = 16px
className="text-lg" // 1.125rem = 18px

// After (precise pixel values)
className="text-sm" // 14px (same)
className="text-[15px]" // 15px (new default body text)
className="text-lg" // 18px (same, but for headings)
```

### Letter Spacing

```tsx
// Large headings (30px+)
className="text-4xl tracking-tight" // -0.01em to -0.02em

// Body text
className="text-base tracking-normal" // 0em (default)
```

### Font Weight

```tsx
// Before
className="font-medium" // 500 (everywhere)

// After
className="font-normal" // 400 (body text)
className="font-medium" // 500 (UI labels, small text)
className="font-semibold" // 600 (headings)
className="font-bold" // 700 (display text)
```

---

## Animation Migration

### Duration Changes

```tsx
// Before (custom durations)
className="transition-all duration-250"

// After (standardized tokens)
className="transition-all duration-fast" // 150ms
className="transition-all duration-base" // 200ms (default)
className="transition-all duration-slow" // 300ms
```

### Easing Changes

```tsx
// Before (default ease)
className="ease-in-out"

// After (precise curves)
className="ease-out" // cubic-bezier(0, 0, 0.2, 1) for enter animations
className="ease-in" // cubic-bezier(0.4, 0, 1, 1) for exit animations
className="ease-in-out" // cubic-bezier(0.4, 0, 0.2, 1) for transitions
```

### Hover Effects

```tsx
// Before (scale up, glow)
className="hover:scale-105 hover:shadow-glow-primary"

// After (subtle lift)
className="hover:-translate-y-0.5 hover:shadow-md"
```

---

## Dark Mode Support

### Enable Dark Mode Toggle

v2 design system fully supports both light and dark modes.

#### Add Theme Provider (if not already)
```tsx
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider';

<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  {children}
</ThemeProvider>
```

#### Create Theme Toggle
```tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button-v2';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

#### Use Theme-Aware Colors
```tsx
// Light mode: white background, dark text
// Dark mode: dark background, light text
className="bg-white dark:bg-[#0A0A0B] text-[#111827] dark:text-[#FAFAFA]"
```

---

## Migration Checklist

### Phase 1: Foundation (Week 1)
- [ ] Install v2 design tokens
- [ ] Switch to v2 Tailwind config
- [ ] Add theme provider for light/dark mode
- [ ] Test existing pages (should still work with v1 components)

### Phase 2: Core Components (Week 2)
- [ ] Migrate all buttons to v2
- [ ] Migrate all cards to v2
- [ ] Migrate all badges to v2
- [ ] Migrate all form inputs to v2

### Phase 3: Layouts (Week 3)
- [ ] Update sidebar layout
- [ ] Update header layout
- [ ] Update content container widths
- [ ] Update spacing between sections

### Phase 4: Pages (Week 4-6)
- [ ] Migrate dashboard page
- [ ] Migrate orders page
- [ ] Migrate equipment page
- [ ] Migrate analytics page
- [ ] Migrate settings page

### Phase 5: Polish (Week 7-8)
- [ ] Review all animations (ensure 150-200ms)
- [ ] Review all colors (remove gradients/glows)
- [ ] Review all spacing (ensure 8pt grid)
- [ ] Add micro-interactions
- [ ] Test accessibility (focus rings, keyboard nav)

---

## Common Mistakes & Fixes

### Mistake 1: Mixing v1 and v2 styles
```tsx
// ❌ Wrong
import { Button } from '@/components/ui/button-v2';
<Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
  Save
</Button>

// ✅ Correct
import { Button } from '@/components/ui/button-v2';
<Button variant="primary">
  Save
</Button>
```

### Mistake 2: Using dark backgrounds in light mode
```tsx
// ❌ Wrong
<Card className="bg-[#1E2329]">

// ✅ Correct
<Card variant="default"> {/* White in light mode, dark in dark mode */}
```

### Mistake 3: Arbitrary spacing
```tsx
// ❌ Wrong
className="mt-5 mb-7 px-9"

// ✅ Correct (8pt grid)
className="mt-6 mb-8 px-8" {/* 24px, 32px, 32px */}
```

### Mistake 4: Slow animations
```tsx
// ❌ Wrong
className="transition-all duration-500"

// ✅ Correct
className="transition-all duration-200" {/* Fast, responsive */}
```

### Mistake 5: Overusing badges
```tsx
// ❌ Wrong (every status has a badge)
<div>
  <Badge>Pending</Badge>
  <Badge>Active</Badge>
  <Badge>Draft</Badge>
</div>

// ✅ Correct (use color/text when appropriate)
<div>
  <span className="text-[#6B7280]">Pending</span>
  <Badge variant="success" showDot>Active</Badge>
  <span className="text-[#9CA3AF]">Draft</span>
</div>
```

---

## Testing Strategy

### Visual Regression Testing
1. Take screenshots of all pages before migration
2. Migrate components one page at a time
3. Compare before/after screenshots
4. Ensure no layout shifts or broken styles

### Accessibility Testing
1. Keyboard navigation: Tab through all interactive elements
2. Focus indicators: Visible on all focusable elements
3. Color contrast: Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
4. Screen reader: Test with VoiceOver (Mac) or NVDA (Windows)

### Performance Testing
1. Lighthouse audit: Aim for 95+ score
2. Bundle size: Should be smaller (less CSS for gradients/glows)
3. Animation performance: All animations at 60fps

---

## Rollback Plan

If you need to rollback to v1:

```bash
# 1. Restore v1 Tailwind config
cp tailwind.config.v1.backup.js tailwind.config.js

# 2. Change imports back to v1 components
# Find all: @/components/ui/button-v2
# Replace with: @/components/ui/button

# 3. Rebuild
npm run build
```

---

## Support & Resources

### Documentation
- [Design Vision](./DESIGN_VISION.md) - Philosophy and principles
- [Design Tokens v2](./packages/ui/dryjets-tokens-v2.ts) - Token reference
- [Component Showcase](http://localhost:3000/design-system) - Live examples

### Example Migrations
- See [REDESIGN_PROGRESS.md](./REDESIGN_PROGRESS.md) for before/after comparisons

### Questions?
- Review the [Design System Showcase](http://localhost:3000/design-system) page
- Check component source code for prop types
- Reference Linear, Stripe, or Notion for inspiration

---

## Timeline

**Recommended approach:** Gradual migration, one page per day

| Week | Focus | Deliverables |
|------|-------|-------------|
| 1 | Foundation | Tokens, config, theme provider |
| 2 | Components | All v2 components ready |
| 3 | Layouts | Sidebar, header, containers |
| 4-6 | Pages | Migrate all pages |
| 7-8 | Polish | Animations, accessibility |

**Total time:** 6-8 weeks for complete migration

---

## Success Criteria

Migration is complete when:

✅ All pages use v2 components
✅ No v1 component imports remain
✅ Lighthouse score 95+ (all categories)
✅ No gradients or neon glows in UI
✅ All animations 150-300ms
✅ WCAG 2.1 Level AA compliance
✅ Both light and dark modes work perfectly
✅ 8pt grid spacing throughout
✅ User feedback: "Feels more professional"

---

**Last Updated:** October 19, 2025
**Next Review:** Weekly during migration
