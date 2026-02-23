"""
Authentication API routes.
"""
from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from src.auth import create_access_token, get_current_user
from src.database import get_prisma
from src.models.schemas import LoginRequest, LoginResponse, UserResponse
from src.config import get_settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login with an access code. Creates a new user if the access code doesn't exist.
    """
    prisma = await get_prisma()
    
    # Try to find existing user
    user = await prisma.user.find_unique(
        where={"accessCode": request.access_code}
    )
    
    if user is None:
        # Create new user with this access code
        user = await prisma.user.create(
            data={"accessCode": request.access_code}
        )
    
    # Create JWT token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires,
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            access_code=user.accessCode,
            created_at=user.createdAt,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information."""
    return UserResponse(**current_user)
