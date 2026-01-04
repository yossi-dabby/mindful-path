import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Target, Book, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { normalizeCoachingInsights, safeArray, safeText } from '@/components/utils/aiDataNormalizer';

export default function PersonalizedInsights({ onStartSession }) {
  const [insights, setInsights] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: goals } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }),
    initialData: []
  });

  const { data: journals } = useQuery({
    queryKey: ['recentJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 10),
    initialData: []
  });

  const { data: moods } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 14),
    initialData: []
  });

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: []
  });

  // Check for inactive patterns
  const lastJournalDate = journals[0]?.created_date;
  const daysSinceJournal = lastJournalDate 
    ? Math.floor((Date.now() - new Date(lastJournalDate)) / (1000 * 60 * 60 * 24))
    : null;

  const lastMoodDate = moods[0]?.date;
  const daysSinceMood = lastMoodDate
    ? Math.floor((Date.now() - new Date(lastMoodDate)) / (1000 * 60 * 60 * 24))
    : null;

  const staleGoals = goals.filter(g => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(g.updated_date)) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate >= 7;
  });

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const stripHtml = (html) => {
        if (!html || typeof html !== 'string') return '';
        return html.replace(/<[^>]*>/g, '');
      };
      
      const journalPatterns = journals.slice(0, 10).map(j => ({
        date: j.created_date?.split('T')[0],
        emotions: j.emotions?.join(', '),
        cognitive_distortions: j.cognitive_distortions?.join(', '),
        automatic_thoughts: stripHtml(j.automatic_thoughts)?.substring(0, 150),
        balanced_thought: stripHtml(j.balanced_thought)?.substring(0, 150)
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `As an AI wellness coach, analyze this user's data to provide personalized insights and recommendations:

**Active Goals:**
${goals.map(g => `- ${g.title} (${g.category}, ${g.progress}% complete, last updated: ${formatDistanceToNow(new Date(g.updated_date))} ago)`).join('\n')}

**Recent Journal Entries (Last 10):**
${JSON.stringify(journalPatterns, null, 2)}

**Recent Mood Trend (Last 14 days):**
${moods.map(m => `${m.date}: ${m.mood}, stress: ${m.stress_level}/10, energy: ${m.energy_level}`).join('\n')}

**Inactivity Alerts:**
- Days since last journal: ${daysSinceJournal || 'N/A'}
- Days since last mood check: ${daysSinceMood || 'N/A'}
- Goals not updated in 7+ days: ${staleGoals.length}

Provide:
1. **Recurring Thought Patterns**: Identify specific cognitive distortions or negative thought patterns
2. **Targeted CBT Recommendations**: Suggest 2-3 specific exercise categories (breathing, grounding, cognitive_restructuring, mindfulness, etc.) and WHY they would help
3. **Goal Alignment**: How their journal themes relate to their active goals
4. **Engagement Nudges**: Personalized messages to encourage journaling, mood tracking, or goal updates if they've been inactive
5. **Progress Recognition**: Positive patterns or improvements you notice

Be specific, encouraging, and reference their actual data.`,
        response_json_schema: {
          type: "object",
          properties: {
            recurring_patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pattern: { type: "string" },
                  frequency: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            cbt_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exercise_category: { type: "string" },
                  reason: { type: "string" },
                  expected_benefit: { type: "string" }
                }
              }
            },
            goal_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  goal_title: { type: "string" },
                  connection: { type: "string" },
                  suggestion: { type: "string" }
                }
              }
            },
            engagement_nudges: {
              type: "array",
              items: { type: "string" }
            },
            positive_progress: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      const normalized = normalizeCoachingInsights(response);
      setInsights(normalized);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const matchedExercises = safeArray(insights?.cbt_recommendations).map(rec => {
    return exercises.find(ex => ex.category === rec.exercise_category);
  }).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Quick Alerts */}
      {(daysSinceJournal > 5 || daysSinceMood > 3 || staleGoals.length > 0) && (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 mb-2">Activity Reminder</h4>
                <ul className="space-y-1 text-sm text-orange-800">
                  {daysSinceJournal > 5 && (
                    <li>• It's been {daysSinceJournal} days since your last journal entry</li>
                  )}
                  {daysSinceMood > 3 && (
                    <li>• Your mood hasn't been checked in {daysSinceMood} days</li>
                  )}
                  {staleGoals.length > 0 && (
                    <li>• {staleGoals.length} goal{staleGoals.length > 1 ? 's' : ''} need updating</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Insights */}
      {!insights && !isGenerating && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6 text-center">
            <Brain className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Get Personalized Coaching Insights</h3>
            <p className="text-sm text-gray-600 mb-4">
              Analyze your journal patterns, goals, and mood trends to receive tailored recommendations
            </p>
            <Button
              onClick={generateInsights}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600">Analyzing your mental wellness journey...</p>
          </CardContent>
        </Card>
      )}

      {insights && (
        <>
          {/* Positive Progress */}
          {safeArray(insights.positive_progress).length > 0 && (
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Great Progress!
                </h4>
                <ul className="space-y-2">
                  {safeArray(insights.positive_progress).map((item, i) => {
                    const text = safeText(item);
                    return text ? (
                      <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{text}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recurring Patterns */}
          {safeArray(insights.recurring_patterns).filter(p => p && (p.pattern || typeof p === 'string')).length > 0 && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Thought Patterns Identified
                </h4>
                <div className="space-y-3">
                  {safeArray(insights.recurring_patterns).filter(p => p && (p.pattern || typeof p === 'string')).map((pattern, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-gray-800 text-sm">
                          {typeof pattern === 'string' ? pattern : pattern.pattern}
                        </p>
                        {typeof pattern === 'object' && pattern.frequency && (
                          <span className="text-xs text-gray-500">{pattern.frequency}</span>
                        )}
                      </div>
                      {typeof pattern === 'object' && pattern.impact && (
                        <p className="text-xs text-gray-600">{pattern.impact}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CBT Recommendations */}
          {safeArray(insights.cbt_recommendations).filter(r => r && (r.exercise_category || typeof r === 'string')).length > 0 && (
            <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
              <CardContent className="p-4">
                <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Recommended CBT Techniques
                </h4>
                <div className="space-y-3">
                  {safeArray(insights.cbt_recommendations).filter(r => r && (r.exercise_category || typeof r === 'string')).map((rec, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border-l-4 border-indigo-400">
                      <p className="font-medium text-gray-800 text-sm capitalize mb-1">
                        {typeof rec === 'string' ? rec : (rec.exercise_category || '').replace(/_/g, ' ')}
                      </p>
                      {typeof rec === 'object' && rec.reason && (
                        <p className="text-xs text-gray-600 mb-2">{rec.reason}</p>
                      )}
                      {typeof rec === 'object' && rec.expected_benefit && (
                        <p className="text-xs text-indigo-700 italic">💡 {rec.expected_benefit}</p>
                      )}
                      {matchedExercises[i] && (
                        <p className="text-xs text-gray-500 mt-2">
                          Try: <span className="font-medium">{matchedExercises[i].title}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goal Insights */}
          {safeArray(insights.goal_insights).filter(g => g && (g.goal_title || typeof g === 'string')).length > 0 && (
            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
              <CardContent className="p-4">
                <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Goal Alignment
                </h4>
                <div className="space-y-3">
                  {safeArray(insights.goal_insights).filter(g => g && (g.goal_title || typeof g === 'string')).map((insight, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg">
                      <p className="font-medium text-gray-800 text-sm mb-1">
                        {typeof insight === 'string' ? insight : insight.goal_title}
                      </p>
                      {typeof insight === 'object' && insight.connection && (
                        <p className="text-xs text-gray-600 mb-2">{insight.connection}</p>
                      )}
                      {typeof insight === 'object' && insight.suggestion && (
                        <p className="text-xs text-teal-700">→ {insight.suggestion}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Engagement Nudges */}
          {safeArray(insights.engagement_nudges).length > 0 && (
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Gentle Reminders</h4>
                <ul className="space-y-2">
                  {safeArray(insights.engagement_nudges).map((nudge, i) => {
                    const text = safeText(nudge);
                    return text ? (
                      <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                        <span className="mt-0.5">💭</span>
                        <span>{text}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          <Button onClick={generateInsights} variant="outline" className="w-full">
            Refresh Insights
          </Button>
        </>
      )}
    </div>
  );
}