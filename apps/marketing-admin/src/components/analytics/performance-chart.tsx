'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PerformanceData {
  date: string
  impressions: number
  clicks: number
  ctr: number
}

interface PerformanceChartProps {
  data: PerformanceData[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<'composed' | 'line'>('composed')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Impressions, clicks, and CTR over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={chartType === 'composed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('composed')}
            >
              Combined View
            </Button>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line Chart
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-96">
          {chartType === 'composed' ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-foreground)" />
                <YAxis yAxisId="left" stroke="var(--color-foreground)" />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                  }}
                  formatter={(value: any) => {
                    if (typeof value === 'number') {
                      return value.toFixed(2)
                    }
                    return value
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="impressions" fill="#3b82f6" name="Impressions" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ctr"
                  stroke="#10b981"
                  name="CTR (%)"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-foreground)" />
                <YAxis stroke="var(--color-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3b82f6"
                  name="Impressions"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#ec4899"
                  name="Clicks"
                  strokeWidth={2}
                  dot={{ fill: '#ec4899', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
