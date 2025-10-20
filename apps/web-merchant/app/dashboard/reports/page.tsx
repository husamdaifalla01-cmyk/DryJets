'use client';

/**
 * Reports Page - Business Analytics & Insights
 *
 * Features:
 * - Pre-built report templates
 * - Revenue and order analytics
 * - Customer retention metrics
 * - Equipment efficiency tracking
 * - CSV/PDF export functionality
 */

import * as React from 'react';
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Users, Package, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button-v2';
import { Card } from '@/components/ui/card-v2';
import { cn } from '@/lib/utils';

const reportTemplates = [
  { id: 1, name: 'Revenue Summary', desc: 'Monthly revenue breakdown', icon: DollarSign, color: 'bg-green-500' },
  { id: 2, name: 'Order Volume', desc: 'Orders by date and type', icon: Package, color: 'bg-blue-500' },
  { id: 3, name: 'Customer Retention', desc: 'Repeat customer analysis', icon: Users, color: 'bg-purple-500' },
  { id: 4, name: 'Equipment Efficiency', desc: 'Machine utilization rates', icon: BarChart3, color: 'bg-orange-500' },
];

const recentReports = [
  { name: 'October Revenue Report', date: '2025-10-19', type: 'Revenue' },
  { name: 'Customer Acquisition Q3', date: '2025-10-15', type: 'Customer' },
  { name: 'Equipment Performance', date: '2025-10-12', type: 'Operations' },
];

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6 lg:py-10 px-4 lg:px-6 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Generate insights and export business data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filter</Button>
          <Button variant="outline"><Calendar className="h-4 w-4 mr-2" />Date Range</Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTemplates.map(template => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center mb-4', `${template.color}/10`)}>
                  <Icon className={cn('h-6 w-6', template.color.replace('bg-', 'text-'))} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.desc}</p>
                <Button size="sm" variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </Card>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Reports</h2>
          <div className="space-y-3">
            {recentReports.map((report, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{report.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{report.date} • {report.type}</p>
                </div>
                <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$45,250</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders (MTD)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">682</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer Growth</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">+12%</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
