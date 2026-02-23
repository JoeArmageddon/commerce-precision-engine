import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Plus, 
  Trash2, 
  BookOpen,
  Check,
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface Chapter {
  id: string;
  name: string;
  chapterNumber: number;
}

interface SubjectSyllabus {
  subjectId: string;
  subjectName: string;
  syllabusText?: string;
  chapters: Chapter[];
  uploadedAt?: string;
}

export function SyllabusPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<SubjectSyllabus[]>([]);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [syllabusText, setSyllabusText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  // Load saved syllabi on mount
  useEffect(() => {
    const saved = localStorage.getItem('user_syllabi');
    if (saved) {
      try {
        setSubjects(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    } else {
      // Default empty subjects
      setSubjects([
        { subjectId: 'accountancy', subjectName: 'Accountancy', chapters: [] },
        { subjectId: 'bst', subjectName: 'Business Studies', chapters: [] },
        { subjectId: 'economics', subjectName: 'Economics', chapters: [] },
      ]);
    }
  }, []);

  const saveSubjects = (newSubjects: SubjectSyllabus[]) => {
    setSubjects(newSubjects);
    localStorage.setItem('user_syllabi', JSON.stringify(newSubjects));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, subjectId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setActiveSubject(subjectId);

    try {
      // Simulate file reading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, you'd extract text from PDF/image
      // For demo, we'll simulate extracted text
      const mockExtractedText = `[Extracted from ${file.name}]\n\nChapter 1: Introduction\nChapter 2: Core Concepts\nChapter 3: Advanced Topics\nChapter 4: Case Studies\nChapter 5: Revision`;

      const updated = subjects.map(s => 
        s.subjectId === subjectId 
          ? { 
              ...s, 
              syllabusText: mockExtractedText,
              uploadedAt: new Date().toISOString(),
              chapters: [
                { id: '1', name: 'Introduction', chapterNumber: 1 },
                { id: '2', name: 'Core Concepts', chapterNumber: 2 },
                { id: '3', name: 'Advanced Topics', chapterNumber: 3 },
                { id: '4', name: 'Case Studies', chapterNumber: 4 },
                { id: '5', name: 'Revision', chapterNumber: 5 },
              ]
            }
          : s
      );

      saveSubjects(updated);
      toast.success(`Syllabus uploaded for ${subjects.find(s => s.subjectId === subjectId)?.subjectName}`);
    } catch (error) {
      toast.error('Failed to upload syllabus');
    } finally {
      setIsUploading(false);
      setActiveSubject(null);
    }
  };

  const handleManualSyllabus = (subjectId: string) => {
    if (!syllabusText.trim()) {
      toast.error('Please enter syllabus content');
      return;
    }

    // Parse chapters from text (simple line-by-line parsing)
    const lines = syllabusText.split('\n').filter(l => l.trim());
    const chapters: Chapter[] = lines.map((line, index) => ({
      id: `ch-${Date.now()}-${index}`,
      name: line.replace(/^chapter\s*\d*[.:]?\s*/i, '').trim(),
      chapterNumber: index + 1,
    }));

    const updated = subjects.map(s => 
      s.subjectId === subjectId 
        ? { 
            ...s, 
            syllabusText,
            uploadedAt: new Date().toISOString(),
            chapters
          }
        : s
    );

    saveSubjects(updated);
    setSyllabusText('');
    setShowTextInput(false);
    toast.success('Syllabus saved successfully!');
  };

  const addChapter = (subjectId: string) => {
    if (!newChapterName.trim()) {
      toast.error('Please enter chapter name');
      return;
    }

    const updated = subjects.map(s => {
      if (s.subjectId === subjectId) {
        const newChapter: Chapter = {
          id: `ch-${Date.now()}`,
          name: newChapterName.trim(),
          chapterNumber: s.chapters.length + 1,
        };
        return { ...s, chapters: [...s.chapters, newChapter] };
      }
      return s;
    });

    saveSubjects(updated);
    setNewChapterName('');
    setShowAddChapter(false);
    toast.success('Chapter added');
  };

  const deleteChapter = (subjectId: string, chapterId: string) => {
    const updated = subjects.map(s => {
      if (s.subjectId === subjectId) {
        const filtered = s.chapters.filter(c => c.id !== chapterId);
        // Re-number chapters
        const renumbered = filtered.map((c, idx) => ({ ...c, chapterNumber: idx + 1 }));
        return { ...s, chapters: renumbered };
      }
      return s;
    });

    saveSubjects(updated);
    toast.success('Chapter removed');
  };

  const clearSyllabus = (subjectId: string) => {
    if (confirm('Are you sure you want to clear this syllabus?')) {
      const updated = subjects.map(s => 
        s.subjectId === subjectId 
          ? { ...s, syllabusText: undefined, uploadedAt: undefined, chapters: [] }
          : s
      );
      saveSubjects(updated);
      toast.success('Syllabus cleared');
    }
  };

  return (
    <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-apple-gray-900/80 backdrop-blur-xl border-b border-apple-gray-200 dark:border-apple-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
            Manage Syllabus
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full mb-3">
              <Sparkles className="w-3 h-3" />
              Alpha Feature
            </div>
            <h2 className="text-2xl font-bold text-apple-gray-900 dark:text-white">
              Upload Your Syllabus
            </h2>
            <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-1">
              Upload your CBSE syllabus PDF or enter chapters manually. The AI will use this to provide accurate, syllabus-aligned answers.
            </p>
          </div>

          {/* Subjects */}
          <div className="space-y-6">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.subjectId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <Card.Body className="p-6">
                    {/* Subject Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-apple-gray-900 dark:text-white">
                            {subject.subjectName}
                          </h3>
                          <p className="text-sm text-apple-gray-500">
                            {subject.chapters.length} chapters
                            {subject.uploadedAt && ' • Syllabus uploaded'}
                          </p>
                        </div>
                      </div>
                      {subject.syllabusText && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearSyllabus(subject.subjectId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Upload Options */}
                    {!subject.syllabusText && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {/* File Upload */}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileUpload(e, subject.subjectId)}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-apple-gray-300 dark:border-apple-gray-700 rounded-xl hover:border-apple-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                            <Upload className="w-5 h-5 text-apple-gray-500" />
                            <span className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                              {isUploading && activeSubject === subject.subjectId 
                                ? 'Uploading...' 
                                : 'Upload PDF/Image'}
                            </span>
                          </div>
                        </label>

                        {/* Manual Entry */}
                        <button
                          onClick={() => setShowTextInput(showTextInput === subject.subjectId ? null : subject.subjectId as any)}
                          className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-apple-gray-300 dark:border-apple-gray-700 rounded-xl hover:border-apple-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                          <FileText className="w-5 h-5 text-apple-gray-500" />
                          <span className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                            Type Manually
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Manual Text Input */}
                    {showTextInput === subject.subjectId && (
                      <div className="mb-4 p-4 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-xl">
                        <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-2">
                          Enter chapter names (one per line):
                        </p>
                        <textarea
                          value={syllabusText}
                          onChange={(e) => setSyllabusText(e.target.value)}
                          placeholder="Chapter 1: Introduction&#10;Chapter 2: Theory&#10;Chapter 3: Applications"
                          className="w-full h-32 px-4 py-3 rounded-xl bg-white dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 text-apple-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
                        />
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleManualSyllabus(subject.subjectId)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowTextInput(null)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Chapters List */}
                    {subject.chapters.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
                            Chapters
                          </h4>
                          <button
                            onClick={() => setShowAddChapter(showAddChapter === subject.subjectId ? null : subject.subjectId as any)}
                            className="text-sm text-apple-blue hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add Chapter
                          </button>
                        </div>

                        {/* Add Chapter Input */}
                        {showAddChapter === subject.subjectId && (
                          <div className="flex gap-2 p-2 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-lg">
                            <Input
                              placeholder="Chapter name"
                              value={newChapterName}
                              onChange={(e) => setNewChapterName(e.target.value)}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={() => addChapter(subject.subjectId)}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setShowAddChapter(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        {/* Chapter Items */}
                        <div className="space-y-1">
                          {subject.chapters.map((chapter) => (
                            <div
                              key={chapter.id}
                              className="flex items-center justify-between p-3 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-apple-gray-200 dark:bg-apple-gray-700 text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400 flex items-center justify-center">
                                  {chapter.chapterNumber}
                                </span>
                                <span className="text-sm text-apple-gray-900 dark:text-white">
                                  {chapter.name}
                                </span>
                              </div>
                              <button
                                onClick={() => deleteChapter(subject.subjectId, chapter.id)}
                                className="p-1 text-apple-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {!subject.syllabusText && subject.chapters.length === 0 && (
                      <div className="text-center py-8 text-apple-gray-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No syllabus uploaded yet</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Why upload your syllabus?
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  The AI uses your specific syllabus to provide accurate, relevant answers that align with your curriculum. 
                  Without a syllabus, answers may be generic.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
