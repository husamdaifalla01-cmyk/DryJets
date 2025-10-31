'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLeads } from '@/lib/hooks/useOfferLab';
import { Search, Download } from 'lucide-react';

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useLeads({
    searchQuery: searchQuery || undefined,
    page,
    pageSize: 50,
  });

  const leads = data?.leads || [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Captured Leads</h1>
          <p className="text-muted-foreground">Leads captured through your funnels</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No leads captured yet.</div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{lead.firstName || lead.lastName ? `${lead.firstName} ${lead.lastName}` : 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From: {lead.funnel?.headline || 'Unknown funnel'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span>Page {page} of {pagination.totalPages}</span>
              <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={!pagination.hasMore}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
