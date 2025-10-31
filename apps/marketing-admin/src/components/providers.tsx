'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/lib/auth/auth-context'
import { Toaster } from 'sonner'

/**
 * APPLICATION PROVIDERS
 *
 * Wraps the app with all necessary providers:
 * - ThemeProvider: Dark mode by default (Neo-Precision design)
 * - QueryClientProvider: React Query for data fetching
 * - AuthProvider: Authentication context
 * - Toaster: Toast notifications with custom styling
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'panel-command',
              style: {
                background: 'var(--bg-secondary)',
                border: '2px solid var(--neon-cyan)',
                color: 'var(--text-primary)',
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
