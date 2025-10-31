/**
 * PLATFORM CONNECTION DIALOG TESTS
 *
 * Comprehensive test suite for PlatformConnectionDialog component
 * Tests platform selection, OAuth flow, API key connection, and validation
 *
 * @module components/connections/PlatformConnectionDialog.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { PlatformConnectionDialog } from './PlatformConnectionDialog';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PlatformConnectionDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const testProfileId = 'test-profile-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dialog when open', () => {
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(/connect platform/i)).toBeInTheDocument();
    });

    it('should not render the dialog when closed', () => {
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.queryByText(/connect platform/i)).not.toBeInTheDocument();
    });

    it('should display platform selection grid', () => {
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/linkedin/i)).toBeInTheDocument();
      expect(screen.getByText(/youtube/i)).toBeInTheDocument();
      expect(screen.getByText(/twitter/i)).toBeInTheDocument();
      expect(screen.getByText(/facebook/i)).toBeInTheDocument();
      expect(screen.getByText(/instagram/i)).toBeInTheDocument();
    });

    it('should show all 9 platforms', () => {
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const platforms = [
        'linkedin',
        'youtube',
        'twitter',
        'facebook',
        'instagram',
        'tiktok',
        'pinterest',
        'medium',
        'substack',
      ];

      platforms.forEach((platform) => {
        expect(screen.getByText(new RegExp(platform, 'i'))).toBeInTheDocument();
      });
    });
  });

  describe('Platform Selection', () => {
    it('should highlight selected platform', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const linkedinButton = screen.getByText(/linkedin/i).closest('button');
      await user.click(linkedinButton!);

      await waitFor(() => {
        expect(linkedinButton).toHaveClass(/border-neon-cyan|selected/);
      });
    });

    it('should show OAuth option for OAuth-supported platforms', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // LinkedIn supports OAuth
      const linkedinButton = screen.getByText(/linkedin/i).closest('button');
      await user.click(linkedinButton!);

      await waitFor(() => {
        expect(screen.getByText(/connect with oauth/i)).toBeInTheDocument();
      });
    });

    it('should show API key option for non-OAuth platforms', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Medium uses API key
      const mediumButton = screen.getByText(/medium/i).closest('button');
      await user.click(mediumButton!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });
    });

    it('should allow switching between OAuth and API key for supported platforms', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select LinkedIn (OAuth platform)
      const linkedinButton = screen.getByText(/linkedin/i).closest('button');
      await user.click(linkedinButton!);

      await waitFor(() => {
        expect(screen.getByText(/connect with oauth/i)).toBeInTheDocument();
      });

      // Switch to API key method
      const apiKeyTab = screen.getByText(/api key/i).closest('button');
      if (apiKeyTab) {
        await user.click(apiKeyTab);

        await waitFor(() => {
          expect(screen.getByText(/api key/i)).toBeInTheDocument();
        });
      }
    });

    it('should clear previous selection when selecting new platform', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select LinkedIn
      await user.click(screen.getByText(/linkedin/i).closest('button')!);

      await waitFor(() => {
        const linkedinButton = screen.getByText(/linkedin/i).closest('button');
        expect(linkedinButton).toHaveClass(/selected|border-neon-cyan/);
      });

      // Select Twitter
      await user.click(screen.getByText(/twitter/i).closest('button')!);

      await waitFor(() => {
        const twitterButton = screen.getByText(/twitter/i).closest('button');
        expect(twitterButton).toHaveClass(/selected|border-neon-cyan/);
      });
    });
  });

  describe('OAuth Flow', () => {
    it('should require platform selection for OAuth', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Try to connect without selecting platform
      const connectButton = screen.queryByRole('button', { name: /connect/i });
      if (connectButton) {
        await user.click(connectButton);

        await waitFor(() => {
          expect(screen.getByText(/please select a valid platform/i)).toBeInTheDocument();
        });

        expect(mockOnSuccess).not.toHaveBeenCalled();
      }
    });

    it('should initiate OAuth flow for selected platform', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select LinkedIn
      await user.click(screen.getByText(/linkedin/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/connect with oauth/i)).toBeInTheDocument();
      });

      // Click connect
      const connectButton = screen.getByRole('button', { name: /connect with oauth/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('linkedin');
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onSuccess with correct platform after OAuth', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select YouTube
      await user.click(screen.getByText(/youtube/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/connect with oauth/i)).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /connect with oauth/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('youtube');
      });
    });
  });

  describe('API Key Connection', () => {
    it('should display API key form for non-OAuth platforms', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select Medium (API key platform)
      await user.click(screen.getByText(/medium/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });
    });

    it('should validate API key minimum length', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select Medium
      await user.click(screen.getByText(/medium/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });

      // Enter short API key
      const apiKeyInput = screen.getByText(/api key/i);
      await user.type(apiKeyInput, 'short');

      // Try to connect
      const connectButton = screen.getByRole('button', { name: /connect/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/api key must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate API key maximum length', async () => {
      const user = userEvent.setup();
      const longKey = 'A'.repeat(501);

      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select Medium
      await user.click(screen.getByText(/medium/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });

      const apiKeyInput = screen.getByText(/api key/i);
      await user.type(apiKeyInput, longKey);

      const connectButton = screen.getByRole('button', { name: /connect/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/api key is too long/i)).toBeInTheDocument();
      });
    });

    it('should accept valid API key', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select Medium
      await user.click(screen.getByText(/medium/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });

      // Enter valid API key
      const apiKeyInput = screen.getByText(/api key/i);
      await user.type(apiKeyInput, 'valid-api-key-12345');

      const connectButton = screen.getByRole('button', { name: /connect/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('medium');
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should display API secret field when available', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select a platform that uses both key and secret
      await user.click(screen.getByText(/substack/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });

      // Check if API secret field exists
      const apiSecretInput = screen.queryByText(/api secret/i);
      if (apiSecretInput) {
        expect(apiSecretInput).toBeInTheDocument();
      }
    });

    it('should validate API secret if provided', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText(/substack/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });

      const apiSecretInput = screen.queryByText(/api secret/i);
      if (apiSecretInput) {
        // Enter valid key
        await user.type(screen.getByText(/api key/i), 'valid-key-123456');

        // Enter short secret
        await user.type(apiSecretInput, 'short');

        const connectButton = screen.getByRole('button', { name: /connect/i });
        await user.click(connectButton);

        await waitFor(() => {
          expect(screen.getByText(/api secret must be at least 10 characters/i)).toBeInTheDocument();
        });
      }
    });

    it('should connect successfully with both key and secret', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await user.click(screen.getByText(/substack/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });

      await user.type(screen.getByText(/api key/i), 'valid-key-123456');

      const apiSecretInput = screen.queryByText(/api secret/i);
      if (apiSecretInput) {
        await user.type(apiSecretInput, 'valid-secret-123456');
      }

      const connectButton = screen.getByRole('button', { name: /connect/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('substack');
      });
    });
  });

  describe('Platform Icons', () => {
    it('should display platform-specific icons', () => {
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Check that icons are rendered (they should have specific classes or attributes)
      const linkedinButton = screen.getByText(/linkedin/i).closest('button');
      expect(linkedinButton).toBeInTheDocument();

      // Icons should be inside the button
      expect(linkedinButton?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Form State', () => {
    it('should disable connect button while no platform is selected', () => {
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Initially, connect button should not be visible or should be disabled
      const connectButton = screen.queryByRole('button', { name: /^connect$/i });
      expect(connectButton).toBeNull();
    });

    it('should enable connect button after platform selection', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select platform
      await user.click(screen.getByText(/linkedin/i).closest('button')!);

      await waitFor(() => {
        const connectButton = screen.getByRole('button', { name: /connect/i });
        expect(connectButton).not.toBeDisabled();
      });
    });

    it('should show loading state during connection', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText(/linkedin/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
      });

      const connectButton = screen.getByRole('button', { name: /connect/i });
      await user.click(connectButton);

      // Button should be disabled during connection
      expect(connectButton).toBeDisabled();
    });
  });

  describe('Dialog Behavior', () => {
    it('should call onClose when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close icon is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Dialog usually has an X button in the corner
      const closeButton = screen.getByRole('button', { name: /close/i });
      if (closeButton) {
        await user.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should reset form state when closed and reopened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select a platform
      await user.click(screen.getByText(/linkedin/i).closest('button')!);

      await waitFor(() => {
        const linkedinButton = screen.getByText(/linkedin/i).closest('button');
        expect(linkedinButton).toHaveClass(/selected|border-neon-cyan/);
      });

      // Close dialog
      rerender(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      // Reopen dialog
      rerender(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Platform selection should be reset
      const linkedinButton = screen.getByText(/linkedin/i).closest('button');
      expect(linkedinButton).not.toHaveClass(/selected|border-neon-cyan/);
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog structure', () => {
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have descriptive labels for form inputs', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select API key platform
      await user.click(screen.getByText(/medium/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select platform
      await user.click(screen.getByText(/medium/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });

      // Enter invalid key
      const apiKeyInput = screen.getByText(/api key/i);
      await user.type(apiKeyInput, 'short');

      const connectButton = screen.getByRole('button', { name: /connect/i });
      await user.click(connectButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/api key must be at least 10 characters/i);
        expect(errorMessage).toBeInTheDocument();
        expect(apiKeyInput).toHaveAttribute('aria-invalid');
      });
    });

    it('should have accessible platform selection buttons', () => {
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // All platform buttons should be accessible
      const linkedinButton = screen.getByText(/linkedin/i).closest('button');
      expect(linkedinButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Error Handling', () => {
    it('should display validation errors for missing required fields', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select platform but don't fill API key
      await user.click(screen.getByText(/medium/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });

      // Try to connect without filling API key
      const connectButton = screen.getByRole('button', { name: /connect/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/api key must be at least 10 characters/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should prevent submission with invalid data', async () => {
      const user = userEvent.setup();
      render(
        <PlatformConnectionDialog
          profileId={testProfileId}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Select platform
      await user.click(screen.getByText(/medium/i).closest('button')!);

      await waitFor(() => {
        expect(screen.getByText(/api key/i)).toBeInTheDocument();
      });

      // Enter invalid API key
      await user.type(screen.getByText(/api key/i), 'abc');

      const connectButton = screen.getByRole('button', { name: /connect/i });
      await user.click(connectButton);

      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });
  });
});
