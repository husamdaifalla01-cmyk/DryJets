/**
 * Input Component v2.0
 * "Precision OS" Design System
 *
 * Features:
 * - Clean, minimal design
 * - Precise sizing (32px, 36px, 40px)
 * - Focus states with colored rings
 * - Error states with validation
 * - Icon support (before/after)
 *
 * Philosophy: Professional form inputs for enterprise users
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'flex w-full rounded-md border transition-all duration-200',
    'bg-white dark:bg-[#161618]',
    'text-[15px] text-[#111827] dark:text-[#FAFAFA]',
    'placeholder:text-[#9CA3AF] dark:placeholder:text-[#636366]',
    'focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F9FAFB] dark:disabled:bg-[#1A1A1D]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'border-[#E5E7EB] dark:border-[#2A2A2D]',
          'hover:border-[#D1D5DB] dark:hover:border-[#3A3A3C]',
          'focus-visible:border-[#0066FF] dark:focus-visible:border-[#60A5FA]',
          'focus-visible:ring-4 focus-visible:ring-[#0066FF]/10',
        ].join(' '),

        error: [
          'border-[#FF3B30] dark:border-[#F87171]',
          'focus-visible:border-[#FF3B30] dark:focus-visible:border-[#F87171]',
          'focus-visible:ring-4 focus-visible:ring-[#FF3B30]/10',
        ].join(' '),

        success: [
          'border-[#00A86B] dark:border-[#34D399]',
          'focus-visible:border-[#00A86B] dark:focus-visible:border-[#34D399]',
          'focus-visible:ring-4 focus-visible:ring-[#00A86B]/10',
        ].join(' '),
      },
      inputSize: {
        sm: 'h-8 px-3 text-sm', // 32px
        md: 'h-9 px-4 text-[15px]', // 36px (default)
        lg: 'h-10 px-5 text-[15px]', // 40px
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Icon to display before input */
  iconBefore?: React.ReactNode;
  /** Icon to display after input */
  iconAfter?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, iconBefore, iconAfter, type, ...props }, ref) => {
    // If icons are present, wrap in container
    if (iconBefore || iconAfter) {
      return (
        <div className="relative w-full">
          {iconBefore && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'text-[#6B7280] dark:text-[#A1A1A6]',
                'pointer-events-none',
                inputSize === 'sm' && 'h-3.5 w-3.5',
                inputSize === 'md' && 'h-4 w-4',
                inputSize === 'lg' && 'h-4 w-4'
              )}
            >
              {iconBefore}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant, inputSize, className }),
              iconBefore && 'pl-10',
              iconAfter && 'pr-10'
            )}
            ref={ref}
            {...props}
          />
          {iconAfter && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'text-[#6B7280] dark:text-[#A1A1A6]',
                inputSize === 'sm' && 'h-3.5 w-3.5',
                inputSize === 'md' && 'h-4 w-4',
                inputSize === 'lg' && 'h-4 w-4'
              )}
            >
              {iconAfter}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// Textarea variant
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    variant?: 'default' | 'error' | 'success';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border px-4 py-3',
        'bg-white dark:bg-[#161618]',
        'text-[15px] text-[#111827] dark:text-[#FAFAFA]',
        'placeholder:text-[#9CA3AF] dark:placeholder:text-[#636366]',
        'focus-visible:outline-none transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'default' && [
          'border-[#E5E7EB] dark:border-[#2A2A2D]',
          'hover:border-[#D1D5DB] dark:hover:border-[#3A3A3C]',
          'focus-visible:border-[#0066FF] dark:focus-visible:border-[#60A5FA]',
          'focus-visible:ring-4 focus-visible:ring-[#0066FF]/10',
        ],
        variant === 'error' && [
          'border-[#FF3B30] dark:border-[#F87171]',
          'focus-visible:ring-4 focus-visible:ring-[#FF3B30]/10',
        ],
        variant === 'success' && [
          'border-[#00A86B] dark:border-[#34D399]',
          'focus-visible:ring-4 focus-visible:ring-[#00A86B]/10',
        ],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

// Label component
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & {
    required?: boolean;
  }
>(({ className, children, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'block text-sm font-medium mb-2',
      'text-[#374151] dark:text-[#FAFAFA]',
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-[#FF3B30] ml-1">*</span>}
  </label>
));
Label.displayName = 'Label';

// Helper text component
const HelperText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-[13px] mt-1',
      'text-[#6B7280] dark:text-[#A1A1A6]',
      className
    )}
    {...props}
  />
));
HelperText.displayName = 'HelperText';

// Error text component
const ErrorText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-[13px] font-medium mt-1',
      'text-[#FF3B30] dark:text-[#F87171]',
      className
    )}
    {...props}
  />
));
ErrorText.displayName = 'ErrorText';

// Form field wrapper (combines label + input + helper/error text)
interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, required, error, helperText, children, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-0', className)}>
        {label && <Label required={required}>{label}</Label>}
        {children}
        {error && <ErrorText>{error}</ErrorText>}
        {!error && helperText && <HelperText>{helperText}</HelperText>}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { Input, Textarea, Label, HelperText, ErrorText, FormField, inputVariants };
