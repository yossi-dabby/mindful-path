import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Sparkles, BookOpen, Dumbbell, Bell, X, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function ProactiveCheckIn({ onSendMessage }) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: goals = [] } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' })
  });

  const { data: recentMoods = [] } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 7)
  });

  const { data: recentJournals = [] } = useQuery({
    queryKey: ['recentJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 5)
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list()
  });

  const { data: aiReminders = [] } = useQuery({
    queryKey: ['proactiveReminders'],
    queryFn: async () => {
      const reminders = await base44.entities.ProactiveReminder.filter({ status: 'pending' });
      return Array.isArray(reminders) ? reminders.filter(r => r.scheduled_date <= today) : [];
    }
  });

  const dismissReminderMutation = useMutation({
    mutationFn: (reminderId) => base44.entities.ProactiveReminder.update(reminderId, { status: 'dismissed' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['proactiveReminders']);
    }
  });

  const completeReminderMutation = useMutation({
    mutationFn: (reminderId) => base44.entities.ProactiveReminder.update(reminderId, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['proactiveReminders']);
    }
  });

  const hasLowMoodTrend = recentMoods.length >= 3 && 
    recentMoods.slice(0, 3).every(m => ['low', 'very_low'].includes(m.mood));

  const hasPositiveTrend = recentMoods.length >= 3 &&
    recentMoods.slice(0, 3).every(m => ['good', 'excellent'].includes(m.mood));

  const hasActiveGoals = goals.length > 0;
  
  const recentJournalPatterns = recentJournals.length >= 2 && recentJournals
    .slice(0, 2)
    .flatMap(j => j.cognitive_distortions || [])
    .reduce((acc, d) => {
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
  
  const commonDistortion = recentJournalPatterns && Object.keys(recentJournalPatterns).length > 0
    ? Object.entries(recentJournalPatterns).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  const practiceOpportunities = exercises
    .filter(ex => (ex.completed_count || 0) > 0 && (ex.last_completed))
    .sort((a, b) => new Date(b.last_completed) - new Date(a.last_completed))
    .slice(0, 1)[0];

  const suggestions = [];

  // AI-Generated Reminders (highest priority)
  aiReminders.forEach(reminder => {
    const icon = {
      'goal_follow_up': Target,
      'mood_trend': TrendingDown,
      'exercise_follow_up': Dumbbell,
      'journal_insight': BookOpen,
      'general': Bell
    }[reminder.reminder_type] || Bell;

    const color = {
      'goal_follow_up': 'text-blue-600 bg-blue-100',
      'mood_trend': 'text-orange-600 bg-orange-100',
      'exercise_follow_up': 'text-purple-600 bg-purple-100',
      'journal_insight': 'text-green-600 bg-green-100',
      'general': 'text-gray-600 bg-gray-100'
    }[reminder.reminder_type] || 'text-gray-600 bg-gray-100';

    suggestions.push({
      id: reminder.id,
      icon,
      color,
      title: reminder.title,
      message: reminder.message,
      prompt: reminder.suggested_action || reminder.message,
      type: 'ai_reminder',
      reminder
    });
  });

  // Mood-based suggestions
  if (hasLowMoodTrend) {
    suggestions.push({
      icon: TrendingDown,
      color: 'text-orange-600 bg-orange-100',
      title: 'Mood Check-in',
      message: "I noticed your mood has been lower lately. Would you like to talk about what's been going on?",
      prompt: "I've been feeling down lately and would like to talk about it",
      type: 'mood_trend'
    });
  }

  if (hasPositiveTrend) {
    suggestions.push({
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
      title: 'Positive Progress',
      message: "Your mood has been great this week! What's been helping?",
      prompt: "I'd like to reflect on what's been going well lately",
      type: 'positive_trend'
    });
  }

  // Goal-based suggestions
  if (hasActiveGoals) {
    const oldestGoal = goals.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))[0];
    const daysSinceCreated = Math.floor((new Date() - new Date(oldestGoal.created_date)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated >= 7) {
      suggestions.push({
        icon: Target,
        color: 'text-blue-600 bg-blue-100',
        title: 'Goal Progress Review',
        message: `You've been working on "${oldestGoal.title}" for ${daysSinceCreated} days. Let's check in on your progress!`,
        prompt: `I want to discuss my progress on my goal: ${oldestGoal.title}`,
        type: 'goal_review',
        reference: oldestGoal
      });
    }
  }

  // Journal insight patterns
  if (commonDistortion) {
    suggestions.push({
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-100',
      title: 'Thinking Pattern Insight',
      message: `I noticed "${commonDistortion}" appearing in your recent journal entries. Want to explore strategies to challenge this pattern?`,
      prompt: `I'd like to work on my tendency toward ${commonDistortion}`,
      type: 'journal_insight'
    });
  }

  // Exercise follow-up
  if (practiceOpportunities) {
    const daysSinceLastPractice = Math.floor((new Date() - new Date(practiceOpportunities.last_completed)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastPractice >= 3 && daysSinceLastPractice <= 7) {
      suggestions.push({
        icon: Dumbbell,
        color: 'text-indigo-600 bg-indigo-100',
        title: 'Practice Follow-up',
        message: `You tried "${practiceOpportunities.title}" ${daysSinceLastPractice} days ago. How has that been going?`,
        prompt: `I want to discuss how the ${practiceOpportunities.title} exercise has been working for me`,
        type: 'exercise_followup',
        reference: practiceOpportunities
      });
    }
  }

  if (suggestions.length === 0) return null;

  const handleDismiss = (suggestion, e) => {
    e.stopPropagation();
    if (suggestion.type === 'ai_reminder') {
      dismissReminderMutation.mutate(suggestion.id);
    }
  };

  const handleClick = (suggestion) => {
    if (suggestion.type === 'ai_reminder') {
      completeReminderMutation.mutate(suggestion.id);
    }
    onSendMessage(suggestion.prompt);
  };

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-700">Personalized Check-ins</h3>
      </div>
      
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <Card 
            key={index} 
            className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 hover:border-purple-300 transition-all cursor-pointer"
            onClick={() => handleClick(suggestion)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${suggestion.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-800 text-sm">{suggestion.title}</h4>
                      {suggestion.type === 'ai_reminder' && (
                        <Badge variant="secondary" className="text-xs">
                          AI Suggested
                        </Badge>
                      )}
                    </div>
                    {suggestion.type === 'ai_reminder' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mt-1 -mr-1"
                        onClick={(e) => handleDismiss(suggestion, e)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{suggestion.message}</p>
                  {suggestion.reminder?.context?.insight && (
                    <p className="text-xs text-gray-600 italic mb-2 bg-white/50 p-2 rounded">
                      💡 {suggestion.reminder.context.insight}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                    <span>Discuss this</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}