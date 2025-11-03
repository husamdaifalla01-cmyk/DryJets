'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricData {
  label: string;
  value: number;
  previousValue?: number;
  format?: 'currency' | 'percentage' | 'number';
  suffix?: string;
}

interface OptimizationMetricsChartProps {
  title: string;
  description?: string;
  metrics: MetricData[];
  showTrend?: boolean;
}

export function OptimizationMetricsChart({
  title,
  description,
  metrics,
  showTrend = true,
}: OptimizationMetricsChartProps) {
  const formatValue = (value: number, format?: string, suffix?: string) => {
    let formatted = '';

    switch (format) {
      case 'currency':
        formatted = `$${value.toFixed(2)}`;
        break;
      case 'percentage':
        formatted = `${value.toFixed(1)}%`;
        break;
      case 'number':
        formatted = value.toLocaleString();
        break;
      default:
        formatted = value.toString();
    }

    return suffix ? `${formatted}${suffix}` : formatted;
  };

  const getTrend = (current: number, previous?: number) => {
    if (!previous || previous === 0) return { icon: null, color: '', change: 0 };

    const change = ((current - previous) / previous) * 100;

    if (change > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-green-500',
        change,
      };
    } else if (change < 0) {
      return {
        icon: <TrendingDown className="h-4 w-4" />,
        color: 'text-red-500',
        change,
      };
    }

    return {
      icon: <Minus className="h-4 w-4" />,
      color: 'text-gray-500',
      change,
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const trend = getTrend(metric.value, metric.previousValue);

            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold">
                    {formatValue(metric.value, metric.format, metric.suffix)}
                  </p>
                </div>

                {showTrend && metric.previousValue !== undefined && (
                  <div className={`flex items-center gap-1 ${trend.color}`}>
                    {trend.icon}
                    <span className="text-sm font-medium">
                      {trend.change > 0 && '+'}
                      {trend.change.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ROI Prediction Chart Component
interface ROIPredictionChartProps {
  campaignName: string;
  currentROI: number;
  predictions: {
    day7: number;
    day14: number;
    day30: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  confidence: 'high' | 'medium' | 'low';
}

export function ROIPredictionChart({
  campaignName,
  currentROI,
  predictions,
  trend,
  confidence,
}: ROIPredictionChartProps) {
  const getTrendBadge = () => {
    switch (trend) {
      case 'improving':
        return <Badge className="bg-green-500">Improving</Badge>;
      case 'declining':
        return <Badge variant="destructive">Declining</Badge>;
      default:
        return <Badge variant="outline">Stable</Badge>;
    }
  };

  const getConfidenceBadge = () => {
    switch (confidence) {
      case 'high':
        return <Badge variant="default">High Confidence</Badge>;
      case 'medium':
        return <Badge variant="outline">Medium Confidence</Badge>;
      default:
        return <Badge variant="outline">Low Confidence</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{campaignName}</CardTitle>
            <CardDescription>ROI Forecast</CardDescription>
          </div>
          <div className="flex gap-2">
            {getTrendBadge()}
            {getConfidenceBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Current</p>
            <p className="text-lg font-bold">{currentROI.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">7 Days</p>
            <p className="text-lg font-bold">{predictions.day7.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">14 Days</p>
            <p className="text-lg font-bold">{predictions.day14.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">30 Days</p>
            <p className="text-lg font-bold">{predictions.day30.toFixed(1)}%</p>
          </div>
        </div>

        {/* Simple visual trend line */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${trend === 'improving' ? 'bg-green-500' : trend === 'declining' ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{
              width: `${Math.min(100, Math.max(0, (predictions.day30 / currentROI) * 100))}%`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Funnel Visualization Component
interface FunnelStage {
  stage: string;
  count: number;
  dropoffRate: number;
  conversionRate: number;
}

interface FunnelVisualizationProps {
  campaignName: string;
  stages: FunnelStage[];
  funnelHealth: number;
}

export function FunnelVisualization({
  campaignName,
  stages,
  funnelHealth,
}: FunnelVisualizationProps) {
  const getHealthColor = (health: number) => {
    if (health >= 80) return 'bg-green-500';
    if (health >= 60) return 'bg-yellow-500';
    if (health >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{campaignName}</CardTitle>
            <CardDescription>Conversion Funnel</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Health Score</p>
            <p className="text-2xl font-bold">{funnelHealth}/100</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage, index) => {
          const width = ((stage.count / stages[0].count) * 100).toFixed(1);

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium capitalize">{stage.stage}</span>
                <span className="text-muted-foreground">{stage.count.toLocaleString()}</span>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-md overflow-hidden">
                <div
                  className={`h-full ${getHealthColor(100 - stage.dropoffRate)} transition-all`}
                  style={{ width: `${width}%` }}
                >
                  <div className="absolute inset-0 flex items-center px-3 text-white text-xs font-medium">
                    {stage.conversionRate.toFixed(2)}% CVR
                  </div>
                </div>
              </div>
              {stage.dropoffRate > 0 && (
                <p className="text-xs text-red-500">
                  {stage.dropoffRate.toFixed(1)}% drop-off
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
