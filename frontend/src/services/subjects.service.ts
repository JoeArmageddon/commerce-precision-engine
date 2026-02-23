import { api } from './api';
import type { Subject, Chapter } from '@/types';

const DEMO_MODE = true;

// Load subjects from local storage or use defaults
const loadSubjects = (): Subject[] => {
  const saved = localStorage.getItem('user_syllabi');
  if (saved) {
    try {
      const syllabi = JSON.parse(saved);
      return syllabi.map((s: any) => ({
        id: s.subjectId,
        name: s.subjectName,
        code: s.subjectId.toUpperCase().slice(0, 4),
        description: `${s.chapters.length} chapters uploaded`,
        created_at: s.uploadedAt || new Date().toISOString(),
      }));
    } catch {
      return getDefaultSubjects();
    }
  }
  return getDefaultSubjects();
};

const getDefaultSubjects = (): Subject[] => [
  {
    id: 'accountancy',
    name: 'Accountancy',
    code: 'ACCT',
    description: 'Upload your syllabus to see chapters',
    created_at: new Date().toISOString(),
  },
  {
    id: 'bst',
    name: 'Business Studies',
    code: 'BST',
    description: 'Upload your syllabus to see chapters',
    created_at: new Date().toISOString(),
  },
  {
    id: 'economics',
    name: 'Economics',
    code: 'ECO',
    description: 'Upload your syllabus to see chapters',
    created_at: new Date().toISOString(),
  },
];

// Load chapters from local storage
const loadChapters = (subjectId: string): Chapter[] => {
  const saved = localStorage.getItem('user_syllabi');
  if (saved) {
    try {
      const syllabi = JSON.parse(saved);
      const subject = syllabi.find((s: any) => s.subjectId === subjectId);
      if (subject && subject.chapters) {
        return subject.chapters.map((c: any) => ({
          id: c.id,
          subject_id: subjectId,
          name: c.name,
          chapter_number: c.chapterNumber,
          created_at: c.createdAt || new Date().toISOString(),
        }));
      }
    } catch {
      // ignore
    }
  }
  return [];
};

export const subjectsService = {
  async getSubjects(): Promise<Subject[]> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return loadSubjects();
    }
    const response = await api.get<Subject[]>('/subjects');
    return response.data;
  },

  async getChapters(subjectId: string): Promise<Chapter[]> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return loadChapters(subjectId);
    }
    const response = await api.get<Chapter[]>(`/subjects/${subjectId}/chapters`);
    return response.data;
  },

  async seedSubjects(): Promise<{ message: string }> {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: 'Demo data loaded successfully' };
    }
    const response = await api.post<{ message: string }>('/subjects/seed');
    return response.data;
  },
};
