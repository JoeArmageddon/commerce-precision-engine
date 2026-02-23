"""
API v1 router aggregation.
"""
from fastapi import APIRouter
from src.api.v1 import auth, subjects, questions, chapter_research

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(subjects.router)
router.include_router(questions.router)
router.include_router(chapter_research.router)
