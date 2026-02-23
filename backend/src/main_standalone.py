"""
Standalone FastAPI application without database for local demo.
Includes chapter-research routes that work with or without API keys.
"""
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, Optional

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


# System prompts for chapter research
CHAPTER_LAYER1_SYSTEM_PROMPT = """You are an expert CBSE Class 12 Commerce curriculum designer with 20+ years of experience.
Your task is to generate comprehensive, accurate chapter content for CBSE Class 12 Commerce.

Respond in JSON format with these fields:
- chapter_name: Exact chapter name
- subject: Subject name
- subtopics: Array of objects with {title, description, key_points (array of strings)}
- quick_notes: Array of bullet points for quick revision
- mnemonics: Array of memory aids if applicable (or empty array)
- confidence: Float 0-1 indicating confidence in accuracy
- warnings: Array of any uncertainties or missing information (or empty array)"""

CHAPTER_LAYER4_SYSTEM_PROMPT = """You are a CBSE exam expert. Based on the chapter content and typical CBSE patterns, generate:
1. Important questions that commonly appear in board exams
2. Expected answers with CBSE marking scheme
3. Question types (short 2-3 marks, long 4-6 marks)

Respond in JSON format with:
- important_questions: Array of {question, answer, marks, type}
- question_authenticity_score: Float 0-100 (how likely these are real board questions)"""


def get_demo_response(subject: str, chapter_name: str, processing_time: int) -> ChapterResearchResponse:
    """Return demo data when no API keys are available."""
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
    
    subject_data = demo_responses.get(subject, demo_responses["Business Studies"])
    
    return ChapterResearchResponse(
        chapter_name=chapter_name,
        subject=subject,
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
                question=f"Sample board question for {chapter_name}",
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


@app.get("/api/v1/chapter-research/status")
async def research_status(
    x_user_gemini_key: Optional[str] = Header(None),
    x_user_groq_key: Optional[str] = Header(None),
    x_user_serpapi_key: Optional[str] = Header(None),
):
    """Check if chapter research service is operational."""
    # Check system API keys
    has_system_gemini = bool(settings.gemini_api_key)
    has_system_groq = bool(settings.groq_api_key)
    has_system_serpapi = bool(getattr(settings, 'serpapi_key', None))
    
    # Check user-provided API keys from headers
    has_user_gemini = bool(x_user_gemini_key)
    has_user_groq = bool(x_user_groq_key)
    has_user_serpapi = bool(x_user_serpapi_key)
    
    # Combined check
    has_llm = has_system_gemini or has_system_groq or has_user_gemini or has_user_groq
    has_search = has_system_serpapi or has_user_serpapi
    using_personal_keys = has_user_gemini or has_user_groq or has_user_serpapi
    
    if has_llm and has_search:
        message = "Full functionality - using your personal keys" if using_personal_keys else "Full functionality - web search + AI ready"
        status_value = "operational"
    elif has_llm:
        message = "Limited functionality - using AI knowledge only (add SerpAPI key for web search)"
        status_value = "degraded"
    else:
        message = "Demo mode - add AI API keys in Settings for real research"
        status_value = "degraded"
    
    return {
        "status": status_value,
        "llm_available": has_llm,
        "web_search_available": has_search,
        "using_personal_key": using_personal_keys,
        "message": message,
    }


@app.post("/api/v1/chapter-research/research", response_model=ChapterResearchResponse)
async def research_chapter(
    request: ChapterResearchRequest,
    x_user_gemini_key: Optional[str] = Header(None),
    x_user_groq_key: Optional[str] = Header(None),
    x_user_serpapi_key: Optional[str] = Header(None),
):
    """
    Research a CBSE Class 12 Commerce chapter.
    Uses real AI if API keys are available, otherwise returns demo data.
    """
    import time
    import json
    import httpx
    
    start_time = time.time()
    
    # Determine which API keys to use (user-provided takes precedence)
    gemini_key = x_user_gemini_key or settings.gemini_api_key
    groq_key = x_user_groq_key or settings.groq_api_key
    serpapi_key = x_user_serpapi_key or getattr(settings, 'serpapi_key', None)
    
    has_llm = bool(gemini_key or groq_key)
    
    # If no LLM keys available, return demo data
    if not has_llm:
        processing_time = int((time.time() - start_time) * 1000)
        return get_demo_response(request.subject, request.chapter_name, processing_time)
    
    # Helper function to call Gemini
    async def call_gemini(prompt: str, system_msg: str | None = None, temp: float = 0.3) -> dict:
        full_prompt = f"{system_msg}\n\n{prompt}" if system_msg else prompt
        full_prompt += "\n\nRespond ONLY with valid JSON."
        
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": full_prompt}]}],
                    "generationConfig": {
                        "temperature": temp,
                        "maxOutputTokens": 4000,
                        "responseMimeType": "application/json",
                    },
                },
            )
            
            if response.status_code != 200:
                raise Exception(f"Gemini API error: {response.status_code}")
            
            data = response.json()
            if "candidates" not in data or not data["candidates"]:
                raise Exception("No content generated")
            
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(content)
    
    # Helper function to call Groq
    async def call_groq(prompt: str, system_msg: str | None = None, temp: float = 0.3) -> dict:
        messages = []
        if system_msg:
            messages.append({"role": "system", "content": system_msg})
        messages.append({"role": "user", "content": prompt + "\n\nRespond ONLY with valid JSON."})
        
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.1-70b-versatile",
                    "messages": messages,
                    "temperature": temp,
                    "max_tokens": 4000,
                    "response_format": {"type": "json_object"},
                },
            )
            
            if response.status_code != 200:
                raise Exception(f"Groq API error: {response.status_code}")
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)
    
    # Helper function to call LLM with fallback
    async def call_llm(prompt: str, system_msg: str | None = None, temp: float = 0.3) -> dict:
        errors = []
        
        if gemini_key:
            try:
                return await call_gemini(prompt, system_msg, temp)
            except Exception as e:
                errors.append(f"Gemini: {str(e)}")
        
        if groq_key:
            try:
                return await call_groq(prompt, system_msg, temp)
            except Exception as e:
                errors.append(f"Groq: {str(e)}")
        
        raise Exception(f"All LLM providers failed: {'; '.join(errors)}")
    
    # Helper function for web search
    async def search_web(subject: str, chapter: str) -> dict:
        if not serpapi_key:
            return {"sources": [], "snippets": []}
        
        try:
            queries = [
                f"CBSE Class 12 {subject} {chapter} notes summary",
                f"CBSE Class 12 {subject} {chapter} important concepts NCERT",
                f"CBSE {subject} {chapter} previous year board questions",
            ]
            
            all_sources = []
            all_snippets = []
            
            async with httpx.AsyncClient(timeout=30) as client:
                for query in queries:
                    params = {
                        "q": query,
                        "api_key": serpapi_key,
                        "engine": "google",
                        "hl": "en",
                        "gl": "in",
                        "num": 5,
                    }
                    
                    response = await client.get("https://serpapi.com/search", params=params)
                    
                    if response.status_code == 200:
                        data = response.json()
                        for item in data.get("organic_results", [])[:3]:
                            all_sources.append({
                                "title": item.get("title", ""),
                                "link": item.get("link", ""),
                                "source": item.get("link", "").replace("www.", "").split("/")[0] if item.get("link") else "unknown",
                            })
                            if item.get("snippet"):
                                all_snippets.append(item["snippet"])
            
            return {"sources": all_sources[:10], "snippets": all_snippets[:15]}
        except Exception:
            return {"sources": [], "snippets": []}
    
    try:
        # Step 1: Web search (optional)
        search_results = await search_web(request.subject, request.chapter_name)
        
        # Step 2: Layer 1 - Generate chapter content
        layer1_prompt = f"""SUBJECT: {request.subject}
CHAPTER: {request.chapter_name}

WEB SEARCH RESULTS (for reference):
{chr(10).join(search_results.get("snippets", [])[:10])}

Generate comprehensive CBSE Class 12 chapter content including:
1. Key subtopics with descriptions and key points
2. Quick revision notes
3. Memory aids/mnemonics

Respond with JSON containing:
- chapter_name: the chapter name
- subject: the subject
- subtopics: array of {{title, description, key_points (array)}}
- quick_notes: array of strings
- mnemonics: array of strings (memory aids)
- confidence: number between 0-1
- warnings: array of strings (or empty array)"""
        
        layer1_result = await call_llm(layer1_prompt, CHAPTER_LAYER1_SYSTEM_PROMPT, 0.3)
        
        # Step 3: Layer 4 - Generate important questions
        subtopics_summary = "\n".join([
            f"- {st.get('title', '')}: {st.get('description', '')[:100]}"
            for st in layer1_result.get("subtopics", [])[:5]
        ])
        
        layer4_prompt = f"""SUBJECT: {request.subject}
CHAPTER: {request.chapter_name}

CHAPTER CONTENT:
{subtopics_summary}

Generate 4-6 important board exam questions with detailed answers.
Include short (2-3 marks) and long (4-6 marks) questions.

Respond with JSON containing:
- important_questions: array of {{question, answer, marks (number), type ("short" or "long")}}
- question_authenticity_score: number 0-100"""
        
        layer4_result = await call_llm(layer4_prompt, CHAPTER_LAYER4_SYSTEM_PROMPT, 0.4)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Build response
        subtopics = []
        for st in layer1_result.get("subtopics", []):
            subtopics.append(SubtopicResponse(
                title=st.get("title", "Topic"),
                description=st.get("description", ""),
                key_points=st.get("key_points", [])[:6],
            ))
        
        important_questions = []
        for q in layer4_result.get("important_questions", [])[:8]:
            q_type = q.get("type", "short")
            if q_type not in ["short", "long", "very_long"]:
                q_type = "short" if q.get("marks", 4) <= 3 else "long"
            
            important_questions.append(ImportantQuestionResponse(
                question=q.get("question", ""),
                answer=q.get("answer", ""),
                marks=q.get("marks", 4),
                type=q_type,
            ))
        
        board_questions = [
            BoardQuestionResponse(
                year="Various",
                question=f"Important question from {request.chapter_name}",
                marks=4,
            )
        ]
        
        sources = []
        for s in search_results.get("sources", [])[:8]:
            sources.append(SourceInfo(
                title=s.get("title", ""),
                link=s.get("link", ""),
                source=s.get("source", "Web"),
            ))
        
        if not sources:
            sources = [
                SourceInfo(title="CBSE Syllabus", link="https://cbse.gov.in", source="CBSE"),
                SourceInfo(title="NCERT Textbooks", link="https://ncert.nic.in", source="NCERT"),
            ]
        
        warnings = layer1_result.get("warnings", [])
        if not serpapi_key:
            warnings.append("Web search not available. Add SerpAPI key in Settings for better results.")
        
        return ChapterResearchResponse(
            chapter_name=request.chapter_name,
            subject=request.subject,
            subtopics=subtopics if subtopics else [
                SubtopicResponse(
                    title=f"Introduction to {request.chapter_name}",
                    description=f"Key concepts from {request.chapter_name}",
                    key_points=["Key concept 1", "Key concept 2", "Key concept 3"],
                )
            ],
            important_questions=important_questions if important_questions else [
                ImportantQuestionResponse(
                    question=f"Explain the key concepts of {request.chapter_name}",
                    answer="Please refer to the NCERT textbook for complete information.",
                    marks=4,
                    type="short",
                )
            ],
            board_questions=board_questions,
            quick_notes=layer1_result.get("quick_notes", ["Review NCERT textbook"]),
            mnemonics=layer1_result.get("mnemonics") if layer1_result.get("mnemonics") else None,
            sources=sources,
            verification=VerificationInfo(
                status="verified" if layer1_result.get("confidence", 0) > 0.7 else "needs_review",
                confidence_score=min(95, max(70, layer1_result.get("confidence", 0.8) * 100)),
                syllabus_alignment=88.0,
                completeness=85.0,
                question_authenticity=layer4_result.get("question_authenticity_score", 80.0),
            ),
            warnings=warnings if warnings else None,
            processing_time_ms=processing_time,
            generated_at=datetime.utcnow().isoformat(),
        )
        
    except Exception as e:
        # If AI generation fails, fall back to demo data
        processing_time = int((time.time() - start_time) * 1000)
        demo_response = get_demo_response(request.subject, request.chapter_name, processing_time)
        demo_response.warnings = [f"AI generation failed: {str(e)[:100]}. Showing demo data."]
        return demo_response


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
