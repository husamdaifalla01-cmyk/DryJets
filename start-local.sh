#!/bin/bash

# DryJets Local Development Startup Script
# This script sets up and starts the DryJets platform on localhost

set -e  # Exit on error

echo "🚀 Starting DryJets Platform..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Docker
echo "📦 Step 1: Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 2: Start Database Services
echo "🐘 Step 2: Starting PostgreSQL and Redis..."
docker-compose up -d
sleep 3  # Wait for services to start
echo -e "${GREEN}✅ Database services started${NC}"
echo ""

# Step 3: Generate Prisma Client
echo "🔧 Step 3: Generating Prisma Client..."
npx prisma generate --schema=packages/database/prisma/schema.prisma > /dev/null 2>&1
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Step 4: Push Database Schema
echo "📊 Step 4: Setting up database schema..."
npx prisma db push --schema=packages/database/prisma/schema.prisma > /dev/null 2>&1
echo -e "${GREEN}✅ Database schema updated${NC}"
echo ""

# Step 5: Check for existing processes
echo "🔍 Step 5: Checking for existing processes..."

# Check port 4000 (API)
if lsof -ti:4000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 4000 is in use. Killing existing process...${NC}"
    kill -9 $(lsof -ti:4000) 2>/dev/null || true
    sleep 1
fi

# Check port 3004 (Marketing Admin)
if lsof -ti:3004 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3004 is in use. Killing existing process...${NC}"
    kill -9 $(lsof -ti:3004) 2>/dev/null || true
    sleep 1
fi

echo -e "${GREEN}✅ Ports cleared${NC}"
echo ""

# Step 6: Start Development Servers
echo "🌐 Step 6: Starting development servers..."
echo ""
echo -e "${GREEN}Starting servers in background...${NC}"
echo ""

# Start API in background
cd apps/api
npm run dev > ../../api.log 2>&1 &
API_PID=$!
cd ../..

# Start Marketing Admin in background
cd apps/marketing-admin
npm run dev > ../../marketing-admin.log 2>&1 &
ADMIN_PID=$!
cd ../..

# Wait for servers to start
echo "⏳ Waiting for servers to start (this may take 30-60 seconds)..."
sleep 10

# Check if servers are running
if ! ps -p $API_PID > /dev/null 2>&1; then
    echo -e "${RED}❌ API server failed to start. Check api.log for details${NC}"
    cat api.log
    exit 1
fi

if ! ps -p $ADMIN_PID > /dev/null 2>&1; then
    echo -e "${RED}❌ Marketing Admin failed to start. Check marketing-admin.log for details${NC}"
    cat marketing-admin.log
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All servers started successfully!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 DryJets Platform is now running!"
echo ""
echo "📱 Applications:"
echo "   • Marketing Admin:  http://localhost:3004"
echo "   • API Backend:      http://localhost:4000"
echo ""
echo "🔑 Key URLs:"
echo "   • Optimization Dashboard:  http://localhost:3004/offer-lab/optimization"
echo "   • Budget Optimizer:        http://localhost:3004/offer-lab/optimization/budget"
echo ""
echo "📊 API Endpoints:"
echo "   • Dashboard Overview:      GET  http://localhost:4000/api/offer-lab/optimization/dashboard/overview"
echo "   • Budget Optimization:     POST http://localhost:4000/api/offer-lab/optimization/budget/optimize"
echo "   • ROI Predictions:         GET  http://localhost:4000/api/offer-lab/optimization/roi/predict/all"
echo ""
echo "📝 Logs:"
echo "   • API logs:           tail -f api.log"
echo "   • Marketing Admin:    tail -f marketing-admin.log"
echo ""
echo "🛑 To stop the servers:"
echo "   kill $API_PID $ADMIN_PID"
echo "   OR run: ./stop-local.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Save PIDs to file for stop script
echo "$API_PID" > .api.pid
echo "$ADMIN_PID" > .admin.pid

# Keep script running and show logs
echo "Showing combined logs (Ctrl+C to stop viewing, servers will keep running):"
echo ""
tail -f api.log marketing-admin.log
