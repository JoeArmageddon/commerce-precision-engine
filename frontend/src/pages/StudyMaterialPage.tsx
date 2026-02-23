import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Trash2, 
  BookOpen,
  Brain,
  Check,
  AlertCircle,
  Sparkles,
  File,
  X,
  Search,
  Crown,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCurrentUser, incrementUploadCount, getUploadsRemaining, MAX_UPLOADS_REGULAR } from '@/data/alphaKeys';
import toast from 'react-hot-toast';

interface StudyMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'text';
  size: string;
  uploadedAt: string;
  subjectId: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
  summary?: string;
  aiProcessed: boolean;
}

const DEMO_MATERIALS: StudyMaterial[] = [
  {
    id: 'demo-1',
    name: 'Accountancy Concepts.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploadedAt: new Date().toISOString(),
    subjectId: 'accountancy',
    processingStatus: 'completed',
    summary: 'Covers basic accounting principles, journal entries, ledger posting, and trial balance preparation.',
    aiProcessed: true,
  },
];

export function StudyMaterialPage() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const user = getCurrentUser();
  const [uploadsRemaining, setUploadsRemaining] = useState<number>(MAX_UPLOADS_REGULAR);

  // Load materials and user info
  useEffect(() => {
    const saved = localStorage.getItem('study_materials');
    if (saved) {
      try {
        setMaterials(JSON.parse(saved));
      } catch {
        setMaterials(DEMO_MATERIALS);
      }
    } else {
      setMaterials(DEMO_MATERIALS);
    }
    
    // Update upload count
    setUploadsRemaining(getUploadsRemaining());
  }, []);

  const saveMaterials = (newMaterials: StudyMaterial[]) => {
    setMaterials(newMaterials);
    localStorage.setItem('study_materials', JSON.stringify(newMaterials));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check upload limit
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error('Please login again');
      return;
    }

    if (!currentUser.isMaster) {
      const remaining = getUploadsRemaining();
      if (remaining <= 0) {
        toast.error(`Upload limit reached! Maximum ${MAX_UPLOADS_REGULAR} materials allowed.`);
        return;
      }
      
      if (files.length > remaining) {
        toast.error(`You can only upload ${remaining} more file(s). Selected ${files.length}.`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    // Process each file
    const newMaterials: StudyMaterial[] = [];
    
    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      
      // Increment upload count
      if (!incrementUploadCount()) {
        toast.error('Upload limit reached!');
        break;
      }
      
      const newMaterial: StudyMaterial = {
        id: `mat-${Date.now()}-${idx}`,
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString(),
        subjectId: 'general',
        processingStatus: 'pending',
        aiProcessed: false,
      };
      
      newMaterials.push(newMaterial);
      
      // Update remaining count
      setUploadsRemaining(getUploadsRemaining());
    }

    saveMaterials([...materials, ...newMaterials]);
    setIsUploading(false);
    setUploadProgress(0);
    
    if (newMaterials.length > 0) {
      toast.success(`${newMaterials.length} file(s) uploaded. AI processing started...`);
      
      // Simulate AI processing
      newMaterials.forEach((mat, idx) => {
        setTimeout(() => {
          // Start processing
          setMaterials(prev => {
            const updated = prev.map(m => 
              m.id === mat.id ? { ...m, processingStatus: 'processing' as const } : m
            );
            localStorage.setItem('study_materials', JSON.stringify(updated));
            return updated;
          });

          // Complete processing with AI summary
          setTimeout(() => {
            const summaries = [
              'Covers fundamental concepts including definitions, formulas, and key principles.',
              'Contains practice problems with step-by-step solutions and explanations.',
              'Summarizes chapter topics with important points and exam-focused content.',
              'Includes diagrams, charts, and visual explanations of complex topics.',
              'Features previous year questions with detailed answer analysis.',
            ];
            
            setMaterials(prev => {
              const updated = prev.map(m => 
                m.id === mat.id ? { 
                  ...m, 
                  processingStatus: 'completed' as const,
                  aiProcessed: true,
                  summary: summaries[Math.floor(Math.random() * summaries.length)]
                } : m
              );
              localStorage.setItem('study_materials', JSON.stringify(updated));
              return updated;
            });
            
            toast.success(`AI processed: ${mat.name}`);
          }, 4000);
        }, idx * 800);
      });
    }
  };

  const deleteMaterial = (id: string) => {
    if (confirm('Delete this material?')) {
      const updated = materials.filter(m => m.id !== id);
      saveMaterials(updated);
      toast.success('Material removed');
    }
  };

  const getStatusIcon = (status: StudyMaterial['processingStatus']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />;
      case 'pending':
        return <div className="w-2 h-2 bg-amber-500 rounded-full" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: StudyMaterial['processingStatus']) => {
    switch (status) {
      case 'completed':
        return 'AI Ready';
      case 'processing':
        return 'AI Processing...';
      case 'pending':
        return 'Waiting';
      case 'error':
        return 'Error';
    }
  };

  const isMaster = user?.isMaster || false;

  return (
    <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-950">
      {/* Mobile-Optimized Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-apple-gray-900/80 backdrop-blur-xl border-b border-apple-gray-200 dark:border-apple-gray-800">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-semibold text-apple-gray-900 dark:text-white truncate">
            Study Materials
          </h1>
          
          {/* Upload Limit Badge */}
          {!isMaster && (
            <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Upload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                {uploadsRemaining === Infinity ? '∞' : uploadsRemaining} left
              </span>
            </div>
          )}
          {isMaster && (
            <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Crown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-800 dark:text-purple-200">Unlimited</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Page Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full mb-3">
              <Sparkles className="w-3 h-3" />
              Alpha Feature
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-apple-gray-900 dark:text-white">
              Upload Study Materials
            </h2>
            <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mt-1">
              AI will analyze and summarize your notes for smarter answers
            </p>
          </div>

          {/* Upload Limit Warning */}
          {!isMaster && uploadsRemaining <= 3 && uploadsRemaining > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Low uploads remaining:</strong> {uploadsRemaining} of {MAX_UPLOADS_REGULAR} left
                </p>
              </div>
            </div>
          )}

          {!isMaster && uploadsRemaining === 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">Upload Limit Reached</h3>
                  <p className="text-sm text-red-800 dark:text-red-300">
                    You've used all {MAX_UPLOADS_REGULAR} uploads. Contact admin for master key access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Features - Mobile Optimized Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { icon: Upload, title: 'Upload', desc: 'PDFs, images' },
              { icon: Brain, title: 'AI Analysis', desc: 'Auto-summary' },
              { icon: Search, title: 'Smart Search', desc: 'RAG-powered' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 sm:p-4 bg-white dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-xl text-center"
              >
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-apple-blue mb-2 mx-auto" />
                <h3 className="font-medium text-apple-gray-900 dark:text-white text-xs sm:text-sm">
                  {feature.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-apple-gray-500 mt-0.5 hidden sm:block">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Upload Area - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <Card.Body className="p-4 sm:p-6">
                {(isMaster || uploadsRemaining > 0) ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.txt"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="border-2 border-dashed border-apple-gray-300 dark:border-apple-gray-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center hover:border-apple-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                      {isUploading ? (
                        <div className="space-y-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full border-4 border-apple-blue border-t-transparent animate-spin" />
                          <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                            Uploading... {uploadProgress}%
                          </p>
                          <div className="w-full max-w-[200px] h-2 bg-apple-gray-200 dark:bg-apple-gray-700 rounded-full mx-auto overflow-hidden">
                            <div 
                              className="h-full bg-apple-blue transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-apple-blue/20 to-apple-purple/20 flex items-center justify-center">
                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-apple-blue" />
                          </div>
                          <h3 className="font-semibold text-apple-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                            Drop files or click to upload
                          </h3>
                          <p className="text-xs sm:text-sm text-apple-gray-500">
                            PDF, PNG, JPG up to 10MB each
                          </p>
                          {!isMaster && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                              {uploadsRemaining} uploads remaining
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </label>
                ) : (
                  <div className="text-center py-8 text-apple-gray-500">
                    <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Upload limit reached</p>
                    <p className="text-sm mt-1">Contact admin for more access</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </motion.div>

          {/* Materials List - Mobile Optimized */}
          {materials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <Card.Body className="p-4 sm:p-6">
                  <h3 className="font-semibold text-apple-gray-900 dark:text-white mb-4 text-sm sm:text-base">
                    Materials ({materials.length}) {!isMaster && `- ${uploadsRemaining} uploads left`}
                  </h3>
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="p-3 sm:p-4 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-xl"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-apple-blue/10 flex items-center justify-center flex-shrink-0">
                            {material.type === 'pdf' ? (
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-apple-blue" />
                            ) : material.type === 'image' ? (
                              <File className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                            ) : (
                              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-apple-gray-900 dark:text-white text-sm truncate">
                              {material.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-apple-gray-500">
                              <span>{material.size}</span>
                              <span>•</span>
                              <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                            </div>
                            
                            {/* AI Summary */}
                            {material.aiProcessed && material.summary && (
                              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Brain className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                  <span className="text-[10px] font-medium text-blue-800 dark:text-blue-200">AI Summary</span>
                                </div>
                                <p className="text-xs text-blue-700 dark:text-blue-300 line-clamp-2">
                                  {material.summary}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-apple-gray-800 rounded text-xs">
                              {getStatusIcon(material.processingStatus)}
                              <span className={
                                material.processingStatus === 'completed' ? 'text-green-600' :
                                material.processingStatus === 'processing' ? 'text-blue-600' :
                                material.processingStatus === 'error' ? 'text-red-600' :
                                'text-amber-600'
                              }>
                                {getStatusText(material.processingStatus)}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteMaterial(material.id)}
                              className="p-1.5 text-apple-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          )}

          {/* How it Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-purple-900 dark:text-purple-200 mb-2 text-sm">
                  How AI Processing Works
                </h3>
                <ul className="text-xs text-purple-800 dark:text-purple-300 space-y-1">
                  <li>1. Upload your study material (PDF, image, text)</li>
                  <li>2. AI extracts and analyzes the content</li>
                  <li>3. Creates a searchable summary</li>
                  <li>4. Original file is removed to save space</li>
                  <li>5. AI uses summary for future answers</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
