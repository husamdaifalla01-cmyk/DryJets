'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Zap, Droplets, Thermometer, Activity } from 'lucide-react';
import { mockTelemetryData } from '@/data/maintenanceMockData';

interface Props {
  equipmentId: string;
}

type MetricType = 'power' | 'water' | 'temperature' | 'vibration';

const metricConfig = {
  power: {
    label: 'Power Usage',
    unit: 'kW',
    color: '#3B82F6',
    icon: Zap,
    threshold: 4.5,
    dataKey: 'powerUsage',
  },
  water: {
    label: 'Water Usage',
    unit: 'L',
    color: '#06B6D4',
    icon: Droplets,
    threshold: 60,
    dataKey: 'waterUsage',
  },
  temperature: {
    label: 'Temperature',
    unit: '°C',
    color: '#F97316',
    icon: Thermometer,
    threshold: 65,
    dataKey: 'temperature',
  },
  vibration: {
    label: 'Vibration',
    unit: 'G-force',
    color: '#9B59B6',
    icon: Activity,
    threshold: 3.5,
    dataKey: 'vibration',
  },
};

export function TelemetryChart({ equipmentId }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('power');

  const telemetryData = mockTelemetryData[equipmentId] || [];
  const config = metricConfig[selectedMetric];
  const Icon = config.icon;

  // Generate 30-day historical data for demo
  const historicalData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));

    let value: number;
    if (selectedMetric === 'power') {
      value = 3.2 + Math.random() * 1.5;
    } else if (selectedMetric === 'water') {
      value = 45 + Math.random() * 15;
    } else if (selectedMetric === 'temperature') {
      value = 52 + Math.random() * 15;
    } else {
      value = 2.5 + Math.random() * 1.2;
    }

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(value.toFixed(2)),
      threshold: config.threshold,
    };
  });

  return (
    <div className="space-y-4">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(metricConfig) as MetricType[]).map((metric) => {
          const MetricIcon = metricConfig[metric].icon;
          return (
            <Button
              key={metric}
              variant={selectedMetric === metric ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric(metric)}
              className={selectedMetric === metric ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : ''}
            >
              <MetricIcon className="h-4 w-4 mr-2" />
              {metricConfig[metric].label}
            </Button>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" style={{ color: config.color }} />
              {config.label} - Last 30 Days
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Threshold: {config.threshold} {config.unit}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <defs>
                <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={config.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={config.color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value} ${config.unit}`, config.label]}
              />
              <Legend />

              {/* Threshold Line */}
              <ReferenceLine
                y={config.threshold}
                stroke="#EF4444"
                strokeDasharray="5 5"
                label={{
                  value: `Threshold: ${config.threshold}`,
                  position: 'right',
                  fill: '#EF4444',
                  fontSize: 12,
                }}
              />

              {/* Data Line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={3}
                fill={`url(#gradient-${selectedMetric})`}
                name={config.label}
                dot={{ fill: config.color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Current Reading */}
          {telemetryData.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Reading</p>
                  <p className="text-3xl font-bold" style={{ color: config.color }}>
                    {telemetryData[0][config.dataKey as keyof typeof telemetryData[0]]} {config.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-semibold">
                    {new Date(telemetryData[0].timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-2xl font-bold">
              {(historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length).toFixed(2)} {config.unit}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Peak</p>
            <p className="text-2xl font-bold">
              {Math.max(...historicalData.map(d => d.value)).toFixed(2)} {config.unit}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Threshold Breaches</p>
            <p className="text-2xl font-bold text-red-600">
              {historicalData.filter(d => d.value > config.threshold).length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}