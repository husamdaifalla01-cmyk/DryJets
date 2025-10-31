import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Permission } from '../../decorators/permissions.decorator';
import { StaffRole } from '@dryjets/database';

/**
 * Permissions Service
 * Phase 3: Enterprise Dashboard Architecture - RBAC
 *
 * Handles fetching and caching staff permissions from the database
 */
@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);
  private permissionCache = new Map<string, string[]>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private prisma: PrismaService) {}

  /**
   * Get permissions for a staff member by staffId
   * Uses caching to reduce database queries
   */
  async getStaffPermissions(staffId: string): Promise<string[]> {
    // Check cache first
    const cached = this.permissionCache.get(staffId);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        permissions: true,
      },
    });

    if (!staff) {
      this.logger.warn(`Staff not found: ${staffId}`);
      return [];
    }

    // If staff has no explicit permissions, derive from role
    if (!staff.permissions || staff.permissions.length === 0) {
      return this.getPermissionsFromRole(staff.role);
    }

    // Convert StaffPermission records to Permission enum array
    const permissions: string[] = [];
    staff.permissions.forEach((perm) => {
      if (perm.canViewOrders) permissions.push(Permission.VIEW_ORDERS);
      if (perm.canCreateOrders) permissions.push(Permission.CREATE_ORDERS);
      if (perm.canEditOrders) permissions.push(Permission.EDIT_ORDERS);
      if (perm.canCancelOrders) permissions.push(Permission.CANCEL_ORDERS);
      if (perm.canViewAnalytics) permissions.push(Permission.VIEW_ANALYTICS);
      if (perm.canViewFinance) permissions.push(Permission.VIEW_FINANCE);
      if (perm.canManageStaff) permissions.push(Permission.MANAGE_STAFF);
      if (perm.canManageEquipment) permissions.push(Permission.MANAGE_EQUIPMENT);
      if (perm.canManageSettings) permissions.push(Permission.MANAGE_SETTINGS);
      if (perm.canManageInventory) permissions.push(Permission.MANAGE_INVENTORY);
      if (perm.canManageDrivers) permissions.push(Permission.MANAGE_DRIVERS);
      if (perm.canViewReports) permissions.push(Permission.VIEW_REPORTS);
    });

    // Cache the result
    this.permissionCache.set(staffId, permissions);
    setTimeout(() => this.permissionCache.delete(staffId), this.CACHE_TTL);

    return permissions;
  }

  /**
   * Get default permissions based on staff role
   * Fallback when no explicit permissions are set
   */
  private getPermissionsFromRole(role: StaffRole): string[] {
    const rolePermissions: Record<StaffRole, string[]> = {
      // Legacy roles
      MANAGER: [
        Permission.VIEW_ORDERS,
        Permission.CREATE_ORDERS,
        Permission.EDIT_ORDERS,
        Permission.CANCEL_ORDERS,
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_STAFF,
        Permission.MANAGE_EQUIPMENT,
        Permission.MANAGE_INVENTORY,
      ],
      CLEANER: [Permission.VIEW_ORDERS],
      PRESSER: [Permission.VIEW_ORDERS],
      CASHIER: [Permission.VIEW_ORDERS, Permission.CREATE_ORDERS],
      DELIVERY: [Permission.VIEW_ORDERS],

      // Enterprise roles (Phase 3)
      STORE_MANAGER: [
        Permission.VIEW_ORDERS,
        Permission.CREATE_ORDERS,
        Permission.EDIT_ORDERS,
        Permission.CANCEL_ORDERS,
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_FINANCE,
        Permission.VIEW_REPORTS,
        Permission.MANAGE_STAFF,
        Permission.MANAGE_EQUIPMENT,
        Permission.MANAGE_INVENTORY,
        Permission.MANAGE_SETTINGS,
      ],
      REGIONAL_MANAGER: [
        Permission.VIEW_ORDERS,
        Permission.CREATE_ORDERS,
        Permission.EDIT_ORDERS,
        Permission.CANCEL_ORDERS,
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_FINANCE,
        Permission.VIEW_REPORTS,
        Permission.MANAGE_STAFF,
        Permission.MANAGE_EQUIPMENT,
        Permission.MANAGE_INVENTORY,
        Permission.MANAGE_SETTINGS,
        Permission.MANAGE_DRIVERS,
      ],
      ENTERPRISE_ADMIN: [
        // Full access
        Permission.VIEW_ORDERS,
        Permission.CREATE_ORDERS,
        Permission.EDIT_ORDERS,
        Permission.CANCEL_ORDERS,
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_FINANCE,
        Permission.VIEW_REPORTS,
        Permission.MANAGE_STAFF,
        Permission.MANAGE_EQUIPMENT,
        Permission.MANAGE_INVENTORY,
        Permission.MANAGE_SETTINGS,
        Permission.MANAGE_DRIVERS,
      ],
      STAFF_MEMBER: [Permission.VIEW_ORDERS],
      FINANCE_MANAGER: [
        Permission.VIEW_ORDERS,
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_FINANCE,
        Permission.VIEW_REPORTS,
      ],
      OPERATIONS: [
        Permission.VIEW_ORDERS,
        Permission.CREATE_ORDERS,
        Permission.EDIT_ORDERS,
        Permission.MANAGE_DRIVERS,
      ],
    };

    return rolePermissions[role] || [];
  }

  /**
   * Check if staff has a specific permission
   */
  async hasPermission(staffId: string, permission: Permission): Promise<boolean> {
    const permissions = await this.getStaffPermissions(staffId);
    return permissions.includes(permission);
  }

  /**
   * Check if staff has ANY of the specified permissions (OR logic)
   */
  async hasAnyPermission(staffId: string, permissions: Permission[]): Promise<boolean> {
    const staffPermissions = await this.getStaffPermissions(staffId);
    return permissions.some((p) => staffPermissions.includes(p));
  }

  /**
   * Check if staff has ALL of the specified permissions (AND logic)
   */
  async hasAllPermissions(staffId: string, permissions: Permission[]): Promise<boolean> {
    const staffPermissions = await this.getStaffPermissions(staffId);
    return permissions.every((p) => staffPermissions.includes(p));
  }

  /**
   * Clear permissions cache for a staff member
   * Call this when permissions are updated
   */
  clearCache(staffId: string): void {
    this.permissionCache.delete(staffId);
  }

  /**
   * Clear all permissions cache
   */
  clearAllCache(): void {
    this.permissionCache.clear();
  }
}
