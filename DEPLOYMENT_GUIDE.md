# DEPLOYMENT GUIDE: DryJets Marketing Domination Engine

**Last Updated**: 2025-10-28
**Goal**: Deploy all services to production/staging for API and OAuth testing

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Vercel + Railway (RECOMMENDED - Easiest)
- **Frontend (marketing-admin)**: Vercel
- **API (NestJS)**: Railway
- **Database**: Railway PostgreSQL
- **Cost**: ~$5-20/month
- **Setup Time**: 30 minutes

### Option 2: Single Platform - Render
- **Everything on Render**: Web Services + PostgreSQL
- **Cost**: ~$7-25/month
- **Setup Time**: 45 minutes

### Option 3: Self-Hosted VPS (Most Control)
- **Provider**: DigitalOcean, Linode, AWS EC2
- **Cost**: ~$10-50/month
- **Setup Time**: 2-3 hours

---

## ⚡ QUICK START: Vercel + Railway (RECOMMENDED)

This is the fastest path to get everything working with OAuth and APIs.

### Prerequisites

```bash
# Install CLIs
npm install -g vercel
npm install -g @railway/cli

# Login to services
vercel login
railway login
```

---

## 📦 STEP 1: Database Setup (Railway)

### 1.1 Create PostgreSQL Database

```bash
# In your terminal
railway login
cd /Users/husamahmed/DryJets

# Initialize Railway project
railway init

# Add PostgreSQL
railway add postgresql

# Get database URL
railway variables
# Copy the DATABASE_URL value
```

Or via Railway Dashboard:
1. Go to https://railway.app
2. Click "New Project" → "Provision PostgreSQL"
3. Copy the `DATABASE_URL` from Variables tab

### 1.2 Run Migrations

```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="postgresql://user:pass@host:port/database"

# Run migrations
cd packages/database
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Optional: Seed data
npm run seed  # if you have a seed script
```

### 1.3 Verify Database

```bash
# Connect to database
npx prisma studio

# Or use psql
psql $DATABASE_URL
\dt  # List all tables
```

You should see tables like:
- User, Merchant, Driver, Customer
- Order, Payment, Notification
- Campaign, BlogPost, SEOMetric
- And ~50 more tables

---

## 🔧 STEP 2: API Deployment (Railway)

### 2.1 Prepare API for Deployment

**Create `apps/api/Dockerfile`**:

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies
RUN npm install

# Build API
RUN npm run build --workspace=apps/api

# Expose port
EXPOSE 3000

# Start API
CMD ["npm", "run", "start:prod", "--workspace=apps/api"]
```

**Update `apps/api/package.json`**:

```json
{
  "scripts": {
    "start:prod": "node dist/main.js",
    "build": "nest build",
    "prebuild": "prisma generate"
  }
}
```

### 2.2 Deploy to Railway

```bash
# Navigate to API directory
cd apps/api

# Create railway.json config
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

# Deploy
railway up

# Get deployment URL
railway status
# Your API will be at: https://your-app.railway.app
```

### 2.3 Set Environment Variables

In Railway Dashboard or via CLI:

```bash
# Required environment variables
railway variables set ANTHROPIC_API_KEY="sk-ant-xxxxx"
railway variables set JWT_SECRET="your-super-secret-jwt-key-change-this"
railway variables set NODE_ENV="production"

# Database (already set by Railway PostgreSQL)
# DATABASE_URL is automatically provided

# Optional: Email/SMS (if using)
railway variables set SENDGRID_API_KEY="SG.xxxxx"
railway variables set TWILIO_ACCOUNT_SID="ACxxxxx"
railway variables set TWILIO_AUTH_TOKEN="xxxxx"
railway variables set TWILIO_PHONE_NUMBER="+1xxxxxxxxxx"

# Optional: Firebase (for push notifications)
railway variables set FIREBASE_PROJECT_ID="your-project"
railway variables set FIREBASE_PRIVATE_KEY="xxxxx"
railway variables set FIREBASE_CLIENT_EMAIL="xxxxx@xxxxx.iam.gserviceaccount.com"

# Optional: Stripe (for payments)
railway variables set STRIPE_SECRET_KEY="sk_test_xxxxx"
railway variables set STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# CORS - Allow your frontend domain
railway variables set CORS_ORIGINS="https://your-app.vercel.app,http://localhost:3003"
```

### 2.4 Verify API Deployment

```bash
# Get your API URL
API_URL=$(railway status --json | jq -r '.deployments[0].url')

# Test health endpoint
curl $API_URL/health

# Test marketing endpoint
curl $API_URL/api/v1/marketing/campaigns

# Should see: {"message": "Unauthorized"} (expected - no JWT token)
```

---

## 🎨 STEP 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend

**Update `apps/marketing-admin/.env.production`**:

```bash
# Create production env file
cat > apps/marketing-admin/.env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api/v1
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
EOF
```

### 3.2 Deploy to Vercel

```bash
# Navigate to frontend
cd /Users/husamahmed/DryJets/apps/marketing-admin

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: dryjets-marketing-admin
# - Directory: ./ (current)
# - Build command: npm run build
# - Output directory: .next

# Deploy to production
vercel --prod
```

### 3.3 Configure Environment Variables in Vercel

**Via Vercel Dashboard**:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:

```
NEXT_PUBLIC_API_URL = https://your-api.railway.app/api/v1
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

**Via CLI**:

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Paste: https://your-api.railway.app/api/v1

vercel env add NEXT_PUBLIC_APP_URL production
# Paste: https://your-app.vercel.app
```

### 3.4 Redeploy with Environment Variables

```bash
vercel --prod
```

---

## 🔐 STEP 4: OAuth Setup

### 4.1 Google OAuth (Most Common)

**Create OAuth Credentials**:
1. Go to https://console.cloud.google.com
2. Create new project: "DryJets"
3. Enable APIs:
   - Google+ API
   - Gmail API (if sending emails)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   ```
   http://localhost:3003/auth/google/callback
   https://your-app.vercel.app/auth/google/callback
   https://your-api.railway.app/auth/google/callback
   ```
7. Copy Client ID and Client Secret

**Add to Railway (API)**:

```bash
railway variables set GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
railway variables set GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
railway variables set GOOGLE_CALLBACK_URL="https://your-api.railway.app/auth/google/callback"
```

**Add to Vercel (Frontend)**:

```bash
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID production
# Paste your Google Client ID
```

### 4.2 GitHub OAuth

**Create OAuth App**:
1. Go to https://github.com/settings/developers
2. "New OAuth App"
3. Application name: "DryJets Marketing"
4. Homepage URL: `https://your-app.vercel.app`
5. Authorization callback URL: `https://your-api.railway.app/auth/github/callback`
6. Copy Client ID and Client Secret

**Add to Railway**:

```bash
railway variables set GITHUB_CLIENT_ID="xxxxx"
railway variables set GITHUB_CLIENT_SECRET="xxxxx"
railway variables set GITHUB_CALLBACK_URL="https://your-api.railway.app/auth/github/callback"
```

### 4.3 Update API CORS

**In `apps/api/src/main.ts`**, ensure CORS is configured:

```typescript
// apps/api/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3003',
      'https://your-app.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT || 3000);
}
```

**Redeploy API**:

```bash
cd apps/api
git add .
git commit -m "Update CORS configuration"
railway up
```

---

## 🧪 STEP 5: Test Everything

### 5.1 Test API Endpoints

```bash
# Set your API URL
export API_URL="https://your-api.railway.app/api/v1"

# Health check
curl $API_URL/health

# Test blog generation (requires auth)
# First, get a JWT token by logging in through the frontend

# Test with token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  $API_URL/marketing/campaigns
```

### 5.2 Test OAuth Flow

1. Open frontend: `https://your-app.vercel.app`
2. Click "Login with Google"
3. Should redirect to Google
4. After authorization, should redirect back to your app
5. Check if JWT token is stored in cookies

**Debug OAuth Issues**:

```bash
# Check Railway logs
railway logs

# Check browser console
# Open DevTools → Network → Filter: "auth"
```

### 5.3 Test Blog Generation

1. Login to frontend
2. Go to `/blogs/generate`
3. Fill form:
   - Theme: "Local SEO"
   - City: "Ottawa"
   - Focus: "Test deployment"
4. Click "Generate Blog Post"
5. Should see generated blog in 15-30 seconds

**If it fails**:

```bash
# Check API logs
railway logs --follow

# Check if ANTHROPIC_API_KEY is set
railway variables | grep ANTHROPIC

# Test API directly
curl -X POST $API_URL/marketing/blog/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme":"local_seo","city":"Ottawa"}'
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Cannot connect to database"

**Solution**:

```bash
# Verify DATABASE_URL is set
railway variables | grep DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Run migrations again
cd packages/database
npx prisma migrate deploy
```

### Issue 2: "CORS error" in browser

**Solution**:

1. Check API logs: `railway logs`
2. Verify CORS configuration in `main.ts`
3. Add Vercel URL to `CORS_ORIGINS`:

```bash
railway variables set CORS_ORIGINS="https://your-app.vercel.app,http://localhost:3003"
```

4. Redeploy: `railway up`

### Issue 3: "Anthropic API error"

**Solution**:

```bash
# Verify API key is set
railway variables | grep ANTHROPIC_API_KEY

# Test API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_ANTHROPIC_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
```

### Issue 4: "OAuth redirect URI mismatch"

**Solution**:

1. Go to OAuth provider console (Google, GitHub)
2. Update redirect URIs to match your deployed URLs:
   - `https://your-api.railway.app/auth/google/callback`
   - `https://your-app.vercel.app/auth/google/callback`
3. Wait 5-10 minutes for changes to propagate

### Issue 5: Build fails on Vercel

**Solution**:

```bash
# Check build logs in Vercel dashboard

# Common fixes:
# 1. Install missing dependencies
cd apps/marketing-admin
npm install

# 2. Fix TypeScript errors
npm run type-check

# 3. Ensure environment variables are set
vercel env ls

# 4. Test build locally
npm run build
```

---

## 📊 MONITORING & LOGS

### Railway Logs

```bash
# Follow logs in real-time
railway logs --follow

# Filter by keyword
railway logs --follow | grep "ERROR"

# Download logs
railway logs > api-logs.txt
```

### Vercel Logs

```bash
# View logs
vercel logs

# Follow logs
vercel logs --follow

# View specific deployment
vercel logs <deployment-url>
```

### Database Monitoring

```bash
# Connect to database
railway connect postgresql

# Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

---

## 💰 COST ESTIMATE

### Railway (API + Database)
- **Starter Plan**: $5/month
  - 512MB RAM
  - 1GB Storage
  - Shared CPU
  - Perfect for testing

- **Developer Plan**: $10/month
  - 1GB RAM
  - 5GB Storage
  - More resources

### Vercel (Frontend)
- **Hobby**: $0/month (100GB bandwidth)
- **Pro**: $20/month (1TB bandwidth)

### External APIs
- **Anthropic Claude**: ~$5-20/month (depends on usage)
- **SendGrid**: $0-15/month
- **Twilio**: Pay as you go

**Total Estimated Cost**: $10-50/month for testing

---

## 🚀 ALTERNATIVE: Deploy Everything to Render

If you prefer a single platform:

```bash
# 1. Create render.yaml
cat > render.yaml << 'EOF'
services:
  # API Service
  - type: web
    name: dryjets-api
    env: node
    buildCommand: npm install && npm run build --workspace=apps/api
    startCommand: npm run start:prod --workspace=apps/api
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: dryjets-db
          property: connectionString
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production

  # Frontend Service
  - type: web
    name: dryjets-frontend
    env: node
    buildCommand: npm install && npm run build --workspace=apps/marketing-admin
    startCommand: npm run start --workspace=apps/marketing-admin
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://dryjets-api.onrender.com/api/v1

databases:
  - name: dryjets-db
    databaseName: dryjets
    user: dryjets
EOF

# 2. Push to GitHub
git add .
git commit -m "Add Render configuration"
git push

# 3. Connect to Render
# - Go to https://render.com
# - New → Blueprint
# - Connect your GitHub repo
# - Render will deploy everything automatically
```

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All environment variables documented
- [ ] Database migrations tested locally
- [ ] API health endpoint working
- [ ] Frontend builds successfully
- [ ] OAuth credentials obtained

### Database
- [ ] PostgreSQL database created
- [ ] `DATABASE_URL` configured
- [ ] Migrations deployed
- [ ] Seed data loaded (optional)
- [ ] Prisma Client generated

### API
- [ ] Deployed to Railway/Render
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Health endpoint accessible
- [ ] Logs viewable

### Frontend
- [ ] Deployed to Vercel
- [ ] `NEXT_PUBLIC_API_URL` set correctly
- [ ] OAuth client IDs configured
- [ ] Build successful
- [ ] Site accessible

### OAuth
- [ ] Google OAuth configured
- [ ] Redirect URIs updated
- [ ] Client ID/Secret set in environment
- [ ] Tested login flow

### Testing
- [ ] API health check passes
- [ ] OAuth login works
- [ ] Blog generation works
- [ ] Database queries work
- [ ] No CORS errors

---

## 🎯 QUICK COMMANDS REFERENCE

```bash
# Deploy API to Railway
cd apps/api && railway up

# Deploy Frontend to Vercel
cd apps/marketing-admin && vercel --prod

# View API logs
railway logs --follow

# View Frontend logs
vercel logs --follow

# Run database migrations
npx prisma migrate deploy

# Connect to database
railway connect postgresql

# Set environment variable (Railway)
railway variables set KEY="value"

# Set environment variable (Vercel)
vercel env add KEY production

# Test API endpoint
curl https://your-api.railway.app/api/v1/health

# Get deployment URLs
railway status
vercel ls
```

---

## 📚 ADDITIONAL RESOURCES

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Deploy**: https://www.prisma.io/docs/guides/deployment
- **NestJS Deploy**: https://docs.nestjs.com/faq/deployment
- **Next.js Deploy**: https://nextjs.org/docs/deployment

---

## 🆘 NEED HELP?

If you encounter issues:

1. **Check logs first**: `railway logs` or `vercel logs`
2. **Verify environment variables**: `railway variables` or `vercel env ls`
3. **Test locally**: Ensure everything works on `localhost` first
4. **Database connection**: Test with `psql $DATABASE_URL`
5. **CORS issues**: Verify frontend URL is in API CORS origins

---

**Created**: 2025-10-28
**Author**: Claude Code
**Status**: Ready for deployment 🚀
