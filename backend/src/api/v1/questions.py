"""
Question and Answer API routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from src.auth import get_current_user
from src.database import get_prisma
from src.services.verification_pipeline import get_verification_pipeline
from src.models.schemas import (
    AskQuestionRequest,
    QuestionResponse,
    QuestionHistoryResponse,
    AnswerResponse,
)

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.post("/ask", response_model=QuestionResponse)
async def ask_question(
    request: AskQuestionRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Ask a question and process it through the 4-layer verification pipeline.
    This is a synchronous operation with timeout handling.
    """
    prisma = await get_prisma()
    pipeline = get_verification_pipeline()
    
    # Verify subject exists
    subject = await prisma.subject.find_unique(
        where={"id": request.subject_id},
        include={"chapters": True},
    )
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )
    
    # Verify chapter if provided
    chapter_name = None
    if request.chapter_id:
        chapter = await prisma.chapter.find_unique(
            where={"id": request.chapter_id}
        )
        if not chapter or chapter.subjectId != request.subject_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chapter not found",
            )
        chapter_name = chapter.name
    
    # Create question record
    question = await prisma.question.create(
        data={
            "userId": current_user["id"],
            "subjectId": request.subject_id,
            "chapterId": request.chapter_id,
            "questionText": request.question_text,
        },
        include={"subject": True, "chapter": True},
    )
    
    try:
        # Process through 4-layer pipeline
        result = await pipeline.process(
            question=request.question_text,
            subject=subject.name,
            chapter=chapter_name,
        )
        
        # Create answer record
        answer = await prisma.answer.create(
            data={
                "questionId": question.id,
                "layer1Output": result["layer1_output"],
                "layer2Output": result["layer2_output"],
                "layer3Output": result["layer3_output"],
                "layer4Output": result["layer4_output"],
                "finalAnswer": result["final_answer"],
                "confidenceScore": result["confidence_score"],
                "referencedConcepts": result["referenced_concepts"],
                "retries": result["retries"],
                "processingTimeMs": result["processing_time_ms"],
                "status": result["status"],
            }
        )
        
        # Build response
        return QuestionResponse(
            id=question.id,
            user_id=question.userId,
            subject_id=question.subjectId,
            chapter_id=question.chapterId,
            question_text=question.questionText,
            created_at=question.createdAt,
            subject=question.subject,
            chapter=question.chapter,
            answer=AnswerResponse(
                id=answer.id,
                question_id=answer.questionId,
                layer1_output=result["layer1_output"],
                layer2_output=result["layer2_output"],
                layer3_output=result["layer3_output"],
                layer4_output=result["layer4_output"],
                final_answer=answer.finalAnswer,
                confidence_score=answer.confidenceScore,
                referenced_concepts=answer.referencedConcepts,
                retries=answer.retries,
                processing_time_ms=answer.processingTimeMs,
                status=answer.status,
                created_at=answer.createdAt,
            ),
        )
        
    except Exception as e:
        # Update question status to failed
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process question: {str(e)}",
        )


@router.get("/history", response_model=QuestionHistoryResponse)
async def get_question_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    """Get question history for the current user."""
    prisma = await get_prisma()
    
    questions = await prisma.question.find_many(
        where={"userId": current_user["id"]},
        take=limit,
        skip=offset,
        order={"createdAt": "desc"},
        include={"subject": True, "chapter": True, "answer": True},
    )
    
    total = await prisma.question.count(
        where={"userId": current_user["id"]}
    )
    
    # Transform to response format
    question_responses = []
    for q in questions:
        answer_response = None
        if q.answer:
            answer_response = AnswerResponse(
                id=q.answer.id,
                question_id=q.answer.questionId,
                layer1_output=q.answer.layer1Output,
                layer2_output=q.answer.layer2Output,
                layer3_output=q.answer.layer3Output,
                layer4_output=q.answer.layer4Output,
                final_answer=q.answer.finalAnswer,
                confidence_score=q.answer.confidenceScore,
                referenced_concepts=q.answer.referencedConcepts,
                retries=q.answer.retries,
                processing_time_ms=q.answer.processingTimeMs,
                status=q.answer.status,
                created_at=q.answer.createdAt,
            )
        
        question_responses.append(
            QuestionResponse(
                id=q.id,
                user_id=q.userId,
                subject_id=q.subjectId,
                chapter_id=q.chapterId,
                question_text=q.questionText,
                created_at=q.createdAt,
                subject=q.subject,
                chapter=q.chapter,
                answer=answer_response,
            )
        )
    
    return QuestionHistoryResponse(
        questions=question_responses,
        total=total,
    )


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a specific question with its answer."""
    prisma = await get_prisma()
    
    question = await prisma.question.find_unique(
        where={"id": question_id},
        include={"subject": True, "chapter": True, "answer": True},
    )
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )
    
    if question.userId != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    answer_response = None
    if question.answer:
        answer_response = AnswerResponse(
            id=question.answer.id,
            question_id=question.answer.questionId,
            layer1_output=question.answer.layer1Output,
            layer2_output=question.answer.layer2Output,
            layer3_output=question.answer.layer3Output,
            layer4_output=question.answer.layer4Output,
            final_answer=question.answer.finalAnswer,
            confidence_score=question.answer.confidenceScore,
            referenced_concepts=question.answer.referencedConcepts,
            retries=question.answer.retries,
            processing_time_ms=question.answer.processingTimeMs,
            status=question.answer.status,
            created_at=question.answer.createdAt,
        )
    
    return QuestionResponse(
        id=question.id,
        user_id=question.userId,
        subject_id=question.subjectId,
        chapter_id=question.chapterId,
        question_text=question.questionText,
        created_at=question.createdAt,
        subject=question.subject,
        chapter=question.chapter,
        answer=answer_response,
    )
