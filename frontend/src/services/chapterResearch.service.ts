import { api } from '@/services/api';
import { usersService } from '@/services/users.service';

export interface ChapterResearchRequest {
  subject: 'Accountancy' | 'Economics' | 'Business Studies';
  chapter_name: string;
}

export interface Subtopic {
  title: string;
  description: string;
  key_points: string[];
}

export interface ImportantQuestion {
  question: string;
  answer: string;
  marks: number;
  type: 'short' | 'long' | 'very_long';
}

export interface BoardQuestion {
  year: string;
  question: string;
  marks: number;
}

export interface VerificationInfo {
  status: 'verified' | 'needs_review' | 'unreliable';
  confidence_score: number;
  syllabus_alignment: number;
  completeness: number;
  question_authenticity: number;
}

export interface SourceInfo {
  title: string;
  link: string;
  source: string;
}

export interface ChapterResearchResponse {
  chapter_name: string;
  subject: string;
  subtopics: Subtopic[];
  important_questions: ImportantQuestion[];
  board_questions: BoardQuestion[];
  quick_notes: string[];
  mnemonics: string[] | null;
  sources: SourceInfo[];
  verification: VerificationInfo;
  warnings: string[] | null;
  processing_time_ms: number;
  generated_at: string;
}

export interface ResearchStatus {
  status: 'operational' | 'degraded' | 'unavailable';
  llm_available: boolean;
  web_search_available: boolean;
  using_personal_key?: boolean;
  message: string;
}

export const chapterResearchService = {
  /**
   * Research a CBSE Class 12 Commerce chapter
   * This performs real-time web search + AI analysis with verification
   */
  async researchChapter(data: ChapterResearchRequest): Promise<ChapterResearchResponse> {
    // Get user's API keys from localStorage
    const userKeys = usersService.getStoredApiKeys();
    
    // Send keys as headers if available
    const headers: Record<string, string> = {};
    if (userKeys.gemini) headers['X-User-Gemini-Key'] = userKeys.gemini;
    if (userKeys.groq) headers['X-User-Groq-Key'] = userKeys.groq;
    if (userKeys.serpapi) headers['X-User-Serpapi-Key'] = userKeys.serpapi;
    
    const response = await api.post<ChapterResearchResponse>(
      '/chapter-research/research', 
      data,
      { headers }
    );
    return response.data;
  },

  /**
   * Check if chapter research service is operational
   */
  async getStatus(): Promise<ResearchStatus> {
    // Get user's API keys from localStorage
    const userKeys = usersService.getStoredApiKeys();
    
    // Send keys as headers if available
    const headers: Record<string, string> = {};
    if (userKeys.gemini) headers['X-User-Gemini-Key'] = userKeys.gemini;
    if (userKeys.groq) headers['X-User-Groq-Key'] = userKeys.groq;
    if (userKeys.serpapi) headers['X-User-Serpapi-Key'] = userKeys.serpapi;
    
    const response = await api.get<ResearchStatus>('/chapter-research/status', { headers });
    return response.data;
  },
};
