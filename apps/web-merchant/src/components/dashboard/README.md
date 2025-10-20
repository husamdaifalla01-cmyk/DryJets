# Dashboard Components

**Phase 3: Enterprise Dashboard Architecture - Complete**

This directory contains all dashboard-related components for the DryJets merchant portal, including KPI cards, data tables, location selectors, and adaptive dashboard layouts.

## Components Overview

### Core Components

1. **KPICard** - Key performance indicator cards with trends and sparklines
2. **DataTable** - High-performance table with sorting, filtering, pagination
3. **LocationSelector** - Multi-location dropdown with search and persistence
4. **AdaptiveDashboard** - Intelligent wrapper that routes to appropriate dashboard layout

### Dashboard Layouts

1. **SingleStoreDashboard** - Simplified dashboard for one location
2. **MultiLocationDashboard** - Cross-location comparison for 2-10 locations
3. **EnterpriseDashboard** - Executive dashboard for 10+ locations (to be implemented)

---

## 1. KPICard Component

Display key metrics with trends, sparklines, and comparison periods.

### Features
- Large value display with auto-formatting (1.23M, 1.2K)
- Trend indicators (↑↓%) with color coding
- Optional sparkline charts
- Comparison periods (day, week, month, quarter, year)
- Loading and error states
- Multiple size variants (sm, md, lg)
- Click-through support

### Usage

```typescript
import { KPICard, KPIGrid, ComparisonKPICard } from '@/components/dashboard/KPICard';
import { TrendingUp } from 'lucide-react';

// Basic KPI Card
<KPICard
  title="Today's Orders"
  value={24}
  trend={{
    value: 12.5,
    direction: 'up',
    period: 'day',
  }}
  icon={TrendingUp}
/>

// With Sparkline
<KPICard
  title="Revenue"
  value="$1,245"
  trend={{ value: 8.3, direction: 'up', period: 'week' }}
  sparklineData={[1100, 1200, 1150, 1245]}
  variant="success"
  onClick={() => console.log('View details')}
/>

// Loading State
<KPICard
  title="Orders"
  value={0}
  loading={true}
/>

// Error State
<KPICard
  title="Revenue"
  value={0}
  error="Failed to load data"
/>
```

### KPI Grid Layout

```typescript
<KPIGrid columns={4}>
  <KPICard title="Orders" value={24} />
  <KPICard title="Revenue" value="$1,245" />
  <KPICard title="Customers" value={142} />
  <KPICard title="Avg Value" value="$52" />
</KPIGrid>
```

### Comparison KPI Card

```typescript
<ComparisonKPICard
  title="Monthly Revenue"
  current={{
    label: 'This Month',
    value: '$45,230',
  }}
  previous={{
    label: 'Last Month',
    value: '$38,940',
  }}
  trend={{
    value: 16.2,
    direction: 'up',
  }}
/>
```

### Props

```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number; // Percentage (e.g., 12.5 for +12.5%)
    direction: 'up' | 'down' | 'neutral';
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
  sparklineData?: number[];
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  loading?: boolean;
  error?: string;
}
```

---

## 2. DataTable Component

High-performance table with enterprise features.

### Features
- Column sorting (single and multi-column)
- Search/filtering across all columns
- Pagination with page size options
- Row selection (single and multi-select)
- Bulk actions
- Column customization (show/hide)
- Export to CSV
- Responsive design
- Loading and empty states
- Keyboard navigation

### Usage

```typescript
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { Badge } from '@/components/ui/badge-v2';

interface Order {
  id: string;
  customer: string;
  status: string;
  total: number;
}

const orders: Order[] = [
  { id: 'ORD-1234', customer: 'John Doe', status: 'IN_PROCESS', total: 45.0 },
  // ... more orders
];

const columns: Column<Order>[] = [
  {
    id: 'id',
    header: 'Order ID',
    accessorKey: 'id',
    cell: (value) => <span className="font-mono text-[#0066FF]">{value}</span>,
  },
  {
    id: 'customer',
    header: 'Customer',
    accessorKey: 'customer',
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: (value) => <Badge variant="warning">{value}</Badge>,
  },
  {
    id: 'total',
    header: 'Total',
    accessorKey: 'total',
    cell: (value) => `$${value.toFixed(2)}`,
    align: 'right',
  },
];

<DataTable
  data={orders}
  columns={columns}
  searchable={true}
  searchPlaceholder="Search orders..."
  sortable={true}
  selectable={true}
  pagination={true}
  pageSize={10}
  exportable={true}
  exportFilename="orders.csv"
  onRowClick={(row) => console.log('View order:', row.id)}
  onSelectionChange={(rows) => console.log('Selected:', rows)}
  bulkActions={[
    {
      label: 'Cancel Orders',
      icon: XCircle,
      onClick: (rows) => console.log('Cancel:', rows),
    },
  ]}
/>
```

### Column Definition

```typescript
interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T; // Direct key access
  accessor?: (row: T) => React.ReactNode; // Custom accessor
  cell?: (value: any, row: T) => React.ReactNode; // Custom cell renderer
  sortable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
}
```

### Bulk Actions

```typescript
bulkActions={[
  {
    label: 'Delete',
    icon: Trash,
    onClick: (selectedRows) => {
      // Handle deletion
      console.log('Delete:', selectedRows.map((r) => r.id));
    },
  },
  {
    label: 'Export',
    icon: Download,
    onClick: (selectedRows) => {
      // Export selected rows
    },
  },
]}
```

---

## 3. LocationSelector Component

Dropdown for multi-location merchants with search and persistence.

### Features
- "All Locations" aggregated view option
- Search/filter locations by name, city, or address
- Badge showing active location
- Persists selection in localStorage
- Recent locations history
- Keyboard navigation
- Mobile-responsive

### Usage

```typescript
import {
  LocationSelector,
  LocationBadge,
  useLocationSelection,
} from '@/components/dashboard/LocationSelector';

const locations = [
  {
    id: 'loc-1',
    name: 'Downtown Store',
    city: 'San Francisco',
    state: 'CA',
    isMain: true,
  },
  {
    id: 'loc-2',
    name: 'Marina District',
    city: 'San Francisco',
    state: 'CA',
  },
];

// Using the hook (recommended)
function MyDashboard() {
  const { selectedLocationId, selectedLocation, setSelectedLocationId } =
    useLocationSelection(locations);

  return (
    <>
      <LocationSelector
        locations={locations}
        selectedLocationId={selectedLocationId}
        onLocationChange={setSelectedLocationId}
        showAllOption={true}
        allOptionLabel="All Locations"
      />

      {/* Compact badge display */}
      <LocationBadge
        location={selectedLocation}
        allLocationLabel="All"
        onClick={() => {/* Open selector */}}
      />
    </>
  );
}
```

### Location Interface

```typescript
interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  isMain?: boolean;
}
```

### Storage & Persistence

The selector automatically saves the selection to localStorage:

```typescript
// Default storage key
localStorage.getItem('dryjets_selected_location'); // "loc-1" or "all"

// Recent locations (up to 3)
localStorage.getItem('dryjets_selected_location_recent'); // ["loc-1", "loc-2"]

// Custom storage key
<LocationSelector storageKey="custom_key" ... />
```

---

## 4. AdaptiveDashboard Wrapper

Intelligent wrapper that detects tenant size and routes to appropriate dashboard layout.

### Features
- Automatic tenant detection (1 location = single, 2-10 = multi, 10+ = enterprise)
- Role-based widget visibility
- Permission-aware rendering
- Loading and error states
- Context provider for dashboard data

### Usage

```typescript
import {
  AdaptiveDashboard,
  PermissionGate,
  RoleGate,
  useDashboard,
} from '@/components/dashboard/AdaptiveDashboard';
import { SingleStoreDashboard } from '@/components/dashboard/layouts/SingleStoreDashboard';
import { MultiLocationDashboard } from '@/components/dashboard/layouts/MultiLocationDashboard';
import { EnterpriseDashboard } from '@/components/dashboard/layouts/EnterpriseDashboard';

function DashboardPage() {
  const { merchant, staff, loading, error } = useAuth(); // Your auth hook

  return (
    <AdaptiveDashboard
      merchant={merchant}
      staff={staff}
      loading={loading}
      error={error}
      singleStoreDashboard={SingleStoreDashboard}
      multiLocationDashboard={MultiLocationDashboard}
      enterpriseDashboard={EnterpriseDashboard}
    />
  );
}
```

### Permission Gate

Conditionally render components based on staff permissions:

```typescript
<PermissionGate
  requiredPermissions={['VIEW_FINANCE', 'VIEW_REPORTS']}
  staffPermissions={staff.permissions}
  requireAll={false} // ANY permission (default: false)
>
  <KPICard title="Revenue" value="$1,245" />
</PermissionGate>

// With fallback
<PermissionGate
  requiredPermissions={['VIEW_FINANCE']}
  staffPermissions={staff.permissions}
  fallback={<KPICard title="Revenue" value="***" subtitle="No access" />}
>
  <KPICard title="Revenue" value="$1,245" />
</PermissionGate>
```

### Role Gate

Conditionally render based on staff role:

```typescript
<RoleGate
  allowedRoles={['ENTERPRISE_ADMIN', 'REGIONAL_MANAGER']}
  staffRole={staff.role}
>
  <EnterpriseDashboardWidget />
</RoleGate>
```

### Dashboard Context

Access merchant and staff data from anywhere in the dashboard:

```typescript
function MyWidget() {
  const { merchant, staff, tenantSize } = useDashboard();

  return (
    <div>
      <h2>{merchant.businessName}</h2>
      <p>Tenant size: {tenantSize}</p>
      <p>Staff: {staff.firstName} {staff.lastName}</p>
    </div>
  );
}
```

---

## 5. Dashboard Layouts

### SingleStoreDashboard

Simplified dashboard for merchants with one location.

**Focus:**
- Today's orders and revenue
- Equipment status
- Driver availability
- Quick stats
- Recent activity

**Usage:**
```typescript
import { SingleStoreDashboard } from '@/components/dashboard/layouts/SingleStoreDashboard';

<SingleStoreDashboard merchant={merchant} staff={staff} />
```

### MultiLocationDashboard

Cross-location comparison for merchants with 2-10 locations.

**Focus:**
- Location selector for filtering
- Aggregated metrics (all locations)
- Per-location metrics (when filtered)
- Top/bottom performers
- Location comparison table
- Cross-location trends

**Usage:**
```typescript
import { MultiLocationDashboard } from '@/components/dashboard/layouts/MultiLocationDashboard';

<MultiLocationDashboard merchant={merchant} staff={staff} />
```

### EnterpriseDashboard (To Be Implemented)

Executive dashboard for enterprises with 10+ locations.

**Planned Focus:**
- Executive summary
- Regional breakdowns
- Advanced analytics
- Custom BI widgets
- Predictive insights

---

## Complete Example

Here's a complete dashboard implementation:

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import {
  AdaptiveDashboard,
  DashboardProvider,
  PermissionGate,
} from '@/components/dashboard/AdaptiveDashboard';
import { KPICard, KPIGrid } from '@/components/dashboard/KPICard';
import { DataTable } from '@/components/dashboard/DataTable';
import { LocationSelector } from '@/components/dashboard/LocationSelector';
import { SingleStoreDashboard } from '@/components/dashboard/layouts/SingleStoreDashboard';
import { MultiLocationDashboard } from '@/components/dashboard/layouts/MultiLocationDashboard';

export default function DashboardPage() {
  const { merchant, staff, loading, error } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <AdaptiveDashboard
      merchant={merchant}
      staff={staff}
      singleStoreDashboard={SingleStoreDashboard}
      multiLocationDashboard={MultiLocationDashboard}
      enterpriseDashboard={SingleStoreDashboard} // Fallback for now
    />
  );
}

// Custom Dashboard with Widgets
function CustomDashboard() {
  const { merchant, staff, tenantSize } = useDashboard();

  return (
    <div className="p-6">
      {/* KPI Cards */}
      <KPIGrid columns={4}>
        <KPICard title="Orders" value={142} />

        <PermissionGate
          requiredPermissions={['VIEW_FINANCE']}
          staffPermissions={staff.permissions}
        >
          <KPICard title="Revenue" value="$7,890" />
        </PermissionGate>

        <KPICard title="Customers" value={1245} />
        <KPICard title="Locations" value={tenantSize === 'single' ? 1 : 10} />
      </KPIGrid>

      {/* Data Table */}
      <PermissionGate
        requiredPermissions={['VIEW_ORDERS']}
        staffPermissions={staff.permissions}
      >
        <DataTable
          data={orders}
          columns={orderColumns}
          searchable={true}
          exportable={true}
        />
      </PermissionGate>
    </div>
  );
}
```

---

## Design Principles

All dashboard components follow the **Precision OS v2.0** design system:

1. **Colors**: Solid #0066FF (primary), #00A86B (success), #FF3B30 (danger)
2. **Typography**: Inter Tight (headings), Inter (body)
3. **Spacing**: 8pt grid (4px, 8px, 12px, 16px, 24px, 32px...)
4. **Shadows**: Subtle (0.05-0.1 opacity)
5. **Animations**: Fast (150-200ms), smooth transitions
6. **Accessibility**: WCAG 2.1 Level AA compliant

---

## Performance Considerations

### DataTable
- Use `pagination` for 100+ rows
- For 1,000+ rows, integrate @tanstack/react-virtual:
  ```bash
  npm install @tanstack/react-virtual
  ```

### KPI Cards
- Sparkline renders as SVG (lightweight)
- Loading states prevent layout shift
- Memoize trend calculations for large datasets

### Location Selector
- Searches are client-side (fast for <100 locations)
- For 100+ locations, implement server-side search
- localStorage keeps last 3 recent locations

---

## Related Files

- [KPICard.tsx](./KPICard.tsx) - KPI card component (470 lines)
- [DataTable.tsx](./DataTable.tsx) - Data table component (520 lines)
- [LocationSelector.tsx](./LocationSelector.tsx) - Location selector (390 lines)
- [AdaptiveDashboard.tsx](./AdaptiveDashboard.tsx) - Adaptive wrapper (280 lines)
- [SingleStoreDashboard.tsx](./layouts/SingleStoreDashboard.tsx) - Single store layout (380 lines)
- [MultiLocationDashboard.tsx](./layouts/MultiLocationDashboard.tsx) - Multi-location layout (420 lines)

---

## Migration from v1

If you have existing dashboard components:

```typescript
// Before (v1)
<MetricCard title="Orders" value={142} />

// After (v2)
<KPICard title="Orders" value={142} trend={{ value: 12.5, direction: 'up' }} />

// Before (v1)
<Table data={orders} columns={columns} />

// After (v2)
<DataTable
  data={orders}
  columns={columns}
  searchable={true}
  exportable={true}
/>
```

---

## Testing

### Unit Tests (Jest)

```typescript
import { render, screen } from '@testing-library/react';
import { KPICard } from './KPICard';

test('renders KPI card with trend', () => {
  render(
    <KPICard
      title="Orders"
      value={142}
      trend={{ value: 12.5, direction: 'up' }}
    />
  );

  expect(screen.getByText('Orders')).toBeInTheDocument();
  expect(screen.getByText('142')).toBeInTheDocument();
  expect(screen.getByText('+12.5%')).toBeInTheDocument();
});
```

### Integration Tests (Playwright)

```typescript
test('dashboard loads correctly', async ({ page }) => {
  await page.goto('/dashboard');

  // Check KPI cards
  await expect(page.locator('text=Orders')).toBeVisible();
  await expect(page.locator('text=Revenue')).toBeVisible();

  // Check data table
  await expect(page.locator('table')).toBeVisible();

  // Test location selector
  await page.click('[aria-label="Location selector"]');
  await expect(page.locator('text=All Locations')).toBeVisible();
});
```

---

## Support

For questions or issues:
- [PHASE_3_IMPLEMENTATION_SUMMARY.md](../../../../../PHASE_3_IMPLEMENTATION_SUMMARY.md) - Implementation details
- [ENTERPRISE_DASHBOARD_ARCHITECTURE.md](../../../../../ENTERPRISE_DASHBOARD_ARCHITECTURE.md) - Architecture guide
- [DESIGN_VISION.md](../../../../../DESIGN_VISION.md) - Design philosophy

**Phase 3 Dashboard Components: Complete** ✅
