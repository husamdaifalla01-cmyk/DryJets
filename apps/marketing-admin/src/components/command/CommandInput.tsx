import React from 'react';
import { cn } from '@/lib/utils';

/**
 * COMMAND INPUT
 *
 * Input field with refined minimal styling.
 * Rounded corners, subtle borders, focus ring effects.
 *
 * Size variants:
 * - md (default): Standard height input
 * - lg: Larger input for emphasized fields
 */

export interface CommandInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: 'md' | 'lg';
}

export const CommandInput = React.forwardRef<
  HTMLInputElement,
  CommandInputProps
>(({ className, inputSize = 'md', ...props }, ref) => {
  const sizeClasses = {
    md: 'input',
    lg: 'input input-lg',
  };

  return (
    <input
      ref={ref}
      className={cn(sizeClasses[inputSize], className)}
      {...props}
    />
  );
});

CommandInput.displayName = 'CommandInput';

/**
 * COMMAND TEXTAREA
 *
 * Textarea variant with refined minimal styling.
 * Matches input styling with resize capability.
 */
export interface CommandTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const CommandTextarea = React.forwardRef<
  HTMLTextAreaElement,
  CommandTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn('textarea', className)}
      {...props}
    />
  );
});

CommandTextarea.displayName = 'CommandTextarea';

export default CommandInput;
