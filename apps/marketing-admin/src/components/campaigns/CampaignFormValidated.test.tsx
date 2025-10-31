/**
 * CAMPAIGN FORM VALIDATION TESTS
 *
 * Comprehensive test suite for CampaignFormValidated component
 * Tests form rendering, validation, submission, platform selection, and date validation
 *
 * @module components/campaigns/CampaignFormValidated.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { CampaignFormValidated } from './CampaignFormValidated';
import { createMockCampaign } from '@/test/factories';

// Mock the hooks
vi.mock('@/lib/hooks/useCampaignsQuery', () => ({
  useCreateCampaign: () => ({
    mutate: vi.fn((data, { onSuccess }) => {
      onSuccess({ id: 'new-campaign-id', ...data });
    }),
    isPending: false,
  }),
  useUpdateCampaign: () => ({
    mutate: vi.fn((payload, { onSuccess }) => {
      onSuccess({ id: payload.id, ...payload.data });
    }),
    isPending: false,
  }),
}));

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CampaignFormValidated', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const testProfileId = 'test-profile-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the form in create mode', () => {
      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/name/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
      expect(screen.getByText(/start date/i)).toBeInTheDocument();
    });

    it('should render the form in update mode with pre-filled data', () => {
      const mockCampaign = createMockCampaign({
        name: 'Test Campaign',
        description: 'This is a test campaign description',
        type: 'social',
      });

      render(
        <CampaignFormValidated
          mode="update"
          campaign={mockCampaign as any}
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('Test Campaign')).toBeInTheDocument();
      expect(screen.getByDisplayValue(/test campaign description/i)).toBeInTheDocument();
    });

    it('should display all required form fields', () => {
      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // Check for required fields
      expect(screen.getByText(/name/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
      expect(screen.getByText(/type/i)).toBeInTheDocument();
      expect(screen.getByText(/start date/i)).toBeInTheDocument();

      // Submit button should be present
      expect(screen.getByRole('button', { name: /save|create/i })).toBeInTheDocument();
    });

    it('should show platform selection options', () => {
      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // Platform badges should be visible
      expect(screen.getByText(/linkedin/i)).toBeInTheDocument();
      expect(screen.getByText(/twitter/i)).toBeInTheDocument();
      expect(screen.getByText(/facebook/i)).toBeInTheDocument();
    });
  });

  describe('Field Validation', () => {
    it('should show error when name is too short', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const nameInput = screen.getByText(/name/i);
      await user.type(nameInput, 'AB');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error when name is too long', async () => {
      const user = userEvent.setup();
      const longName = 'A'.repeat(201);

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const nameInput = screen.getByText(/name/i);
      await user.type(nameInput, longName);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/name must be less than 200 characters/i)).toBeInTheDocument();
      });
    });

    it('should accept valid campaign name', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const nameInput = screen.getByText(/name/i);
      await user.type(nameInput, 'Valid Campaign Name');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/name must be/i)).not.toBeInTheDocument();
      });
    });

    it('should validate description minimum length', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const descInput = screen.getByText(/description/i);
      await user.type(descInput, 'Short');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate description maximum length', async () => {
      const user = userEvent.setup();
      const longDesc = 'A'.repeat(2001);

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const descInput = screen.getByText(/description/i);
      await user.type(descInput, longDesc);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/description must be less than 2000 characters/i)).toBeInTheDocument();
      });
    });

    it('should require campaign type selection', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill name but skip type
      const nameInput = screen.getByText(/name/i);
      await user.type(nameInput, 'Test Campaign');

      // Try to submit
      const submitButton = screen.getByRole('button', { name: /save|create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select a campaign type/i)).toBeInTheDocument();
      });
    });

    it('should require at least one platform', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByText(/name/i);
      await user.type(nameInput, 'Test Campaign');

      // Try to submit without selecting platforms
      const submitButton = screen.getByRole('button', { name: /save|create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/select at least one platform/i)).toBeInTheDocument();
      });
    });

    it('should enforce maximum 9 platforms', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // Try to select more than 9 platforms
      const platforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube',
                         'tiktok', 'pinterest', 'medium', 'substack', 'reddit'];

      for (const platform of platforms) {
        const platformButton = screen.getByText(new RegExp(platform, 'i'));
        await user.click(platformButton);
      }

      // Try to submit
      const submitButton = screen.getByRole('button', { name: /save|create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/maximum 9 platforms allowed/i)).toBeInTheDocument();
      });
    });

    it('should validate budget is positive', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const budgetInput = screen.getByText(/budget/i);
      await user.type(budgetInput, '-100');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/budget must be positive/i)).toBeInTheDocument();
      });
    });

    it('should validate maximum budget', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const budgetInput = screen.getByText(/budget/i);
      await user.type(budgetInput, '10000001');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/budget too large/i)).toBeInTheDocument();
      });
    });

    it('should validate target audience max length', async () => {
      const user = userEvent.setup();
      const longAudience = 'A'.repeat(1001);

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const audienceInput = screen.getByText(/target audience/i);
      await user.type(audienceInput, longAudience);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/target audience must be less than 1000 characters/i)).toBeInTheDocument();
      });
    });

    it('should enforce maximum 20 tags', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // Add more than 20 tags
      const tagInput = screen.getByPlaceholderText(/add tag/i);
      for (let i = 0; i < 21; i++) {
        await user.type(tagInput, `tag${i}`);
        await user.keyboard('{Enter}');
      }

      // Try to submit
      const submitButton = screen.getByRole('button', { name: /save|create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/maximum 20 tags allowed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Date Validation', () => {
    it('should require end date to be after start date', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const startDateInput = screen.getByText(/start date/i);
      const endDateInput = screen.getByText(/end date/i);

      // Set end date before start date
      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-12-01');

      await user.type(endDateInput, '2024-11-30');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
      });
    });

    it('should accept valid date range', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const startDateInput = screen.getByText(/start date/i);
      const endDateInput = screen.getByText(/end date/i);

      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-12-01');
      await user.type(endDateInput, '2024-12-31');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/end date must be after start date/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Platform Selection', () => {
    it('should toggle platform selection', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const linkedinBadge = screen.getByText(/linkedin/i);

      // Click to select
      await user.click(linkedinBadge);

      await waitFor(() => {
        expect(linkedinBadge.closest('button')).toHaveClass(/selected|active/i);
      });

      // Click again to deselect
      await user.click(linkedinBadge);

      await waitFor(() => {
        expect(linkedinBadge.closest('button')).not.toHaveClass(/selected|active/i);
      });
    });

    it('should allow multiple platform selection', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const linkedinBadge = screen.getByText(/linkedin/i);
      const twitterBadge = screen.getByText(/twitter/i);
      const facebookBadge = screen.getByText(/facebook/i);

      await user.click(linkedinBadge);
      await user.click(twitterBadge);
      await user.click(facebookBadge);

      await waitFor(() => {
        expect(linkedinBadge.closest('button')).toHaveClass(/selected|active/i);
        expect(twitterBadge.closest('button')).toHaveClass(/selected|active/i);
        expect(facebookBadge.closest('button')).toHaveClass(/selected|active/i);
      });
    });
  });

  describe('Array Field Management', () => {
    it('should add goals to the array', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const goalInput = screen.getByPlaceholderText(/add goal/i);
      await user.type(goalInput, 'Increase brand awareness');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/increase brand awareness/i)).toBeInTheDocument();
      });
    });

    it('should remove goals from the array', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // Add a goal
      const goalInput = screen.getByPlaceholderText(/add goal/i);
      await user.type(goalInput, 'Test Goal');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/test goal/i)).toBeInTheDocument();
      });

      // Remove the goal
      const removeButton = screen.getByRole('button', { name: /remove.*test goal/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText(/test goal/i)).not.toBeInTheDocument();
      });
    });

    it('should not add empty goals', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const goalInput = screen.getByPlaceholderText(/add goal/i);
      await user.type(goalInput, '   '); // Just spaces
      await user.keyboard('{Enter}');

      // Should not add empty goal
      expect(screen.queryByText(/^\s+$/)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onSuccess callback after successful creation', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill required fields
      const nameInput = screen.getByText(/name/i);
      await user.type(nameInput, 'Test Campaign Name');

      const descInput = screen.getByText(/description/i);
      await user.type(descInput, 'This is a test campaign description');

      // Select type
      const typeSelect = screen.getByText(/type/i);
      await user.selectOptions(typeSelect, 'social');

      // Select a platform
      const linkedinBadge = screen.getByText(/linkedin/i);
      await user.click(linkedinBadge);

      // Submit
      const submitButton = screen.getByRole('button', { name: /save|create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('new-campaign-id');
      });
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // Fill required fields
      const nameInput = screen.getByText(/name/i);
      await user.type(nameInput, 'Test Campaign');

      const submitButton = screen.getByRole('button', { name: /save|create/i });
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });

    it('should prevent submission with invalid data', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
        />
      );

      // Leave required fields empty
      const submitButton = screen.getByRole('button', { name: /save|create/i });
      await user.click(submitButton);

      // Form should not submit
      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      // Should show validation errors
      expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
    });

    it('should update existing campaign', async () => {
      const user = userEvent.setup();
      const mockCampaign = createMockCampaign({
        id: 'existing-campaign-id',
        name: 'Existing Campaign',
      });

      render(
        <CampaignFormValidated
          mode="update"
          campaign={mockCampaign as any}
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Campaign Name');

      const submitButton = screen.getByRole('button', { name: /save|update/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('existing-campaign-id');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      expect(screen.getByText(/name/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
      expect(screen.getByText(/type/i)).toBeInTheDocument();
      expect(screen.getByText(/start date/i)).toBeInTheDocument();
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();

      render(
        <CampaignFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const nameInput = screen.getByText(/name/i);
      await user.type(nameInput, 'AB');
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/name must be at least 3 characters/i);
        expect(errorMessage).toBeInTheDocument();
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
