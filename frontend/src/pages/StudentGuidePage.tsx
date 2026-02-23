import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Upload, 
  FileText, 
  MessageCircle, 
  Key,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Crown,
  Lock,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function StudentGuidePage() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Key,
      title: '1. Login with Alpha Key',
      content: (
        <>
          <p className="mb-3">Enter your unique alpha access key on the login page. Each key works only once and gives you:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Full access to all AI features</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>20 material uploads (regular key) or unlimited (master key)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Personalized AI answers based on your syllabus</span>
            </li>
          </ul>
        </>
      ),
      tip: 'Keep your key safe! If you lose access, you\'ll need a new key.',
      warning: null,
    },
    {
      icon: Upload,
      title: '2. Upload Your Syllabus',
      content: (
        <>
          <p className="mb-3">Before asking questions, upload your CBSE syllabus:</p>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Go to <strong>Syllabus</strong> from the dashboard or navbar</li>
            <li>Select your subject (Accountancy, Business Studies, or Economics)</li>
            <li>Choose one option:
              <ul className="ml-6 mt-1 space-y-1 list-disc">
                <li><strong>Upload PDF/Image:</strong> Scan or photo of your syllabus</li>
                <li><strong>Type Manually:</strong> Enter chapter names one per line</li>
              </ul>
            </li>
            <li>Click <strong>Save</strong> - AI will process your syllabus</li>
          </ol>
        </>
      ),
      tip: 'The more detailed your syllabus, the better the AI answers!',
      warning: 'Without a syllabus, AI answers may be generic and not exam-focused.',
    },
    {
      icon: FileText,
      title: '3. Upload Study Materials (Optional)',
      content: (
        <>
          <p className="mb-3">Upload your notes, textbooks, and reference materials for smarter answers:</p>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Click <strong>Study Materials</strong> in the navbar</li>
            <li>Drop files or click to upload (PDF, images, text)</li>
            <li>AI will automatically:
              <ul className="ml-6 mt-1 space-y-1">
                <li>→ Read and analyze the content</li>
                <li>→ Create a searchable summary</li>
                <li>→ Use it to answer your questions</li>
              </ul>
            </li>
          </ol>
          <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Upload Limit:</strong> Regular keys get 20 uploads. Master key = unlimited!
            </p>
          </div>
        </>
      ),
      tip: 'Upload chapter-wise notes for better organization and more accurate answers.',
      warning: 'Original files are removed after AI processing to save space. Only the summary is kept.',
    },
    {
      icon: MessageCircle,
      title: '4. Ask AI Questions',
      content: (
        <>
          <p className="mb-3">Get CBSE-aligned answers with 4-layer AI verification:</p>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Click <strong>Ask AI</strong> on dashboard or go to a subject</li>
            <li>Select your subject and chapter (optional)</li>
            <li>Type your question (minimum 10 characters)</li>
            <li>Click <strong>Get AI Answer</strong></li>
            <li>Wait 10-60 seconds for the 4-layer pipeline:
              <ul className="ml-6 mt-2 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">1</span>
                  <span><strong>Generator:</strong> Creates initial answer</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-bold">2</span>
                  <span><strong>Validator:</strong> Checks syllabus alignment</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center font-bold">3</span>
                  <span><strong>Auditor:</strong> Reviews for errors</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs flex items-center justify-center font-bold">4</span>
                  <span><strong>Scorer:</strong> Evaluates CBSE marking</span>
                </li>
              </ul>
            </li>
          </ol>
        </>
      ),
      tip: 'Ask specific questions like "Explain the accounting equation with examples" for better answers.',
      warning: 'Vague questions get vague answers. Be specific!',
    },
  ];

  const faqs = [
    {
      q: 'What if my alpha key doesn\'t work?',
      a: 'Each key can only be used once. If it says "already used," the key was taken by someone else. Try another key from the list.',
    },
    {
      q: 'Can I use the app without uploading a syllabus?',
      a: 'Yes, but answers will be generic. Uploading your specific CBSE syllabus helps the AI give exam-focused, curriculum-aligned answers.',
    },
    {
      q: 'What happens to my uploaded files?',
      a: 'AI reads and summarizes them, then the original file is deleted to save space. Only the AI summary is kept for answering questions.',
    },
    {
      q: 'How accurate are the AI answers?',
      a: 'The 4-layer verification system checks syllabus alignment, logical consistency, and CBSE marking schemes. However, always verify important facts from your textbooks.',
    },
    {
      q: 'What\'s the difference between regular and master key?',
      a: 'Regular keys: 20 uploads max. Master key: Unlimited uploads + full access. Master keys are for admins/VIP testers only.',
    },
    {
      q: 'Can I add my own AI API key?',
      a: 'Yes! Go to Settings and add your Gemini or Groq API key. This is useful if the shared AI quota runs out.',
    },
    {
      q: 'Is my data private?',
      a: 'Yes. Your API keys (if added) are stored locally in your browser only. Uploaded materials are processed by AI and stored temporarily.',
    },
    {
      q: 'Why is the first answer slow?',
      a: 'The backend may be "sleeping" (free tier). First request wakes it up (~30 seconds). Subsequent requests are faster.',
    },
  ];

  const bestPractices = [
    'Upload your complete syllabus for best results',
    'Upload notes chapter-by-chapter for better organization',
    'Ask specific, detailed questions',
    'Always verify AI answers with your textbooks for exams',
    'Use the AI for understanding concepts, not memorizing answers',
    'Check the verification panel to see how the AI scored your answer',
  ];

  return (
    <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-apple-gray-900/80 backdrop-blur-xl border-b border-apple-gray-200 dark:border-apple-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
            Student Guide
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-apple-blue to-apple-purple mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-apple-gray-900 dark:text-white mb-3">
            How to Use Commerce Engine
          </h2>
          <p className="text-apple-gray-600 dark:text-apple-gray-400 max-w-2xl mx-auto">
            Your complete guide to getting the most out of AI-powered CBSE Commerce study assistant
          </p>
        </motion.div>

        {/* Quick Start Video Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="overflow-hidden">
            <Card.Body className="p-0">
              <div className="aspect-video bg-gradient-to-br from-apple-blue/20 to-apple-purple/20 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-apple-blue mx-auto mb-3" />
                  <p className="text-apple-gray-700 dark:text-apple-gray-300 font-medium">
                    Quick Start Demo
                  </p>
                  <p className="text-sm text-apple-gray-500 mt-1">
                    Watch how to get started in 2 minutes
                  </p>
                  <Button className="mt-4" size="sm">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        {/* Step-by-Step Guide */}
        <div className="space-y-6 mb-12">
          <h3 className="text-xl font-bold text-apple-gray-900 dark:text-white">
            Step-by-Step Guide
          </h3>
          
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card>
                <Card.Body className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-apple-blue/20 to-apple-purple/20 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-6 h-6 text-apple-blue" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-3">
                        {step.title}
                      </h4>
                      <div className="text-apple-gray-600 dark:text-apple-gray-400">
                        {step.content}
                      </div>
                      
                      {step.tip && (
                        <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Tip:</strong> {step.tip}
                          </p>
                        </div>
                      )}
                      
                      {step.warning && (
                        <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>Note:</strong> {step.warning}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card>
            <Card.Body className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
                  Best Practices
                </h3>
              </div>
              <ul className="space-y-3">
                {bestPractices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-apple-gray-700 dark:text-apple-gray-300">{practice}</span>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-apple-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <Card.Body className="p-4">
                  <h4 className="font-semibold text-apple-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-apple-blue" />
                    {faq.q}
                  </h4>
                  <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                    {faq.a}
                  </p>
                </Card.Body>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Card>
            <Card.Body className="p-8">
              <Brain className="w-12 h-12 text-apple-purple mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-2">
                Still Need Help?
              </h3>
              <p className="text-apple-gray-600 dark:text-apple-gray-400 mb-4">
                Contact the admin or check the API Key Guide for technical issues.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={() => navigate('/api-key-guide')}>
                  <Key className="w-4 h-4 mr-2" />
                  API Key Guide
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
