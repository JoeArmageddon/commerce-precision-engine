"""
Standalone FastAPI application without database for local demo.
Includes chapter-research routes that work without database.
"""
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal

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


# ============== Chapter Research Routes ==============

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


@app.get("/api/v1/chapter-research/status")
async def research_status():
    """Check if chapter research service is operational."""
    has_llm = bool(settings.gemini_api_key or settings.groq_api_key)
    has_search = bool(getattr(settings, 'serpapi_key', None))
    
    message = "Service unavailable - no AI provider configured"
    status_value = "degraded"
    
    if has_llm and has_search:
        message = "Full functionality - web search + AI ready"
        status_value = "operational"
    elif has_llm:
        message = "Limited functionality - using AI knowledge only (add SerpAPI key in Settings for better results)"
        status_value = "degraded"
    
    return {
        "status": status_value,
        "llm_available": has_llm,
        "web_search_available": has_search,
        "using_personal_key": False,
        "message": message,
    }


@app.post("/api/v1/chapter-research/research", response_model=ChapterResearchResponse)
async def research_chapter(request: ChapterResearchRequest):
    """
    Research a CBSE Class 12 Commerce chapter.
    This is a demo endpoint that returns sample data.
    """
    import time
    start_time = time.time()
    
    # Demo response with realistic CBSE Class 12 Commerce content
    demo_responses = {
        "Accountancy": {
            "subtopics": [
                {
                    "title": "Introduction to Partnership",
                    "description": "Basic concepts and characteristics of partnership business",
                    "key_points": [
                        "Partnership is defined as relation between persons who have agreed to share profits",
                        "Partnership deed contains terms and conditions of partnership",
                        "Indian Partnership Act 1932 governs partnership firms",
                        "Minimum 2 and maximum 50 partners in a firm"
                    ]
                },
                {
                    "title": "Partnership Deed",
                    "description": "Legal document containing terms of partnership agreement",
                    "key_points": [
                        "Written agreement between partners",
                        "Contains profit sharing ratio, capital contributions",
                        "Specifies duties and rights of partners",
                        "Helps in avoiding disputes among partners"
                    ]
                }
            ],
            "important_questions": [
                {
                    "question": "What is Partnership Deed? Explain its contents.",
                    "answer": "Partnership Deed is a written agreement between partners that contains:\n\n1. Name of the firm and partners\n2. Nature of business\n3. Capital contribution by each partner\n4. Profit sharing ratio\n5. Interest on capital and drawings\n6. Salaries or commissions to partners\n7. Rules regarding admission/retirement\n8. Settlement of disputes\n\nImportance:\n- Avoids misunderstandings\n- Legal evidence of terms\n- Helps in tax assessment",
                    "marks": 4,
                    "type": "short"
                },
                {
                    "question": "Explain the provisions of Indian Partnership Act 1932 regarding partnership.",
                    "answer": "The Indian Partnership Act 1932 defines partnership and provides framework for partnership firms:\n\nKey Provisions:\n1. Definition: Partnership is relation between persons who have agreed to share profits of business\n\n2. Essentials:\n   - Agreement between two or more persons\n   - Sharing of profits\n   - Business must be carried on by all or any of them\n\n3. Registration:\n   - Not compulsory but advisable\n   - Unregistered firm cannot sue third parties\n\n4. Rights of Partners:\n   - Right to take part in business\n   - Right to share profits\n   - Right to inspect books\n   - Right to interest on capital\n\n5. Duties:\n   - To carry on business faithfully\n   - To give true accounts\n   - To indemnify for fraud",
                    "marks": 6,
                    "type": "long"
                }
            ],
            "quick_notes": [
                "Partnership requires minimum 2 partners, maximum 50",
                "Partnership deed should be registered for legal protection",
                "Profit sharing ratio is decided by mutual agreement",
                "Interest on capital is allowed only if partnership deed permits",
                "Goodwill is valued when there is admission/retirement"
            ]
        },
        "Economics": {
            "subtopics": [
                {
                    "title": "Central Problems of Economy",
                    "description": "Fundamental economic problems faced by every society",
                    "key_points": [
                        "What to produce - choice of goods and services",
                        "How to produce - choice of production technique",
                        "For whom to produce - distribution of income",
                        "These problems arise due to scarcity of resources"
                    ]
                },
                {
                    "title": "Production Possibilities Curve",
                    "description": "Graphical representation of alternative production possibilities",
                    "key_points": [
                        "Shows maximum possible combinations of two goods",
                        "Points on curve show efficient utilization",
                        "Points inside curve indicate underutilization",
                        "Points outside curve are unattainable with current resources"
                    ]
                }
            ],
            "important_questions": [
                {
                    "question": "Explain the central problems of an economy.",
                    "answer": "Every economy faces three central problems:\n\n1. What to produce?\n   - Deciding which goods and services to produce\n   - Choice between consumer goods vs capital goods\n   - Decision based on consumer preferences and resources\n\n2. How to produce?\n   - Choice of production technique\n   - Labour-intensive vs Capital-intensive methods\n   - Depends on availability of labour and capital\n\n3. For whom to produce?\n   - Distribution of national income\n   - Ensures equitable distribution of goods\n   - Depends on factor ownership and market mechanism",
                    "marks": 6,
                    "type": "long"
                }
            ],
            "quick_notes": [
                "Scarcity is the root cause of economic problems",
                "PPC shows trade-offs in production",
                "Opportunity cost is what you give up to get something else",
                "Positive economics deals with 'what is'",
                "Normative economics deals with 'what ought to be'"
            ]
        },
        "Business Studies": {
            "subtopics": [
                {
                    "title": "Nature and Significance of Management",
                    "description": "Basic concepts, characteristics and importance of management",
                    "key_points": [
                        "Management is the process of getting things done through others",
                        "It is goal-oriented and universal",
                        "Management is a continuous process",
                        "It is a group activity, not an individual effort"
                    ]
                },
                {
                    "title": "Functions of Management",
                    "description": "Planning, Organizing, Staffing, Directing, and Controlling",
                    "key_points": [
                        "Planning: Thinking before doing, primary function",
                        "Organizing: Arranging resources and activities",
                        "Staffing: Recruitment, selection, training of employees",
                        "Directing: Guiding and motivating employees",
                        "Controlling: Ensuring activities conform to plans"
                    ]
                }
            ],
            "important_questions": [
                {
                    "question": "Explain the characteristics of management.",
                    "answer": "Management has the following characteristics:\n\n1. Goal-oriented:\n   - Every management activity is directed towards achieving organizational goals\n\n2. Universal:\n   - Applicable to all types of organizations\n   - Principles remain same across sectors\n\n3. Continuous Process:\n   - Management is ongoing and never-ending\n   - All functions continue simultaneously\n\n4. Group Activity:\n   - Requires coordination among people\n   - Cannot be done by one person alone\n\n5. Dynamic:\n   - Adapts to changing environment\n   - Flexible in approach\n\n6. Intangible Force:\n   - Cannot be seen but felt through results\n   - Creates order and discipline",
                    "marks": 4,
                    "type": "short"
                }
            ],
            "quick_notes": [
                "Management is an art, science and profession",
                "Levels of management: Top, Middle, Lower",
                "Management aims at efficiency and effectiveness",
                "Coordination is the essence of management",
                "POLC Framework: Planning, Organizing, Leading, Controlling"
            ]
        }
    }
    
    # Get demo data for the subject, or use Business Studies as default
    subject_data = demo_responses.get(request.subject, demo_responses["Business Studies"])
    
    processing_time = int((time.time() - start_time) * 1000)
    
    return ChapterResearchResponse(
        chapter_name=request.chapter_name,
        subject=request.subject,
        subtopics=[
            SubtopicResponse(
                title=st["title"],
                description=st["description"],
                key_points=st["key_points"],
            )
            for st in subject_data["subtopics"]
        ],
        important_questions=[
            ImportantQuestionResponse(
                question=q["question"],
                answer=q["answer"],
                marks=q["marks"],
                type=q["type"],
            )
            for q in subject_data["important_questions"]
        ],
        board_questions=[
            BoardQuestionResponse(
                year="2023",
                question=f"Sample board question for {request.chapter_name}",
                marks=4,
            )
        ],
        quick_notes=subject_data["quick_notes"],
        mnemonics=["Remember: PODC stands for Planning, Organizing, Directing, Controlling"],
        sources=[
            SourceInfo(
                title="NCERT Textbook - Class 12",
                link="https://ncert.nic.in/textbook.php",
                source="NCERT",
            ),
            SourceInfo(
                title="CBSE Sample Papers",
                link="https://cbse.gov.in",
                source="CBSE",
            ),
        ],
        verification=VerificationInfo(
            status="verified",
            confidence_score=85.0,
            syllabus_alignment=90.0,
            completeness=88.0,
            question_authenticity=82.0,
        ),
        warnings=[
            "This is demo data. Add AI API keys in Settings for real research.",
        ],
        processing_time_ms=processing_time,
        generated_at=datetime.utcnow().isoformat(),
    )


# ============== Other Demo Routes ==============

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
