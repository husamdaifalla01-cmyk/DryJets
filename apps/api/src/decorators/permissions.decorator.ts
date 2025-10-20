import { SetMetadata } from '@nestjs/common';

/**
 * Permission Types for RBAC
 * Phase 3: Enterprise Dashboard Architecture
 */
export enum Permission {
  // Order permissions
  VIEW_ORDERS = 'VIEW_ORDERS',
  CREATE_ORDERS = 'CREATE_ORDERS',
  EDIT_ORDERS = 'EDIT_ORDERS',
  CANCEL_ORDERS = 'CANCEL_ORDERS',

  // Analytics & Finance
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  VIEW_FINANCE = 'VIEW_FINANCE',
  VIEW_REPORTS = 'VIEW_REPORTS',

  // Staff management
  MANAGE_STAFF = 'MANAGE_STAFF',

  // Equipment management
  MANAGE_EQUIPMENT = 'MANAGE_EQUIPMENT',

  // Inventory management
  MANAGE_INVENTORY = 'MANAGE_INVENTORY',

  // Driver management
  MANAGE_DRIVERS = 'MANAGE_DRIVERS',

  // Settings
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
}

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to define required permissions for a route
 *
 * @example
 * ```typescript
 * @Permissions(Permission.VIEW_ORDERS, Permission.CREATE_ORDERS)
 * @Get('orders')
 * async getOrders() {
 *   // This route requires VIEW_ORDERS OR CREATE_ORDERS permission
 * }
 * ```
 *
 * @example Require all permissions (AND logic)
 * ```typescript
 * @Permissions(Permission.VIEW_FINANCE, Permission.VIEW_REPORTS)
 * @RequireAllPermissions()
 * @Get('financial-reports')
 * async getFinancialReports() {
 *   // This route requires VIEW_FINANCE AND VIEW_REPORTS permissions
 * }
 * ```
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Metadata key for requiring all permissions (AND logic)
 * Default behavior is OR logic (any permission grants access)
 */
export const REQUIRE_ALL_KEY = 'requireAllPermissions';

/**
 * Decorator to require ALL specified permissions instead of ANY
 */
export const RequireAllPermissions = () => SetMetadata(REQUIRE_ALL_KEY, true);
