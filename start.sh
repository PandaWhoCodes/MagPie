#!/bin/bash

# MagPie Event Registration Platform - Startup Script
# Starts both backend (FastAPI) and frontend (React + Vite) servers concurrently

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Print header
echo ""
print_message "$BLUE" "╔════════════════════════════════════════════════════════════╗"
print_message "$BLUE" "║       MagPie Event Registration Platform - Startup        ║"
print_message "$BLUE" "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if backend virtual environment exists
if [ ! -d "backend/venv" ]; then
    print_message "$RED" "❌ Backend virtual environment not found!"
    print_message "$YELLOW" "   Please run: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    print_message "$RED" "❌ Frontend dependencies not installed!"
    print_message "$YELLOW" "   Please run: cd frontend && npm install"
    exit 1
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    print_message "$YELLOW" "⚠️  Warning: backend/.env file not found!"
    print_message "$YELLOW" "   Some features may not work without environment variables."
    echo ""
fi

if [ ! -f "frontend/.env" ]; then
    print_message "$YELLOW" "⚠️  Warning: frontend/.env file not found!"
    print_message "$YELLOW" "   Frontend will use default configuration."
    echo ""
fi

print_message "$GREEN" "✓ Pre-flight checks passed"
echo ""

# Function to cleanup on exit
cleanup() {
    print_message "$YELLOW" "\n\n🛑 Shutting down servers..."
    kill 0  # Kill all processes in the process group
    exit 0
}

# Trap CTRL+C and cleanup
trap cleanup SIGINT SIGTERM

print_message "$BLUE" "🚀 Starting servers..."
echo ""

# Start backend in background
print_message "$GREEN" "📦 Starting Backend (FastAPI)..."
print_message "$BLUE" "   → http://0.0.0.0:8000"
print_message "$BLUE" "   → API Docs: http://0.0.0.0:8000/docs"
(
    cd backend
    source venv/bin/activate
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 2>&1 | while IFS= read -r line; do
        echo "[BACKEND] $line"
    done
) &

BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in background
print_message "$GREEN" "⚛️  Starting Frontend (React + Vite)..."
print_message "$BLUE" "   → http://localhost:3000"
(
    cd frontend
    npm run dev 2>&1 | while IFS= read -r line; do
        echo "[FRONTEND] $line"
    done
) &

FRONTEND_PID=$!

echo ""
print_message "$GREEN" "════════════════════════════════════════════════════════════"
print_message "$GREEN" "✓ Both servers are starting up..."
print_message "$GREEN" "════════════════════════════════════════════════════════════"
echo ""
print_message "$BLUE" "📱 Frontend:  http://localhost:3000"
print_message "$BLUE" "🔧 Backend:   http://0.0.0.0:8000"
print_message "$BLUE" "📚 API Docs:  http://0.0.0.0:8000/docs"
echo ""
print_message "$YELLOW" "Press CTRL+C to stop both servers"
echo ""

# Wait for both processes
wait
