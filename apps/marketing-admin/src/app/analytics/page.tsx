'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PerformanceChart } from '@/components/analytics/performance-chart'
import { KeywordTracking } from '@/components/analytics/keyword-tracking'
import { SerpRankings } from '@/components/analytics/serp-rankings'
import { WeeklyReport } from '@/components/analytics/weekly-report'
import { TrendingUp, Eye, Activity, AlertCircle, Calendar, Download } from 'lucide-react'
import { useState } from 'react'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month')

  // Mock analytics data - will be replaced with real data from API
  const metrics = {
    totalImpressions: 45230,
    totalClicks: 3421,
    ctr: 7.56,
    averagePosition: 3.2,
    topKeyword: 'dry cleaning toronto',
    topKeywordRank: 2,
    totalKeywords: 127,
    rankingKeywords: 42,
  }

  const performanceData = [
    { date: 'Oct 15', impressions: 2400, clicks: 240, ctr: 10 },
    { date: 'Oct 16', impressions: 1398, clicks: 221, ctr: 15.8 },
    { date: 'Oct 17', impressions: 9800, clicks: 229, ctr: 2.4 },
    { date: 'Oct 18', impressions: 3908, clicks: 200, ctr: 5.1 },
    { date: 'Oct 19', impressions: 4800, clicks: 218, ctr: 4.5 },
    { date: 'Oct 20', impressions: 3800, clicks: 250, ctr: 6.6 },
    { date: 'Oct 21', impressions: 4300, clicks: 321, ctr: 7.4 },
  ]

  const keywords = [
    { keyword: 'dry cleaning toronto', rank: 2, change: 1, searches: 8900, ctr: 8.2 },
    { keyword: 'laundry service near me', rank: 5, change: -2, searches: 6200, ctr: 5.4 },
    { keyword: 'professional dry cleaning', rank: 3, change: 0, searches: 4500, ctr: 9.1 },
    { keyword: 'rush laundry service', rank: 7, change: 2, searches: 2100, ctr: 3.8 },
    { keyword: 'eco friendly dry cleaning', rank: 12, change: -1, searches: 1800, ctr: 2.1 },
  ]

  const serpRankings = [
    { url: '/services/dry-cleaning', keyword: 'dry cleaning toronto', position: 2, impressions: 3200, clicks: 285, ctr: 8.9 },
    { url: '/blog/laundry-care-tips', keyword: 'laundry care tips', position: 4, impressions: 1850, clicks: 92, ctr: 5.0 },
    { url: '/services/rush-cleaning', keyword: 'rush laundry service', position: 7, impressions: 890, clicks: 34, ctr: 3.8 },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="SEO Analytics"
          description="Track your search performance and keyword rankings"
        />
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last 12 months</option>
          </select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Total Impressions</span>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.totalImpressions.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs gap-1">
                <TrendingUp className="h-3 w-3" />
                +12.5%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Total Clicks</span>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.totalClicks.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs gap-1">
                <TrendingUp className="h-3 w-3" />
                +8.3%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.ctr.toFixed(2)}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs gap-1">
                <TrendingUp className="h-3 w-3" />
                +2.1%
              </Badge>
              <span className="text-xs text-muted-foreground">industry avg: 3.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg. Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.averagePosition.toFixed(1)}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs gap-1">
                ↓ Improved
              </Badge>
              <span className="text-xs text-muted-foreground">3 positions better</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <PerformanceChart data={performanceData} />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Top Keywords Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Keywords</CardTitle>
                <CardDescription>Your best performing keywords from Google Search Console</CardDescription>
              </div>
              <Badge variant="outline">{metrics.totalKeywords} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keywords.map((kw, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{kw.keyword}</p>
                      <Badge variant={kw.change > 0 ? 'secondary' : 'destructive'} className="text-xs gap-1">
                        {kw.change > 0 ? '↑' : kw.change < 0 ? '↓' : '→'} {Math.abs(kw.change)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Rank: #{kw.rank}</span>
                      <span>•</span>
                      <span>{kw.searches.toLocaleString()} monthly searches</span>
                      <span>•</span>
                      <span>CTR: {kw.ctr}%</span>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">{kw.searches.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking Keywords Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ranking Keywords</CardTitle>
            <CardDescription>Keywords ranking in top 10</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Top 10</span>
                  <span className="text-lg font-bold text-foreground">18</span>
                </div>
                <div className="bg-green-100 dark:bg-green-950 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">11-30</span>
                  <span className="text-lg font-bold text-foreground">24</span>
                </div>
                <div className="bg-blue-100 dark:bg-blue-950 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">View All Keywords</Button>
          </CardContent>
        </Card>
      </div>

      {/* SERP Rankings */}
      <SerpRankings rankings={serpRankings} />

      {/* Weekly Report */}
      <WeeklyReport />

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            AI Insights from Rin Analytics Agent
          </CardTitle>
          <CardDescription>Automated recommendations to improve your SEO performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">Opportunity: High-Volume Keywords Without Rankings</p>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                Rin identified 8 keywords with 5,000+ monthly searches where you're not currently ranking. Creating content around these keywords could increase organic traffic by an estimated 35%.
              </p>
              <Button variant="outline" size="sm">Create Content Plan</Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Optimization: Improve Click-Through Rates</p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Your current CTR is 7.56%, which is 115% above industry average. However, 3 blog posts are ranking in positions 3-5 but have below-average CTR. Optimizing their meta descriptions could add ~200 clicks/month.
              </p>
              <Button variant="outline" size="sm">View Posts to Optimize</Button>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">Success: Position Improvements Detected</p>
              <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                42 of your 127 tracked keywords have improved their rankings in the last 30 days. Your recent blog posts are already gaining traction. Keep up the content velocity!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
