'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TelemetryChartProps {
  equipmentId: string;
}

interface TelemetryDataPoint {
  timestamp: string;
  powerWatts: number;
  temperature: number;
  vibration: number;
  waterLiters: number;
}

export function TelemetryChart({ equipmentId }: TelemetryChartProps) {
  const [data, setData] = useState<TelemetryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTelemetryHistory();
  }, [equipmentId]);

  const fetchTelemetryHistory = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/iot/equipment/${equipmentId}/telemetry/history`);

      // Mock data - last 24 hours
      const mockData: TelemetryDataPoint[] = [];
      const now = Date.now();
      for (let i = 24; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000);
        mockData.push({
          timestamp: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          powerWatts: 1800 + Math.random() * 600 + (Math.random() < 0.1 ? 500 : 0),
          temperature: 50 + Math.random() * 20,
          vibration: 1.5 + Math.random() * 2,
          waterLiters: 40 + Math.random() * 15,
        });
      }
      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch telemetry history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">Loading telemetry data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Power & Temperature</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="powerWatts"
                stroke="#2563eb"
                name="Power (W)"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                stroke="#dc2626"
                name="Temp (°C)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vibration & Water Usage</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="vibration"
                stroke="#9333ea"
                name="Vibration"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="waterLiters"
                stroke="#0891b2"
                name="Water (L)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}