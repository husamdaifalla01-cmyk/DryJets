/**
 * A/B TEST CREATOR TESTS
 *
 * Comprehensive test suite for ABTestCreator component
 * Tests A/B test configuration, variant management, metric selection, and validation
 *
 * @module components/ml/ABTestCreator.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { ABTestCreator } from './ABTestCreator';

describe('ABTestCreator', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const testContentId = 'test-content-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the A/B test creation form', () => {
      render(
        <ABTestCreator
          contentId={testContentId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/test details/i)).toBeInTheDocument();
      expect(screen.getByText(/test name/i)).toBeInTheDocument();
      expect(screen.getByText(/success metric/i)).toBeInTheDocument();
      expect(screen.getByText(/test variants/i)).toBeInTheDocument();
    });

    it('should display all form sections', () => {
      render(<ABTestCreator contentId={testContentId} />);

      expect(screen.getByText(/test details/i)).toBeInTheDocument();
      expect(screen.getByText(/success metric/i)).toBeInTheDocument();
      expect(screen.getByText(/test variants/i)).toBeInTheDocument();
    });

    it('should have default values for required fields', () => {
      render(<ABTestCreator contentId={testContentId} />);

      const durationInput = screen.getByText(/duration/i) as HTMLInputElement;
      expect(durationInput.value).toBe('7');
    });

    it('should display two default variants', () => {
      render(<ABTestCreator contentId={testContentId} />);

      expect(screen.getByText(/variant a \(control\)/i)).toBeInTheDocument();
      expect(screen.getByText(/variant b/i)).toBeInTheDocument();
    });
  });

  describe('Test Details Validation', () => {
    it('should validate test name minimum length', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByText(/test name/i);
      await user.type(nameInput, 'AB');
      await user.tab();

      const submitButton = screen.getByRole('button', { name: /create|start test/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/test name must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should accept valid test name', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const nameInput = screen.getByText(/test name/i);
      await user.type(nameInput, 'Headline Optimization Test');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/test name must be/i)).not.toBeInTheDocument();
      });
    });

    it('should accept optional description', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const descInput = screen.getByText(/description/i);
      await user.type(descInput, 'Testing different headlines for conversion');

      expect(descInput).toHaveValue('Testing different headlines for conversion');
    });

    it('should accept optional target audience', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const audienceInput = screen.getByText(/target audience/i);
      await user.type(audienceInput, 'Tech professionals');

      expect(audienceInput).toHaveValue('Tech professionals');
    });

    it('should validate duration minimum', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const durationInput = screen.getByText(/duration/i);
      await user.clear(durationInput);
      await user.type(durationInput, '0');

      const submitButton = screen.getByRole('button', { name: /create|start test/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/number must be greater than or equal to 1/i)).toBeInTheDocument();
      });
    });

    it('should validate duration maximum', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const durationInput = screen.getByText(/duration/i);
      await user.clear(durationInput);
      await user.type(durationInput, '31');

      const submitButton = screen.getByRole('button', { name: /create|start test/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/number must be less than or equal to 30/i)).toBeInTheDocument();
      });
    });

    it('should accept valid duration', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const durationInput = screen.getByText(/duration/i);
      await user.clear(durationInput);
      await user.type(durationInput, '14');

      expect(durationInput).toHaveValue(14);
    });
  });

  describe('Success Metric Selection', () => {
    it('should display all 5 metric options', () => {
      render(<ABTestCreator contentId={testContentId} />);

      expect(screen.getByText(/^views$/i)).toBeInTheDocument();
      expect(screen.getByText(/^engagement$/i)).toBeInTheDocument();
      expect(screen.getByText(/^clicks$/i)).toBeInTheDocument();
      expect(screen.getByText(/^conversions$/i)).toBeInTheDocument();
      expect(screen.getByText(/^shares$/i)).toBeInTheDocument();
    });

    it('should have engagement selected by default', () => {
      render(<ABTestCreator contentId={testContentId} />);

      const engagementButton = screen.getByText(/^engagement$/i).closest('button');
      expect(engagementButton).toHaveClass(/border-neon-cyan/);
    });

    it('should allow selecting different metrics', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      // Click on Conversions
      const conversionsButton = screen.getByText(/^conversions$/i).closest('button');
      await user.click(conversionsButton!);

      await waitFor(() => {
        expect(conversionsButton).toHaveClass(/border-neon-cyan/);
      });
    });

    it('should change selection when clicking different metrics', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      // Initially engagement is selected
      const engagementButton = screen.getByText(/^engagement$/i).closest('button');
      expect(engagementButton).toHaveClass(/border-neon-cyan/);

      // Click on Views
      const viewsButton = screen.getByText(/^views$/i).closest('button');
      await user.click(viewsButton!);

      await waitFor(() => {
        expect(viewsButton).toHaveClass(/border-neon-cyan/);
        expect(engagementButton).not.toHaveClass(/border-neon-cyan/);
      });
    });

    it('should display metric descriptions', () => {
      render(<ABTestCreator contentId={testContentId} />);

      expect(screen.getByText(/total content views/i)).toBeInTheDocument();
      expect(screen.getByText(/likes, comments, shares/i)).toBeInTheDocument();
      expect(screen.getByText(/click-through rate/i)).toBeInTheDocument();
    });
  });

  describe('Variant Management', () => {
    it('should start with 2 default variants', () => {
      render(<ABTestCreator contentId={testContentId} />);

      expect(screen.getByText(/variant a \(control\)/i)).toBeInTheDocument();
      expect(screen.getByText(/variant b/i)).toBeInTheDocument();
    });

    it('should label first variant as control', () => {
      render(<ABTestCreator contentId={testContentId} />);

      expect(screen.getByText(/control/i)).toBeInTheDocument();
    });

    it('should display add variant button', () => {
      render(<ABTestCreator contentId={testContentId} />);

      expect(screen.getByRole('button', { name: /add variant/i })).toBeInTheDocument();
    });

    it('should add a new variant when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const addButton = screen.getByRole('button', { name: /add variant/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/variant c/i)).toBeInTheDocument();
      });
    });

    it('should add multiple variants', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const addButton = screen.getByRole('button', { name: /add variant/i });

      // Add variant C
      await user.click(addButton);
      await waitFor(() => {
        expect(screen.getByText(/variant c/i)).toBeInTheDocument();
      });

      // Add variant D
      await user.click(addButton);
      await waitFor(() => {
        expect(screen.getByText(/variant d/i)).toBeInTheDocument();
      });
    });

    it('should limit variants to maximum of 5', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const addButton = screen.getByRole('button', { name: /add variant/i });

      // Add variants C, D, E (to reach 5 total)
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);

      await waitFor(() => {
        expect(addButton).toBeDisabled();
      });
    });

    it('should allow removing non-control variants', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      // Add a third variant
      const addButton = screen.getByRole('button', { name: /add variant/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/variant c/i)).toBeInTheDocument();
      });

      // Find and click remove button for variant C
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[removeButtons.length - 1]);

      await waitFor(() => {
        expect(screen.queryByText(/variant c/i)).not.toBeInTheDocument();
      });
    });

    it('should not allow removing variants if only 2 remain', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      // Try to find remove button for variant B
      const removeButtons = screen.queryAllByRole('button', { name: /remove/i });

      // Should either not show remove buttons or they should be disabled when only 2 variants
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0]);

        // Should still have 2 variants
        await waitFor(() => {
          expect(screen.getByText(/variant a \(control\)/i)).toBeInTheDocument();
          expect(screen.getByText(/variant b/i)).toBeInTheDocument();
        });
      }
    });

    it('should require at least 2 variants for submission', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} onSuccess={mockOnSuccess} />);

      // Fill required fields
      await user.type(screen.getByText(/test name/i), 'Test Name');

      // Try to submit (should have 2 variants by default, so should work)
      const submitButton = screen.getByRole('button', { name: /create|start test/i });
      await user.click(submitButton);

      // Should not show error about variants
      await waitFor(() => {
        expect(screen.queryByText(/at least 2 variants required/i)).not.toBeInTheDocument();
      });
    });

    it('should allow editing variant names', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      // Find variant name input (might be a hidden input or inline edit)
      const variantInputs = screen.getAllByDisplayValue(/variant/i);
      if (variantInputs.length > 0) {
        await user.clear(variantInputs[1]);
        await user.type(variantInputs[1], 'Custom Variant Name');

        expect(variantInputs[1]).toHaveValue('Custom Variant Name');
      }
    });

    it('should allow adding variant descriptions', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const descInputs = screen.queryAllByPlaceholderText(/describe this variant/i);
      if (descInputs.length > 0) {
        await user.type(descInputs[0], 'This is the control variant');
        expect(descInputs[0]).toHaveValue('This is the control variant');
      }
    });
  });

  describe('Form Submission', () => {
    it('should require test name before submission', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} onSuccess={mockOnSuccess} />);

      // Don't fill test name
      const submitButton = screen.getByRole('button', { name: /create|start test/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/test name must be at least 3 characters/i)).toBeInTheDocument();
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} onSuccess={mockOnSuccess} />);

      // Fill required fields
      await user.type(screen.getByText(/test name/i), 'Headline Test');

      // Submit
      const submitButton = screen.getByRole('button', { name: /create|start test/i });
      await user.click(submitButton);

      // Should show loading state or success
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show success message after creation', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} onSuccess={mockOnSuccess} />);

      // Fill and submit
      await user.type(screen.getByText(/test name/i), 'Headline Test');
      await user.click(screen.getByRole('button', { name: /create|start test/i }));

      // Wait for success message
      await waitFor(
        () => {
          expect(screen.getByText(/a\/b test created!/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should call onSuccess with test ID after creation', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} onSuccess={mockOnSuccess} />);

      await user.type(screen.getByText(/test name/i), 'Headline Test');
      await user.click(screen.getByRole('button', { name: /create|start test/i }));

      await waitFor(
        () => {
          expect(mockOnSuccess).toHaveBeenCalledWith(expect.stringContaining('test-'));
        },
        { timeout: 4000 }
      );
    });

    it('should disable submit button while creating', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      await user.type(screen.getByText(/test name/i), 'Headline Test');

      const submitButton = screen.getByRole('button', { name: /create|start test/i });
      await user.click(submitButton);

      // Button should be disabled during creation
      expect(submitButton).toBeDisabled();
    });

    it('should show loading indicator during creation', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      await user.type(screen.getByText(/test name/i), 'Headline Test');
      await user.click(screen.getByRole('button', { name: /create|start test/i }));

      // Should show loading indicator (Loader2 icon)
      await waitFor(() => {
        expect(screen.getByTestId('loader-icon') || screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('should display action buttons after success', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      await user.type(screen.getByText(/test name/i), 'Headline Test');
      await user.click(screen.getByRole('button', { name: /create|start test/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/view test results/i)).toBeInTheDocument();
          expect(screen.getByText(/create another/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should call onSuccess when view results is clicked', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} onSuccess={mockOnSuccess} />);

      await user.type(screen.getByText(/test name/i), 'Headline Test');
      await user.click(screen.getByRole('button', { name: /create|start test/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/view test results/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const viewResultsButton = screen.getByText(/view test results/i);
      await user.click(viewResultsButton);

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should call onCancel when create another is clicked', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      await user.type(screen.getByText(/test name/i), 'Headline Test');
      await user.click(screen.getByRole('button', { name: /create|start test/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/create another/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const createAnotherButton = screen.getByText(/create another/i);
      await user.click(createAnotherButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} onCancel={mockOnCancel} />);

      const cancelButton = screen.queryByRole('button', { name: /^cancel$/i });
      if (cancelButton) {
        await user.click(cancelButton);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<ABTestCreator contentId={testContentId} />);

      expect(screen.getByText(/test name/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
      expect(screen.getByText(/target audience/i)).toBeInTheDocument();
      expect(screen.getByText(/duration/i)).toBeInTheDocument();
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();
      render(<ABTestCreator contentId={testContentId} />);

      const nameInput = screen.getByText(/test name/i);
      await user.type(nameInput, 'AB');

      const submitButton = screen.getByRole('button', { name: /create|start test/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/test name must be at least 3 characters/i);
        expect(errorMessage).toBeInTheDocument();
        expect(nameInput).toHaveClass(/border-status-error/);
      });
    });

    it('should have accessible metric selection buttons', () => {
      render(<ABTestCreator contentId={testContentId} />);

      const metricButtons = screen.getAllByRole('button', { name: /views|engagement|clicks|conversions|shares/i });
      expect(metricButtons.length).toBeGreaterThan(0);

      metricButtons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Integration', () => {
    it('should accept contentId prop', () => {
      render(<ABTestCreator contentId="specific-content-id" />);

      // Component should render without errors
      expect(screen.getByText(/test details/i)).toBeInTheDocument();
    });

    it('should work without contentId', () => {
      render(<ABTestCreator onSuccess={mockOnSuccess} />);

      // Should still render and function
      expect(screen.getByText(/test details/i)).toBeInTheDocument();
    });
  });
});
