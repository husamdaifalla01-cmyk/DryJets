'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Megaphone, Zap, BarChart3, ArrowRight } from 'lucide-react'

interface Action {
  label: string
  href: string
  icon: React.ReactNode
  description: string
}

const actions: Action[] = [
  {
    label: 'Generate Blog',
    href: '/blogs/generate',
    icon: <FileText className="w-5 h-5" />,
    description: 'Create SEO blog post',
  },
  {
    label: 'New Campaign',
    href: '/campaigns/new',
    icon: <Megaphone className="w-5 h-5" />,
    description: 'Launch ad campaign',
  },
  {
    label: 'Repurpose Content',
    href: '/content/repurpose',
    icon: <Zap className="w-5 h-5" />,
    description: 'Adapt for platforms',
  },
  {
    label: 'View Analytics',
    href: '/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Performance insights',
  },
]

export function QuickActions() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button variant="ghost" className="w-full justify-start h-auto p-3">
              <div className="flex items-start gap-3 flex-1 text-left">
                <div className="text-primary mt-1">{action.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}
