# DryJets Packages

Monorepo packages for the DryJetsOS platform.

## Packages

### [@dryjets/ui](./ui/)
**Design system and UI components**

- Design tokens (colors, typography, spacing, shadows)
- DryJetsButton (tactile button with neon glows)
- SyncStatusIndicator (sync status dots)
- ToastNotification (toast system with context)

```typescript
import { DryJetsButton, tokens } from '@dryjets/ui';

<DryJetsButton variant="primary" size="md">
  Click me
</DryJetsButton>
```

### [@dryjets/storage](./storage/)
**Offline-first storage adapters**

- Universal storage interface
- DexieAdapter (IndexedDB for web)
- SqliteAdapter (SQLite for Electron)
- Auto-sync with retry logic

```typescript
import { createStorageAdapter } from '@dryjets/storage';

const storage = createStorageAdapter('web');
await storage.init();

const localId = await storage.saveLocal('orders', orderData);
```

### [@dryjets/hooks](./hooks/)
**React hooks for common functionality**

- useNetworkStatus (network state management)
- useKeyboardShortcuts (keyboard navigation)

```typescript
import { useNetworkStatus, useIsOnline } from '@dryjets/hooks';

const isOnline = useIsOnline();
const pendingCount = usePendingCount();
```

## Installation

```bash
# Install all packages
npm install

# Or install specific package
npm install @dryjets/ui
```

## Development

Each package has its own `package.json` and can be developed independently.

## Documentation

- [Design Tokens](./ui/dryjets-tokens.ts)
- [Storage Adapters](./storage/index.ts)
- [Network Status Hook](./hooks/useNetworkStatus.ts)
- [Keyboard Shortcuts](./hooks/useKeyboardShortcuts.ts)

## License

MIT