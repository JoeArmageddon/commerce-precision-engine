import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { subjectsService } from '@/services/subjects.service';
import type { Subject, Chapter } from '@/types';

const subjectGradients: Record<string, string> = {
  'Accountancy': 'from-apple-blue to-apple-teal',
  'Economics': 'from-apple-green to-apple-teal',
  'Business Studies': 'from-apple-purple to-apple-pink',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

export function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (subjectId) {
      loadSubjectData(subjectId);
    }
  }, [subjectId]);

  const loadSubjectData = async (id: string) => {
    try {
      setIsLoading(true);
      const [subjectData, chaptersData] = await Promise.all([
        subjectsService.getSubjects().then(subjects => 
          subjects.find(s => s.id === id)
        ),
        subjectsService.getChapters(id),
      ]);
      
      if (!subjectData) {
        toast.error('Subject not found');
        navigate('/dashboard');
        return;
      }
      
      setSubject(subjectData);
      setChapters(chaptersData);
    } catch (error) {
      toast.error('Failed to load subject data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = (chapterId?: string) => {
    navigate('/ask', { state: { subjectId, chapterId } });
  };

  const gradient = subjectGradients[subject?.name || ''] || 'from-apple-blue to-apple-purple';

  if (isLoading) {
    return (
      <Layout>
        <Loading fullScreen text="Loading subject..." />
      </Layout>
    );
  }

  if (!subject) return null;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-apple-xl bg-gradient-to-br ${gradient} p-8 text-white shadow-apple-lg`}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                {subject.code}
              </Badge>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI-Enhanced</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-3">{subject.name}</h1>
            {subject.description && (
              <p className="text-white/90 text-lg max-w-2xl">{subject.description}</p>
            )}
            
            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => handleAsk()}
                className="bg-white text-gray-900 hover:bg-white/90 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask General Question
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Chapters Grid */}
        <div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-apple-gray-900 dark:text-white mb-6"
          >
            Chapters
            <span className="ml-3 text-lg font-normal text-apple-gray-500">
              ({chapters.length})
            </span>
          </motion.h2>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-3"
          >
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.id}
                variants={itemVariants}
                whileHover={{ x: 4 }}
              >
                <Card hover className="group">
                  <Card.Body className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-apple-gray-100 to-apple-gray-200 dark:from-apple-gray-800 dark:to-apple-gray-700 flex items-center justify-center text-apple-blue font-bold"
                      >
                        {index + 1}
                      </motion.div>
                      <h3 className="font-semibold text-apple-gray-900 dark:text-white text-lg group-hover:text-apple-blue transition-colors">
                        {chapter.name}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAsk(chapter.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask
                    </Button>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
}
