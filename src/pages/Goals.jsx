import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Target } from 'lucide-react';
import GoalForm from '../components/goals/GoalForm';
import GoalCard from '../components/goals/GoalCard';

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['allGoals'],
    queryFn: () => base44.entities.Goal.list('-created_date'),
    initialData: []
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
    queryClient.invalidateQueries(['allGoals']);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">Your Goals</h1>
          <p className="text-gray-500">Set intentions and track your progress</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Goal
        </Button>
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
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg rounded-xl"
            >
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Goals</h2>
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
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
                  <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && <GoalForm goal={editingGoal} onClose={handleClose} />}
    </div>
  );
}