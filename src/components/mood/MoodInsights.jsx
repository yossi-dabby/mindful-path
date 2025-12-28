import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';

export default function MoodInsights({ entries }) {
  const [insights, setInsights] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInsights = async () => {
    setIsGenerating(true);
    
    try {
      const recentEntries = entries.slice(0, 30);
      const summaryData = recentEntries.map(e => ({
        date: e.date,
        mood: e.mood,
        emotions: e.emotions,
        triggers: e.triggers,
        activities: e.activities,
        stress: e.stress_level,
        energy: e.energy_level,
        notes: e.notes
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this user's mood tracking data over the last 30 days and provide comprehensive insights:

${JSON.stringify(summaryData, null, 2)}

Provide a detailed analysis including:
1. Overall mood patterns and trends
2. Key triggers that negatively impact mood
3. Activities and habits that boost mood
4. Emotional patterns and their meanings
5. Personalized recommendations for improvement
6. Warning signs or concerning patterns (if any)
7. Positive changes and progress observed

Be empathetic, insightful, and actionable. Format your response in a clear, structured way.`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'Overall summary of mood patterns' },
            trends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
                  title: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            key_triggers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  trigger: { type: 'string' },
                  impact: { type: 'string' },
                  suggestion: { type: 'string' }
                }
              }
            },
            mood_boosters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  activity: { type: 'string' },
                  benefit: { type: 'string' }
                }
              }
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  action: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            },
            concerns: {
              type: 'array',
              items: { type: 'string' }
            },
            positive_progress: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setInsights(result);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (entries.length < 5) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Not Enough Data Yet</h3>
          <p className="text-gray-500">
            Track your mood for at least 5 days to get AI-powered insights about your emotional patterns
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      {!insights && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Get AI-Powered Insights
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Let AI analyze your mood patterns and provide personalized recommendations based on your {entries.length} mood entries
            </p>
            <Button
              onClick={generateInsights}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Insights Display */}
      {insights && (
        <>
          {/* Summary */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Overall Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
              <Button
                onClick={generateInsights}
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={isGenerating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </CardContent>
          </Card>

          {/* Trends */}
          {insights.trends?.length > 0 && (
            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Identified Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {insights.trends.map((trend, index) => (
                  <div key={index} className="p-4 rounded-xl border-l-4" style={{
                    borderColor: trend.type === 'positive' ? '#10b981' : trend.type === 'negative' ? '#ef4444' : '#6b7280',
                    backgroundColor: trend.type === 'positive' ? '#f0fdf4' : trend.type === 'negative' ? '#fef2f2' : '#f9fafb'
                  }}>
                    <div className="flex items-start gap-3">
                      <Badge variant={trend.type === 'positive' ? 'default' : 'secondary'} className="mt-1">
                        {trend.type}
                      </Badge>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{trend.title}</h4>
                        <p className="text-sm text-gray-600">{trend.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Key Triggers */}
          {insights.key_triggers?.length > 0 && (
            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Key Mood Triggers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {insights.key_triggers.map((item, index) => (
                  <div key={index} className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2">{item.trigger}</h4>
                    <p className="text-sm text-gray-700 mb-2">{item.impact}</p>
                    <div className="flex items-start gap-2 mt-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 italic">{item.suggestion}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Mood Boosters */}
          {insights.mood_boosters?.length > 0 && (
            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Your Mood Boosters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.mood_boosters.map((item, index) => (
                    <div key={index} className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">{item.activity}</h4>
                      <p className="text-sm text-gray-700">{item.benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {insights.recommendations?.length > 0 && (
            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {insights.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Badge className="mb-2">{rec.category}</Badge>
                    <h4 className="font-semibold text-blue-900 mb-2">{rec.action}</h4>
                    <p className="text-sm text-gray-700">{rec.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Positive Progress */}
          {insights.positive_progress?.length > 0 && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  Positive Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-2">
                  {insights.positive_progress.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Concerns */}
          {insights.concerns?.length > 0 && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Areas of Concern
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-2 mb-4">
                  {insights.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-red-600 mt-1">⚠</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-600 italic border-t pt-4">
                  Consider reaching out to a mental health professional if these patterns persist or worsen.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}