import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  TrendingUp, 
  Briefcase, 
  ArrowRight, 
  Clock, 
  Sparkles,
  Upload,
  Brain,
  Settings,
  FlaskConical,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { subjectsService } from '@/services/subjects.service';
import { questionsService } from '@/services/questions.service';
import type { Subject, Question } from '@/types';

const subjectIcons: Record<string, typeof Calculator> = {
  'Accountancy': Calculator,
  'Economics': TrendingUp,
  'Business Studies': Briefcase,
};

const subjectGradients: Record<string, string> = {
  'Accountancy': 'from-apple-blue to-apple-teal',
  'Economics': 'from-apple-green to-apple-teal',
  'Business Studies': 'from-apple-purple to-apple-pink',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subjectsData, historyData] = await Promise.all([
        subjectsService.getSubjects(),
        questionsService.getQuestionHistory(5, 0),
      ]);
      setSubjects(subjectsData);
      setRecentQuestions(historyData.questions);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-apple-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10"
      >
        {/* Alpha Banner */}
        <motion.div variants={itemVariants}>
          <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-200">
                    Alpha Version 0.1
                  </h3>
                  <span className="px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-[10px] font-bold rounded-full">
                    TESTING
                  </span>
                </div>
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  This is an early preview. Upload your syllabus and study materials for personalized AI help.
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => navigate('/syllabus')}
                className="hidden sm:flex"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Syllabus
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { 
                icon: Upload, 
                label: 'Upload Syllabus', 
                color: 'from-blue-500 to-cyan-500',
                onClick: () => navigate('/syllabus')
              },
              { 
                icon: FileText, 
                label: 'Study Materials', 
                color: 'from-purple-500 to-pink-500',
                onClick: () => navigate('/study-materials')
              },
              { 
                icon: Brain, 
                label: 'Ask AI', 
                color: 'from-green-500 to-emerald-500',
                onClick: () => navigate('/ask')
              },
              { 
                icon: Settings, 
                label: 'Settings', 
                color: 'from-orange-500 to-red-500',
                onClick: () => navigate('/settings')
              },
            ].map((action, index) => (
              <motion.button
                key={action.label}
                onClick={action.onClick}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 bg-white dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-xl text-left hover:shadow-lg transition-all"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-apple-gray-900 dark:text-white">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-apple-purple" />
            <span className="text-sm font-medium text-apple-purple">AI-Powered Learning</span>
          </div>
          <h1 className="text-4xl font-bold text-apple-gray-900 dark:text-white">
            Choose a Subject
          </h1>
          <p className="text-apple-gray-500 dark:text-apple-gray-400 mt-2 text-lg">
            Select a subject to start asking questions with 4-layer verification
          </p>
        </motion.div>

        {/* Subjects Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const Icon = subjectIcons[subject.name] || Calculator;
            const gradient = subjectGradients[subject.name] || 'from-apple-gray-400 to-apple-gray-600';
            
            return (
              <motion.div
                key={subject.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  hover
                  onClick={() => navigate(`/subject/${subject.id}`)}
                  className="h-full cursor-pointer group overflow-hidden"
                >
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                  
                  <Card.Body className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        className="w-10 h-10 rounded-full bg-apple-gray-100 dark:bg-apple-gray-800 flex items-center justify-center group-hover:bg-apple-blue/10 transition-colors"
                      >
                        <ArrowRight className="w-5 h-5 text-apple-gray-400 group-hover:text-apple-blue transition-colors" />
                      </motion.div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-apple-gray-900 dark:text-white mb-1">
                      {subject.name}
                    </h3>
                    <Badge variant="default" size="sm">
                      {subject.code}
                    </Badge>
                    
                    {subject.description && (
                      <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400 mt-3 line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Questions */}
        {recentQuestions.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-apple-gray-900 dark:text-white">
                Recent Questions
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/history')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <Card
                    hover
                    onClick={() => navigate(`/answer/${question.id}`)}
                    className="cursor-pointer"
                  >
                    <Card.Body className="flex items-center justify-between py-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-apple-gray-900 dark:text-white truncate">
                          {question.question_text}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-sm text-apple-gray-500">
                          <Badge variant="default" size="sm">
                            {question.subject?.name}
                          </Badge>
                          {question.chapter && (
                            <span className="truncate">{question.chapter.name}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(question.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {question.answer && (
                        <div className="flex items-center gap-3 ml-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            question.answer.confidence_score >= 80
                              ? 'bg-apple-green/10 text-apple-green'
                              : question.answer.confidence_score >= 60
                              ? 'bg-apple-orange/10 text-apple-orange'
                              : 'bg-apple-red/10 text-apple-red'
                          }`}>
                            {Math.round(question.answer.confidence_score)}%
                          </span>
                          <ArrowRight className="w-5 h-5 text-apple-gray-400" />
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}
