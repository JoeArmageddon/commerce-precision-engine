"""
Subject and Chapter API routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from src.auth import get_current_user
from src.database import get_prisma
from src.models.schemas import SubjectResponse, ChapterResponse

router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.get("", response_model=list[SubjectResponse])
async def get_subjects(current_user: dict = Depends(get_current_user)):
    """Get all subjects."""
    prisma = await get_prisma()
    subjects = await prisma.subject.find_many(order={"createdAt": "asc"})
    return subjects


@router.get("/{subject_id}/chapters", response_model=list[ChapterResponse])
async def get_chapters(
    subject_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get all chapters for a subject."""
    prisma = await get_prisma()
    
    # Verify subject exists
    subject = await prisma.subject.find_unique(where={"id": subject_id})
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )
    
    chapters = await prisma.chapter.find_many(
        where={"subjectId": subject_id},
        order={"displayOrder": "asc"},
    )
    return chapters


@router.post("/seed")
async def seed_subjects(current_user: dict = Depends(get_current_user)):
    """
    Seed the database with CBSE Class 12 Commerce subjects and chapters.
    Idempotent - skips existing subjects.
    """
    import asyncio
    from prisma.seed import seed_database
    
    try:
        await seed_database()
        return {"message": "Database seeded successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to seed database: {str(e)}",
        )
