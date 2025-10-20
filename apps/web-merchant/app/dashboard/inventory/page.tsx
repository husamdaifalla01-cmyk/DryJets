'use client';

/**
 * Inventory Page - Stock & Supply Management
 *
 * Enterprise inventory management with:
 * - Real-time stock level tracking
 * - Low stock alerts and reorder notifications
 * - Cost trend analysis
 * - Supplier management placeholders
 * - Category-based organization
 *
 * @extends DashboardLayout
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  MoreVertical,
  DollarSign,
  Box,
  Droplet,
  Shirt,
} from 'lucide-react';
import { Button } from '@/components/ui/button-v2';
import { Badge } from '@/components/ui/badge-v2';
import { Card } from '@/components/ui/card-v2';
import { cn } from '@/lib/utils';

// Mock inventory data
const inventoryData = [
  {
    id: 'INV-001',
    name: 'Premium Detergent',
    category: 'Chemicals',
    sku: 'DET-PRM-001',
    currentStock: 45,
    reorderThreshold: 20,
    unit: 'Gallons',
    costPerUnit: 12.50,
    supplier: 'ChemSupply Co.',
    lastRestock: '2025-10-15',
    monthlyUsage: 25,
    icon: Droplet,
    status: 'good' as const,
  },
  {
    id: 'INV-002',
    name: 'Fabric Softener',
    category: 'Chemicals',
    sku: 'SOF-STD-001',
    currentStock: 12,
    reorderThreshold: 15,
    unit: 'Gallons',
    costPerUnit: 8.75,
    supplier: 'ChemSupply Co.',
    lastRestock: '2025-10-10',
    monthlyUsage: 18,
    icon: Droplet,
    status: 'low' as const,
  },
  {
    id: 'INV-003',
    name: 'Garment Bags (Large)',
    category: 'Packaging',
    sku: 'BAG-LRG-001',
    currentStock: 450,
    reorderThreshold: 200,
    unit: 'Units',
    costPerUnit: 0.35,
    supplier: 'PackPro Inc.',
    lastRestock: '2025-10-18',
    monthlyUsage: 300,
    icon: Box,
    status: 'good' as const,
  },
  {
    id: 'INV-004',
    name: 'Hangers (Premium)',
    category: 'Supplies',
    sku: 'HNG-PRM-001',
    currentStock: 180,
    reorderThreshold: 250,
    unit: 'Units',
    costPerUnit: 0.45,
    supplier: 'SupplyHub',
    lastRestock: '2025-10-05',
    monthlyUsage: 400,
    icon: Shirt,
    status: 'critical' as const,
  },
  {
    id: 'INV-005',
    name: 'Stain Remover (Industrial)',
    category: 'Chemicals',
    sku: 'STN-IND-001',
    currentStock: 8,
    reorderThreshold: 10,
    unit: 'Gallons',
    costPerUnit: 15.00,
    supplier: 'ChemSupply Co.',
    lastRestock: '2025-09-28',
    monthlyUsage: 12,
    icon: Droplet,
    status: 'critical' as const,
  },
];

const statusConfig = {
  good: { color: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20', label: 'In Stock' },
  low: { color: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20', label: 'Low Stock' },
  critical: { color: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-500/20', label: 'Critical' },
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  // Filter inventory
  const filteredInventory = inventoryData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const lowStockItems = inventoryData.filter(i => i.currentStock <= i.reorderThreshold).length;
  const totalValue = inventoryData.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
  const categories = [...new Set(inventoryData.map(i => i.category))];

  return (
    <div className="container mx-auto py-6 lg:py-10 px-4 lg:px-6 max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track stock levels, manage reorders, and control costs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {lowStockItems > 0 && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 dark:text-red-100">Low Stock Alert</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {lowStockItems} item{lowStockItems > 1 ? 's' : ''} need reordering
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-red-300 text-red-700">
              View Items
            </Button>
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Items</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{inventoryData.length}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Low Stock Items</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{lowStockItems}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Inventory Value</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalValue.toFixed(0)}</p>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory by name or SKU..."
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
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category.toLowerCase() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.toLowerCase())}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost/Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredInventory.map((item, index) => {
                const Icon = item.icon;
                const stockPercentage = (item.currentStock / (item.reorderThreshold * 2)) * 100;

                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {item.sku}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.currentStock} {item.unit}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            / {item.reorderThreshold} min
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={cn(
                              'h-1.5 rounded-full transition-all',
                              stockPercentage > 50 ? 'bg-green-500' :
                              stockPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                            )}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusConfig[item.status].color}>
                        {statusConfig[item.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white font-semibold">
                        ${item.costPerUnit.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white font-semibold">
                        ${(item.currentStock * item.costPerUnit).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
