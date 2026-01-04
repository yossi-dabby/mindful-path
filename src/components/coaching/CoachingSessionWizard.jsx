import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ChevronRight, ChevronLeft, Sparkles, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const focusAreas = [
  { value: 'mood_improvement', label: 'Improve Mood', icon: '😊', description: 'Work on feeling better daily' },
  { value: 'stress_management', label: 'Manage Stress', icon: '🧘', description: 'Reduce and cope with stress' },
  { value: 'goal_achievement', label: 'Achieve Goals', icon: '🎯', description: 'Reach specific objectives' },
  { value: 'behavior_change', label: 'Change Habits', icon: '🔄', description: 'Build new positive habits' },
  { value: 'relationship', label: 'Relationships', icon: '💝', description: 'Improve connections' },
  { value: 'self_esteem', label: 'Self-Esteem', icon: '✨', description: 'Build confidence' },
  { value: 'general', label: 'General Support', icon: '🌟', description: 'Overall wellness' }
];

export default function CoachingSessionWizard({ onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    focus_area: '',
    current_challenge: '',
    desired_outcome: '',
    related_goals: [],
    stage: 'discovery'
  });

  const { data: recentMoods } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 7),
    initialData: []
  });

  const { data: goals } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }),
    initialData: []
  });

  const { data: recentJournals } = useQuery({
    queryKey: ['recentJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 5),
    initialData: []
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data) => {
      // Validate data
      if (!data.title || !data.focus_area || !data.current_challenge || !data.desired_outcome) {
        throw new Error('Missing required fields');
      }

      // Create session with proper field mapping
      const sessionData = {
        title: data.title,
        focus_area: data.focus_area,
        current_challenge: data.current_challenge,
        desired_outcome: data.desired_outcome,
        related_goals: data.related_goals || [],
        status: 'active',
        current_stage: 'understanding',
        action_plan: []
      };

      const session = await base44.entities.CoachingSession.create(sessionData);
      
      if (!session || !session.id) {
        throw new Error('Failed to create coaching session');
      }

      // Create AI conversation
      try {
        const conversation = await base44.agents.createConversation({
          agent_name: 'ai_coach',
          metadata: {
            name: `Coaching: ${data.title}`,
            type: 'coaching_session',
            session_id: session.id
          }
        });

        if (conversation && conversation.id) {
          // Update session with conversation ID
          await base44.entities.CoachingSession.update(session.id, {
            agent_conversation_id: conversation.id
          });

          // Send initial coaching message
          await base44.agents.addMessage(conversation, {
            role: 'user',
            content: `I'd like to start a coaching session. My focus is ${data.focus_area.replace(/_/g, ' ')}. 
            
Current Challenge: ${data.current_challenge}

Desired Outcome: ${data.desired_outcome}

Please help me create a structured plan to work through this.`
          });
        }
      } catch (convError) {
        console.error('Conversation creation failed, but session was created:', convError);
        // Continue anyway - session is created
      }

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coachingSessions']);
      onClose();
    },
    onError: (error) => {
      console.error('Session creation error:', error);
    }
  });

  const moodInsight = recentMoods.length >= 3 && 
    recentMoods.slice(0, 3).every(m => ['low', 'very_low'].includes(m.mood))
    ? 'Your recent mood has been low - a coaching session could help address this.'
    : null;

  const toggleGoal = (goalId) => {
    const updated = formData.related_goals.includes(goalId)
      ? formData.related_goals.filter(id => id !== goalId)
      : [...formData.related_goals, goalId];
    setFormData({ ...formData, related_goals: updated });
  };

  const canProceed = () => {
    if (step === 1) return formData.focus_area;
    if (step === 2) return formData.current_challenge && formData.desired_outcome;
    if (step === 3) return formData.title;
    return false;
  };

  const handleSubmit = () => {
    // Prevent double submission
    if (createSessionMutation.isPending) return;

    // Final validation
    if (!formData.title?.trim() || !formData.focus_area || !formData.current_challenge?.trim() || !formData.desired_outcome?.trim()) {
      return;
    }

    createSessionMutation.mutate({
      ...formData,
      title: formData.title.trim(),
      current_challenge: formData.current_challenge.trim(),
      desired_outcome: formData.desired_outcome.trim()
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header - Sticky on mobile */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Start New Session</h1>
                <p className="text-sm text-gray-500">Step {step} of 3</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 md:p-6 pb-32">
          {/* Step 1: Focus Area */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What would you like to work on?</h3>
                <p className="text-sm text-gray-600 mb-4">Choose the area you want to focus on</p>
              </div>

              {moodInsight && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-orange-800">{moodInsight}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {focusAreas.map((area) => (
                  <button
                    key={area.value}
                    onClick={() => setFormData({ ...formData, focus_area: area.value })}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg',
                      formData.focus_area === area.value
                        ? 'border-purple-400 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{area.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{area.label}</h4>
                        <p className="text-xs text-gray-600 mt-1">{area.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Challenge & Outcome */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tell me more</h3>
                <p className="text-sm text-gray-600 mb-4">Help me understand what you're facing</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What's the specific challenge you're facing?
                </label>
                <Textarea
                  value={formData.current_challenge}
                  onChange={(e) => setFormData({ ...formData, current_challenge: e.target.value })}
                  placeholder="Describe the situation, problem, or difficulty you're experiencing..."
                  className="h-32 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What would you like to achieve or how would you like things to be different?
                </label>
                <Textarea
                  value={formData.desired_outcome}
                  onChange={(e) => setFormData({ ...formData, desired_outcome: e.target.value })}
                  placeholder="Describe your ideal outcome or how you'd like to feel..."
                  className="h-32 rounded-xl"
                />
              </div>

              {goals.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Related to any existing goals? (Optional)
                  </label>
                  <div className="space-y-2">
                    {goals.map((goal) => (
                      <div
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          'p-3 rounded-xl border-2 cursor-pointer transition-all',
                          formData.related_goals.includes(goal.id)
                            ? 'border-purple-400 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Target className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-800">{goal.title}</span>
                          </div>
                          {formData.related_goals.includes(goal.id) && (
                            <Badge className="bg-purple-600">Selected</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Title & Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Almost there!</h3>
                <p className="text-sm text-gray-600 mb-4">Give your coaching session a name</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Session Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Managing Work Stress, Building Better Habits..."
                  className="rounded-xl"
                />
              </div>

              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold text-blue-900">Session Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Focus:</span>
                      <span className="font-medium text-gray-800">
                        {focusAreas.find(a => a.value === formData.focus_area)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Related Goals:</span>
                      <span className="font-medium text-gray-800">
                        {formData.related_goals.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-purple-900 font-medium mb-1">What happens next?</p>
                    <p className="text-sm text-purple-700">
                      Your AI coach will guide you through structured steps: understanding your challenge, 
                      setting clear goals, creating an action plan, and providing ongoing support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Navigation - Fixed at bottom above mobile nav */}
      <div className="bg-white border-t shadow-lg fixed bottom-0 left-0 right-0 mb-16 md:mb-0 z-20 flex-shrink-0">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={createSessionMutation.isPending}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || createSessionMutation.isPending}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {createSessionMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Starting Session...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Start Session
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Error Display */}
          {createSessionMutation.isError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Failed to create session. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}