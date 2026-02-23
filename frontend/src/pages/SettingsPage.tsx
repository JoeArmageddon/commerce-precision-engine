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
  Info,
  Globe,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { usersService, type ApiKeysStatus } from '@/services/users.service';

interface ApiKeyInputs {
  gemini: string;
  groq: string;
  serpapi: string;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKeyInputs>({ gemini: '', groq: '', serpapi: '' });
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeysStatus | null>(null);
  const [showGemini, setShowGemini] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [showSerpapi, setShowSerpapi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved keys status on mount
  useEffect(() => {
    loadApiKeyStatus();
  }, []);

  const loadApiKeyStatus = async () => {
    try {
      const status = await usersService.getApiKeysStatus();
      setApiKeyStatus(status);
    } catch (error) {
      console.error('Failed to load API key status:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyChange = (key: keyof ApiKeyInputs, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveKeys = async () => {
    setIsSaving(true);
    
    try {
      // Only send keys that have been entered (not empty means update, empty means no change)
      const updateData: { gemini_key?: string; groq_key?: string; serpapi_key?: string } = {};
      
      if (apiKeys.gemini) updateData.gemini_key = apiKeys.gemini;
      if (apiKeys.groq) updateData.groq_key = apiKeys.groq;
      if (apiKeys.serpapi) updateData.serpapi_key = apiKeys.serpapi;
      
      const status = await usersService.updateApiKeys(updateData);
      setApiKeyStatus(status);
      
      // Clear input fields after saving
      setApiKeys({ gemini: '', groq: '', serpapi: '' });
      setHasChanges(false);
      
      toast.success('API keys saved successfully!');
    } catch (error) {
      console.error('Failed to save API keys:', error);
      toast.error('Failed to save API keys');
    } finally {
      setIsSaving(false);
    }
  };

  const clearKeys = async () => {
    if (confirm('Are you sure you want to remove all your API keys?')) {
      try {
        await usersService.deleteAllApiKeys();
        setApiKeyStatus({ has_gemini_key: false, has_groq_key: false, has_serpapi_key: false, message: 'All keys deleted' });
        setApiKeys({ gemini: '', groq: '', serpapi: '' });
        toast.success('All API keys removed');
      } catch (error) {
        console.error('Failed to delete API keys:', error);
        toast.error('Failed to remove API keys');
      }
    }
  };

  const removeKey = async (keyType: 'gemini' | 'groq' | 'serpapi') => {
    if (confirm(`Remove your ${keyType.toUpperCase()} API key?`)) {
      try {
        const updateData: { gemini_key?: string; groq_key?: string; serpapi_key?: string } = {};
        updateData[`${keyType}_key` as const] = '';
        
        const status = await usersService.updateApiKeys(updateData);
        setApiKeyStatus(status);
        toast.success(`${keyType.toUpperCase()} key removed`);
      } catch (error) {
        toast.error(`Failed to remove ${keyType} key`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-apple-blue" />
      </div>
    );
  }

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
              Manage your own API keys for uninterrupted AI and web search service
            </p>
          </div>

          {/* Current Status */}
          <Card>
            <Card.Body className="p-6">
              <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4">
                Your API Keys Status
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border-2 ${apiKeyStatus?.has_gemini_key ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-apple-gray-200 dark:border-apple-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className={`w-5 h-5 ${apiKeyStatus?.has_gemini_key ? 'text-green-500' : 'text-apple-gray-400'}`} />
                    <span className="font-medium text-apple-gray-900 dark:text-white">Gemini</span>
                  </div>
                  {apiKeyStatus?.has_gemini_key ? (
                    <Badge variant="default" size="sm" className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Added
                    </Badge>
                  ) : (
                    <span className="text-xs text-apple-gray-500">Not set</span>
                  )}
                </div>
                <div className={`p-4 rounded-xl border-2 ${apiKeyStatus?.has_groq_key ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-apple-gray-200 dark:border-apple-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className={`w-5 h-5 ${apiKeyStatus?.has_groq_key ? 'text-green-500' : 'text-apple-gray-400'}`} />
                    <span className="font-medium text-apple-gray-900 dark:text-white">Groq</span>
                  </div>
                  {apiKeyStatus?.has_groq_key ? (
                    <Badge variant="default" size="sm" className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Added
                    </Badge>
                  ) : (
                    <span className="text-xs text-apple-gray-500">Not set</span>
                  )}
                </div>
                <div className={`p-4 rounded-xl border-2 ${apiKeyStatus?.has_serpapi_key ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-apple-gray-200 dark:border-apple-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className={`w-5 h-5 ${apiKeyStatus?.has_serpapi_key ? 'text-green-500' : 'text-apple-gray-400'}`} />
                    <span className="font-medium text-apple-gray-900 dark:text-white">SerpAPI</span>
                  </div>
                  {apiKeyStatus?.has_serpapi_key ? (
                    <Badge variant="default" size="sm" className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Added
                    </Badge>
                  ) : (
                    <span className="text-xs text-apple-gray-500">Not set</span>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Info Banner */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Why add your own API keys?
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  If our shared API quotas run out, you can continue using the app with your own keys. 
                  All services offer generous free tiers. 
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

          {/* SerpAPI Key - Web Search */}
          <Card>
            <Card.Body className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
                    SerpAPI Key (Web Search)
                  </h3>
                </div>
                {apiKeyStatus?.has_serpapi_key && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeKey('serpapi')}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-4">
                Required for <strong>Chapter Research</strong> feature. Enables real-time Google search for CBSE content.
              </p>
              <div className="relative">
                <Input
                  type={showSerpapi ? 'text' : 'password'}
                  placeholder={apiKeyStatus?.has_serpapi_key ? '••••••••••••••••••••••' : 'Enter your SerpAPI key...'}
                  value={apiKeys.serpapi}
                  onChange={(e) => handleKeyChange('serpapi', e.target.value)}
                  className="pr-24"
                />
                <button
                  type="button"
                  onClick={() => setShowSerpapi(!showSerpapi)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-apple-gray-400 hover:text-apple-gray-600"
                >
                  {showSerpapi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-apple-gray-500">
                Get your key from{' '}
                <a 
                  href="https://serpapi.com/manage-api-key" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-apple-blue hover:underline"
                >
                  SerpAPI Dashboard
                </a>
                {' '}(100 free searches/month)
              </p>
            </Card.Body>
          </Card>

          {/* Gemini API Key */}
          <Card>
            <Card.Body className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
                    Google Gemini API Key
                  </h3>
                </div>
                {apiKeyStatus?.has_gemini_key && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeKey('gemini')}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-4">
                Primary AI provider for answer generation and chapter research.
              </p>
              <div className="relative">
                <Input
                  type={showGemini ? 'text' : 'password'}
                  placeholder={apiKeyStatus?.has_gemini_key ? '••••••••••••••••••••••' : 'AIza... (paste your Gemini API key here)'}
                  value={apiKeys.gemini}
                  onChange={(e) => handleKeyChange('gemini', e.target.value)}
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
                {' '}(60 requests/min free)
              </p>
            </Card.Body>
          </Card>

          {/* Groq API Key */}
          <Card>
            <Card.Body className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
                    Groq API Key
                  </h3>
                </div>
                {apiKeyStatus?.has_groq_key && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeKey('groq')}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-4">
                Fallback AI provider. Extremely fast inference for real-time answers.
              </p>
              <div className="relative">
                <Input
                  type={showGroq ? 'text' : 'password'}
                  placeholder={apiKeyStatus?.has_groq_key ? '••••••••••••••••••••••' : 'gsk_... (paste your Groq API key here)'}
                  value={apiKeys.groq}
                  onChange={(e) => handleKeyChange('groq', e.target.value)}
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
                  Your API keys are securely stored on our servers encrypted at rest. 
                  They are only used to process your requests and are never shared with third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={saveKeys}
              isLoading={isSaving}
              disabled={!hasChanges || isSaving}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </Button>
            <Button
              onClick={clearKeys}
              variant="ghost"
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
