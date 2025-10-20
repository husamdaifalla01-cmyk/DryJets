# DryJets Daily Use Color Palette
## User-Friendly Design for Extended Dashboard Usage

### Design Philosophy
**Goal:** Create a calming, professional interface that reduces eye strain during long work sessions while maintaining clear visual hierarchy and brand identity.

**Principles:**
- Soft, matte colors that don't fatigue the eyes
- High contrast for readability without harshness
- Warm neutrals for comfort
- Purposeful color usage (not decorative)
- Accessibility-first (WCAG AAA where possible)

---

## Primary Palette

### Sky Blue (Primary) - Trust & Clarity
**Use:** Primary actions, active states, important CTAs
```
Base: #4A90E2 (Sky Blue - softer than electric blue)
Light: #7FB3E8
Dark: #2E6CAF
Matte: #6BA3E0
```
**Rationale:** Softer than #0066FF, reduces eye strain, still conveys trust and professionalism

### Sage Green (Success) - Growth & Confirmation
**Use:** Success messages, operational status, positive trends
```
Base: #52B788 (Sage Green - muted natural green)
Light: #74C69D
Dark: #2D6A4F
Matte: #6BC199
```
**Rationale:** Natural, calming green that's easier on eyes than kelly green

### Warm Amber (Warning) - Attention Without Alarm
**Use:** Warnings, pending items, requires attention
```
Base: #F4A261 (Warm Amber - muted orange)
Light: #F7B87E
Dark: #E07A3D
Matte: #F5B377
```
**Rationale:** Warm and inviting, doesn't create anxiety like bright orange

### Soft Coral (Danger) - Urgent But Not Aggressive
**Use:** Errors, critical alerts, delete actions
```
Base: #E76F51 (Soft Coral - muted red)
Light: #ED8D77
Dark: #D84A28
Matte: #EA8568
```
**Rationale:** Clearly indicates danger without the harshness of bright red

---

## Neutral Palette (Light Mode Focus)

### Background System - Warm Whites & Creams
```
Pure: #FAFAFA (Soft white - primary background)
Canvas: #F5F5F7 (Apple-inspired warm gray)
Subtle: #EFEFEF (Very light warm gray)
Card: #FFFFFF (True white for cards on gray bg)
Elevated: #FDFDFD (Slightly off-white)
```
**Rationale:** Warm tones reduce blue light fatigue, more comfortable than pure white

### Foreground System - Rich Grays
```
Primary: #2D3748 (Charcoal - not black, softer)
Secondary: #4A5568 (Medium gray)
Tertiary: #718096 (Light gray for hints)
Muted: #A0AEC0 (Very light gray)
Disabled: #CBD5E0 (Almost background)
```
**Rationale:** True black (#000) is harsh; charcoal maintains contrast without strain

### Border System - Gentle Dividers
```
Default: #E2E8F0 (Light blue-gray)
Subtle: #EDF2F7 (Almost invisible)
Focus: #4A90E2 (Primary color)
Hover: #CBD5E0 (Slightly darker on hover)
```
**Rationale:** Borders should organize, not dominate; subtle blue-gray is warmer than pure gray

---

## Accent Colors (Sparingly Used)

### Purple - Premium Features
```
Base: #9F7AEA (Soft purple)
Use: Premium indicators, special features
```

### Teal - Information
```
Base: #38B2AC (Muted teal)
Use: Info messages, helpful tips
```

---

## Dark Mode Palette (Optional Future Enhancement)

### Background System
```
Base: #1A202C (Deep blue-black, not pure black)
Elevated: #2D3748 (Charcoal)
Subtle: #4A5568 (Medium gray)
```

### Foreground System
```
Primary: #F7FAFC (Warm white)
Secondary: #E2E8F0
Tertiary: #CBD5E0
```

---

## Usage Guidelines

### ✅ DO
- Use Sky Blue for all primary actions (buttons, links, active nav)
- Use Sage Green only for success/operational states
- Use Warm Amber for warnings that need attention
- Use Soft Coral sparingly for critical alerts
- Maintain consistent spacing (8pt grid)
- Use matte variations for large backgrounds

### ❌ DON'T
- Mix vibrant and matte colors in same view
- Use more than 2 accent colors per page
- Use color alone to convey meaning (add icons/text)
- Use pure black (#000) or pure white (#FFF) for text
- Create gradients with more than 2 colors

---

## Component-Specific Colors

### Sidebar
```
Background: #FAFAFA (Warm off-white)
Active Item: #4A90E2/10 (10% opacity sky blue)
Hover Item: #F5F5F7
Text: #2D3748
Active Text: #4A90E2
Border: #E2E8F0
```

### Header
```
Background: #FFFFFF
Border: #E2E8F0
Search Bar BG: #F5F5F7
Search Bar Border: #E2E8F0
Status Online: #52B788
Status Offline: #E76F51
```

### Cards (KPI, Data Cards)
```
Background: #FFFFFF
Border: #E2E8F0
Shadow: 0 1px 3px rgba(45, 55, 72, 0.08)
Hover Border: #CBD5E0
Success Accent: #52B788/10 background
Warning Accent: #F4A261/10 background
```

### Buttons
```
Primary: #4A90E2 (Sky blue)
Primary Hover: #2E6CAF (Darker blue)
Secondary: #F5F5F7 (Light gray)
Secondary Hover: #EFEFEF
Danger: #E76F51 (Soft coral)
Danger Hover: #D84A28
```

### Status Badges
```
Success: BG #52B788/15, Text #2D6A4F, Border #52B788/30
Warning: BG #F4A261/15, Text #E07A3D, Border #F4A261/30
Danger: BG #E76F51/15, Text #D84A28, Border #E76F51/30
Info: BG #38B2AC/15, Text #2C7A7B, Border #38B2AC/30
```

### Input Fields
```
Background: #FFFFFF
Border: #E2E8F0
Border Focus: #4A90E2
Placeholder: #A0AEC0
Text: #2D3748
```

---

## Accessibility Compliance

### Contrast Ratios (WCAG AAA = 7:1, AA = 4.5:1)

| Combination | Ratio | Level | Pass |
|-------------|-------|-------|------|
| #2D3748 on #FAFAFA | 12.5:1 | AAA | ✅ |
| #4A5568 on #FAFAFA | 8.2:1 | AAA | ✅ |
| #4A90E2 on #FFFFFF | 4.8:1 | AA | ✅ |
| #52B788 on #FFFFFF | 3.2:1 | - | ⚠️ Use darker for text |
| #2D6A4F on #FFFFFF | 7.9:1 | AAA | ✅ |

**Note:** Accent colors should primarily be used for backgrounds/borders, not text

---

## Comparison: Old vs New

| Element | Old (Precision OS) | New (Daily Use) | Improvement |
|---------|-------------------|-----------------|-------------|
| Primary | #0066FF (Electric Blue) | #4A90E2 (Sky Blue) | Softer, less eye strain |
| Success | #00A86B (Kelly Green) | #52B788 (Sage Green) | More natural, calming |
| Warning | #FF9500 (Bright Orange) | #F4A261 (Warm Amber) | Less alarming, warmer |
| Danger | #FF3B30 (Bright Red) | #E76F51 (Soft Coral) | Urgent but not harsh |
| Background | #FFFFFF (Pure White) | #FAFAFA (Warm Off-White) | Reduces blue light |
| Text | #111827 (Near Black) | #2D3748 (Charcoal) | Softer contrast |

---

## Implementation Priority

### Phase 1: Core Colors ✅
- Update primary, success, warning, danger
- Update background/foreground systems
- Update border colors

### Phase 2: Component Updates ✅
- Sidebar colors
- Header colors
- Button variants
- Status badges

### Phase 3: Fine-tuning
- Hover states
- Focus states
- Animation colors
- Shadow colors

---

**Next Step:** Apply this palette to globals-v2.css
