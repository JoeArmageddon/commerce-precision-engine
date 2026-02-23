import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  RefreshCw, 
  Trash2, 
  AlertCircle,
  Check,
  X,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  ALPHA_KEYS, 
  getUsedAlphaKeys, 
  getRemainingKeysCount,
  getAvailableAlphaKeys,
  resetUsedAlphaKeys,
  isAlphaKeyUsed 
} from '@/data/alphaKeys';
import toast from 'react-hot-toast';

export function AlphaStatusPage() {
  const navigate = useNavigate();
  const [usedKeys, setUsedKeys] = useState<{ key: string; usedAt: string; userId: string }[]>([]);
  const [remainingCount, setRemainingCount] = useState(50);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const loadData = () => {
    setUsedKeys(getUsedAlphaKeys());
    setRemainingCount(getRemainingKeysCount());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    resetUsedAlphaKeys();
    loadData();
    setShowConfirmReset(false);
    toast.success('All alpha keys reset');
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Key copied to clipboard');
  };

  const usedKeySet = new Set(usedKeys.map(u => u.key));

  return (
    <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-apple-gray-900/80 backdrop-blur-xl border-b border-apple-gray-200 dark:border-apple-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
            Alpha Status
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <Card.Body className="p-6 text-center">
                <p className="text-sm text-apple-gray-500 mb-1">Total Keys</p>
                <p className="text-3xl font-bold text-apple-gray-900 dark:text-white">50</p>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body className="p-6 text-center">
                <p className="text-sm text-apple-gray-500 mb-1">Used</p>
                <p className="text-3xl font-bold text-apple-red">{usedKeys.length}</p>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body className="p-6 text-center">
                <p className="text-sm text-apple-gray-500 mb-1">Available</p>
                <p className="text-3xl font-bold text-apple-green">{remainingCount}</p>
              </Card.Body>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card>
            <Card.Body className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
                  Usage Progress
                </span>
                <span className="text-sm text-apple-gray-500">
                  {Math.round((usedKeys.length / 50) * 100)}%
                </span>
              </div>
              <div className="h-4 bg-apple-gray-200 dark:bg-apple-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-apple-blue to-apple-purple transition-all duration-500"
                  style={{ width: `${(usedKeys.length / 50) * 100}%` }}
                />
              </div>
            </Card.Body>
          </Card>

          {/* Used Keys List */}
          <Card>
            <Card.Body className="p-6">
              <h2 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4">
                Used Keys ({usedKeys.length})
              </h2>
              {usedKeys.length === 0 ? (
                <div className="text-center py-8 text-apple-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No keys have been used yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {usedKeys.map((used, index) => (
                    <div
                      key={used.key}
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-apple-gray-900 dark:text-white">
                          {used.key}
                        </span>
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="text-xs text-apple-gray-500">
                        {new Date(used.usedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Available Keys List */}
          <Card>
            <Card.Body className="p-6">
              <h2 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4">
                Available Keys ({remainingCount})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {ALPHA_KEYS.map((key) => {
                  const isUsed = usedKeySet.has(key);
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-2 rounded text-xs font-mono ${
                        isUsed 
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 line-through' 
                          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      }`}
                    >
                      <span>{key}</span>
                      {!isUsed && (
                        <button
                          onClick={() => copyKey(key)}
                          className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          {/* Admin Actions */}
          <Card>
            <Card.Body className="p-6">
              <h2 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-4">
                Admin Actions
              </h2>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={loadData}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </Button>
                
                {showConfirmReset ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-apple-red">Confirm reset?</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowConfirmReset(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleReset}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Reset All
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfirmReset(true)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset All Keys
                  </Button>
                )}
              </div>
              <p className="mt-3 text-xs text-apple-gray-500">
                Resetting will clear all used key records. This is useful for testing.
              </p>
            </Card.Body>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
