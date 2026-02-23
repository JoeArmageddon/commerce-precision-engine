"""
Web Search Service for CBSE Commerce content research.
Uses SerpAPI for real-time Google search results.
"""
import httpx
import asyncio
from typing import Any
from src.config import get_settings

settings = get_settings()


class WebSearchService:
    """
    Service for searching CBSE-specific content on the web.
    Uses SerpAPI (Google Search API) for real-time results.
    """
    
    def __init__(self):
        self.serpapi_key = settings.serpapi_key if hasattr(settings, 'serpapi_key') else None
        self.base_url = "https://serpapi.com/search"
    
    async def search_cbse_content(
        self,
        subject: str,
        chapter_name: str,
        query_type: str = "general"
    ) -> dict[str, Any]:
        """
        Search for CBSE Class 12 Commerce chapter content.
        
        Args:
            subject: Subject name (Accountancy, Economics, Business Studies)
            chapter_name: Chapter name
            query_type: Type of search (general, board_questions, notes, etc.)
            
        Returns:
            Dictionary with search results
        """
        # Build targeted search queries
        queries = self._build_queries(subject, chapter_name, query_type)
        
        # Run searches in parallel
        results = await asyncio.gather(
            *[self._execute_search(q) for q in queries],
            return_exceptions=True
        )
        
        # Aggregate results
        aggregated = {
            "chapter_name": chapter_name,
            "subject": subject,
            "sources": [],
            "content_snippets": [],
            "board_questions": [],
            "study_materials": [],
        }
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                continue
            
            query = queries[i]
            
            # Extract organic results
            organic_results = result.get("organic_results", [])
            for item in organic_results[:5]:  # Top 5 per query
                source = {
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                    "source": self._extract_domain(item.get("link", "")),
                }
                aggregated["sources"].append(source)
                
                if item.get("snippet"):
                    aggregated["content_snippets"].append(item["snippet"])
            
            # Extract any related questions (People Also Ask)
            related_questions = result.get("related_questions", [])
            for q in related_questions[:5]:
                aggregated["board_questions"].append({
                    "question": q.get("question", ""),
                    "source": "people_also_ask",
                })
        
        # Deduplicate sources
        seen_links = set()
        unique_sources = []
        for source in aggregated["sources"]:
            if source["link"] not in seen_links:
                seen_links.add(source["link"])
                unique_sources.append(source)
        aggregated["sources"] = unique_sources[:15]  # Keep top 15
        
        return aggregated
    
    async def search_board_questions(
        self,
        subject: str,
        chapter_name: str,
    ) -> list[dict[str, Any]]:
        """
        Specifically search for previous year board questions.
        
        Args:
            subject: Subject name
            chapter_name: Chapter name
            
        Returns:
            List of board questions with metadata
        """
        queries = [
            f"CBSE Class 12 {subject} {chapter_name} previous year questions",
            f"CBSE {subject} {chapter_name} board exam questions 2024 2023 2022",
            f"Class 12 {subject} {chapter_name} important questions CBSE",
        ]
        
        results = await asyncio.gather(
            *[self._execute_search(q) for q in queries],
            return_exceptions=True
        )
        
        questions = []
        for result in results:
            if isinstance(result, Exception):
                continue
            
            organic = result.get("organic_results", [])
            for item in organic[:10]:
                title = item.get("title", "")
                snippet = item.get("snippet", "")
                
                # Extract year if present
                year = self._extract_year(title + " " + snippet)
                
                # Check if it looks like a question
                if "?" in title or "question" in title.lower() or "marks" in title.lower():
                    questions.append({
                        "question": title if "?" in title else snippet[:200],
                        "source": self._extract_domain(item.get("link", "")),
                        "year": year,
                        "marks": self._estimate_marks(title + " " + snippet),
                    })
        
        return questions[:20]  # Return top 20
    
    async def _execute_search(self, query: str) -> dict[str, Any]:
        """Execute a single search query via SerpAPI."""
        if not self.serpapi_key:
            # Fallback: return empty results if no API key
            return {"organic_results": []}
        
        async with httpx.AsyncClient(timeout=30) as client:
            params = {
                "q": query,
                "api_key": self.serpapi_key,
                "engine": "google",
                "hl": "en",
                "gl": "in",  # India-specific results
                "num": 10,
            }
            
            response = await client.get(self.base_url, params=params)
            
            if response.status_code != 200:
                raise Exception(f"SerpAPI error: {response.status_code} - {response.text}")
            
            return response.json()
    
    def _build_queries(
        self,
        subject: str,
        chapter_name: str,
        query_type: str
    ) -> list[str]:
        """Build targeted search queries."""
        base = f"CBSE Class 12 {subject} {chapter_name}"
        
        queries = [
            f"{base} notes summary",
            f"{base} important concepts",
            f"{base} NCERT solutions",
        ]
        
        if query_type == "board_questions":
            queries = [
                f"{base} previous year board questions",
                f"{base} CBSE exam questions 2024 2023",
                f"{base} important questions for board exam",
            ]
        elif query_type == "quick_notes":
            queries = [
                f"{base} quick revision notes",
                f"{base} key points to remember",
                f"{base} formulas and definitions",
            ]
        
        return queries
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL."""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            return parsed.netloc.replace("www.", "")
        except:
            return "unknown"
    
    def _extract_year(self, text: str) -> str | None:
        """Extract year from text (2020-2025)."""
        import re
        years = re.findall(r'20(2[0-5])', text)
        if years:
            return f"20{years[0]}"
        return None
    
    def _estimate_marks(self, text: str) -> int | None:
        """Estimate marks from text content."""
        import re
        # Look for patterns like "2 marks", "4 Marks", etc.
        match = re.search(r'(\d+)\s*marks?', text.lower())
        if match:
            marks = int(match.group(1))
            if marks in [1, 2, 3, 4, 5, 6, 8]:
                return marks
        return None


# Singleton instance
_search_service: WebSearchService | None = None


def get_web_search_service() -> WebSearchService:
    """Get or create web search service instance."""
    global _search_service
    if _search_service is None:
        _search_service = WebSearchService()
    return _search_service
