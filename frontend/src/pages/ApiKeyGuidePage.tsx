import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, Copy, Check, ExternalLink, AlertTriangle, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function ApiKeyGuidePage() {
  const navigate = useNavigate();

  const steps = [
    {
      provider: 'Google Gemini (Recommended - Free Tier)',
      icon: Sparkles,
      color: 'from-blue-500 to-cyan-500',
      steps: [
        {
          title: 'Go to Google AI Studio',
          description: 'Visit Google AI Studio to create your API key.',
          link: 'https://aistudio.google.com/app/apikey',
          linkText: 'aistudio.google.com/app/apikey',
        },
        {
          title: 'Sign in with Google',
          description: 'Use your existing Google account or create a new one.',
        },
        {
          title: 'Create API Key',
          description: 'Click "Create API Key" and give it a name (e.g., "Commerce Engine").',
        },
        {
          title: 'Copy the Key',
          description: 'Copy the API key (starts with "AIza...") and paste it in Settings.',
        },
      ],
      notes: [
        'Free tier: 60 requests per minute',
        'No credit card required for free tier',
        'Works globally',
      ],
    },
    {
      provider: 'Groq (Fast & Cheap - Alternative)',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      steps: [
        {
          title: 'Go to Groq Console',
          description: 'Visit the Groq Cloud Console to sign up.',
          link: 'https://console.groq.com/keys',
          linkText: 'console.groq.com/keys',
        },
        {
          title: 'Create Account',
          description: 'Sign up with email or Google account. Verify your email.',
        },
        {
          title: 'Generate API Key',
          description: 'Go to API Keys section and click "Create API Key".',
        },
        {
          title: 'Copy the Key',
          description: 'Copy the API key (starts with "gsk_...") and paste it in Settings.',
        },
      ],
      notes: [
        'Extremely fast inference',
        'Free credits for new users',
        'Uses Llama 3, Mixtral models',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-apple-gray-50 dark:bg-apple-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-apple-gray-900/80 backdrop-blur-xl border-b border-apple-gray-200 dark:border-apple-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
            API Key Setup Guide
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
            <Key className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-apple-gray-900 dark:text-white mb-3">
            Bring Your Own API Key
          </h2>
          <p className="text-apple-gray-600 dark:text-apple-gray-400 max-w-2xl mx-auto">
            If our AI quota runs out, you can continue using the app by adding your own API key. 
            Both options below offer generous free tiers.
          </p>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                Important: Keep Your API Key Safe
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Your API key is stored locally in your browser and never sent to our servers. 
                Do not share your API key with anyone. If you suspect your key has been compromised, 
                revoke it immediately from the provider's dashboard.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Providers */}
        <div className="space-y-8">
          {steps.map((provider, index) => (
            <motion.div
              key={provider.provider}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card>
                <Card.Body className="p-6">
                  {/* Provider Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
                      <provider.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-apple-gray-900 dark:text-white">
                        {provider.provider}
                      </h3>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-4 mb-6">
                    {provider.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-apple-gray-100 dark:bg-apple-gray-800 flex items-center justify-center text-sm font-semibold text-apple-gray-600 dark:text-apple-gray-400">
                          {stepIndex + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-apple-gray-900 dark:text-white mb-1">
                            {step.title}
                          </h4>
                          <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                            {step.description}
                          </p>
                          {step.link && (
                            <a
                              href={step.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-sm text-apple-blue hover:underline"
                            >
                              {step.linkText}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
                      Free Tier Benefits:
                    </h4>
                    <ul className="space-y-1">
                      {provider.notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
                          <Check className="w-4 h-4 flex-shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h3 className="text-xl font-semibold text-apple-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {[
              {
                q: 'Will I be charged?',
                a: 'Both Gemini and Groq offer generous free tiers. You will not be charged unless you explicitly upgrade to a paid plan on their platforms.',
              },
              {
                q: 'Is my API key secure?',
                a: 'Yes. Your API key is stored only in your browser\'s local storage and is used directly from your browser to call the AI services. Our servers never see your API key.',
              },
              {
                q: 'Can I switch between providers?',
                a: 'Yes! You can add multiple API keys in Settings and switch between them at any time.',
              },
              {
                q: 'What if my API key stops working?',
                a: 'You can generate a new API key from the provider\'s dashboard and update it in Settings. Old keys can be revoked for security.',
              },
            ].map((faq, index) => (
              <Card key={index}>
                <Card.Body className="p-4">
                  <h4 className="font-medium text-apple-gray-900 dark:text-white mb-2">
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

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
