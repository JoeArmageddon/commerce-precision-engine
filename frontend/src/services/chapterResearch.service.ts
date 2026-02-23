import { api } from '@/services/api';

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
  message: string;
}

export const chapterResearchService = {
  /**
   * Research a CBSE Class 12 Commerce chapter
   * This performs real-time web search + AI analysis with verification
   */
  async researchChapter(data: ChapterResearchRequest): Promise<ChapterResearchResponse> {
    const response = await api.post<ChapterResearchResponse>('/chapter-research/research', data);
    return response.data;
  },

  /**
   * Check if chapter research service is operational
   */
  async getStatus(): Promise<ResearchStatus> {
    const response = await api.get<ResearchStatus>('/chapter-research/status');
    return response.data;
  },
};
