'use client';

/**
 * Multi-Location Dashboard Layout
 * Phase 3: Enterprise Dashboard Architecture
 *
 * Dashboard for merchants with 2-10 locations
 * Focus on cross-location comparisons and aggregated metrics
 *
 * Features:
 * - Location selector for filtering
 * - Aggregated vs per-location metrics
 * - Location comparison table
 * - Top/bottom performers
 * - Cross-location trends
 */

import * as React from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  MapPin,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import { KPICard, KPIGrid, ComparisonKPICard } from '../KPICard';
import { DataTable, Column } from '../DataTable';
import { LocationSelector, useLocationSelection } from '../LocationSelector';
import { PermissionGate, MerchantData, StaffData } from '../AdaptiveDashboard';
import { Badge } from '@/components/ui/badge-v2';

export interface MultiLocationDashboardProps {
  merchant: MerchantData;
  staff: StaffData;
}

export function MultiLocationDashboard({ merchant, staff }: MultiLocationDashboardProps) {
  const { selectedLocationId, setSelectedLocationId } = useLocationSelection(
    merchant.locations,
    'dryjets_multi_location_filter'
  );

  // Mock data - In production, fetch from API based on selectedLocationId
  const aggregateStats = {
    totalOrders: {
      value: selectedLocationId ? 24 : 142,
      trend: { value: 12.5, direction: 'up' as const, period: 'week' as const },
    },
    totalRevenue: {
      value: selectedLocationId ? '$1,245' : '$7,890',
      trend: { value: 8.3, direction: 'up' as const, period: 'week' as const },
    },
    avgOrderValue: {
      value: '$52',
      trend: { value: 3.2, direction: 'up' as const },
    },
    activeLocations: {
      value: selectedLocationId ? 1 : merchant.locations.filter((l) => l.isActive).length,
    },
  };

  const locationPerformance = [
    {
      id: 'loc-1',
      name: 'Downtown Store',
      city: 'San Francisco',
      orders: 48,
      revenue: 2450,
      efficiency: 95,
      status: 'good',
    },
    {
      id: 'loc-2',
      name: 'Marina District',
      city: 'San Francisco',
      orders: 42,
      revenue: 2180,
      efficiency: 92,
      status: 'good',
    },
    {
      id: 'loc-3',
      name: 'Mission Store',
      city: 'San Francisco',
      orders: 35,
      revenue: 1820,
      efficiency: 88,
      status: 'warning',
    },
    {
      id: 'loc-4',
      name: 'Sunset Store',
      city: 'San Francisco',
      orders: 17,
      revenue: 890,
      efficiency: 72,
      status: 'danger',
    },
  ];

  const locationColumns: Column<typeof locationPerformance[0]>[] = [
    {
      id: 'name',
      header: 'Location',
      accessorKey: 'name',
      cell: (value, row) => (
        <div>
          <p className="font-medium text-[#111827] dark:text-[#FAFAFA]">{value}</p>
          <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">{row.city}</p>
        </div>
      ),
    },
    {
      id: 'orders',
      header: 'Orders',
      accessorKey: 'orders',
      cell: (value) => <span className="font-medium">{value}</span>,
      align: 'center',
    },
    {
      id: 'revenue',
      header: 'Revenue',
      accessorKey: 'revenue',
      cell: (value) => (
        <span className="font-medium">${value.toLocaleString()}</span>
      ),
      align: 'right',
    },
    {
      id: 'efficiency',
      header: 'Efficiency',
      accessorKey: 'efficiency',
      cell: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="h-2 bg-[#F3F4F6] dark:bg-[#1A1A1D] rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  row.status === 'good' && 'bg-[#00A86B]',
                  row.status === 'warning' && 'bg-[#FF9500]',
                  row.status === 'danger' && 'bg-[#FF3B30]'
                )}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium w-10 text-right">{value}%</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: (value) => {
        const statusConfig: Record<string, { label: string; variant: any }> = {
          good: { label: 'Performing Well', variant: 'success' },
          warning: { label: 'Needs Attention', variant: 'warning' },
          danger: { label: 'Underperforming', variant: 'danger' },
        };
        const config = statusConfig[value as string] || {
          label: value,
          variant: 'default',
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
  ];

  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0A0A0B] p-6">
      {/* Header with Location Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#FAFAFA]">
            {merchant.businessName}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6] mt-1">
            Multi-Location Dashboard
          </p>
        </div>

        <LocationSelector
          locations={merchant.locations}
          selectedLocationId={selectedLocationId}
          onLocationChange={setSelectedLocationId}
          showAllOption={true}
          allOptionLabel="All Locations"
        />
      </div>

      {/* Aggregate Metrics */}
      <KPIGrid columns={4} className="mb-8">
        <KPICard
          title={selectedLocationId ? "Location Orders" : "Total Orders"}
          value={aggregateStats.totalOrders.value}
          subtitle={selectedLocationId ? "Today" : "Across all locations"}
          trend={aggregateStats.totalOrders.trend}
          icon={Package}
          sparklineData={[120, 135, 128, 142, 138, 142]}
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
            title={selectedLocationId ? "Location Revenue" : "Total Revenue"}
            value={aggregateStats.totalRevenue.value}
            subtitle="This week"
            trend={aggregateStats.totalRevenue.trend}
            icon={DollarSign}
            variant="success"
            sparklineData={[6500, 7200, 6900, 7500, 7300, 7890]}
          />
        </PermissionGate>

        <KPICard
          title="Avg Order Value"
          value={aggregateStats.avgOrderValue.value}
          trend={aggregateStats.avgOrderValue.trend}
          icon={TrendingUp}
        />

        <KPICard
          title="Active Locations"
          value={aggregateStats.activeLocations.value}
          subtitle={`of ${merchant.locations.length} total`}
          icon={MapPin}
        />
      </KPIGrid>

      {/* Location Comparison (only show if viewing all locations) */}
      {!selectedLocationId && (
        <>
          {/* Top/Bottom Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-[#00A86B]" />
                <h3 className="text-lg font-semibold text-[#111827] dark:text-[#FAFAFA]">
                  Top Performers
                </h3>
              </div>

              <div className="space-y-4">
                {locationPerformance.slice(0, 2).map((location, index) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] dark:bg-[#161618]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#00A86B]/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#00A86B]">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[#111827] dark:text-[#FAFAFA]">
                          {location.name}
                        </p>
                        <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                          {location.orders} orders · ${location.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#00A86B]">
                        {location.efficiency}%
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                        efficiency
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-[#FF9500]" />
                <h3 className="text-lg font-semibold text-[#111827] dark:text-[#FAFAFA]">
                  Needs Attention
                </h3>
              </div>

              <div className="space-y-4">
                {locationPerformance.slice(-2).reverse().map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] dark:bg-[#161618]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-[#FF9500]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#111827] dark:text-[#FAFAFA]">
                          {location.name}
                        </p>
                        <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                          {location.orders} orders · ${location.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          location.status === 'warning' && 'text-[#FF9500]',
                          location.status === 'danger' && 'text-[#FF3B30]'
                        )}
                      >
                        {location.efficiency}%
                      </p>
                      <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                        efficiency
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location Performance Table */}
          <PermissionGate
            requiredPermissions={['VIEW_ANALYTICS']}
            staffPermissions={staff.permissions}
          >
            <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#111827] dark:text-[#FAFAFA]">
                  Location Performance
                </h3>
                <button className="text-sm text-[#0066FF] hover:text-[#0052CC] font-medium">
                  Export Report →
                </button>
              </div>

              <DataTable
                data={locationPerformance}
                columns={locationColumns}
                searchable={true}
                searchPlaceholder="Search locations..."
                pagination={false}
                exportable={true}
                exportFilename="location-performance.csv"
                onRowClick={(row) => setSelectedLocationId(row.id)}
              />
            </div>
          </PermissionGate>
        </>
      )}

      {/* Single Location View (when location is selected) */}
      {selectedLocationId && (
        <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-[#0066FF]" />
            <h3 className="text-lg font-semibold text-[#111827] dark:text-[#FAFAFA]">
              {merchant.locations.find((l) => l.id === selectedLocationId)?.name}
            </h3>
          </div>

          <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">
            Location-specific metrics and details would be displayed here.
            <br />
            Click "All Locations" above to view cross-location comparison.
          </p>

          <button
            onClick={() => setSelectedLocationId(null)}
            className="mt-4 text-sm text-[#0066FF] hover:text-[#0052CC] font-medium"
          >
            ← Back to All Locations
          </button>
        </div>
      )}
    </div>
  );
}
