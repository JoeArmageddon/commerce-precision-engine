// Auth Types
export interface User {
  id: string;
  access_code: string;
  created_at: string;
}

export interface LoginRequest {
  access_code: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Subject Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  display_order: number;
}

// Question Types
export interface Layer1Output {
  answer: string;
  key_points: string[];
  referenced_concepts: string[];
  confidence: number;
}

export interface Layer2Output {
  syllabus_alignment: string;
  missing_keywords: string[];
  irrelevant_points: string[];
  alignment_score: number;
}

export interface Layer3Output {
  logical_errors: string[];
  severity: 'none' | 'low' | 'medium' | 'high';
}

export interface Layer4Output {
  predicted_score: number;
  max_marks: number;
  score_percentage: number;
  missing_components: string[];
}

export interface Answer {
  id: string;
  question_id: string;
  layer1_output: Layer1Output;
  layer2_output: Layer2Output;
  layer3_output: Layer3Output;
  layer4_output: Layer4Output;
  final_answer: string;
  confidence_score: number;
  referenced_concepts: string[];
  retries: number;
  processing_time_ms: number | null;
  status: string;
  created_at: string;
}

export interface Question {
  id: string;
  user_id: string;
  subject_id: string;
  chapter_id: string | null;
  question_text: string;
  created_at: string;
  subject: Subject | null;
  chapter: Chapter | null;
  answer: Answer | null;
}

export interface QuestionHistoryResponse {
  questions: Question[];
  total: number;
}

export interface AskQuestionRequest {
  subject_id: string;
  chapter_id?: string;
  question_text: string;
}

// Health Check
export interface HealthCheck {
  status: string;
  timestamp: string;
  version: string;
}
