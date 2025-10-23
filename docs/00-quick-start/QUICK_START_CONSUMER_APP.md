# DryJets Consumer Web App - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Environment Setup (1 minute)

```bash
cd /Users/husamahmed/DryJets/apps/web-customer
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=$(openssl rand -base64 32)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### 2. Install Dependencies (1 minute)

```bash
npm install
```

### 3. Start Development Server (30 seconds)

```bash
npm run dev
```

Application runs at: **http://localhost:3003**

### 4. Test the App (2 minutes)

1. Open browser: http://localhost:3003
2. You'll see sign-in page
3. Click "Continue with Google" (or use email/password)
4. After auth, you'll see the dashboard
5. Click "Create New Order" to test order flow

---

## ✅ What You Can Do Now

### User Features
- ✅ Sign in with Google OAuth
- ✅ Sign in with Email/Password
- ✅ View dashboard with order stats
- ✅ Create new orders (4-step wizard)
- ✅ View all orders with filtering
- ✅ Filter orders by status
- ✅ Navigate protected routes

### Developer Features
- ✅ Type-safe API calls with tRPC
- ✅ Hot reload on code changes
- ✅ TypeScript autocomplete everywhere
- ✅ React Query caching
- ✅ Protected routes with authentication

---

## 📁 Key Files to Know

```
apps/web-customer/
├── src/app/
│   ├── dashboard/page.tsx        # Main dashboard
│   ├── orders/new/page.tsx       # Order creation wizard
│   ├── orders/page.tsx           # Orders list
│   └── auth/signin/page.tsx      # Sign-in page
├── src/server/
│   └── routers/                  # tRPC API routes
├── src/lib/
│   ├── auth/config.ts            # NextAuth setup
│   └── trpc/                     # tRPC client
└── .env.local                    # Your config (create this!)
```

---

## 🔧 Commands

```bash
# Development
npm run dev          # Start dev server (port 3003)
npm run build        # Build for production
npm run start        # Start production server

# Quality Checks
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation (0 errors!)
```

---

## 🐛 Common Issues

### "Unauthorized" error
**Fix:** Sign out and sign in again

### Google OAuth not working
**Fix:**
1. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local
2. Ensure redirect URI in Google Console: `http://localhost:3003/api/auth/callback/google`

### Orders not loading
**Fix:** Ensure backend API is running on http://localhost:3000

### Port 3003 already in use
**Fix:** Kill the process using port 3003 or change port in package.json

---

## 📖 Full Documentation

See [CONSUMER_WEB_APP_COMPLETE.md](/Users/husamahmed/DryJets/CONSUMER_WEB_APP_COMPLETE.md) for:
- Complete feature list
- Architecture details
- Troubleshooting guide
- Deployment instructions

---

## 🎯 Next Steps

Once you have the app running locally:

1. **Test all features:**
   - Sign in/out
   - Create test order
   - View orders list
   - Test filters

2. **Customize:**
   - Update branding in layout.tsx
   - Modify colors in tailwind.config.js
   - Add your logo

3. **Extend:**
   - Add order details page
   - Implement real-time tracking
   - Add payment integration
   - Build additional features

---

**Ready to go! 🚀**

If you encounter any issues, check the full documentation or verify your environment setup.
