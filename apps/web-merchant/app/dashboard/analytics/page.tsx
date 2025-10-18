'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Zap, Droplets, DollarSign, Lightbulb } from 'lucide-react';

interface ResourceData {
  date: string;
  energy: number;
  water: number;
  cost: number;
}

interface Recommendation {
  type: string;
  priority: string;
  title: string;
  description: string;
  potentialSavings: {
    amount: number;
    unit: string;
    period: string;
  };
  actionItems: string[];
}

export default function AnalyticsPage() {
  const [resourceData, setResourceData] = useState<ResourceData[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // TODO: Replace with actual API calls
      // const resourceResponse = await fetch('/api/v1/iot/optimization/usage-summary');
      // const recsResponse = await fetch('/api/v1/iot/optimization/recommendations');

      // Mock resource data (last 30 days)
      const mockResourceData: ResourceData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        mockResourceData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          energy: 45 + Math.random() * 15,
          water: 280 + Math.random() * 60,
          cost: 32 + Math.random() * 8,
        });
      }
      setResourceData(mockResourceData);

      // Mock recommendations
      setRecommendations([
        {
          type: 'ENERGY',
          priority: 'HIGH',
          title: 'High Energy Consumption Detected',
          description: 'Your equipment is consuming an average of 2.8kW during operating hours, which is 20% higher than industry standards (2.2kW).',
          potentialSavings: {
            amount: 135,
            unit: 'USD',
            period: 'monthly',
          },
          actionItems: [
            'Clean lint filters and ventilation systems',
            'Inspect heating elements for buildup',
            'Consider upgrading to energy-efficient equipment',
            'Schedule preventive maintenance',
          ],
        },
        {
          type: 'SCHEDULING',
          priority: 'MEDIUM',
          title: 'Off-Peak Energy Opportunity',
          description: 'Shifting 30% of operations to off-peak hours (10pm-6am) could reduce energy costs significantly.',
          potentialSavings: {
            amount: 85,
            unit: 'USD',
            period: 'monthly',
          },
          actionItems: [
            'Review customer pickup/delivery preferences',
            'Offer incentives for off-peak orders',
            'Batch process during off-peak hours',
          ],
        },
        {
          type: 'WATER',
          priority: 'MEDIUM',
          title: 'Water Optimization Available',
          description: 'Average water usage is 52L per cycle. Optimizing wash cycles could reduce this to 42L.',
          potentialSavings: {
            amount: 45,
            unit: 'USD',
            period: 'monthly',
          },
          actionItems: [
            'Use appropriate water levels for load size',
            'Implement water recycling systems',
            'Check for leaks and inefficiencies',
          ],
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSavings = recommendations.reduce((sum, rec) => sum + rec.potentialSavings.amount, 0);
  const avgEnergy = resourceData.reduce((sum, d) => sum + d.energy, 0) / resourceData.length;
  const avgWater = resourceData.reduce((sum, d) => sum + d.water, 0) / resourceData.length;
  const avgCost = resourceData.reduce((sum, d) => sum + d.cost, 0) / resourceData.length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-600 hover:bg-red-700';
      case 'MEDIUM': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'LOW': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resource Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Monitor energy, water usage, and cost optimization opportunities
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Potential Monthly Savings
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">${totalSavings}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Avg Daily Energy
            </CardDescription>
            <CardTitle className="text-2xl">{avgEnergy.toFixed(1)} kWh</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Avg Daily Water
            </CardDescription>
            <CardTitle className="text-2xl">{avgWater.toFixed(0)} L</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Daily Cost</CardDescription>
            <CardTitle className="text-2xl">${avgCost.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Energy Consumption</CardTitle>
            <CardDescription>Daily kWh usage - Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="energy" fill="#2563eb" name="Energy (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Water Usage</CardTitle>
            <CardDescription>Daily liters - Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="water" fill="#0891b2" name="Water (L)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Daily Operating Costs</CardTitle>
          <CardDescription>Combined energy and water costs - Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="#16a34a" name="Cost ($)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-6 w-6 text-yellow-600" />
          <h2 className="text-2xl font-bold">Optimization Recommendations</h2>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="flex">
                <div className={`w-2 ${getPriorityColor(rec.priority)}`} />
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${getPriorityColor(rec.priority)} text-white`}>
                        {rec.priority}
                      </Badge>
                      <Badge variant="outline">{rec.type}</Badge>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900 dark:text-green-100">
                        Potential Savings: ${rec.potentialSavings.amount}/{rec.potentialSavings.period}
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      ${(rec.potentialSavings.amount * 12).toLocaleString()}/year estimated savings
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Action Items:</p>
                    <ul className="space-y-1">
                      {rec.actionItems.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Annual ROI Projection
            </CardTitle>
            <CardDescription>Implementing all recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Annual Savings</p>
                <p className="text-3xl font-bold text-blue-600">${(totalSavings * 12).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Implementation Cost</p>
                <p className="text-3xl font-bold">$0 - $500</p>
                <p className="text-xs text-muted-foreground mt-1">Mostly operational changes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">ROI</p>
                <p className="text-3xl font-bold text-green-600">300-500%</p>
                <p className="text-xs text-muted-foreground mt-1">First year return</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}