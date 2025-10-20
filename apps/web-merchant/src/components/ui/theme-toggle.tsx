'use client';

/**
 * ThemeToggle Component
 * Animated Sun/Moon icon toggle with dropdown for theme selection
 *
 * Features:
 * - Smooth transitions with Framer Motion
 * - Dropdown with Light/Dark/System options
 * - Accessible with keyboard navigation
 * - Persists theme choice via theme-provider
 */

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          'p-2 rounded-lg',
          'text-foreground-secondary dark:text-[#A1A1A6]',
          'hover:bg-background-subtle dark:hover:bg-[#1A1A1D]',
          'transition-colors duration-150'
        )}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  const currentIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'relative p-2 rounded-lg',
            'text-foreground-secondary dark:text-[#A1A1A6]',
            'hover:bg-background-subtle dark:hover:bg-[#1A1A1D]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
          )}
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            >
              {React.createElement(currentIcon, { className: 'h-5 w-5' })}
            </motion.div>
          </AnimatePresence>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'min-w-[160px] p-1 rounded-lg',
            'bg-white dark:bg-[#161618]',
            'border border-[#E5E7EB] dark:border-[#2A2A2D]',
            'shadow-lg',
            'animate-slide-down',
            'z-50'
          )}
          sideOffset={8}
          align="end"
        >
          <DropdownMenu.Item asChild>
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                'text-sm text-[#374151] dark:text-[#FAFAFA]',
                'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                'cursor-pointer outline-none',
                'transition-colors duration-150',
                theme === 'light' && 'bg-[#F3F4F6] dark:bg-[#1A1A1D]'
              )}
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
              {theme === 'light' && (
                <motion.div
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600"
                  layoutId="theme-indicator"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                'text-sm text-[#374151] dark:text-[#FAFAFA]',
                'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                'cursor-pointer outline-none',
                'transition-colors duration-150',
                theme === 'dark' && 'bg-[#F3F4F6] dark:bg-[#1A1A1D]'
              )}
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
              {theme === 'dark' && (
                <motion.div
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600"
                  layoutId="theme-indicator"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                'text-sm text-[#374151] dark:text-[#FAFAFA]',
                'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                'cursor-pointer outline-none',
                'transition-colors duration-150',
                theme === 'system' && 'bg-[#F3F4F6] dark:bg-[#1A1A1D]'
              )}
            >
              <Monitor className="h-4 w-4" />
              <span>System</span>
              {theme === 'system' && (
                <motion.div
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600"
                  layoutId="theme-indicator"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
