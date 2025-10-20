'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Loader2,
  AlertCircle,
  DollarSign,
  Clock,
  Tag,
  TrendingUp,
  TrendingDown,
  Percent,
  Search,
  Filter,
  Edit,
  Plus,
  Star,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useServices, useToggleServiceStatus } from '@/lib/hooks/useServices';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  'All Categories',
  'Shirts',
  'Pants',
  'Suits',
  'Dresses',
  'Outerwear',
  'Bedding',
  'Alterations',
  'Specialty',
  'Other',
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { toast } = useToast();

  const merchantId = 'merchant-1';
  const { data: services, isLoading, isError, error } = useServices(merchantId);
  const toggleStatusMutation = useToggleServiceStatus(merchantId);

  // Filter services
  const filteredServices = useMemo(() => {
    return services?.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'All Categories' || service.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && service.isActive) ||
        (statusFilter === 'inactive' && !service.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    }) || [];
  }, [services, searchTerm, categoryFilter, statusFilter]);

  // Enhanced stats
  const stats = useMemo(() => {
    const totalRevenue = services?.reduce((sum, s) => sum + s.basePrice * 10, 0) || 0; // Mock multiplier
    return {
      total: services?.length || 0,
      active: services?.filter((s) => s.isActive).length || 0,
      inactive: services?.filter((s) => !s.isActive).length || 0,
      avgPrice: services?.length
        ? (services.reduce((sum, s) => sum + s.basePrice, 0) / services.length)
        : 0,
      totalRevenue,
      revenueChange: 8.3,
      mostPopular: 'Dry Clean Shirt',
    };
  }, [services]);

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({
        serviceId,
        isActive: !currentStatus,
      });

      toast({
        title: 'Success',
        description: `Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update service status',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Services</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An error occurred while fetching services'}
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">
                Services Management
              </h1>
              <p className="text-white/90 text-lg mb-4">
                Manage your service catalog, pricing, and availability
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>{stats.active} active services</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>${stats.avgPrice.toFixed(2)} avg price</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{stats.revenueChange}% revenue growth</span>
                </div>
              </div>
            </div>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Tag className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Services</p>
              <p className="text-3xl font-bold mb-2">{stats.total}</p>
              <p className="text-xs text-muted-foreground">{stats.active} active · {stats.inactive} inactive</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenueChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(stats.revenueChange)}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-3xl font-bold mb-2">${stats.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">From all services</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Average Price</p>
              <p className="text-3xl font-bold mb-2">${stats.avgPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Per service</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Most Popular</p>
              <p className="text-xl font-bold mb-2">{stats.mostPopular}</p>
              <p className="text-xs text-muted-foreground">Top performer</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
              >
                All ({stats.total})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
                className={statusFilter === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                Active ({stats.active})
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive ({stats.inactive})
              </Button>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-background w-full md:w-64"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-all group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                          <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {service.category}
                      </Badge>
                    </div>
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={() => handleToggleStatus(service.id, service.isActive)}
                      disabled={toggleStatusMutation.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description || 'Professional dry cleaning service'}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">Base Price</span>
                      </div>
                      <span className="font-bold text-green-600 text-xl">${service.basePrice.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Duration</span>
                      </div>
                      <span className="text-sm font-medium">{service.estimatedDuration} min</span>
                    </div>

                    {service.pricingTiers && service.pricingTiers.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <p className="text-xs font-semibold text-purple-600">Special Pricing:</p>
                        </div>
                        {service.pricingTiers.map((tier) => (
                          <div key={tier.id} className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              {tier.fulfillmentMode.replace(/_/g, ' ')}
                            </span>
                            <span className="text-green-600 font-medium">
                              {tier.priceModifier}% off
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button variant="outline" size="sm" className="w-full mt-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-white transition-all">
                      <Edit className="h-3 w-3 mr-2" />
                      Edit Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredServices.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-16">
                <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || categoryFilter !== 'All Categories'
                    ? 'No services match your search criteria'
                    : 'No services available'}
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('All Categories');
                  setStatusFilter('all');
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}