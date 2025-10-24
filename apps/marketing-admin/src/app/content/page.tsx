'use client'

import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Zap, ArrowRight } from 'lucide-react'

export default function ContentPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Content Assets"
        description="View and manage repurposed content across platforms"
      />

      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-lg mb-4">
          <Zap className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          No Content Yet
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
          Start by creating a blog post and then repurpose it across multiple platforms. Each repurposed piece will appear here.
        </p>
        <Link href="/blogs/generate">
          <Button>
            Generate Blog & Repurpose
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
