import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, Lightbulb, BookOpen, X } from 'lucide-react';
import { motion } from 'framer-motion';

const commonDistortions = [
  { name: 'All-or-Nothing Thinking', description: 'Seeing things in black and white categories' },
  { name: 'Overgeneralization', description: 'Making broad conclusions from a single event' },
  { name: 'Mental Filter', description: 'Focusing only on negative details' },
  { name: 'Disqualifying the Positive', description: 'Rejecting positive experiences' },
  { name: 'Jumping to Conclusions', description: 'Mind reading or fortune telling' },
  { name: 'Catastrophizing', description: 'Expecting the worst possible outcome' },
  { name: 'Emotional Reasoning', description: 'Believing emotions reflect reality' },
  { name: 'Should Statements', description: 'Using "should" or "must" statements' },
  { name: 'Labeling', description: 'Attaching negative labels to yourself or others' },
  { name: 'Personalization', description: 'Blaming yourself for things outside your control' }
];

export default function AiDistortionAnalysis({ entry, onApplyDistortions }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyzeDistortions();
  }, [entry]);

  const analyzeDistortions = async () => {
    try {
      const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a CBT therapist analyzing a journal entry for cognitive distortions (unhelpful thought patterns).

**Journal Entry:**
- Situation: ${stripHtml(entry.situation)}
- Automatic Thoughts: ${stripHtml(entry.automatic_thoughts)}
- Emotions: ${entry.emotions?.join(', ')}

**Common Cognitive Distortions:**
${commonDistortions.map(d => `- ${d.name}: ${d.description}`).join('\n')}

Analyze the automatic thoughts and identify which cognitive distortions are present. For each distortion found:
1. Name the distortion
2. Explain specifically HOW it appears in the user's thoughts (quote relevant parts)
3. Provide a brief challenge or alternative perspective (1-2 sentences)

Only identify distortions that are clearly present. If no distortions are found, explain why the thoughts seem balanced.`,
        response_json_schema: {
          type: "object",
          properties: {
            distortions_found: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  evidence: { type: "string" },
                  challenge: { type: "string" }
                }
              }
            },
            overall_assessment: { type: "string" },
            suggested_reframe: { type: "string" }
          }
        }
      });

      setAnalysis(response);
    } catch (error) {
      console.error('Failed to analyze distortions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyDistortions = () => {
    const distortionNames = analysis.distortions_found.map(d => d.name);
    onApplyDistortions(distortionNames, analysis.suggested_reframe);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
          <p className="text-sm text-gray-600">AI is analyzing your thoughts for cognitive distortions...</p>
        </div>
      </motion.div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Overall Assessment */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Cognitive Distortion Analysis
            </h4>
          </div>
          <p className="text-sm text-gray-700 mb-3">{analysis.overall_assessment}</p>
          
          {analysis.distortions_found?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.distortions_found.map((d, i) => (
                <Badge key={i} variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  {d.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
              ✓ No significant cognitive distortions detected
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      {analysis.distortions_found?.length > 0 && (
        <div className="space-y-3">
          {analysis.distortions_found.map((distortion, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border border-amber-200 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-800 mb-1">{distortion.name}</h5>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">How it appears:</p>
                          <p className="text-sm text-gray-700 italic bg-amber-50 p-2 rounded border-l-2 border-amber-400">
                            "{distortion.evidence}"
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Challenge this thought:</p>
                          <p className="text-sm text-gray-700 bg-green-50 p-2 rounded border-l-2 border-green-400">
                            {distortion.challenge}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Suggested Reframe */}
      {analysis.suggested_reframe && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-green-600" />
              Suggested Balanced Perspective
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.suggested_reframe}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {analysis.distortions_found?.length > 0 && (
        <div className="flex gap-2">
          <Button
            onClick={handleApplyDistortions}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Apply to Journal Entry
          </Button>
        </div>
      )}
    </motion.div>
  );
}