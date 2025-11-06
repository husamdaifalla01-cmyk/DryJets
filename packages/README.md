# DryJets Packages

Monorepo packages for the DryJets platform.

## Packages

### [@dryjets/ui](./ui/)
**Design system and UI components**

- Design tokens (colors, typography, spacing, shadows)
- DryJetsButton (tactile button with neon glows)
- ToastNotification (toast system with context)

```typescript
import { DryJetsButton, tokens } from '@dryjets/ui';

<DryJetsButton variant="primary" size="md">
  Click me
</DryJetsButton>
```

### [@dryjets/hooks](./hooks/)
**React hooks for common functionality**

- useNetworkStatus (network state management)
- useKeyboardShortcuts (keyboard navigation)

```typescript
import { useNetworkStatus, useIsOnline } from '@dryjets/hooks';

const isOnline = useIsOnline();
```

### [@dryjets/database](./database/)
**Prisma database schema and migrations**

- Supabase PostgreSQL integration
- Type-safe database client
- Database migrations

```typescript
import { prisma } from '@dryjets/database';

const orders = await prisma.order.findMany();
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
- [Network Status Hook](./hooks/useNetworkStatus.ts)
- [Keyboard Shortcuts](./hooks/useKeyboardShortcuts.ts)
- [Database Schema](./database/prisma/schema.prisma)

## License

MIT
