'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useOffers, useSyncOffers } from '@/lib/hooks/useOfferLab';
import { RefreshCw, Search, TrendingUp, ExternalLink } from 'lucide-react';

export default function OffersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [network, setNetwork] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOffers({
    searchQuery: searchQuery || undefined,
    network: network as any,
    status: status as any,
    page,
    pageSize: 20,
    sortBy: 'score',
    sortOrder: 'desc',
  });

  const syncMutation = useSyncOffers();

  const handleSync = (network: string) => {
    syncMutation.mutate({ network: network as any, forceRefresh: false });
  };

  const offers = data?.offers || [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Offers</h1>
          <p className="text-muted-foreground">Browse and manage imported affiliate offers</p>
        </div>
        <div className="flex gap-2">
          <Select onValueChange={(val) => handleSync(val)}>
            <SelectTrigger className="w-[180px]">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Offers
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maxbounty">MaxBounty</SelectItem>
              <SelectItem value="clickbank">ClickBank</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search offers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={network} onValueChange={(val) => setNetwork(val === 'all' ? undefined : val)}>
              <SelectTrigger>
                <SelectValue placeholder="All Networks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Networks</SelectItem>
                <SelectItem value="maxbounty">MaxBounty</SelectItem>
                <SelectItem value="clickbank">ClickBank</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(val) => setStatus(val === 'all' ? undefined : val)}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="scaling">Scaling</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setNetwork(undefined);
                setStatus(undefined);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offers Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No offers found. Try syncing from a network.</p>
            <Select onValueChange={(val) => handleSync(val)}>
              <SelectTrigger className="w-[200px] mx-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Offers
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maxbounty">MaxBounty</SelectItem>
                <SelectItem value="clickbank">ClickBank</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer: any) => (
              <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{offer.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">{offer.network}</Badge>
                        <Badge variant={offer.status === 'testing' ? 'default' : 'secondary'}>
                          {offer.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-xl">{offer.score}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Score</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-4">
                    {offer.description || 'No description available'}
                  </CardDescription>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Payout</p>
                      <p className="font-semibold">${offer.payout}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">EPC</p>
                      <p className="font-semibold">${offer.epc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/offer-lab/offers/${offer.id}`}>
                        View Details <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {offers.length} of {pagination.total} offers
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
