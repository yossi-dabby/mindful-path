import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Target, Calendar as CalendarIcon, Sparkles, Lightbulb } from 'lucide-react';
import GoalForm from '../components/goals/GoalForm';
import GoalCard from '../components/goals/GoalCard';
import GoalCalendar from '../components/goals/GoalCalendar';
import AiGoalSuggestions from '../components/goals/AiGoalSuggestions';
import AiGoalBreakdown from '../components/goals/AiGoalBreakdown';
import GoalMotivation from '../components/goals/GoalMotivation';

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(null);
  const [prefilledGoal, setPrefilledGoal] = useState(null);
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['allGoals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
    initialData: []
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (goalId) => base44.entities.Goal.delete(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries(['allGoals']);
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
    queryClient.invalidateQueries(['allGoals']);
  };

  const handleSelectAiGoal = (goalData) => {
    setPrefilledGoal(goalData);
    setShowAiSuggestions(false);
    setShowForm(true);
  };

  const handleApplyBreakdown = (breakdown) => {
    // Apply the breakdown to the goal
    if (showBreakdown && breakdown.milestones) {
      base44.entities.Goal.update(showBreakdown.id, {
        milestones: breakdown.milestones.map(m => ({ 
          title: m.title, 
          completed: false 
        }))
      }).then(() => {
        queryClient.invalidateQueries(['allGoals']);
        setShowBreakdown(null);
      });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-800 mb-1 md:mb-2">Your Goals</h1>
            <p className="text-sm md:text-base text-gray-500">Set intentions and track your progress</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setShowCalendar(!showCalendar)}
            variant="outline"
            className="rounded-xl text-sm md:text-base"
            size="sm"
          >
            <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
            <span className="hidden md:inline">Calendar</span>
          </Button>
          <Button
            onClick={() => setShowAiSuggestions(true)}
            variant="outline"
            className="rounded-xl text-sm md:text-base"
            size="sm"
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
            <span className="hidden md:inline">AI Suggestions</span>
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl text-sm md:text-base"
            size="sm"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Goals List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Set Your First Goal</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Goals give you direction and motivation. Break them into small steps and celebrate each milestone.
            </p>
            <div className="flex flex-col gap-3 items-center max-w-md mx-auto">
              <Button
                onClick={() => setShowAiSuggestions(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg rounded-xl w-full"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get AI Goal Suggestions
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="px-8 py-6 text-lg rounded-xl w-full"
              >
                Create Manually
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
                  <div key={goal.id} className="relative group">
                    <GoalCard goal={goal} onEdit={handleEdit} onDelete={deleteGoalMutation.mutate} />
                    <Button
                      onClick={() => setShowBreakdown(goal)}
                      variant="outline"
                      size="sm"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                    >
                      <Lightbulb className="w-4 h-4" />
                      Break It Down
                    </Button>
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
                  <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} onDelete={deleteGoalMutation.mutate} />
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
    </div>
  );
}