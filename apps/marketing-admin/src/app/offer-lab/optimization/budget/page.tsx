'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetRecommendation {
  campaignId: string;
  campaignName: string;
  currentBudget: number;
  recommendedBudget: number;
  change: number;
  changePercentage: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface OptimizationResult {
  strategy: string;
  totalBudget: number;
  recommendations: BudgetRecommendation[];
  expectedROIIncrease: number;
  expectedConversionIncrease: number;
  summary: string;
}

export default function BudgetOptimizationPage() {
  const [strategy, setStrategy] = useState<string>('balanced');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/offer-lab/optimization/budget/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy }),
      });

      if (!response.ok) throw new Error('Failed to optimize budgets');

      const data = await response.json();
      setOptimizationResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendations = async () => {
    if (!optimizationResult) return;

    setApplying(true);
    setError(null);

    try {
      const response = await fetch('/api/offer-lab/optimization/budget/apply-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendations: optimizationResult.recommendations }),
      });

      if (!response.ok) throw new Error('Failed to apply recommendations');

      const result = await response.json();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);

      // Refresh optimization
      runOptimization();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setApplying(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Budget Optimization</h1>
        <p className="text-muted-foreground">
          Optimize budget allocation across campaigns for maximum ROI
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Budget recommendations applied successfully!</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Strategy</CardTitle>
          <CardDescription>
            Choose how to allocate budgets across your campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Strategy</label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roi">Maximize ROI</SelectItem>
                  <SelectItem value="epc">Maximize EPC</SelectItem>
                  <SelectItem value="conversions">Maximize Conversions</SelectItem>
                  <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runOptimization} disabled={loading}>
              {loading ? 'Optimizing...' : 'Run Optimization'}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>ROI:</strong> Prioritizes campaigns with highest return on investment
            </p>
            <p>
              <strong>EPC:</strong> Prioritizes campaigns with highest earnings per click
            </p>
            <p>
              <strong>Conversions:</strong> Prioritizes campaigns with most conversions
            </p>
            <p>
              <strong>Balanced:</strong> Considers ROI, EPC, and conversion rate together
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {optimizationResult && (
        <>
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${optimizationResult.totalBudget.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Daily allocation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected ROI Increase</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{optimizationResult.expectedROIIncrease.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">If recommendations applied</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Increase</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  +{optimizationResult.expectedConversionIncrease.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Estimated lift</p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Budget Recommendations</CardTitle>
                  <CardDescription>{optimizationResult.summary}</CardDescription>
                </div>
                <Button onClick={applyRecommendations} disabled={applying} variant="default">
                  {applying ? 'Applying...' : 'Apply All Recommendations'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Current Budget</TableHead>
                    <TableHead className="text-right">Recommended</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {optimizationResult.recommendations.map((rec) => (
                    <TableRow key={rec.campaignId}>
                      <TableCell className="font-medium">{rec.campaignName}</TableCell>
                      <TableCell className="text-right">
                        ${rec.currentBudget.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${rec.recommendedBudget.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {rec.change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : rec.change < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : null}
                          <span
                            className={
                              rec.change > 0
                                ? 'text-green-600'
                                : rec.change < 0
                                  ? 'text-red-600'
                                  : ''
                            }
                          >
                            {rec.change > 0 ? '+' : ''}
                            {rec.changePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(rec.priority)}</TableCell>
                      <TableCell className="max-w-md">{rec.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!optimizationResult && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No Optimization Results</p>
            <p className="text-muted-foreground mb-4">
              Select a strategy and run optimization to see recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
