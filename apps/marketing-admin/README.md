# DryJets Marketing Admin Dashboard

AI-powered marketing automation dashboard for DryJets platform. Manage campaigns, generate SEO-optimized content, repurpose assets across platforms, and track performance metrics - all powered by Claude AI.

## 🚀 Quick Start

### Development

```bash
# Install dependencies (from root)
npm install

# Start development server
npm run dev -- --filter=@dryjets/marketing-admin

# Dashboard will be available at http://localhost:3003
```

### Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── page.tsx                  # Dashboard home
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── auth/                     # Authentication
│   │   └── login-page.tsx
│   ├── dashboard/                # Dashboard widgets
│   │   ├── header.tsx
│   │   ├── stats-cards.tsx
│   │   ├── quick-actions.tsx
│   │   └── recent-activity.tsx
│   ├── layout/                   # Layout components
│   │   ├── root-layout.tsx
│   │   ├── sidebar.tsx
│   │   └── top-bar.tsx
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── badge.tsx
│   └── providers.tsx             # Context providers
└── lib/
    ├── auth/
    │   ├── auth-context.tsx      # Auth context
    │   └── use-auth.ts           # Auth hook
    └── utils.ts                  # Utility functions
```

## 🔐 Authentication

The dashboard uses JWT tokens stored in cookies. Login credentials:

**Demo Account:**
- Email: `admin@example.com`
- Password: `password123`

Authentication flow:
1. User enters credentials on login page
2. Request sent to `/auth/login` API
3. JWT token stored in cookie
4. User redirected to dashboard
5. Token validated on each page load

## 🎨 UI Components

Built with:
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **Radix UI** - Accessible primitives
- **Lucide React** - Icons
- **Framer Motion** - Animations

## 🔄 API Integration

Dashboard communicates with backend API at `http://localhost:3000`:

### Available Endpoints

```
Marketing Module (/marketing/*)
├── Campaigns
│   ├── GET    /campaigns              # List campaigns
│   ├── POST   /campaigns              # Create campaign
│   ├── GET    /campaigns/:id          # Get campaign
│   └── PATCH  /campaigns/:id/status   # Update status
├── Blogs
│   ├── GET    /blog                   # List blogs
│   ├── POST   /blog                   # Create blog
│   ├── GET    /blog/:idOrSlug         # Get blog
│   ├── PATCH  /blog/:id/content       # Update content
│   ├── PATCH  /blog/:id/status        # Publish/archive
│   └── POST   /blog/generate          # AI generate
├── Content
│   └── POST   /content/repurpose      # Repurpose content
├── Analytics
│   ├── GET    /analytics/seo/:id      # SEO metrics
│   └── GET    /analytics/insights     # AI insights
└── System
    ├── GET    /logs                   # AI operation logs
    └── GET    /workflows              # Workflow runs
```

## 📊 Dashboard Pages (Planned)

### Phase 2 Week 2 (Current)
- ✅ Dashboard Overview
- ✅ Authentication Layout
- ✅ Navigation Sidebar
- ✅ Top Bar with User Menu

### Phase 2 Week 3-4
- 📝 Blog Management (CRUD + Editor)
- 🚀 Campaign Management
- ♻️ Content Repurposing Interface
- 📈 Analytics Dashboard

## 🛠️ Development Guide

### Adding New Pages

1. Create file in `src/app/`
2. Use `'use client'` for interactive pages
3. Import components and hooks
4. Example:

```typescript
'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'

export default function NewPage() {
  return (
    <div>
      <DashboardHeader title="New Page" />
      {/* Content here */}
    </div>
  )
}
```

### Using API Client

```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// In components:
const response = await apiClient.get('/marketing/blog')
```

### Using Hooks

```typescript
import { useAuth } from '@/lib/auth/use-auth'
import { useRouter } from 'next/navigation'

export function MyComponent() {
  const { user, logout } = useAuth()
  const router = useRouter()

  return <div>{user?.email}</div>
}
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build
npm run build
```

## 📦 Dependencies

Key packages:
- `next` - React framework
- `react-hook-form` - Form handling
- `@tanstack/react-query` - Data fetching
- `zustand` - State management
- `axios` - HTTP client
- `tailwindcss` - Styling
- `framer-motion` - Animations
- `next-themes` - Theme support

## 🚀 Deployment

### Build

```bash
npm run build
```

### Production Start

```bash
npm start
```

Runs on `http://localhost:3003` (configurable via PORT)

## 📖 Component Examples

### Button
```typescript
<Button variant="default">Click me</Button>
<Button variant="ghost">Ghost button</Button>
<Button variant="outline">Outline</Button>
<Button size="sm">Small</Button>
```

### Dashboard Header
```typescript
<DashboardHeader
  title="Page Title"
  description="Optional description"
  action={<Button>Action</Button>}
/>
```

## 🔗 Related Documentation

- [API Documentation](../../docs/05-backend-api/)
- [Marketing System Architecture](../../docs/08-future-plans/MARKETING-SYSTEM-ARCHITECTURE.md)
- [Phase 1 Completion](../../docs/08-future-plans/PHASE-1-WEEK-1-COMPLETION.md)

## 💡 Tips

- Use `cn()` utility for conditional classes
- Keep components in `components/` directory
- Use `@/` for imports from `src/`
- Always add `'use client'` for interactive components
- Follow TypeScript for better DX

## 🤝 Contributing

1. Create a branch for your feature
2. Make changes to components/pages
3. Run `npm run type-check` and `npm run lint`
4. Test locally
5. Commit with clear messages

## 📝 Notes

- Dashboard runs on port 3003
- API runs on port 3000
- Both must be running for full functionality
- Database must be running for API to work
- JWT tokens expire after 7 days

---

**Status**: Phase 2 Week 2 - Core dashboard infrastructure complete. Next: Blog management UI.
