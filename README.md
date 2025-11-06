# DryJets Platform

> **Cloud-First Dry Cleaning & Laundry Marketplace Platform**

DryJets is a three-sided marketplace platform connecting customers, drivers, and merchants (laundromats/dry cleaners) for on-demand and scheduled laundry services - like Uber Eats for dry cleaning. Built entirely on Supabase for modern, scalable cloud infrastructure.

## Overview

### What is DryJets?

DryJets revolutionizes the dry cleaning and laundry industry by providing:

- **For Customers**: On-demand & scheduled laundry pickup and delivery via mobile app
- **For Drivers**: Gig economy model to earn money picking up and delivering laundry orders
- **For Merchants**: World-class business management system for laundromats and dry cleaners

### Key Features

#### Customer Features
- On-demand and scheduled pickup/delivery
- Real-time order tracking with live driver location
- AI-powered fabric detection and stain identification
- Wardrobe management system
- Multiple payment options & loyalty rewards
- Subscription orders (weekly, bi-weekly, monthly)

#### Driver Features
- Accept/decline orders with flexible scheduling
- Intelligent route optimization
- Real-time earnings tracker with surge pricing
- Tips and bonuses
- In-app navigation and communication

#### Merchant Features (Our Differentiator!)
- Comprehensive order management system
- Customer relationship management (CRM)
- Inventory and supply chain management
- Staff scheduling and management
- Equipment maintenance tracking
- Multi-location support
- AI-powered demand forecasting
- Dynamic pricing engine
- Financial analytics and reporting
- Marketing and promotion tools
- Sustainability tracking

## Tech Stack

### Frontend
- **Customer/Driver Apps**: React Native with Expo
- **Merchant Portal**: Next.js 14+ with TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query

### Backend & Cloud Infrastructure (Supabase)
- **Database**: PostgreSQL with Prisma ORM (hosted on Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (WebSocket subscriptions)
- **Storage**: Supabase Storage for file uploads
- **Edge Functions**: Deno-based serverless functions
- **API**: Auto-generated REST & GraphQL APIs via PostgREST
- **Row-Level Security**: Built-in RLS policies

### Development Infrastructure
- **Monorepo**: Turborepo
- **Local Development**: Docker Compose for supporting services
- **Cloud**: Fully managed by Supabase

### Third-Party Services
- **Cloud Platform**: Supabase (Database, Auth, Storage, Realtime)
- **Payments**: Stripe Connect
- **Maps**: Google Maps / Mapbox
- **SMS**: Twilio
- **Email**: SendGrid / Supabase Email
- **AI**: OpenAI GPT-4

## Project Structure

```
dryjets-platform/
├── apps/
│   ├── api/                    # NestJS Backend API
│   ├── mobile-customer/        # React Native Customer App
│   ├── mobile-driver/          # React Native Driver App
│   ├── web-merchant/           # Next.js Merchant Portal
│   └── web-admin/              # Next.js Admin Dashboard
├── packages/
│   ├── database/               # Prisma schema & migrations
│   ├── types/                  # Shared TypeScript types
│   ├── ui/                     # Shared UI components
│   ├── utils/                  # Shared utilities
│   └── config/                 # Shared configurations
├── services/
│   ├── ai-engine/              # Python ML/AI services
│   ├── notification/           # Notification service
│   ├── payment/                # Payment processing
│   └── tracking/               # Real-time tracking
├── infrastructure/
│   ├── docker/                 # Docker configs
│   ├── kubernetes/             # K8s manifests
│   └── terraform/              # Infrastructure as Code
├── docs/                       # Documentation
└── scripts/                    # Build/deploy scripts
```

## Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Supabase Account** (free tier available at https://supabase.com)
- **Docker** (optional, for local Redis/testing only)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/dryjets-platform.git
cd dryjets-platform
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase Project**

- Create a new project at [supabase.com](https://supabase.com)
- Copy your project URL and anon key
- Create a `.env` file with your Supabase credentials:

```bash
cp .env.example .env
# Add your Supabase credentials:
# SUPABASE_URL=your-project-url
# SUPABASE_ANON_KEY=your-anon-key
# DATABASE_URL=your-supabase-postgres-connection-string
```

4. **Run database migrations**

```bash
cd packages/database
npm run db:migrate
```

5. **Generate Prisma client**

```bash
npm run db:generate
```

6. **Start the development servers**

```bash
# Start all apps in development mode
npm run dev

# Or start specific apps:
npm run dev --workspace=@dryjets/web-merchant
npm run dev --workspace=@dryjets/mobile-customer
npm run dev --workspace=@dryjets/mobile-driver
```

Note: Backend API is handled by Supabase auto-generated APIs. For custom business logic, deploy Edge Functions to your Supabase project.

### Accessing the Applications

- **Supabase Dashboard**: https://app.supabase.com (database, auth, storage management)
- **Merchant Portal**: http://localhost:3002
- **Customer App**: Expo Go (scan QR code)
- **Driver App**: Expo Go (scan QR code)

## Database Schema

The platform uses a comprehensive PostgreSQL database with the following main entities:

- **Users**: Multi-role user authentication
- **Customers**: Customer profiles and preferences
- **Drivers**: Driver profiles, vehicle info, and earnings
- **Merchants**: Business information and settings
- **Orders**: Complete order lifecycle management
- **Payments**: Payment processing and payouts
- **Services**: Merchant service offerings and pricing
- **Inventory**: Merchant inventory management
- **Equipment**: Equipment tracking and maintenance
- **Staff**: Employee management
- **Reviews**: Ratings and feedback
- **Analytics**: Event tracking and analytics

See [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma) for the complete schema.

## Development Workflow

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific workspace
npm run test --workspace=@dryjets/api

# Run tests with coverage
npm run test:cov
```

### Linting & Formatting

```bash
# Lint all code
npm run lint

# Format all code
npm run format
```

### Building

```bash
# Build all apps
npm run build

# Build specific app
npm run build --workspace=@dryjets/api
```

### Type Checking

```bash
# Type check all TypeScript code
npm run type-check
```

## Docker Development

Docker is only needed for optional supporting services (not required as Supabase handles core infrastructure):

```bash
cd infrastructure/docker
docker-compose up
```

This starts optional services like:
- Redis cache (for caching if needed)
- Other supporting services

Note: PostgreSQL, Authentication, Storage, and Realtime are all handled by Supabase cloud.

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker Production

```bash
# Build production images
docker-compose -f infrastructure/docker/docker-compose.prod.yml build

# Start production stack
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d
```

### Environment-Specific Configs

- **Development**: `.env.development`
- **Staging**: `.env.staging`
- **Production**: `.env.production`

## API Documentation

DryJets uses Supabase's auto-generated APIs:

- **REST API**: Auto-generated by PostgREST based on your database schema
- **GraphQL API**: Available through Supabase's GraphQL endpoint
- **API Documentation**: View in your Supabase dashboard under "API Docs"
- **Realtime Subscriptions**: WebSocket connections for real-time updates

Custom business logic is implemented via Supabase Edge Functions (serverless Deno functions).

## Architecture

### Backend Architecture

The backend leverages Supabase's cloud infrastructure:

- **Database Layer**: PostgreSQL with Row-Level Security (RLS) policies
- **API Layer**: Auto-generated REST & GraphQL APIs via PostgREST
- **Auth Layer**: Supabase Auth with multiple providers (email, OAuth, etc.)
- **Real-time Layer**: WebSocket subscriptions for live updates
- **Storage Layer**: Supabase Storage for file uploads
- **Business Logic**: Supabase Edge Functions (Deno-based serverless functions)

Custom business logic and complex operations are handled via Edge Functions deployed to your Supabase project.

### Frontend Architecture

The merchant portal uses Next.js 14 with App Router:

```
apps/web-merchant/src/
├── app/                # App router pages
├── components/         # React components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
└── types/              # TypeScript types
```

## AI Features

DryJets integrates AI throughout the platform:

1. **Smart Fabric Detection**: Computer vision to identify fabric types
2. **Stain Identification**: AI-powered stain detection and treatment recommendations
3. **Demand Forecasting**: ML model predicts order volume for staffing optimization
4. **Dynamic Pricing**: Intelligent pricing based on demand and capacity
5. **Route Optimization**: Multi-stop route optimization for drivers
6. **Customer Churn Prediction**: Identify at-risk customers
7. **AI Chatbot**: Customer support automation
8. **Quality Control**: Image analysis for quality assurance

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Guidelines

- Use TypeScript strictly (no `any` types)
- Follow SOLID principles
- Write tests for all business logic
- Use conventional commits
- Document complex logic with comments

## Roadmap

### Phase 1: MVP (3-4 months) ✅
- [x] Repository setup
- [x] Database schema
- [ ] Basic authentication
- [ ] Customer order flow
- [ ] Driver assignment
- [ ] Merchant order management
- [ ] Payment integration

### Phase 2: Enhanced Features (2-3 months)
- [ ] Advanced merchant features
- [ ] Loyalty and referral programs
- [ ] Multi-location support
- [ ] Analytics dashboard

### Phase 3: AI Integration (2-3 months)
- [ ] Fabric detection
- [ ] Demand forecasting
- [ ] Route optimization
- [ ] Dynamic pricing

### Phase 4: Scale (Ongoing)
- [ ] Performance optimization
- [ ] International expansion
- [ ] Advanced AI features
- [ ] IoT integrations

## License

This project is proprietary and confidential.

## Support

For support, email support@dryjets.com or join our Slack channel.

## Acknowledgments

Built with:
- NestJS
- Next.js
- React Native
- Prisma
- Stripe
- OpenAI

---

**DryJets** - Revolutionizing the dry cleaning industry, one pickup at a time.
