import { api } from '@/services/api';
import { usersService } from '@/services/users.service';

export interface ChapterResearchRequest {
  subject: 'Accountancy' | 'Economics' | 'Business Studies';
  chapter_name: string;
}

export interface DeepResearchRequest {
  subject: 'Accountancy' | 'Economics' | 'Business Studies';
  chapter_name: string;
  include_previous_year?: boolean;
  include_case_studies?: boolean;
}

export interface AskQuestionRequest {
  subject: 'Accountancy' | 'Economics' | 'Business Studies';
  chapter_name?: string;
  question: string;
}

export interface AskQuestionResponse {
  answer: string;
  key_points: string[];
  confidence: number;
  sources: string[];
  processing_time_ms: number;
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

// Helper to get headers with user API keys
const getApiKeyHeaders = (): Record<string, string> => {
  const userKeys = usersService.getStoredApiKeys();
  const headers: Record<string, string> = {};
  if (userKeys.gemini) headers['X-User-Gemini-Key'] = userKeys.gemini;
  if (userKeys.groq) headers['X-User-Groq-Key'] = userKeys.groq;
  if (userKeys.serpapi) headers['X-User-Serpapi-Key'] = userKeys.serpapi;
  return headers;
};

export const chapterResearchService = {
  /**
   * Research a CBSE Class 12 Commerce chapter (quick mode)
   */
  async researchChapter(data: ChapterResearchRequest): Promise<ChapterResearchResponse> {
    const response = await api.post<ChapterResearchResponse>(
      '/chapter-research/research',
      data,
      { headers: getApiKeyHeaders() }
    );
    return response.data;
  },

  /**
   * Deep research a chapter with comprehensive analysis (slower but more detailed)
   */
  async deepResearch(data: DeepResearchRequest): Promise<ChapterResearchResponse> {
    const response = await api.post<ChapterResearchResponse>(
      '/chapter-research/deep-research',
      data,
      { 
        headers: getApiKeyHeaders(),
        timeout: 310000, // 5+ minutes for deep research
      }
    );
    return response.data;
  },

  /**
   * Ask a specific question about a chapter
   */
  async askQuestion(data: AskQuestionRequest): Promise<AskQuestionResponse> {
    const response = await api.post<AskQuestionResponse>(
      '/chapter-research/ask',
      data,
      { headers: getApiKeyHeaders() }
    );
    return response.data;
  },

  /**
   * Check if chapter research service is operational
   */
  async getStatus(): Promise<ResearchStatus> {
    const response = await api.get<ResearchStatus>('/chapter-research/status', {
      headers: getApiKeyHeaders(),
    });
    return response.data;
  },
};
