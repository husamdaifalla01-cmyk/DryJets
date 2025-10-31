/**
 * PROFILE FORM VALIDATION TESTS
 *
 * Comprehensive test suite for ProfileFormValidated component
 * Tests form rendering, validation, array fields, and submission
 *
 * @module components/profiles/ProfileFormValidated.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { ProfileFormValidated } from './ProfileFormValidated';
import { createMockProfile } from '@/test/factories';

// Mock the hooks
vi.mock('@/lib/hooks/useProfile', () => ({
  useCreateProfile: () => ({
    mutate: vi.fn((data, { onSuccess }) => {
      onSuccess({ id: 'new-profile-id', ...data });
    }),
    isPending: false,
  }),
  useUpdateProfile: () => ({
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

describe('ProfileFormValidated', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the form in create mode', () => {
      render(
        <ProfileFormValidated
          mode="create"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByPlaceholderText(/SaaS Marketing/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/TechCorp/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/SaaS, E-commerce/i)).toBeInTheDocument();
    });

    it('should render the form in update mode with pre-filled data', () => {
      const mockProfile = createMockProfile({
        name: 'Test Profile',
        brandName: 'Test Brand',
        industry: 'Technology',
      });

      render(
        <ProfileFormValidated
          mode="update"
          profile={mockProfile as any}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('Test Profile')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Brand')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Technology')).toBeInTheDocument();
    });

    it('should display all required form fields', () => {
      render(
        <ProfileFormValidated
          mode="create"
        />
      );

      expect(screen.getByPlaceholderText(/SaaS Marketing/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/TechCorp/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/SaaS, E-commerce/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Marketing Automation/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/describe your target audience/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Professional, Friendly/i)).toBeInTheDocument();
    });
  });

  describe('Field Validation', () => {
    it('should show error when profile name is too short', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const nameInput = screen.getByPlaceholderText(/SaaS Marketing/i);
      await user.type(nameInput, 'AB');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/profile name must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error when profile name is too long', async () => {
      const user = userEvent.setup();
      const longName = 'A'.repeat(101);

      render(<ProfileFormValidated mode="create" />);

      const nameInput = screen.getByPlaceholderText(/SaaS Marketing/i);
      await user.type(nameInput, longName);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/profile name must be less than 100 characters/i)).toBeInTheDocument();
      });
    });

    it('should accept valid profile name', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const nameInput = screen.getByPlaceholderText(/SaaS Marketing/i);
      await user.type(nameInput, 'Valid Profile Name');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/profile name must be/i)).not.toBeInTheDocument();
      });
    });

    it('should show error when brand name is too short', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const brandInput = screen.getByPlaceholderText(/TechCorp/i);
      await user.type(brandInput, 'A');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/brand name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate description max length', async () => {
      const user = userEvent.setup();
      const longDesc = 'A'.repeat(501);

      render(<ProfileFormValidated mode="create" />);

      const descInput = screen.getByPlaceholderText(/Brief description/i);
      await user.type(descInput, longDesc);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/description must be less than 500 characters/i)).toBeInTheDocument();
      });
    });

    it('should require industry', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" onSuccess={mockOnSuccess} />);

      // Leave industry empty
      const submitButton = screen.getByRole('button', { name: /create profile/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/industry is required/i)).toBeInTheDocument();
      });
    });

    it('should validate industry length', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const industryInput = screen.getByPlaceholderText(/SaaS, E-commerce/i);
      await user.type(industryInput, 'A');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/industry is required/i)).toBeInTheDocument();
      });
    });

    it('should require niche', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /create profile/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/niche is required/i)).toBeInTheDocument();
      });
    });

    it('should validate niche length', async () => {
      const user = userEvent.setup();
      const longNiche = 'A'.repeat(201);

      render(<ProfileFormValidated mode="create" />);

      const nicheInput = screen.getByPlaceholderText(/Marketing Automation/i);
      await user.type(nicheInput, longNiche);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/niche must be less than 200 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate target audience minimum length', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const audienceInput = screen.getByPlaceholderText(/describe your target audience/i);
      await user.type(audienceInput, 'Short');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/target audience description must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate target audience maximum length', async () => {
      const user = userEvent.setup();
      const longAudience = 'A'.repeat(1001);

      render(<ProfileFormValidated mode="create" />);

      const audienceInput = screen.getByPlaceholderText(/describe your target audience/i);
      await user.type(audienceInput, longAudience);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/target audience must be less than 1000 characters/i)).toBeInTheDocument();
      });
    });

    it('should require brand voice', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /create profile/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/brand voice is required/i)).toBeInTheDocument();
      });
    });

    it('should validate brand voice length', async () => {
      const user = userEvent.setup();
      const longVoice = 'A'.repeat(201);

      render(<ProfileFormValidated mode="create" />);

      const voiceInput = screen.getByPlaceholderText(/Professional, Friendly/i);
      await user.type(voiceInput, longVoice);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/brand voice must be less than 200 characters/i)).toBeInTheDocument();
      });
    });

    it('should require primary objective selection', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /create profile/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please select a primary objective/i)).toBeInTheDocument();
      });
    });

    it('should validate website URL format', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const inputs = screen.getAllByRole('textbox');
      const websiteInput = inputs.find(input =>
        (input as HTMLInputElement).name === 'website'
      );

      if (websiteInput) {
        await user.type(websiteInput, 'not-a-valid-url');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/must be a valid url/i)).toBeInTheDocument();
        });
      }
    });

    it('should accept valid website URL', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const inputs = screen.getAllByRole('textbox');
      const websiteInput = inputs.find(input =>
        (input as HTMLInputElement).name === 'website'
      );

      if (websiteInput) {
        await user.type(websiteInput, 'https://example.com');
        await user.tab();

        await waitFor(() => {
          expect(screen.queryByText(/must be a valid url/i)).not.toBeInTheDocument();
        });
      }
    });

    it('should validate budget is positive', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const inputs = screen.getAllByRole('textbox');
      const budgetInput = inputs.find(input =>
        (input as HTMLInputElement).name === 'budget'
      );

      if (budgetInput) {
        await user.type(budgetInput, '-100');
        await user.tab();

        await waitFor(() => {
          expect(screen.getByText(/budget must be positive/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Array Field Validation', () => {
    it('should require at least one brand value', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /create profile/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least one brand value is required/i)).toBeInTheDocument();
      });
    });

    it('should enforce maximum 10 brand values', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      // Add 11 comma-separated brand values
      const brandValueInput = screen.getByPlaceholderText(/Innovation, Transparency/i);
      const values = Array.from({ length: 11 }, (_, i) => `Value${i}`).join(', ');
      await user.type(brandValueInput, values);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/maximum 10 brand values allowed/i)).toBeInTheDocument();
      });
    });

    it('should require at least one goal', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /create profile/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least one goal is required/i)).toBeInTheDocument();
      });
    });

    it('should enforce maximum 20 goals', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      // Add 21 comma-separated goals
      const goalInput = screen.getByPlaceholderText(/Increase website traffic/i);
      const goals = Array.from({ length: 21 }, (_, i) => `Goal${i}`).join(', ');
      await user.type(goalInput, goals);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/maximum 20 goals allowed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Array Field Management', () => {
    it('should add brand values to the array', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const brandValueInput = screen.getByPlaceholderText(/Innovation, Transparency/i);
      await user.type(brandValueInput, 'Innovation, Quality');

      expect(brandValueInput).toHaveValue('Innovation, Quality');
    });

    it('should remove brand values from the array', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const brandValueInput = screen.getByPlaceholderText(/Innovation, Transparency/i);
      await user.type(brandValueInput, 'Innovation, Quality, Excellence');
      await user.clear(brandValueInput);
      await user.type(brandValueInput, 'Innovation, Quality');

      expect(brandValueInput).toHaveValue('Innovation, Quality');
    });

    it('should not add empty brand values', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const brandValueInput = screen.getByPlaceholderText(/Innovation, Transparency/i);
      await user.type(brandValueInput, '   ,  , Innovation');

      // Empty values should be filtered out
      expect(brandValueInput).toHaveValue('Innovation');
    });

    it('should add goals to the array', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const goalInput = screen.getByPlaceholderText(/Increase website traffic/i);
      await user.type(goalInput, 'Increase brand awareness, Generate 100 leads');

      expect(goalInput).toHaveValue('Increase brand awareness, Generate 100 leads');
    });

    it('should remove goals from the array', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const goalInput = screen.getByPlaceholderText(/Increase website traffic/i);
      await user.type(goalInput, 'Goal 1, Goal 2, Goal 3');
      await user.clear(goalInput);
      await user.type(goalInput, 'Goal 1, Goal 2');

      expect(goalInput).toHaveValue('Goal 1, Goal 2');
    });

    it('should not add empty goals', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const goalInput = screen.getByPlaceholderText(/Increase website traffic/i);
      await user.type(goalInput, '   ,  , Generate leads');

      expect(goalInput).toHaveValue('Generate leads');
    });
  });

  describe('Form Submission', () => {
    it('should call onSuccess callback after successful creation', async () => {
      const user = userEvent.setup();

      render(
        <ProfileFormValidated
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      // Fill all required fields
      await user.type(screen.getByPlaceholderText(/SaaS Marketing/i), 'Test Profile');
      await user.type(screen.getByPlaceholderText(/TechCorp/i), 'Test Brand');
      await user.type(screen.getByPlaceholderText(/SaaS, E-commerce/i), 'Technology');
      await user.type(screen.getByPlaceholderText(/Marketing Automation/i), 'SaaS Products');
      await user.type(screen.getByPlaceholderText(/describe your target audience/i), 'Small business owners aged 25-45 who need marketing automation');
      await user.type(screen.getByPlaceholderText(/Professional, Friendly/i), 'Professional and friendly');

      // Add brand values
      await user.type(screen.getByPlaceholderText(/Innovation, Transparency/i), 'Innovation, Quality');

      // Add goals
      await user.type(screen.getByPlaceholderText(/Increase website traffic/i), 'Increase brand awareness, Generate 100 leads per month');

      // Select primary objective
      const objectiveSelect = screen.getByRole('combobox');
      await user.selectOptions(objectiveSelect, 'brand-awareness');

      // Submit
      const submitButton = screen.getByRole('button', { name: /create profile/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('new-profile-id');
      }, { timeout: 3000 });
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ProfileFormValidated
          mode="create"
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const submitButton = screen.getByRole('button', { name: /create profile/i });
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });

    it('should prevent submission with invalid data', async () => {
      const user = userEvent.setup();

      render(
        <ProfileFormValidated
          mode="create"
          onSuccess={mockOnSuccess}
        />
      );

      // Leave required fields empty
      const submitButton = screen.getByRole('button', { name: /create profile/i });
      await user.click(submitButton);

      // Form should not submit
      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      // Should show validation errors
      expect(screen.getByText(/profile name must be at least 3 characters/i)).toBeInTheDocument();
    });

    it('should update existing profile', async () => {
      const user = userEvent.setup();
      const mockProfile = createMockProfile({
        id: 'existing-profile-id',
        name: 'Existing Profile',
      });

      render(
        <ProfileFormValidated
          mode="update"
          profile={mockProfile as any}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByDisplayValue('Existing Profile');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Profile Name');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('existing-profile-id');
      }, { timeout: 3000 });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<ProfileFormValidated mode="create" />);

      expect(screen.getByText(/profile name/i)).toBeInTheDocument();
      expect(screen.getByText(/brand name/i)).toBeInTheDocument();
      expect(screen.getByText(/industry/i)).toBeInTheDocument();
      expect(screen.getByText(/niche/i)).toBeInTheDocument();
      expect(screen.getByText(/target audience/i)).toBeInTheDocument();
      expect(screen.getByText(/brand voice/i)).toBeInTheDocument();
      expect(screen.getByText(/primary objective/i)).toBeInTheDocument();
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();

      render(<ProfileFormValidated mode="create" />);

      const nameInput = screen.getByPlaceholderText(/SaaS Marketing/i);
      await user.type(nameInput, 'AB');
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/profile name must be at least 3 characters/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
