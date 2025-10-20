'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  TrendingUp,
  Zap,
  Droplets,
  DollarSign,
  Lightbulb,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Thermometer,
  Activity,
  Package,
  Wrench,
  Filter,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEquipment } from '@/lib/hooks/useIoT';

const COLORS = ['#0A78FF', '#00B7A5', '#FF6B6B', '#FFB800', '#9B59B6'];

export default function AnalyticsPage() {
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const merchantId = 'merchant-1';
  const { data: equipment = [], isLoading } = useEquipment(merchantId);

  // Mock personalized data per equipment
  const mockEquipmentData = useMemo(() => {
    return equipment.map(eq => ({
      id: eq.id,
      name: eq.name,
      type: eq.type,
      healthScore: eq.healthScore || 85,
      efficiencyScore: eq.efficiencyScore || 88,
      energyUsage: 45 + Math.random() * 20, // kWh/day
      waterUsage: 280 + Math.random() * 80, // L/day
      dailyCost: 32 + Math.random() * 10,
      cyclesCompleted: Math.floor(12 + Math.random() * 8),
      utilizationRate: 65 + Math.random() * 25, // %
      assignedOrders: Math.floor(5 + Math.random() * 15),
      assignedServices: ['Dry Clean', 'Wash & Fold', 'Press'],
      lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      alerts: eq.openAlerts,
      historicalData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        energy: 40 + Math.random() * 20,
        water: 250 + Math.random() * 100,
        cost: 28 + Math.random() * 12,
        efficiency: 75 + Math.random() * 20,
      })),
    }));
  }, [equipment]);

  // Aggregate stats
  const stats = useMemo(() => {
    const selectedData = selectedEquipment === 'all'
      ? mockEquipmentData
      : mockEquipmentData.filter(eq => eq.id === selectedEquipment);

    const totalEnergy = selectedData.reduce((sum, eq) => sum + eq.energyUsage, 0);
    const totalWater = selectedData.reduce((sum, eq) => sum + eq.waterUsage, 0);
    const totalCost = selectedData.reduce((sum, eq) => sum + eq.dailyCost, 0);
    const avgEfficiency = selectedData.reduce((sum, eq) => sum + eq.efficiencyScore, 0) / selectedData.length || 0;
    const avgHealth = selectedData.reduce((sum, eq) => sum + eq.healthScore, 0) / selectedData.length || 0;
    const totalOrders = selectedData.reduce((sum, eq) => sum + eq.assignedOrders, 0);
    const totalAlerts = selectedData.reduce((sum, eq) => sum + eq.alerts, 0);

    // Calculate potential savings
    const energySavings = totalEnergy * 0.15 * 0.12 * 30; // 15% reduction, $0.12/kWh, 30 days
    const waterSavings = totalWater * 0.10 * 0.005 * 30; // 10% reduction, $0.005/L, 30 days
    const maintenanceSavings = 150; // Predictive maintenance savings

    return {
      totalEnergy: totalEnergy.toFixed(1),
      totalWater: Math.round(totalWater),
      totalCost: totalCost.toFixed(2),
      avgEfficiency: avgEfficiency.toFixed(1),
      avgHealth: avgHealth.toFixed(1),
      totalOrders,
      totalAlerts,
      potentialSavings: (energySavings + waterSavings + maintenanceSavings).toFixed(2),
      energySavings: energySavings.toFixed(2),
      waterSavings: waterSavings.toFixed(2),
      maintenanceSavings,
    };
  }, [mockEquipmentData, selectedEquipment]);

  // Equipment performance comparison
  const performanceData = mockEquipmentData.map(eq => ({
    name: eq.name,
    efficiency: eq.efficiencyScore,
    health: eq.healthScore,
    utilization: eq.utilizationRate,
  }));

  // Service distribution
  const serviceDistribution = [
    { name: 'Dry Clean', value: 42, orders: 156 },
    { name: 'Wash & Fold', value: 28, orders: 104 },
    { name: 'Press', value: 18, orders: 67 },
    { name: 'Specialty', value: 12, orders: 45 },
  ];

  const selectedEquipmentData = selectedEquipment === 'all'
    ? mockEquipmentData[0]
    : mockEquipmentData.find(eq => eq.id === selectedEquipment) || mockEquipmentData[0];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">
                Equipment Analytics & Optimization
              </h1>
              <p className="text-white/90 text-lg mb-4">
                Monitor performance, resource usage, and discover savings opportunities
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>{stats.avgEfficiency}% avg efficiency</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>${stats.potentialSavings} potential savings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>{stats.totalOrders} assigned orders</span>
                </div>
              </div>
            </div>
            {stats.totalAlerts > 0 && (
              <Badge className="bg-white/20 text-white border-white/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stats.totalAlerts} alerts
              </Badge>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Equipment Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Equipment Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedEquipment === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedEquipment('all')}
              className={selectedEquipment === 'all' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : ''}
            >
              All Equipment ({equipment.length})
            </Button>
            {equipment.map((eq) => (
              <Button
                key={eq.id}
                variant={selectedEquipment === eq.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedEquipment(eq.id)}
                className={selectedEquipment === eq.id ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : ''}
              >
                {eq.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <Badge variant="default" className="bg-green-500">Savings</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Potential Monthly Savings</p>
              <p className="text-3xl font-bold mb-2 text-green-600">${stats.potentialSavings}</p>
              <p className="text-xs text-muted-foreground">
                ${(parseFloat(stats.potentialSavings) * 12).toFixed(2)} annually
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Daily Energy Usage</p>
              <p className="text-3xl font-bold mb-2">{stats.totalEnergy} kWh</p>
              <p className="text-xs text-green-600">Save ${stats.energySavings}/month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Daily Water Usage</p>
              <p className="text-3xl font-bold mb-2">{stats.totalWater} L</p>
              <p className="text-xs text-green-600">Save ${stats.waterSavings}/month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Avg Efficiency</p>
              <p className="text-3xl font-bold mb-2">{stats.avgEfficiency}%</p>
              <p className="text-xs text-muted-foreground">Health: {stats.avgHealth}%</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Equipment Details Tab */}
      {selectedEquipment !== 'all' && selectedEquipmentData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {selectedEquipmentData.name} - Detailed Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Health Score</span>
                  <Badge variant={selectedEquipmentData.healthScore > 85 ? 'default' : 'destructive'}>
                    {selectedEquipmentData.healthScore}%
                  </Badge>
                </div>
                <Progress value={selectedEquipmentData.healthScore} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Efficiency</span>
                  <Badge variant={selectedEquipmentData.efficiencyScore > 80 ? 'default' : 'secondary'}>
                    {selectedEquipmentData.efficiencyScore}%
                  </Badge>
                </div>
                <Progress value={selectedEquipmentData.efficiencyScore} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Utilization</span>
                  <Badge variant="outline">{selectedEquipmentData.utilizationRate.toFixed(1)}%</Badge>
                </div>
                <Progress value={selectedEquipmentData.utilizationRate} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Package className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-sm text-muted-foreground">Assigned Orders</p>
                <p className="text-2xl font-bold">{selectedEquipmentData.assignedOrders}</p>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Clock className="h-5 w-5 text-purple-600 mb-2" />
                <p className="text-sm text-muted-foreground">Cycles Today</p>
                <p className="text-2xl font-bold">{selectedEquipmentData.cyclesCompleted}</p>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <Zap className="h-5 w-5 text-green-600 mb-2" />
                <p className="text-sm text-muted-foreground">Energy Usage</p>
                <p className="text-2xl font-bold">{selectedEquipmentData.energyUsage.toFixed(1)} kWh</p>
              </div>

              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Droplets className="h-5 w-5 text-cyan-600 mb-2" />
                <p className="text-sm text-muted-foreground">Water Usage</p>
                <p className="text-2xl font-bold">{Math.round(selectedEquipmentData.waterUsage)} L</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">Services Assigned</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEquipmentData.assignedServices.map((service) => (
                      <Badge key={service} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              30-Day Energy Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedEquipmentData.historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="energy" stroke="#0A78FF" strokeWidth={2} name="Energy (kWh)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Efficiency Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={selectedEquipmentData.historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="efficiency" stroke="#9B59B6" strokeWidth={2} name="Efficiency (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Comparison */}
      {selectedEquipment === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Equipment Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#0A78FF" name="Efficiency (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="health" fill="#00B7A5" name="Health (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilization" fill="#9B59B6" name="Utilization (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-pink-600" />
              Service Distribution by Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1 text-green-900 dark:text-green-100">Energy Efficiency</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduce energy consumption by 15% through off-peak scheduling
                  </p>
                  <p className="text-sm font-semibold text-green-600 mt-2">Save: ${stats.energySavings}/month</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Droplets className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1 text-blue-900 dark:text-blue-100">Water Conservation</h4>
                  <p className="text-sm text-muted-foreground">
                    Optimize wash cycles and implement water recycling
                  </p>
                  <p className="text-sm font-semibold text-blue-600 mt-2">Save: ${stats.waterSavings}/month</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-start gap-3">
                <Wrench className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1 text-purple-900 dark:text-purple-100">Predictive Maintenance</h4>
                  <p className="text-sm text-muted-foreground">
                    Schedule maintenance based on equipment health scores
                  </p>
                  <p className="text-sm font-semibold text-purple-600 mt-2">Save: ${stats.maintenanceSavings}/month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Projection */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Annual ROI Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Annual Savings</p>
              <p className="text-4xl font-bold text-emerald-600">
                ${(parseFloat(stats.potentialSavings) * 12).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per year</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Implementation Cost</p>
              <p className="text-4xl font-bold">$0 - $500</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">Mostly operational changes</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">First Year ROI</p>
              <p className="text-4xl font-bold text-emerald-600">300-500%</p>
              <p className="text-xs text-muted-foreground mt-1">Return on investment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}