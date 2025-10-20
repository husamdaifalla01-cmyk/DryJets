'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { Plus, Activity, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { useEquipment } from '@/lib/hooks/useIoT';
import { KPICard } from '@/components/dashboard/KPICard';
import { DataTable } from '@/components/dashboard/DataTable';

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  isIotEnabled: boolean;
  lastTelemetryAt?: string;
  healthScore?: number;
  healthStatus?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  efficiencyScore?: number;
  isRunning: boolean;
  openAlerts: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export default function EquipmentPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'iot' | 'no-iot'>('all');

  // TODO: Replace with actual merchant ID from auth context
  const merchantId = 'merchant-1';

  // Fetch equipment data using React Query
  const { data: equipment = [], isLoading: loading, error } = useEquipment(merchantId);

  const filteredEquipment = equipment.filter((eq) => {
    if (filter === 'iot') return eq.isIotEnabled;
    if (filter === 'no-iot') return !eq.isIotEnabled;
    return true;
  });

  const stats = {
    total: equipment.length,
    iotEnabled: equipment.filter((eq) => eq.isIotEnabled).length,
    running: equipment.filter((eq) => eq.isRunning).length,
    alerts: equipment.reduce((sum, eq) => sum + eq.openAlerts, 0),
    avgHealth: Math.round(
      equipment
        .filter((eq) => eq.healthScore)
        .reduce((sum, eq) => sum + (eq.healthScore || 0), 0) /
        equipment.filter((eq) => eq.healthScore).length || 0
    ),
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-9 w-64 bg-muted rounded mb-2 skeleton" />
            <div className="h-5 w-96 bg-muted rounded skeleton" />
          </div>
          <div className="h-10 w-40 bg-muted rounded skeleton" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl skeleton" />
          ))}
        </div>

        {/* Filter Skeleton */}
        <div className="flex space-x-2 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-muted rounded skeleton" />
          ))}
        </div>

        {/* Equipment Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto py-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-brand-gradient bg-clip-text text-transparent">
            Equipment Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Monitor and manage your equipment with real-time IoT insights
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/equipment/add')}
          className="bg-brand-gradient hover:opacity-90 shadow-lift"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </motion.div>

      {/* Stats Overview - Using new KPICard components */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
      >
        <KPICard
          title="Total Equipment"
          value={stats.total}
          size="sm"
        />
        <KPICard
          title="IoT Enabled"
          value={stats.iotEnabled}
          trend={{ value: 2, direction: 'up', period: 'week' }}
          size="sm"
          variant="success"
        />
        <KPICard
          title="Running"
          value={stats.running}
          size="sm"
          variant="success"
        />
        <KPICard
          title="Alerts"
          value={stats.alerts}
          size="sm"
          variant={stats.alerts > 0 ? 'warning' : 'success'}
        />
        <KPICard
          title="Avg Health"
          value={`${stats.avgHealth}%`}
          size="sm"
          variant={
            stats.avgHealth >= 80
              ? 'success'
              : stats.avgHealth >= 60
              ? 'warning'
              : 'danger'
          }
        />
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={fadeInUp} className="flex space-x-2 mb-8">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-brand-gradient' : ''}
        >
          All Equipment ({equipment.length})
        </Button>
        <Button
          variant={filter === 'iot' ? 'default' : 'outline'}
          onClick={() => setFilter('iot')}
          className={filter === 'iot' ? 'bg-brand-gradient' : ''}
        >
          <Activity className="h-4 w-4 mr-2" />
          IoT Enabled ({stats.iotEnabled})
        </Button>
        <Button
          variant={filter === 'no-iot' ? 'default' : 'outline'}
          onClick={() => setFilter('no-iot')}
          className={filter === 'no-iot' ? 'bg-brand-gradient' : ''}
        >
          No IoT ({equipment.length - stats.iotEnabled})
        </Button>
      </motion.div>

      {/* Equipment Grid with Stagger Animation */}
      {filteredEquipment.length === 0 ? (
        <motion.div variants={fadeInUp} className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Equipment Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {filter === 'iot'
              ? 'No IoT-enabled equipment found. Enable IoT on your equipment to start real-time monitoring.'
              : 'Get started by adding your first equipment to monitor performance and maintenance.'}
          </p>
          <Button
            onClick={() => router.push('/dashboard/equipment/add')}
            className="bg-brand-gradient hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Cards Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {filteredEquipment.map((eq, index) => (
              <motion.div
                key={eq.id}
                variants={fadeInUp}
                custom={index}
                transition={{ delay: index * 0.1 }}
              >
                <EquipmentCard
                  equipment={eq}
                  onClick={() => router.push(`/dashboard/equipment/${eq.id}`)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Data Table View */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredEquipment}
                columns={[
                  {
                    id: 'name',
                    header: 'Equipment',
                    accessor: (row) => (
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{row.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {row.type}
                        </Badge>
                      </div>
                    ),
                    sortable: true,
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    accessor: (row) => (
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          row.status === 'OPERATIONAL' ? 'bg-green-500/10 text-green-700 border-green-500/20' :
                          row.status === 'WARNING' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' :
                          'bg-red-500/10 text-red-700 border-red-500/20'
                        }`}
                      >
                        {row.status}
                      </Badge>
                    ),
                  },
                  {
                    id: 'healthScore',
                    header: 'Health',
                    accessor: (row) => (
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          row.healthScore && row.healthScore >= 85 ? 'text-green-600' :
                          row.healthScore && row.healthScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {row.healthScore}%
                        </span>
                      </div>
                    ),
                    align: 'center',
                  },
                  {
                    id: 'iotStatus',
                    header: 'IoT',
                    accessor: (row) => (
                      <Badge variant={row.isIotEnabled ? "default" : "secondary"} className="text-xs">
                        {row.isIotEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    ),
                    align: 'center',
                  },
                  {
                    id: 'alerts',
                    header: 'Alerts',
                    accessor: (row) => (
                      <span className={row.openAlerts > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                        {row.openAlerts}
                      </span>
                    ),
                    align: 'center',
                  },
                ]}
              />
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}
