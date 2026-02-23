import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Brain, 
  Shield, 
  FileCheck, 
  Award,
  Upload,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { LoadingOverlay } from '@/components/ui/Loading';

import { subjectsService } from '@/services/subjects.service';
import { questionsService } from '@/services/questions.service';
import type { Subject, Chapter } from '@/types';

const layers = [
  { icon: Brain, name: 'Generator', desc: 'Creates initial answer', color: 'bg-apple-blue' },
  { icon: Shield, name: 'Validator', desc: 'Checks syllabus alignment', color: 'bg-apple-purple' },
  { icon: FileCheck, name: 'Auditor', desc: 'Reviews logical errors', color: 'bg-apple-orange' },
  { icon: Award, name: 'Scorer', desc: 'Evaluates CBSE marking', color: 'bg-apple-green' },
];

export function AskPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { subjectId, chapterId } = location.state || {};
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectId || '');
  const [selectedChapter, setSelectedChapter] = useState<string>(chapterId || '');
  const [questionText, setQuestionText] = useState('');
  const [, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSyllabus, setHasSyllabus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSubjects();
    checkSyllabi();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadChapters(selectedSubject);
    }
  }, [selectedSubject]);

  const checkSyllabi = () => {
    const saved = localStorage.getItem('user_syllabi');
    if (saved) {
      try {
        const syllabi = JSON.parse(saved);
        const syllabusStatus: Record<string, boolean> = {};
        syllabi.forEach((s: any) => {
          syllabusStatus[s.subjectId] = s.chapters && s.chapters.length > 0;
        });
        setHasSyllabus(syllabusStatus);
      } catch {
        // ignore
      }
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await subjectsService.getSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error('Failed to load subjects');
    }
  };

  const loadChapters = async (subjectId: string) => {
    try {
      setIsLoading(true);
      const data = await subjectsService.getChapters(subjectId);
      setChapters(data);
    } catch (error) {
      toast.error('Failed to load chapters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    if (!questionText.trim() || questionText.length < 10) {
      toast.error('Question must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await questionsService.askQuestion({
        subject_id: selectedSubject,
        chapter_id: selectedChapter || undefined,
        question_text: questionText.trim(),
      });

      toast.success('Answer generated successfully!');
      navigate(`/answer/${response.id}`);
    } catch (error) {
      setIsSubmitting(false);
    }
  };



  return (
    <Layout>
      <AnimatePresence>
        {isSubmitting && <LoadingOverlay text="Processing through 4-layer pipeline..." />}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(selectedSubject ? `/subject/${selectedSubject}` : '/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        <Card className="overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-apple-blue via-apple-purple to-apple-pink p-8 text-white">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">AI Answer Engine</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Ask a Question</h1>
              <p className="text-white/80">
                Get a comprehensive, CBSE-aligned answer with 4-layer verification
              </p>
            </motion.div>
          </div>

          <Card.Body className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Subject Selection */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-3">
                  Subject <span className="text-apple-red">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {subjects.map((subject, index) => {
                    const hasChapters = hasSyllabus[subject.id];
                    return (
                      <motion.button
                        key={subject.id}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedSubject(subject.id);
                          setSelectedChapter('');
                        }}
                        className={`p-4 rounded-apple text-left transition-all border-2 relative ${
                          selectedSubject === subject.id
                            ? 'border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10'
                            : 'border-apple-gray-200 dark:border-apple-gray-700 hover:border-apple-blue/50'
                        }`}
                      >
                        <p className="font-semibold text-apple-gray-900 dark:text-white">
                          {subject.name}
                        </p>
                        <p className="text-xs text-apple-gray-500 mt-1">{subject.code}</p>
                        {!hasChapters && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-3 h-3" />
                            <span>No syllabus</span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* No Syllabus Warning */}
              <AnimatePresence>
                {selectedSubject && !hasSyllabus[selectedSubject] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                          No Syllabus Uploaded
                        </h4>
                        <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                          For best results, upload your syllabus so the AI can provide more accurate, 
                          curriculum-aligned answers.
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => navigate('/syllabus')}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Syllabus
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chapter Selection */}
              <AnimatePresence>
                {selectedSubject && chapters.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-3">
                      Chapter <span className="text-apple-gray-400">(Optional)</span>
                    </label>
                    <select
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(e.target.value)}
                      className="w-full px-5 py-4 rounded-apple bg-apple-gray-50 dark:bg-apple-gray-800/50 border border-apple-gray-200 dark:border-apple-gray-700 text-apple-gray-900 dark:text-white focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all"
                    >
                      <option value="">General question (no specific chapter)</option>
                      {chapters.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                          Chapter {chapter.display_order}: {chapter.name}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Question Input */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-3">
                  Your Question <span className="text-apple-red">*</span>
                </label>
                <TextArea
                  placeholder="e.g., Explain the concept of partnership accounting and its key principles..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={5}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-apple-gray-500">
                    Minimum 10 characters
                  </p>
                  <p className={`text-xs ${
                    questionText.length >= 10 ? 'text-apple-green' : 'text-apple-gray-400'
                  }`}>
                    {questionText.length} chars
                  </p>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={!selectedSubject || questionText.length < 10}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Processing...' : 'Get AI Answer'}
                </Button>
              </motion.div>

              {/* 4-Layer Pipeline Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-apple p-6"
              >
                <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-apple-purple" />
                  4-Layer Verification Pipeline
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {layers.map((layer, index) => {
                    const Icon = layer.icon;
                    return (
                      <motion.div
                        key={layer.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="text-center"
                      >
                        <div className={`w-12 h-12 mx-auto rounded-xl ${layer.color}/10 flex items-center justify-center mb-2`}>
                          <Icon className={`w-6 h-6 ${layer.color.replace('bg-', 'text-')}`} />
                        </div>
                        <p className="text-xs font-medium text-apple-gray-900 dark:text-white">{layer.name}</p>
                        <p className="text-xs text-apple-gray-500">{layer.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
                <p className="text-xs text-apple-gray-500 text-center mt-4">
                  Processing time: up to 2 minutes
                </p>
              </motion.div>
            </form>
          </Card.Body>
        </Card>
      </motion.div>
    </Layout>
  );
}
