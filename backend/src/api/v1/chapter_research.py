"""
Chapter Research API routes - Production-grade research with verification.
"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Literal
from src.auth import get_current_user
from src.services.chapter_research_service import get_chapter_research_service

router = APIRouter(prefix="/chapter-research", tags=["Chapter Research"])


class ChapterResearchRequest(BaseModel):
    """Request model for chapter research."""
    subject: Literal["Accountancy", "Economics", "Business Studies"] = Field(
        ..., description="Subject name"
    )
    chapter_name: str = Field(
        ..., min_length=3, max_length=200, description="Chapter name to research"
    )


class SubtopicResponse(BaseModel):
    """Subtopic with key points."""
    title: str
    description: str
    key_points: list[str]


class ImportantQuestionResponse(BaseModel):
    """Important question with answer."""
    question: str
    answer: str
    marks: int
    type: Literal["short", "long", "very_long"]


class BoardQuestionResponse(BaseModel):
    """Previous year board question."""
    year: str
    question: str
    marks: int


class VerificationInfo(BaseModel):
    """Verification metadata."""
    status: Literal["verified", "needs_review", "unreliable"]
    confidence_score: float
    syllabus_alignment: float
    completeness: float
    question_authenticity: float


class SourceInfo(BaseModel):
    """Web source information."""
    title: str
    link: str
    source: str


class ChapterResearchResponse(BaseModel):
    """Response model for chapter research."""
    chapter_name: str
    subject: str
    subtopics: list[SubtopicResponse]
    important_questions: list[ImportantQuestionResponse]
    board_questions: list[BoardQuestionResponse]
    quick_notes: list[str]
    mnemonics: list[str] | None
    sources: list[SourceInfo]
    verification: VerificationInfo
    warnings: list[str] | None
    processing_time_ms: int
    generated_at: str


@router.post("/research", response_model=ChapterResearchResponse)
async def research_chapter(
    request: ChapterResearchRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Research a CBSE Class 12 Commerce chapter with 4-layer verification.
    
    This endpoint performs:
    1. Real-time web search for CBSE content
    2. AI extraction and structuring
    3. CBSE syllabus verification
    4. Accuracy auditing
    5. Board question generation
    
    **Note:** This is a computationally expensive operation (15-30 seconds).
    Results are verified for accuracy but students should cross-check with official NCERT.
    """
    service = get_chapter_research_service()
    
    try:
        result = await service.research_chapter(
            subject=request.subject,
            chapter_name=request.chapter_name,
        )
        
        # Check if we got a valid result
        if not result.get("subtopics") and not result.get("important_questions"):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to generate chapter content. Please try again later.",
            )
        
        # Return response matching the schema
        return ChapterResearchResponse(
            chapter_name=result["chapter_name"],
            subject=result["subject"],
            subtopics=[
                SubtopicResponse(
                    title=st["title"],
                    description=st["description"],
                    key_points=st["key_points"],
                )
                for st in result.get("subtopics", [])
            ],
            important_questions=[
                ImportantQuestionResponse(
                    question=q["question"],
                    answer=q["answer"],
                    marks=q["marks"],
                    type=q["type"],
                )
                for q in result.get("important_questions", [])
            ],
            board_questions=[
                BoardQuestionResponse(
                    year=bq["year"],
                    question=bq["question"],
                    marks=bq["marks"],
                )
                for bq in result.get("board_questions", [])
            ],
            quick_notes=result.get("quick_notes", []),
            mnemonics=result.get("mnemonics") if result.get("mnemonics") else None,
            sources=[
                SourceInfo(
                    title=s["title"],
                    link=s["link"],
                    source=s["source"],
                )
                for s in result.get("sources", [])
            ],
            verification=VerificationInfo(
                status=result["verification"]["status"],
                confidence_score=result["verification"]["confidence_score"],
                syllabus_alignment=result["verification"]["syllabus_alignment"],
                completeness=result["verification"]["completeness"],
                question_authenticity=result["verification"]["question_authenticity"],
            ),
            warnings=result.get("warnings"),
            processing_time_ms=result["processing_time_ms"],
            generated_at=result["generated_at"],
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chapter research failed: {str(e)}",
        )


@router.get("/status")
async def research_status(
    current_user: dict = Depends(get_current_user),
):
    """Check if chapter research service is operational."""
    from src.config import get_settings
    
    settings = get_settings()
    
    # Check required configurations
    has_llm = bool(settings.gemini_api_key or settings.groq_api_key)
    has_search = bool(getattr(settings, 'serpapi_key', None))
    
    return {
        "status": "operational" if has_llm else "degraded",
        "llm_available": has_llm,
        "web_search_available": has_search,
        "message": (
            "Full functionality" if has_llm and has_search
            else "Limited functionality - using AI knowledge only" if has_llm
            else "Service unavailable - no AI provider configured"
        ),
    }
