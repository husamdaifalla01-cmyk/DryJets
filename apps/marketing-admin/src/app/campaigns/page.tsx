'use client'

import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Megaphone, Plus } from 'lucide-react'

export default function CampaignsPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Campaigns"
        description="Manage your multi-channel marketing campaigns"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-lg mb-4">
          <Megaphone className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Coming in Phase 3
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
          Campaign management interface will be available in Phase 3 Week 9. This will allow you to create, manage, and monitor multi-channel marketing campaigns with Ava's AI assistance.
        </p>
        <Link href="/blogs">
          <Button variant="outline">
            Go to Blog Management
          </Button>
        </Link>
      </div>
    </div>
  )
}
