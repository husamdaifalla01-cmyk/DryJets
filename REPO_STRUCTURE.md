# DryJets Repository Structure

This document outlines the organization of the DryJets monorepo, designed for large-scale enterprise development.

## 📁 Root Directory Structure

```
DryJets/
├── .github/              # GitHub-specific configurations
│   ├── ISSUE_TEMPLATE/   # Issue templates (bug reports, feature requests)
│   ├── PULL_REQUEST_TEMPLATE/  # PR templates
│   └── workflows/        # CI/CD GitHub Actions
├── apps/                 # Application workspaces
├── packages/             # Shared packages and libraries
├── docs/                 # Comprehensive documentation
├── scripts/              # Utility and automation scripts
├── infrastructure/       # Infrastructure as Code (IaC)
├── README.md             # Project overview and quick start
├── CONTRIBUTING.md       # Contribution guidelines
└── REPO_STRUCTURE.md     # This file
```

## 🚀 Apps Directory (`/apps`)

Production applications for the three-sided marketplace:

| App | Path | Description | Tech Stack |
|-----|------|-------------|------------|
| **Customer Web** | `apps/web-customer` | Customer-facing web portal | Next.js 14, TypeScript, Tailwind |
| **Merchant Portal** | `apps/web-merchant` | Business partner dashboard | Next.js 14, tRPC, Recharts |
| **Platform Web** | `apps/web-platform` | Main platform website | Next.js 14, Framer Motion |
| **Customer Mobile** | `apps/mobile-customer` | iOS/Android customer app | React Native, Expo |
| **Driver Mobile** | `apps/mobile-driver` | Driver companion app | React Native, Expo |
| **API** | `apps/api` | Backend NestJS API | NestJS, Prisma, PostgreSQL |
| **Admin Panel** | `apps/web-admin` | Internal admin dashboard | Next.js 14 |
| **Desktop App** | `apps/desktop` | Electron desktop app | Electron, React |

## 📦 Packages Directory (`/packages`)

Shared, reusable packages across all apps:

| Package | Purpose |
|---------|---------|
| `database` | Prisma schema, migrations, and database client |
| `types` | Shared TypeScript types and interfaces |
| `ui` | Shared React component library |
| `config` | Shared configuration (ESLint, Tailwind, etc.) |
| `utils` | Common utility functions |
| `hooks` | Shared React hooks |
| `storage` | Storage abstraction layer |

## 📚 Documentation Directory (`/docs`)

Comprehensive, organized documentation:

### Directory Structure

```
docs/
├── 00-quick-start/           # Quick start guides for new users
│   ├── GETTING_STARTED.md
│   ├── QUICK_START_PUBLIC.md
│   ├── QUICK_START_CONSUMER_APP.md
│   └── PHASE_2_QUICK_START.md
│
├── 01-setup/                 # Setup and configuration guides
│   ├── google-maps-setup.md
│   ├── iot-setup.md
│   ├── notifications-setup.md
│   └── offline-mode-setup.md
│
├── 02-architecture/          # Architecture decisions and design
│   ├── dashboard-architecture.md
│   ├── design-vision.md
│   ├── implementation-roadmap.md
│   ├── navigation-system.md
│   └── project-overview.md
│
├── 03-mobile-customer/       # Mobile customer app documentation
│   ├── implementation-guide.md
│   ├── quick-start.md
│   └── [phase documentation]
│
├── 04-merchant-portal/       # Merchant portal documentation
│   ├── quick-start.md
│   ├── preview-guide.md
│   └── visual-guide.md
│
├── 05-backend-api/           # Backend API documentation
│   ├── phase-1-2-3-summary.md
│   └── [phase documentation]
│
├── 06-features/              # Feature-specific documentation
│   ├── iot-integration.md
│   ├── iot-ml-implementation.md
│   ├── maintenance-system.md
│   └── self-service-fulfillment.md
│
├── 07-project-status/        # Project status and progress reports
│   ├── consumer-app-completion.md
│   ├── final-status-summary.md
│   └── mvp-progress.md
│
├── 08-reference/             # Reference materials
│   ├── cursor-ai-prompts.md
│   ├── github-setup.md
│   ├── migration-guide.md
│   └── CLEANCLOUD_FEATURE_MAP.json
│
├── 09-archive/               # Archived/historical documentation
│   └── [older documentation]
│
├── 10-troubleshooting/       # Troubleshooting and fixes
│   ├── CACHE_ISSUE_RESOLVED.md
│   ├── HERMES_FIX_GUIDE.md
│   ├── MONOREPO_FIX_COMPLETE.md
│   └── [other fixes]
│
├── 11-stages/                # Stage-based implementation docs
│   ├── STAGE_1_ARCHITECTURE_DECISION.md
│   ├── STAGE_2_DESIGN_SYSTEM_COMPLETE.md
│   ├── STAGE_3_DATABASE_MULTI_TENANCY_COMPLETE.md
│   ├── STAGE_4_COMPLETE.md
│   ├── STAGE_5_COMPLETE.md
│   └── STAGES_6_TO_13_IMPLEMENTATION_GUIDE.md
│
└── 12-progress-reports/      # Detailed progress reports
    ├── PROJECT_STATUS_SUMMARY.md
    ├── DRYJETS_WEB_PLATFORM_PROGRESS_REPORT.md
    └── SESSION_SUMMARY_PHASE_2.md
```

## 🛠️ Scripts Directory (`/scripts`)

Automation and utility scripts:

| Script | Purpose |
|--------|---------|
| `setup.sh` | One-command project setup |
| `test-iot-simple.sh` | IoT telemetry testing |
| `test-iot-telemetry.ts` | TypeScript IoT simulator |
| `fix-typescript-errors.sh` | Automated TypeScript error fixes |

## 🏗️ Infrastructure Directory (`/infrastructure`)

Infrastructure as Code (IaC) configurations:

- AWS configurations
- Docker configurations
- Kubernetes manifests
- Terraform scripts

## 🌿 Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Development integration branch |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `hotfix/*` | Production hotfixes |
| `release/*` | Release preparation |

## 📝 File Naming Conventions

### Documentation

- **Quick Starts**: `QUICK_START_*.md`
- **Guides**: `*-guide.md` (lowercase with hyphens)
- **Status Reports**: `*-status.md`, `*-summary.md`
- **Completion Docs**: `*-complete.md`
- **Stage Docs**: `STAGE_N_*.md`

### Code

- **Components**: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `apiClient.ts`)
- **Types**: PascalCase with `.types.ts` (e.g., `User.types.ts`)
- **Tests**: `*.test.ts` or `*.spec.ts`

## 🚦 Getting Started

### For New Developers

1. Read [README.md](./README.md) for project overview
2. Follow [docs/00-quick-start/GETTING_STARTED.md](./docs/00-quick-start/GETTING_STARTED.md)
3. Review [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
4. Check [docs/02-architecture/](./docs/02-architecture/) for architectural decisions

### For Users

1. Start with [docs/00-quick-start/QUICK_START_PUBLIC.md](./docs/00-quick-start/QUICK_START_PUBLIC.md)
2. Choose your app:
   - Customer: [docs/03-mobile-customer/quick-start.md](./docs/03-mobile-customer/quick-start.md)
   - Merchant: [docs/04-merchant-portal/quick-start.md](./docs/04-merchant-portal/quick-start.md)

## 🔍 Finding Documentation

| Looking for... | Check... |
|----------------|----------|
| How to get started | `docs/00-quick-start/` |
| Setup guides | `docs/01-setup/` |
| Architecture info | `docs/02-architecture/` |
| Feature documentation | `docs/06-features/` |
| Troubleshooting | `docs/10-troubleshooting/` |
| Project status | `docs/07-project-status/` or `docs/12-progress-reports/` |
| API reference | Coming soon |

## 🎯 Best Practices

### Adding New Documentation

1. Determine the appropriate category (00-12)
2. Use consistent naming conventions
3. Update the category's README.md if it exists
4. Link from relevant documents
5. Add to this file if creating a new category

### Working with Monorepo

- Use `npx turbo` for build orchestration
- Run workspace-specific commands: `npm run <script> --workspace=<name>`
- Shared code goes in `packages/`
- App-specific code stays in `apps/`

### Code Organization

- Keep components small and focused
- Extract shared logic to `packages/`
- Document complex business logic
- Write tests for critical paths

## 📊 Workspace Dependencies

```
┌─────────────────┐
│  apps/api       │──┐
└─────────────────┘  │
                     ├──► packages/database
┌─────────────────┐  │
│  apps/web-*     │──┤
└─────────────────┘  │
                     ├──► packages/types
┌─────────────────┐  │
│  apps/mobile-*  │──┘    packages/ui
└─────────────────┘        packages/utils
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

## 📄 License

See [LICENSE](./LICENSE) for license information.

---

**Last Updated**: October 2025
**Maintained by**: DryJets Development Team
