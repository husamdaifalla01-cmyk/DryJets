#!/bin/bash

# DryJets Local Development Stop Script
# This script stops all DryJets services

echo "🛑 Stopping DryJets Platform..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Stop servers using saved PIDs
if [ -f .api.pid ]; then
    API_PID=$(cat .api.pid)
    if ps -p $API_PID > /dev/null 2>&1; then
        echo "Stopping API server (PID: $API_PID)..."
        kill $API_PID 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✅ API server stopped${NC}"
    fi
    rm .api.pid
fi

if [ -f .admin.pid ]; then
    ADMIN_PID=$(cat .admin.pid)
    if ps -p $ADMIN_PID > /dev/null 2>&1; then
        echo "Stopping Marketing Admin (PID: $ADMIN_PID)..."
        kill $ADMIN_PID 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✅ Marketing Admin stopped${NC}"
    fi
    rm .admin.pid
fi

# Fallback: Kill by port
echo "Checking for processes on ports..."

if lsof -ti:4000 > /dev/null 2>&1; then
    echo "Stopping process on port 4000..."
    kill -9 $(lsof -ti:4000) 2>/dev/null || true
fi

if lsof -ti:3004 > /dev/null 2>&1; then
    echo "Stopping process on port 3004..."
    kill -9 $(lsof -ti:3004) 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}✅ All DryJets services stopped${NC}"
echo ""
echo "To stop Docker services:"
echo "  docker-compose down"
echo ""
