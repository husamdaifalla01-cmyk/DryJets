# DryJets Dashboard - Visual Feature Guide

**Quick Reference**: Screenshots and descriptions of all new features

---

## 🎨 Theme System

### Light/Dark Theme Toggle

**Location**: Header, next to notification bell

**How to Use**:
1. Click sun/moon icon in header
2. Select from dropdown:
   - ☀️ **Light** - Bright, comfortable daytime theme
   - 🌙 **Dark** - Deep charcoal for nighttime use
   - 🖥️ **System** - Auto-adapts to OS preference

**Persistence**: Theme saved to localStorage (`dryjets-ui-theme`)

**Visual Changes**:
```
Light Mode:
- Background: #FAFAFA (warm white)
- Text: #2D3748 (rich gray)
- Cards: #FFFFFF with subtle shadows
- Primary: #4A90E2 (sky blue)

Dark Mode:
- Background: #0F1419 (deep charcoal)
- Text: #FAFAFA (white)
- Cards: #1E2329 with subtle borders
- Primary: #0066FF (vibrant blue)
```

**Animation**: 200ms smooth color transitions on all elements

---

## 📊 Optimized Dashboard

### Compact Hero Section

**Before**:
```
┌────────────────────────────────────────────────┐
│                                                │
│  Good afternoon, Sarah! 👋    🏅 Gold Tier    │
│  Welcome back to Premium Dry Cleaners         │
│                                                │
│  ⭐ 342 LTV    🎯 94% completion   📈 Excellent│
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ 💡 AI Recommendation                      │ │
│  │ Your revenue is up 15% this week!         │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
  Height: ~280px
```

**After** (50% reduction):
```
┌────────────────────────────────────────────────┐
│ Good afternoon, Sarah! 👋 🏅 Gold Tier         │
│                                                │
│  $342 LTV  |  94% Complete  |  Excellent      │
│                          [+ Add New Order]     │
└────────────────────────────────────────────────┘
┌────────────────────────────────────────────────┐
│ 💡 AI Recommendation: Revenue up 15% this week│
└────────────────────────────────────────────────┘
  Height: ~140px + 40px banner
```

**Benefits**:
- More screen space for content
- Faster visual scanning
- Prominent action button
- Cleaner, modern aesthetic

---

## 🛒 Add Order Flow (POS-Inspired)

### Opening the Sheet

**Trigger Locations**:
1. Dashboard hero: "Add New Order" button
2. Header: "Quick Actions" → (future)
3. Keyboard shortcut: Cmd/Ctrl + N (future)

**Animation**: Slides in from right (300ms ease-out)

---

### Three-Panel Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [X] New Order                [Draft]  [Clear]               │
├──────────────┬──────────────────────────┬───────────────────┤
│ LEFT 30%     │ CENTER 45%               │ RIGHT 25%         │
├──────────────┼──────────────────────────┼───────────────────┤
│ CUSTOMER     │ SELECT SERVICES          │ ORDER SUMMARY     │
│ INFO         │                          │                   │
│              │ ┌────┬────┬────┬────┐   │ Shirt × 2  $17.98│
│ Name:        │ │ 👔 │ 👗 │ 🧥 │ 👖 │   │ Dress × 1  $15.00│
│ ____________ │ │Shirt│Dress│Jacket│Pants│ │                   │
│              │ │$8.99│$15 │$12  │$10 │   │ ───────────────   │
│ Phone:       │ └────┴────┴────┴────┘   │ Subtotal  $32.98 │
│ ____________ │                          │ Tax (8%)   $2.64 │
│              │ ┌────┬────┬────┬────┐   │ ───────────────   │
│ Pickup:      │ │ 👘 │ 🎽 │ 🧺 │ ✨ │   │ TOTAL     $35.62 │
│ [Date Picker]│ │Skirt│Suit│Bulk│Custom│ │                   │
│              │ │$9.50│$25 │$30  │$0  │   │                   │
│ Order #:     │ └────┴────┴────┴────┘   │                   │
│ ORD-2025-001 │                          │                   │
│              │ (4 cols desktop,         │                   │
│ Payment:     │  3 tablet, 2 mobile)     │                   │
│ [Pending][Paid]│                        │                   │
│              │                          │                   │
└──────────────┴──────────────────────────┴───────────────────┘
│ [Cancel]  [Save Draft]  [Pay Later]  [💳 Pay Now]          │
└─────────────────────────────────────────────────────────────┘
```

---

### Item Selection Behavior

**States**:
```
Not Selected:
┌────────────┐
│     👔     │
│   Shirt    │
│   $8.99    │
│            │
└────────────┘
Gray border
White/Dark BG

Selected (Quantity 1+):
┌────────────┐
│ ● (blue)   │
│     👔     │
│   Shirt    │
│   $8.99    │
│  [-] 2 [+] │
└────────────┘
Blue border
Blue/Primary BG tint
```

**Interactions**:
- **Tap tile** → Adds 1 (if quantity = 0)
- **Tap [-]** → Decreases quantity
- **Tap [+]** → Increases quantity
- **Hover** → Scale 1.05 (150ms)
- **Tap down** → Scale 0.95 (150ms)

---

### Real-Time Summary Updates

**As you select items**:
```
1. Click "Shirt" tile
   → Summary adds: "Shirt × 1  $8.99"
   → Subtotal updates: $8.99
   → Tax updates: $0.72
   → Total updates: $9.71

2. Click [+] on Shirt
   → Updates to: "Shirt × 2  $17.98"
   → Subtotal: $17.98
   → Tax: $1.44
   → Total: $19.42

3. Click "Dress" tile
   → Summary adds: "Dress × 1  $15.00"
   → Subtotal: $32.98
   → Tax: $2.64
   → Total: $35.62
```

**Every change updates instantly** (no "Calculate" button needed)

---

### Draft Saving

**Auto-Save**:
- Saves to localStorage every 500ms (debounced)
- Key: `order-draft-{orderNumber}`
- Contains: customer info, items, quantities, timestamp

**Manual Save**:
- Click "Save Draft" button
- Shows confirmation (future: toast notification)
- Persists across browser sessions

**Draft Recovery** (future):
- If you close the sheet with unsaved items
- Prompt: "You have a draft order. Continue editing?"

---

### Order Submission

**Pay Later**:
```
1. Click "Pay Later"
2. Order saved with status: "Pending Payment"
3. Sheet closes
4. Success notification (future)
5. Order appears in "Active Orders" list
```

**Pay Now**:
```
1. Click "💳 Pay Now"
2. Payment modal opens (future: Stripe integration)
3. After payment confirmation
4. Order saved with status: "Paid"
5. Receipt generated (future)
```

---

## 🌐 Offline Mode

### Network Status Indicator

**Location**: Header, between Quick Actions and Theme Toggle

**States**:
```
🟢 Online
┌──────────┐
│ 📶 Online│
└──────────┘
Green bg, no badge

🔴 Offline (2 drafts pending)
┌────────────────┐
│ 📶 Offline (2) │
└────────────────┘
Red bg, shows count

🔵 Syncing
┌──────────────────┐
│ 🔄 Syncing... (2)│ (spinner animation)
└──────────────────┘
Blue bg, animated
```

---

### Offline Banner

**Appears automatically when offline**:
```
┌────────────────────────────────────────────────────┐
│ ⚠️ Working Offline                     [Retry]    │
│ 2 orders will sync when reconnected                │
└────────────────────────────────────────────────────┘
Yellow banner (slides down from header)
```

**Syncing Banner**:
```
┌────────────────────────────────────────────────────┐
│ 🔄 Syncing Orders...                               │
│ Syncing 2 orders... (spinner animation)            │
└────────────────────────────────────────────────────┘
Blue banner (animated spinner)
```

**Auto-dismisses** when:
- All orders synced successfully
- Network status returns to "Online"

---

### Offline Workflow

**Scenario**: Store internet goes down during peak hours

1. **Network Status** → Shows "🔴 Offline"
2. **Banner Appears** → "Working Offline - Orders will sync when reconnected"
3. **Continue Working** → Create orders as normal
4. **Orders Saved Locally** → To IndexedDB (persistent storage)
5. **Network Restored** → Banner changes to "🔄 Syncing Orders..."
6. **Auto-Sync** → Pending orders sent to API
7. **Success** → Banner disappears, orders visible in dashboard

**Manual Retry**:
- Click "Retry" button in offline banner
- Forces immediate sync attempt
- Shows spinner during sync
- Updates count as orders complete

---

## 🎯 Keyboard Shortcuts (Future)

### Global
- `Cmd/Ctrl + K` → Open command bar
- `Cmd/Ctrl + N` → New order
- `Cmd/Ctrl + /` → Search
- `Cmd/Ctrl + D` → Toggle dark mode

### Add Order Sheet
- `Tab` → Navigate between fields
- `Enter` → Submit order (if valid)
- `Esc` → Close sheet (with confirmation if unsaved)
- `Cmd/Ctrl + S` → Save draft
- `Cmd/Ctrl + Enter` → Pay Now

### Item Grid
- `Arrow keys` → Navigate tiles
- `Space` → Add item (or +1 if already added)
- `-` → Decrease quantity
- `+` → Increase quantity
- `Del` → Remove item

---

## 📱 Responsive Breakpoints

### Mobile (375px - 767px)
```
Dashboard:
- Hero: Single column, stats stacked
- KPI Cards: 1 column
- Equipment: 1 column

Add Order Sheet:
- Full screen overlay (no side panels visible initially)
- Swipe tabs: Customer Info | Items | Summary
- Item grid: 2 columns
- Bottom action bar (sticky)
```

### Tablet (768px - 1023px)
```
Dashboard:
- Hero: Two-column (greeting left, stats right)
- KPI Cards: 2 columns
- Equipment: 2 columns

Add Order Sheet:
- 90% width overlay
- Two panels: Items + Summary (Customer Info collapsed)
- Item grid: 3 columns
- Bottom action bar
```

### Desktop (1024px+)
```
Dashboard:
- Hero: Three-column (greeting | stats | action)
- KPI Cards: 4 columns
- Equipment: 3 columns

Add Order Sheet:
- 90% width overlay
- Three panels: Customer (30%) | Items (45%) | Summary (25%)
- Item grid: 4 columns
- Bottom action bar
```

---

## 🎨 Color Palette Quick Reference

### Light Mode
```css
Background:  #FAFAFA (warm white)
Card:        #FFFFFF (pure white)
Border:      #E2E8F0 (soft gray)
Text:        #2D3748 (rich gray)
Text (sec):  #4A5568 (medium gray)
Primary:     #4A90E2 (sky blue)
Success:     #52B788 (sage green)
Warning:     #F4A261 (warm amber)
Danger:      #E76F51 (soft coral)
```

### Dark Mode
```css
Background:  #0F1419 (deep charcoal)
Card:        #1E2329 (elevated surface)
Border:      #2A2A2D (subtle divider)
Text:        #FAFAFA (white)
Text (sec):  #A1A1A6 (light gray)
Primary:     #0066FF (vibrant blue)
Success:     #00A86B (bright green)
Warning:     #FF9500 (bright amber)
Danger:      #FF3B30 (bright red)
```

### Glassmorphism
```css
.glass-card {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.8); /* Light */
  background: rgba(0, 0, 0, 0.8); /* Dark */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

---

## ⚡ Performance Tips

### Optimizing Theme Switches
- Theme stored in localStorage (instant retrieval)
- CSS variables used (no JS re-renders)
- Transition only on essential properties
- Reduced motion support (auto-detects user preference)

### Optimizing Add Order Sheet
- Item grid uses CSS Grid (GPU-accelerated)
- Summary table virtualized for large orders (future)
- Debounced auto-save (500ms) prevents excessive writes
- IndexedDB for persistent storage (faster than localStorage)

### Optimizing Network Detection
- Event listeners only (no polling)
- Pending count cached (checked every 5s, not on every render)
- Sync queue processed in background (Web Worker, future)

---

## 🎓 User Training Script

### For Cashiers/Front Desk

**Theme Toggle** (30 seconds):
"If the screen is too bright, click this sun icon and choose Dark mode. Your preference is saved automatically."

**Creating Orders** (2 minutes):
1. "Click 'Add New Order' in the blue box at the top"
2. "Type customer name and phone on the left"
3. "Select items by clicking the icons in the middle. Click the plus to add more."
4. "Check the total on the right"
5. "Click 'Pay Now' if they're paying today, or 'Pay Later' if not"
6. "That's it! The order is saved."

**Offline Mode** (1 minute):
"If the internet goes down, you'll see a yellow banner. Keep working normally—all orders are saved to your computer and will upload automatically when internet comes back. You can also click 'Retry' to try syncing manually."

---

## 🔍 Troubleshooting Visual Issues

### Theme Not Switching?
1. Check browser console for errors
2. Verify localStorage: `localStorage.getItem('dryjets-ui-theme')`
3. Try clearing cache and reloading
4. Check if browser blocks localStorage (privacy mode)

### Add Order Sheet Not Appearing?
1. Check browser console for errors
2. Verify button click handler is attached
3. Check if Radix UI Dialog is loaded (DevTools → Network)
4. Try refreshing the page

### Items Not Clickable?
1. Check z-index conflicts (DevTools → Elements)
2. Verify Framer Motion animations not blocking clicks
3. Check for parent container overflow issues
4. Try disabling browser extensions

### Offline Banner Stuck?
1. Check `navigator.onLine` in console
2. Verify event listeners attached: `window.ononline`, `window.onoffline`
3. Try manually toggling offline in DevTools
4. Clear localStorage and reload

---

## 📸 Screenshot Checklist (For Documentation)

### Dashboard
- [ ] Light mode hero section (desktop)
- [ ] Dark mode hero section (desktop)
- [ ] Mobile responsive hero (375px)
- [ ] KPI cards grid (all 4)
- [ ] Theme toggle dropdown open

### Add Order Flow
- [ ] Sheet open - full three-panel view
- [ ] Item tile hover state
- [ ] Item tile selected state (with quantity)
- [ ] Order summary with multiple items
- [ ] Customer info form filled out
- [ ] Mobile view (item grid 2 columns)
- [ ] Tablet view (item grid 3 columns)

### Offline Mode
- [ ] Offline banner (yellow)
- [ ] Syncing banner (blue with spinner)
- [ ] Network status indicator (all 3 states)
- [ ] Pending sync count in header

### Dark Mode
- [ ] Full dashboard in dark mode
- [ ] Add Order sheet in dark mode
- [ ] Glassmorphism effects visible
- [ ] Proper text contrast

---

**Generated with [Claude Code](https://claude.com/claude-code)**
**Co-Authored-By: Claude <noreply@anthropic.com>**
