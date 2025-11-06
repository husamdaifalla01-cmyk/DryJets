'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { getExpressDashboardUrl, getAccountStatus, calculateMerchantPayout } from '@/lib/stripe-connect';

interface PayoutData {
  accountId: string;
  accountStatus: any;
  pendingBalance: number;
  availableBalance: number;
  recentTransfers: Array<{
    id: string;
    amount: number;
    status: string;
    created: string;
    orderId: string;
  }>;
  monthlyEarnings: Array<{
    month: string;
    amount: number;
    orders: number;
  }>;
}

interface PayoutDashboardProps {
  merchantId: string;
}

export default function PayoutDashboard({ merchantId }: PayoutDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: payoutData, isLoading, refetch } = useQuery({
    queryKey: ['payouts', merchantId],
    queryFn: async (): Promise<PayoutData> => {
      // This would fetch from your API
      const response = await fetch(`/api/merchants/${merchantId}/payouts`);
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSetupStripe = async () => {
    try {
      const response = await fetch(`/api/merchants/${merchantId}/stripe/setup`, {
        method: 'POST',
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to setup Stripe:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!payoutData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load payout data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const accountStatus = getAccountStatus(payoutData.accountStatus);
  const hasStripeAccount = !!payoutData.accountId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payout Dashboard</h2>
          <p className="text-gray-600">Manage your earnings and payouts</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stripe Account Setup */}
      {!hasStripeAccount && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>
              Set up your Stripe account to receive payouts. This is required to accept payments from customers.
            </span>
            <Button onClick={handleSetupStripe} className="ml-4">
              Set Up Stripe Account
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {hasStripeAccount && accountStatus.status !== 'active' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Complete your Stripe account setup</p>
              <p>Your account status: <Badge variant="secondary">{accountStatus.status}</Badge></p>
              {accountStatus.requirements.length > 0 && (
                <p className="text-sm mt-1">
                  Required: {accountStatus.requirements.join(', ')}
                </p>
              )}
            </div>
            <Button
              asChild
              variant="outline"
              className="ml-4"
            >
              <a
                href={getExpressDashboardUrl(payoutData.accountId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Complete Setup <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(payoutData.availableBalance / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Ready for payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(payoutData.pendingBalance / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Processing (2-7 days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payoutData.monthlyEarnings[0]?.amount ? (payoutData.monthlyEarnings[0].amount / 100).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transfers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
          <CardDescription>Your latest transfers and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {payoutData.recentTransfers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No payouts yet</p>
          ) : (
            <div className="space-y-4">
              {payoutData.recentTransfers.map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transfer.status === 'paid' ? 'bg-green-100' :
                      transfer.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {transfer.status === 'paid' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : transfer.status === 'pending' ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Order #{transfer.orderId}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transfer.created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(transfer.amount / 100).toFixed(2)}</p>
                    <Badge
                      variant={
                        transfer.status === 'paid' ? 'default' :
                        transfer.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {transfer.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Earnings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
          <CardDescription>Your earnings over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payoutData.monthlyEarnings.slice(0, 6).map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm font-medium">{month.month}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{month.orders} orders</span>
                  <span className="font-semibold">${(month.amount / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fee Information */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structure</CardTitle>
          <CardDescription>Understanding how payouts are calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Platform Commission</span>
              <span className="font-semibold">15%</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span>Payment Processing</span>
              <span className="font-semibold">2.9% + $0.30</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-green-600">
              <span className="font-semibold">You Keep</span>
              <span className="font-semibold">82.1%</span>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Example: $100 order = $82.10 payout to you
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
