'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Package,
  Wrench,
  X,
  TrendingUp,
  Zap,
  Droplets,
  Thermometer,
  Clock,
} from 'lucide-react';
import { getEquipmentWithMaintenance } from '@/data/maintenanceMockData';
import { MaintenanceTimeline } from './MaintenanceTimeline';
import { TelemetryChart } from './TelemetryChart';
import { PartsInventory } from './PartsInventory';
import { MaintenanceAlertBanner } from './MaintenanceAlertBanner';

interface Props {
  equipmentId: string;
  equipmentName: string;
  open: boolean;
  onClose: () => void;
}

export function MaintenanceModal({ equipmentId, equipmentName, open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('overview');
  const maintenanceData = getEquipmentWithMaintenance(equipmentId);

  const latestTelemetry = maintenanceData.latestTelemetry;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{equipmentName}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete maintenance and telemetry overview
              </p>
            </div>
            <div className="flex items-center gap-2">
              {maintenanceData.maintenanceRequired && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Requires Attention
                </Badge>
              )}
              {!maintenanceData.isAvailable && (
                <Badge variant="secondary">
                  <Wrench className="h-3 w-3 mr-1" />
                  In Maintenance
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="telemetry">
              <TrendingUp className="h-4 w-4 mr-2" />
              Telemetry
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="parts">
              <Package className="h-4 w-4 mr-2" />
              Parts
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-6">
            {/* Active Alerts */}
            {maintenanceData.activeAlerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Active Alerts</h3>
                {maintenanceData.activeAlerts.map((alert) => (
                  <MaintenanceAlertBanner
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={(id) => console.log('Acknowledge:', id)}
                    onViewDetails={(id) => setActiveTab('telemetry')}
                  />
                ))}
              </div>
            )}

            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {maintenanceData.isAvailable ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-semibold">Operational</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-orange-600">
                        <div className="h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
                        <span className="font-semibold">In Maintenance</span>
                      </div>
                      {maintenanceData.currentDowntime && (
                        <div className="text-sm text-muted-foreground">
                          <p>Reason: {maintenanceData.currentDowntime.reason}</p>
                          <p>
                            Started:{' '}
                            {new Date(maintenanceData.currentDowntime.startedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Upcoming Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  {maintenanceData.prediction ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Predicted Date</span>
                        <span className="font-semibold">
                          {new Date(maintenanceData.prediction.predictedFailureDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Confidence</span>
                        <Badge variant={maintenanceData.prediction.confidence > 80 ? 'destructive' : 'secondary'}>
                          {maintenanceData.prediction.confidence}%
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No predictions available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Latest Telemetry */}
            {latestTelemetry && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Latest Readings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Zap className="h-4 w-4" />
                        <span className="text-xs text-muted-foreground">Power</span>
                      </div>
                      <p className="text-2xl font-bold">{latestTelemetry.powerUsage} kW</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-cyan-600">
                        <Droplets className="h-4 w-4" />
                        <span className="text-xs text-muted-foreground">Water</span>
                      </div>
                      <p className="text-2xl font-bold">{latestTelemetry.waterUsage} L</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-orange-600">
                        <Thermometer className="h-4 w-4" />
                        <span className="text-xs text-muted-foreground">Temp</span>
                      </div>
                      <p className="text-2xl font-bold">{latestTelemetry.temperature}°C</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-600">
                        <Activity className="h-4 w-4" />
                        <span className="text-xs text-muted-foreground">Vibration</span>
                      </div>
                      <p className="text-2xl font-bold">{latestTelemetry.vibration} G</p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Last updated: {new Date(latestTelemetry.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Predictive Insights */}
            {maintenanceData.prediction && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Risk Factors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {maintenanceData.prediction.riskFactors.map((factor, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{factor.factor}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={factor.trend === 'INCREASING' ? 'destructive' : 'secondary'}>
                            {factor.trend}
                          </Badge>
                          <span className="font-semibold">{factor.impact}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            factor.impact > 70 ? 'bg-red-500' : factor.impact > 50 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${factor.impact}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Telemetry Tab */}
          <TabsContent value="telemetry" className="space-y-4 mt-6">
            <TelemetryChart equipmentId={equipmentId} />
          </TabsContent>

          {/* Maintenance History Tab */}
          <TabsContent value="maintenance" className="space-y-4 mt-6">
            <MaintenanceTimeline records={maintenanceData.maintenanceRecords} />
          </TabsContent>

          {/* Parts Tab */}
          <TabsContent value="parts" className="space-y-4 mt-6">
            <PartsInventory equipmentId={equipmentId} />
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Maintenance Type</label>
                    <select className="w-full mt-1 p-2 border rounded-lg">
                      <option>Preventive</option>
                      <option>Corrective</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Scheduled Date</label>
                    <input type="datetime-local" className="w-full mt-1 p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select className="w-full mt-1 p-2 border rounded-lg">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <textarea className="w-full mt-1 p-2 border rounded-lg" rows={3} />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
                    Schedule Maintenance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}