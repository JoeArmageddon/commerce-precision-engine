"""
Standalone FastAPI application without database for local demo.
"""
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_settings
from src.models.schemas import HealthCheckResponse

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - handles startup and shutdown."""
    print("🚀 Starting up (standalone mode - no database)...")
    print("⚠️  Note: Running in demo mode without database connection")
    yield
    print("🛑 Shutting down...")


app = FastAPI(
    title="Commerce Precision Engine v2.0 (Demo Mode)",
    description="CBSE Class 12 Commerce AI Answer Engine - Running without database",
    version="2.0.0-demo",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint."""
    return HealthCheckResponse(
        status="healthy (demo mode - no database)",
        timestamp=datetime.utcnow(),
        version="2.0.0-demo",
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Commerce Precision Engine v2.0 (Demo Mode)",
        "version": "2.0.0-demo",
        "description": "CBSE Class 12 Commerce AI Answer Engine - Running without database",
        "docs": "/docs",
        "note": "API endpoints requiring database will not work in this mode",
    }


# Demo API routes (without database)
@app.get("/api/v1/subjects")
async def get_subjects():
    """Get list of subjects (demo data)."""
    return {
        "subjects": [
            {"id": "demo-1", "name": "Accountancy", "code": "ACCT", "description": "Financial Accounting and Management Accounting"},
            {"id": "demo-2", "name": "Business Studies", "code": "BST", "description": "Business Organization and Management"},
            {"id": "demo-3", "name": "Economics", "code": "ECO", "description": "Micro and Macro Economics"},
        ]
    }


@app.post("/api/v1/questions/ask")
async def ask_question():
    """Demo question endpoint."""
    return {
        "message": "This is a demo endpoint. To use the full AI question answering feature, please configure a database and AI API keys.",
        "demo_answer": {
            "answer": "The Commerce Precision Engine requires database configuration and AI API keys to function fully.",
            "confidence": 0.95,
            "key_points": ["Configure PostgreSQL database", "Add AI API keys (Gemini/Groq)", "Run prisma db push"],
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main_standalone:app", host="0.0.0.0", port=8000, reload=True)
