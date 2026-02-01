import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, BookOpen, Dumbbell, Target, TrendingUp, MessageSquare, BarChart3, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';

export default function AiJournalSuggestions({ entry, onClose }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasAnalyzedRef = useRef(false);

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: [],
    staleTime: 300000,
    refetchOnWindowFocus: false
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }),
    initialData: [],
    staleTime: 300000,
    refetchOnWindowFocus: false
  });

  const { data: allEntries } = useQuery({
    queryKey: ['thoughtJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 20),
    initialData: [],
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  const generateSuggestions = useCallback(async () => {
    if (hasAnalyzedRef.current) return;
    hasAnalyzedRef.current = true;
    try {
      const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';

      // Prepare past entries context
      const pastEntriesContext = allEntries
        .filter(e => e.id !== entry.id)
        .slice(0, 10)
        .map(e => ({
          situation: stripHtml(e.situation)?.substring(0, 200),
          thoughts: stripHtml(e.automatic_thoughts)?.substring(0, 200),
          emotions: e.emotions?.join(', '),
          distortions: e.cognitive_distortions?.join(', '),
          tags: e.tags?.join(', ')
        }));

      // Prepare goals context
      const goalsContext = goals.map(g => ({
        title: g.title,
        category: g.category,
        description: g.description
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this CBT journal entry and provide advanced personalized insights:

**CURRENT ENTRY:**
- Situation: ${stripHtml(entry.situation)}
- Automatic Thoughts: ${stripHtml(entry.automatic_thoughts)}
- Emotions: ${entry.emotions?.join(', ')}
- Intensity: ${entry.emotion_intensity}/10
- Cognitive Distortions: ${entry.cognitive_distortions?.join(', ')}
- Tags: ${entry.tags?.join(', ') || 'none'}

**USER'S PAST ENTRIES (last 10):**
${JSON.stringify(pastEntriesContext, null, 2)}

**USER'S ACTIVE GOALS:**
${JSON.stringify(goalsContext, null, 2)}

Provide comprehensive analysis:

1. **Recurring Themes** (2-4 themes): Analyze the current and past entries to identify recurring patterns, triggers, emotional themes, or cognitive distortions. Be specific about what patterns repeat across entries.

2. **Sentiment & Auto-Categorization**: 
   - Overall sentiment (positive, negative, neutral, mixed)
   - Primary topic category (work, relationships, self-worth, health, general)
   - Emotional intensity trend (increasing, stable, decreasing)

3. **Personalized Reflection Questions** (3-4 questions): Based on the entry content, past patterns, and user goals, generate deep, personalized reflection questions that help the user explore their thoughts and emotions further.

4. **Exercise Recommendations** (2-3): Suggest specific CBT exercise categories (breathing, grounding, cognitive_restructuring, behavioral_activation, mindfulness, exposure) with reasons based on the analysis.

5. **Progress Insights**: If patterns show improvement or areas needing attention, mention it.

6. **Goal Alignment**: If this entry relates to any of their active goals, explain the connection and suggest next steps.`,
        response_json_schema: {
          type: "object",
          properties: {
            recurring_themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  description: { type: "string" },
                  frequency: { type: "string" }
                }
              }
            },
            sentiment_analysis: {
              type: "object",
              properties: {
                sentiment: { type: "string" },
                topic_category: { type: "string" },
                intensity_trend: { type: "string" },
                summary: { type: "string" }
              }
            },
            reflection_questions: {
              type: "array",
              items: { type: "string" }
            },
            exercise_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            progress_insights: { type: "string" },
            goal_alignment: {
              type: "object",
              properties: {
                related_goal: { type: "string" },
                connection: { type: "string" },
                suggested_action: { type: "string" }
              }
            }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [entry, goals, allEntries]);

  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200 mb-4"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          <p className="text-sm text-gray-600">Analyzing your entry and generating suggestions...</p>
        </div>
      </motion.div>
    );
  }

  if (!suggestions) return null;

  const recommendedExercises = exercises.filter(ex => 
    suggestions.exercise_recommendations?.some(rec => 
      rec.category === ex.category
    )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">AI-Powered Analysis</h3>
      </div>

      {/* Sentiment & Categorization */}
      {suggestions.sentiment_analysis && (
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Entry Analysis
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sentiment:</span>
                <Badge variant="outline" className="capitalize">
                  {suggestions.sentiment_analysis.sentiment}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Topic:</span>
                <Badge variant="outline" className="capitalize">
                  {suggestions.sentiment_analysis.topic_category}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Intensity Trend:</span>
                <Badge variant="outline" className="capitalize">
                  {suggestions.sentiment_analysis.intensity_trend}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 mt-3 pt-3 border-t">
                {suggestions.sentiment_analysis.summary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurring Themes */}
      {suggestions.recurring_themes?.length > 0 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Recurring Themes in Your Entries
            </h4>
            <div className="space-y-3">
              {suggestions.recurring_themes.map((theme, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm text-gray-800">{theme.theme}</p>
                    <Badge variant="secondary" className="text-xs">
                      {theme.frequency}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reflection Questions */}
      {suggestions.reflection_questions?.length > 0 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              Personalized Reflection Questions
            </h4>
            <div className="space-y-2">
              {suggestions.reflection_questions.map((question, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-600 font-semibold mt-0.5">{i + 1}.</span>
                    <span>{question}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Recommendations */}
      {suggestions.exercise_recommendations?.length > 0 && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-green-600" />
              Recommended Exercises
            </h4>
            <div className="space-y-3">
              {suggestions.exercise_recommendations.map((rec, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between mb-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {rec.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{rec.reason}</p>
                </div>
              ))}
              {recommendedExercises.length > 0 && (
                <Link to={createPageUrl('Exercises')}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Browse Exercises
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Insights */}
      {suggestions.progress_insights && (
        <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              Progress Insights
            </h4>
            <p className="text-sm text-gray-700">{suggestions.progress_insights}</p>
          </CardContent>
        </Card>
      )}

      {/* Goal Alignment */}
      {suggestions.goal_alignment?.related_goal && (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-600" />
              Goal Connection: {suggestions.goal_alignment.related_goal}
            </h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">How this entry relates:</p>
                <p className="text-sm text-gray-700">{suggestions.goal_alignment.connection}</p>
              </div>
              {suggestions.goal_alignment.suggested_action && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Suggested action:</p>
                  <p className="text-sm text-gray-700 font-medium">{suggestions.goal_alignment.suggested_action}</p>
                </div>
              )}
            </div>
            <Link to={createPageUrl('Goals')}>
              <Button variant="outline" size="sm" className="w-full mt-3">
                View Goals
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Button variant="ghost" onClick={onClose} className="w-full">
        Close Suggestions
      </Button>
    </motion.div>
  );
}