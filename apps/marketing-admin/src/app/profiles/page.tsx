'use client';

import React from 'react';
import Link from 'next/link';
import { useProfiles } from '@/lib/hooks/useProfile';
import { ProfileCard } from '@/components/profiles/ProfileCard';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandPanel, DataPanel } from '@/components/command/CommandPanel';
import { Plus, Loader2, Users } from 'lucide-react';

/**
 * PROFILES LIST PAGE
 *
 * Main profiles page showing grid of all marketing profiles.
 * Features:
 * - Grid layout with profile cards
 * - Create new profile button
 * - Loading/empty states
 * - Quick stats panel
 */

export default function ProfilesPage() {
  const { data: profiles, isLoading, error } = useProfiles();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-text-tertiary text-sm font-mono uppercase">
            LOADING PROFILES
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <CommandPanel variant="magenta">
        <div className="flex items-center gap-4">
          <div className="text-neon-magenta">⚠</div>
          <div>
            <h3 className="font-bold">LOADING FAILED</h3>
            <p className="text-text-secondary text-sm mt-1">
              Failed to load profiles. Please refresh the page.
            </p>
          </div>
        </div>
      </CommandPanel>
    );
  }

  const activeProfiles = profiles?.filter((p) => p.status === 'active') || [];
  const pausedProfiles = profiles?.filter((p) => p.status === 'paused') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-cyan mb-2">
            MARKETING PROFILES
          </h1>
          <p className="text-text-tertiary">
            Manage your marketing profiles and campaigns
          </p>
        </div>
        <Link href="/profiles/new">
          <CommandButton>
            <Plus className="w-4 h-4" />
            NEW PROFILE
          </CommandButton>
        </Link>
      </div>

      {/* Quick Stats */}
      {profiles && profiles.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <DataPanel elevated>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-neon-cyan" />
              <div>
                <div className="text-xs text-text-tertiary uppercase">
                  TOTAL PROFILES
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums">
                  {profiles.length}
                </div>
              </div>
            </div>
          </DataPanel>

          <DataPanel elevated>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-status-active animate-pulse" />
              <div>
                <div className="text-xs text-text-tertiary uppercase">
                  ACTIVE
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-status-active">
                  {activeProfiles.length}
                </div>
              </div>
            </div>
          </DataPanel>

          <DataPanel elevated>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-status-paused" />
              <div>
                <div className="text-xs text-text-tertiary uppercase">
                  PAUSED
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-status-paused">
                  {pausedProfiles.length}
                </div>
              </div>
            </div>
          </DataPanel>

          <DataPanel elevated>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-neon-purple" />
              <div>
                <div className="text-xs text-text-tertiary uppercase">
                  PLATFORMS
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums">
                  {profiles.reduce((acc, p) => acc + (p.connectedPlatforms?.length || 0), 0)}
                </div>
              </div>
            </div>
          </DataPanel>
        </div>
      )}

      {/* Empty State */}
      {profiles && profiles.length === 0 && (
        <CommandPanel>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">NO PROFILES YET</h3>
            <p className="text-text-tertiary mb-6 max-w-md mx-auto">
              Create your first marketing profile to start automating your content
              strategy across multiple platforms.
            </p>
            <Link href="/profiles/new">
              <CommandButton size="lg">
                <Plus className="w-5 h-5" />
                CREATE FIRST PROFILE
              </CommandButton>
            </Link>
          </div>
        </CommandPanel>
      )}

      {/* Profiles Grid */}
      {profiles && profiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
