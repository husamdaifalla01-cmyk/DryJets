# Local Deployment Guide

## Quick Start Guide for DryJets Platform

This guide will help you deploy the DryJets platform to localhost for development and testing.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Docker Desktop** (for PostgreSQL and Redis)
- **npm** (comes with Node.js)

---

## Step 1: Start Docker Services

The platform requires PostgreSQL and Redis. Start them using Docker Compose:

```bash
# Make sure Docker Desktop is running first
docker-compose up -d
```

This will start:
- PostgreSQL database on `localhost:5432`
- Redis on `localhost:6379`

**Verify services are running:**
```bash
docker-compose ps
```

---

## Step 2: Install Dependencies

All dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

---

## Step 3: Setup Database

### Generate Prisma Client
```bash
npx prisma generate --schema=packages/database/prisma/schema.prisma
```

### Push Schema to Database
```bash
npx prisma db push --schema=packages/database/prisma/schema.prisma
```

This creates all database tables including:
- Marketing Engine tables
- Offer-Lab tables (offers, campaigns, traffic connections)
- Optimization tables (TrafficQualityScore, ScalingEvent, ABTest, TestVariant)

### (Optional) Seed Database with Test Data
```bash
npm run seed
```

---

## Step 4: Start Development Servers

You can start all services at once or individually:

### Option A: Start All Services (Recommended)
```bash
npm run dev
```

This starts:
- API Backend (port 4000)
- Marketing Admin (port 3004)
- Other apps in the monorepo

### Option B: Start Services Individually

**Terminal 1 - API Backend:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Marketing Admin UI:**
```bash
cd apps/marketing-admin
npm run dev
```

---

## Step 5: Access the Applications

Once the servers are running:

### Marketing Admin Dashboard
**URL:** http://localhost:3004

**Key Pages:**
- Dashboard: http://localhost:3004
- Offer-Lab: http://localhost:3004/offer-lab
- Optimization Dashboard: http://localhost:3004/offer-lab/optimization
- Budget Optimization: http://localhost:3004/offer-lab/optimization/budget

### API Backend
**URL:** http://localhost:4000

**Swagger API Docs:** http://localhost:4000/api-docs (if configured)

**Health Check:**
```bash
curl http://localhost:4000/health
```

---

## API Endpoints Reference

### Optimization API Base URL
`http://localhost:4000/api/offer-lab/optimization`

### Key Endpoints

**Dashboard Overview:**
```
GET /dashboard/overview
```

**Budget Optimization:**
```
POST /budget/optimize
POST /budget/apply-recommendations
POST /budget/rebalance
GET  /budget/rebalance/preview
```

**ROI Prediction:**
```
GET /roi/predict/:campaignId
GET /roi/predict/all
GET /roi/portfolio
```

**Funnel Analysis:**
```
GET /funnel/analyze/:campaignId
GET /funnel/needs-attention
GET /funnel/top-performers
```

**Traffic Quality:**
```
GET /traffic-quality/:connectionId
GET /traffic-quality/blacklisted/all
POST /traffic-quality/:connectionId/blacklist
```

**Fraud Detection:**
```
GET /fraud/analyze/:connectionId
GET /fraud/alerts/all
POST /fraud/auto-pause
```

**A/B Testing:**
```
POST /ab-tests
GET  /ab-tests/active
GET  /ab-tests/:testId/performance
POST /ab-tests/:testId/start
POST /ab-tests/:testId/complete
```

**Full API documentation available in:**
`apps/api/src/modules/marketing/controllers/offer-lab-optimization.controller.ts`

---

## Environment Variables

Create a `.env` file in the root directory if it doesn't exist:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dryjets?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key-here

# Offer-Lab Configuration
OFFERLAB_GLOBAL_BUDGET_CAP=300

# External API Keys (optional for development)
MAXBOUNTY_API_KEY=your-key-here
CLICKBANK_API_KEY=your-key-here
POPADS_API_KEY=your-key-here
PROPELLERADS_API_KEY=your-key-here
```

---

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

**For API (port 4000):**
```bash
# Find process using port 4000
lsof -ti:4000

# Kill the process
kill -9 $(lsof -ti:4000)
```

**For Marketing Admin (port 3004):**
```bash
# Find process using port 3004
lsof -ti:3004

# Kill the process
kill -9 $(lsof -ti:3004)
```

### Database Connection Issues

1. Verify Docker is running:
```bash
docker ps
```

2. Check database container logs:
```bash
docker-compose logs postgres
```

3. Test database connection:
```bash
npx prisma db push --schema=packages/database/prisma/schema.prisma
```

### Prisma Client Not Generated

```bash
npx prisma generate --schema=packages/database/prisma/schema.prisma
```

### Build Errors

Clear cache and rebuild:
```bash
npm run clean
npm install
npx prisma generate
npm run dev
```

---

## Development Workflow

### Making Code Changes

The dev servers have hot-reload enabled:
- **API**: Changes auto-restart the server
- **Marketing Admin**: Changes auto-refresh the browser

### Adding New Features

1. Make code changes
2. If database schema changed:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. Server will auto-reload

### Viewing Logs

**API Logs:** Check terminal running `apps/api`

**UI Logs:** Check browser console and terminal running `apps/marketing-admin`

**Database Logs:**
```bash
docker-compose logs -f postgres
```

---

## Testing the Optimization Features

### 1. View Optimization Dashboard
Navigate to: http://localhost:3004/offer-lab/optimization

### 2. Test Budget Optimization
1. Go to: http://localhost:3004/offer-lab/optimization/budget
2. Select strategy (Balanced recommended)
3. Click "Run Optimization"
4. Review recommendations
5. Click "Apply All Recommendations"

### 3. Test API Endpoints

**Get Dashboard Overview:**
```bash
curl http://localhost:4000/api/offer-lab/optimization/dashboard/overview
```

**Optimize Budgets:**
```bash
curl -X POST http://localhost:4000/api/offer-lab/optimization/budget/optimize \
  -H "Content-Type: application/json" \
  -d '{"strategy": "balanced"}'
```

**Get ROI Predictions:**
```bash
curl http://localhost:4000/api/offer-lab/optimization/roi/predict/all
```

---

## Architecture Overview

```
DryJets/
├── apps/
│   ├── api/                    # NestJS Backend (Port 4000)
│   │   └── src/modules/marketing/
│   │       ├── controllers/
│   │       │   └── offer-lab-optimization.controller.ts  # 50+ API endpoints
│   │       └── services/offer-lab/optimization/
│   │           ├── ab-test.service.ts
│   │           ├── budget-optimizer.service.ts
│   │           ├── roi-predictor.service.ts
│   │           ├── funnel-analyzer.service.ts
│   │           └── ... (17 optimization services)
│   │
│   └── marketing-admin/        # Next.js Frontend (Port 3004)
│       └── src/app/offer-lab/optimization/
│           ├── page.tsx        # Main Dashboard
│           └── budget/
│               └── page.tsx    # Budget Optimization Page
│
└── packages/
    └── database/
        └── prisma/
            └── schema.prisma   # Database Schema
```

---

## Production Deployment

For production deployment, see:
- `DEPLOYMENT_GUIDE.md` - Full production setup
- `PRODUCTION_READINESS.md` - Production checklist

---

## Need Help?

- **Documentation:** See `docs/` directory
- **API Reference:** `MARKETING_ENGINE_API_DOCUMENTATION.md`
- **Architecture:** `ARCHITECTURE_MAP.md`
- **Issues:** Create an issue in the repository

---

## Summary

**Quick Start Commands:**
```bash
# 1. Start Docker
docker-compose up -d

# 2. Setup Database
npx prisma generate --schema=packages/database/prisma/schema.prisma
npx prisma db push --schema=packages/database/prisma/schema.prisma

# 3. Start Development Servers
npm run dev

# 4. Open Browser
# Marketing Admin: http://localhost:3004
# API: http://localhost:4000
```

🚀 **You're ready to go!**
