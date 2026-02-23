@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up Commerce Precision Engine v2.0...

REM Check prerequisites
echo 📋 Checking prerequisites...

python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed
    exit /b 1
)

echo ✅ Prerequisites met

REM Setup Backend
echo.
echo 🔧 Setting up Backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo ⚠️  Please edit backend/.env with your actual credentials
)

echo ✅ Backend setup complete

REM Setup Frontend
echo.
echo 🔧 Setting up Frontend...
cd ..\frontend

echo Installing Node dependencies...
npm install

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo ⚠️  Please edit frontend/.env if needed
)

echo ✅ Frontend setup complete

cd ..

echo.
echo ✨ Setup complete!
echo.
echo Next steps:
echo 1. Edit backend/.env with your database URL and API keys
echo 2. Run: prisma db push (in backend directory)
echo 3. Run: python prisma/seed.py (in backend directory)
echo 4. Start development servers:
echo    - Backend: cd backend ^&^& uvicorn src.main:app --reload
echo    - Frontend: cd frontend ^&^& npm run dev

pause
