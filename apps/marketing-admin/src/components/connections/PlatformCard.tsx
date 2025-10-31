import React from 'react';
import { Platform, PLATFORM_INFO, PlatformConnection, ConnectionHealth } from '@/types/connection';
import { DataPanel } from '@/components/command/CommandPanel';
import { CommandButton } from '@/components/command/CommandButton';
import { StatusBadge } from '@/components/command/StatusBadge';
import { CheckCircle, AlertTriangle, XCircle, Plug, Unplug } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * PLATFORM CARD
 *
 * Display card for individual platform connections.
 * Shows connection status, health, and actions.
 */

interface PlatformCardProps {
  platform: Platform;
  connection?: PlatformConnection;
  health?: ConnectionHealth;
  onConnect: (platform: Platform) => void;
  onDisconnect: (platform: Platform) => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  connection,
  health,
  onConnect,
  onDisconnect,
}) => {
  const info = PLATFORM_INFO[platform];
  const isConnected = connection?.status === 'connected';

  const getHealthIcon = () => {
    if (!health) return null;

    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-neon-yellow" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-neon-magenta" />;
      default:
        return null;
    }
  };

  return (
    <DataPanel className="group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center bg-bg-elevated border-2 border-border-emphasis text-xl font-bold">
            {info.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg">{info.name}</h3>
            <p className="text-text-tertiary text-xs uppercase">
              {info.authType === 'oauth' ? 'OAuth 2.0' : 'API Key'}
            </p>
          </div>
        </div>

        {isConnected ? (
          <StatusBadge status="active" showPulse />
        ) : (
          <StatusBadge status="pending">DISCONNECTED</StatusBadge>
        )}
      </div>

      {/* Description */}
      <p className="text-text-secondary text-sm mb-4">{info.description}</p>

      {/* Connection Info */}
      {isConnected && connection && (
        <div className="space-y-2 mb-4 p-3 bg-bg-elevated border-l-2 border-neon-cyan">
          {connection.platformUsername && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-tertiary">Account:</span>
              <span className="text-text-primary font-mono">@{connection.platformUsername}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-tertiary">Connected:</span>
            <span className="text-text-primary">
              {formatDistanceToNow(new Date(connection.connectedAt), { addSuffix: true })}
            </span>
          </div>
          {connection.lastSyncAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-tertiary">Last Sync:</span>
              <span className="text-text-primary">
                {formatDistanceToNow(new Date(connection.lastSyncAt), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Health Status */}
      {isConnected && health && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm">
            {getHealthIcon()}
            <span className="text-text-tertiary">Health:</span>
            <span className="text-text-primary capitalize">{health.status}</span>
          </div>
          {health.details?.rateLimit && (
            <div className="mt-2 text-xs text-text-tertiary">
              Rate Limit: {health.details.rateLimit.remaining}/{health.details.rateLimit.total}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isConnected ? (
          <>
            <CommandButton
              variant="ghost"
              size="sm"
              onClick={() => onDisconnect(platform)}
              className="flex-1"
            >
              <Unplug className="w-4 h-4" />
              DISCONNECT
            </CommandButton>
            <CommandButton
              variant="ghost"
              size="sm"
              className="flex-1"
            >
              TEST
            </CommandButton>
          </>
        ) : (
          <CommandButton
            onClick={() => onConnect(platform)}
            className="w-full"
          >
            <Plug className="w-4 h-4" />
            CONNECT
          </CommandButton>
        )}
      </div>

      {/* Error Message */}
      {connection?.errorMessage && (
        <div className="mt-4 p-2 bg-neon-magenta/10 border border-neon-magenta text-neon-magenta text-xs">
          {connection.errorMessage}
        </div>
      )}
    </DataPanel>
  );
};

export default PlatformCard;
