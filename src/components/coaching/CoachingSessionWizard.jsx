import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, ChevronLeft, Sparkles, Target, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const focusAreas = [
{ value: 'mood_improvement', label: 'Improve Mood', icon: '😊', description: 'Work on feeling better daily' },
{ value: 'stress_management', label: 'Manage Stress', icon: '🧘', description: 'Reduce and cope with stress' },
{ value: 'goal_achievement', label: 'Achieve Goals', icon: '🎯', description: 'Reach specific objectives' },
{ value: 'behavior_change', label: 'Change Habits', icon: '🔄', description: 'Build new positive habits' },
{ value: 'relationship', label: 'Relationships', icon: '💝', description: 'Improve connections' },
{ value: 'self_esteem', label: 'Self-Esteem', icon: '✨', description: 'Build confidence' },
{ value: 'general', label: 'General Support', icon: '🌟', description: 'Overall wellness' }];


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
      queryClient.invalidateQueries({ queryKey: ['coachingSessions'] });
      onClose();
    },
    onError: (error) => {
      console.error('Session creation error:', error);
    }
  });

  const moodInsight = recentMoods.length >= 3 &&
  recentMoods.slice(0, 3).every((m) => ['low', 'very_low'].includes(m.mood)) ?
  'Your recent mood has been low - a coaching session could help address this.' :
  null;

  const toggleGoal = (goalId) => {
    const updated = formData.related_goals.includes(goalId) ?
    formData.related_goals.filter((id) => id !== goalId) :
    [...formData.related_goals, goalId];
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
    <div className="flex flex-col bg-background w-full" style={{ position: 'fixed', inset: 0, height: '100dvh', overflow: 'hidden', zIndex: 70, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className="bg-card border-b border-border/70 shadow-sm flex-shrink-0" style={{ zIndex: 10 }}>
        <div className="max-w-2xl mx-auto p-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Start New Session</h1>
                <p className="text-sm text-muted-foreground">Step {step} of 3</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={step > 1 ? () => setStep(step - 1) : onClose} aria-label={step > 1 ? "Go back" : "Close"} className="text-slate-950 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-none hover:bg-secondary/78 hover:text-foreground active:bg-secondary/88 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0">
              {step > 1 ?
              <ChevronLeft className="w-5 h-5" /> :

              <X className="w-5 h-5" />
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0, overscrollBehavior: 'none' }}>
        <div className="max-w-2xl mx-auto p-4 md:p-6 pb-8 w-full">
          {/* Step 1: Focus Area */}
          {step === 1 &&
          <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">What would you like to work on?</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose the area you want to focus on</p>
              </div>

              {moodInsight &&
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">{moodInsight}</p>
                </div>
            }

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {focusAreas.map((area) =>
              <button
                key={area.value}
                onClick={() => setFormData({ ...formData, focus_area: area.value })}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg',
                  formData.focus_area === area.value ?
                  'border-primary bg-primary/8 shadow-md' :
                  'border-border hover:border-border/80'
                )}>

                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{area.icon}</span>
                      <div>
                        <h4 className="font-semibold text-foreground">{area.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{area.description}</p>
                      </div>
                    </div>
                  </button>
              )}
              </div>
            </div>
          }

          {/* Step 2: Challenge & Outcome */}
          {step === 2 &&
          <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Tell me more</h3>
                <p className="text-sm text-muted-foreground mb-4">Help me understand what you're facing</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  What's the specific challenge you're facing?
                </label>
                <Textarea
                value={formData.current_challenge}
                onChange={(e) => setFormData({ ...formData, current_challenge: e.target.value })}
                placeholder="Describe the situation, problem, or difficulty you're experiencing..."
                className="h-32 rounded-xl" />

              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  What would you like to achieve or how would you like things to be different?
                </label>
                <Textarea
                value={formData.desired_outcome}
                onChange={(e) => setFormData({ ...formData, desired_outcome: e.target.value })}
                placeholder="Describe your ideal outcome or how you'd like to feel..."
                className="h-32 rounded-xl" />

              </div>

              {goals.length > 0 &&
            <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Related to any existing goals? (Optional)
                  </label>
                  <div className="space-y-2">
                    {goals.map((goal) =>
                <div
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    'p-3 rounded-xl border-2 cursor-pointer transition-all',
                    formData.related_goals.includes(goal.id) ?
                    'border-primary bg-primary/8' :
                    'border-border hover:border-border/80'
                  )}>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Target className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">{goal.title}</span>
                          </div>
                          {formData.related_goals.includes(goal.id) &&
                    <Badge className="bg-primary">Selected</Badge>
                    }
                        </div>
                      </div>
                )}
                  </div>
                </div>
            }
            </div>
          }

          {/* Step 3: Title & Confirm */}
          {step === 3 &&
          <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Almost there!</h3>
                <p className="text-sm text-muted-foreground mb-4">Give your coaching session a name</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Session Title
                </label>
                <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Managing Work Stress, Building Better Habits..."
                className="rounded-xl" />

              </div>

              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Session Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Focus:</span>
                      <span className="font-medium text-foreground">
                        {focusAreas.find((a) => a.value === formData.focus_area)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Related Goals:</span>
                      <span className="font-medium text-foreground">
                        {formData.related_goals.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-secondary/50 border border-border/70 rounded-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground font-medium mb-1">What happens next?</p>
                    <p className="text-sm text-muted-foreground">
                      Your AI coach will guide you through structured steps: understanding your challenge, 
                      setting clear goals, creating an action plan, and providing ongoing support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          }

        </div>
      </div>

      {/* Navigation - Sticky at bottom of fixed container */}
      <div className="bg-card border-t border-border/70 shadow-lg flex-shrink-0 safe-bottom-nav" style={{ zIndex: 10 }}>
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex gap-3">
            {step > 1 &&
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={createSessionMutation.isPending}
              className="flex-1">

                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            }
            {step < 3 ?
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">

                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button> :

            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || createSessionMutation.isPending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">

                {createSessionMutation.isPending ?
              <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Starting Session...
                  </> :

              <>
                    <Target className="w-4 h-4 mr-2" />
                    Start Session
                  </>
              }
              </Button>
            }
          </div>
          
          {/* Error Display */}
          {createSessionMutation.isError &&
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm text-destructive">
                Failed to create session. Please try again.
              </p>
            </div>
          }
        </div>
      </div>
    </div>);

}