import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Save, 
  Trash2,
  AlertTriangle,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface ApiKeys {
  gemini?: string;
  groq?: string;
  preferred: 'gemini' | 'groq';
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ preferred: 'gemini' });
  const [showGemini, setShowGemini] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved keys on mount
  useEffect(() => {
    const saved = localStorage.getItem('user_api_keys');
    if (saved) {
      try {
        setApiKeys(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const saveKeys = async () => {
    setIsSaving(true);
    
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    
    localStorage.setItem('user_api_keys', JSON.stringify(apiKeys));
    toast.success('Settings saved successfully!');
    setIsSaving(false);
  };

  const clearKeys = () => {
    if (confirm('Are you sure you want to remove all API keys?')) {
      setApiKeys({ preferred: 'gemini' });
      localStorage.removeItem('user_api_keys');
      toast.success('API keys cleared');
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
            Settings
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-apple-gray-900 dark:text-white">
              API Keys & Preferences
            </h2>
            <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-1">
              Manage your own AI provider API keys for uninterrupted service
            </p>
          </div>

          {/* Info Banner */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Why add your own API key?
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  If our shared AI quota runs out, you can continue using the app with your own API key. 
                  Both Google Gemini and Groq offer generous free tiers. 
                  <button 
                    onClick={() => navigate('/api-key-guide')}
                    className="ml-1 underline hover:no-underline"
                  >
                    View setup guide →
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Preferred Provider */}
          <Card>
            <Card.Body className="p-6">
              <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4">
                Preferred AI Provider
              </h3>
              <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-4">
                Select which AI provider to use when multiple keys are available
              </p>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="preferred"
                    value="gemini"
                    checked={apiKeys.preferred === 'gemini'}
                    onChange={(e) => setApiKeys({ ...apiKeys, preferred: e.target.value as 'gemini' })}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    apiKeys.preferred === 'gemini' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-apple-gray-200 dark:border-apple-gray-700 hover:border-apple-gray-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-apple-gray-900 dark:text-white">Google Gemini</span>
                    </div>
                    <p className="text-xs text-apple-gray-500">60 req/min free</p>
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="preferred"
                    value="groq"
                    checked={apiKeys.preferred === 'groq'}
                    onChange={(e) => setApiKeys({ ...apiKeys, preferred: e.target.value as 'groq' })}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    apiKeys.preferred === 'groq' 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                      : 'border-apple-gray-200 dark:border-apple-gray-700 hover:border-apple-gray-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      <span className="font-medium text-apple-gray-900 dark:text-white">Groq</span>
                    </div>
                    <p className="text-xs text-apple-gray-500">Very fast inference</p>
                  </div>
                </label>
              </div>
            </Card.Body>
          </Card>

          {/* Gemini API Key */}
          <Card>
            <Card.Body className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
                  Google Gemini API Key
                </h3>
              </div>
              <div className="relative">
                <Input
                  type={showGemini ? 'text' : 'password'}
                  placeholder="AIza... (paste your Gemini API key here)"
                  value={apiKeys.gemini || ''}
                  onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                  className="pr-24"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-apple-gray-400 hover:text-apple-gray-600"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-apple-gray-500">
                Get your key from{' '}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-apple-blue hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </Card.Body>
          </Card>

          {/* Groq API Key */}
          <Card>
            <Card.Body className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
                  Groq API Key
                </h3>
              </div>
              <div className="relative">
                <Input
                  type={showGroq ? 'text' : 'password'}
                  placeholder="gsk_... (paste your Groq API key here)"
                  value={apiKeys.groq || ''}
                  onChange={(e) => setApiKeys({ ...apiKeys, groq: e.target.value })}
                  className="pr-24"
                />
                <button
                  type="button"
                  onClick={() => setShowGroq(!showGroq)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-apple-gray-400 hover:text-apple-gray-600"
                >
                  {showGroq ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-apple-gray-500">
                Get your key from{' '}
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-apple-blue hover:underline"
                >
                  Groq Console
                </a>
              </p>
            </Card.Body>
          </Card>

          {/* Security Notice */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                  Security Notice
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Your API keys are stored locally in your browser and are never sent to our servers. 
                  They are used directly from your browser to call the AI services.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={saveKeys}
              isLoading={isSaving}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            <Button
              onClick={clearKeys}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
