import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, TrendingUp, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoalMotivation({ goals }) {
  const [motivation, setMotivation] = useState(null);
  const [showMotivation, setShowMotivation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show motivation for goals that haven't been updated in 3+ days
    const needsMotivation = goals.filter(goal => {
      const daysSinceUpdate = goal.updated_date 
        ? (Date.now() - new Date(goal.updated_date).getTime()) / (1000 * 60 * 60 * 24)
        : 999;
      return daysSinceUpdate >= 3 && goal.status === 'active';
    });

    if (needsMotivation.length > 0 && !motivation) {
      generateMotivation(needsMotivation[0]);
    }
  }, [goals]);

  const generateMotivation = async (goal) => {
    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a motivational message and progress check-in for this goal:

**Goal:** ${goal.title}
**Description:** ${goal.description}
**Progress:** ${goal.progress || 0}%
**Target Date:** ${goal.target_date || 'Not set'}
**Days Since Last Update:** ${goal.updated_date ? Math.floor((Date.now() - new Date(goal.updated_date).getTime()) / (1000 * 60 * 60 * 24)) : 'Many'}

Provide:
1. **Motivational Message**: A personalized, encouraging message (2-3 sentences)
2. **Progress Check**: Specific questions about their progress (2 questions)
3. **Next Action Suggestion**: One concrete next step they could take today
4. **Encouragement**: A brief, uplifting reminder about why this goal matters

Keep it warm, personal, and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            motivational_message: { type: "string" },
            progress_questions: {
              type: "array",
              items: { type: "string" }
            },
            next_action: { type: "string" },
            encouragement: { type: "string" }
          }
        }
      });

      setMotivation({ ...response, goal });
      setShowMotivation(true);
    } catch (error) {
      console.error('Failed to generate motivation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showMotivation || !motivation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    Goal Check-in: {motivation.goal.title}
                  </h3>
                  <p className="text-xs text-gray-500">AI-powered motivation boost</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMotivation(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Motivational Message */}
              <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{motivation.motivational_message}</p>
                </div>
              </div>

              {/* Progress Questions */}
              <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Progress Reflection
                </h4>
                <ul className="space-y-2">
                  {motivation.progress_questions?.map((question, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Action */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  Today's Action
                </h4>
                <p className="text-sm text-gray-700">{motivation.next_action}</p>
              </div>

              {/* Encouragement */}
              <div className="text-center pt-2 border-t">
                <p className="text-sm italic text-gray-600">"{motivation.encouragement}"</p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => {
                  // Mark as updated
                  base44.entities.Goal.update(motivation.goal.id, { updated_date: new Date().toISOString() });
                  setShowMotivation(false);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                I'm On It! 💪
              </Button>
              <Button
                onClick={() => setShowMotivation(false)}
                variant="outline"
              >
                Remind Me Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}