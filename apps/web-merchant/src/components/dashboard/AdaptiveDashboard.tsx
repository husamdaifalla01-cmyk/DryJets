'use client';

/**
 * Adaptive Dashboard Wrapper
 * Phase 3: Enterprise Dashboard Architecture
 *
 * Detects tenant size and loads appropriate dashboard layout
 * Routes to Single Store, Multi-Location, or Enterprise dashboards
 *
 * Features:
 * - Automatic tenant detection based on location count
 * - Role-based widget visibility
 * - Permission-aware rendering
 * - Loading states
 * - Error boundaries
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';

export type TenantSize = 'single' | 'multi' | 'enterprise';
export type StaffRole =
  | 'MANAGER'
  | 'CLEANER'
  | 'PRESSER'
  | 'CASHIER'
  | 'DELIVERY'
  | 'STORE_MANAGER'
  | 'REGIONAL_MANAGER'
  | 'ENTERPRISE_ADMIN'
  | 'STAFF_MEMBER'
  | 'FINANCE_MANAGER'
  | 'OPERATIONS';

export interface MerchantData {
  id: string;
  businessName: string;
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  locations: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    isActive: boolean;
  }>;
}

export interface StaffData {
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  permissions: string[];
}

export interface AdaptiveDashboardProps {
  merchant: MerchantData;
  staff: StaffData;
  loading?: boolean;
  error?: Error;

  // Dashboard components
  singleStoreDashboard: React.ComponentType<{
    merchant: MerchantData;
    staff: StaffData;
  }>;
  multiLocationDashboard: React.ComponentType<{
    merchant: MerchantData;
    staff: StaffData;
  }>;
  enterpriseDashboard: React.ComponentType<{
    merchant: MerchantData;
    staff: StaffData;
  }>;
}

export function AdaptiveDashboard({
  merchant,
  staff,
  loading = false,
  error,
  singleStoreDashboard: SingleStoreDashboard,
  multiLocationDashboard: MultiLocationDashboard,
  enterpriseDashboard: EnterpriseDashboard,
}: AdaptiveDashboardProps) {
  // Determine tenant size based on active locations
  const tenantSize = React.useMemo((): TenantSize => {
    const activeLocations = merchant.locations.filter((loc) => loc.isActive);

    if (activeLocations.length === 1) {
      return 'single';
    } else if (activeLocations.length <= 10) {
      return 'multi';
    } else {
      return 'enterprise';
    }
  }, [merchant.locations]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#0066FF] mx-auto" />
          <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-12 w-12 rounded-full bg-[#FF3B30]/10 flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-[#111827] dark:text-[#FAFAFA]">
            Failed to load dashboard
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#0066FF] text-white rounded-lg hover:bg-[#0052CC] transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on tenant size
  switch (tenantSize) {
    case 'single':
      return <SingleStoreDashboard merchant={merchant} staff={staff} />;

    case 'multi':
      return <MultiLocationDashboard merchant={merchant} staff={staff} />;

    case 'enterprise':
      return <EnterpriseDashboard merchant={merchant} staff={staff} />;

    default:
      return <SingleStoreDashboard merchant={merchant} staff={staff} />;
  }
}

/**
 * Hook to detect tenant size
 */
export function useTenantSize(locationCount: number): TenantSize {
  return React.useMemo(() => {
    if (locationCount === 1) return 'single';
    if (locationCount <= 10) return 'multi';
    return 'enterprise';
  }, [locationCount]);
}

/**
 * Hook to check staff permissions
 */
export function useStaffPermissions(permissions: string[]) {
  const hasPermission = React.useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = React.useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.some((perm) => permissions.includes(perm));
    },
    [permissions]
  );

  const hasAllPermissions = React.useCallback(
    (requiredPermissions: string[]): boolean => {
      return requiredPermissions.every((perm) => permissions.includes(perm));
    },
    [permissions]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
  };
}

/**
 * Permission-aware widget wrapper
 * Conditionally renders children based on required permissions
 */
export interface PermissionGateProps {
  requiredPermissions: string[];
  staffPermissions: string[];
  requireAll?: boolean; // If true, require ALL permissions; if false, require ANY
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  requiredPermissions,
  staffPermissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const hasAccess = React.useMemo(() => {
    if (requireAll) {
      return requiredPermissions.every((perm) => staffPermissions.includes(perm));
    } else {
      return requiredPermissions.some((perm) => staffPermissions.includes(perm));
    }
  }, [requiredPermissions, staffPermissions, requireAll]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Role-based widget wrapper
 * Conditionally renders children based on staff role
 */
export interface RoleGateProps {
  allowedRoles: StaffRole[];
  staffRole: StaffRole;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGate({
  allowedRoles,
  staffRole,
  fallback = null,
  children,
}: RoleGateProps) {
  const hasAccess = allowedRoles.includes(staffRole);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Dashboard layout context
 * Provides tenant and staff info to all dashboard widgets
 */
interface DashboardContextValue {
  merchant: MerchantData;
  staff: StaffData;
  tenantSize: TenantSize;
}

const DashboardContext = React.createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  merchant,
  staff,
  children,
}: {
  merchant: MerchantData;
  staff: StaffData;
  children: React.ReactNode;
}) {
  const tenantSize = useTenantSize(merchant.locations.filter((loc) => loc.isActive).length);

  const value: DashboardContextValue = {
    merchant,
    staff,
    tenantSize,
  };

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
