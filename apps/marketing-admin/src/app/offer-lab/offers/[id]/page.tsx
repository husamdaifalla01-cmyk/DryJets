'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useOffer, useUpdateTrackingLink, useGenerateFunnel } from '@/lib/hooks/useOfferLab';
import { ArrowLeft, ExternalLink, Zap, TrendingUp, DollarSign, Target } from 'lucide-react';
import Link from 'next/link';

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;

  const { data: offer, isLoading } = useOffer(offerId);
  const updateTrackingLinkMutation = useUpdateTrackingLink();
  const generateFunnelMutation = useGenerateFunnel();

  const [trackingLink, setTrackingLink] = useState('');

  const handleSaveTrackingLink = () => {
    if (!trackingLink) return;
    updateTrackingLinkMutation.mutate({ offerId, trackingLink });
  };

  const handleGenerateFunnel = () => {
    generateFunnelMutation.mutate(
      { offerId },
      {
        onSuccess: (data) => {
          router.push(`/offer-lab/funnels/${data.funnel.id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading offer details...</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Offer not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/offer-lab/offers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{offer.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="capitalize">{offer.network}</Badge>
            <Badge>{offer.status}</Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-3xl font-bold">{offer.score}</span>
          </div>
          <p className="text-sm text-muted-foreground">Quality Score</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${offer.payout}</div>
            <p className="text-xs text-muted-foreground">{offer.currency}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">EPC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${offer.epc}</div>
            <p className="text-xs text-muted-foreground">Earnings per click</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offer.conversionRate || 'N/A'}%</div>
            <p className="text-xs text-muted-foreground">Estimated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              GEOs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offer.geoTargets.length}</div>
            <p className="text-xs text-muted-foreground">Target countries</p>
          </CardContent>
        </Card>
      </div>

      {/* Description & Details */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Description</Label>
            <p className="text-sm text-muted-foreground mt-1">{offer.description || 'No description available'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {offer.category.map((cat: string) => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Target GEOs</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {offer.geoTargets.map((geo: string) => (
                  <Badge key={geo} variant="outline">{geo}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label>Allowed Traffic</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {offer.allowedTraffic.map((traffic: string) => (
                <Badge key={traffic} variant="outline">{traffic}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Link */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Link</CardTitle>
          <CardDescription>
            Activate this offer in your {offer.network} dashboard, then paste your tracking link here
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {offer.trackingLink ? (
            <div>
              <Label>Current Tracking Link</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={offer.trackingLink} readOnly />
                <Button variant="outline" size="icon" asChild>
                  <a href={offer.trackingLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Activated on {new Date(offer.activatedAt!).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="trackingLink">Enter Tracking Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="trackingLink"
                  placeholder="https://..."
                  value={trackingLink}
                  onChange={(e) => setTrackingLink(e.target.value)}
                />
                <Button
                  onClick={handleSaveTrackingLink}
                  disabled={!trackingLink || updateTrackingLinkMutation.isPending}
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Visit {offer.previewUrl} to activate this offer
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            onClick={handleGenerateFunnel}
            disabled={!offer.trackingLink || generateFunnelMutation.isPending}
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate Funnel
          </Button>
          {offer.previewUrl && (
            <Button variant="outline" size="lg" asChild>
              <a href={offer.previewUrl} target="_blank" rel="noopener noreferrer">
                View on {offer.network} <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
