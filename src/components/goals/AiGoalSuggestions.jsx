import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeGoalData, safeJoin } from '../utils/aiDataNormalizer';

export default function AiGoalSuggestions({ onSelectGoal, onClose }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: journalEntries } = useQuery({
    queryKey: ['thoughtJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 15),
    initialData: []
  });

  const { data: moodEntries } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 10),
    initialData: []
  });

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';

      // Prepare context from journal entries
      const journalContext = journalEntries.slice(0, 10).map(e => ({
        situation: stripHtml(e.situation)?.substring(0, 200),
        emotions: Array.isArray(e.emotions) ? e.emotions.join(', ') : '',
        distortions: Array.isArray(e.cognitive_distortions) ? e.cognitive_distortions.join(', ') : '',
        tags: Array.isArray(e.tags) ? e.tags.join(', ') : ''
      }));

      // Prepare mood context
      const moodContext = moodEntries.map(m => ({
        mood: m.mood,
        emotions: Array.isArray(m.emotions) ? m.emotions.join(', ') : '',
        triggers: Array.isArray(m.triggers) ? m.triggers.join(', ') : '',
        activities: Array.isArray(m.activities) ? m.activities.join(', ') : ''
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on the user's journal entries and mood tracking, suggest 3-4 SMART goals for personal growth.

**Recent Journal Entries:**
${JSON.stringify(journalContext, null, 2)}

**Recent Mood Patterns:**
${JSON.stringify(moodContext, null, 2)}

For each goal, provide:
1. **Title**: Clear, actionable goal title
2. **Category**: One of: behavioral, emotional, social, cognitive, lifestyle
3. **Description**: Brief description (2-3 sentences)
4. **SMART Breakdown**:
   - Specific: What exactly will be achieved?
   - Measurable: How will progress be measured?
   - Achievable: Why is this realistic?
   - Relevant: How does this align with their needs?
   - Time-bound: Suggested timeframe
5. **Initial Milestones**: 3-4 actionable first steps
6. **Why This Goal**: Brief explanation of why this goal was suggested based on their patterns

Focus on goals that address recurring patterns, emotional needs, or areas for growth identified in their entries.`,
        response_json_schema: {
          type: "object",
          properties: {
            goals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                  smart_breakdown: {
                    type: "object",
                    properties: {
                      specific: { type: "string" },
                      measurable: { type: "string" },
                      achievable: { type: "string" },
                      relevant: { type: "string" },
                      time_bound: { type: "string" }
                    }
                  },
                  initial_milestones: {
                    type: "array",
                    items: { type: "string" }
                  },
                  why_suggested: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (!response || !response.goals || response.goals.length === 0) {
        throw new Error('No goal suggestions were generated. Try adding more journal entries or mood check-ins.');
      }

      // Normalize all goal data to ensure arrays are valid
      const normalizedGoals = response.goals.map(normalizeGoalData).filter(Boolean);
      setSuggestions({ goals: normalizedGoals });
    } catch (error) {
      console.error('Failed to generate goal suggestions:', error.message, error.stack);
      alert(error.message || 'Failed to generate goal suggestions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!suggestions && !isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Goal Suggestions</h2>
            <p className="text-gray-600 mb-6">
              Let AI analyze your journal entries and mood patterns to suggest personalized SMART goals for your growth journey.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => generateSuggestions()}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Goal Suggestions
              </Button>
              <Button onClick={() => onClose()} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Analyzing your patterns and generating personalized goals...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        <Card className="border-0 shadow-2xl flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-6 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">Suggested SMART Goals</h2>
            </div>
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          </div>

          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            {suggestions?.goals?.map((goal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{goal.title}</h3>
                        <Badge variant="outline" className="capitalize">
                          {goal.category}
                        </Badge>
                      </div>
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>

                    <p className="text-gray-700 mb-4">{goal.description}</p>

                    {/* Why Suggested */}
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-blue-700">Why this goal: </span>
                        {goal.why_suggested}
                      </p>
                    </div>

                    {/* SMART Breakdown */}
                    <div className="bg-white p-4 rounded-lg border mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        SMART Breakdown
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Specific:</span>
                          <p className="text-gray-600">{goal.smart_breakdown.specific}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Measurable:</span>
                          <p className="text-gray-600">{goal.smart_breakdown.measurable}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Achievable:</span>
                          <p className="text-gray-600">{goal.smart_breakdown.achievable}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Relevant:</span>
                          <p className="text-gray-600">{goal.smart_breakdown.relevant}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Time-bound:</span>
                          <p className="text-gray-600">{goal.smart_breakdown.time_bound}</p>
                        </div>
                      </div>
                    </div>

                    {/* Initial Milestones */}
                    {goal.milestones?.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-orange-600" />
                          First Steps
                        </h4>
                        <ul className="space-y-1">
                          {goal.milestones.map((milestone, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-orange-600 mt-0.5">•</span>
                              <span>{typeof milestone === 'string' ? milestone : milestone.title || milestone.description || 'Step'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={() => onSelectGoal({
                        title: goal.title,
                        category: goal.category,
                        description: goal.description,
                        milestones: goal.milestones.map(m => ({ 
                          title: typeof m === 'string' ? m : m.title || m.description || 'Step', 
                          completed: false 
                        }))
                      })}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Create This Goal
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}