# DryJets Web Platform

> **Unified Web Application - Consumer, Business & Enterprise Portals**

The DryJets Web Platform is a Next.js 15 application that serves all web-based user experiences:
- Consumer marketplace for individual customers
- Business client portal for corporate accounts
- Enterprise SaaS dashboard for multi-location management
- Public marketing website with SEO optimization

---

## 🏗️ Architecture

### Route Structure

```
/                          → Marketing homepage
/about, /pricing, /contact → Public pages

/consumer/*                → Individual customer portal
  ├─ /dashboard            → Order history, account overview
  ├─ /marketplace          → Browse cleaners, book services
  ├─ /orders               → Order management
  ├─ /wardrobe             → Garment tracking
  └─ /account              → Profile settings

/business/*                → Corporate client portal
  ├─ /dashboard            → Analytics, quick actions
  ├─ /orders               → Bulk orders, templates
  ├─ /invoices             → Invoice management
  ├─ /team                 → Staff accounts
  └─ /settings             → Company profile

/enterprise/*              → Multi-tenant SaaS
  ├─ /dashboard            → Cross-location metrics
  ├─ /branches             → Manage locations
  ├─ /billing              → Subscription management
  ├─ /reports              → Advanced analytics
  └─ /api                  → API keys, webhooks

/auth/*                    → Authentication pages
/api/*                     → tRPC API endpoints
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.5+ |
| Styling | TailwindCSS + shadcn/ui |
| State Management | Zustand + React Query |
| API Client | tRPC v11 |
| Authentication | NextAuth v5 (planned) |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Content | Contentlayer (planned) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL database (shared with backend)

### Installation

```bash
# From the web-platform directory
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Start development server (runs on port 3000)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

### Environment Variables

See [.env.example](./.env.example) for all required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key

---

## 📁 Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── (marketing)/       # Public marketing pages
│   ├── (consumer)/        # Consumer portal
│   ├── (business)/        # Business portal
│   ├── (enterprise)/      # Enterprise portal
│   ├── auth/              # Authentication pages
│   └── api/               # API routes (tRPC)
│
├── components/            # React components
│   ├── ui/                # Base UI components (shadcn/ui)
│   ├── features/          # Feature-specific components
│   └── layouts/           # Layout components
│
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useOrders.ts
│   └── ...
│
├── lib/                   # Utilities and helpers
│   ├── api.ts             # API client configuration
│   ├── auth.ts            # Auth helpers
│   └── utils.ts           # General utilities
│
├── styles/                # Global styles
│   └── globals.css
│
└── types/                 # TypeScript type definitions
    └── index.ts
```

---

## 🎨 Design System

The web platform uses the DryJets "Precision OS" design system with:

- **Colors:** Strategic use of primary (blue), success (green), warning (amber), danger (red)
- **Typography:** Inter (body) + Plus Jakarta Sans (headings)
- **Spacing:** 4px grid system
- **Radius:** Rounded corners (8px default)
- **Shadows:** Subtle elevation system

All design tokens are imported from `@dryjets/ui` package.

---

## 🔐 Authentication (Planned)

Multi-role authentication using NextAuth v5:

- **Consumer** → `/consumer/*` access
- **Business** → `/business/*` access
- **Enterprise** → `/enterprise/*` access
- **Merchant** → Redirect to merchant portal
- **Driver** → Redirect to mobile app

Middleware handles role-based routing automatically.

---

## 📊 State Management

### Global State (Zustand)

```typescript
// Example: Auth store
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

### Server State (React Query)

```typescript
// Example: Fetching orders
import { useQuery } from '@tanstack/react-query';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetch('/api/orders').then(res => res.json()),
  });
}
```

---

## 🧪 Testing (Planned)

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

---

## 📦 Deployment

The web platform is designed to be deployed on Vercel:

```bash
# Deploy to Vercel
vercel deploy

# Deploy to production
vercel deploy --prod
```

### Performance Targets

- **First Contentful Paint:** < 1.2s
- **Time to Interactive:** < 2.5s
- **Lighthouse Score:** > 95
- **Bundle Size:** < 200KB (main chunk)

---

## 🔗 Integration with Existing Apps

### Backend API

The web platform communicates with the existing NestJS API (`apps/api`) via tRPC endpoints.

### Mobile Apps

Shares database and backend infrastructure with mobile apps (`mobile-customer`, `mobile-driver`).

### Shared Packages

Leverages monorepo shared packages:
- `@dryjets/database` - Prisma client and schema
- `@dryjets/types` - Shared TypeScript types
- `@dryjets/ui` - Design system and components
- `@dryjets/utils` - Utility functions

---

## 🚧 Development Roadmap

### ✅ Phase 1: Foundation (Current)
- [x] Project scaffold
- [x] Next.js 15 setup
- [x] TailwindCSS + design tokens
- [x] Basic routing structure
- [x] Marketing homepage
- [ ] tRPC integration
- [ ] NextAuth v5 setup

### 🚧 Phase 2: Consumer Portal
- [ ] Dashboard
- [ ] Marketplace with cleaner search
- [ ] Order booking flow
- [ ] Real-time order tracking
- [ ] Wardrobe management

### 📋 Phase 3: Business Portal
- [ ] Business dashboard
- [ ] Bulk order management
- [ ] Invoice system
- [ ] Team member management
- [ ] Analytics

### 📋 Phase 4: Enterprise SaaS
- [ ] Multi-tenant dashboard
- [ ] Branch management
- [ ] Centralized billing
- [ ] API key management
- [ ] Advanced reporting

### 📋 Phase 5: Content & SEO
- [ ] Contentlayer setup
- [ ] Blog system
- [ ] City-specific pages
- [ ] OpenGraph optimization
- [ ] Sitemap generation

---

## 📚 Documentation

- [Architecture Decision](../../STAGE_1_ARCHITECTURE_DECISION.md)
- [API Documentation](../../docs/05-backend-api/)
- [Design System](../../packages/ui/)

---

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

---

## 📄 License

Proprietary - DryJets Platform

---

**Built with ❤️ by the DryJets team**

*Generated by Claude Code - Principal Software Architect*
