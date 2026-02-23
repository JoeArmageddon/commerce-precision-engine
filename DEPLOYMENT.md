# Commerce Precision Engine - Deployment Guide

## Overview

This guide covers deploying the Commerce Precision Engine (Alpha) for production use.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│   PostgreSQL    │
│   (Vercel)      │     │   (Railway/Render)│     │   (Supabase)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   AI Providers   │
                        │  Gemini / Groq   │
                        └──────────────────┘
```

## Prerequisites

- Node.js 18+ (for frontend build)
- Python 3.11+ (for backend)
- PostgreSQL 14+ database
- API keys for AI providers (optional - users can bring their own)

## Frontend Deployment (Vercel)

### 1. Environment Variables

Create a `.env.production` file:

```env
VITE_API_URL=https://your-backend-url.com
```

### 2. Build Configuration

The `vercel.json` is already configured:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ]
}
```

### 3. Deploy Steps

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Backend Deployment (Railway/Render)

### 1. Environment Variables

Create a `.env` file for production:

```env
# Database (Supabase PostgreSQL recommended)
DATABASE_URL="postgresql+asyncpg://user:password@host:port/database"

# Security
SECRET_KEY="your-256-bit-secret-key-here-min-32-chars"

# AI Providers (Optional - users can use their own keys)
# If not set, app works in "BYOK" (Bring Your Own Key) mode
GEMINI_API_KEY=""
GROQ_API_KEY=""

# CORS
FRONTEND_URL="https://your-frontend.vercel.app"

# App Settings
DEBUG="false"
MAX_LLM_TIMEOUT="120"
MAX_RETRIES="2"
```

### 2. Database Setup

#### Option A: Supabase (Recommended)

1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Run migrations:

```bash
cd backend
prisma migrate deploy
```

#### Option B: Self-hosted PostgreSQL

```bash
# Create database
createdb commerce_engine

# Run migrations
prisma migrate deploy
```

### 3. Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### 4. Deploy to Render

1. Create a new Web Service
2. Connect your GitHub repo
3. Set build command: `pip install -r requirements.txt && prisma generate`
4. Set start command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

## Backend Deployment Files

### railway.toml (for Railway)

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### render.yaml (for Render)

```yaml
services:
  - type: web
    name: commerce-engine-api
    runtime: python
    buildCommand: pip install -r requirements.txt && prisma generate
    startCommand: uvicorn src.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SECRET_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: GROQ_API_KEY
        sync: false
      - key: FRONTEND_URL
        value: https://your-frontend.vercel.app
      - key: DEBUG
        value: false
```

## Docker Deployment (Alternative)

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Generate Prisma client
RUN prisma generate

# Expose port
EXPOSE 8000

# Start command
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/commerce
      - SECRET_KEY=your-secret-key
      - FRONTEND_URL=http://localhost:5173
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=commerce
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## File Storage (for Syllabus & Study Materials)

### Option A: Supabase Storage (Recommended)

1. Enable Storage in Supabase Dashboard
2. Create buckets: `syllabi`, `study-materials`
3. Set RLS policies for authenticated users

### Option B: AWS S3

```bash
# Set environment variables
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=commerce-engine
AWS_REGION=us-east-1
```

### Option C: Local Storage (Development only)

Files stored in `./uploads` directory.

## AI Provider Setup

### Google Gemini (Free Tier)

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Free tier: 60 requests/minute
4. Add to environment: `GEMINI_API_KEY`

### Groq (Alternative)

1. Sign up at [groq.com](https://groq.com)
2. Get API key from console
3. Add to environment: `GROQ_API_KEY`

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] CORS origins set correctly
- [ ] Health check endpoint responding
- [ ] API documentation accessible at `/docs`
- [ ] File upload size limits configured
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting configured

## BYOK (Bring Your Own Key) Mode

The app can run without provider API keys - users add their own keys in Settings:

1. Set `GEMINI_API_KEY=` and `GROQ_API_KEY=` empty in backend
2. Frontend will show API key input in Settings
3. Keys stored in browser localStorage only
4. Frontend calls AI APIs directly (no backend proxy)

## Monitoring & Logging

### Recommended Tools

- **Uptime**: UptimeRobot or Pingdom
- **Error Tracking**: Sentry
- **Analytics**: Plausible or Google Analytics
- **Logs**: Datadog or Logtail

### Health Check

```bash
curl https://your-api.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "2.0.0"
}
```

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check SSL mode (for Supabase)
DATABASE_URL="postgresql+asyncpg://...?sslmode=require"
```

### AI API Issues

- Check API key validity
- Verify rate limits
- Check provider status page

### CORS Errors

- Ensure `FRONTEND_URL` matches exactly
- Include protocol (https://)
- Check for trailing slashes

## Security Considerations

1. **API Keys**: Never commit to Git
2. **Database**: Use SSL connections
3. **Files**: Validate file types and sizes
4. **Rate Limit**: Implement request throttling
5. **CORS**: Whitelist specific origins only

## Support

For deployment issues:
- Check logs: `railway logs` or Render dashboard
- API docs: `/docs` endpoint
- Health check: `/health` endpoint
