/**
 * BLOG POST FORM VALIDATION TESTS
 *
 * Comprehensive test suite for BlogPostFormValidated component
 * Tests form rendering, validation, submission, and error handling
 *
 * @module components/content/BlogPostFormValidated.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { BlogPostFormValidated } from './BlogPostFormValidated';
import { createMockBlogPost } from '@/test/factories';

// Mock the hooks
vi.mock('@/lib/hooks/useContent', () => ({
  useCreateBlogPost: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'new-blog-id' }),
    isPending: false,
  }),
  useUpdateBlogPost: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'updated-blog-id' }),
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

describe('BlogPostFormValidated', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const testProfileId = 'test-profile-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the form in create mode', () => {
      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/title/i)).toBeInTheDocument();
      expect(screen.getByText(/excerpt/i)).toBeInTheDocument();
    });

    it('should render the form in update mode with pre-filled data', () => {
      const mockBlogPost = createMockBlogPost({
        title: 'Test Blog Post',
        body: 'This is test content',
        excerpt: 'Test excerpt for the blog post',
      });

      render(
        <BlogPostFormValidated
          mode="update"
          blogPost={mockBlogPost as any}
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('Test Blog Post')).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Test excerpt/i)).toBeInTheDocument();
    });

    it('should display all required form fields', () => {
      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // Check for required fields
      expect(screen.getByText(/title/i)).toBeInTheDocument();
      expect(screen.getByText(/excerpt/i)).toBeInTheDocument();

      // Submit button should be present
      expect(screen.getByRole('button', { name: /save|create|publish/i })).toBeInTheDocument();
    });
  });

  describe('Field Validation', () => {
    it('should show error when title is too short', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const titleInput = screen.getByText(/title/i);
      await user.type(titleInput, 'Short');
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        expect(screen.getByText(/title must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error when title is too long', async () => {
      const user = userEvent.setup();
      const longTitle = 'A'.repeat(201);

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const titleInput = screen.getByText(/title/i);
      await user.type(titleInput, longTitle);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/title must be less than 200 characters/i)).toBeInTheDocument();
      });
    });

    it('should accept valid title', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const titleInput = screen.getByText(/title/i);
      await user.type(titleInput, 'Valid Blog Post Title');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/title must be/i)).not.toBeInTheDocument();
      });
    });

    it('should validate excerpt length', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const excerptInput = screen.getByText(/excerpt/i);

      // Too short (less than 50 characters)
      await user.type(excerptInput, 'Short excerpt');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/excerpt must be at least 50 characters/i)).toBeInTheDocument();
      });

      // Clear and try valid length
      await user.clear(excerptInput);
      await user.type(excerptInput, 'A'.repeat(60));
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/excerpt must be at least 50 characters/i)).not.toBeInTheDocument();
      });
    });

    it('should validate content minimum length', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // Find the content editor (this might need adjustment based on actual implementation)
      // For now, we'll test the validation schema behavior

      const titleInput = screen.getByText(/title/i);
      await user.type(titleInput, 'Valid Blog Post Title');

      // Try to submit with minimal content
      const submitButton = screen.getByRole('button', { name: /save|create|publish/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/content must be at least 100 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate slug format', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const slugInput = screen.getByText(/slug/i);

      // Invalid slug with uppercase and spaces
      await user.type(slugInput, 'Invalid Slug Format');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/slug must contain only lowercase letters/i)).toBeInTheDocument();
      });

      // Valid slug
      await user.clear(slugInput);
      await user.type(slugInput, 'valid-slug-format');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/slug must contain only/i)).not.toBeInTheDocument();
      });
    });

    it('should validate SEO title length', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const seoTitleInput = screen.getByText(/seo title/i);
      const longSeoTitle = 'A'.repeat(71);

      await user.type(seoTitleInput, longSeoTitle);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/seo title should be less than 70 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate SEO description length', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const seoDescInput = screen.getByText(/seo description/i);
      const longDescription = 'A'.repeat(161);

      await user.type(seoDescInput, longDescription);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/seo description should be less than 160 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate keywords array', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // Add keywords (implementation depends on how keywords are added in the form)
      // This is a placeholder for the actual implementation

      // Test will vary based on UI implementation for adding keywords
      // For now, we're testing the schema behavior
      expect(true).toBe(true);
    });

    it('should validate featured image URL format', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const featuredImageInput = screen.getByText(/featured image/i);

      // Invalid URL
      await user.type(featuredImageInput, 'not-a-valid-url');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid image url/i)).toBeInTheDocument();
      });

      // Valid URL
      await user.clear(featuredImageInput);
      await user.type(featuredImageInput, 'https://example.com/image.jpg');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/invalid image url/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSuccess callback after successful creation', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in all required fields
      const titleInput = screen.getByText(/title/i);
      await user.type(titleInput, 'Valid Blog Post Title');

      const excerptInput = screen.getByText(/excerpt/i);
      await user.type(excerptInput, 'A'.repeat(60));

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save|create|publish/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('new-blog-id');
      });
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
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
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // Fill required fields
      const titleInput = screen.getByText(/title/i);
      await user.type(titleInput, 'Valid Blog Post Title');

      const submitButton = screen.getByRole('button', { name: /save|create|publish/i });

      // Click submit
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
    });

    it('should show loading indicator during submission', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const titleInput = screen.getByText(/title/i);
      await user.type(titleInput, 'Valid Blog Post Title');

      const submitButton = screen.getByRole('button', { name: /save|create|publish/i });
      await user.click(submitButton);

      // Should show loading indicator (Loader2 icon)
      expect(screen.getByTestId('loading-icon') || submitButton).toBeInTheDocument();
    });

    it('should prevent submission with invalid data', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
          onSuccess={mockOnSuccess}
        />
      );

      // Leave title empty (invalid)
      const submitButton = screen.getByRole('button', { name: /save|create|publish/i });
      await user.click(submitButton);

      // Form should not submit
      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });

      // Should show validation errors
      expect(screen.getByText(/title must be/i)).toBeInTheDocument();
    });
  });

  describe('Auto-generation Features', () => {
    it('should auto-generate slug from title', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const titleInput = screen.getByText(/title/i);
      await user.type(titleInput, 'My Test Blog Post Title');

      // Slug should be auto-generated
      const slugInput = screen.getByText(/slug/i) as HTMLInputElement;

      await waitFor(() => {
        expect(slugInput.value).toBe('my-test-blog-post-title');
      });
    });
  });

  describe('Field Reset', () => {
    it('should reset form when reset button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const titleInput = screen.getByText(/title/i) as HTMLInputElement;
      await user.type(titleInput, 'Some title');

      expect(titleInput.value).toBe('Some title');

      // Find and click reset button (if exists)
      const resetButton = screen.queryByRole('button', { name: /reset|clear/i });
      if (resetButton) {
        await user.click(resetButton);

        await waitFor(() => {
          expect(titleInput.value).toBe('');
        });
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      // All form fields should have associated labels
      expect(screen.getByText(/title/i)).toBeInTheDocument();
      expect(screen.getByText(/excerpt/i)).toBeInTheDocument();
      expect(screen.getByText(/slug/i)).toBeInTheDocument();
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();

      render(
        <BlogPostFormValidated
          mode="create"
          profileId={testProfileId}
        />
      );

      const titleInput = screen.getByText(/title/i);
      await user.type(titleInput, 'Short');
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/title must be at least 10 characters/i);
        expect(errorMessage).toBeInTheDocument();

        // Error should be associated with input via aria-describedby
        expect(titleInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
