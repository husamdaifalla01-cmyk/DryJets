'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  Activity,
  Zap,
} from 'lucide-react';

interface DashboardOverview {
  budgetUtilization: {
    totalDailyBudget: number;
    globalCap: number;
    remainingBudget: number;
    utilizationPercentage: number;
    activeCampaigns: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  scalingOpportunities: number;
  activeAlerts: number;
  portfolioROI: {
    currentWeightedROI: number;
    predicted7DayROI: number;
    predicted14DayROI: number;
    predicted30DayROI: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  funnelHealth: number;
  marketPressure: number;
  timestamp: string;
}

export default function OptimizationDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/offer-lab/optimization/dashboard/overview');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setOverview(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!overview) return null;

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Optimization Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time campaign performance and optimization insights
          </p>
        </div>
        <Button onClick={fetchDashboardData}>
          <Activity className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Alert Banner */}
      {overview.activeAlerts > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Active Alerts</AlertTitle>
          <AlertDescription>
            You have {overview.activeAlerts} active fraud or performance alerts requiring attention.
            <Button variant="link" className="ml-2" asChild>
              <a href="/offer-lab/optimization/alerts">View Alerts</a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Budget Utilization */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.budgetUtilization.utilizationPercentage.toFixed(1)}%
            </div>
            <div className="flex items-center mt-2">
              <div
                className={`h-2 w-2 rounded-full mr-2 ${getBudgetStatusColor(overview.budgetUtilization.status)}`}
              />
              <p className="text-xs text-muted-foreground">
                ${overview.budgetUtilization.totalDailyBudget.toFixed(2)} / $
                {overview.budgetUtilization.globalCap.toFixed(2)}
              </p>
            </div>
            <Badge variant={overview.budgetUtilization.status === 'healthy' ? 'default' : 'destructive'} className="mt-2">
              {overview.budgetUtilization.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        {/* Portfolio ROI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio ROI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.portfolioROI.currentWeightedROI.toFixed(1)}%
            </div>
            <div className="flex items-center mt-2">
              {getTrendIcon(overview.portfolioROI.trend)}
              <p className="text-xs text-muted-foreground ml-2">
                30-day forecast: {overview.portfolioROI.predicted30DayROI.toFixed(1)}%
              </p>
            </div>
            <Badge variant="outline" className="mt-2">
              {overview.portfolioROI.trend.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        {/* Scaling Opportunities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scaling Opportunities</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.scalingOpportunities}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Campaigns ready to scale based on performance
            </p>
            <Button variant="link" className="mt-2 p-0 h-auto" asChild>
              <a href="/offer-lab/optimization/scaling">View Opportunities</a>
            </Button>
          </CardContent>
        </Card>

        {/* Funnel Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Funnel Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.funnelHealth.toFixed(0)}/100</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${overview.funnelHealth}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Market Pressure: {overview.marketPressure}/100</p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget & ROI</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Quality</TabsTrigger>
          <TabsTrigger value="bids">Bid Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common optimization tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/offer-lab/optimization/budget/rebalance">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Rebalance Budgets
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/offer-lab/optimization/scaling">
                    <Zap className="mr-2 h-4 w-4" />
                    Auto-Scale Winners
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/offer-lab/optimization/ab-tests">
                    <Target className="mr-2 h-4 w-4" />
                    Manage A/B Tests
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/offer-lab/optimization/fraud">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Review Fraud Alerts
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Optimization engine health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Budget Safety Guard</span>
                  <Badge variant="outline">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fraud Detection</span>
                  <Badge variant="outline">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Smart Scaler</span>
                  <Badge variant="outline">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ROI Predictor</span>
                  <Badge variant="outline">
                    <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Budget Optimization</CardTitle>
              <CardDescription>Manage and optimize campaign budgets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Budget optimization features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Analysis</CardTitle>
              <CardDescription>Analyze conversion funnels and dropoff points</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funnel analysis features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Quality</CardTitle>
              <CardDescription>Monitor traffic quality and detect fraud</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Traffic quality features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bids">
          <Card>
            <CardHeader>
              <CardTitle>Bid Optimization</CardTitle>
              <CardDescription>Optimize bids and analyze competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Bid optimization features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date(overview.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
