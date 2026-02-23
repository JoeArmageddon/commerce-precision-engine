import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  Sparkles, 
  BookOpen,
  Loader2,
  Globe,
  FileText,
  HelpCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  ExternalLink,
  Cpu,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  chapterResearchService, 
  type ChapterResearchResponse,
  type ResearchStatus 
} from '@/services/chapterResearch.service';

// Verification badge colors
const statusColors = {
  verified: 'bg-green-100 text-green-700 border-green-200',
  needs_review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  unreliable: 'bg-red-100 text-red-700 border-red-200',
};

export function ChapterResearchPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [result, setResult] = useState<ChapterResearchResponse | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<number[]>([0]);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ResearchStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Check service status on mount
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const status = await chapterResearchService.getStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Failed to check service status:', error);
      setServiceStatus({
        status: 'unavailable',
        llm_available: false,
        web_search_available: false,
        message: 'Service status unknown',
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const subjects = [
    { id: 'Accountancy', name: 'Accountancy', code: 'ACCT' },
    { id: 'Economics', name: 'Economics', code: 'ECO' },
    { id: 'Business Studies', name: 'Business Studies', code: 'BST' },
  ];

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !chapterName.trim()) {
      toast.error('Please select a subject and enter chapter name');
      return;
    }

    setIsResearching(true);
    
    try {
      const response = await chapterResearchService.researchChapter({
        subject: subject as 'Accountancy' | 'Economics' | 'Business Studies',
        chapter_name: chapterName.trim(),
      });
      
      setResult(response);
      
      // Show appropriate toast based on verification status
      if (response.verification.status === 'verified') {
        toast.success('Research complete! Content verified for accuracy.');
      } else if (response.verification.status === 'needs_review') {
        toast('Research complete with warnings. Please review carefully.', {
          icon: '⚠️',
        });
      } else {
        toast.error('Research completed but content may be unreliable.');
      }
      
    } catch (error: any) {
      console.error('Research failed:', error);
      const errorMessage = error.response?.data?.detail || 'Research failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsResearching(false);
    }
  };

  const toggleTopic = (index: number) => {
    setExpandedTopics(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-apple-gray-900 dark:text-white">
                AI Chapter Research
              </h1>
              <p className="text-sm text-apple-gray-500">
                Deep web research for CBSE Class 12 Commerce
              </p>
            </div>
          </div>
        </motion.div>

        {/* Service Status */}
        {!isLoadingStatus && serviceStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className={`p-3 rounded-xl border ${
              serviceStatus.status === 'operational' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : serviceStatus.status === 'degraded'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-3">
                <Cpu className={`w-5 h-5 ${
                  serviceStatus.status === 'operational' 
                    ? 'text-green-600' 
                    : serviceStatus.status === 'degraded'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    serviceStatus.status === 'operational' 
                      ? 'text-green-800 dark:text-green-200'
                      : serviceStatus.status === 'degraded'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {serviceStatus.message}
                  </p>
                </div>
                <div className="flex gap-2">
                  {serviceStatus.llm_available && (
                    <Badge variant="default" size="sm">
                      <Database className="w-3 h-3 mr-1" />
                      AI Ready
                    </Badge>
                  )}
                  {serviceStatus.web_search_available && (
                    <Badge variant="default" size="sm">
                      <Globe className="w-3 h-3 mr-1" />
                      Web Search
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Research Form */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <Card.Body className="p-6">
                <form onSubmit={handleResearch} className="space-y-6">
                  {/* Subject Selection */}
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-3">
                      Select Subject <span className="text-apple-red">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {subjects.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSubject(sub.id)}
                          className={`p-4 rounded-xl text-center transition-all border-2 ${
                            subject === sub.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-apple-gray-200 dark:border-apple-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <BookOpen className={`w-6 h-6 mx-auto mb-2 ${
                            subject === sub.id ? 'text-purple-500' : 'text-apple-gray-400'
                          }`} />
                          <p className={`font-medium text-sm ${
                            subject === sub.id ? 'text-purple-700 dark:text-purple-300' : 'text-apple-gray-700 dark:text-apple-gray-300'
                          }`}>
                            {sub.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chapter Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                      Chapter Name <span className="text-apple-red">*</span>
                    </label>
                    <Input
                      placeholder="e.g., Partnership Accounting, Nature and Significance of Management..."
                      value={chapterName}
                      onChange={(e) => setChapterName(e.target.value)}
                      className="w-full"
                      disabled={isResearching}
                    />
                    <p className="text-xs text-apple-gray-500 mt-2">
                      Type the exact chapter name from your NCERT/CBSE textbook
                    </p>
                  </div>

                  {/* What AI Will Find */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI will research and find:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                        <CheckCircle className="w-4 h-4" />
                        <span>Key subtopics & concepts</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                        <CheckCircle className="w-4 h-4" />
                        <span>Previous board questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                        <CheckCircle className="w-4 h-4" />
                        <span>Important Q&A (2-8 marks)</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                        <CheckCircle className="w-4 h-4" />
                        <span>Quick revision notes</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={isResearching}
                    disabled={!subject || !chapterName.trim() || isResearching}
                  >
                    {isResearching ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        AI Researching & Verifying...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Start Deep Research
                      </>
                    )}
                  </Button>

                  {isResearching && (
                    <p className="text-center text-sm text-apple-gray-500">
                      This may take 15-30 seconds. We're searching the web and verifying content through multiple AI agents.
                    </p>
                  )}
                </form>
              </Card.Body>
            </Card>
          </motion.div>
        )}

        {/* Research Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Result Header */}
              <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Card.Body className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{result.chapter_name}</h2>
                      <p className="text-white/80">{result.subject} • CBSE Class 12</p>
                      
                      {/* Verification Badge */}
                      <div className="flex items-center gap-3 mt-3">
                        <Badge 
                          className={`${statusColors[result.verification.status]} border`}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {result.verification.status === 'verified' 
                            ? 'Verified' 
                            : result.verification.status === 'needs_review'
                            ? 'Needs Review'
                            : 'Unreliable'}
                        </Badge>
                        <span className="text-sm text-white/80">
                          Confidence: {result.verification.confidence_score.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setResult(null);
                        setChapterName('');
                        setSubject('');
                        setExpandedTopics([0]);
                        setExpandedQuestions([]);
                      }}
                    >
                      Research Another
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              {/* Verification Details */}
              <Card>
                <Card.Body className="p-6">
                  <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-apple-blue" />
                    Verification Report
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-apple-blue">
                        {result.verification.confidence_score.toFixed(0)}%
                      </p>
                      <p className="text-xs text-apple-gray-500 mt-1">Overall Confidence</p>
                    </div>
                    <div className="p-3 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-lg text-center">
                      <p className={`text-2xl font-bold ${getConfidenceColor(result.verification.syllabus_alignment)}`}>
                        {result.verification.syllabus_alignment.toFixed(0)}%
                      </p>
                      <p className="text-xs text-apple-gray-500 mt-1">Syllabus Alignment</p>
                    </div>
                    <div className="p-3 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-lg text-center">
                      <p className={`text-2xl font-bold ${getConfidenceColor(result.verification.completeness)}`}>
                        {result.verification.completeness.toFixed(0)}%
                      </p>
                      <p className="text-xs text-apple-gray-500 mt-1">Completeness</p>
                    </div>
                    <div className="p-3 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-lg text-center">
                      <p className={`text-2xl font-bold ${getConfidenceColor(result.verification.question_authenticity)}`}>
                        {result.verification.question_authenticity.toFixed(0)}%
                      </p>
                      <p className="text-xs text-apple-gray-500 mt-1">Question Authenticity</p>
                    </div>
                  </div>

                  {/* Warnings */}
                  {result.warnings && result.warnings.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium text-sm">Please Note</span>
                      </div>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {result.warnings.map((warning, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-500 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Quick Notes */}
              <Card>
                <Card.Body className="p-6">
                  <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-apple-blue" />
                    Quick Revision Notes
                  </h3>
                  <div className="grid gap-2">
                    {result.quick_notes.map((note, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-lg"
                      >
                        <span className="w-6 h-6 rounded-full bg-apple-blue/10 text-apple-blue text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-apple-gray-700 dark:text-apple-gray-300">{note}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mnemonics */}
                  {result.mnemonics && result.mnemonics.length > 0 && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Memory Aids
                      </h4>
                      <ul className="space-y-1">
                        {result.mnemonics.map((mnemonic, idx) => (
                          <li key={idx} className="text-sm text-purple-800 dark:text-purple-300">
                            • {mnemonic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Subtopics */}
              <Card>
                <Card.Body className="p-6">
                  <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-apple-purple" />
                    Key Subtopics & Concepts
                  </h3>
                  <div className="space-y-3">
                    {result.subtopics.map((topic, idx) => (
                      <div 
                        key={idx}
                        className="border border-apple-gray-200 dark:border-apple-gray-700 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleTopic(idx)}
                          className="w-full flex items-center justify-between p-4 bg-apple-gray-50 dark:bg-apple-gray-800/50 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-apple-gray-900 dark:text-white text-left">
                              {topic.title}
                            </span>
                          </div>
                          {expandedTopics.includes(idx) ? (
                            <ChevronUp className="w-5 h-5 text-apple-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-apple-gray-400" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedTopics.includes(idx) && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4">
                                <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-3">
                                  {topic.description}
                                </p>
                                <ul className="space-y-2">
                                  {topic.key_points.map((point, pidx) => (
                                    <li 
                                      key={pidx}
                                      className="flex items-start gap-2 text-sm text-apple-gray-700 dark:text-apple-gray-300"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                      {point}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {/* Important Questions */}
              <Card>
                <Card.Body className="p-6">
                  <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-apple-green" />
                    Important Board Questions
                  </h3>
                  <div className="space-y-3">
                    {result.important_questions.map((q, idx) => (
                      <div 
                        key={idx}
                        className="border border-apple-gray-200 dark:border-apple-gray-700 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(idx)}
                          className="w-full flex items-start justify-between p-4 hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800/50 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                q.type === 'short' ? 'bg-blue-100 text-blue-700' :
                                q.type === 'long' ? 'bg-purple-100 text-purple-700' :
                                'bg-pink-100 text-pink-700'
                              }`}>
                                {q.marks} Marks
                              </span>
                              <span className="text-xs text-apple-gray-500">
                                {q.type === 'short' ? 'Short Answer' : 
                                 q.type === 'long' ? 'Long Answer' : 'Very Long Answer'}
                              </span>
                            </div>
                            <p className="font-medium text-apple-gray-900 dark:text-white text-sm">
                              {q.question}
                            </p>
                          </div>
                          {expandedQuestions.includes(idx) ? (
                            <ChevronUp className="w-5 h-5 text-apple-gray-400 ml-2" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-apple-gray-400 ml-2" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedQuestions.includes(idx) && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <p className="text-sm text-apple-gray-700 dark:text-apple-gray-300 whitespace-pre-line">
                                    <strong>Answer:</strong>
                                    <br />
                                    {q.answer}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {/* Previous Year Questions */}
              {result.board_questions.length > 0 && (
                <Card>
                  <Card.Body className="p-6">
                    <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-apple-orange" />
                      Questions Found Online
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-apple-gray-200 dark:border-apple-gray-700">
                            <th className="text-left py-2 px-3 text-sm font-medium text-apple-gray-500">Year</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-apple-gray-500">Question</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-apple-gray-500">Marks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.board_questions.map((bq, idx) => (
                            <tr key={idx} className="border-b border-apple-gray-100 dark:border-apple-gray-800">
                              <td className="py-3 px-3 text-sm font-medium text-apple-gray-900 dark:text-white">{bq.year}</td>
                              <td className="py-3 px-3 text-sm text-apple-gray-700 dark:text-apple-gray-300">{bq.question}</td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">
                                  {bq.marks}M
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Sources */}
              {result.sources.length > 0 && (
                <Card>
                  <Card.Body className="p-6">
                    <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-apple-teal" />
                      Sources
                    </h3>
                    <div className="space-y-2">
                      {result.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-lg hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 transition-colors"
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-sm font-medium text-apple-gray-900 dark:text-white truncate">
                              {source.title}
                            </p>
                            <p className="text-xs text-apple-gray-500">{source.source}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-apple-gray-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Metadata */}
              <div className="text-center text-xs text-apple-gray-500">
                <p>Generated in {result.processing_time_ms}ms • {new Date(result.generated_at).toLocaleString()}</p>
                <p className="mt-1">
                  Always cross-verify with official NCERT textbooks and CBSE syllabus.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
