'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Zap, AlertCircle } from 'lucide-react'

export function LoginPage() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">DryJets</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Marketing Dashboard</h1>
          <p className="text-muted-foreground">AI-Powered Content Automation</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-lg border border-border shadow-lg p-8 space-y-6"
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dryjets.com"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-400 mb-2">
            Demo Credentials:
          </p>
          <p className="text-xs text-blue-800 dark:text-blue-300 mb-1">
            <span className="font-mono">admin@example.com</span>
          </p>
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <span className="font-mono">password123</span>
          </p>
        </div>
      </div>
    </div>
  )
}
