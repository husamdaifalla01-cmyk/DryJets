# DryJets OS Transformation - Phase B Implementation Plan

## Executive Summary

This document outlines the complete implementation plan to transform DryJets into an enterprise-grade, offline-first laundromat OS that matches CleanCloud's capabilities while exceeding it with IoT/ML, hybrid offline functionality, and a distinct tech-driven brand.

**CleanCloud Analysis Complete**: See `/CLEANCLOUD_FEATURE_MAP.json` for full feature comparison.

---

## Phase B: Front-End Transformation (2-3 weeks)

### B1: Design System & Tokens (Day 1-2)

#### File: `packages/ui/dryjets-tokens.ts`
```typescript
export const tokens = {
  colors: {
    // Brand Colors - Deep Tech Theme
    primary: {
      DEFAULT: '#0A78FF', // Deep Tech Blue - primary glow
      50: '#E6F2FF',
      100: '#CCE5FF',
      200: '#99CCFF',
      300: '#66B2FF',
      400: '#3399FF',
      500: '#0A78FF', // Main
      600: '#0060CC',
      700: '#004899',
      800: '#003066',
      900: '#001833',
    },
    success: {
      DEFAULT: '#00B7A5', // Teal
      light: '#33C5B5',
      dark: '#008C7D',
    },
    warning: {
      DEFAULT: '#FFB74D', // Amber
      light: '#FFC870',
      dark: '#F59E0B',
    },
    error: {
      DEFAULT: '#FF6B6B', // Coral
      light: '#FF8A8A',
      dark: '#EF4444',
    },
    // Background - Matte Deep Navy
    background: {
      DEFAULT: '#0F1419', // Deep navy
      secondary: '#1A1F29',
      tertiary: '#252B3A',
    },
    // Surfaces
    surface: {
      DEFAULT: '#1E2633',
      elevated: '#2A3142',
      hover: '#343D52',
    },
    // Text
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      tertiary: '#94A3B8',
      disabled: '#64748B',
    },
    // Borders
    border: {
      DEFAULT: '#334155',
      subtle: '#1E293B',
      focus: '#0A78FF',
    },
  },

  typography: {
    fontFamily: {
      sans: ['Inter Tight', 'system-ui', 'sans-serif'],
      display: ['Satoshi', 'Inter Tight', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
  },

  spacing: {
    // 4px base grid
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    3: '0.75rem', // 12px
    4: '1rem',    // 16px
    6: '1.5rem',  // 24px
    8: '2rem',    // 32px
    12: '3rem',   // 48px
    16: '4rem',   // 64px
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    full: '9999px',
  },

  shadows: {
    glow: {
      primary: '0 0 20px rgba(10, 120, 255, 0.3)',
      success: '0 0 20px rgba(0, 183, 165, 0.3)',
      warning: '0 0 20px rgba(255, 183, 77, 0.3)',
      error: '0 0 20px rgba(255, 107, 107, 0.3)',
    },
    tactile: {
      inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
      pressed: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.4)',
    },
  },

  animation: {
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    glow: 'glow 1.5s ease-in-out infinite alternate',
    sync: 'sync 1s ease-in-out infinite',
  },
};

// Button Variants
export const buttonVariants = {
  primary: {
    base: 'bg-primary-500 text-white border border-primary-400',
    hover: 'hover:bg-primary-600 hover:shadow-glow-primary',
    active: 'active:shadow-tactile-pressed active:translate-y-0.5',
    focus: 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background',
  },
  secondary: {
    base: 'bg-surface text-text-primary border border-border',
    hover: 'hover:bg-surface-hover hover:border-primary-500',
    active: 'active:shadow-tactile-inset',
    focus: 'focus:ring-2 focus:ring-primary-500',
  },
  ghost: {
    base: 'bg-transparent text-text-secondary',
    hover: 'hover:bg-surface-elevated hover:text-text-primary',
    active: 'active:bg-surface',
  },
  danger: {
    base: 'bg-error text-white border border-error-dark',
    hover: 'hover:bg-error-dark hover:shadow-glow-error',
    active: 'active:shadow-tactile-pressed',
  },
};
```

#### Update: `tailwind.config.js`
```javascript
import { tokens } from './packages/ui/dryjets-tokens';

export default {
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.shadows,
      animation: tokens.animation,
      keyframes: {
        glow: {
          '0%': { boxShadow: tokens.shadows.glow.primary },
          '100%': { boxShadow: '0 0 30px rgba(10, 120, 255, 0.6)' },
        },
        sync: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
};
```

---

### B2: Offline-First Storage Adapters (Day 3-5)

#### File: `packages/storage/index.ts`
```typescript
export interface StorageAdapter {
  // Core CRUD
  saveLocal<T>(entity: string, payload: T): Promise<string>; // returns local ID
  getLocal<T>(entity: string, localId: string): Promise<T | null>;
  listPending<T>(entity: string): Promise<T[]>;
  markSynced(entity: string, localId: string, serverId: string): Promise<void>;

  // Sync lifecycle
  onSync(handler: (batch: SyncBatch) => Promise<void>): void;
  getPendingCount(): Promise<number>;

  // Conflict resolution
  storeConflict(localData: any, serverData: any, metadata: ConflictMetadata): Promise<string>;
  resolveConflict(conflictId: string, resolution: 'local' | 'server' | ConflictMerge): Promise<void>;
}

export interface SyncBatch {
  entity: string;
  items: Array<{
    localId: string;
    data: any;
    createdAt: Date;
    userId: string;
  }>;
}

export interface ConflictMetadata {
  entity: string;
  localId: string;
  serverId: string;
  field: string;
  userId: string;
  timestamp: Date;
}
```

#### File: `packages/storage/dexieAdapter.ts` (Web - IndexedDB)
```typescript
import Dexie, { Table } from 'dexie';

class DryJetsDexie extends Dexie {
  entities!: Table<EntityRecord>;
  conflicts!: Table<ConflictRecord>;
  syncLog!: Table<SyncLogRecord>;

  constructor() {
    super('DryJetsDB');
    this.version(1).stores({
      entities: '++id, entity, localId, serverId, syncStatus, createdAt',
      conflicts: '++id, entity, localId, resolvedAt',
      syncLog: '++id, timestamp, success',
    });
  }
}

export class DexieAdapter implements StorageAdapter {
  private db: DryJetsDexie;

  constructor() {
    this.db = new DryJetsDexie();
  }

  async saveLocal<T>(entity: string, payload: T): Promise<string> {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.db.entities.add({
      entity,
      localId,
      data: payload,
      syncStatus: 'pending',
      createdAt: new Date(),
      userId: getCurrentUserId(), // from auth context
    });

    return localId;
  }

  async listPending<T>(entity: string): Promise<T[]> {
    const records = await this.db.entities
      .where({ entity, syncStatus: 'pending' })
      .toArray();

    return records.map(r => r.data);
  }

  async markSynced(entity: string, localId: string, serverId: string): Promise<void> {
    await this.db.entities
      .where({ entity, localId })
      .modify({ syncStatus: 'synced', serverId, syncedAt: new Date() });
  }

  onSync(handler: (batch: SyncBatch) => Promise<void>): void {
    // Register sync handler (called by sync engine)
    window.addEventListener('online', async () => {
      const pending = await this.db.entities.where({ syncStatus: 'pending' }).toArray();

      const batches = groupBy(pending, 'entity');
      for (const [entity, items] of Object.entries(batches)) {
        await handler({ entity, items: items.map(i => ({
          localId: i.localId,
          data: i.data,
          createdAt: i.createdAt,
          userId: i.userId,
        }))});
      }
    });
  }

  async getPendingCount(): Promise<number> {
    return await this.db.entities.where({ syncStatus: 'pending' }).count();
  }
}
```

#### File: `packages/storage/sqliteAdapter.ts` (Electron - SQLite)
```typescript
import Database from 'better-sqlite3';

export class SqliteAdapter implements StorageAdapter {
  private db: Database.Database;

  constructor(dbPath: string = './dryjets.db') {
    this.db = new Database(dbPath);
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity TEXT NOT NULL,
        local_id TEXT UNIQUE NOT NULL,
        server_id TEXT,
        data TEXT NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced_at DATETIME
      );

      CREATE INDEX IF NOT EXISTS idx_pending ON entities(sync_status) WHERE sync_status = 'pending';
      CREATE INDEX IF NOT EXISTS idx_entity ON entities(entity);
    `);
  }

  async saveLocal<T>(entity: string, payload: T): Promise<string> {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const stmt = this.db.prepare(`
      INSERT INTO entities (entity, local_id, data, user_id)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(entity, localId, JSON.stringify(payload), getCurrentUserId());
    return localId;
  }

  async listPending<T>(entity: string): Promise<T[]> {
    const stmt = this.db.prepare(`
      SELECT data FROM entities
      WHERE entity = ? AND sync_status = 'pending'
      ORDER BY created_at ASC
    `);

    const rows = stmt.all(entity);
    return rows.map(row => JSON.parse(row.data));
  }

  // ... similar methods as Dexie
}
```

---

### B3: Network Status Management (Day 6)

#### File: `packages/hooks/useNetworkStatus.ts`
```typescript
import { create } from 'zustand';

export type NetworkStatus = 'online' | 'syncing' | 'offline';

interface NetworkState {
  status: NetworkStatus;
  lastSync: Date | null;
  pendingCount: number;
  setStatus: (status: NetworkStatus) => void;
  setLastSync: (date: Date) => void;
  setPendingCount: (count: number) => void;
  triggerSync: () => Promise<void>;
}

export const useNetworkStatus = create<NetworkState>((set, get) => ({
  status: navigator.onLine ? 'online' : 'offline',
  lastSync: null,
  pendingCount: 0,

  setStatus: (status) => set({ status }),
  setLastSync: (date) => set({ lastSync: date }),
  setPendingCount: (count) => set({ pendingCount: count }),

  triggerSync: async () => {
    if (!navigator.onLine) {
      toast.error('Cannot sync while offline');
      return;
    }

    set({ status: 'syncing' });

    try {
      const adapter = getStorageAdapter(); // web: Dexie, desktop: SQLite
      const pending = await adapter.listPending('orders');

      // Batch sync to server
      const response = await fetch('/api/sync/batch', {
        method: 'POST',
        body: JSON.stringify({ orders: pending }),
      });

      const { synced } = await response.json();

      // Mark as synced
      for (const item of synced) {
        await adapter.markSynced('orders', item.localId, item.serverId);
      }

      set({
        status: 'online',
        lastSync: new Date(),
        pendingCount: 0
      });

      toast.success(`Synced ${synced.length} items`);
    } catch (error) {
      set({ status: 'offline' });
      toast.error('Sync failed. Will retry automatically.');
    }
  },
}));

// Auto-detect network changes
window.addEventListener('online', () => {
  useNetworkStatus.getState().setStatus('online');
  useNetworkStatus.getState().triggerSync(); // Auto-sync on reconnect
});

window.addEventListener('offline', () => {
  useNetworkStatus.getState().setStatus('offline');
});
```

---

### B4: Control-Center Layout (Day 7-8)

#### File: `apps/web-merchant/src/components/layout/ControlCenterLayout.tsx`
```tsx
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
  LayoutDashboard, Package, Wrench, ShoppingBag, Users,
  Truck, TrendingUp, FileText, Settings, Bell, Menu, X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/dashboard/orders', icon: Package },
  { name: 'Equipment', href: '/dashboard/equipment', icon: Wrench },
  { name: 'Services', href: '/dashboard/services', icon: ShoppingBag },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Dispatch', href: '/dashboard/dispatch', icon: Truck },
  { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function ControlCenterLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { status, lastSync, pendingCount, triggerSync } = useNetworkStatus();

  const statusConfig = {
    online: { color: 'bg-green-500', text: 'Online', pulse: false },
    syncing: { color: 'bg-yellow-500', text: 'Syncing', pulse: true },
    offline: { color: 'bg-red-500', text: 'Offline', pulse: true },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-surface-elevated border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <span className="text-xl font-display font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              DryJetsOS
            </span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-surface-hover rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-glow-primary'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface-elevated border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-text-primary">
              {navigation.find(n => n.href === pathname)?.name || 'DryJetsOS'}
            </h2>
          </div>

          {/* Network Status Widget */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-surface rounded-lg border border-border">
              <div className={`h-3 w-3 rounded-full ${currentStatus.color} ${currentStatus.pulse ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">{currentStatus.text}</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 bg-warning text-xs rounded-full font-semibold">
                  {pendingCount}
                </span>
              )}
            </div>

            {lastSync && (
              <span className="text-xs text-text-tertiary">
                Last sync: {formatDistanceToNow(lastSync)} ago
              </span>
            )}

            {status === 'online' && pendingCount > 0 && (
              <button
                onClick={triggerSync}
                className="px-3 py-1 bg-primary text-white rounded text-sm font-medium hover:bg-primary-600"
              >
                Sync Now
              </button>
            )}

            <Bell className="text-text-secondary hover:text-text-primary cursor-pointer" size={20} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

### B5: Core UI Components Refactor (Day 9-11)

#### File: `apps/web-merchant/src/components/ui/DryJetsButton.tsx`
```tsx
import { buttonVariants } from '@/packages/ui/dryjets-tokens';
import { cn } from '@/lib/utils';

export function DryJetsButton({
  variant = 'primary',
  children,
  ...props
}: ButtonProps) {
  const config = buttonVariants[variant];

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all',
        'border-2 shadow-tactile-inset',
        config.base,
        config.hover,
        config.active,
        config.focus,
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### File: `apps/web-merchant/src/components/orders/OrderRow.tsx`
```tsx
export function OrderRow({ order }: { order: Order }) {
  const syncStatus = order.serverId ? 'synced' : order.localId ? 'pending' : 'failed';

  const syncDot = {
    synced: 'bg-green-500',
    pending: 'bg-yellow-500 animate-pulse',
    failed: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-surface rounded-lg border border-border hover:border-primary transition-all">
      {/* Sync Indicator */}
      <div className={`h-2 w-2 rounded-full ${syncDot[syncStatus]}`} title={syncStatus} />

      {/* Order Details */}
      <div className="flex-1">
        <h3 className="font-semibold">{order.orderNumber}</h3>
        <p className="text-sm text-text-secondary">{order.customerName}</p>
      </div>

      {/* Actions */}
      <DryJetsButton variant="ghost" size="sm">View</DryJetsButton>
    </div>
  );
}
```

---

### B6: Electron Desktop Wrapper (Day 12-13)

#### File: `electron/main.ts`
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load Next.js production build or dev server
  const isDev = process.env.NODE_ENV === 'development';
  const url = isDev
    ? 'http://localhost:3002'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  win.loadURL(url);
}

app.whenReady().then(createWindow);
```

#### File: `electron/preload.js`
```javascript
const { contextBridge } = require('electron');
const { SqliteAdapter } = require('../packages/storage/sqliteAdapter');

const adapter = new SqliteAdapter('./dryjets-desktop.db');

contextBridge.exposeInMainWorld('dryjets', {
  storage: {
    saveLocal: (entity, payload) => adapter.saveLocal(entity, payload),
    listPending: (entity) => adapter.listPending(entity),
    markSynced: (entity, localId, serverId) => adapter.markSynced(entity, localId, serverId),
  },
  platform: 'desktop',
});
```

#### Update: `package.json`
```json
{
  "scripts": {
    "dev:web": "cd apps/web-merchant && npm run dev",
    "dev:desktop": "concurrently \"npm run dev:web\" \"wait-on http://localhost:3002 && electron .\"",
    "build:desktop": "next build && next export && electron-builder"
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.0.0",
    "concurrently": "^8.0.0",
    "wait-on": "^7.0.0"
  }
}
```

---

### B7: Testing & Storybook (Day 14)

#### File: `.storybook/main.ts`
```typescript
export default {
  stories: ['../apps/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: '@storybook/nextjs',
};
```

#### File: `apps/web-merchant/src/components/orders/OrderRow.stories.tsx`
```tsx
import { OrderRow } from './OrderRow';

export default {
  title: 'Components/OrderRow',
  component: OrderRow,
};

export const OnlineSynced = {
  args: {
    order: {
      id: '123',
      serverId: 'srv_123',
      orderNumber: 'ORD-001',
      customerName: 'John Doe',
      status: 'PENDING',
    },
  },
};

export const OfflinePending = {
  args: {
    order: {
      localId: 'local_123',
      orderNumber: 'ORD-002',
      customerName: 'Jane Smith',
      status: 'PENDING',
    },
  },
};
```

#### File: `__tests__/storage.test.ts`
```typescript
import { DexieAdapter } from '@/packages/storage/dexieAdapter';

describe('DexieAdapter', () => {
  let adapter: DexieAdapter;

  beforeEach(() => {
    adapter = new DexieAdapter();
  });

  test('saveLocal creates pending record', async () => {
    const localId = await adapter.saveLocal('orders', { customerName: 'Test' });
    expect(localId).toMatch(/^local_/);

    const pending = await adapter.listPending('orders');
    expect(pending).toHaveLength(1);
  });

  test('markSynced updates status', async () => {
    const localId = await adapter.saveLocal('orders', { customerName: 'Test' });
    await adapter.markSynced('orders', localId, 'srv_123');

    const pending = await adapter.listPending('orders');
    expect(pending).toHaveLength(0);
  });
});
```

---

## Implementation Checklist

### Week 1
- [ ] Day 1-2: Design tokens + Tailwind config
- [ ] Day 3-5: Storage adapters (Dexie + SQLite)
- [ ] Day 6: Network status hook + UI
- [ ] Day 7-8: Control-center layout

### Week 2
- [ ] Day 9-11: Refactor components (Button, OrderRow, MachineCard)
- [ ] Day 12-13: Electron wrapper
- [ ] Day 14: Storybook + tests

### Week 3
- [ ] Polish, bug fixes, PR review
- [ ] Documentation (README, demo script)

---

## Demo Script (10 Steps)

1. **Start Web App**: `npm run dev:web` → See new DryJetsOS layout
2. **Network Status**: Header shows 🟢 Online, last sync time
3. **Go Offline**: Chrome DevTools → Network → Offline
4. **Create Order**: Click "New Order", fill form, submit
5. **Toast**: "Saved locally — will sync when online" appears
6. **Pending Indicator**: Order row shows yellow sync dot
7. **Pending Count**: Header widget shows "1" badge
8. **Go Online**: Re-enable network
9. **Auto Sync**: Watch "Syncing..." status, then green dot
10. **Desktop**: `npm run dev:desktop` → Same experience in Electron

---

## Next Steps: Phase C

After PR merged, create detailed backend plan for:
- Sync Gateway API (batch upsert endpoints)
- Payment adapters (FasCard, PayRange, etc.)
- Assembly webhooks (Metalprogetti, QuickSort)
- Accounting connectors (QuickBooks, Xero)
- Multi-store sync architecture
- ML training pipelines

---

**This implementation plan provides a complete roadmap for transforming DryJets into an enterprise-grade offline-first OS. Execute in sequence for best results.**