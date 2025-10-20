# RBAC (Role-Based Access Control) System

**Phase 3: Enterprise Dashboard Architecture**

This RBAC system provides granular permission control for merchant staff members across the DryJets platform.

## Overview

The RBAC system consists of:
- **Database Models**: `StaffPermission`, enhanced `StaffRole` enum
- **Decorators**: `@Permissions()`, `@RequireAllPermissions()`, `@CurrentUser()`
- **Guards**: `PermissionsGuard`
- **Service**: `PermissionsService` (with caching)

## Staff Roles

### Legacy Roles
- `MANAGER` - General manager with most permissions
- `CLEANER` - Limited access (view orders only)
- `PRESSER` - Limited access (view orders only)
- `CASHIER` - Can view and create orders
- `DELIVERY` - View orders only

### Enterprise Roles (Phase 3)
- `STORE_MANAGER` - Full control of single store
- `REGIONAL_MANAGER` - Oversight of multiple stores
- `ENTERPRISE_ADMIN` - Full organization access (all permissions)
- `STAFF_MEMBER` - Limited access employee
- `FINANCE_MANAGER` - Billing and reports only
- `OPERATIONS` - Orders and dispatch operations

## Permissions

```typescript
enum Permission {
  VIEW_ORDERS
  CREATE_ORDERS
  EDIT_ORDERS
  CANCEL_ORDERS
  VIEW_ANALYTICS
  VIEW_FINANCE
  VIEW_REPORTS
  MANAGE_STAFF
  MANAGE_EQUIPMENT
  MANAGE_INVENTORY
  MANAGE_DRIVERS
  MANAGE_SETTINGS
}
```

## Usage Examples

### 1. Basic Permission Check (ANY)

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions, Permission } from '../decorators/permissions.decorator';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  // User needs VIEW_ORDERS permission
  @Get()
  @Permissions(Permission.VIEW_ORDERS)
  async getAllOrders(@CurrentUser() user: CurrentUserData) {
    console.log('Staff ID:', user.staffId);
    console.log('Merchant ID:', user.merchantId);
    return { orders: [] };
  }

  // User needs CREATE_ORDERS permission
  @Post()
  @Permissions(Permission.CREATE_ORDERS)
  async createOrder(@CurrentUser() user: CurrentUserData) {
    return { created: true };
  }

  // User needs EITHER EDIT_ORDERS OR CANCEL_ORDERS (OR logic)
  @Patch(':id')
  @Permissions(Permission.EDIT_ORDERS, Permission.CANCEL_ORDERS)
  async updateOrder(@Param('id') id: string) {
    return { updated: true };
  }
}
```

### 2. Require Multiple Permissions (AND)

```typescript
@Controller('financial-reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinancialReportsController {
  // User needs BOTH VIEW_FINANCE AND VIEW_REPORTS
  @Get()
  @Permissions(Permission.VIEW_FINANCE, Permission.VIEW_REPORTS)
  @RequireAllPermissions() // AND logic
  async getFinancialReports() {
    return { reports: [] };
  }
}
```

### 3. Controller-Level Permissions

```typescript
// All routes in this controller require VIEW_ANALYTICS
@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.VIEW_ANALYTICS)
export class AnalyticsController {
  @Get('overview')
  async getOverview() {
    return { data: {} };
  }

  // This route requires VIEW_ANALYTICS (from controller) AND VIEW_FINANCE
  @Get('revenue')
  @Permissions(Permission.VIEW_FINANCE)
  @RequireAllPermissions()
  async getRevenue() {
    return { revenue: 0 };
  }
}
```

### 4. Access User Info in Controller

```typescript
@Controller('staff')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StaffController {
  @Get('me')
  @Permissions(Permission.VIEW_ORDERS)
  async getMyInfo(@CurrentUser() user: CurrentUserData) {
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      staffId: user.staffId,
      staffRole: user.staffRole,
      merchantId: user.merchantId,
    };
  }
}
```

### 5. Programmatic Permission Check (Service)

```typescript
import { PermissionsService } from '../common/permissions/permissions.service';

@Injectable()
export class CustomService {
  constructor(private permissionsService: PermissionsService) {}

  async doSomething(staffId: string) {
    // Check single permission
    const canView = await this.permissionsService.hasPermission(
      staffId,
      Permission.VIEW_ORDERS,
    );

    // Check ANY permission
    const canModify = await this.permissionsService.hasAnyPermission(staffId, [
      Permission.EDIT_ORDERS,
      Permission.CANCEL_ORDERS,
    ]);

    // Check ALL permissions
    const canManageFinance = await this.permissionsService.hasAllPermissions(
      staffId,
      [Permission.VIEW_FINANCE, Permission.VIEW_REPORTS],
    );

    if (!canView) {
      throw new ForbiddenException('Cannot view orders');
    }
  }
}
```

## Permission Assignment

### Option 1: Derive from Role (Default)

If no explicit `StaffPermission` records exist, permissions are automatically derived from the staff member's role:

```typescript
// In database seeder or staff creation
const staff = await prisma.staff.create({
  data: {
    merchantId: merchant.id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    role: 'STORE_MANAGER', // Automatically gets Store Manager permissions
  },
});
```

### Option 2: Explicit Permission Assignment

For granular control, create explicit `StaffPermission` records:

```typescript
const staff = await prisma.staff.create({
  data: {
    merchantId: merchant.id,
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'STAFF_MEMBER',
    permissions: {
      create: {
        merchantId: merchant.id,
        locationId: location.id, // or null for all locations
        canViewOrders: true,
        canCreateOrders: true,
        canEditOrders: false,
        canCancelOrders: false,
        canViewAnalytics: true,
        canViewFinance: false,
        canManageStaff: false,
        canManageEquipment: false,
        canManageSettings: false,
        canManageInventory: false,
        canManageDrivers: false,
        canViewReports: false,
      },
    },
  },
});
```

## Multi-Location Access Control

The `StaffPermission.locationId` field controls location-level access:

- `locationId: null` = Access to ALL locations
- `locationId: "xyz"` = Access only to specific location

```typescript
// Grant access to specific location only
await prisma.staffPermission.create({
  data: {
    staffId: staff.id,
    merchantId: merchant.id,
    locationId: location.id, // Specific location
    canViewOrders: true,
  },
});

// Grant access to all locations
await prisma.staffPermission.create({
  data: {
    staffId: staff.id,
    merchantId: merchant.id,
    locationId: null, // All locations
    canViewOrders: true,
  },
});
```

## Caching

The `PermissionsService` caches permissions for 5 minutes to reduce database queries.

### Clear Cache

```typescript
// Clear cache for specific staff member (e.g., after permission update)
permissionsService.clearCache(staffId);

// Clear all cache
permissionsService.clearAllCache();
```

## Testing

### Unit Test Example

```typescript
import { Test } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PrismaService,
          useValue: {
            staff: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(PermissionsService);
    prisma = module.get(PrismaService);
  });

  it('should return permissions for ENTERPRISE_ADMIN role', async () => {
    jest.spyOn(prisma.staff, 'findUnique').mockResolvedValue({
      id: 'staff-1',
      role: 'ENTERPRISE_ADMIN',
      permissions: [],
    } as any);

    const permissions = await service.getStaffPermissions('staff-1');
    expect(permissions).toContain('VIEW_ORDERS');
    expect(permissions).toContain('MANAGE_STAFF');
  });
});
```

## Migration from v1

If you have existing staff without the new roles, you can migrate them:

```typescript
// Update existing managers to STORE_MANAGER
await prisma.staff.updateMany({
  where: { role: 'MANAGER' },
  data: { role: 'STORE_MANAGER' },
});
```

## Security Best Practices

1. **Always use both guards**: `@UseGuards(JwtAuthGuard, PermissionsGuard)`
2. **Principle of least privilege**: Grant minimum permissions needed
3. **Audit logging**: Log permission changes (use `AuditLog` model)
4. **Regular reviews**: Periodically review staff permissions
5. **Clear cache on changes**: Call `clearCache()` after permission updates

## Architecture Diagram

```
┌─────────────────┐
│   Controller    │
│   @Permissions  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PermissionsGuard│
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│PermissionsService├─────►│ Prisma DB    │
│   (with cache)  │      │ Staff        │
└─────────────────┘      │ StaffPerm... │
                         └──────────────┘
```

## Related Files

- `/apps/api/src/decorators/permissions.decorator.ts` - Decorators
- `/apps/api/src/decorators/current-user.decorator.ts` - User decorator
- `/apps/api/src/guards/permissions.guard.ts` - Guard implementation
- `/apps/api/src/common/permissions/permissions.service.ts` - Service
- `/apps/api/src/common/permissions/permissions.module.ts` - Module
- `/packages/database/prisma/schema.prisma` - Database models

## Support

For questions or issues, see:
- [ENTERPRISE_DASHBOARD_ARCHITECTURE.md](../../../../../../ENTERPRISE_DASHBOARD_ARCHITECTURE.md)
- [PHASE_1_2_3_SUMMARY.md](../../../../../../PHASE_1_2_3_SUMMARY.md)
