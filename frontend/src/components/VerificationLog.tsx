import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, AlertTriangle, XCircle, Brain, Shield, FileCheck, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, ConfidenceBadge } from '@/components/ui/Badge';
import type { Answer } from '@/types';

interface VerificationLogProps {
  answer: Answer;
}

export function VerificationLog({ answer }: VerificationLogProps) {
  const [expanded, setExpanded] = useState<number | null>(1);

  const layers = [
    {
      id: 1,
      name: 'Generator',
      icon: Brain,
      color: 'from-apple-blue to-apple-teal',
      bgColor: 'bg-apple-blue/10',
      textColor: 'text-apple-blue',
      data: answer.layer1_output,
      summary: `${Math.round(answer.layer1_output.confidence * 100)}% confidence`,
      details: (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              Key Points Covered
            </p>
            <div className="space-y-2">
              {answer.layer1_output.key_points.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-sm text-apple-gray-600 dark:text-apple-gray-400"
                >
                  <CheckCircle className="w-4 h-4 text-apple-green mt-0.5 shrink-0" />
                  {point}
                </motion.div>
              ))}
            </div>
          </div>
          {answer.layer1_output.referenced_concepts.length > 0 && (
            <div>
              <p className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                Referenced Concepts
              </p>
              <div className="flex flex-wrap gap-2">
                {answer.layer1_output.referenced_concepts.map((concept, i) => (
                  <Badge key={i} variant="info" size="sm">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 2,
      name: 'Validator',
      icon: Shield,
      color: 'from-apple-purple to-apple-pink',
      bgColor: 'bg-apple-purple/10',
      textColor: 'text-apple-purple',
      data: answer.layer2_output,
      summary: `${Math.round(answer.layer2_output.alignment_score)}% aligned`,
      details: (
        <div className="space-y-4">
          <div className="glass rounded-lg p-4">
            <p className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-1">
              Syllabus Alignment
            </p>
            <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
              {answer.layer2_output.syllabus_alignment}
            </p>
          </div>
          
          {answer.layer2_output.missing_keywords.length > 0 && (
            <div>
              <p className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                Missing Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {answer.layer2_output.missing_keywords.map((keyword, i) => (
                  <Badge key={i} variant="warning" size="sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {answer.layer2_output.irrelevant_points.length > 0 && (
            <div>
              <p className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                Irrelevant Points
              </p>
              <div className="space-y-2">
                {answer.layer2_output.irrelevant_points.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-apple-gray-600 dark:text-apple-gray-400">
                    <AlertTriangle className="w-4 h-4 text-apple-orange mt-0.5 shrink-0" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 3,
      name: 'Auditor',
      icon: FileCheck,
      color: 'from-apple-orange to-apple-yellow',
      bgColor: 'bg-apple-orange/10',
      textColor: 'text-apple-orange',
      data: answer.layer3_output,
      summary: `${answer.layer3_output.severity === 'none' ? 'No errors' : answer.layer3_output.severity + ' severity'}`,
      details: (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <SeverityBadge severity={answer.layer3_output.severity} />
          </div>
          
          {answer.layer3_output.logical_errors.length > 0 ? (
            <div className="space-y-2">
              {answer.layer3_output.logical_errors.map((error, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2 text-sm text-apple-gray-600 dark:text-apple-gray-400"
                >
                  <XCircle className="w-4 h-4 text-apple-red mt-0.5 shrink-0" />
                  {error}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-apple-green">
              <CheckCircle className="w-5 h-5" />
              <span>No logical errors found</span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 4,
      name: 'Scorer',
      icon: Award,
      color: 'from-apple-green to-apple-teal',
      bgColor: 'bg-apple-green/10',
      textColor: 'text-apple-green',
      data: answer.layer4_output,
      summary: `${answer.layer4_output.predicted_score}/${answer.layer4_output.max_marks} marks`,
      details: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-apple-gray-500 uppercase tracking-wide mb-1">Score</p>
              <p className="text-3xl font-bold text-apple-gray-900 dark:text-white">
                {answer.layer4_output.predicted_score}
                <span className="text-lg text-apple-gray-400">/{answer.layer4_output.max_marks}</span>
              </p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-apple-gray-500 uppercase tracking-wide mb-1">Percentage</p>
              <p className="text-3xl font-bold text-apple-gray-900 dark:text-white">
                {Math.round(answer.layer4_output.score_percentage)}%
              </p>
            </div>
          </div>
          
          {answer.layer4_output.missing_components.length > 0 && (
            <div>
              <p className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                Missing Components for Full Marks
              </p>
              <div className="space-y-2">
                {answer.layer4_output.missing_components.map((component, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-apple-gray-600 dark:text-apple-gray-400">
                    <AlertTriangle className="w-4 h-4 text-apple-orange mt-0.5 shrink-0" />
                    {component}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white">
                4-Layer Verification
              </h3>
            </div>
            <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400">
              Processed in {(answer.processing_time_ms ? (answer.processing_time_ms / 1000).toFixed(1) : '0.0')}s
              {answer.retries > 0 && ` • ${answer.retries} ${answer.retries === 1 ? 'retry' : 'retries'}`}
            </p>
          </div>
          <ConfidenceBadge score={answer.confidence_score} />
        </div>
      </Card.Header>
      
      <Card.Body className="space-y-3">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isExpanded = expanded === layer.id;
          
          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-apple-gray-200 dark:border-apple-gray-800 rounded-apple overflow-hidden"
            >
              <motion.button
                onClick={() => setExpanded(isExpanded ? null : layer.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800/50 transition-colors"
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${layer.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${layer.textColor}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-apple-gray-900 dark:text-white">
                      Layer {layer.id}: {layer.name}
                    </p>
                    <p className="text-sm text-apple-gray-500">{layer.summary}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-apple-gray-400" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="border-t border-apple-gray-200 dark:border-apple-gray-800 bg-apple-gray-50/50 dark:bg-apple-gray-900/30"
                  >
                    <div className="p-4">
                      {layer.details}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </Card.Body>
    </Card>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
    none: { variant: 'success', label: 'No Errors' },
    low: { variant: 'default', label: 'Low' },
    medium: { variant: 'warning', label: 'Medium' },
    high: { variant: 'danger', label: 'High' },
  };

  const { variant, label } = config[severity] || config.none;

  return (
    <Badge variant={variant} size="md">
      {label}
    </Badge>
  );
}
