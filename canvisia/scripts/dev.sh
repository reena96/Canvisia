#!/bin/bash

# Add Java to PATH
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Canvisia Development Environment...${NC}"

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
  pkill -P $$ 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

# Check and kill existing Firebase emulators and dev servers
echo -e "${YELLOW}🧹 Checking for existing processes...${NC}"
if pgrep -f "firebase.*emulators" > /dev/null; then
  echo -e "${YELLOW}   Stopping existing Firebase emulators...${NC}"
  pkill -f "firebase.*emulators"
  sleep 2
fi

if pgrep -f "vite" > /dev/null; then
  echo -e "${YELLOW}   Stopping existing Vite dev server...${NC}"
  pkill -f "vite"
  sleep 1
fi

echo -e "${GREEN}✅ Ready to start fresh!${NC}"
echo ""

# Start Firebase Emulators
echo -e "${BLUE}🔥 Starting Firebase Emulators...${NC}"
firebase emulators:start &
FIREBASE_PID=$!

# Wait for emulators to be ready
echo -e "${YELLOW}⏳ Waiting for emulators to initialize...${NC}"
sleep 8

# Check if emulators started successfully
if ! kill -0 $FIREBASE_PID 2>/dev/null; then
  echo -e "${RED}❌ Firebase emulators failed to start${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Firebase Emulators ready!${NC}"
echo -e "   📊 Emulator UI: ${BLUE}http://localhost:4000${NC}"
echo -e "   🔥 Firestore:   ${BLUE}localhost:8080${NC}"
echo -e "   💾 RTDB:        ${BLUE}localhost:9000${NC}"
echo -e "   🔐 Auth:        ${BLUE}localhost:9099${NC}"
echo ""

# Seed test users
echo -e "${BLUE}👥 Seeding test users (Alice, Bob, Charlie)...${NC}"
npm run seed-users > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Test users ready!${NC}"
else
  echo -e "${YELLOW}⚠️  Warning: Failed to seed users (you may need to sign in with Google)${NC}"
fi
echo ""

# Start dev server
echo -e "${BLUE}⚡ Starting Vite dev server...${NC}"
npm run dev &
DEV_PID=$!

# Wait for dev server to be ready
sleep 3

echo -e "${GREEN}✅ Dev server ready!${NC}"
echo -e "   🌐 App: ${BLUE}http://localhost:5173${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Development environment is running! ✨${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop all services"
echo ""

# Wait for processes
wait
