"""
FastAPI main application with CORS and lifespan management.
"""
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_settings
from src.database import get_prisma, disconnect_prisma
from src.api.v1 import router as api_v1_router
from src.models.schemas import HealthCheckResponse

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - handles startup and shutdown."""
    # Startup
    print("🚀 Starting up...")
    await get_prisma()
    print("✅ Database connected")
    yield
    # Shutdown
    print("🛑 Shutting down...")
    await disconnect_prisma()
    print("✅ Database disconnected")


app = FastAPI(
    title="Commerce Precision Engine v2.0",
    description="CBSE Class 12 Commerce AI Answer Engine with 4-layer verification",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint for Railway deployment."""
    return HealthCheckResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="2.0.0",
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Commerce Precision Engine v2.0",
        "version": "2.0.0",
        "description": "CBSE Class 12 Commerce AI Answer Engine",
        "docs": "/docs",
    }


# Include API routes
app.include_router(api_v1_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
