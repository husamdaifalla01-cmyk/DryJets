/**
 * CAMPAIGN LAUNCH DIALOG TESTS
 *
 * Comprehensive test suite for CampaignLaunchDialog component
 * Tests dialog rendering, validation, two-step flow, and launch options
 *
 * @module components/campaigns/CampaignLaunchDialog.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { CampaignLaunchDialog } from './CampaignLaunchDialog';
import { createMockCampaign } from '@/test/factories';

// Mock the hooks
vi.mock('@/lib/hooks/useCampaignsQuery', () => ({
  useLaunchCampaign: () => ({
    mutate: vi.fn((data, { onSuccess }) => {
      onSuccess();
    }),
    isPending: false,
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CampaignLaunchDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockCampaign = createMockCampaign({
    id: 'test-campaign-123',
    name: 'Test Campaign',
    description: 'Test campaign description',
    type: 'social',
    status: 'draft',
    targetPlatforms: ['linkedin', 'twitter'],
    budget: 5000,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dialog when open', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(/launch campaign/i)).toBeInTheDocument();
      expect(screen.getByText(mockCampaign.name)).toBeInTheDocument();
    });

    it('should not render the dialog when closed', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.queryByText(/launch campaign/i)).not.toBeInTheDocument();
    });

    it('should display campaign summary information', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(mockCampaign.name)).toBeInTheDocument();
      expect(screen.getByText(/social campaign/i)).toBeInTheDocument();
      expect(screen.getByText(mockCampaign.description)).toBeInTheDocument();
      expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
    });

    it('should display launch schedule options', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/launch immediately/i)).toBeInTheDocument();
      expect(screen.getByText(/schedule launch/i)).toBeInTheDocument();
    });

    it('should display platform selection grid', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/target platforms/i)).toBeInTheDocument();
      expect(screen.getByText(/linkedin/i)).toBeInTheDocument();
      expect(screen.getByText(/twitter/i)).toBeInTheDocument();
      expect(screen.getByText(/facebook/i)).toBeInTheDocument();
    });

    it('should show default platforms with indicator', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Campaign has linkedin and twitter as default platforms
      const defaultIndicators = screen.getAllByText(/default/i);
      expect(defaultIndicators).toHaveLength(2);
    });
  });

  describe('Two-Step Flow', () => {
    it('should start at configure step', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/review & launch/i)).toBeInTheDocument();
      expect(screen.queryByText(/confirm campaign launch/i)).not.toBeInTheDocument();
    });

    it('should move to confirmation step after clicking Review & Launch', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm campaign launch/i)).toBeInTheDocument();
      });
    });

    it('should show confirmation summary at confirm step', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm campaign launch/i)).toBeInTheDocument();
        expect(screen.getByText(mockCampaign.name)).toBeInTheDocument();
        expect(screen.getByText(/immediately upon confirmation/i)).toBeInTheDocument();
      });
    });

    it('should allow going back from confirmation to configuration', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm campaign launch/i)).toBeInTheDocument();
      });

      // Go back
      const backButton = screen.getByText(/^back$/i);
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.queryByText(/confirm campaign launch/i)).not.toBeInTheDocument();
        expect(screen.getByText(/review & launch/i)).toBeInTheDocument();
      });
    });
  });

  describe('Launch Options', () => {
    it('should default to launch immediately', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const immediateButton = screen.getByText(/launch immediately/i).closest('button');
      expect(immediateButton).toHaveClass(/border-neon-cyan/);
    });

    it('should toggle to scheduled launch', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const scheduleButton = screen.getByText(/schedule launch/i).closest('button');
      await user.click(scheduleButton!);

      await waitFor(() => {
        expect(scheduleButton).toHaveClass(/border-neon-cyan/);
      });
    });

    it('should show datetime input when scheduled launch is selected', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const scheduleButton = screen.getByText(/schedule launch/i).closest('button');
      await user.click(scheduleButton!);

      await waitFor(() => {
        expect(screen.getByText(/schedule for/i)).toBeInTheDocument();
      });
    });

    it('should not show datetime input when immediate launch is selected', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText(/schedule for/i)).not.toBeInTheDocument();
    });

    it('should toggle back to immediate launch', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Toggle to scheduled
      const scheduleButton = screen.getByText(/schedule launch/i).closest('button');
      await user.click(scheduleButton!);

      await waitFor(() => {
        expect(screen.getByText(/schedule for/i)).toBeInTheDocument();
      });

      // Toggle back to immediate
      const immediateButton = screen.getByText(/launch immediately/i).closest('button');
      await user.click(immediateButton!);

      await waitFor(() => {
        expect(screen.queryByText(/schedule for/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Scheduled Launch Validation', () => {
    it('should require scheduled date when not publishing immediately', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select scheduled launch
      const scheduleButton = screen.getByText(/schedule launch/i).closest('button');
      await user.click(scheduleButton!);

      // Try to proceed without setting a date
      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/schedule date is required/i)).toBeInTheDocument();
      });
    });

    it('should accept valid scheduled date', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select scheduled launch
      const scheduleButton = screen.getByText(/schedule launch/i).closest('button');
      await user.click(scheduleButton!);

      // Set a future date
      const dateInput = screen.getByText(/schedule for/i);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().slice(0, 16);
      await user.type(dateInput, dateString);

      // Should not show validation error
      await waitFor(() => {
        expect(screen.queryByText(/schedule date is required/i)).not.toBeInTheDocument();
      });
    });

    it('should display scheduled date in confirmation', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select scheduled launch
      const scheduleButton = screen.getByText(/schedule launch/i).closest('button');
      await user.click(scheduleButton!);

      // Set future date
      const dateInput = screen.getByText(/schedule for/i);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().slice(0, 16);
      await user.type(dateInput, dateString);

      // Go to confirmation
      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.queryByText(/immediately upon confirmation/i)).not.toBeInTheDocument();
        // Should show the scheduled date (formatted)
        expect(screen.getByText(/launch time/i)).toBeInTheDocument();
      });
    });
  });

  describe('Platform Selection', () => {
    it('should allow toggling platform selection', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const facebookButton = screen.getByText(/facebook/i).closest('button');

      // Initially not selected
      expect(facebookButton).not.toHaveClass(/border-neon-cyan/);

      // Click to select
      await user.click(facebookButton!);

      await waitFor(() => {
        expect(facebookButton).toHaveClass(/border-neon-cyan/);
        expect(screen.getAllByText(/selected/i)).toContainEqual(
          expect.objectContaining({ textContent: expect.stringMatching(/selected/i) })
        );
      });

      // Click again to deselect
      await user.click(facebookButton!);

      await waitFor(() => {
        expect(facebookButton).not.toHaveClass(/border-neon-cyan/);
      });
    });

    it('should pre-select campaign default platforms', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // linkedin and twitter should be pre-selected
      const linkedinButton = screen.getByText(/linkedin/i).closest('button');
      const twitterButton = screen.getByText(/twitter/i).closest('button');

      expect(linkedinButton).toHaveClass(/border-neon-cyan/);
      expect(twitterButton).toHaveClass(/border-neon-cyan/);
    });

    it('should display selected platforms in confirmation', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Add facebook to selection
      const facebookButton = screen.getByText(/facebook/i).closest('button');
      await user.click(facebookButton!);

      // Go to confirmation
      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/platforms \(3\)/i)).toBeInTheDocument();
        // Should show all 3 platforms as badges
        const platformBadges = screen.getAllByText(/linkedin|twitter|facebook/i);
        expect(platformBadges.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSuccess and onClose after successful launch', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm campaign launch/i)).toBeInTheDocument();
      });

      // Launch
      const launchButton = screen.getByText(/launch now/i);
      await user.click(launchButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should show correct button text for immediate launch', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/launch now/i)).toBeInTheDocument();
      });
    });

    it('should show correct button text for scheduled launch', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select scheduled launch
      const scheduleButton = screen.getByText(/schedule launch/i).closest('button');
      await user.click(scheduleButton!);

      // Set date
      const dateInput = screen.getByText(/schedule for/i);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      await user.type(dateInput, futureDate.toISOString().slice(0, 16));

      // Go to confirmation
      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/schedule launch/i)).toBeInTheDocument();
      });
    });

    it('should disable launch button while submitting', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/launch now/i)).toBeInTheDocument();
      });

      const launchButton = screen.getByText(/launch now/i);
      await user.click(launchButton);

      // Button should be disabled during submission
      expect(launchButton).toBeDisabled();
    });
  });

  describe('Cancel and Close', () => {
    it('should call onClose when cancel is clicked at configure step', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel is clicked at confirm step', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm campaign launch/i)).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      await user.click(cancelButtons[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should reset to configure step when closed and reopened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm campaign launch/i)).toBeInTheDocument();
      });

      // Close dialog
      rerender(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      // Reopen dialog
      rerender(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should be back at configure step
      expect(screen.getByText(/review & launch/i)).toBeInTheDocument();
      expect(screen.queryByText(/confirm campaign launch/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog structure', () => {
      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have descriptive labels for form inputs', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Toggle to scheduled to show datetime input
      const scheduleButton = screen.getByText(/schedule launch/i).closest('button');
      await user.click(scheduleButton!);

      await waitFor(() => {
        expect(screen.getByText(/schedule for/i)).toBeInTheDocument();
      });
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();

      render(
        <CampaignLaunchDialog
          campaign={mockCampaign as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select scheduled launch without setting date
      const scheduleButton = screen.getByText(/schedule launch/i).closest('button');
      await user.click(scheduleButton!);

      const reviewButton = screen.getByText(/review & launch/i);
      await user.click(reviewButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/schedule date is required/i);
        expect(errorMessage).toBeInTheDocument();

        const dateInput = screen.getByText(/schedule for/i);
        expect(dateInput).toHaveAttribute('aria-invalid');
      });
    });
  });
});
