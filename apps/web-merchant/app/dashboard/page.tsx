'use client';

import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calendar,
  Activity,
  ShoppingBag,
  Zap,
  Droplet,
  ThermometerSun,
  AlertTriangle,
  Star,
  Target,
  Award,
  Sparkles,
  Bell,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { KPICard } from '@/components/dashboard/KPICard';
import { DataTable } from '@/components/dashboard/DataTable';
import type { Column } from '@/components/dashboard/DataTable';
import { AddOrderSheet } from '@/components/orders/AddOrderSheet';

// Enhanced mock data with personalization and equipment insights
const mockDashboardData = {
  merchant: {
    name: 'Sarah',
    businessName: 'Premium Dry Cleaners',
    tier: 'Gold',
    joinedDate: '2023-06-15',
    performance: 'Excellent',
  },
  insights: {
    greeting: 'Good afternoon',
    topRecommendation: 'Your revenue is up 15% this week! Consider promoting your express service.',
    peakHoursToday: '2:00 PM - 5:00 PM',
    capacityUtilization: 78,
    customerSatisfaction: 4.8,
  },
  todayStats: {
    revenue: 1247.50,
    revenueChange: 12.5,
    revenueGoal: 1500,
    orders: 23,
    ordersChange: -5.2,
    ordersGoal: 30,
    customers: 18,
    customersChange: 8.3,
    newCustomers: 3,
    avgOrderValue: 54.24,
    avgOrderValueChange: 15.7,
    completionRate: 94,
  },
  equipment: [
    {
      id: 'eq-1',
      name: 'Washer #1',
      type: 'WASHER',
      status: 'OPERATIONAL',
      healthScore: 92,
      currentLoad: 75,
      cyclesCompleted: 12,
      cyclesRemaining: 8,
      energyUsage: 45.3,
      waterUsage: 120.5,
      nextMaintenance: '2025-10-25',
      efficiency: 94,
      alerts: [],
    },
    {
      id: 'eq-2',
      name: 'Dryer #2',
      type: 'DRYER',
      status: 'OPERATIONAL',
      healthScore: 88,
      currentLoad: 60,
      cyclesCompleted: 15,
      cyclesRemaining: 5,
      energyUsage: 62.7,
      waterUsage: 0,
      nextMaintenance: '2025-10-22',
      efficiency: 89,
      alerts: ['Maintenance due soon'],
    },
    {
      id: 'eq-3',
      name: 'Press #1',
      type: 'PRESS',
      status: 'WARNING',
      healthScore: 72,
      currentLoad: 85,
      cyclesCompleted: 45,
      cyclesRemaining: 15,
      energyUsage: 28.4,
      waterUsage: 0,
      nextMaintenance: '2025-10-20',
      efficiency: 75,
      alerts: ['Temperature fluctuation detected', 'High usage'],
    },
  ],
  recentOrders: [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customerName: 'John Doe',
      status: 'IN_PROGRESS',
      priority: 'express',
      totalAmount: 69.50,
      itemCount: 3,
      serviceType: 'Dry Clean',
      assignedEquipment: 'Washer #1',
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customerName: 'Jane Smith',
      status: 'PENDING',
      priority: 'standard',
      totalAmount: 45.00,
      itemCount: 2,
      serviceType: 'Wash & Fold',
      assignedEquipment: null,
      estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customerName: 'Bob Johnson',
      status: 'READY_FOR_PICKUP',
      priority: 'standard',
      totalAmount: 89.99,
      itemCount: 5,
      serviceType: 'Specialty',
      assignedEquipment: 'Dryer #2',
      estimatedCompletion: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ],
  weeklyAnalytics: {
    revenue: [
      { day: 'Mon', amount: 850, orders: 15 },
      { day: 'Tue', amount: 920, orders: 18 },
      { day: 'Wed', amount: 1100, orders: 22 },
      { day: 'Thu', amount: 980, orders: 19 },
      { day: 'Fri', amount: 1350, orders: 28 },
      { day: 'Sat', amount: 1600, orders: 35 },
      { day: 'Sun', amount: 1200, orders: 25 },
    ],
    topServices: [
      { name: 'Dry Clean', revenue: 3250, percentage: 42 },
      { name: 'Wash & Fold', revenue: 2100, percentage: 27 },
      { name: 'Express Service', revenue: 1580, percentage: 21 },
      { name: 'Specialty', revenue: 770, percentage: 10 },
    ],
  },
  alerts: [
    { id: 1, type: 'urgent', message: 'Press #1 needs maintenance within 24 hours', link: '/dashboard/equipment' },
    { id: 2, type: 'warning', message: '3 orders awaiting confirmation', link: '/dashboard/orders' },
    { id: 3, type: 'info', message: 'Peak hours approaching (2-5 PM)', link: '#' },
  ],
  customerInsights: {
    repeatRate: 67,
    averageLifetimeValue: 342,
    topCustomer: 'Premium Customer (15 orders this month)',
    churnRisk: 2,
  },
};

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', icon: Package },
  READY_FOR_PICKUP: { label: 'Ready', color: 'bg-green-500/10 text-green-700 border-green-500/20', icon: CheckCircle2 },
  COMPLETED: { label: 'Completed', color: 'bg-gray-500/10 text-gray-700 border-gray-500/20', icon: CheckCircle2 },
};

const equipmentStatusColor = {
  OPERATIONAL: 'text-green-600',
  WARNING: 'text-yellow-600',
  CRITICAL: 'text-red-600',
  OFFLINE: 'text-gray-600',
};

export default function DashboardPage() {
  const { merchant, insights, todayStats, equipment, recentOrders, weeklyAnalytics, alerts, customerInsights } = mockDashboardData;
  const [addOrderOpen, setAddOrderOpen] = React.useState(false);

  // Calculate totals
  const totalRevenue = weeklyAnalytics.revenue.reduce((sum, d) => sum + d.amount, 0);
  const totalOrders = weeklyAnalytics.revenue.reduce((sum, d) => sum + d.orders, 0);
  const maxRevenue = Math.max(...weeklyAnalytics.revenue.map(d => d.amount));

  // Equipment health summary
  const avgHealthScore = equipment.reduce((sum, eq) => sum + eq.healthScore, 0) / equipment.length;
  const criticalEquipment = equipment.filter(eq => eq.healthScore < 75).length;
  const totalAlerts = equipment.reduce((sum, eq) => sum + eq.alerts.length, 0);

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl px-4">
      {/* Optimized Compact Hero Section - ~50% height reduction */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            {/* Left: Greeting + Badge */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-heading font-bold">
                {insights.greeting}, {merchant.name}! 👋
              </h1>
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                <Award className="h-3 w-3 mr-1" />
                {merchant.tier} Tier
              </Badge>
            </div>

            {/* Center: Mini Stats Bar */}
            <div className="hidden md:flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                <div>
                  <div className="font-semibold">${customerInsights.averageLifetimeValue}</div>
                  <div className="text-xs text-white/70">Customer LTV</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <div>
                  <div className="font-semibold">{todayStats.completionRate}%</div>
                  <div className="text-xs text-white/70">Completion Rate</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <div>
                  <div className="font-semibold">{merchant.performance}</div>
                  <div className="text-xs text-white/70">Performance</div>
                </div>
              </div>
            </div>

            {/* Right: Add New Order Button */}
            <Button
              size="lg"
              className="bg-white text-primary-700 hover:bg-white/90 shadow-lg"
              onClick={() => setAddOrderOpen(true)}
            >
              <Package className="h-4 w-4 mr-2" />
              Add New Order
            </Button>
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* AI Recommendation as compact info strip */}
      <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-medium text-primary-900 dark:text-primary-100">AI Recommendation: </span>
            <span className="text-sm text-primary-700 dark:text-primary-300">{insights.topRecommendation}</span>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter(a => a.type === 'urgent').length > 0 && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Urgent Action Required</p>
              <p className="text-sm text-red-700">{alerts.find(a => a.type === 'urgent')?.message}</p>
            </div>
            <Button size="sm" variant="outline" className="border-red-500/20 text-red-700" asChild>
              <Link href={alerts.find(a => a.type === 'urgent')?.link || '#'}>
                Take Action
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Key Metrics Grid - Using new KPICard component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Today's Revenue"
          value={`$${todayStats.revenue.toFixed(2)}`}
          trend={{
            value: todayStats.revenueChange,
            direction: todayStats.revenueChange >= 0 ? 'up' : 'down',
            period: 'day',
          }}
          size="md"
          variant="success"
        />

        <KPICard
          title="Orders Today"
          value={todayStats.orders}
          trend={{
            value: Math.abs(todayStats.ordersChange),
            direction: todayStats.ordersChange >= 0 ? 'up' : 'down',
            period: 'day',
          }}
          size="md"
        />

        <KPICard
          title="Equipment Health"
          value={`${Math.round(avgHealthScore)}%`}
          trend={{
            value: 5,
            direction: 'up',
            period: 'week',
          }}
          size="md"
          variant={avgHealthScore >= 85 ? 'success' : avgHealthScore >= 70 ? 'warning' : 'danger'}
        />

        <KPICard
          title="Customer Satisfaction"
          value={insights.customerSatisfaction}
          trend={{
            value: 2.1,
            direction: 'up',
            period: 'month',
          }}
          size="md"
          variant="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Equipment & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Equipment Monitoring */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Equipment Status - Real-time
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Capacity utilization: {insights.capacityUtilization}%
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/equipment">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipment.map((eq, index) => (
                  <motion.div
                    key={eq.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${
                          eq.status === 'OPERATIONAL' ? 'bg-green-500/10' :
                          eq.status === 'WARNING' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                        } flex items-center justify-center`}>
                          {eq.type === 'WASHER' ? <Droplet className={`h-5 w-5 ${equipmentStatusColor[eq.status as keyof typeof equipmentStatusColor]}`} /> :
                           eq.type === 'DRYER' ? <ThermometerSun className={`h-5 w-5 ${equipmentStatusColor[eq.status as keyof typeof equipmentStatusColor]}`} /> :
                           <Zap className={`h-5 w-5 ${equipmentStatusColor[eq.status as keyof typeof equipmentStatusColor]}`} />}
                        </div>
                        <div>
                          <h4 className="font-semibold">{eq.name}</h4>
                          <p className="text-xs text-muted-foreground">{eq.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-2xl font-bold ${
                            eq.healthScore >= 85 ? 'text-green-600' :
                            eq.healthScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {eq.healthScore}
                          </span>
                          <span className="text-sm text-muted-foreground">/100</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Health Score</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Load</p>
                        <div className="flex items-center gap-2">
                          <Progress value={eq.currentLoad} className="h-1.5" />
                          <span className="text-xs font-semibold">{eq.currentLoad}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cycles</p>
                        <p className="text-sm font-semibold">{eq.cyclesCompleted}/{eq.cyclesCompleted + eq.cyclesRemaining}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Efficiency</p>
                        <p className="text-sm font-semibold">{eq.efficiency}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Energy</p>
                        <p className="text-sm font-semibold">{eq.energyUsage} kWh</p>
                      </div>
                    </div>

                    {eq.alerts.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {eq.alerts.map((alert, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-yellow-500/20 text-yellow-700">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {alert}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Revenue Analytics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Revenue Analytics
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total this week: ${totalRevenue.toFixed(2)} · {totalOrders} orders
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/analytics">
                    Detailed Analytics <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-64 mb-4">
                {weeklyAnalytics.revenue.map((data, index) => (
                  <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.amount / maxRevenue) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                      className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-lg min-h-[20px] relative group cursor-pointer"
                    >
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap shadow-lg z-10">
                        <p className="font-semibold">${data.amount}</p>
                        <p className="text-gray-300">{data.orders} orders</p>
                      </div>
                    </motion.div>
                    <span className="text-xs text-muted-foreground font-medium">{data.day}</span>
                  </div>
                ))}
              </div>

              {/* Service Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                {weeklyAnalytics.topServices.map((service, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">${service.revenue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{service.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders - Using new DataTable component */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Orders</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/orders">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={recentOrders}
                columns={[
                  {
                    id: 'orderNumber',
                    header: 'Order',
                    accessor: (row) => (
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{row.orderNumber}</p>
                        {row.priority === 'express' && (
                          <Badge variant="destructive" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Express
                          </Badge>
                        )}
                      </div>
                    ),
                    sortable: true,
                  },
                  {
                    id: 'customerName',
                    header: 'Customer',
                    accessorKey: 'customerName',
                    sortable: true,
                  },
                  {
                    id: 'serviceType',
                    header: 'Service',
                    accessorKey: 'serviceType',
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    accessor: (row) => {
                      const statusInfo = statusConfig[row.status as keyof typeof statusConfig];
                      return (
                        <Badge className={statusInfo?.color + ' border text-xs'}>
                          {statusInfo?.label}
                        </Badge>
                      );
                    },
                  },
                  {
                    id: 'totalAmount',
                    header: 'Amount',
                    accessor: (row) => `$${row.totalAmount.toFixed(2)}`,
                    align: 'right',
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Insights & Actions */}
        <div className="space-y-6">
          {/* Alerts & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      alert.type === 'urgent' ? 'bg-red-500/5 border-red-500/20' :
                      alert.type === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                      'bg-blue-500/5 border-blue-500/20'
                    }`}
                  >
                    <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      alert.type === 'urgent' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Customer Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lifetime Value</p>
                  <p className="text-2xl font-bold">${customerInsights.averageLifetimeValue}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Repeat Rate</span>
                    <span className="font-semibold">{customerInsights.repeatRate}%</span>
                  </div>
                  <Progress value={customerInsights.repeatRate} className="h-2" />
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Top Customer</p>
                  <p className="text-sm font-semibold">{customerInsights.topCustomer}</p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Churn Risk</p>
                    <p className="text-lg font-bold text-green-600">{customerInsights.churnRisk} customers</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" asChild>
                  <Link href="/dashboard/orders">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Orders
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/dashboard/services">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Edit Services
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/dashboard/equipment">
                    <Activity className="h-4 w-4 mr-2" />
                    Equipment Health
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-center min-w-[60px] pt-1">
                    <p className="text-xs font-semibold text-muted-foreground">10:00 AM</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Customer Pickup</p>
                    <p className="text-xs text-muted-foreground">ORD-2024-003 · Bob Johnson</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Ready</Badge>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="text-center min-w-[60px] pt-1">
                    <p className="text-xs font-semibold text-blue-600">2:00 PM</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Peak Hours Start</p>
                    <p className="text-xs text-muted-foreground">Prepare for high volume</p>
                  </div>
                  <Badge className="text-xs bg-blue-500/10 text-blue-700 border-blue-500/20">
                    <Zap className="h-3 w-3 mr-1" />
                    Peak
                  </Badge>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <div className="text-center min-w-[60px] pt-1">
                    <p className="text-xs font-semibold text-yellow-600">4:00 PM</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Equipment Maintenance</p>
                    <p className="text-xs text-muted-foreground">Press #1 - Scheduled</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-yellow-500/20 text-yellow-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Due
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Order Sheet */}
      <AddOrderSheet open={addOrderOpen} onOpenChange={setAddOrderOpen} />
    </div>
  );
}