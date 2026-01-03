import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Brain, Heart, Loader2, BarChart3, Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiTrendsSummary({ onClose }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('30');

  const { data: entries } = useQuery({
    queryKey: ['thoughtJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 100),
    initialData: []
  });

  const { data: moodEntries } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 50),
    initialData: []
  });

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';
      
      const daysAgo = parseInt(timeframe);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

      const recentEntries = entries
        .filter(e => new Date(e.created_date) >= cutoffDate)
        .map(e => ({
          date: e.created_date,
          situation: stripHtml(e.situation)?.substring(0, 200),
          emotions: e.emotions?.join(', '),
          intensity: e.emotion_intensity,
          distortions: e.cognitive_distortions?.join(', '),
          tags: e.tags?.join(', '),
          outcome_intensity: e.outcome_emotion_intensity
        }));

      const recentMoods = moodEntries
        .filter(m => new Date(m.date) >= cutoffDate)
        .map(m => ({
          date: m.date,
          mood: m.mood,
          emotions: m.emotions?.join(', '),
          triggers: m.triggers?.join(', ')
        }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze journal entries and mood data from the past ${daysAgo} days to identify themes, patterns, and emotional trends.

**JOURNAL ENTRIES (${recentEntries.length} entries):**
${JSON.stringify(recentEntries, null, 2)}

**MOOD DATA (${recentMoods.length} entries):**
${JSON.stringify(recentMoods, null, 2)}

Provide a comprehensive analysis:

1. **Key Themes** (3-5): Recurring topics, situations, or concerns that appear frequently.

2. **Emotional Patterns**:
   - Most common emotions experienced
   - Emotional intensity trends (improving, stable, worsening)
   - Triggers that consistently affect mood

3. **Cognitive Patterns**:
   - Most frequent cognitive distortions
   - Progress in challenging unhelpful thoughts (if evident)
   - Areas where thinking patterns are improving or need attention

4. **Notable Insights**: Any significant observations about the user's mental health journey, growth areas, or patterns worth celebrating.

5. **Recommendations**: 3-4 actionable suggestions based on the patterns identified.`,
        response_json_schema: {
          type: "object",
          properties: {
            key_themes: {
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
            emotional_patterns: {
              type: "object",
              properties: {
                common_emotions: {
                  type: "array",
                  items: { type: "string" }
                },
                intensity_trend: { type: "string" },
                trend_direction: { type: "string" },
                common_triggers: {
                  type: "array",
                  items: { type: "string" }
                },
                analysis: { type: "string" }
              }
            },
            cognitive_patterns: {
              type: "object",
              properties: {
                frequent_distortions: {
                  type: "array",
                  items: { type: "string" }
                },
                progress_assessment: { type: "string" },
                areas_for_growth: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            notable_insights: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      setSummary(response);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl my-8"
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Journal Trends & Insights</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {!summary && !isLoading && (
                <div className="text-center py-8">
                  <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Analyze Your Journal Patterns
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    AI will analyze your entries to identify themes, emotional trends, and provide personalized insights.
                  </p>

                  <div className="flex gap-2 justify-center mb-6">
                    {['7', '30', '90'].map((days) => (
                      <Button
                        key={days}
                        onClick={() => setTimeframe(days)}
                        variant={timeframe === days ? 'default' : 'outline'}
                        className={timeframe === days ? 'bg-purple-600' : ''}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Last {days} days
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={generateSummary}
                    className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Insights
                  </Button>

                  <p className="text-sm text-gray-500 mt-4">
                    {entries.filter(e => {
                      const cutoff = new Date();
                      cutoff.setDate(cutoff.getDate() - parseInt(timeframe));
                      return new Date(e.created_date) >= cutoff;
                    }).length} journal entries in selected timeframe
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing your patterns and generating insights...</p>
                </div>
              )}

              {summary && (
                <div className="space-y-4">
                  {/* Summary */}
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Overview</h4>
                      <p className="text-sm text-gray-700">{summary.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Key Themes */}
                  {summary.key_themes?.length > 0 && (
                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          Key Themes
                        </h4>
                        <div className="space-y-3">
                          {summary.key_themes.map((theme, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg border border-blue-200">
                              <div className="flex items-start justify-between mb-1">
                                <p className="font-medium text-sm text-gray-800">{theme.theme}</p>
                                <Badge variant="secondary" className="text-xs">{theme.frequency}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{theme.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Emotional Patterns */}
                  {summary.emotional_patterns && (
                    <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-pink-600" />
                          Emotional Patterns
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Most Common Emotions:</p>
                            <div className="flex flex-wrap gap-2">
                              {summary.emotional_patterns.common_emotions?.map((emotion, i) => (
                                <Badge key={i} variant="secondary" className="bg-pink-100 text-pink-800">
                                  {emotion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {summary.emotional_patterns.trend_direction === 'improving' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-orange-600" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {summary.emotional_patterns.intensity_trend}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                            {summary.emotional_patterns.analysis}
                          </p>
                          {summary.emotional_patterns.common_triggers?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Common Triggers:</p>
                              <div className="flex flex-wrap gap-2">
                                {summary.emotional_patterns.common_triggers.map((trigger, i) => (
                                  <Badge key={i} variant="outline">{trigger}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Cognitive Patterns */}
                  {summary.cognitive_patterns && (
                    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-amber-600" />
                          Cognitive Patterns
                        </h4>
                        <div className="space-y-3">
                          {summary.cognitive_patterns.frequent_distortions?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Frequent Distortions:</p>
                              <div className="flex flex-wrap gap-2">
                                {summary.cognitive_patterns.frequent_distortions.map((dist, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{dist}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                            {summary.cognitive_patterns.progress_assessment}
                          </p>
                          {summary.cognitive_patterns.areas_for_growth?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-2">Areas for Growth:</p>
                              <ul className="space-y-1">
                                {summary.cognitive_patterns.areas_for_growth.map((area, i) => (
                                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-amber-600">•</span>
                                    {area}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Notable Insights */}
                  {summary.notable_insights?.length > 0 && (
                    <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-600" />
                          Notable Insights
                        </h4>
                        <ul className="space-y-2">
                          {summary.notable_insights.map((insight, i) => (
                            <li key={i} className="text-sm text-gray-700 bg-white p-3 rounded border flex items-start gap-2">
                              <span className="text-teal-600 font-bold">{i + 1}.</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recommendations */}
                  {summary.recommendations?.length > 0 && (
                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          Personalized Recommendations
                        </h4>
                        <div className="space-y-3">
                          {summary.recommendations.map((rec, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg border border-green-200">
                              <p className="font-medium text-sm text-gray-800 mb-1">{rec.title}</p>
                              <p className="text-sm text-gray-600">{rec.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button onClick={() => setSummary(null)} variant="outline" className="w-full">
                    Generate New Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}