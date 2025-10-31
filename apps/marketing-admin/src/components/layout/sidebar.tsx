'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Zap,
  FileText,
  Settings,
  Megaphone,
  LogOut,
  ChevronDown,
  Menu,
  GitBranch,
  Brain,
  Cpu,
  Shield,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/use-auth'
import { useState } from 'react'

import { Users, Target } from 'lucide-react'

const navigationItems = [
  {
    label: 'Mission Control',
    href: '/mission-control',
    icon: Zap,
  },
  {
    label: 'Profiles',
    href: '/profiles',
    icon: Users,
  },
  {
    label: 'Blogs',
    href: '/blogs',
    icon: FileText,
    submenu: [
      { label: 'All Posts', href: '/blogs' },
      { label: 'Generate New', href: '/blogs/generate' },
    ],
  },
  {
    label: 'Campaigns',
    href: '/campaigns',
    icon: Megaphone,
    submenu: [
      { label: 'All Campaigns', href: '/campaigns' },
      { label: 'Create Campaign', href: '/campaigns/new' },
      { label: 'Active', href: '/campaigns?status=ACTIVE' },
    ],
  },
  {
    label: 'Content',
    href: '/content',
    icon: Target,
    submenu: [
      { label: 'Content Assets', href: '/content' },
      { label: 'Repurpose Content', href: '/content/repurpose' },
    ],
  },
  {
    label: 'Workflows',
    href: '/workflows',
    icon: GitBranch,
  },
  {
    label: 'Intelligence',
    href: '/intelligence',
    icon: Brain,
  },
  {
    label: 'ML Lab',
    href: '/ml-lab',
    icon: Cpu,
  },
  {
    label: 'Offer-Lab',
    href: '/offer-lab',
    icon: DollarSign,
    submenu: [
      { label: 'Dashboard', href: '/offer-lab' },
      { label: 'Offers', href: '/offer-lab/offers' },
      { label: 'Funnels', href: '/offer-lab/funnels' },
      { label: 'Leads', href: '/offer-lab/leads' },
    ],
  },
  {
    label: 'Admin',
    href: '/admin/dashboard',
    icon: Shield,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([''])
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleSubmenu = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    )
  }

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'w-64 border-r border-border-default bg-bg-surface transition-transform duration-300 lg:static lg:translate-x-0 fixed h-full z-40 overflow-y-auto',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b border-border-subtle">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center font-bold text-white shadow-sm group-hover:shadow-md transition-shadow">
              DJ
            </div>
            <div>
              <span className="font-bold text-lg text-gradient-primary">DRYJETS</span>
              <p className="text-xs text-text-tertiary">Marketing Engine</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            const isExpanded = expandedItems.includes(item.label)

            return (
              <div key={item.label}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'flex-1 flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all rounded-lg',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                  {item.submenu && (
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className="p-2 hover:bg-bg-elevated rounded-lg transition-colors"
                    >
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform text-text-tertiary',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>
                  )}
                </div>

                {/* Submenu */}
                {item.submenu && isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.label}
                        href={subitem.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          'block px-3 py-2 text-sm font-medium transition-colors rounded-lg',
                          pathname === subitem.href
                            ? 'text-primary bg-primary/5'
                            : 'text-text-tertiary hover:text-text-primary hover:bg-bg-hover'
                        )}
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-subtle bg-bg-surface">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all rounded-lg text-text-secondary hover:text-accent-error hover:bg-bg-elevated"
            onClick={() => {
              logout()
              setIsMobileOpen(false)
            }}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
