'use client';

/**
 * App Layout v2.0
 * "Precision OS" Main Layout
 *
 * Combines all navigation components:
 * - Sidebar (collapsible)
 * - Header (search, notifications, user menu)
 * - Command Bar (⌘K)
 * - Quick Actions Panel (⌘⇧A)
 *
 * Features:
 * - Seamless integration
 * - Keyboard shortcuts
 * - Responsive design
 * - Theme support
 */

import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandBar, useCommandBar } from './CommandBar';
import { QuickActionsPanel, useQuickActionsPanel } from './QuickActionsPanel';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const commandBar = useCommandBar();
  const quickActions = useQuickActionsPanel();

  return (
    <div className="h-screen flex bg-[#F8F9FA] dark:bg-[#0A0A0B] overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          onCommandBarOpen={() => commandBar.setOpen(true)}
          onQuickActionsOpen={() => quickActions.setOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Command Bar (⌘K) */}
      <CommandBar open={commandBar.open} onOpenChange={commandBar.setOpen} />

      {/* Quick Actions Panel (⌘⇧A) */}
      <QuickActionsPanel open={quickActions.open} onOpenChange={quickActions.setOpen} />
    </div>
  );
}
