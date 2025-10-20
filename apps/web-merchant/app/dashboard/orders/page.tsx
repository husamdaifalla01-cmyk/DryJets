'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  User,
  DollarSign,
  Search,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  Filter,
  ArrowRight,
  ShoppingBag,
  Users,
  Bell,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isToday, isThisWeek, parseISO } from 'date-fns';
import { useOrders } from '@/lib/hooks/useOrders';
import { KPICard } from '@/components/dashboard/KPICard';
import { DataTable } from '@/components/dashboard/DataTable';

const statusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    icon: CheckCircle2,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    icon: Package,
  },
  READY_FOR_PICKUP: {
    label: 'Ready',
    color: 'bg-green-500/10 text-green-700 border-green-500/20',
    icon: CheckCircle2,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    icon: Truck,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-500/10 text-red-700 border-red-500/20',
    icon: XCircle,
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Replace with actual merchant ID from auth
  const merchantId = 'merchant-1';

  // Fetch orders from API
  const { data: orders, isLoading, isError, error } = useOrders({ merchantId });

  // Transform API data to match component structure
  const displayOrders = useMemo(() => {
    if (!orders) return [];

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: '', // TODO: Add phone to API response
      status: order.status,
      fulfillmentMode: order.fulfillmentMode,
      items: [], // Will display itemCount instead
      itemCount: order.itemCount,
      totalAmount: order.totalAmount,
      scheduledPickupAt: order.pickupScheduled,
      scheduledDeliveryAt: order.deliveryScheduled,
      pickupAddress: '', // TODO: Add to API response
      deliveryAddress: '',
      createdAt: order.createdAt,
      priority: order.totalAmount > 75 ? 'express' : 'standard', // Mock priority based on amount
    }));
  }, [orders]);

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const todayOrders = displayOrders.filter(o => isToday(o.createdAt));
    const weekOrders = displayOrders.filter(o => isThisWeek(o.createdAt));
    const totalRevenue = displayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = displayOrders.length > 0 ? totalRevenue / displayOrders.length : 0;
    const completed = displayOrders.filter(o => o.status === 'COMPLETED').length;

    return {
      total: displayOrders.length,
      today: todayOrders.length,
      thisWeek: weekOrders.length,
      pending: displayOrders.filter(o => o.status === 'PENDING').length,
      confirmed: displayOrders.filter(o => o.status === 'CONFIRMED').length,
      inProgress: displayOrders.filter(o => o.status === 'IN_PROGRESS').length,
      readyForPickup: displayOrders.filter(o => o.status === 'READY_FOR_PICKUP').length,
      outForDelivery: displayOrders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
      completed,
      cancelled: displayOrders.filter(o => o.status === 'CANCELLED').length,
      totalRevenue,
      todayRevenue,
      avgOrderValue,
      revenueChange: 12.5, // Mock - should calculate from previous period
      ordersChange: -3.2, // Mock
      completionRate: displayOrders.length > 0 ? (completed / displayOrders.length) * 100 : 0,
    };
  }, [displayOrders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return displayOrders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      let matchesTime = true;
      if (timeFilter === 'today') {
        matchesTime = isToday(order.createdAt);
      } else if (timeFilter === 'week') {
        matchesTime = isThisWeek(order.createdAt);
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [displayOrders, statusFilter, timeFilter, searchTerm]);

  // Get urgent orders (pending/confirmed for today)
  const urgentOrders = useMemo(() => {
    return displayOrders.filter(o =>
      (o.status === 'PENDING' || o.status === 'CONFIRMED') &&
      isToday(o.createdAt)
    ).slice(0, 5);
  }, [displayOrders]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An error occurred while fetching orders'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">
                Order Management
              </h1>
              <p className="text-white/90 text-lg mb-4">
                Track and manage all your orders in real-time
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{stats.today} orders today</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>${stats.todayRevenue.toFixed(2)} revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{stats.completionRate.toFixed(0)}% completion rate</span>
                </div>
              </div>
            </div>
            {urgentOrders.length > 0 && (
              <Badge className="bg-white/20 text-white border-white/30">
                <Bell className="h-3 w-3 mr-1" />
                {urgentOrders.length} urgent
              </Badge>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Key Metrics - Using new KPICard components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          trend={{
            value: stats.revenueChange,
            direction: stats.revenueChange >= 0 ? 'up' : 'down',
            period: 'week',
          }}
          size="md"
          variant="success"
        />

        <KPICard
          title="Total Orders"
          value={stats.total}
          trend={{
            value: Math.abs(stats.ordersChange),
            direction: stats.ordersChange >= 0 ? 'up' : 'down',
            period: 'week',
          }}
          size="md"
        />

        <KPICard
          title="Active Orders"
          value={stats.pending + stats.inProgress}
          trend={{
            value: 4.2,
            direction: 'down',
            period: 'day',
          }}
          size="md"
          variant="warning"
        />

        <KPICard
          title="Completion Rate"
          value={`${stats.completionRate.toFixed(0)}%`}
          trend={{
            value: 3.5,
            direction: 'up',
            period: 'week',
          }}
          size="md"
          variant="success"
        />
      </div>

      {/* Orders Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredOrders}
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
              {
                id: 'fulfillmentMode',
                header: 'Fulfillment',
                accessor: (row) => (
                  <Badge variant="outline" className="text-xs">
                    {row.fulfillmentMode || 'Delivery'}
                  </Badge>
                ),
                align: 'center',
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Filters and Search - Keep for advanced filtering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order number or customer name..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}
              >
                All ({displayOrders.length})
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('PENDING')}
                className={statusFilter === 'PENDING' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
              >
                <Clock className="h-3 w-3 mr-1" />
                Pending ({stats.pending})
              </Button>
              <Button
                variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={statusFilter === 'IN_PROGRESS' ? 'bg-purple-500 hover:bg-purple-600' : ''}
              >
                <Package className="h-3 w-3 mr-1" />
                In Progress ({stats.inProgress})
              </Button>
              <Button
                variant={statusFilter === 'READY_FOR_PICKUP' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('READY_FOR_PICKUP')}
                className={statusFilter === 'READY_FOR_PICKUP' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ready ({stats.readyForPickup})
              </Button>
              <Button
                variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('COMPLETED')}
              >
                Completed ({stats.completed})
              </Button>
            </div>

            {/* Time Filters */}
            <div className="flex gap-2">
              <Button
                variant={timeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter('all')}
              >
                All Time
              </Button>
              <Button
                variant={timeFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter('today')}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Today
              </Button>
              <Button
                variant={timeFilter === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter('week')}
              >
                This Week
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          </h2>
          {searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
            const StatusIcon = statusInfo?.icon || Package;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
                            <StatusIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-semibold">{order.orderNumber}</h3>
                              {order.priority === 'express' && (
                                <Badge variant="destructive" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Express
                                </Badge>
                              )}
                            </div>
                            <Badge className={statusInfo?.color + ' border'}>
                              {statusInfo?.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(order.createdAt, 'MMM dd, h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-600">${order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>

                        {order.scheduledDeliveryAt && (
                          <div className="mt-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-2 text-sm">
                              <Truck className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-700">
                                Delivery scheduled: {format(order.scheduledDeliveryAt, 'MMM dd, h:mm a')}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between items-end">
                        <Button variant="outline" size="sm" className="group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:text-white transition-all">
                          View Details
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="text-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? 'No orders match your search criteria'
                    : 'No orders to display in this category'}
                </p>
                {(searchTerm || statusFilter !== 'all' || timeFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setTimeFilter('all');
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}