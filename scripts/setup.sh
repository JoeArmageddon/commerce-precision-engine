#!/bin/bash
set -e

echo "🚀 Setting up Commerce Precision Engine v2.0..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

echo "✅ Prerequisites met"

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your actual credentials"
fi

echo "✅ Backend setup complete"

# Setup Frontend
echo ""
echo "🔧 Setting up Frontend..."
cd ../frontend

echo "Installing Node dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit frontend/.env if needed"
fi

echo "✅ Frontend setup complete"

# Return to root
cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database URL and API keys"
echo "2. Run: prisma db push (in backend directory)"
echo "3. Run: python prisma/seed.py (in backend directory)"
echo "4. Start development servers:"
echo "   - Backend: cd backend && uvicorn src.main:app --reload"
echo "   - Frontend: cd frontend && npm run dev"
