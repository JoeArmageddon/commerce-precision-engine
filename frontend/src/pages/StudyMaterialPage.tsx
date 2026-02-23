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
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface StudyMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'text';
  size: string;
  uploadedAt: string;
  subjectId: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'error';
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
  },
  {
    id: 'demo-2',
    name: 'Business Studies Notes.pdf',
    type: 'pdf',
    size: '1.8 MB',
    uploadedAt: new Date().toISOString(),
    subjectId: 'bst',
    processingStatus: 'completed',
  },
];

export function StudyMaterialPage() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load saved materials on mount
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
  }, []);

  const saveMaterials = (newMaterials: StudyMaterial[]) => {
    setMaterials(newMaterials);
    localStorage.setItem('study_materials', JSON.stringify(newMaterials));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    // Process each file
    const newMaterials: StudyMaterial[] = Array.from(files).map((file, index) => ({
      id: `mat-${Date.now()}-${index}`,
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : 'image',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      subjectId: 'general',
      processingStatus: 'pending',
    }));

    saveMaterials([...materials, ...newMaterials]);
    setIsUploading(false);
    setUploadProgress(0);
    toast.success(`${files.length} file(s) uploaded successfully`);

    // Simulate AI processing
    newMaterials.forEach((mat, idx) => {
      setTimeout(() => {
        setMaterials(prev => {
          const updated = prev.map(m => 
            m.id === mat.id ? { ...m, processingStatus: 'processing' as const } : m
          );
          localStorage.setItem('study_materials', JSON.stringify(updated));
          return updated;
        });

        // Complete processing after a delay
        setTimeout(() => {
          setMaterials(prev => {
            const updated = prev.map(m => 
              m.id === mat.id ? { ...m, processingStatus: 'completed' as const } : m
            );
            localStorage.setItem('study_materials', JSON.stringify(updated));
            return updated;
          });
        }, 3000);
      }, idx * 1000);
    });
  };

  const deleteMaterial = (id: string) => {
    if (confirm('Are you sure you want to remove this study material?')) {
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

  return (
    <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-apple-gray-900/80 backdrop-blur-xl border-b border-apple-gray-200 dark:border-apple-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
            Study Materials
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
              Upload Study Materials
            </h2>
            <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-1">
              Upload your notes, textbooks, and study materials. The AI will analyze them and use them to answer your questions.
            </p>
          </div>

          {/* AI Features Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Upload, title: 'Upload', desc: 'PDFs, images, or text' },
              { icon: Brain, title: 'AI Analysis', desc: 'Content extraction & understanding' },
              { icon: Search, title: 'Smart Answers', desc: 'RAG-powered responses' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white dark:bg-apple-gray-800 border border-apple-gray-200 dark:border-apple-gray-700 rounded-xl"
              >
                <feature.icon className="w-6 h-6 text-apple-blue mb-2" />
                <h3 className="font-medium text-apple-gray-900 dark:text-white text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-apple-gray-500 mt-1">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <Card.Body className="p-6">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="border-2 border-dashed border-apple-gray-300 dark:border-apple-gray-700 rounded-2xl p-8 text-center hover:border-apple-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                    {isUploading ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full border-4 border-apple-blue border-t-transparent animate-spin" />
                        <p className="text-apple-gray-600 dark:text-apple-gray-400">
                          Uploading... {uploadProgress}%
                        </p>
                        <div className="w-48 h-2 bg-apple-gray-200 dark:bg-apple-gray-700 rounded-full mx-auto overflow-hidden">
                          <div 
                            className="h-full bg-apple-blue transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-apple-blue/20 to-apple-purple/20 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-apple-blue" />
                        </div>
                        <h3 className="font-semibold text-apple-gray-900 dark:text-white mb-1">
                          Drop files here or click to upload
                        </h3>
                        <p className="text-sm text-apple-gray-500">
                          PDF, PNG, JPG up to 10MB each
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </Card.Body>
            </Card>
          </motion.div>

          {/* Materials List */}
          {materials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <Card.Body className="p-6">
                  <h3 className="font-semibold text-apple-gray-900 dark:text-white mb-4">
                    Uploaded Materials ({materials.length})
                  </h3>
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-apple-blue/10 flex items-center justify-center">
                            {material.type === 'pdf' ? (
                              <FileText className="w-5 h-5 text-apple-blue" />
                            ) : material.type === 'image' ? (
                              <File className="w-5 h-5 text-purple-500" />
                            ) : (
                              <BookOpen className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-apple-gray-900 dark:text-white text-sm">
                              {material.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-apple-gray-500">
                              <span>{material.size}</span>
                              <span>•</span>
                              <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-apple-gray-800 rounded-lg text-xs">
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
                            className="p-2 text-apple-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                <h3 className="font-medium text-purple-900 dark:text-purple-200 mb-2">
                  How RAG Works
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-300 mb-3">
                  Retrieval-Augmented Generation (RAG) allows the AI to search through your uploaded materials 
                  to provide accurate, context-aware answers based on your specific study content.
                </p>
                <div className="text-xs text-purple-700 dark:text-purple-400 space-y-1">
                  <p>1. Upload your study materials (notes, textbooks, etc.)</p>
                  <p>2. AI extracts and indexes the content</p>
                  <p>3. When you ask a question, AI searches your materials</p>
                  <p>4. Answers are generated using your specific content</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                  Tips for Best Results
                </h3>
                <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                  <li>• Upload clear, text-based PDFs for best extraction</li>
                  <li>• Include your class notes for personalized answers</li>
                  <li>• Upload chapter-wise for better organization</li>
                  <li>• Maximum file size: 10MB per file</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
