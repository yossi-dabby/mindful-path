import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCrossTabInvalidation } from '../components/utils/useCrossTabInvalidation';
import { emitEntityChange } from '../components/utils/crossTabSync';
import { isAuthError, shouldShowAuthError } from '../components/utils/authErrorHandler';
import AuthErrorBanner from '../components/utils/AuthErrorBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Target, Calendar as CalendarIcon, Sparkles, Lightbulb, Clock, LayoutGrid } from 'lucide-react';
import { createPageUrl } from '../utils';
import GoalForm from '../components/goals/GoalForm';
import GoalCard from '../components/goals/GoalCard';
import GoalCalendar from '../components/goals/GoalCalendar';
import GoalKanbanBoard from '../components/goals/GoalKanbanBoard';
import AiGoalSuggestions from '../components/goals/AiGoalSuggestions';
import AiGoalBreakdown from '../components/goals/AiGoalBreakdown';
import GoalMotivation from '../components/goals/GoalMotivation';
import AiGoalCoaching from '../components/goals/AiGoalCoaching';
import MilestonesTimeline from '../components/goals/MilestonesTimeline';
import GoalTemplateLibrary from '../components/goals/GoalTemplateLibrary';

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(null);
  const [showCoaching, setShowCoaching] = useState(null);
  const [prefilledGoal, setPrefilledGoal] = useState(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const queryClient = useQueryClient();
  
  // Enable cross-tab synchronization
  useCrossTabInvalidation();

  const { data: goals = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['allGoals'],
    queryFn: async () => {
      const result = await base44.entities.Goal.list('-created_date');
      return Array.isArray(result) 
        ? result.map(goal => ({
            ...goal,
            ...goal.data,
            id: goal.id,
            created_date: goal.created_date,
            updated_date: goal.updated_date,
            created_by: goal.created_by
          }))
        : [];
    },
    initialData: [],
    refetchOnWindowFocus: false,
    refetchOnMount: 'always', // Always fetch on mount to ensure fresh data
    staleTime: 30000,
    onError: (error) => {
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      }
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (goalId) => base44.entities.Goal.delete(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries(['allGoals']);
      emitEntityChange('Goal', 'delete');
    },
    onError: (error) => {
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      } else {
        alert('Failed to delete goal. Check your connection and try again.');
      }
    }
  });

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingGoal(null);
    setPrefilledGoal(null);
    // Let react-query handle refetching naturally
  };

  const handleSelectAiGoal = (goalData) => {
    setPrefilledGoal(goalData);
    setShowAiSuggestions(false);
    setShowForm(true);
  };

  const handleSelectTemplate = (template) => {
    setPrefilledGoal({
      title: template.title,
      description: template.description,
      category: template.category,
      motivation: template.motivation,
      smart_criteria: template.smart_criteria,
      milestones: template.milestones?.map(m => ({ 
        title: m.title, 
        description: m.description,
        completed: false 
      }))
    });
    setShowTemplates(false);
    setShowForm(true);
  };

  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, data }) => base44.entities.Goal.update(goalId, data),
    onSuccess: (updatedGoal) => {
      if (updatedGoal?.id) {
        queryClient.setQueryData(['allGoals'], (old = []) => 
          old.map((g) => (g.id === updatedGoal.id ? {
            ...updatedGoal,
            ...updatedGoal.data,
            id: updatedGoal.id,
            created_date: updatedGoal.created_date,
            updated_date: updatedGoal.updated_date,
            created_by: updatedGoal.created_by
          } : g))
        );
      }
      emitEntityChange('Goal', 'update');
    },
    onError: (error) => {
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      } else {
        alert('Failed to update goal. Check your connection and try again.');
      }
    }
  });

  const handleApplyBreakdown = (breakdown) => {
    if (showBreakdown && breakdown.milestones) {
      updateGoalMutation.mutate({
        goalId: showBreakdown.id,
        data: {
          milestones: breakdown.milestones.map(m => ({ 
            title: m.title, 
            completed: false 
          }))
        }
      });
      setShowBreakdown(null);
    }
  };

  return (
    <>
      {showAuthError && <AuthErrorBanner onDismiss={() => setShowAuthError(false)} />}
      <div className="p-4 md:p-8 pb-32 md:pb-24 max-w-5xl mx-auto" style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            style={{ borderRadius: '50%' }}
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light mb-1 md:mb-2" style={{ color: '#1A3A34' }}>Your Goals</h1>
            <p className="text-sm md:text-base" style={{ color: '#5A7A72' }}>Set intentions and track your progress</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setShowCalendar(!showCalendar)}
            variant="outline"
            className="text-sm md:text-base"
            size="sm"
            style={{ borderRadius: '24px' }}
          >
            <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
            <span className="hidden md:inline">Calendar</span>
          </Button>
          <Button
            onClick={() => setShowTimeline(!showTimeline)}
            variant="outline"
            className="text-sm md:text-base"
            size="sm"
            style={{ borderRadius: '24px' }}
          >
            <Clock className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
            <span className="hidden md:inline">Timeline</span>
          </Button>
          <Button
            onClick={() => setShowKanban(!showKanban)}
            variant="outline"
            className="text-sm md:text-base"
            size="sm"
            style={{ borderRadius: '24px' }}
          >
            <LayoutGrid className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
            <span className="hidden md:inline">Kanban</span>
          </Button>
          <Button
            onClick={() => setShowTemplates(true)}
            variant="outline"
            className="text-sm md:text-base"
            size="sm"
            style={{ borderRadius: '24px' }}
          >
            <Target className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
            <span className="hidden md:inline">Templates</span>
          </Button>
          <Button
            onClick={() => setShowAiSuggestions(true)}
            variant="outline"
            className="text-sm md:text-base"
            size="sm"
            style={{ borderRadius: '24px' }}
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
            <span className="hidden md:inline">AI Suggestions</span>
          </Button>
          <Button
            onClick={() => window.location.href = createPageUrl('Chat', 'intent=goal_work')}
            className="text-white text-sm md:text-base"
            size="sm"
            style={{
              borderRadius: '24px',
              backgroundColor: '#26A69A',
              boxShadow: '0 6px 20px rgba(38, 166, 154, 0.3)'
            }}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Goals List */}
      {isError ? (
        <Card className="border-0" style={{
          borderRadius: '32px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 242, 242, 0.9) 100%)',
          boxShadow: '0 12px 40px rgba(239, 68, 68, 0.12)'
        }}>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4" style={{
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)'
            }}>
              <Target className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Couldn't load data</h2>
            <p className="mb-6 text-gray-600">Check your connection and try again.</p>
            <Button
              onClick={() => refetch()}
              className="text-white px-8 py-6"
              style={{
                borderRadius: '24px',
                backgroundColor: '#26A69A',
                boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
              }}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card className="border-0" style={{
          borderRadius: '32px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          boxShadow: '0 12px 40px rgba(38, 166, 154, 0.12), 0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4" style={{
              borderRadius: '50%',
              background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)'
            }}>
              <Target className="w-10 h-10" style={{ color: '#26A69A' }} />
            </div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1A3A34' }}>Set Your First Goal</h2>
            <p className="mb-6 max-w-md mx-auto" style={{ color: '#5A7A72' }}>
              Goals give you direction and motivation. Break them into small steps and celebrate each milestone.
            </p>
            <div className="flex flex-col gap-3 items-center max-w-md mx-auto">
              <Button
                onClick={() => setShowTemplates(true)}
                className="text-white px-8 py-6 text-lg w-full"
                style={{
                  borderRadius: '32px',
                  background: 'linear-gradient(145deg, #26A69A, #38B2AC)',
                  boxShadow: '0 8px 24px rgba(38, 166, 154, 0.35)'
                }}
              >
                <Target className="w-5 h-5 mr-2" />
                Browse Goal Templates
              </Button>
              <Button
                onClick={() => setShowAiSuggestions(true)}
                variant="outline"
                className="px-8 py-6 text-lg w-full"
                style={{ borderRadius: '32px' }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get AI Suggestions
              </Button>
              <Button
                onClick={() => window.location.href = createPageUrl('Chat', 'intent=goal_work')}
                variant="outline"
                className="px-8 py-6 text-lg w-full"
                style={{ borderRadius: '32px' }}
              >
                Create with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Motivation */}
          <GoalMotivation goals={activeGoals} />

          {/* Calendar View */}
          {showCalendar && (
            <GoalCalendar goals={goals} />
          )}

          {/* Timeline View */}
          {showTimeline && (
            <div className="mb-8">
              <MilestonesTimeline />
            </div>
          )}

          {/* Kanban Board for All Goals */}
          {showKanban && (
            <div className="mb-8">
              {activeGoals.length > 0 ? (
                activeGoals.map(goal => (
                  <div key={goal.id} className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{goal.title}</h3>
                    <GoalKanbanBoard goal={goal} />
                  </div>
                ))
              ) : (
                <Card className="border-0" style={{
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 8px 32px rgba(38, 166, 154, 0.12)'
                }}>
                  <CardContent className="p-8 text-center">
                    <LayoutGrid className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600">No active goals to display in Kanban view</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Active Goals</h2>
                {activeGoals.length > 0 && (
                  <Button
                    onClick={() => setShowAiSuggestions(true)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get More Suggestions
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                 <div key={goal.id}>
                   <GoalCard goal={goal} onEdit={handleEdit} onDelete={deleteGoalMutation.mutate} isDeleting={deleteGoalMutation.isPending} />
                   <div className="flex flex-col md:flex-row gap-2 mt-2">
                     <Button
                       onClick={() => setShowBreakdown(goal)}
                       variant="outline"
                       size="sm"
                       className="gap-2 w-full md:w-auto"
                     >
                       <Lightbulb className="w-4 h-4" />
                       Break Down
                     </Button>
                     <Button
                       onClick={() => setShowCoaching(goal)}
                       variant="outline"
                       size="sm"
                       className="gap-2 w-full md:w-auto"
                       style={{ borderColor: '#26A69A', color: '#26A69A' }}
                     >
                       <Sparkles className="w-4 h-4" />
                       Coach
                     </Button>
                   </div>
                 </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Goals</h2>
              <div className="space-y-4">
                {completedGoals.map((goal) => (
                 <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} onDelete={deleteGoalMutation.mutate} isDeleting={deleteGoalMutation.isPending} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && <GoalForm goal={editingGoal} prefilledData={prefilledGoal} onClose={handleClose} />}

      {/* AI Goal Suggestions */}
      {showAiSuggestions && (
        <AiGoalSuggestions
          onSelectGoal={handleSelectAiGoal}
          onClose={() => setShowAiSuggestions(false)}
        />
      )}

      {/* AI Goal Breakdown */}
      {showBreakdown && (
        <AiGoalBreakdown
          goal={showBreakdown}
          onApplySteps={handleApplyBreakdown}
          onClose={() => setShowBreakdown(null)}
        />
      )}

      {/* AI Goal Coaching */}
      {showCoaching && (
        <AiGoalCoaching
          goal={showCoaching}
          onClose={() => setShowCoaching(null)}
        />
      )}

      {/* Goal Template Library */}
      {showTemplates && (
        <GoalTemplateLibrary
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
      </div>
    </>
  );
}