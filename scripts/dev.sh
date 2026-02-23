#!/bin/bash

# Start both backend and frontend in development mode

echo "🚀 Starting Commerce Precision Engine in development mode..."

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found. Please run setup.sh first"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "❌ frontend/.env not found. Please run setup.sh first"
    exit 1
fi

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start backend
echo "🔧 Starting Backend on http://localhost:8000..."
cd backend
source venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
echo "🎨 Starting Frontend on http://localhost:5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are running!"
echo "   - Backend:  http://localhost:8000"
echo "   - Frontend: http://localhost:5173"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait
