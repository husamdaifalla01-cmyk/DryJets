'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useConnections, useInitiateOAuth, useDisconnectPlatform } from '@/lib/hooks/useConnections';
import { useProfile } from '@/lib/hooks/useProfile';
import { PlatformCard } from '@/components/connections/PlatformCard';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandPanel, DataPanel } from '@/components/command/CommandPanel';
import { Platform, PLATFORM_INFO } from '@/types/connection';
import { ArrowLeft, Share2, CheckCircle } from 'lucide-react';

/**
 * PLATFORM CONNECTIONS PAGE
 *
 * Manage platform connections for a marketing profile.
 * Features OAuth flows, API key connections, and health monitoring.
 */

const ALL_PLATFORMS: Platform[] = [
  'twitter',
  'linkedin',
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'wordpress',
  'medium',
  'ghost',
];

export default function ConnectionsPage() {
  const params = useParams();
  const profileId = params.id as string;

  const { data: profile } = useProfile(profileId);
  const { data: connections, isLoading } = useConnections(profileId);
  const initiateOAuth = useInitiateOAuth();
  const disconnect = useDisconnectPlatform();

  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const handleConnect = (platform: Platform) => {
    const info = PLATFORM_INFO[platform];

    if (info.authType === 'oauth') {
      // Initiate OAuth flow
      initiateOAuth.mutate({
        profileId,
        data: {
          platform,
          redirectUri: `${window.location.origin}/oauth/callback`,
        },
      });
    } else {
      // Show API key modal
      setSelectedPlatform(platform);
    }
  };

  const handleDisconnect = (platform: Platform) => {
    if (confirm(`Are you sure you want to disconnect ${PLATFORM_INFO[platform].name}?`)) {
      disconnect.mutate({ profileId, platform });
    }
  };

  const connectedPlatforms = connections?.filter((c) => c.status === 'connected') || [];
  const connectedCount = connectedPlatforms.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-text-tertiary text-sm font-mono uppercase">
            LOADING CONNECTIONS
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={`/profiles/${profileId}`}
        className="inline-flex items-center gap-2 text-text-tertiary hover:text-neon-cyan transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO PROFILE
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-cyan mb-2">
            PLATFORM CONNECTIONS
          </h1>
          <p className="text-text-tertiary">
            Connect {profile?.brandName} to social media and publishing platforms
          </p>
        </div>
      </div>

      {/* Connection Summary */}
      <div className="grid grid-cols-3 gap-4">
        <DataPanel elevated>
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-neon-cyan" />
            <div>
              <div className="text-xs text-text-tertiary uppercase">TOTAL PLATFORMS</div>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {ALL_PLATFORMS.length}
              </div>
            </div>
          </div>
        </DataPanel>

        <DataPanel elevated>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-neon-green" />
            <div>
              <div className="text-xs text-text-tertiary uppercase">CONNECTED</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-neon-green">
                {connectedCount}
              </div>
            </div>
          </div>
        </DataPanel>

        <DataPanel elevated>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <div>
              <div className="text-xs text-text-tertiary uppercase">COMPLETION</div>
              <div className="text-2xl font-bold font-mono tabular-nums">
                {Math.round((connectedCount / ALL_PLATFORMS.length) * 100)}%
              </div>
            </div>
          </div>
        </DataPanel>
      </div>

      {/* Info Panel */}
      {connectedCount === 0 && (
        <CommandPanel>
          <div className="flex items-start gap-4">
            <Share2 className="w-6 h-6 text-neon-cyan flex-shrink-0" />
            <div>
              <h3 className="font-bold mb-2">CONNECT YOUR FIRST PLATFORM</h3>
              <p className="text-text-secondary text-sm mb-4">
                Connect at least one platform to start publishing content automatically.
                The more platforms you connect, the wider your reach.
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm">
                <li>Secure OAuth 2.0 authentication</li>
                <li>Real-time health monitoring</li>
                <li>Automatic content optimization per platform</li>
                <li>Single-click publishing to all connected platforms</li>
              </ul>
            </div>
          </div>
        </CommandPanel>
      )}

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_PLATFORMS.map((platform) => {
          const connection = connections?.find((c) => c.platform === platform);

          return (
            <PlatformCard
              key={platform}
              platform={platform}
              connection={connection}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          );
        })}
      </div>

      {/* Help Section */}
      <DataPanel>
        <h3 className="text-sm text-text-tertiary uppercase mb-4">NEED HELP?</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-text-primary font-medium mb-2">OAuth Platforms</h4>
            <p className="text-text-secondary">
              Click "Connect" and authorize the app through the platform's secure login.
              Your credentials are never stored.
            </p>
          </div>
          <div>
            <h4 className="text-text-primary font-medium mb-2">API Key Platforms</h4>
            <p className="text-text-secondary">
              Generate API keys from your platform's settings and paste them here.
              Keys are encrypted and stored securely.
            </p>
          </div>
        </div>
      </DataPanel>
    </div>
  );
}
