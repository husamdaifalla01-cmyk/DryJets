# @dryjets/config

Shared configuration for ESLint, Prettier, and TypeScript across the DryJets monorepo.

## Overview

This package provides consistent code quality and formatting configurations for all DryJets applications and packages.

## Contents

### ESLint Configurations

- **`eslint-preset.js`** - Base ESLint configuration for all TypeScript projects
- **`eslint-nest.js`** - NestJS-specific ESLint rules (extends base)
- **`eslint-react.js`** - React/Next.js ESLint rules (extends base)

### Prettier Configuration

- **`prettier.config.js`** - Consistent code formatting rules

### TypeScript Configurations

- **`tsconfig.base.json`** - Base TypeScript configuration (lenient)
- **`tsconfig.strict.json`** - Strict TypeScript configuration
- **`tsconfig.nest.json`** - NestJS-specific TypeScript configuration
- **`tsconfig.react.json`** - React/Next.js TypeScript configuration

## Usage

### ESLint

#### For NestJS Projects (e.g., apps/api)

Create or update `.eslintrc.json`:

```json
{
  "extends": ["@dryjets/config/eslint-nest"]
}
```

#### For Next.js Projects (e.g., apps/marketing-admin)

Create or update `.eslintrc.json`:

```json
{
  "extends": ["@dryjets/config/eslint-react"]
}
```

### Prettier

Create or update `prettier.config.js` in your project root:

```javascript
module.exports = require('@dryjets/config/prettier');
```

Or for custom overrides:

```javascript
const baseConfig = require('@dryjets/config/prettier');

module.exports = {
  ...baseConfig,
  printWidth: 120, // Override specific rules
};
```

### TypeScript

#### For NestJS Projects

Update `tsconfig.json`:

```json
{
  "extends": "@dryjets/config/tsconfig-nest",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@dryjets/database": ["../../packages/database/src"],
      "@dryjets/types": ["../../packages/types/src"]
    }
  },
  "include": ["src/**/*"]
}
```

#### For Next.js Projects

Update `tsconfig.json`:

```json
{
  "extends": "@dryjets/config/tsconfig-react",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"],
      "@dryjets/types": ["../../packages/types/src"]
    }
  }
}
```

#### Migrating to Strict Mode

When ready to enable strict TypeScript, update your config:

```json
{
  "extends": "@dryjets/config/tsconfig-strict",
  "compilerOptions": {
    // Your project-specific settings
  }
}
```

## Configuration Details

### ESLint Rules

#### Base Rules

- ❌ **`@typescript-eslint/no-explicit-any`**: Error - Prevent `any` type usage
- ✅ **Import ordering**: Enforced with automatic sorting
- ✅ **Consistent type imports**: Use `import type` for types
- ⚠️ **No console**: Warning (allows `console.warn` and `console.error`)

#### NestJS-Specific Rules

- Allows dependency injection patterns
- Permits empty interfaces for DTOs
- Disables explicit return types (inferred from decorators)
- Node.js and Jest environments enabled

#### React-Specific Rules

- React 18+ rules (no need for `React` import)
- Hooks rules enforced
- Accessibility checks enabled
- Next.js Link component support

### TypeScript Configurations

#### Base Config (`tsconfig.base.json`)

**Target**: ES2022
**Strict Mode**: Disabled (for gradual migration)
**Decorators**: Enabled
**Source Maps**: Enabled

#### Strict Config (`tsconfig.strict.json`)

Extends base with:
- ✅ Full strict mode enabled
- ✅ No implicit any
- ✅ Strict null checks
- ✅ No unused locals/parameters
- ✅ No unchecked indexed access

#### NestJS Config (`tsconfig.nest.json`)

Extends base with:
- **Module**: CommonJS (Node.js)
- **Decorators**: Required for NestJS
- **Emit**: Configured for server output
- **Incremental**: Enabled for faster builds

#### React Config (`tsconfig.react.json`)

Extends base with:
- **Lib**: Includes DOM and DOM.Iterable
- **JSX**: Preserved (Next.js transforms)
- **Module Resolution**: Bundler mode
- **No Emit**: True (Next.js handles compilation)
- **Strict**: Enabled by default

## Migration Guide

### Step 1: Install Peer Dependencies

Ensure your project has the required ESLint plugins:

```bash
# For all projects
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-import

# For React/Next.js projects (additional)
npm install -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y
```

### Step 2: Update Configuration Files

Replace your existing `.eslintrc.json`, `prettier.config.js`, and `tsconfig.json` with the configs from this package.

### Step 3: Run Linting

```bash
# Fix auto-fixable issues
npm run lint -- --fix

# Check for remaining issues
npm run lint
```

### Step 4: Format Code

```bash
# Format all files
npm run format
```

## Best Practices

### 1. Don't Suppress Linting Errors

Instead of using `// eslint-disable-next-line`, fix the underlying issue.

❌ **Bad**:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData();
```

✅ **Good**:
```typescript
import type { DataResponse } from '@dryjets/types';

const data: DataResponse = fetchData();
```

### 2. Use Shared Types

Import types from `@dryjets/types` instead of defining inline:

✅ **Good**:
```typescript
import type { CampaignDto, ProfileDto } from '@dryjets/types';
```

### 3. Enable Strict Mode Gradually

Don't enable strict mode all at once. Fix types in batches:

1. DTOs and controllers
2. Core services
3. Integration services
4. Advanced features

### 4. Run Validation

Always run the validation script after changes:

```bash
npm run validate:architecture
```

## Troubleshooting

### ESLint "Cannot find module" errors

Ensure you've installed peer dependencies:

```bash
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### TypeScript "Cannot extend config" errors

Ensure the config package is in your workspace:

```json
{
  "compilerOptions": {
    "paths": {
      "@dryjets/config/*": ["../../packages/config/*"]
    }
  }
}
```

### Prettier not formatting

Ensure you have Prettier installed:

```bash
npm install -D prettier
```

Add a format script to `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\""
  }
}
```

## Maintenance

When updating configurations:

1. Test changes in a single app first
2. Update version in `package.json`
3. Run `npm install` in all affected workspaces
4. Run linting and type checking across the monorepo

## Related Documentation

- [ARCHITECTURAL_GOVERNANCE.md](../../ARCHITECTURAL_GOVERNANCE.md) - Governance rules
- [DEVELOPER_QUICK_REFERENCE.md](../../DEVELOPER_QUICK_REFERENCE.md) - Developer guide
- [CLAUDE_CODE_PROMPT_TEMPLATE.md](../../CLAUDE_CODE_PROMPT_TEMPLATE.md) - Development templates

## Support

For issues or questions:
1. Check this README
2. Review existing ESLint/TypeScript errors
3. Consult architectural governance docs
4. Ask the team

---

**Version**: 1.0.0
**Last Updated**: 2025-10-29
**Maintained By**: DryJets Platform Team
