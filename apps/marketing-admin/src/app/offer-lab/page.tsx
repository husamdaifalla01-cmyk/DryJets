'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOffers, useFunnels, useLeads } from '@/lib/hooks/useOfferLab';
import { DollarSign, Zap, TrendingUp, Users, ExternalLink, Plus } from 'lucide-react';

export default function OfferLabDashboard() {
  const { data: offersData } = useOffers({ page: 1, pageSize: 5, sortBy: 'score', sortOrder: 'desc' });
  const { data: funnelsData } = useFunnels({ page: 1, pageSize: 5, sortBy: 'createdAt', sortOrder: 'desc' });
  const { data: leadsData } = useLeads({ page: 1, pageSize: 10 });

  const totalOffers = offersData?.pagination.total || 0;
  const totalFunnels = funnelsData?.pagination.total || 0;
  const totalLeads = leadsData?.pagination.total || 0;

  const topOffers = offersData?.offers || [];
  const recentFunnels = funnelsData?.funnels || [];

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-green-50 to-blue-50 p-8">
        <div className="absolute top-0 right-0 -m-16 h-32 w-32 rounded-full bg-green-300 opacity-10" />
        <div className="absolute bottom-0 left-0 -m-16 h-32 w-32 rounded-full bg-blue-300 opacity-10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-8 w-8 text-green-600" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Offer-Lab: Affiliate Intelligence Engine
            </h2>
          </div>

          <p className="text-lg text-gray-700 mb-2 max-w-2xl">
            Automate affiliate offer discovery, funnel generation, and lead capture with AI-powered intelligence.
          </p>

          <div className="flex gap-4 mt-6">
            <Button size="lg" asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/offer-lab/offers">
                <TrendingUp className="h-5 w-5 mr-2" />
                Browse Offers
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/offer-lab/funnels">
                <Zap className="h-5 w-5 mr-2" />
                View Funnels
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalOffers}</div>
                <p className="text-xs text-muted-foreground">Active Offers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalFunnels}</div>
                <p className="text-xs text-muted-foreground">Generated Funnels</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalLeads}</div>
                <p className="text-xs text-muted-foreground">Captured Leads</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Top Offers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Offers by Score</CardTitle>
              <CardDescription>Highest scoring affiliate offers based on EPC, payout, and conversion metrics</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/offer-lab/offers">
                View All <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {topOffers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No offers yet. Start by syncing offers from affiliate networks.</p>
              <Button className="mt-4" asChild>
                <Link href="/offer-lab/offers">
                  <Plus className="h-4 w-4 mr-2" />
                  Sync Offers
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {topOffers.map((offer: any) => (
                <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <Link href={`/offer-lab/offers/${offer.id}`} className="font-medium hover:underline">
                      {offer.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">{offer.network}</span>
                      <span>${offer.payout} payout</span>
                      <span>${offer.epc} EPC</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-lg">{offer.score}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Funnels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Funnels</CardTitle>
              <CardDescription>Your latest generated funnels</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/offer-lab/funnels">
                View All <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentFunnels.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No funnels yet. Generate your first funnel from an offer.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFunnels.map((funnel: any) => (
                <div key={funnel.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex-1">
                    <Link href={`/offer-lab/funnels/${funnel.id}`} className="font-medium hover:underline">
                      {funnel.headline}
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">{funnel.status}</span>
                      <span>{funnel.views} views</span>
                      <span>{funnel.clicks} clicks</span>
                      <span>{funnel.leads} leads</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
