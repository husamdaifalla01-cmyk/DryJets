# Enterprise Dashboard Architecture — "Operational Command Center"

**Version:** 3.0
**Date:** October 19, 2025
**Status:** Implementation Ready

---

## Executive Summary

The DryJets Enterprise Dashboard is a workflow-driven operational hub that scales from single stores to multi-location enterprises (100+ locations). It features role-based access, real-time operations tracking, and adaptive UI that changes based on tenant size and user role.

---

## Architecture Overview

### Multi-Tenant Data Model

**Current Schema Has:**
- ✅ Merchant (single entity)
- ✅ MerchantLocation (multi-location support exists!)
- ✅ Staff (with roles: MANAGER, CLEANER, PRESSER, CASHIER, DELIVERY)
- ✅ Order workflow states (19 statuses from PENDING_PAYMENT to PICKED_UP_BY_CUSTOMER)
- ✅ Equipment with IoT telemetry
- ✅ Audit trail (OrderStatusHistory)

**Extensions Needed:**
```prisma
// Add to schema.prisma

// Enhanced merchant staff roles for enterprise
enum MerchantStaffRole {
  STORE_MANAGER      // Single store management
  REGIONAL_MANAGER   // Multi-store oversight
  ENTERPRISE_ADMIN   // Full organization access
  STAFF_MEMBER       // Limited access
  FINANCE_MANAGER    // Billing & reports only
  OPERATIONS         // Orders & dispatch only
}

// Role permissions
model StaffPermission {
  id           String   @id @default(cuid())
  staffId      String
  merchantId   String
  locationId   String?  // null = all locations

  // Module permissions
  canViewOrders      Boolean @default(false)
  canCreateOrders    Boolean @default(false)
  canEditOrders      Boolean @default(false)
  canCancelOrders    Boolean @default(false)

  canViewAnalytics   Boolean @default(false)
  canViewFinance     Boolean @default(false)
  canManageStaff     Boolean @default(false)
  canManageEquipment Boolean @default(false)
  canManageSettings  Boolean @default(false)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  staff        Staff    @relation(fields: [staffId], references: [id])

  @@index([staffId])
  @@index([merchantId])
}

// Workflow state persistence
model WorkflowState {
  id           String   @id @default(cuid())
  userId       String
  workflowType String   // "CREATE_ORDER", "SCHEDULE_MAINTENANCE", etc.
  stepIndex    Int      @default(0)
  data         Json     // Current form data
  completedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId, workflowType])
}

// Audit logging
model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  merchantId  String
  locationId  String?
  action      String   // "ORDER_CREATED", "ORDER_CANCELLED", etc.
  entityType  String   // "Order", "Staff", "Equipment"
  entityId    String
  changes     Json?    // Before/after diff
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([merchantId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

---

## Dashboard Layouts

### 1. **Single Store Dashboard**
**Target:** Small businesses (1 location, 1-10 staff)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [4 KPI Cards]: Revenue | Orders | Equipment | CSAT│
├─────────────────────────────────────────────────┤
│ Today's Schedule    │  Recent Orders (5)        │
│ (Pickups/Deliveries)│  [Status badges]          │
├─────────────────────────────────────────────────┤
│ Equipment Status    │  Quick Actions            │
│ (Health rings)      │  [+ New Order] [Schedule] │
└─────────────────────────────────────────────────┘
```

**Features:**
- Simplified metrics (daily focus)
- One-click order creation
- Equipment alerts prominent
- Mobile-optimized

### 2. **Multi-Location Dashboard**
**Target:** Franchises (2-20 locations, 10-50 staff)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Location Selector: [All Locations ▾]            │
├─────────────────────────────────────────────────┤
│ [Aggregated KPI Cards - All Locations]          │
│ Revenue | Orders | Active Locations | Alerts    │
├─────────────────────────────────────────────────┤
│ Location Comparison Table                       │
│ Name      | Orders | Revenue | Health | Alerts  │
│ Store A   | 45     | $2,340  | 92%    | 1       │
│ Store B   | 32     | $1,890  | 88%    | 0       │
├─────────────────────────────────────────────────┤
│ Alerts Dashboard    │  Performance Charts       │
│ [Store A: Alert]    │  [Revenue trends]         │
└─────────────────────────────────────────────────┘
```

**Features:**
- Location switcher in header
- Cross-location comparisons
- Drill-down to single location view
- Regional alerts aggregation

### 3. **Enterprise Dashboard**
**Target:** Large organizations (20+ locations, 100+ staff)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Region: [All Regions ▾]  Period: [This Month ▾] │
├─────────────────────────────────────────────────┤
│ Executive Metrics (High-level KPIs)             │
│ [$1.2M Revenue] [4,230 Orders] [98% CSAT]      │
├─────────────────────────────────────────────────┤
│ Workflow Status Grid                            │
│ Orders: 234 active | Maintenance: 12 scheduled  │
│ Deliveries: 45 in-transit | Alerts: 8 open     │
├─────────────────────────────────────────────────┤
│ Geographic Map View (Interactive)               │
│ [Map with location markers, order density]      │
├─────────────────────────────────────────────────┤
│ Business Intelligence Dashboard                 │
│ [Advanced charts: trends, cohorts, forecasts]   │
└─────────────────────────────────────────────────┘
```

**Features:**
- Executive summary view
- Real-time workflow tracking
- Geographic insights
- Advanced BI tools
- Drill-down to any location/region

---

## Core Workflows

### 1. **Order Management Workflow**
**19-Step Workflow (from schema):**
```
1. PENDING_PAYMENT
2. PAYMENT_CONFIRMED
3. AWAITING_CUSTOMER_DROPOFF (self-service)
4. DRIVER_ASSIGNED (pickup)
5. PICKED_UP
6. IN_TRANSIT_TO_MERCHANT
7. RECEIVED_BY_MERCHANT
8. IN_PROCESS (cleaning/processing)
9. READY_FOR_DELIVERY
10. READY_FOR_CUSTOMER_PICKUP (self-service)
11. OUT_FOR_DELIVERY
12. DELIVERED
13. PICKED_UP_BY_CUSTOMER
14. CANCELLED
15. REFUNDED
```

**UI Component:** `<WorkflowStepper steps={orderSteps} currentStep={order.status} />`

### 2. **Appointment Workflow**
**5-Step Workflow:**
```
1. Schedule Appointment
2. Customer Confirmation
3. Driver Assignment
4. Pickup Execution
5. Completion
```

### 3. **Maintenance Workflow**
**5-Step Workflow:**
```
1. Equipment Alert Generated
2. Schedule Maintenance
3. Technician Assignment
4. Service Execution
5. Equipment Verification
```

---

## Component Architecture

### Core Components (To Build)

#### 1. **AdaptiveDashboard**
```tsx
<AdaptiveDashboard
  tenantType="single|multi|enterprise"
  locationCount={merchant.locations.length}
  userRole={currentUser.role}
/>
```

Renders appropriate layout based on tenant size.

#### 2. **WorkflowStepper**
```tsx
<WorkflowStepper
  steps={[
    { label: "Payment", status: "complete" },
    { label: "Pickup", status: "current" },
    { label: "Processing", status: "pending" },
  ]}
  orientation="horizontal|vertical"
/>
```

Visual progress indicator for multi-step processes.

#### 3. **NestedPanel**
```tsx
<NestedPanel
  trigger={<OrderCard order={order} />}
  onOpen={() => fetchOrderDetails(order.id)}
>
  <OrderDetails order={order} />
</NestedPanel>
```

Drill-down without navigation (slide-in from right).

#### 4. **LocationSelector**
```tsx
<LocationSelector
  locations={merchant.locations}
  selected={currentLocation}
  onSelect={setLocation}
  showAggregated={true}  // "All Locations" option
/>
```

Dropdown/modal for multi-location users.

#### 5. **KPICard** (Enterprise-style)
```tsx
<KPICard
  title="Revenue"
  value="$12,450"
  trend="+12.5%"
  trendDirection="up"
  sparkline={[120, 140, 130, 150, 160]}
  comparison="vs last month"
/>
```

Clean metric cards with trends (no gradients).

#### 6. **DataTable** (High-performance)
```tsx
<DataTable
  columns={[
    { key: "orderNumber", label: "Order #" },
    { key: "customer", label: "Customer" },
    { key: "status", label: "Status", render: StatusBadge },
  ]}
  data={orders}
  sortable
  filterable
  pagination
  bulkActions={["Assign Driver", "Export", "Mark Complete"]}
/>
```

Enterprise-grade table with virtual scrolling.

---

## Role-Based Access Control

### Permission Matrix

| Feature | Store Manager | Regional Manager | Enterprise Admin | Staff | Finance |
|---------|---------------|------------------|------------------|-------|---------|
| View Orders | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create Orders | ✅ | ✅ | ✅ | ✅ | ❌ |
| Cancel Orders | ✅ | ✅ | ✅ | ❌ | ❌ |
| View All Locations | ❌ | ✅ | ✅ | ❌ | ✅ |
| Manage Staff | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Finance | ✅ | ✅ | ✅ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ✅ | ❌ | ❌ |

### Implementation
```tsx
// HOC for permission checking
<RequirePermission permission="orders.create">
  <Button onClick={createOrder}>New Order</Button>
</RequirePermission>

// Hook
const { hasPermission } = usePermissions();
if (hasPermission('analytics.view')) {
  // Show analytics
}
```

---

## Real-Time Features

### WebSocket Integration

**Events:**
- `order.status_changed` — Update order cards in real-time
- `driver.location_updated` — Update map markers
- `equipment.telemetry` — Live health scores
- `alert.created` — Toast notification

**Implementation:**
```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

function Dashboard() {
  useWebSocket('orders', (event) => {
    if (event.type === 'order.status_changed') {
      updateOrderInUI(event.data);
    }
  });
}
```

---

## Integration Points

### External APIs

**1. Consumer App → Dashboard**
- Order creation (POST /api/orders)
- Order status queries (GET /api/orders/:id)
- Payment status (GET /api/payments/:id)

**2. Driver App → Dashboard**
- Location updates (POST /api/drivers/:id/location)
- Delivery confirmations (POST /api/orders/:id/confirm-delivery)
- Route data (GET /api/dispatch/routes)

**3. Payment Gateway (Stripe)**
- Multi-tenant payouts (Stripe Connect)
- Split payments (platform fee, merchant payout, driver payout)

**4. Analytics/BI Tools**
- Data export API (GET /api/analytics/export)
- Webhook for events

---

## Implementation Roadmap

### Week 1-2: Database & Backend
- [ ] Add StaffPermission, WorkflowState, AuditLog models
- [ ] Migrate database
- [ ] Create RBAC middleware
- [ ] Create workflow state API endpoints

### Week 3-4: Core Components
- [ ] Build WorkflowStepper component
- [ ] Build NestedPanel component
- [ ] Build KPICard component (v2 style)
- [ ] Build DataTable component
- [ ] Build LocationSelector

### Week 5-6: Dashboard Layouts
- [ ] Create AdaptiveDashboard wrapper
- [ ] Build Single Store layout
- [ ] Build Multi-Location layout
- [ ] Build Enterprise layout

### Week 7-8: Workflow UIs
- [ ] Order Management workflow UI
- [ ] Appointment booking workflow
- [ ] Maintenance scheduling workflow
- [ ] Driver assignment UI

### Week 9-10: Integration & Polish
- [ ] WebSocket real-time updates
- [ ] Role-based UI filtering
- [ ] Audit logging integration
- [ ] Performance optimization
- [ ] Documentation

---

## Success Metrics

- **Workflow completion time:** -50% (vs current manual process)
- **Multi-location support:** 100+ locations per enterprise
- **Concurrent users:** 1,000+ simultaneous users
- **Page load time:** <2s (dashboard with 100+ orders)
- **Real-time latency:** <500ms (WebSocket updates)
- **Mobile responsiveness:** 100% feature parity on tablet

---

## Security & Compliance

**Audit Logging:**
- Every user action logged (create, edit, delete, view)
- IP address and user agent tracked
- Retention: 7 years (compliance requirement)

**Data Isolation:**
- Tenant-level data separation (merchantId filter on all queries)
- Location-level access control (staff can only see assigned locations)
- Role-based visibility (FINANCE_MANAGER can't see order details, only reports)

**Encryption:**
- Data at rest: PostgreSQL encryption
- Data in transit: TLS 1.3
- Sensitive fields: Payment info encrypted with Stripe vault

---

This architecture supports the entire spectrum from a single dry cleaner to a national enterprise with 100+ locations!
