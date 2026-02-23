"""
Chapter Research Service - Production-grade CBSE chapter research with verification.
Combines web search + Groq AI with 4-layer verification for accuracy.
"""
import json
import time
import asyncio
from typing import Any
from src.config import get_settings
from src.services.llm_service import get_llm_service
from src.services.web_search_service import get_web_search_service

settings = get_settings()


# System prompts for chapter research verification layers
CHAPTER_LAYER1_SYSTEM_PROMPT = """You are an expert CBSE Class 12 Commerce curriculum designer with 20+ years of experience.
Your task is to analyze web search results and extract accurate, comprehensive chapter content.

STRICT REQUIREMENTS:
1. ONLY use information from the provided search results
2. If information is missing, state "Information not found in sources" rather than hallucinate
3. Verify all definitions, formulas, and concepts against the provided sources
4. Flag any contradictory information found in different sources

Respond in JSON format with these fields:
- chapter_name: Exact chapter name
- subject: Subject name
- subtopics: Array of objects with {title, description, key_points (array)}
- quick_notes: Array of bullet points for quick revision
- mnemonics: Array of memory aids if applicable
- confidence: Float 0-1 indicating confidence in accuracy
- warnings: Array of any uncertainties or missing information"""

CHAPTER_LAYER2_SYSTEM_PROMPT = """You are a CBSE syllabus expert and fact-checker. Review the extracted chapter content against known CBSE standards.

Verify:
1. Are the subtopics in the correct order as per NCERT?
2. Are all key concepts mentioned in official CBSE syllabus present?
3. Are there any concepts that do NOT belong to this chapter?
4. Check accuracy of all definitions and formulas

Respond in JSON format with:
- syllabus_alignment_score: Float 0-100
- missing_cbse_concepts: Array of concepts that should be included
- incorrect_content: Array of items that seem inaccurate
- suggested_corrections: Array of corrections needed
- verification_status: "verified", "needs_review", or "unreliable"
"""

CHAPTER_LAYER3_SYSTEM_PROMPT = """You are an academic integrity auditor. Check the chapter content for:
1. Logical consistency across subtopics
2. Factual accuracy (dates, formulas, definitions)
3. Completeness - does it cover what a Class 12 student needs?
4. Difficulty level appropriateness

Respond in JSON format with:
- logical_errors: Array of inconsistencies found
- factual_issues: Array of factual concerns
- completeness_score: Float 0-100
- recommendations: Array of improvements"""

CHAPTER_LAYER4_SYSTEM_PROMPT = """You are a CBSE exam expert. Based on the chapter content and typical CBSE patterns, generate:
1. Important questions that commonly appear in board exams
2. Expected answers with CBSE marking scheme
3. Question types (short 2-3 marks, long 4-6 marks)

Respond in JSON format with:
- important_questions: Array of {question, answer, marks, type}
- question_authenticity_score: Float 0-100 (how likely these are real board questions)
- year_wise_distribution: Object with years as keys and question counts as values"""


class ChapterResearchService:
    """
    Production-grade chapter research with 4-layer verification.
    
    Flow:
    1. Web search for CBSE content
    2. Layer 1: Extract and structure content from search results
    3. Layer 2: Verify against CBSE syllabus
    4. Layer 3: Audit for accuracy and completeness
    5. Layer 4: Generate board questions
    6. Final aggregation with confidence scoring
    """
    
    def __init__(self):
        self.llm = get_llm_service()
        self.web_search = get_web_search_service()
        self.max_retries = 2
    
    async def research_chapter(
        self,
        subject: str,
        chapter_name: str,
    ) -> dict[str, Any]:
        """
        Perform comprehensive chapter research with verification.
        
        Args:
            subject: Subject name (Accountancy, Economics, Business Studies)
            chapter_name: Chapter name to research
            
        Returns:
            Dictionary with verified chapter content
        """
        start_time = time.time()
        
        # Step 1: Parallel web searches
        search_tasks = [
            self.web_search.search_cbse_content(subject, chapter_name, "general"),
            self.web_search.search_board_questions(subject, chapter_name),
        ]
        
        general_results, board_questions = await asyncio.gather(*search_tasks)
        
        # If no API key or no results, use LLM knowledge with warnings
        has_search_data = len(general_results.get("sources", [])) > 0
        
        # Step 2: Layer 1 - Content Extraction
        layer1_result = await self._layer1_extract_content(
            subject, chapter_name, general_results
        )
        
        # Step 3: Layer 2 - CBSE Syllabus Verification
        layer2_result = await self._layer2_verify_syllabus(
            subject, chapter_name, layer1_result
        )
        
        # Step 4: Layer 3 - Accuracy Audit
        layer3_result = await self._layer3_audit_accuracy(
            subject, chapter_name, layer1_result
        )
        
        # Step 5: Layer 4 - Board Questions Generation
        layer4_result = await self._layer4_generate_questions(
            subject, chapter_name, layer1_result, board_questions
        )
        
        # Step 6: Aggregate results with confidence scoring
        final_result = self._aggregate_results(
            subject,
            chapter_name,
            layer1_result,
            layer2_result,
            layer3_result,
            layer4_result,
            general_results.get("sources", []),
            board_questions,
            start_time,
        )
        
        return final_result
    
    async def _layer1_extract_content(
        self,
        subject: str,
        chapter_name: str,
        search_results: dict[str, Any],
    ) -> dict[str, Any]:
        """Layer 1: Extract and structure content from search results."""
        
        # Build context from search results
        sources_text = "\n\n".join([
            f"Source: {s['source']}\nTitle: {s['title']}\nSnippet: {s['snippet']}"
            for s in search_results.get("sources", [])[:10]
        ])
        
        snippets_text = "\n".join(search_results.get("content_snippets", [])[:20])
        
        prompt = f"""SUBJECT: {subject}
CHAPTER: {chapter_name}

SEARCH RESULTS FROM WEB:
{sources_text}

CONTENT SNIPPETS:
{snippets_text}

Based on the above search results, extract comprehensive chapter content following CBSE Class 12 standards.

IMPORTANT: 
- If search results are empty or insufficient, use your knowledge but set confidence appropriately
- Clearly mark any information you're uncertain about
- Include ALL subtopics that belong to this chapter

Respond with JSON containing:
- chapter_name
- subject
- subtopics (array with title, description, key_points array)
- quick_notes (bullet points)
- mnemonics (memory aids)
- confidence (0-1)
- warnings (array of uncertainties)"""
        
        try:
            result = await self.llm.generate_json(
                prompt=prompt,
                system_message=CHAPTER_LAYER1_SYSTEM_PROMPT,
                temperature=0.3,
                max_tokens=4000,
            )
            return result
        except Exception as e:
            # Fallback if LLM fails
            return {
                "chapter_name": chapter_name,
                "subject": subject,
                "subtopics": [],
                "quick_notes": [],
                "mnemonics": [],
                "confidence": 0.0,
                "warnings": [f"Content extraction failed: {str(e)}"],
            }
    
    async def _layer2_verify_syllabus(
        self,
        subject: str,
        chapter_name: str,
        layer1_result: dict[str, Any],
    ) -> dict[str, Any]:
        """Layer 2: Verify against CBSE syllabus standards."""
        
        subtopics_summary = "\n".join([
            f"- {st.get('title', 'Unknown')}: {st.get('description', '')[:100]}..."
            for st in layer1_result.get("subtopics", [])[:10]
        ])
        
        prompt = f"""SUBJECT: {subject}
CHAPTER: {chapter_name}

PROPOSED CONTENT:
{subtopics_summary}

Verify this content against CBSE Class 12 official syllabus:
1. Is this the correct sequence of subtopics?
2. Are all required CBSE concepts present?
3. Is there any content that doesn't belong?

Respond with JSON containing:
- syllabus_alignment_score (0-100)
- missing_cbse_concepts (array)
- incorrect_content (array)
- suggested_corrections (array)
- verification_status ("verified", "needs_review", or "unreliable")"""
        
        try:
            result = await self.llm.generate_json(
                prompt=prompt,
                system_message=CHAPTER_LAYER2_SYSTEM_PROMPT,
                temperature=0.2,
                max_tokens=2000,
            )
            return result
        except Exception as e:
            return {
                "syllabus_alignment_score": 0,
                "missing_cbse_concepts": [],
                "incorrect_content": [],
                "suggested_corrections": [],
                "verification_status": "unreliable",
                "error": str(e),
            }
    
    async def _layer3_audit_accuracy(
        self,
        subject: str,
        chapter_name: str,
        layer1_result: dict[str, Any],
    ) -> dict[str, Any]:
        """Layer 3: Audit for accuracy and completeness."""
        
        content_summary = json.dumps({
            "subtopics": [
                {"title": st.get("title"), "points": st.get("key_points", [])[:3]}
                for st in layer1_result.get("subtopics", [])[:5]
            ],
            "quick_notes": layer1_result.get("quick_notes", [])[:5],
        }, indent=2)
        
        prompt = f"""SUBJECT: {subject}
CHAPTER: {chapter_name}

CONTENT TO AUDIT:
{content_summary}

Audit this content for:
1. Logical consistency
2. Factual accuracy
3. Completeness for Class 12 level

Respond with JSON containing:
- logical_errors (array)
- factual_issues (array)
- completeness_score (0-100)
- recommendations (array)"""
        
        try:
            result = await self.llm.generate_json(
                prompt=prompt,
                system_message=CHAPTER_LAYER3_SYSTEM_PROMPT,
                temperature=0.2,
                max_tokens=2000,
            )
            return result
        except Exception as e:
            return {
                "logical_errors": [],
                "factual_issues": [],
                "completeness_score": 0,
                "recommendations": [],
                "error": str(e),
            }
    
    async def _layer4_generate_questions(
        self,
        subject: str,
        chapter_name: str,
        layer1_result: dict[str, Any],
        web_board_questions: list[dict],
    ) -> dict[str, Any]:
        """Layer 4: Generate board questions and verify authenticity."""
        
        subtopics_list = [st.get("title", "") for st in layer1_result.get("subtopics", [])[:8]]
        
        # Include real board questions found online as examples
        real_questions_text = "\n".join([
            f"- {q.get('question', '')} ({q.get('year', 'Unknown')} - {q.get('marks', '?')} marks)"
            for q in web_board_questions[:10]
        ])
        
        prompt = f"""SUBJECT: {subject}
CHAPTER: {chapter_name}

CHAPTER SUBTOPICS:
{json.dumps(subtopics_list, indent=2)}

ACTUAL BOARD QUESTIONS FOUND ONLINE:
{real_questions_text if real_questions_text else "(No specific questions found in search)"}

Based on the chapter content and typical CBSE patterns, generate:
1. 4-6 important questions with complete answers
2. Include question types: short (2-3 marks), long (4-6 marks)
3. Make questions board-exam realistic
4. Provide detailed CBSE-style answers

Respond with JSON containing:
- important_questions (array of {{question, answer, marks, type}})
- question_authenticity_score (0-100)
- year_wise_distribution (object)"""
        
        try:
            result = await self.llm.generate_json(
                prompt=prompt,
                system_message=CHAPTER_LAYER4_SYSTEM_PROMPT,
                temperature=0.4,
                max_tokens=6000,
            )
            return result
        except Exception as e:
            return {
                "important_questions": [],
                "question_authenticity_score": 0,
                "year_wise_distribution": {},
                "error": str(e),
            }
    
    def _aggregate_results(
        self,
        subject: str,
        chapter_name: str,
        layer1: dict[str, Any],
        layer2: dict[str, Any],
        layer3: dict[str, Any],
        layer4: dict[str, Any],
        sources: list[dict],
        web_board_questions: list[dict],
        start_time: float,
    ) -> dict[str, Any]:
        """Aggregate all layers and calculate final confidence."""
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Calculate overall confidence
        confidence_factors = [
            layer1.get("confidence", 0) * 100,
            layer2.get("syllabus_alignment_score", 0),
            layer3.get("completeness_score", 0),
        ]
        
        # Weight factors
        overall_confidence = sum(confidence_factors) / len(confidence_factors) if confidence_factors else 0
        
        # Determine verification status
        verification_status = layer2.get("verification_status", "needs_review")
        
        # Build warnings list
        warnings = layer1.get("warnings", [])
        if layer2.get("missing_cbse_concepts"):
            warnings.append(f"Missing CBSE concepts: {len(layer2['missing_cbse_concepts'])} items")
        if layer3.get("factual_issues"):
            warnings.append(f"Potential factual issues: {len(layer3['factual_issues'])} items")
        
        # Transform board questions
        board_questions = []
        for q in layer4.get("important_questions", []):
            board_questions.append({
                "question": q.get("question", ""),
                "answer": q.get("answer", ""),
                "marks": q.get("marks", 4),
                "type": q.get("type", "short"),
            })
        
        # Add web-found questions to board questions list
        for q in web_board_questions[:5]:
            if q.get("question"):
                board_questions.append({
                    "question": q["question"],
                    "answer": "(Found via web search - verify with official sources)",
                    "marks": q.get("marks") or 4,
                    "type": "short" if (q.get("marks") or 4) <= 3 else "long",
                })
        
        # Transform subtopics
        subtopics = []
        for st in layer1.get("subtopics", []):
            subtopics.append({
                "title": st.get("title", ""),
                "description": st.get("description", ""),
                "key_points": st.get("key_points", []),
            })
        
        return {
            "chapter_name": chapter_name,
            "subject": subject,
            "subtopics": subtopics,
            "important_questions": board_questions[:15],  # Limit to 15
            "board_questions": [
                {
                    "year": q.get("year", "Various"),
                    "question": q.get("question", ""),
                    "marks": q.get("marks", 4),
                }
                for q in web_board_questions[:10]
            ],
            "quick_notes": layer1.get("quick_notes", []),
            "mnemonics": layer1.get("mnemonics", []),
            "sources": [
                {"title": s.get("title"), "link": s.get("link"), "source": s.get("source")}
                for s in sources[:10]
            ],
            "verification": {
                "status": verification_status,
                "confidence_score": round(overall_confidence, 1),
                "syllabus_alignment": layer2.get("syllabus_alignment_score", 0),
                "completeness": layer3.get("completeness_score", 0),
                "question_authenticity": layer4.get("question_authenticity_score", 0),
            },
            "warnings": warnings if warnings else None,
            "processing_time_ms": processing_time,
            "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }


# Singleton instance
_research_service: ChapterResearchService | None = None


def get_chapter_research_service() -> ChapterResearchService:
    """Get or create chapter research service instance."""
    global _research_service
    if _research_service is None:
        _research_service = ChapterResearchService()
    return _research_service
