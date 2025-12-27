import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, Sparkles } from 'lucide-react';

export default function ProactiveCheckIn({ onSendMessage }) {
  const { data: goals } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }),
    initialData: []
  });

  const { data: recentMoods } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 7),
    initialData: []
  });

  const hasLowMoodTrend = recentMoods.length >= 3 && 
    recentMoods.slice(0, 3).every(m => ['low', 'very_low'].includes(m.mood));

  const hasPositiveTrend = recentMoods.length >= 3 &&
    recentMoods.slice(0, 3).every(m => ['good', 'excellent'].includes(m.mood));

  const hasActiveGoals = goals.length > 0;

  if (!hasLowMoodTrend && !hasPositiveTrend && !hasActiveGoals) return null;

  const suggestions = [];

  if (hasLowMoodTrend) {
    suggestions.push({
      icon: TrendingDown,
      color: 'text-orange-600 bg-orange-100',
      message: "I noticed your mood has been lower lately. Would you like to talk about what's been going on?",
      prompt: "I've been feeling down lately and would like to talk about it"
    });
  }

  if (hasPositiveTrend) {
    suggestions.push({
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
      message: "Your mood has been great this week! What's been helping?",
      prompt: "I'd like to reflect on what's been going well lately"
    });
  }

  if (hasActiveGoals) {
    suggestions.push({
      icon: Target,
      color: 'text-blue-600 bg-blue-100',
      message: `You have ${goals.length} active goal${goals.length > 1 ? 's' : ''}. Want to check in on your progress?`,
      prompt: "Let's review my goals and progress"
    });
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <Card key={index} className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${suggestion.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">{suggestion.message}</p>
                  <Button
                    onClick={() => onSendMessage(suggestion.prompt)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Let's discuss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}