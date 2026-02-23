"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any, Literal


# ============== Auth Schemas ==============

class LoginRequest(BaseModel):
    access_code: str = Field(..., min_length=4, max_length=50, description="User access code")


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    access_code: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Subject Schemas ==============

class SubjectResponse(BaseModel):
    id: str
    name: str
    code: str
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class ChapterResponse(BaseModel):
    id: str
    subject_id: str
    name: str
    display_order: int

    class Config:
        from_attributes = True


# ============== Question Schemas ==============

class AskQuestionRequest(BaseModel):
    subject_id: str
    chapter_id: str | None = None
    question_text: str = Field(..., min_length=10, max_length=5000)


class Layer1Output(BaseModel):
    answer: str
    key_points: list[str]
    referenced_concepts: list[str]
    confidence: float = Field(..., ge=0, le=1)


class Layer2Output(BaseModel):
    syllabus_alignment: str
    missing_keywords: list[str]
    irrelevant_points: list[str]
    alignment_score: float = Field(..., ge=0, le=100)


class Layer3Output(BaseModel):
    logical_errors: list[str]
    severity: Literal["none", "low", "medium", "high"]


class Layer4Output(BaseModel):
    predicted_score: float = Field(..., ge=0, le=100)
    max_marks: int = Field(..., ge=1, le=100)
    score_percentage: float = Field(..., ge=0, le=100)
    missing_components: list[str]


class AnswerResponse(BaseModel):
    id: str
    question_id: str
    layer1_output: Layer1Output
    layer2_output: Layer2Output
    layer3_output: Layer3Output
    layer4_output: Layer4Output
    final_answer: str
    confidence_score: float
    referenced_concepts: list[str]
    retries: int
    processing_time_ms: int | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionResponse(BaseModel):
    id: str
    user_id: str
    subject_id: str
    chapter_id: str | None
    question_text: str
    created_at: datetime
    subject: SubjectResponse | None = None
    chapter: ChapterResponse | None = None
    answer: AnswerResponse | None = None

    class Config:
        from_attributes = True


class QuestionHistoryResponse(BaseModel):
    questions: list[QuestionResponse]
    total: int


# ============== Document Schemas ==============

class DocumentUploadRequest(BaseModel):
    subject_id: str
    chapter_id: str | None = None
    file_name: str
    content: str = Field(..., max_length=10000000)  # 10MB text limit


class DocumentResponse(BaseModel):
    id: str
    user_id: str
    subject_id: str
    chapter_id: str | None
    file_name: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Health Check ==============

class HealthCheckResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str = "2.0.0"


# Update forward references
LoginResponse.model_rebuild()
