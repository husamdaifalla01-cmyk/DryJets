'use client';

/**
 * Customers Page - CRM & Customer Management
 *
 * Enterprise-grade customer relationship management with:
 * - Customer database with advanced filtering
 * - Lifetime value (LTV) tracking
 * - Order history and analytics
 * - Notes and communication tracking
 * - Stripe/CRM integration placeholder
 *
 * @extends DashboardLayout
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  DollarSign,
  ShoppingBag,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Star,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button-v2';
import { Badge } from '@/components/ui/badge-v2';
import { Card } from '@/components/ui/card-v2';
import { cn } from '@/lib/utils';

// Mock customer data
const customersData = [
  {
    id: 'CUST-001',
    name: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    phone: '(555) 111-2222',
    address: '123 Main St, San Francisco, CA',
    lifetimeValue: 2450,
    totalOrders: 48,
    lastOrderDate: '2025-10-15',
    joinDate: '2023-06-15',
    tier: 'Gold' as const,
    rating: 4.9,
    notes: 'Prefers express service, allergic to certain detergents',
  },
  {
    id: 'CUST-002',
    name: 'Robert Martinez',
    email: 'robert.m@email.com',
    phone: '(555) 222-3333',
    address: '456 Oak Ave, San Francisco, CA',
    lifetimeValue: 1820,
    totalOrders: 32,
    lastOrderDate: '2025-10-18',
    joinDate: '2024-01-10',
    tier: 'Silver' as const,
    rating: 4.7,
    notes: 'Regular business customer, weekly pickup/delivery',
  },
  {
    id: 'CUST-003',
    name: 'Emily Chen',
    email: 'emily.chen@email.com',
    phone: '(555) 333-4444',
    address: '789 Pine St, San Francisco, CA',
    lifetimeValue: 890,
    totalOrders: 15,
    lastOrderDate: '2025-10-10',
    joinDate: '2024-08-20',
    tier: 'Bronze' as const,
    rating: 4.8,
    notes: 'New customer, referred by Alice Johnson',
  },
  {
    id: 'CUST-004',
    name: 'Michael Thompson',
    email: 'michael.t@email.com',
    phone: '(555) 444-5555',
    address: '321 Elm Dr, San Francisco, CA',
    lifetimeValue: 3200,
    totalOrders: 64,
    lastOrderDate: '2025-10-19',
    joinDate: '2023-03-01',
    tier: 'Platinum' as const,
    rating: 5.0,
    notes: 'VIP customer, owns multiple businesses',
  },
];

const tierConfig = {
  Platinum: { color: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20', icon: '💎' },
  Gold: { color: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20', icon: '🏆' },
  Silver: { color: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20', icon: '🥈' },
  Bronze: { color: 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20', icon: '🥉' },
};

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTier, setSelectedTier] = React.useState<string>('all');

  // Filter customers
  const filteredCustomers = customersData.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    const matchesTier = selectedTier === 'all' || customer.tier.toLowerCase() === selectedTier.toLowerCase();
    return matchesSearch && matchesTier;
  });

  // Calculate stats
  const totalCustomers = customersData.length;
  const totalLTV = customersData.reduce((sum, c) => sum + c.lifetimeValue, 0);
  const avgLTV = totalLTV / totalCustomers;
  const totalOrders = customersData.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <div className="container mx-auto py-6 lg:py-10 px-4 lg:px-6 max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Customers
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage customer relationships and track lifetime value
          </p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Customers</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalCustomers}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Customer LTV</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${avgLTV.toFixed(0)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
            {['all', 'platinum', 'gold', 'silver', 'bronze'].map((tier) => (
              <Button
                key={tier}
                variant={selectedTier === tier ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTier(tier)}
                className="capitalize"
              >
                {tier}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Customers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  LTV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{customer.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={tierConfig[customer.tier].color}>
                      {tierConfig[customer.tier].icon} {customer.tier}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">{customer.totalOrders}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {customer.lifetimeValue.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredCustomers.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No customers found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </Card>
      )}
    </div>
  );
}
