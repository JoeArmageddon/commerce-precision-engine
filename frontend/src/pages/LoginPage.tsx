import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  Shield, 
  Zap, 
  FlaskConical, 
  Key, 
  Users,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { 
  validateAndUseAlphaKey, 
  getRemainingKeysCount,
  ALPHA_KEYS 
} from '@/data/alphaKeys';

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingKeys, setRemainingKeys] = useState(50);
  const [showKeysList, setShowKeysList] = useState(false);

  // Update remaining keys count on mount and periodically
  useEffect(() => {
    const updateCount = () => {
      setRemainingKeys(getRemainingKeysCount());
    };
    updateCount();
    const interval = setInterval(updateCount, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast.error('Please enter an alpha access key');
      return;
    }

    setIsLoading(true);
    
    // Generate a unique user ID
    const userId = `user-${Date.now()}`;
    
    // Validate alpha key
    const validation = validateAndUseAlphaKey(accessCode, userId);
    
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid access key');
      setIsLoading(false);
      return;
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create user
    const mockUser = {
      id: userId,
      access_code: accessCode.trim().toUpperCase(),
      created_at: new Date().toISOString(),
    };
    
    setAuth('demo-token-12345', mockUser);
    toast.success(`Welcome to Alpha! 🧪 (${getRemainingKeysCount()} spots remaining)`);
    navigate('/dashboard');
    setIsLoading(false);
  };

  const features = [
    { icon: Sparkles, label: 'AI-Powered Answers' },
    { icon: Shield, label: 'Upload Your Syllabus' },
    { icon: Zap, label: 'Study Material RAG' },
  ];



  return (
    <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,122,255,0.12) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(175,82,222,0.12) 0%, transparent 60%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center mb-10"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="bg-gradient-to-br from-apple-blue via-apple-purple to-apple-pink p-4 rounded-3xl shadow-2xl mb-6 relative"
          >
            <BookOpen className="w-10 h-10 text-white" />
            {/* Alpha Badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              α ALPHA
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-apple-gray-900 dark:text-white text-center">
            Commerce Engine
          </h1>
          <p className="text-apple-gray-500 dark:text-apple-gray-400 mt-2 text-center">
            AI-Powered CBSE Class 12 Commerce
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Card className="glass-strong" glass={false}>
            <Card.Body className="p-8">
              {/* Alpha Notice */}
              <div className="mb-6 p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800 rounded-xl">
                <div className="flex items-start gap-2">
                  <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-purple-800 dark:text-purple-200">
                    <span className="font-semibold">Limited Alpha Access:</span> Only 50 spots available. Each key works once.
                  </div>
                </div>
              </div>

              {/* Remaining Spots Counter */}
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      Spots Remaining
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      remainingKeys > 10 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {remainingKeys}
                    </span>
                    <span className="text-sm text-amber-600 dark:text-amber-400">/ 50</span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${(remainingKeys / 50) * 100}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-apple-gray-900 dark:text-white mb-1">
                    Alpha Access
                  </h2>
                  <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400">
                    Enter your alpha key to continue
                  </p>
                </div>

                <Input
                  label="Alpha Access Key"
                  placeholder="e.g., ALPHA-01-K9M2-P8LQ"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  autoFocus
                />
                
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  shimmer={!isLoading}
                  disabled={remainingKeys === 0}
                >
                  {isLoading ? 'Verifying...' : remainingKeys === 0 ? 'Alpha Full' : 'Access Alpha'}
                </Button>
              </form>

              {/* Show Available Keys Toggle */}
              <div className="mt-6 pt-6 border-t border-apple-gray-200 dark:border-apple-gray-800">
                <button
                  onClick={() => setShowKeysList(!showKeysList)}
                  className="text-sm text-apple-blue hover:underline flex items-center gap-1 mx-auto"
                >
                  <Key className="w-4 h-4" />
                  {showKeysList ? 'Hide Example Keys' : 'Show Available Keys'}
                </button>
                
                {showKeysList && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-apple-gray-50 dark:bg-apple-gray-800/50 rounded-lg"
                  >
                    <p className="text-xs text-apple-gray-500 mb-3">
                      Copy any unused key below (first come, first served):
                    </p>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {ALPHA_KEYS.map((key) => {
                        const isUsed = remainingKeys < 50 && !showKeysList; // Simplified check
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between p-2 bg-white dark:bg-apple-gray-800 rounded text-xs font-mono"
                          >
                            <span className={isUsed ? 'line-through text-apple-gray-400' : ''}>
                              {key}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(key);
                                toast.success('Key copied!');
                              }}
                              className="p-1 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-700 rounded"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* API Key Info */}
              <div className="mt-6 pt-6 border-t border-apple-gray-200 dark:border-apple-gray-800">
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Key className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">BYOK Support:</span> If our AI quota runs out, 
                    you can add your own API key in Settings.
                    <button 
                      onClick={() => navigate('/api-key-guide')}
                      className="ml-1 underline hover:no-underline"
                    >
                      Learn how →
                    </button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 grid grid-cols-3 gap-4"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="glass rounded-2xl p-4 text-center cursor-default"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-apple-blue/20 to-apple-purple/20 mb-2">
                  <Icon className="w-5 h-5 text-apple-blue" />
                </div>
                <p className="text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400">
                  {feature.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-xs text-apple-gray-400 dark:text-apple-gray-600 mt-8"
        >
          Alpha v0.1 • Limited to 50 Testers • BYOK Supported
        </motion.p>
      </div>
    </div>
  );
}
