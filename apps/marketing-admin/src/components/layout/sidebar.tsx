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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/use-auth'
import { useState } from 'react'

const navigationItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: BarChart3,
  },
  {
    label: 'Blogs',
    href: '/blogs',
    icon: FileText,
    submenu: [
      { label: 'All Posts', href: '/blogs' },
      { label: 'Generate New', href: '/blogs/generate' },
      { label: 'Pending Review', href: '/blogs?status=PENDING_REVIEW' },
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
    icon: Zap,
    submenu: [
      { label: 'Content Assets', href: '/content' },
      { label: 'Repurpose Content', href: '/content/repurpose' },
      { label: 'By Platform', href: '/content/by-platform' },
    ],
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
          'w-64 border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0 fixed h-full z-40 overflow-y-auto',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              DJ
            </div>
            <span>DryJets</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Marketing AI</p>
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
                      'flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                  {item.submenu && (
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
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
                          'block px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                          pathname === subitem.href
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              logout()
              setIsMobileOpen(false)
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
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
