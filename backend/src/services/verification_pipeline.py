"""
4-Layer Synchronous Verification Pipeline for CBSE Commerce answers.
"""
import asyncio
import time
from typing import Any
from src.config import get_settings
from src.services.llm_service import get_llm_service
from src.models.schemas import (
    Layer1Output,
    Layer2Output,
    Layer3Output,
    Layer4Output,
)

settings = get_settings()


# System prompts for each layer
LAYER1_SYSTEM_PROMPT = """You are an expert CBSE Class 12 Commerce teacher with 20+ years of experience. 
Your task is to generate a comprehensive, accurate, and well-structured answer for the given question.
The answer should follow CBSE marking scheme standards and include relevant examples, definitions, and explanations.

Respond in JSON format with these fields:
- answer: The complete answer text (comprehensive but concise)
- key_points: Array of main points covered in the answer
- referenced_concepts: Array of specific concepts/theories mentioned
- confidence: Float between 0 and 1 indicating confidence in the answer"""

LAYER2_SYSTEM_PROMPT = """You are a CBSE syllabus expert. Review the given answer against the CBSE Class 12 Commerce syllabus.
Check if all relevant keywords are included and if there are any irrelevant points.

Respond in JSON format with these fields:
- syllabus_alignment: Brief description of how well the answer aligns with syllabus
- missing_keywords: Array of important CBSE keywords that should be included
- irrelevant_points: Array of any points not relevant to the syllabus
- alignment_score: Float 0-100 indicating percentage alignment with syllabus"""

LAYER3_SYSTEM_PROMPT = """You are a logical reasoning expert. Review the answer for logical errors, 
inconsistencies, or incorrect statements. Check for factual accuracy regarding commerce concepts.

Respond in JSON format with these fields:
- logical_errors: Array of identified errors or inconsistencies
- severity: One of "none", "low", "medium", or "high" indicating overall error severity"""

LAYER4_SYSTEM_PROMPT = """You are a CBSE examiner with expertise in marking schemes. Evaluate the answer 
as if it's a student's response worth maximum marks. Apply CBSE marking criteria strictly.

Respond in JSON format with these fields:
- predicted_score: Float indicating marks obtained
- max_marks: Integer indicating maximum possible marks (typically 3, 4, 5, or 6)
- score_percentage: Float 0-100 (predicted_score/max_marks * 100)
- missing_components: Array of components that would improve the score"""


class VerificationPipeline:
    """
    4-Layer synchronous verification pipeline for generating high-quality CBSE answers.
    
    Flow: Generator → Validator → Auditor → Scorer
    With max 2 retries if any layer fails quality thresholds.
    """
    
    def __init__(self):
        self.llm = get_llm_service()
        self.max_retries = settings.max_retries
    
    async def process(
        self,
        question: str,
        subject: str,
        chapter: str | None = None,
    ) -> dict[str, Any]:
        """
        Process a question through the 4-layer verification pipeline.
        
        Args:
            question: The question text
            subject: Subject name (Accountancy, Economics, Business Studies)
            chapter: Optional chapter name for context
            
        Returns:
            Dictionary with all layer outputs and final answer
        """
        start_time = time.time()
        retries = 0
        
        # Build context
        context = f"Subject: {subject}"
        if chapter:
            context += f", Chapter: {chapter}"
        
        while retries <= self.max_retries:
            try:
                # ===== LAYER 1: Generator =====
                layer1_prompt = self._build_layer1_prompt(question, context)
                layer1_raw = await self.llm.generate_json(
                    prompt=layer1_prompt,
                    system_message=LAYER1_SYSTEM_PROMPT,
                    temperature=0.4,
                )
                layer1 = Layer1Output(**layer1_raw)
                
                # If confidence is too low on first try, retry immediately
                if layer1.confidence < 0.6 and retries == 0:
                    retries += 1
                    continue
                
                # ===== LAYER 2: Validator =====
                layer2_prompt = self._build_layer2_prompt(question, layer1.answer, context)
                layer2_raw = await self.llm.generate_json(
                    prompt=layer2_prompt,
                    system_message=LAYER2_SYSTEM_PROMPT,
                    temperature=0.3,
                )
                layer2 = Layer2Output(**layer2_raw)
                
                # Check alignment threshold
                if layer2.alignment_score < 75:
                    if retries < self.max_retries:
                        retries += 1
                        continue
                
                # ===== LAYER 3: Auditor =====
                layer3_prompt = self._build_layer3_prompt(question, layer1.answer, context)
                layer3_raw = await self.llm.generate_json(
                    prompt=layer3_prompt,
                    system_message=LAYER3_SYSTEM_PROMPT,
                    temperature=0.3,
                )
                layer3 = Layer3Output(**layer3_raw)
                
                # Check severity - high severity triggers retry
                if layer3.severity == "high":
                    if retries < self.max_retries:
                        retries += 1
                        continue
                
                # ===== LAYER 4: Scorer =====
                layer4_prompt = self._build_layer4_prompt(question, layer1.answer, context)
                layer4_raw = await self.llm.generate_json(
                    prompt=layer4_prompt,
                    system_message=LAYER4_SYSTEM_PROMPT,
                    temperature=0.2,
                )
                layer4 = Layer4Output(**layer4_raw)
                
                # Check score threshold
                if layer4.score_percentage < 75:
                    if retries < self.max_retries:
                        retries += 1
                        continue
                
                # ===== All layers passed =====
                processing_time = int((time.time() - start_time) * 1000)
                
                # Calculate final confidence score
                final_confidence = min(
                    layer1.confidence * 100,
                    layer2.alignment_score,
                    layer4.score_percentage,
                )
                
                # Build final enhanced answer incorporating feedback
                final_answer = self._build_final_answer(
                    layer1, layer2, layer3, layer4
                )
                
                return {
                    "layer1_output": layer1.model_dump(),
                    "layer2_output": layer2.model_dump(),
                    "layer3_output": layer3.model_dump(),
                    "layer4_output": layer4.model_dump(),
                    "final_answer": final_answer,
                    "confidence_score": round(final_confidence, 2),
                    "referenced_concepts": layer1.referenced_concepts,
                    "retries": retries,
                    "processing_time_ms": processing_time,
                    "status": "completed",
                }
                
            except Exception as e:
                if retries < self.max_retries:
                    retries += 1
                    await asyncio.sleep(1)  # Brief pause before retry
                else:
                    # Max retries reached - return safe failure
                    processing_time = int((time.time() - start_time) * 1000)
                    return self._build_failure_response(question, retries, processing_time, str(e))
        
        # Should not reach here, but just in case
        processing_time = int((time.time() - start_time) * 1000)
        return self._build_failure_response(question, retries, processing_time)
    
    def _build_layer1_prompt(self, question: str, context: str) -> str:
        """Build prompt for Layer 1 (Generator)."""
        return f"""{context}

Question: {question}

Generate a comprehensive answer following CBSE Class 12 standards. 
Include definitions, examples, and proper formatting.

Respond with JSON containing: answer, key_points, referenced_concepts, confidence"""
    
    def _build_layer2_prompt(self, question: str, answer: str, context: str) -> str:
        """Build prompt for Layer 2 (Validator)."""
        return f"""{context}

Question: {question}

Answer to evaluate:
{answer}

Evaluate this answer against CBSE syllabus requirements. Identify missing keywords and irrelevant points.

Respond with JSON containing: syllabus_alignment, missing_keywords, irrelevant_points, alignment_score"""
    
    def _build_layer3_prompt(self, question: str, answer: str, context: str) -> str:
        """Build prompt for Layer 3 (Auditor)."""
        return f"""{context}

Question: {question}

Answer to audit:
{answer}

Check for logical errors, inconsistencies, or factual inaccuracies in this answer.

Respond with JSON containing: logical_errors, severity"""
    
    def _build_layer4_prompt(self, question: str, answer: str, context: str) -> str:
        """Build prompt for Layer 4 (Scorer)."""
        return f"""{context}

Question: {question}

Answer to score:
{answer}

Evaluate this answer using CBSE marking scheme. Provide detailed scoring breakdown.

Respond with JSON containing: predicted_score, max_marks, score_percentage, missing_components"""
    
    def _build_final_answer(
        self,
        layer1: Layer1Output,
        layer2: Layer2Output,
        layer3: Layer3Output,
        layer4: Layer4Output,
    ) -> str:
        """Build the final enhanced answer incorporating layer feedback."""
        final = layer1.answer
        
        # Add any missing components mentioned by scorer if significant
        if layer4.missing_components and layer4.score_percentage < 90:
            final += "\n\n---\n**Additional Points for Higher Score:**\n"
            for component in layer4.missing_components[:3]:  # Max 3 suggestions
                final += f"- {component}\n"
        
        return final.strip()
    
    def _build_failure_response(
        self,
        question: str,
        retries: int,
        processing_time_ms: int,
        error: str | None = None,
    ) -> dict[str, Any]:
        """Build a safe failure response when max retries are exceeded."""
        error_msg = f" (Error: {error})" if error else ""
        
        return {
            "layer1_output": {
                "answer": "We apologize, but we were unable to generate a high-quality answer after multiple attempts.",
                "key_points": [],
                "referenced_concepts": [],
                "confidence": 0.0,
            },
            "layer2_output": {
                "syllabus_alignment": "N/A - Generation failed",
                "missing_keywords": [],
                "irrelevant_points": [],
                "alignment_score": 0.0,
            },
            "layer3_output": {
                "logical_errors": [],
                "severity": "none",
            },
            "layer4_output": {
                "predicted_score": 0.0,
                "max_marks": 5,
                "score_percentage": 0.0,
                "missing_components": [],
            },
            "final_answer": f"""We apologize, but we encountered difficulties generating a reliable answer for your question after {retries} attempts{error_msg}.

**Your Question:** {question}

**What you can try:**
1. Rephrase your question with more specific terms
2. Break down complex questions into simpler parts
3. Check that your question relates to CBSE Class 12 Commerce syllabus

If the problem persists, please try again later.""",
            "confidence_score": 0.0,
            "referenced_concepts": [],
            "retries": retries,
            "processing_time_ms": processing_time_ms,
            "status": "failed",
        }


# Singleton instance
_pipeline: VerificationPipeline | None = None


def get_verification_pipeline() -> VerificationPipeline:
    """Get or create verification pipeline instance."""
    global _pipeline
    if _pipeline is None:
        _pipeline = VerificationPipeline()
    return _pipeline
