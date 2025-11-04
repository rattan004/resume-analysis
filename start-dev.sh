#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting AI Resume Screening Tool...${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Creating .env file...${NC}"
    cp .env.example .env
    echo ""
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Starting servers...${NC}"
echo ""
echo -e "${GREEN}Backend will run on: http://localhost:5000${NC}"
echo -e "${GREEN}Frontend will run on: http://localhost:5173${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"
echo ""

# Start both servers
npm run server:dev &
BACKEND_PID=$!

sleep 2

npm run frontend &
FRONTEND_PID=$!

# Handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

# Wait for both processes
wait
