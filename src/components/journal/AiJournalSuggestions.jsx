import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, BookOpen, Dumbbell, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';

export default function AiJournalSuggestions({ entry, onClose }) {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: []
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }),
    initialData: []
  });

  useEffect(() => {
    generateSuggestions();
  }, [entry]);

  const generateSuggestions = async () => {
    try {
      const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this CBT journal entry, provide personalized recommendations:

**Situation:** ${stripHtml(entry.situation)}
**Thoughts:** ${stripHtml(entry.automatic_thoughts)}
**Emotions:** ${entry.emotions?.join(', ')}
**Intensity:** ${entry.emotion_intensity}/10
**Cognitive Distortions:** ${entry.cognitive_distortions?.join(', ')}

Provide:
1. **Similar Patterns**: 2-3 brief insights about thought patterns that might be helpful to explore further
2. **Exercise Recommendations**: Suggest 2-3 CBT exercise categories that would be most helpful (from: breathing, grounding, cognitive_restructuring, behavioral_activation, mindfulness, exposure)
3. **Journaling Suggestions**: 1-2 follow-up journaling ideas or prompts to deepen this work
4. **Goal Connection**: If applicable, suggest how this relates to potential personal growth goals`,
        response_json_schema: {
          type: "object",
          properties: {
            patterns: {
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
            journaling_suggestions: {
              type: "array",
              items: { type: "string" }
            },
            goal_suggestion: { type: "string" }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <h3 className="text-lg font-semibold text-gray-800">AI Insights & Suggestions</h3>
      </div>

      {/* Patterns */}
      {suggestions.patterns?.length > 0 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Patterns to Explore
            </h4>
            <ul className="space-y-2">
              {suggestions.patterns.map((pattern, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
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

      {/* Journaling Suggestions */}
      {suggestions.journaling_suggestions?.length > 0 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Continue Exploring
            </h4>
            <ul className="space-y-2">
              {suggestions.journaling_suggestions.map((suggestion, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Goal Suggestion */}
      {suggestions.goal_suggestion && (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-600" />
              Growth Opportunity
            </h4>
            <p className="text-sm text-gray-700 mb-3">{suggestions.goal_suggestion}</p>
            <Link to={createPageUrl('Goals')}>
              <Button variant="outline" size="sm" className="w-full">
                Create a Goal
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