# Dashboard Preview Guide

**Phase 3 Enterprise Dashboard - Interactive Showcase**

---

## 🎯 Quick Start

To see the Phase 3 dashboard components in action:

```bash
# 1. Navigate to merchant app
cd apps/web-merchant

# 2. Start the dev server (if not running)
npm run dev

# 3. Visit the preview page
# http://localhost:3000/dashboard-preview
```

---

## 📊 What You'll See

The preview page showcases all Phase 3 components in interactive sections:

### Section 1: KPI Cards with Trends & Sparklines

**Visual Features:**
- 4 metric cards displaying key performance indicators
- Automatic number formatting (1.2M for 1,200,000)
- Trend indicators showing ↑ (up) or ↓ (down) with percentages
- Color-coded trends:
  - 🟢 Green for positive (success)
  - 🟡 Orange for warning
  - 🔵 Blue for neutral/default
- Mini sparkline charts showing trends over time

**Cards Shown:**
1. **Today's Orders** - 24 orders, +12.5% trend, with sparkline
2. **Revenue** - $1,245, +8.3% trend, success variant (green)
3. **Avg Order** - $52, +3.2% uptrend
4. **Pending** - 5 pickups, warning variant (orange)

---

### Section 2: Comparison Metrics

**Visual Features:**
- Side-by-side comparison of current vs previous period
- Trend percentage between periods
- Clean, minimal design

**Example:**
- **This Month:** $45,230
- **Last Month:** $38,940
- **Trend:** ↑ 16.2% improvement

---

### Section 3: High-Performance Data Table

**Visual Features:**
- Sortable columns (click headers to sort A→Z or Z→A)
- Search bar at the top to filter all rows
- Pagination controls (showing 4 orders at a time)
- Status badges with color coding:
  - 🟡 Yellow for "In Process"
  - 🟢 Green for "Ready" and "Delivered"
  - ⚪ Gray for "Picked Up"
- Row selection checkboxes
- Bulk actions ("Cancel Selected" button appears when rows selected)
- Export to CSV button

**Columns:**
- Order ID (blue, monospace font)
- Customer name
- Status (with color badge)
- Item count
- Total price (right-aligned)

**Try:**
- Type in search box to filter orders
- Click column headers to sort
- Check/uncheck rows to select them
- Click "Export" to download CSV

---

### Section 4: Workflow Stepper

**Three Variants Shown:**

#### Full Variant (Left)
- Complete vertical step list
- Blue progress bar at top (50% filled at step 3/5)
- Step numbers with checkmarks for completed steps
- Current step highlighted in blue with ring effect
- Upcoming steps in gray
- Connected dots showing flow
- Clickable to navigate back to previous steps
- "Back" and "Next" buttons to control progress

#### Compact Variant (Center)
- Space-saving horizontal layout
- Same progress bar and step information
- Better for sidebars or mobile

#### Status Info (Right)
- Current step details
- Step number counter
- Visual progress bar
- Perfect for showing workflow context

**Try:**
- Click "Next" to advance through the workflow
- Click "Back" to go to previous steps
- In full variant, click on any completed step to jump back
- Watch the progress bar fill as you advance

**Steps:**
1. Select Customer
2. Choose Service
3. Add Items
4. Schedule (date/time)
5. Review & Submit

---

### Section 5: Location Selector Features

**Visual Features:**
- Dropdown selector at top right of page
- Shows currently selected location
- Click to open dropdown menu with:
  - "All Locations" option (aggregated view)
  - Recent locations (max 3)
  - All available locations with search
  - City/state information for each
  - "Main" badge for headquarters

**Behavior:**
- Persists selection in localStorage
- Remembers 3 most recent locations for quick access
- Search works by location name, city, or address

**Try:**
- Click the location selector in the page header
- Search for "Marina" to find Marina District
- Select a location - it will remember your choice
- Notice "All Locations" option at top for aggregated metrics

---

### Section 6: Component Features Overview

**Reference Grid** showing all features at a glance:

#### KPI Card Features
- Auto-format large numbers (1.23M, 1.2K)
- Trend indicators (↑↓%) with color coding
- SVG sparkline charts (lightweight)
- 3 size variants: small, medium, large
- 4 color variants: default, success, warning, danger
- Clickable for drill-down
- Loading & error states

#### Data Table Features
- Column sorting (ascending/descending)
- Full-text search across all columns
- Pagination with adjustable page size
- Row selection (multi-select with checkboxes)
- Bulk actions with custom handlers
- Export to CSV
- Custom cell renderers with JSX

#### Workflow Stepper Features
- Visual step indicators (numbered, with icons)
- Progress bar showing overall progress
- 3 layout variants (full, compact, horizontal)
- Optional step markers
- Clickable navigation between steps
- Current/completed/upcoming visual states
- Smooth 200ms animations

#### Location Selector Features
- "All Locations" aggregated option
- Search/filter by name, city, address
- Recent locations history (3 max)
- localStorage persistence
- Mobile-responsive design
- Full keyboard navigation
- Active location badge

---

## 🎨 Design System

All components follow **Precision OS v2.0**:

### Colors
- **Primary:** #0066FF (solid blue, no gradients)
- **Success:** #00A86B (kelly green)
- **Warning:** #FF9500 (orange)
- **Danger:** #FF3B30 (red)
- **Gray:** #6B7280 (text), #9CA3AF (muted text)
- **Background:** #FFFFFF (light), #0A0A0B (dark)

### Typography
- **Display:** Inter Tight (headings)
- **Body:** Inter (default)
- **Sizes:** 48px → 36px → 30px → 24px → 20px → 18px → 15px (base) → 14px → 13px → 12px

### Spacing
- 8pt grid: 4px, 8px, 12px, 16px, 24px, 32px, 48px...

### Animations
- Fast: 150ms (UI feedback)
- Base: 200ms (default transitions)
- Smooth easing functions (ease-out for enter, ease-in for exit)

---

## 💡 Use Cases

### Single Store Dashboard
Use `SingleStoreDashboard` component when merchant has 1 location:
- Focus on daily operations (today's orders, equipment status)
- Driver availability
- Quick stats (turnaround time, satisfaction rate)
- Recent orders table

### Multi-Location Dashboard
Use `MultiLocationDashboard` when merchant has 2-10 locations:
- Location selector for filtering
- Aggregated metrics across all locations
- Top/bottom performers ranking
- Cross-location comparison table
- Per-location view when filtered

### Enterprise Dashboard
When merchant has 10+ locations:
- Executive summary with regional breakdowns
- Advanced analytics
- Custom BI widgets
- Predictive insights
- (To be implemented in future phases)

---

## 🔧 Customization

All components are highly customizable:

### KPI Card
```typescript
<KPICard
  title="Revenue"
  value="$1,245"
  trend={{ value: 8.3, direction: 'up', period: 'week' }}
  icon={DollarSign}
  variant="success"        // default | success | warning | danger
  size="md"                // sm | md | lg
  sparklineData={[...]}    // Optional sparkline
  onClick={() => {}}       // Click handler
  loading={false}          // Loading state
  error={null}             // Error message
/>
```

### DataTable
```typescript
<DataTable
  data={orders}
  columns={columns}
  searchable={true}        // Show search bar
  sortable={true}          // Enable sorting
  selectable={true}        // Show checkboxes
  pagination={true}        // Show pagination
  pageSize={10}            // Items per page
  exportable={true}        // Show export button
  exportFilename="orders.csv"
  bulkActions={[...]}      // Custom bulk actions
  onRowClick={(row) => {}} // Row click handler
/>
```

### LocationSelector
```typescript
<LocationSelector
  locations={mockLocations}
  selectedLocationId={selectedId}
  onLocationChange={setSelectedId}
  showAllOption={true}     // Include "All Locations"
  allOptionLabel="All"
  storageKey="custom_key"  // localStorage key
  maxRecentLocations={3}   // Recent history limit
/>
```

---

## 📱 Responsive Design

All components are fully responsive:

- **Mobile:** Single column, full-width cards, stacked tables
- **Tablet:** 2-3 column grids, condensed tables
- **Desktop:** Full 4-column grids, optimized spacing

Test responsiveness by:
1. Opening dashboard preview
2. Using browser DevTools (F12)
3. Clicking device toolbar to view mobile layout
4. Resize window to see responsive behavior

---

## ⌨️ Keyboard Navigation

All components support keyboard interaction:

### DataTable
- `Tab` - Navigate between rows and controls
- `Enter` - Select/deselect row
- `Ctrl+A` - Select all rows
- `Ctrl+Shift+A` - Deselect all

### Location Selector
- `Tab` - Open/close dropdown
- `Arrow Up/Down` - Navigate locations
- `Enter` - Select location
- `Escape` - Close dropdown
- Type to search

### Workflow Stepper
- `Tab` - Navigate between steps
- `Enter` - Click step (if clickable)
- `Escape` - Exit modal (if applicable)

---

## 🚀 Performance Tips

1. **Large Datasets**
   - Use DataTable pagination (don't show 1,000+ rows)
   - For 100+ locations, implement server-side search in LocationSelector

2. **Rendering**
   - KPI sparklines use SVG (lightweight, no external library)
   - Memoize trend calculations for stability
   - Use React.memo for components that don't need frequent updates

3. **Caching**
   - LocationSelector saves to localStorage (3 recent locations)
   - Permission cache: 5-minute TTL on backend

---

## 📚 Documentation Links

- [KPI Card Reference](./apps/web-merchant/src/components/dashboard/README.md#1-kpicard-component)
- [DataTable Reference](./apps/web-merchant/src/components/dashboard/README.md#2-datatable-component)
- [Location Selector Reference](./apps/web-merchant/src/components/dashboard/README.md#3-locationselector-component)
- [Workflow Stepper Reference](./apps/web-merchant/src/components/workflow/README.md#1-workflowstepper)
- [Complete Component Guide](./apps/web-merchant/src/components/dashboard/README.md)

---

## 🐛 Troubleshooting

### Components not showing?
1. Ensure you're on `http://localhost:3000/dashboard-preview`
2. Check browser console for errors (F12)
3. Verify all components are exported correctly

### Styling issues?
1. Check that Tailwind CSS is building (watch for build errors)
2. Ensure dark mode toggle is working (check localStorage)
3. Verify color tokens in `/packages/ui/dryjets-tokens-v2.ts`

### Performance slow?
1. Open DevTools Performance tab (F12)
2. Check for unnecessary re-renders
3. Use React DevTools Profiler
4. Consider memoizing expensive calculations

---

## 🎓 Learning Path

To understand the system:

1. **Start here:** [PHASE_3_COMPLETE.md](./PHASE_3_COMPLETE.md)
2. **Design philosophy:** [DESIGN_VISION.md](./DESIGN_VISION.md)
3. **Component reference:** [Dashboard README](./apps/web-merchant/src/components/dashboard/README.md)
4. **Backend RBAC:** [RBAC Guide](./apps/api/src/common/permissions/README.md)
5. **Workflow components:** [Workflow README](./apps/web-merchant/src/components/workflow/README.md)

---

## 🎉 Summary

The Phase 3 Dashboard Preview showcases a complete, production-ready enterprise dashboard system featuring:

- ✅ Enterprise-style KPI cards with trends
- ✅ High-performance data tables
- ✅ Multi-location support
- ✅ Workflow progress tracking
- ✅ Role-based access control
- ✅ Adaptive dashboard routing
- ✅ Responsive design
- ✅ WCAG AA accessibility
- ✅ Comprehensive documentation

**Visit `http://localhost:3000/dashboard-preview` to explore!** 🚀
