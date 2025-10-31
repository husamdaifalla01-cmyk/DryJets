import React from 'react';
import Link from 'next/link';
import { MarketingProfile } from '@/types/profile';
import { DataPanel } from '@/components/command/CommandPanel';
import { StatusBadge } from '@/components/command/StatusBadge';
import { CompactMetric } from '@/components/command/MetricDisplay';
import { CommandButton } from '@/components/command/CommandButton';
import {
  MoreVertical,
  Activity,
  Target,
  Globe,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * PROFILE CARD
 *
 * Display card for marketing profiles in grid view.
 * Shows key info, status, metrics, and quick actions.
 */

interface ProfileCardProps {
  profile: MarketingProfile;
  onEdit?: (profile: MarketingProfile) => void;
  onDelete?: (profile: MarketingProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onEdit,
  onDelete,
}) => {
  return (
    <DataPanel className="group relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            href={`/profiles/${profile.id}`}
            className="group-hover:text-neon-cyan transition-colors"
          >
            <h3 className="text-lg font-bold mb-1">{profile.brandName}</h3>
          </Link>
          <p className="text-text-tertiary text-sm line-clamp-2">
            {profile.description || 'No description'}
          </p>
        </div>
        <StatusBadge status={profile.status} showPulse={profile.status === 'active'} />
      </div>

      {/* Industry & Niche */}
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-text-tertiary" />
        <span className="text-text-secondary text-sm">
          {profile.industry}
        </span>
        <span className="text-text-tertiary">•</span>
        <span className="text-text-tertiary text-sm">{profile.niche}</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border-default">
        <CompactMetric
          label="PLATFORMS"
          value={profile.connectedPlatforms?.length || 0}
        />
        <CompactMetric
          label="CAMPAIGNS"
          value="0" // Will be populated from stats
        />
        <CompactMetric
          label="CONTENT"
          value="0" // Will be populated from stats
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-text-tertiary text-xs">
          <Calendar className="w-3 h-3" />
          <span>
            Updated {formatDistanceToNow(new Date(profile.updatedAt), { addSuffix: true })}
          </span>
        </div>

        <Link href={`/profiles/${profile.id}`}>
          <CommandButton size="sm">VIEW</CommandButton>
        </Link>
      </div>
    </DataPanel>
  );
};

export default ProfileCard;
