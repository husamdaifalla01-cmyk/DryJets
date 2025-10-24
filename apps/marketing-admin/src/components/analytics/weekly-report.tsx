'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Download, Mail, FileText } from 'lucide-react'
import { useState } from 'react'

export function WeeklyReport() {
  const [showPreview, setShowPreview] = useState(true)

  // Mock weekly report data
  const weeklyMetrics = {
    startDate: '2024-10-15',
    endDate: '2024-10-21',
    totalImpressions: 28340,
    totalClicks: 2145,
    ctr: 7.57,
    avgPosition: 3.1,
    rankingImprovements: 12,
    newRankingKeywords: 3,
  }

  const topPerformingPages = [
    { title: 'Dry Cleaning Toronto', clicks: 450, ctr: 12.5, rank: 2 },
    { title: 'Laundry Care Tips', clicks: 380, ctr: 8.2, rank: 4 },
    { title: 'Professional Cleaning', clicks: 245, ctr: 6.8, rank: 5 },
  ]

  const trafficSource = [
    { name: 'Organic Search', value: 2145, fill: '#3b82f6' },
    { name: 'Direct', value: 450, fill: '#10b981' },
    { name: 'Social', value: 180, fill: '#f59e0b' },
  ]

  const dailyPerformance = [
    { day: 'Mon', impressions: 3800, clicks: 280 },
    { day: 'Tue', impressions: 4200, clicks: 310 },
    { day: 'Wed', impressions: 4100, clicks: 305 },
    { day: 'Thu', impressions: 4500, clicks: 340 },
    { day: 'Fri', impressions: 5200, clicks: 390 },
    { day: 'Sat', impressions: 3400, clicks: 260 },
    { day: 'Sun', impressions: 3140, clicks: 260 },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Weekly Performance Report
            </CardTitle>
            <CardDescription>
              Week of {weeklyMetrics.startDate} to {weeklyMetrics.endDate}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Report
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Impressions</p>
              <p className="text-2xl font-bold text-foreground">
                {weeklyMetrics.totalImpressions.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Clicks</p>
              <p className="text-2xl font-bold text-foreground">
                {weeklyMetrics.totalClicks.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">CTR</p>
              <p className="text-2xl font-bold text-foreground">{weeklyMetrics.ctr.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg Position</p>
              <p className="text-2xl font-bold text-foreground">{weeklyMetrics.avgPosition.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Improvements</p>
              <p className="text-2xl font-bold text-green-600">+{weeklyMetrics.rankingImprovements}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Traffic Source Pie */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-4">Traffic by Source</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={trafficSource}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {trafficSource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Performance Bar */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-4">Daily Performance</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-foreground)" />
                  <YAxis stroke="var(--color-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                  <Bar dataKey="impressions" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="clicks" stackId="a" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performing Pages */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Top Performing Pages</h4>
            <div className="space-y-2">
              {topPerformingPages.map((page, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">{page.title}</p>
                    <p className="text-xs text-muted-foreground">Rank #{page.rank}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-foreground">{page.clicks}</span>
                      <span className="text-muted-foreground"> clicks</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{page.ctr}%</span>
                      <span className="text-muted-foreground"> CTR</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Weekly Highlights</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>✓ {weeklyMetrics.rankingImprovements} keywords improved their rankings</li>
              <li>✓ {weeklyMetrics.newRankingKeywords} new keywords entered top 100</li>
              <li>• Average CTR is <strong>115% above industry standard</strong></li>
              <li>→ Friday had peak performance with {dailyPerformance[4].clicks} clicks</li>
            </ul>
          </div>

          {/* Subscribe to Reports */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">Automated Weekly Reports</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get this report automatically delivered to your email every Monday morning
            </p>
            <Button size="sm">Enable Email Delivery</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
