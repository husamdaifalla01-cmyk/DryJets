'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFunnels } from '@/lib/hooks/useOfferLab';
import { ExternalLink, Eye, MousePointerClick, Users } from 'lucide-react';

export default function FunnelsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFunnels({ page, pageSize: 12, sortBy: 'createdAt', sortOrder: 'desc' });

  const funnels = data?.funnels || [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Generated Funnels</h1>
          <p className="text-muted-foreground">AI-generated landing pages for your offers</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading funnels...</div>
      ) : funnels.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No funnels yet. Generate one from an offer.</p>
            <Button className="mt-4" asChild>
              <Link href="/offer-lab/offers">Browse Offers</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funnels.map((funnel: any) => (
              <Card key={funnel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{funnel.headline}</CardTitle>
                      <Badge className="mt-2" variant={funnel.status === 'published' ? 'default' : 'secondary'}>
                        {funnel.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span>{funnel.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                      <span>{funnel.clicks}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{funnel.leads}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full" asChild>
                    <Link href={`/offer-lab/funnels/${funnel.id}`}>
                      View Funnel <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span>Page {page} of {pagination.totalPages}</span>
              <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={!pagination.hasMore}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
