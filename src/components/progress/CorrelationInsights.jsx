import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Activity, TrendingUp, Lightbulb, Target } from 'lucide-react';

export default function CorrelationInsights({ moodEntries, journalEntries, exercises }) {
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCorrelations = async () => {
    setIsAnalyzing(true);
    try {
      const moodData = moodEntries.slice(0, 30).map(m => ({
        date: m.date,
        mood: m.mood,
        emotions: m.emotions,
        intensity: m.intensity
      }));

      const journalData = journalEntries.slice(0, 20).map(j => ({
        date: new Date(j.created_date).toISOString().split('T')[0],
        emotion_intensity_before: j.emotion_intensity,
        emotion_intensity_after: j.outcome_emotion_intensity,
        cognitive_distortions: j.cognitive_distortions,
        tags: j.tags
      }));

      const exerciseData = exercises.filter(e => e.completed_count > 0).map(e => ({
        title: e.title,
        category: e.category,
        completed_count: e.completed_count,
        last_completed: e.last_completed
      }));

      const prompt = `Analyze the correlations between mood, journal entries, and exercises to provide actionable insights.

**Mood Data (Last 30 Days):**
${JSON.stringify(moodData, null, 2)}

**Journal Entries (Last 20):**
${JSON.stringify(journalData, null, 2)}

**Exercise Activity:**
${JSON.stringify(exerciseData, null, 2)}

Provide insights on:
1. **Mood-Exercise Correlation**: Do certain exercises correlate with better moods?
2. **Journal-Mood Correlation**: Do journaling days show mood improvements?
3. **Peak Performance Days**: What patterns appear on the user's best days?
4. **Warning Signs**: What patterns appear before mood dips?
5. **Recommendations**: Specific actionable steps based on the correlations`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            mood_exercise_correlation: {
              type: "object",
              properties: {
                strength: { type: "string", enum: ["strong", "moderate", "weak", "none"] },
                finding: { type: "string" },
                best_exercises: { type: "array", items: { type: "string" } }
              }
            },
            journal_mood_correlation: {
              type: "object",
              properties: {
                strength: { type: "string", enum: ["strong", "moderate", "weak", "none"] },
                finding: { type: "string" },
                average_improvement: { type: "string" }
              }
            },
            peak_patterns: {
              type: "array",
              items: { type: "string" }
            },
            warning_signs: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error('Failed to analyze correlations:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!insights && !isAnalyzing) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Discover Your Patterns</h3>
          <p className="text-gray-600 mb-4 max-w-lg mx-auto">
            AI will analyze correlations between your mood, journal entries, and exercises to reveal what works best for you.
          </p>
          <Button onClick={analyzeCorrelations} className="bg-indigo-600 hover:bg-indigo-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze Correlations
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isAnalyzing) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Analyzing Your Data...</h3>
          <p className="text-sm text-gray-600">Finding patterns and correlations</p>
        </CardContent>
      </Card>
    );
  }

  const strengthColors = {
    strong: 'bg-green-100 text-green-800 border-green-300',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    weak: 'bg-orange-100 text-orange-800 border-orange-300',
    none: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Correlation Analysis
          </CardTitle>
          <Button onClick={analyzeCorrelations} variant="outline" size="sm" disabled={isAnalyzing}>
            <TrendingUp className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exercise-Mood Correlation */}
        <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-semibold text-gray-800">Exercise → Mood Impact</h4>
            <Badge className={strengthColors[insights.mood_exercise_correlation.strength]}>
              {insights.mood_exercise_correlation.strength}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 mb-3">{insights.mood_exercise_correlation.finding}</p>
          {insights.mood_exercise_correlation.best_exercises?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Most Effective Exercises:</p>
              <div className="flex flex-wrap gap-2">
                {insights.mood_exercise_correlation.best_exercises.map((ex, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700">
                    {ex}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Journal-Mood Correlation */}
        <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-white to-purple-50">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-semibold text-gray-800">Journaling → Mood Impact</h4>
            <Badge className={strengthColors[insights.journal_mood_correlation.strength]}>
              {insights.journal_mood_correlation.strength}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 mb-2">{insights.journal_mood_correlation.finding}</p>
          <p className="text-xs text-purple-700 font-medium">
            Average Improvement: {insights.journal_mood_correlation.average_improvement}
          </p>
        </div>

        {/* Peak Patterns */}
        {insights.peak_patterns?.length > 0 && (
          <div className="p-4 rounded-xl border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Your Success Patterns
            </h4>
            <ul className="space-y-2">
              {insights.peak_patterns.map((pattern, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warning Signs */}
        {insights.warning_signs?.length > 0 && (
          <div className="p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-orange-600" />
              Early Warning Signs
            </h4>
            <ul className="space-y-2">
              {insights.warning_signs.map((sign, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">!</span>
                  {sign}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations?.length > 0 && (
          <div className="p-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              Personalized Recommendations
            </h4>
            <div className="space-y-3">
              {insights.recommendations.map((rec, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-800 text-sm">{rec.action}</p>
                    <Badge className={priorityColors[rec.priority]} size="sm">
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}