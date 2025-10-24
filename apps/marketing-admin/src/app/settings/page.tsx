'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Key, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Settings"
        description="Manage your account and system settings"
      />

      <div className="grid gap-6 max-w-2xl">
        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for third-party integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Coming soon: Manage your API keys for integrations with Google, Meta, Leonardo, and other services.
              </p>
              <Button variant="outline" disabled>
                Manage API Keys
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set up alerts for blog generation, campaign performance, and AI operations.
              </p>
              <Button variant="outline" disabled>
                Notification Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Update password, enable two-factor authentication, and manage sessions.
              </p>
              <Button variant="outline" disabled>
                Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
