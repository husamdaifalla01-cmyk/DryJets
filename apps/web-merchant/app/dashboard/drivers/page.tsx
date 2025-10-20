'use client';

/**
 * Drivers Page - Route & Fleet Management
 *
 * Enterprise-grade driver dashboard with:
 * - Real-time driver status tracking (Online, Busy, Offline)
 * - Route assignment and management
 * - Performance metrics and analytics
 * - GPS tracking integration placeholder
 * - Add/Edit driver functionality
 *
 * @extends DashboardLayout
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  MapPin,
  Clock,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Navigation,
  Phone,
  Mail,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button-v2';
import { Badge } from '@/components/ui/badge-v2';
import { Card } from '@/components/ui/card-v2';
import { cn } from '@/lib/utils';

// Mock driver data
const driversData = [
  {
    id: 'DRV-001',
    name: 'Michael Chen',
    email: 'michael.chen@dryjets.com',
    phone: '(555) 123-4567',
    status: 'Online' as const,
    currentRoute: 'Downtown Route A',
    ordersToday: 24,
    completionRate: 96,
    rating: 4.8,
    vehicleNumber: 'DJ-001',
    location: { lat: 37.7749, lng: -122.4194 },
    estimatedArrival: '10 min',
  },
  {
    id: 'DRV-002',
    name: 'Sarah Rodriguez',
    email: 'sarah.rodriguez@dryjets.com',
    phone: '(555) 234-5678',
    status: 'Busy' as const,
    currentRoute: 'Westside Route B',
    ordersToday: 18,
    completionRate: 98,
    rating: 4.9,
    vehicleNumber: 'DJ-002',
    location: { lat: 37.7849, lng: -122.4294 },
    estimatedArrival: '25 min',
  },
  {
    id: 'DRV-003',
    name: 'James Wilson',
    email: 'james.wilson@dryjets.com',
    phone: '(555) 345-6789',
    status: 'Offline' as const,
    currentRoute: null,
    ordersToday: 0,
    completionRate: 92,
    rating: 4.6,
    vehicleNumber: 'DJ-003',
    location: null,
    estimatedArrival: null,
  },
  {
    id: 'DRV-004',
    name: 'Emily Thompson',
    email: 'emily.thompson@dryjets.com',
    phone: '(555) 456-7890',
    status: 'Online' as const,
    currentRoute: 'Eastside Route C',
    ordersToday: 21,
    completionRate: 95,
    rating: 4.7,
    vehicleNumber: 'DJ-004',
    location: { lat: 37.7649, lng: -122.4094 },
    estimatedArrival: '15 min',
  },
];

const statusConfig = {
  Online: {
    color: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20',
    dot: 'bg-green-500',
  },
  Busy: {
    color: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20',
    dot: 'bg-yellow-500',
  },
  Offline: {
    color: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20',
    dot: 'bg-gray-500',
  },
};

export default function DriversPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  // Filter drivers based on search and status
  const filteredDrivers = driversData.filter((driver) => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || driver.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const activeDrivers = driversData.filter(d => d.status !== 'Offline').length;
  const totalOrders = driversData.reduce((sum, d) => sum + d.ordersToday, 0);
  const avgCompletionRate = driversData.reduce((sum, d) => sum + d.completionRate, 0) / driversData.length;

  return (
    <div className="container mx-auto py-6 lg:py-10 px-4 lg:px-6 max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Drivers & Routes
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage fleet operations and track deliveries in real-time
          </p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Drivers</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeDrivers}/{driversData.length}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Orders Today</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Completion Rate</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgCompletionRate.toFixed(0)}%</p>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers or vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg border',
                'bg-white dark:bg-gray-800',
                'border-gray-300 dark:border-gray-600',
                'text-gray-900 dark:text-white',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'online', 'busy', 'offline'].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Drivers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDrivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {driver.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className={cn(
                      'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-900',
                      statusConfig[driver.status].dot
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{driver.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{driver.vehicleNumber}</p>
                  </div>
                </div>
                <Badge className={statusConfig[driver.status].color}>
                  {driver.status}
                </Badge>
              </div>

              {driver.currentRoute && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {driver.currentRoute}
                    </span>
                  </div>
                  {driver.estimatedArrival && (
                    <p className="text-xs text-blue-700 dark:text-blue-300 ml-6">
                      ETA: {driver.estimatedArrival}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Orders Today</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{driver.ordersToday}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{driver.completionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{driver.rating}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <Card className="p-12 text-center">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No drivers found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </Card>
      )}
    </div>
  );
}
