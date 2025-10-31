/**
 * PLATFORM CONNECTION DIALOG
 *
 * Dialog for connecting a new platform with full validation.
 * Supports both OAuth and API key authentication methods.
 *
 * Features:
 * - Platform selection
 * - OAuth flow initiation
 * - API key form with validation
 * - Connection status feedback
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  connectPlatformSchema,
  connectApiKeySchema,
  ConnectPlatformFormData,
  ConnectApiKeyFormData,
  PLATFORM_TYPES,
} from '@/lib/validations';
import { CommandButton } from '@/components/command/CommandButton';
import { CommandInput } from '@/components/command/CommandInput';
import { DataPanel } from '@/components/command/CommandPanel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Linkedin,
  Youtube,
  Twitter,
  Facebook,
  Instagram,
  Link as LinkIcon,
  Key,
  Loader2,
} from 'lucide-react';

// Platform icons mapping
const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  tiktok: LinkIcon,
  pinterest: LinkIcon,
  medium: LinkIcon,
  substack: LinkIcon,
};

// Platforms that support OAuth
const OAUTH_PLATFORMS = ['linkedin', 'youtube', 'twitter', 'facebook', 'instagram'];

interface PlatformConnectionDialogProps {
  profileId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (platform: string) => void;
}

export const PlatformConnectionDialog: React.FC<PlatformConnectionDialogProps> = ({
  profileId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'oauth' | 'api-key'>('oauth');

  // OAuth form
  const oauthForm = useForm<ConnectPlatformFormData>({
    mode: 'onBlur',
    resolver: zodResolver(connectPlatformSchema),
    defaultValues: {
      profileId,
      platform: undefined,
    },
  });

  // API Key form
  const apiKeyForm = useForm<ConnectApiKeyFormData>({
    mode: 'onBlur',
    resolver: zodResolver(connectApiKeySchema),
    defaultValues: {
      profileId,
      platform: undefined,
      apiKey: '',
      apiSecret: '',
    },
  });

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);

    // Determine default auth method based on platform
    if (OAUTH_PLATFORMS.includes(platform)) {
      setAuthMethod('oauth');
    } else {
      setAuthMethod('api-key');
    }

    oauthForm.setValue('platform', platform as any);
    apiKeyForm.setValue('platform', platform as any);
  };

  const handleOAuthConnect = async (data: ConnectPlatformFormData) => {
    // In a real implementation, this would:
    // 1. Call backend to initiate OAuth flow
    // 2. Backend returns OAuth URL
    // 3. Redirect user to OAuth provider
    // 4. User authorizes
    // 5. Redirect back to callback URL
    // 6. Complete OAuth flow

    console.log('Initiating OAuth flow:', data);

    // Mock: Redirect to OAuth URL
    const oauthUrl = `/api/platforms/oauth/authorize?platform=${data.platform}&profileId=${data.profileId}`;

    // In production, you'd do: window.location.href = oauthUrl;
    // For now, just log and call success
    console.log('Would redirect to:', oauthUrl);

    if (onSuccess) {
      onSuccess(data.platform);
    }
    onClose();
  };

  const handleApiKeyConnect = async (data: ConnectApiKeyFormData) => {
    // Call backend to connect with API key
    console.log('Connecting with API key:', {
      ...data,
      apiKey: '***REDACTED***',
      apiSecret: '***REDACTED***',
    });

    // Mock success
    if (onSuccess) {
      onSuccess(data.platform);
    }
    onClose();
  };

  const Icon = selectedPlatform ? PLATFORM_ICONS[selectedPlatform] : LinkIcon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-gradient-cyan">
            CONNECT PLATFORM
          </DialogTitle>
          <DialogDescription>
            Connect a new platform to start publishing content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Step 1: Platform Selection */}
          {!selectedPlatform && (
            <div>
              <h3 className="text-sm font-mono uppercase text-text-tertiary mb-4">
                SELECT PLATFORM
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {PLATFORM_TYPES.map((platform) => {
                  const PlatformIcon = PLATFORM_ICONS[platform];
                  return (
                    <button
                      key={platform}
                      onClick={() => handlePlatformSelect(platform)}
                      className="p-4 border border-border-emphasis hover:border-neon-cyan transition-colors group"
                    >
                      <PlatformIcon className="w-8 h-8 mx-auto mb-2 text-text-tertiary group-hover:text-neon-cyan transition-colors" />
                      <div className="text-xs uppercase font-mono text-center capitalize">
                        {platform}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Authentication Method */}
          {selectedPlatform && (
            <div className="space-y-6">
              {/* Platform Header */}
              <div className="flex items-center gap-3">
                <Icon className="w-8 h-8 text-neon-cyan" />
                <div>
                  <h3 className="text-lg font-bold capitalize">{selectedPlatform}</h3>
                  <p className="text-xs text-text-tertiary">
                    Choose authentication method
                  </p>
                </div>
                <CommandButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlatform(null)}
                  className="ml-auto"
                >
                  CHANGE
                </CommandButton>
              </div>

              {/* Auth Method Tabs */}
              <div className="flex gap-2 border-b border-border-emphasis">
                {OAUTH_PLATFORMS.includes(selectedPlatform) && (
                  <button
                    onClick={() => setAuthMethod('oauth')}
                    className={`px-4 py-2 text-sm uppercase font-mono transition-colors ${
                      authMethod === 'oauth'
                        ? 'border-b-2 border-neon-cyan text-neon-cyan'
                        : 'text-text-tertiary hover:text-text-primary'
                    }`}
                  >
                    OAuth
                  </button>
                )}
                <button
                  onClick={() => setAuthMethod('api-key')}
                  className={`px-4 py-2 text-sm uppercase font-mono transition-colors ${
                    authMethod === 'api-key'
                      ? 'border-b-2 border-neon-cyan text-neon-cyan'
                      : 'text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  API Key
                </button>
              </div>

              {/* OAuth Form */}
              {authMethod === 'oauth' && (
                <form onSubmit={oauthForm.handleSubmit(handleOAuthConnect)}>
                  <DataPanel>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <LinkIcon className="w-5 h-5 text-neon-cyan mt-1" />
                        <div className="flex-1">
                          <h4 className="font-bold mb-1">OAuth Authentication</h4>
                          <p className="text-sm text-text-tertiary">
                            You'll be redirected to {selectedPlatform} to authorize access.
                            No API keys needed.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <CommandButton
                          type="button"
                          variant="ghost"
                          onClick={onClose}
                        >
                          CANCEL
                        </CommandButton>
                        <CommandButton
                          type="submit"
                          loading={oauthForm.formState.isSubmitting}
                        >
                          CONNECT WITH OAUTH
                        </CommandButton>
                      </div>
                    </div>
                  </DataPanel>
                </form>
              )}

              {/* API Key Form */}
              {authMethod === 'api-key' && (
                <form onSubmit={apiKeyForm.handleSubmit(handleApiKeyConnect)}>
                  <DataPanel>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-text-tertiary uppercase mb-2">
                          API Key *
                        </label>
                        <CommandInput
                          {...apiKeyForm.register('apiKey')}
                  id="apiKey"
                          type="password"
                          placeholder="Enter your API key"
                        />
                        {apiKeyForm.formState.errors.apiKey && (
                          <p className="text-status-error text-xs mt-1">
                            {apiKeyForm.formState.errors.apiKey.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-text-tertiary uppercase mb-2">
                          API Secret (Optional)
                        </label>
                        <CommandInput
                          {...apiKeyForm.register('apiSecret')}
                  id="apiSecret"
                          type="password"
                          placeholder="Enter your API secret if required"
                        />
                        {apiKeyForm.formState.errors.apiSecret && (
                          <p className="text-status-error text-xs mt-1">
                            {apiKeyForm.formState.errors.apiSecret.message}
                          </p>
                        )}
                      </div>

                      <div className="bg-bg-base border border-border-emphasis p-3 text-xs">
                        <div className="flex items-start gap-2">
                          <Key className="w-4 h-4 text-neon-cyan mt-0.5" />
                          <div className="text-text-tertiary">
                            <p className="font-bold mb-1">Where to find your API credentials:</p>
                            <p>
                              Visit {selectedPlatform}'s developer portal to generate API keys.
                              Keys are encrypted and stored securely.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <CommandButton
                          type="button"
                          variant="ghost"
                          onClick={onClose}
                        >
                          CANCEL
                        </CommandButton>
                        <CommandButton
                          type="submit"
                          loading={apiKeyForm.formState.isSubmitting}
                        >
                          CONNECT
                        </CommandButton>
                      </div>
                    </div>
                  </DataPanel>
                </form>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlatformConnectionDialog;
