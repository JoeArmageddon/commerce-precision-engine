"""
LLM Service with Gemini Primary + Groq Fallback.
"""
import json
import asyncio
from typing import Any
import httpx
from src.config import get_settings

settings = get_settings()


class LLMService:
    """
    Service for LLM operations with Gemini primary and Groq fallback.
    
    Flow:
    1. Try Gemini first (Google's model)
    2. If Gemini fails (rate limit, error, etc.), fall back to Groq (Llama 3)
    3. If both fail, raise exception
    """
    
    def __init__(self):
        self.gemini_api_key = settings.gemini_api_key
        self.groq_api_key = settings.groq_api_key
        
        if not self.gemini_api_key and not self.groq_api_key:
            raise ValueError("At least one API key (GEMINI_API_KEY or GROQ_API_KEY) is required")
    
    async def generate_json(
        self,
        prompt: str,
        system_message: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> dict[str, Any]:
        """
        Generate a JSON response using Gemini (primary) or Groq (fallback).
        
        Args:
            prompt: The user prompt
            system_message: Optional system message
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            
        Returns:
            Parsed JSON response
        """
        errors = []
        
        # Try Gemini first (Primary)
        if self.gemini_api_key:
            try:
                result = await self._call_gemini(prompt, system_message, temperature, max_tokens)
                return result
            except Exception as e:
                errors.append(f"Gemini failed: {str(e)}")
                # Continue to fallback
        
        # Fallback to Groq
        if self.groq_api_key:
            try:
                result = await self._call_groq(prompt, system_message, temperature, max_tokens)
                return result
            except Exception as e:
                errors.append(f"Groq failed: {str(e)}")
        
        # Both failed
        raise Exception(f"All LLM providers failed. Errors: {'; '.join(errors)}")
    
    async def _call_gemini(
        self,
        prompt: str,
        system_message: str | None,
        temperature: float,
        max_tokens: int,
    ) -> dict[str, Any]:
        """Call Google Gemini API."""
        # Combine system message with prompt if provided
        full_prompt = prompt
        if system_message:
            full_prompt = f"{system_message}\n\n{prompt}"
        
        # Add JSON instruction
        full_prompt += "\n\nRespond ONLY with valid JSON."
        
        async with httpx.AsyncClient(timeout=settings.max_llm_timeout) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": full_prompt}]}],
                    "generationConfig": {
                        "temperature": temperature,
                        "maxOutputTokens": max_tokens,
                        "responseMimeType": "application/json",
                    },
                },
            )
            
            if response.status_code != 200:
                error_data = response.json() if response.text else {}
                error_msg = error_data.get("error", {}).get("message", response.text)
                raise Exception(f"Gemini API error ({response.status_code}): {error_msg}")
            
            data = response.json()
            
            # Check for blocked content
            if "candidates" not in data or not data["candidates"]:
                raise Exception("Gemini returned no candidates (content may be blocked)")
            
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(content)
    
    async def _call_groq(
        self,
        prompt: str,
        system_message: str | None,
        temperature: float,
        max_tokens: int,
    ) -> dict[str, Any]:
        """Call Groq API (Llama 3)."""
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt + "\n\nRespond ONLY with valid JSON."})
        
        async with httpx.AsyncClient(timeout=settings.max_llm_timeout) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.1-70b-versatile",
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "response_format": {"type": "json_object"},
                },
            )
            
            if response.status_code != 200:
                error_data = response.json() if response.text else {}
                error_msg = error_data.get("error", {}).get("message", response.text)
                raise Exception(f"Groq API error ({response.status_code}): {error_msg}")
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)


# Singleton instance
_llm_service: LLMService | None = None


def get_llm_service() -> LLMService:
    """Get or create LLM service instance."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
