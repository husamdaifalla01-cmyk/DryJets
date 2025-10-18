'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, Filter } from 'lucide-react';

interface MaintenanceAlert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  recommendation: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/iot/alerts');

      // Mock data
      setAlerts([
        {
          id: '1',
          equipmentId: '2',
          equipmentName: 'Dryer #1',
          type: 'PREVENTIVE_MAINTENANCE',
          severity: 'MEDIUM',
          title: 'Preventive Maintenance Due',
          description: 'Equipment is overdue for scheduled maintenance (95 days since last service)',
          recommendation: 'Schedule maintenance within the next 7 days to prevent potential issues.',
          status: 'OPEN',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          equipmentId: '3',
          equipmentName: 'Washer #2',
          type: 'HIGH_VIBRATION',
          severity: 'HIGH',
          title: 'High Vibration Detected',
          description: 'Equipment experiencing vibration levels of 6.2 (threshold: 5.0)',
          recommendation: 'Check for load imbalance. Inspect mounting bolts and shock absorbers.',
          status: 'ACKNOWLEDGED',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          acknowledgedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          equipmentId: '3',
          equipmentName: 'Washer #2',
          type: 'LOW_EFFICIENCY',
          severity: 'MEDIUM',
          title: 'Low Efficiency Alert',
          description: 'Equipment efficiency has dropped to 52% (normal: 85-95%)',
          recommendation: 'Clean filters, check water pressure, inspect heating elements.',
          status: 'OPEN',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      // TODO: API call
      // await fetch(`/api/v1/iot/alerts/${alertId}/acknowledge`, { method: 'PATCH' });
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' as const, acknowledgedAt: new Date().toISOString() } : a));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      // TODO: API call
      // await fetch(`/api/v1/iot/alerts/${alertId}/resolve`, { method: 'PATCH' });
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' as const, resolvedAt: new Date().toISOString() } : a));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.status.toLowerCase() === filter;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 hover:bg-red-700';
      case 'HIGH': return 'bg-orange-600 hover:bg-orange-700';
      case 'MEDIUM': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'LOW': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'ACKNOWLEDGED': return <Clock className="h-5 w-5 text-blue-600" />;
      default: return <AlertCircle className="h-5 w-5 text-orange-600" />;
    }
  };

  const stats = {
    total: alerts.length,
    open: alerts.filter(a => a.status === 'OPEN').length,
    acknowledged: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
    resolved: alerts.filter(a => a.status === 'RESOLVED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Maintenance Alerts</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage equipment maintenance alerts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Alerts</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.open}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Acknowledged</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.acknowledged}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          All ({stats.total})
        </Button>
        <Button variant={filter === 'open' ? 'default' : 'outline'} onClick={() => setFilter('open')}>
          Open ({stats.open})
        </Button>
        <Button variant={filter === 'acknowledged' ? 'default' : 'outline'} onClick={() => setFilter('acknowledged')}>
          Acknowledged ({stats.acknowledged})
        </Button>
        <Button variant={filter === 'resolved' ? 'default' : 'outline'} onClick={() => setFilter('resolved')}>
          Resolved ({stats.resolved})
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Alerts Found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'All equipment is running smoothly!' : `No ${filter} alerts.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className="overflow-hidden">
              <div className="flex">
                <div className={`w-2 ${getSeverityColor(alert.severity)}`} />
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(alert.status)}
                      <div>
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {alert.equipmentName} • {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${getSeverityColor(alert.severity)} text-white`}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline">{alert.type.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Description:</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{alert.recommendation}</p>
                    </div>
                  </div>

                  {alert.status === 'OPEN' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcknowledge(alert.id)}>
                        Acknowledge
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResolve(alert.id)}>
                        Mark as Resolved
                      </Button>
                    </div>
                  )}

                  {alert.status === 'ACKNOWLEDGED' && (
                    <Button size="sm" onClick={() => handleResolve(alert.id)}>
                      Mark as Resolved
                    </Button>
                  )}

                  {alert.status === 'RESOLVED' && alert.resolvedAt && (
                    <p className="text-sm text-green-600">
                      ✓ Resolved on {new Date(alert.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}