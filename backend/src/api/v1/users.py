"""
User settings and API key management routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import Optional
from src.auth import get_current_user
from src.database import get_prisma

router = APIRouter(prefix="/users", tags=["Users"])


class ApiKeysRequest(BaseModel):
    """Request model for updating API keys."""
    gemini_key: Optional[str] = Field(None, max_length=255)
    groq_key: Optional[str] = Field(None, max_length=255)
    serpapi_key: Optional[str] = Field(None, max_length=255)


class ApiKeysResponse(BaseModel):
    """Response model for API keys (masked)."""
    has_gemini_key: bool
    has_groq_key: bool
    has_serpapi_key: bool
    message: str


class UserSettingsResponse(BaseModel):
    """User settings response."""
    id: str
    access_code: str
    api_keys: ApiKeysResponse


@router.get("/me/settings", response_model=UserSettingsResponse)
async def get_user_settings(
    current_user: dict = Depends(get_current_user),
):
    """Get current user settings including API key status."""
    prisma = await get_prisma()
    
    # Get user's API keys
    api_keys = await prisma.userapikey.find_unique(
        where={"userId": current_user["id"]}
    )
    
    return UserSettingsResponse(
        id=current_user["id"],
        access_code=current_user["access_code"],
        api_keys=ApiKeysResponse(
            has_gemini_key=bool(api_keys and api_keys.geminiKey),
            has_groq_key=bool(api_keys and api_keys.groqKey),
            has_serpapi_key=bool(api_keys and api_keys.serpapiKey),
            message="Use PUT /users/me/api-keys to update your keys",
        ),
    )


@router.get("/me/api-keys", response_model=ApiKeysResponse)
async def get_api_keys_status(
    current_user: dict = Depends(get_current_user),
):
    """Get API keys status (without revealing the actual keys)."""
    prisma = await get_prisma()
    
    api_keys = await prisma.userapikey.find_unique(
        where={"userId": current_user["id"]}
    )
    
    return ApiKeysResponse(
        has_gemini_key=bool(api_keys and api_keys.geminiKey),
        has_groq_key=bool(api_keys and api_keys.groqKey),
        has_serpapi_key=bool(api_keys and api_keys.serpapiKey),
        message="Your API keys are securely stored",
    )


@router.put("/me/api-keys", response_model=ApiKeysResponse)
async def update_api_keys(
    request: ApiKeysRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Update user's personal API keys.
    
    These keys will be used for:
    - gemini_key: AI answer generation (primary)
    - groq_key: AI answer generation (fallback)
    - serpapi_key: Web search for chapter research
    
    Set a key to empty string "" to remove it.
    """
    prisma = await get_prisma()
    
    # Build update data
    update_data = {}
    if request.gemini_key is not None:
        update_data["geminiKey"] = request.gemini_key if request.gemini_key else None
    if request.groq_key is not None:
        update_data["groqKey"] = request.groq_key if request.groq_key else None
    if request.serpapi_key is not None:
        update_data["serpapiKey"] = request.serpapi_key if request.serpapi_key else None
    
    # Upsert the API keys record
    api_keys = await prisma.userapikey.upsert(
        where={"userId": current_user["id"]},
        data={
            "create": {
                "userId": current_user["id"],
                **update_data,
            },
            "update": update_data,
        },
    )
    
    return ApiKeysResponse(
        has_gemini_key=bool(api_keys.geminiKey),
        has_groq_key=bool(api_keys.groqKey),
        has_serpapi_key=bool(api_keys.serpapiKey),
        message="API keys updated successfully",
    )


@router.delete("/me/api-keys", response_model=ApiKeysResponse)
async def delete_all_api_keys(
    current_user: dict = Depends(get_current_user),
):
    """Delete all user API keys."""
    prisma = await get_prisma()
    
    await prisma.userapikey.delete_many(
        where={"userId": current_user["id"]}
    )
    
    return ApiKeysResponse(
        has_gemini_key=False,
        has_groq_key=False,
        has_serpapi_key=False,
        message="All API keys deleted",
    )
