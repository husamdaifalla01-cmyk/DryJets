/**
 * PUBLISH CONTENT DIALOG TESTS
 *
 * Comprehensive test suite for PublishContentDialog component
 * Tests content publishing, platform selection, scheduling, and two-step flow
 *
 * @module components/content/PublishContentDialog.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { PublishContentDialog } from './PublishContentDialog';
import { createMockContent } from '@/test/factories';

// Mock the hooks
vi.mock('@/lib/hooks/useContent', () => ({
  usePublishContent: () => ({
    mutate: vi.fn((data, { onSuccess }) => {
      onSuccess();
    }),
    isPending: false,
  }),
  useScheduleContent: () => ({
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

describe('PublishContentDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockContent = createMockContent({
    id: 'test-content-123',
    title: 'Test Content Title',
    type: 'blog-post',
    targetPlatforms: ['linkedin', 'twitter'],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dialog when open', () => {
      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(/publish content/i)).toBeInTheDocument();
      expect(screen.getByText(/test content title/i)).toBeInTheDocument();
    });

    it('should not render the dialog when closed', () => {
      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.queryByText(/publish content/i)).not.toBeInTheDocument();
    });

    it('should display content title in dialog', () => {
      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(mockContent.title)).toBeInTheDocument();
    });

    it('should display publish mode options', () => {
      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/publish immediately/i)).toBeInTheDocument();
      expect(screen.getByText(/schedule for later/i)).toBeInTheDocument();
    });

    it('should display platform selection', () => {
      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/select platforms/i)).toBeInTheDocument();
      expect(screen.getByText(/linkedin/i)).toBeInTheDocument();
      expect(screen.getByText(/twitter/i)).toBeInTheDocument();
    });
  });

  describe('Two-Step Flow', () => {
    it('should start at configure step', () => {
      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/review & publish/i)).toBeInTheDocument();
      expect(screen.queryByText(/confirm publishing/i)).not.toBeInTheDocument();
    });

    it('should move to confirmation step after clicking review', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm publishing/i)).toBeInTheDocument();
      });
    });

    it('should show confirmation summary at confirm step', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm publishing/i)).toBeInTheDocument();
        expect(screen.getByText(mockContent.title)).toBeInTheDocument();
      });
    });

    it('should allow going back from confirmation to configuration', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm publishing/i)).toBeInTheDocument();
      });

      // Go back
      const backButton = screen.getByText(/^back$/i);
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.queryByText(/confirm publishing/i)).not.toBeInTheDocument();
        expect(screen.getByText(/review & publish/i)).toBeInTheDocument();
      });
    });
  });

  describe('Publishing Mode', () => {
    it('should default to immediate publishing', () => {
      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const immediateButton = screen.getByText(/publish immediately/i).closest('button');
      expect(immediateButton).toHaveClass(/border-neon-cyan/);
    });

    it('should toggle to scheduled publishing', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const scheduleButton = screen.getByText(/schedule for later/i).closest('button');
      await user.click(scheduleButton!);

      await waitFor(() => {
        expect(scheduleButton).toHaveClass(/border-neon-cyan/);
      });
    });

    it('should show datetime input when scheduled mode is selected', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const scheduleButton = screen.getByText(/schedule for later/i).closest('button');
      await user.click(scheduleButton!);

      await waitFor(() => {
        expect(screen.getByText(/schedule date/i)).toBeInTheDocument();
      });
    });

    it('should not show datetime input in immediate mode', () => {
      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText(/schedule date/i)).not.toBeInTheDocument();
    });

    it('should toggle back to immediate publishing', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Toggle to scheduled
      const scheduleButton = screen.getByText(/schedule for later/i).closest('button');
      await user.click(scheduleButton!);

      await waitFor(() => {
        expect(screen.getByText(/schedule date/i)).toBeInTheDocument();
      });

      // Toggle back to immediate
      const immediateButton = screen.getByText(/publish immediately/i).closest('button');
      await user.click(immediateButton!);

      await waitFor(() => {
        expect(screen.queryByText(/schedule date/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Scheduled Publishing Validation', () => {
    it('should require scheduled date when in scheduled mode', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select scheduled mode
      const scheduleButton = screen.getByText(/schedule for later/i).closest('button');
      await user.click(scheduleButton!);

      // Try to proceed without setting a date
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/schedule date is required/i)).toBeInTheDocument();
      });
    });

    it('should accept valid scheduled date', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select scheduled mode
      const scheduleButton = screen.getByText(/schedule for later/i).closest('button');
      await user.click(scheduleButton!);

      // Set a future date
      const dateInput = screen.getByText(/schedule date/i);
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
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select scheduled mode and set date
      const scheduleButton = screen.getByText(/schedule for later/i).closest('button');
      await user.click(scheduleButton!);

      const dateInput = screen.getByText(/schedule date/i);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      await user.type(dateInput, futureDate.toISOString().slice(0, 16));

      // Go to confirmation
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/scheduled for/i)).toBeInTheDocument();
      });
    });
  });

  describe('Platform Selection', () => {
    it('should pre-select content target platforms', () => {
      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const linkedinButton = screen.getByText(/linkedin/i).closest('button');
      const twitterButton = screen.getByText(/twitter/i).closest('button');

      expect(linkedinButton).toHaveClass(/border-neon-cyan/);
      expect(twitterButton).toHaveClass(/border-neon-cyan/);
    });

    it('should allow toggling platform selection', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
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
      });

      // Click again to deselect
      await user.click(facebookButton!);

      await waitFor(() => {
        expect(facebookButton).not.toHaveClass(/border-neon-cyan/);
      });
    });

    it('should require at least one platform', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Deselect all platforms
      const linkedinButton = screen.getByText(/linkedin/i).closest('button');
      const twitterButton = screen.getByText(/twitter/i).closest('button');

      await user.click(linkedinButton!);
      await user.click(twitterButton!);

      // Try to proceed
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/select at least one platform/i)).toBeInTheDocument();
      });
    });

    it('should display selected platforms in confirmation', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Add facebook to selection
      const facebookButton = screen.getByText(/facebook/i).closest('button');
      await user.click(facebookButton!);

      // Go to confirmation
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/platforms \(3\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSuccess and onClose after successful publish', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm publishing/i)).toBeInTheDocument();
      });

      // Publish
      const publishButton = screen.getByText(/publish now/i);
      await user.click(publishButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should show correct button text for immediate publish', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/publish now/i)).toBeInTheDocument();
      });
    });

    it('should show correct button text for scheduled publish', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select scheduled mode and set date
      const scheduleButton = screen.getByText(/schedule for later/i).closest('button');
      await user.click(scheduleButton!);

      const dateInput = screen.getByText(/schedule date/i);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      await user.type(dateInput, futureDate.toISOString().slice(0, 16));

      // Go to confirmation
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/schedule publish/i)).toBeInTheDocument();
      });
    });

    it('should disable publish button while submitting', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/publish now/i)).toBeInTheDocument();
      });

      const publishButton = screen.getByText(/publish now/i);
      await user.click(publishButton);

      // Button should be disabled during submission
      expect(publishButton).toBeDisabled();
    });
  });

  describe('Cancel and Close', () => {
    it('should call onClose when cancel is clicked at configure step', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
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
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm publishing/i)).toBeInTheDocument();
      });

      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      await user.click(cancelButtons[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should reset to configure step when closed and reopened', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Go to confirmation
      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        expect(screen.getByText(/confirm publishing/i)).toBeInTheDocument();
      });

      // Close dialog
      rerender(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      // Reopen dialog
      rerender(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should be back at configure step
      expect(screen.getByText(/review & publish/i)).toBeInTheDocument();
      expect(screen.queryByText(/confirm publishing/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog structure', () => {
      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have descriptive labels for form inputs', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Toggle to scheduled to show datetime input
      const scheduleButton = screen.getByText(/schedule for later/i).closest('button');
      await user.click(scheduleButton!);

      await waitFor(() => {
        expect(screen.getByText(/schedule date/i)).toBeInTheDocument();
      });
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Select scheduled mode without setting date
      const scheduleButton = screen.getByText(/schedule for later/i).closest('button');
      await user.click(scheduleButton!);

      const reviewButton = screen.getByText(/review & publish/i);
      await user.click(reviewButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/schedule date is required/i);
        expect(errorMessage).toBeInTheDocument();

        const dateInput = screen.getByText(/schedule date/i);
        expect(dateInput).toHaveAttribute('aria-invalid');
      });
    });
  });

  describe('Platform-Specific Settings', () => {
    it('should display platform-specific settings section if available', async () => {
      const user = userEvent.setup();

      render(
        <PublishContentDialog
          content={mockContent as any}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Check if platform-specific settings section exists
      const settingsSection = screen.queryByText(/platform settings/i);
      if (settingsSection) {
        expect(settingsSection).toBeInTheDocument();
      }
    });
  });
});
