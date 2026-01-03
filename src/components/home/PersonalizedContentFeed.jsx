import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, BookOpen, Dumbbell, MessageSquare, TrendingUp, ExternalLink, Quote, Users, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';

export default function PersonalizedContentFeed() {
  const [feed, setFeed] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }),
    initialData: []
  });

  const { data: moodEntries } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 10),
    initialData: []
  });

  const { data: journalEntries } = useQuery({
    queryKey: ['thoughtJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 10),
    initialData: []
  });

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: []
  });

  const { data: resources } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list(),
    initialData: []
  });

  const { data: communityPosts } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 20),
    initialData: []
  });

  useEffect(() => {
    generateFeed();
  }, [goals, moodEntries, journalEntries]);

  const generateFeed = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';

      // Prepare context
      const goalsContext = goals.map(g => ({
        title: g.title,
        category: g.category,
        description: g.description
      }));

      const moodContext = moodEntries.map(m => ({
        mood: m.mood,
        emotions: Array.isArray(m.emotions) ? m.emotions.join(', ') : '',
        triggers: Array.isArray(m.triggers) ? m.triggers.join(', ') : '',
        activities: Array.isArray(m.activities) ? m.activities.join(', ') : ''
      }));

      const journalContext = journalEntries.map(e => ({
        emotions: Array.isArray(e.emotions) ? e.emotions.join(', ') : '',
        distortions: Array.isArray(e.cognitive_distortions) ? e.cognitive_distortions.join(', ') : '',
        tags: Array.isArray(e.tags) ? e.tags.join(', ') : ''
      }));

      const exerciseCategories = [...new Set(exercises.map(e => e.category))];
      const resourceCategories = [...new Set(resources.map(r => r.category))];

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a mental wellness curator creating a personalized content feed for a user.

**USER CONTEXT:**
- Active Goals: ${JSON.stringify(goalsContext, null, 2)}
- Recent Moods (last 10): ${JSON.stringify(moodContext, null, 2)}
- Recent Journal Patterns: ${JSON.stringify(journalContext, null, 2)}

**AVAILABLE CONTENT:**
- Exercise Categories: ${exerciseCategories.join(', ')}
- Resource Categories: ${resourceCategories.join(', ')}

Based on the user's current state, goals, mood patterns, and journal themes, curate a personalized content feed with:

1. **Recommended Exercises** (2-3): Suggest specific exercise categories with personalized reasons why they'd help right now
2. **Relevant Articles/Resources** (2-3): Suggest resource categories (anxiety, depression, stress, mindfulness, relationships, self-esteem, sleep) with topics that would be most helpful
3. **Inspirational Quote**: One motivational, therapy-aligned quote relevant to their current journey
4. **Community Highlights**: Suggest what community topics they might find valuable (e.g., "success stories", "anxiety management tips", "goal setting support")
5. **Daily Focus**: A short, actionable suggestion for today (1-2 sentences)

Make it personal, warm, and encouraging. Reference their specific patterns when possible.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  title: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            relevant_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  topic: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            inspirational_quote: {
              type: "object",
              properties: {
                text: { type: "string" },
                author: { type: "string" }
              }
            },
            community_highlights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            daily_focus: { type: "string" }
          }
        }
      });

      if (!response || !response.daily_focus) {
        throw new Error('Invalid response from AI - missing required fields');
      }
      setFeed(response);
    } catch (error) {
      console.error('Failed to generate feed:', error.message, error.stack);
      setError(error.message || 'Failed to generate personalized feed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Curating your personalized content...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg border-2 border-red-200">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Unable to Generate Feed</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button
            onClick={generateFeed}
            variant="outline"
            size="sm"
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!feed) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">No Personalized Feed Yet</h3>
          <p className="text-sm text-gray-600 mb-4">
            Complete more journal entries and mood check-ins to get personalized recommendations
          </p>
          <Button
            onClick={generateFeed}
            variant="outline"
            size="sm"
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Feed
          </Button>
        </CardContent>
      </Card>
    );
  }

  const recommendedExercisesList = exercises.filter(ex => 
    feed.recommended_exercises?.some(rec => rec.category === ex.category)
  ).slice(0, 3);

  const recommendedResourcesList = resources.filter(res =>
    feed.relevant_resources?.some(rec => rec.category === res.category)
  ).slice(0, 3);

  const highlightedPosts = communityPosts
    .filter(post => post.upvotes > 0)
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-end mb-2">
        <Button
          onClick={generateFeed}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-purple-600"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Daily Focus */}
      {feed.daily_focus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Today's Focus</h3>
                  <p className="text-sm text-gray-700">{feed.daily_focus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Inspirational Quote */}
      {feed.inspirational_quote && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <Quote className="w-6 h-6 text-blue-400 mb-2" />
              <p className="text-gray-700 italic mb-2">"{feed.inspirational_quote.text}"</p>
              <p className="text-sm text-gray-500">— {feed.inspirational_quote.author}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommended Exercises */}
      {feed.recommended_exercises?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-green-600" />
                Recommended for You
              </h3>
              <div className="space-y-3">
                {feed.recommended_exercises.map((rec, i) => {
                  const exercise = recommendedExercisesList.find(ex => ex.category === rec.category);
                  return (
                    <div key={i} className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-medium text-sm text-gray-800">{rec.title}</p>
                          <Badge variant="outline" className="text-xs mt-1 capitalize">
                            {rec.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{rec.reason}</p>
                      {exercise && (
                        <Link to={createPageUrl('Exercises')}>
                          <Button variant="ghost" size="sm" className="mt-2 text-green-700 hover:text-green-800 p-0 h-auto">
                            Try this exercise →
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
              <Link to={createPageUrl('Exercises')}>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Browse All Exercises
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Relevant Resources */}
      {feed.relevant_resources?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Articles & Resources
              </h3>
              <div className="space-y-3">
                {feed.relevant_resources.map((rec, i) => {
                  const resource = recommendedResourcesList.find(res => res.category === rec.category);
                  return (
                    <div key={i} className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-medium text-sm text-gray-800">{rec.topic}</p>
                          <Badge variant="outline" className="text-xs mt-1 capitalize">
                            {rec.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{rec.reason}</p>
                      {resource && (
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="mt-2 text-indigo-700 hover:text-indigo-800 p-0 h-auto">
                            Read article <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
              <Link to={createPageUrl('Resources')}>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Explore Resources
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Community Highlights */}
      {feed.community_highlights?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Community Highlights
              </h3>
              <div className="space-y-3">
                {feed.community_highlights.map((highlight, i) => (
                  <div key={i} className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                    <p className="font-medium text-sm text-gray-800 mb-1">{highlight.topic}</p>
                    <p className="text-xs text-gray-600">{highlight.description}</p>
                  </div>
                ))}
              </div>
              {highlightedPosts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Popular Posts:</p>
                  <div className="space-y-2">
                    {highlightedPosts.map((post) => (
                      <Link key={post.id} to={createPageUrl('Community')}>
                        <div className="bg-white p-2 rounded border hover:border-teal-300 transition-colors">
                          <p className="text-xs text-gray-700 line-clamp-2">{post.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                            <span className="text-xs text-gray-500">↑ {post.upvotes}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <Link to={createPageUrl('Community')}>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Join Community
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}