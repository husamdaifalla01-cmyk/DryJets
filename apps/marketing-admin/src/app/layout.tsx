import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import { RootLayout } from '@/components/layout/root-layout'
import './globals.css'

export const metadata: Metadata = {
  title: 'DryJets Marketing Dashboard',
  description: 'AI-Powered Marketing Automation Platform',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="overflow-hidden">
        <Providers>
          <RootLayout>{children}</RootLayout>
        </Providers>
      </body>
    </html>
  )
}
