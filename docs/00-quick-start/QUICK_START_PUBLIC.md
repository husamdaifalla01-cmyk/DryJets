# DryJets Consumer App - Quick Start (Public Demo)

## ⚡ Get Started in 2 Minutes

### 1. Setup Environment (30 seconds)

```bash
cd /Users/husamahmed/DryJets/apps/web-customer
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### 2. Start the App (30 seconds)

```bash
npm run dev
```

### 3. Access Instantly (0 seconds)

Open browser: **http://localhost:3003**

✅ **No login required!** You'll see the dashboard immediately.

---

## 🎯 What You Can Do

- ✅ View dashboard with order stats
- ✅ Create new orders (4-step wizard)
- ✅ View all orders with filters
- ✅ Search and filter orders by status
- ✅ Navigate all pages freely

**All as "Guest User" - no authentication needed!**

---

## 📁 Project Structure

```
apps/web-customer/
├── src/
│   ├── app/
│   │   ├── dashboard/page.tsx     # Main dashboard
│   │   ├── orders/new/page.tsx    # Create order
│   │   └── orders/page.tsx        # Orders list
│   └── server/routers/            # API routes (public)
└── .env.local                     # Your config
```

---

## 🔧 Commands

```bash
npm run dev         # Start dev server
npm run build       # Build production
npm run type-check  # Verify types
```

---

## ⚠️ Important Notes

### This is a Public Demo
- All users share the **same demo account**
- All data is **visible to everyone**
- Perfect for **demos and prototypes**
- **NOT for production** with real customer data

### Demo Account IDs
- Customer: `demo-customer-001`
- User: `demo-user-001`

---

## 🚀 What's Different from Authenticated Version

### Before (With Auth)
- Required Google OAuth or email/password
- Sign-in page required
- Each user had separate account
- Session management

### Now (Public)
- **No authentication** required
- **Instant access** to all features
- Everyone uses **demo account**
- No session management

---

## 📖 Full Documentation

- **Public Access Details**: [CONSUMER_APP_PUBLIC_ACCESS.md](CONSUMER_APP_PUBLIC_ACCESS.md)
- **Complete Features**: [CONSUMER_WEB_APP_COMPLETE.md](CONSUMER_WEB_APP_COMPLETE.md)

---

## 🎯 Perfect For

- ✅ Demonstrations to clients
- ✅ Prototyping new features
- ✅ User testing and feedback
- ✅ Development and debugging
- ✅ Screenshots and marketing
- ❌ Production deployment

---

**Ready to go!** Just run `npm run dev` and open http://localhost:3003
