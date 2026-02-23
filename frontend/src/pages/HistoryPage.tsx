import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { questionsService } from '@/services/questions.service';
import type { Question } from '@/types';

const ITEMS_PER_PAGE = 10;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function HistoryPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [offset]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await questionsService.getQuestionHistory(ITEMS_PER_PAGE, offset);
      setQuestions(data.questions);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load question history');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const currentPage = Math.floor(offset / ITEMS_PER_PAGE) + 1;

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - ITEMS_PER_PAGE));
    }
  };

  const handleNextPage = () => {
    if (offset + ITEMS_PER_PAGE < total) {
      setOffset(offset + ITEMS_PER_PAGE);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-apple-gray-900 dark:text-white">
                Question History
              </h1>
              <p className="text-apple-gray-500 dark:text-apple-gray-400 mt-1">
                {total} questions asked
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <Loading fullScreen text="Loading history..." />
        ) : questions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <Card.Body className="py-20 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-apple-gray-100 dark:bg-apple-gray-800 flex items-center justify-center"
                >
                  <MessageCircle className="w-10 h-10 text-apple-gray-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-apple-gray-900 dark:text-white mb-2">
                  No questions yet
                </h3>
                <p className="text-apple-gray-500 dark:text-apple-gray-400 max-w-md mx-auto mb-6">
                  Start asking questions to see them here. Your AI-generated answers will be saved for future reference.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/dashboard')}
                >
                  Ask Your First Question
                </Button>
              </Card.Body>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {questions.map((question) => (
                <motion.div
                  key={question.id}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                >
                  <Card
                    hover
                    onClick={() => navigate(`/answer/${question.id}`)}
                    className="cursor-pointer"
                  >
                    <Card.Body className="flex items-start justify-between py-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-apple-gray-900 dark:text-white line-clamp-2 mb-2">
                          {question.question_text}
                        </p>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="default" size="sm">
                            {question.subject?.name}
                          </Badge>
                          {question.chapter && (
                            <span className="text-apple-gray-500 dark:text-apple-gray-400 truncate">
                              {question.chapter.name}
                            </span>
                          )}
                          <span className="text-apple-gray-400">•</span>
                          <span className="flex items-center gap-1 text-apple-gray-500 dark:text-apple-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(question.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-4">
                        {question.answer && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            question.answer.confidence_score >= 80
                              ? 'bg-apple-green/10 text-apple-green'
                              : question.answer.confidence_score >= 60
                              ? 'bg-apple-orange/10 text-apple-orange'
                              : 'bg-apple-red/10 text-apple-red'
                          }`}>
                            {Math.round(question.answer.confidence_score)}%
                          </span>
                        )}
                        <ArrowRight className="w-5 h-5 text-apple-gray-400" />
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between pt-6"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setOffset((page - 1) * ITEMS_PER_PAGE)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-apple-blue text-white'
                          : 'text-apple-gray-600 dark:text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={offset + ITEMS_PER_PAGE >= total}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </Layout>
  );
}
