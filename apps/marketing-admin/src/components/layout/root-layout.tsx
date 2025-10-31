'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/use-auth'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { LoginPage } from '@/components/auth/login-page'

export function RootLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until hydrated
  if (!mounted) return null

  // Show login if not authenticated
  if (!isLoading && !user) {
    return <LoginPage />
  }

  // Show loading state with command-style spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-text-tertiary text-sm font-mono uppercase tracking-wide">
            INITIALIZING SYSTEM
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-bg-primary">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
