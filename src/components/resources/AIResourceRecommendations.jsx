import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';

export default function AIResourceRecommendations({ moodEntries, journalEntries, resources, onSaveResource, savedResourceIds, userInterests = [] }) {
  const [recommendations, setRecommendations] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const recentMoods = moodEntries.slice(0, 7).map(m => ({
        date: m.date,
        mood: m.mood,
        emotions: m.emotions,
        triggers: m.triggers
      }));

      const recentJournals = journalEntries.slice(0, 5).map(j => ({
        situation: j.situation,
        emotions: j.emotions,
        cognitive_distortions: j.cognitive_distortions,
        tags: j.tags
      }));

      const availableResources = resources.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        type: r.type,
        tags: r.tags
      }));

      const prompt = `Based on this user's mental health data and interests, recommend 3-5 resources from the available library that would be most helpful.

**User Interests:**
${userInterests.length > 0 ? userInterests.join(', ') : 'Not specified'}

**Recent Mood Patterns:**
${JSON.stringify(recentMoods, null, 2)}

**Recent Journal Themes:**
${JSON.stringify(recentJournals, null, 2)}

**Available Resources:**
${JSON.stringify(availableResources, null, 2)}

Select resources that:
1. Align with their stated interests and preferences
2. Match their current emotional challenges and mood patterns
3. Address recurring themes from their journal entries
4. Provide practical, actionable guidance
5. Vary in type (mix of articles, videos, podcasts, meditations, etc.)
6. Consider estimated time - recommend both quick and longer resources

Prioritize resources that directly relate to their current mental health journey based on recent moods and journal patterns. For each recommendation, explain WHY it's relevant to their specific situation.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  resource_id: { type: "string" },
                  relevance_reason: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            },
            overall_insight: { type: "string" }
          }
        }
      });

      setRecommendations(response);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!recommendations && !isGenerating) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 mb-8">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Get Personalized Recommendations</h3>
          <p className="text-gray-600 mb-4 max-w-lg mx-auto">
            AI will analyze your mood trends and journal entries to recommend resources tailored to your mental health journey.
          </p>
          <Button
            onClick={generateRecommendations}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card className="border-0 shadow-lg mb-8">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Analyzing Your Journey...</h3>
          <p className="text-sm text-gray-600">Finding the most relevant resources for you</p>
        </CardContent>
      </Card>
    );
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-green-100 text-green-700 border-green-300'
  };

  const recommendedResources = recommendations.recommendations
    .map(rec => ({
      ...rec,
      resource: resources.find(r => r.id === rec.resource_id)
    }))
    .filter(rec => rec.resource);

  return (
    <Card className="border-0 shadow-lg mb-8 bg-gradient-to-br from-white to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI-Recommended For You
          </CardTitle>
          <Button
            onClick={generateRecommendations}
            variant="outline"
            size="sm"
            disabled={isGenerating}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.overall_insight && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">{recommendations.overall_insight}</p>
          </div>
        )}

        <div className="space-y-3">
          {recommendedResources.map((rec, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border-2 ${priorityColors[rec.priority]} bg-white/70`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{rec.resource.title}</h4>
                    <Badge className="text-xs capitalize">{rec.resource.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.resource.description}</p>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 mb-3">
                    <p className="text-xs text-purple-800">
                      <span className="font-semibold">Why this helps:</span> {rec.relevance_reason}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={rec.resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Resource
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSaveResource(rec.resource)}
                    >
                      {savedResourceIds.includes(rec.resource.id) ? (
                        <BookmarkCheck className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}