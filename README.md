# DryJets Platform

> **Comprehensive Dry Cleaning & Laundry Marketplace Platform**

DryJets is a three-sided marketplace platform connecting customers, drivers, and merchants (laundromats/dry cleaners) for on-demand and scheduled laundry services - like Uber Eats for dry cleaning.

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

### Backend
- **API**: NestJS (Node.js) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Search**: Elasticsearch
- **Real-time**: Socket.io
- **Queue**: BullMQ

### Infrastructure
- **Monorepo**: Turborepo
- **Containerization**: Docker
- **Cloud**: AWS/GCP (configurable)

### Third-Party Services
- **Payments**: Stripe Connect
- **Maps**: Google Maps / Mapbox
- **SMS**: Twilio
- **Email**: SendGrid
- **AI**: OpenAI GPT-4
- **Storage**: AWS S3 / Cloudflare R2

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
- **PostgreSQL** 16.x
- **Redis** 7.x
- **Docker** (optional but recommended)

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

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the database services**

```bash
cd infrastructure/docker
docker-compose up -d postgres redis elasticsearch
```

5. **Run database migrations**

```bash
cd packages/database
npm run db:migrate
```

6. **Generate Prisma client**

```bash
npm run db:generate
```

7. **Start the development servers**

```bash
# Start all apps in development mode
npm run dev

# Or start specific apps:
npm run dev --workspace=@dryjets/api
npm run dev --workspace=@dryjets/web-merchant
npm run dev --workspace=@dryjets/mobile-customer
npm run dev --workspace=@dryjets/mobile-driver
```

### Accessing the Applications

- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs
- **Merchant Portal**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3002
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

Use Docker Compose for a complete development environment:

```bash
cd infrastructure/docker
docker-compose up
```

This starts:
- PostgreSQL database
- Redis cache
- Elasticsearch
- Backend API
- Merchant Portal

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

API documentation is automatically generated using Swagger/OpenAPI and is available at:

```
http://localhost:3000/api/docs
```

## Architecture

### Backend Architecture

The backend follows a modular NestJS architecture:

```
apps/api/src/
├── modules/
│   ├── auth/           # Authentication & authorization
│   ├── users/          # User management
│   ├── orders/         # Order processing
│   ├── merchants/      # Merchant operations
│   ├── drivers/        # Driver operations
│   ├── payments/       # Payment processing
│   ├── notifications/  # Push/SMS/Email notifications
│   └── analytics/      # Analytics & reporting
├── common/
│   ├── guards/         # Auth guards
│   ├── interceptors/   # HTTP interceptors
│   ├── filters/        # Exception filters
│   └── decorators/     # Custom decorators
└── config/             # Configuration modules
```

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

## 📚 Documentation

Comprehensive documentation is organized in the [`docs/`](./docs/) directory:

- **[Getting Started Guide](./GETTING_STARTED.md)** - Quick setup and installation
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute to the project
- **[Documentation Index](./docs/README.md)** - Full documentation navigation

### Quick Links:
- [Architecture Overview](./docs/02-architecture/project-overview.md)
- [Mobile Customer App](./docs/03-mobile-customer/)
- [Merchant Portal](./docs/04-merchant-portal/)
- [Backend API](./docs/05-backend-api/)
- [Feature Guides](./docs/06-features/)
- [Project Status](./docs/07-project-status/)

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
