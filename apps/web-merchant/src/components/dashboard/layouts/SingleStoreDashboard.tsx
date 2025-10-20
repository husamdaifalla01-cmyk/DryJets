'use client';

/**
 * Single Store Dashboard Layout
 * Phase 3: Enterprise Dashboard Architecture
 *
 * Simplified dashboard for merchants with one location
 * Focus on daily operations and immediate priorities
 *
 * Features:
 * - Today's orders and revenue
 * - Equipment status overview
 * - Driver availability
 * - Recent activity
 * - Quick actions
 */

import * as React from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  Truck,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Zap,
} from 'lucide-react';
import { KPICard, KPIGrid, ComparisonKPICard } from '../KPICard';
import { DataTable, Column } from '../DataTable';
import { PermissionGate, MerchantData, StaffData } from '../AdaptiveDashboard';
import { Badge } from '@/components/ui/badge-v2';

export interface SingleStoreDashboardProps {
  merchant: MerchantData;
  staff: StaffData;
}

export function SingleStoreDashboard({ merchant, staff }: SingleStoreDashboardProps) {
  // Mock data - In production, fetch from API
  const todayStats = {
    orders: { value: 24, trend: { value: 12.5, direction: 'up' as const, period: 'day' as const } },
    revenue: {
      value: '$1,245',
      trend: { value: 8.3, direction: 'up' as const, period: 'day' as const },
    },
    avgOrderValue: { value: '$52', trend: { value: 3.2, direction: 'up' as const } },
    pendingPickups: { value: 5, trend: { value: 0, direction: 'neutral' as const } },
  };

  const recentOrders = [
    {
      id: 'ORD-1234',
      customer: 'John Doe',
      status: 'IN_PROCESS',
      items: 8,
      total: 45.0,
      pickupTime: '2:30 PM',
    },
    {
      id: 'ORD-1235',
      customer: 'Jane Smith',
      status: 'READY_FOR_DELIVERY',
      items: 12,
      total: 68.5,
      pickupTime: '3:00 PM',
    },
    {
      id: 'ORD-1236',
      customer: 'Mike Johnson',
      status: 'PICKED_UP',
      items: 5,
      total: 28.0,
      pickupTime: '1:15 PM',
    },
  ];

  const orderColumns: Column<typeof recentOrders[0]>[] = [
    {
      id: 'id',
      header: 'Order ID',
      accessorKey: 'id',
      cell: (value) => (
        <span className="font-mono text-sm font-medium text-[#0066FF]">{value}</span>
      ),
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
      cell: (value) => {
        const statusConfig: Record<string, { label: string; variant: any }> = {
          IN_PROCESS: { label: 'In Process', variant: 'warning' },
          READY_FOR_DELIVERY: { label: 'Ready', variant: 'success' },
          PICKED_UP: { label: 'Picked Up', variant: 'default' },
        };
        const config = statusConfig[value as string] || { label: value, variant: 'default' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: 'items',
      header: 'Items',
      accessorKey: 'items',
      align: 'center',
    },
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'total',
      cell: (value) => `$${value.toFixed(2)}`,
      align: 'right',
    },
    {
      id: 'pickupTime',
      header: 'Pickup',
      accessorKey: 'pickupTime',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0A0A0B] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] dark:text-[#FAFAFA]">
          {merchant.businessName}
        </h1>
        <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6] mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Key Metrics */}
      <KPIGrid columns={4} className="mb-8">
        <KPICard
          title="Today's Orders"
          value={todayStats.orders.value}
          trend={todayStats.orders.trend}
          icon={Package}
          sparklineData={[18, 22, 19, 24, 21, 24]}
        />

        <PermissionGate
          requiredPermissions={['VIEW_FINANCE']}
          staffPermissions={staff.permissions}
          fallback={
            <KPICard
              title="Revenue"
              value="***"
              subtitle="No access"
              icon={DollarSign}
            />
          }
        >
          <KPICard
            title="Today's Revenue"
            value={todayStats.revenue.value}
            trend={todayStats.revenue.trend}
            icon={DollarSign}
            variant="success"
            sparklineData={[950, 1100, 980, 1200, 1150, 1245]}
          />
        </PermissionGate>

        <KPICard
          title="Avg Order Value"
          value={todayStats.avgOrderValue.value}
          trend={todayStats.avgOrderValue.trend}
          icon={TrendingUp}
        />

        <KPICard
          title="Pending Pickups"
          value={todayStats.pendingPickups.value}
          subtitle="Waiting for driver"
          icon={Truck}
          variant={todayStats.pendingPickups.value > 0 ? 'warning' : 'default'}
        />
      </KPIGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Equipment Status */}
        <PermissionGate
          requiredPermissions={['VIEW_EQUIPMENT', 'MANAGE_EQUIPMENT']}
          staffPermissions={staff.permissions}
        >
          <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-[#FAFAFA]">
                Equipment Status
              </h3>
              <Zap className="h-4 w-4 text-[#6B7280] dark:text-[#A1A1A6]" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00A86B]" />
                  <span className="text-sm text-[#111827] dark:text-[#FAFAFA]">
                    Washer #1
                  </span>
                </div>
                <span className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                  Running
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00A86B]" />
                  <span className="text-sm text-[#111827] dark:text-[#FAFAFA]">
                    Dryer #1
                  </span>
                </div>
                <span className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                  Running
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-[#FF9500]" />
                  <span className="text-sm text-[#111827] dark:text-[#FAFAFA]">
                    Presser #1
                  </span>
                </div>
                <span className="text-xs text-[#FF9500]">Maintenance Due</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00A86B]" />
                  <span className="text-sm text-[#111827] dark:text-[#FAFAFA]">
                    Dryer #2
                  </span>
                </div>
                <span className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">Idle</span>
              </div>
            </div>

            <button className="w-full mt-4 text-sm text-[#0066FF] hover:text-[#0052CC] font-medium">
              View All Equipment →
            </button>
          </div>
        </PermissionGate>

        {/* Driver Status */}
        <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#111827] dark:text-[#FAFAFA]">
              Driver Availability
            </h3>
            <Truck className="h-4 w-4 text-[#6B7280] dark:text-[#A1A1A6]" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#00A86B]" />
                <span className="text-sm text-[#111827] dark:text-[#FAFAFA]">
                  Mike Wilson
                </span>
              </div>
              <span className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                Available
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#FF9500]" />
                <span className="text-sm text-[#111827] dark:text-[#FAFAFA]">
                  Sarah Davis
                </span>
              </div>
              <span className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">On Route</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#9CA3AF]" />
                <span className="text-sm text-[#111827] dark:text-[#FAFAFA]">
                  Tom Brown
                </span>
              </div>
              <span className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                Off Duty
              </span>
            </div>
          </div>

          <button className="w-full mt-4 text-sm text-[#0066FF] hover:text-[#0052CC] font-medium">
            Manage Drivers →
          </button>
        </div>

        {/* Quick Stats */}
        <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#111827] dark:text-[#FAFAFA]">
              Quick Stats
            </h3>
            <Clock className="h-4 w-4 text-[#6B7280] dark:text-[#A1A1A6]" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                  Avg Turnaround
                </span>
                <span className="text-sm font-medium text-[#111827] dark:text-[#FAFAFA]">
                  24 hours
                </span>
              </div>
              <div className="h-1.5 bg-[#F3F4F6] dark:bg-[#1A1A1D] rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-[#00A86B]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                  Customer Satisfaction
                </span>
                <span className="text-sm font-medium text-[#111827] dark:text-[#FAFAFA]">
                  4.8/5.0
                </span>
              </div>
              <div className="h-1.5 bg-[#F3F4F6] dark:bg-[#1A1A1D] rounded-full overflow-hidden">
                <div className="h-full w-[96%] bg-[#0066FF]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                  On-Time Delivery
                </span>
                <span className="text-sm font-medium text-[#111827] dark:text-[#FAFAFA]">
                  92%
                </span>
              </div>
              <div className="h-1.5 bg-[#F3F4F6] dark:bg-[#1A1A1D] rounded-full overflow-hidden">
                <div className="h-full w-[92%] bg-[#0066FF]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <PermissionGate
        requiredPermissions={['VIEW_ORDERS']}
        staffPermissions={staff.permissions}
      >
        <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#111827] dark:text-[#FAFAFA]">
              Today's Orders
            </h3>
            <button className="text-sm text-[#0066FF] hover:text-[#0052CC] font-medium">
              View All →
            </button>
          </div>

          <DataTable
            data={recentOrders}
            columns={orderColumns}
            searchable={false}
            pagination={false}
            onRowClick={(row) => console.log('Open order:', row.id)}
          />
        </div>
      </PermissionGate>
    </div>
  );
}
