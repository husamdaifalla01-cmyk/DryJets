/**
 * PROFILE WIZARD VALIDATION TESTS
 *
 * Comprehensive test suite for ProfileWizardValidated component
 * Tests multi-step wizard flow, per-step validation, and navigation
 *
 * @module components/profiles/ProfileWizardValidated.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { ProfileWizardValidated } from './ProfileWizardValidated';

// Mock the hooks
vi.mock('@/lib/hooks/useProfile', () => ({
  useCreateProfile: () => ({
    mutate: vi.fn((data, { onSuccess }) => {
      onSuccess({ id: 'new-profile-id', ...data });
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

describe('ProfileWizardValidated', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the wizard at step 1', () => {
      render(<ProfileWizardValidated onComplete={mockOnComplete} />);

      expect(screen.getByText(/basic information/i)).toBeInTheDocument();
      expect(screen.getByText(/profile name/i)).toBeInTheDocument();
      expect(screen.getByText(/brand name/i)).toBeInTheDocument();
    });

    it('should display progress indicator with all steps', () => {
      render(<ProfileWizardValidated />);

      expect(screen.getByText(/basic info/i)).toBeInTheDocument();
      expect(screen.getByText(/audience/i)).toBeInTheDocument();
      expect(screen.getByText(/brand voice/i)).toBeInTheDocument();
      expect(screen.getByText(/goals/i)).toBeInTheDocument();
      expect(screen.getByText(/review/i)).toBeInTheDocument();
    });

    it('should highlight current step in progress indicator', () => {
      render(<ProfileWizardValidated />);

      // Step 1 should be highlighted
      const step1Indicator = screen.getByText('1').closest('div');
      expect(step1Indicator).toHaveClass(/border-neon-cyan/);
    });

    it('should show next button on step 1', () => {
      render(<ProfileWizardValidated />);

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should not show back button on step 1', () => {
      render(<ProfileWizardValidated />);

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });
  });

  describe('Step 1: Basic Info', () => {
    it('should display all required fields for step 1', () => {
      render(<ProfileWizardValidated />);

      expect(screen.getByText(/profile name/i)).toBeInTheDocument();
      expect(screen.getByText(/brand name/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
    });

    it('should validate profile name on next', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Try to go next without filling profile name
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/profile name must be at least 3 characters/i)).toBeInTheDocument();
      });

      // Should stay on step 1
      expect(screen.getByText(/basic information/i)).toBeInTheDocument();
    });

    it('should validate brand name on next', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Fill profile name but not brand name
      await user.type(screen.getByText(/profile name/i), 'Valid Profile');

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/brand name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should proceed to step 2 with valid data', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Fill required fields
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/audience & industry/i)).toBeInTheDocument();
      });
    });

    it('should accept optional description', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.type(screen.getByText(/description/i), 'Optional description text');

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/audience & industry/i)).toBeInTheDocument();
      });
    });

    it('should validate description max length', async () => {
      const user = userEvent.setup();
      const longDesc = 'A'.repeat(501);

      render(<ProfileWizardValidated />);

      await user.type(screen.getByText(/description/i), longDesc);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/description must be less than 500 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 2: Audience & Industry', () => {
    it('should display all required fields for step 2', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Navigate to step 2
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/industry/i)).toBeInTheDocument();
        expect(screen.getByText(/niche/i)).toBeInTheDocument();
        expect(screen.getByText(/target audience/i)).toBeInTheDocument();
      });
    });

    it('should show back button on step 2', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Navigate to step 2
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      });
    });

    it('should go back to step 1 when back is clicked', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Navigate to step 2
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/audience & industry/i)).toBeInTheDocument();
      });

      // Go back
      await user.click(screen.getByRole('button', { name: /back/i }));

      await waitFor(() => {
        expect(screen.getByText(/basic information/i)).toBeInTheDocument();
      });
    });

    it('should preserve step 1 data when going back', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Fill step 1
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Go to step 2
      await waitFor(() => {
        expect(screen.getByText(/audience & industry/i)).toBeInTheDocument();
      });

      // Go back
      await user.click(screen.getByRole('button', { name: /back/i }));

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Profile')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Brand')).toBeInTheDocument();
      });
    });

    it('should validate industry on next', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Navigate to step 2
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/audience & industry/i)).toBeInTheDocument();
      });

      // Try to proceed without industry
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/industry is required/i)).toBeInTheDocument();
      });
    });

    it('should validate target audience minimum length', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Navigate to step 2
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/industry/i)).toBeInTheDocument();
      });

      // Fill with short target audience
      await user.type(screen.getByText(/industry/i), 'Technology');
      await user.type(screen.getByText(/niche/i), 'SaaS');
      await user.type(screen.getByText(/target audience/i), 'Short');

      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/target audience description must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('should proceed to step 3 with valid data', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Navigate to step 2
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/industry/i)).toBeInTheDocument();
      });

      // Fill step 2
      await user.type(screen.getByText(/industry/i), 'Technology');
      await user.type(screen.getByText(/niche/i), 'SaaS Marketing');
      await user.type(screen.getByText(/target audience/i), 'Small business owners aged 25-45');

      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/brand voice/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 3: Brand Voice', () => {
    const fillSteps1And2 = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/industry/i)).toBeInTheDocument();
      });

      await user.type(screen.getByText(/industry/i), 'Technology');
      await user.type(screen.getByText(/niche/i), 'SaaS');
      await user.type(screen.getByText(/target audience/i), 'Small business owners');
      await user.click(screen.getByRole('button', { name: /next/i }));
    };

    it('should display brand voice fields', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillSteps1And2(user);

      await waitFor(() => {
        expect(screen.getByText(/brand voice/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/add brand value/i)).toBeInTheDocument();
      });
    });

    it('should validate brand voice on next', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillSteps1And2(user);

      await waitFor(() => {
        expect(screen.getByText(/brand voice/i)).toBeInTheDocument();
      });

      // Try to proceed without brand voice
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/brand voice is required/i)).toBeInTheDocument();
      });
    });

    it('should require at least one brand value', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillSteps1And2(user);

      await waitFor(() => {
        expect(screen.getByText(/brand voice/i)).toBeInTheDocument();
      });

      // Fill brand voice but no brand values
      await user.type(screen.getByText(/brand voice/i), 'Professional and friendly');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/at least one brand value is required/i)).toBeInTheDocument();
      });
    });

    it('should add brand values', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillSteps1And2(user);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/add brand value/i)).toBeInTheDocument();
      });

      const brandValueInput = screen.getByPlaceholderText(/add brand value/i);
      await user.type(brandValueInput, 'Innovation');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/innovation/i)).toBeInTheDocument();
      });
    });

    it('should proceed to step 4 with valid data', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillSteps1And2(user);

      await waitFor(() => {
        expect(screen.getByText(/brand voice/i)).toBeInTheDocument();
      });

      // Fill step 3
      await user.type(screen.getByText(/brand voice/i), 'Professional and friendly');

      const brandValueInput = screen.getByPlaceholderText(/add brand value/i);
      await user.type(brandValueInput, 'Innovation');
      await user.keyboard('{Enter}');

      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/goals/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 4: Goals', () => {
    const fillSteps1To3 = async (user: ReturnType<typeof userEvent.setup>) => {
      // Step 1
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2
      await waitFor(() => {
        expect(screen.getByText(/industry/i)).toBeInTheDocument();
      });
      await user.type(screen.getByText(/industry/i), 'Technology');
      await user.type(screen.getByText(/niche/i), 'SaaS');
      await user.type(screen.getByText(/target audience/i), 'Small business owners');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 3
      await waitFor(() => {
        expect(screen.getByText(/brand voice/i)).toBeInTheDocument();
      });
      await user.type(screen.getByText(/brand voice/i), 'Professional');
      const brandValueInput = screen.getByPlaceholderText(/add brand value/i);
      await user.type(brandValueInput, 'Innovation');
      await user.keyboard('{Enter}');
      await user.click(screen.getByRole('button', { name: /next/i }));
    };

    it('should display goals fields', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillSteps1To3(user);

      await waitFor(() => {
        expect(screen.getByText(/primary objective/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/add goal/i)).toBeInTheDocument();
      });
    });

    it('should require primary objective', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillSteps1To3(user);

      await waitFor(() => {
        expect(screen.getByText(/goals/i)).toBeInTheDocument();
      });

      // Try to proceed without objective
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/please select a primary objective/i)).toBeInTheDocument();
      });
    });

    it('should require at least one goal', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillSteps1To3(user);

      await waitFor(() => {
        expect(screen.getByText(/primary objective/i)).toBeInTheDocument();
      });

      // Select objective but no goals
      await user.selectOptions(screen.getByText(/primary objective/i), 'brand-awareness');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/at least one goal is required/i)).toBeInTheDocument();
      });
    });

    it('should add goals', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillSteps1To3(user);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/add goal/i)).toBeInTheDocument();
      });

      const goalInput = screen.getByPlaceholderText(/add goal/i);
      await user.type(goalInput, 'Increase brand awareness');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/increase brand awareness/i)).toBeInTheDocument();
      });
    });

    it('should proceed to step 5 (review) with valid data', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillSteps1To3(user);

      await waitFor(() => {
        expect(screen.getByText(/primary objective/i)).toBeInTheDocument();
      });

      // Fill step 4
      await user.selectOptions(screen.getByText(/primary objective/i), 'brand-awareness');
      const goalInput = screen.getByPlaceholderText(/add goal/i);
      await user.type(goalInput, 'Increase brand awareness');
      await user.keyboard('{Enter}');

      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/review/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 5: Review & Submit', () => {
    const fillAllSteps = async (user: ReturnType<typeof userEvent.setup>) => {
      // Step 1
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2
      await waitFor(() => {
        expect(screen.getByText(/industry/i)).toBeInTheDocument();
      });
      await user.type(screen.getByText(/industry/i), 'Technology');
      await user.type(screen.getByText(/niche/i), 'SaaS');
      await user.type(screen.getByText(/target audience/i), 'Small business owners');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 3
      await waitFor(() => {
        expect(screen.getByText(/brand voice/i)).toBeInTheDocument();
      });
      await user.type(screen.getByText(/brand voice/i), 'Professional');
      const brandValueInput = screen.getByPlaceholderText(/add brand value/i);
      await user.type(brandValueInput, 'Innovation');
      await user.keyboard('{Enter}');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 4
      await waitFor(() => {
        expect(screen.getByText(/primary objective/i)).toBeInTheDocument();
      });
      await user.selectOptions(screen.getByText(/primary objective/i), 'brand-awareness');
      const goalInput = screen.getByPlaceholderText(/add goal/i);
      await user.type(goalInput, 'Increase brand awareness');
      await user.keyboard('{Enter}');
      await user.click(screen.getByRole('button', { name: /next/i }));
    };

    it('should display review step', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillAllSteps(user);

      await waitFor(() => {
        expect(screen.getByText(/review/i)).toBeInTheDocument();
      });
    });

    it('should display submit button on review step', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillAllSteps(user);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create profile|submit/i })).toBeInTheDocument();
      });
    });

    it('should call onComplete after successful submission', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated onComplete={mockOnComplete} />);

      await fillAllSteps(user);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create profile|submit/i })).toBeInTheDocument();
      });

      // Submit
      await user.click(screen.getByRole('button', { name: /create profile|submit/i }));

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('new-profile-id');
      });
    });

    it('should show all completed steps as complete in progress indicator', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await fillAllSteps(user);

      await waitFor(() => {
        // All previous steps should show check marks
        const checkIcons = screen.getAllByTestId(/check/i);
        expect(checkIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Progress Indicator', () => {
    it('should mark completed steps with check icon', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Complete step 1
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        // Step 1 should now show a check icon instead of "1"
        expect(screen.queryByText('1')).not.toBeInTheDocument();
      });
    });

    it('should highlight current step', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Navigate to step 2
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const step2Indicator = screen.getByText('2').closest('div');
        expect(step2Indicator).toHaveClass(/border-neon-cyan/);
      });
    });

    it('should show future steps as inactive', () => {
      render(<ProfileWizardValidated />);

      // Steps 2-5 should be inactive
      const step5Indicator = screen.getByText('5').closest('div');
      expect(step5Indicator).toHaveClass(/text-text-tertiary/);
    });
  });

  describe('Data Persistence', () => {
    it('should preserve all data when navigating between steps', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      // Fill step 1
      await user.type(screen.getByText(/profile name/i), 'Test Profile');
      await user.type(screen.getByText(/brand name/i), 'Test Brand');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Fill step 2
      await waitFor(() => {
        expect(screen.getByText(/industry/i)).toBeInTheDocument();
      });
      await user.type(screen.getByText(/industry/i), 'Technology');
      await user.type(screen.getByText(/niche/i), 'SaaS');
      await user.type(screen.getByText(/target audience/i), 'SMB owners');

      // Go back to step 1
      await user.click(screen.getByRole('button', { name: /back/i }));

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Profile')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Brand')).toBeInTheDocument();
      });

      // Go forward again
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByDisplayValue('Technology')).toBeInTheDocument();
        expect(screen.getByDisplayValue('SaaS')).toBeInTheDocument();
        expect(screen.getByDisplayValue('SMB owners')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<ProfileWizardValidated />);

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('should have labels for all inputs', () => {
      render(<ProfileWizardValidated />);

      expect(screen.getByText(/profile name/i)).toBeInTheDocument();
      expect(screen.getByText(/brand name/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();
      render(<ProfileWizardValidated />);

      await user.type(screen.getByText(/profile name/i), 'AB');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        const errorMessage = screen.getByText(/profile name must be at least 3 characters/i);
        expect(errorMessage).toBeInTheDocument();

        const input = screen.getByText(/profile name/i);
        expect(input).toHaveAttribute('aria-invalid');
      });
    });
  });
});
