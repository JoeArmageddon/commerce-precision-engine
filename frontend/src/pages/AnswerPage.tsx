import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Copy, Check, AlertCircle, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Badge, ConfidenceBadge } from '@/components/ui/Badge';
import { VerificationLog } from '@/components/VerificationLog';
import { questionsService } from '@/services/questions.service';
import type { Question } from '@/types';

export function AnswerPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (questionId) {
      loadQuestion(questionId);
    }
  }, [questionId]);

  const loadQuestion = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await questionsService.getQuestion(id);
      setQuestion(data);
    } catch (error) {
      toast.error('Failed to load answer');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (question?.answer?.finalAnswer) {
      await navigator.clipboard.writeText(question.answer.finalAnswer);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRetry = () => {
    if (question) {
      navigate('/ask', {
        state: { 
          subjectId: question.subject_id, 
          chapterId: question.chapter_id 
        },
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading fullScreen text="Loading answer..." />
      </Layout>
    );
  }

  if (!question || !question.answer) {
    return (
      <Layout>
        <div className="text-center py-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-apple-gray-100 dark:bg-apple-gray-800 flex items-center justify-center"
          >
            <AlertCircle className="w-10 h-10 text-apple-gray-400" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-apple-gray-900 dark:text-white mb-2">
            Answer not found
          </h2>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Go to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const { answer, subject, chapter } = question;
  const isFailed = answer.status === 'failed';

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2 text-apple-green" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Question
            </Button>
          </div>
        </motion.div>

        {/* Question Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3 text-sm"
        >
          <Badge variant="info">{subject?.name}</Badge>
          {chapter && (
            <span className="text-apple-gray-500 dark:text-apple-gray-400">
              {chapter.name}
            </span>
          )}
          <span className="text-apple-gray-400">•</span>
          <span className="flex items-center gap-1 text-apple-gray-500 dark:text-apple-gray-400">
            <Clock className="w-4 h-4" />
            {new Date(question.created_at).toLocaleString()}
          </span>
        </motion.div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-apple-blue/10 flex items-center justify-center">
                  <span className="text-apple-blue font-bold">Q</span>
                </div>
                <h2 className="text-lg font-semibold text-apple-gray-900 dark:text-white">Question</h2>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-lg text-apple-gray-700 dark:text-apple-gray-300 leading-relaxed">
                {question.question_text}
              </p>
            </Card.Body>
          </Card>
        </motion.div>

        {/* Answer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={isFailed ? 'border-apple-red/50' : ''}>
            <Card.Header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-apple-green/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-apple-green" />
                </div>
                <h2 className="text-lg font-semibold text-apple-gray-900 dark:text-white">AI Answer</h2>
              </div>
              <ConfidenceBadge score={answer.confidence_score} />
            </Card.Header>
            <Card.Body>
              {isFailed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-apple-red/5 border border-apple-red/20 rounded-apple p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-apple-red/10 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-apple-red" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-apple-red mb-1">Answer Generation Failed</h3>
                      <p className="text-apple-gray-600 dark:text-apple-gray-400">
                        {answer.finalAnswer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {answer.finalAnswer.split('\n').map((paragraph, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="text-apple-gray-700 dark:text-apple-gray-300 leading-relaxed mb-4"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>
              )}
              
              {/* Referenced Concepts */}
              {!isFailed && answer.referenced_concepts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 pt-6 border-t border-apple-gray-200 dark:border-apple-gray-800"
                >
                  <p className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-3">
                    Referenced Concepts
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {answer.referenced_concepts.map((concept, i) => (
                      <Badge key={i} variant="purple" size="sm">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card.Body>
          </Card>
        </motion.div>

        {/* Verification Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <VerificationLog answer={answer} />
        </motion.div>
      </motion.div>
    </Layout>
  );
}
