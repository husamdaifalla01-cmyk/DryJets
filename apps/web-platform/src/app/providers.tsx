'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { TRPCProvider } from '@/lib/trpc';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1B365D',
                border: '1px solid #E5E7EB',
                padding: '16px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#00A86B',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF3B30',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ThemeProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
