import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';

const categories = [
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'social', label: 'Social' },
  { value: 'cognitive', label: 'Cognitive' },
  { value: 'lifestyle', label: 'Lifestyle' }
];

export default function GoalForm({ goal, prefilledData, onClose }) {
  const [formData, setFormData] = useState(
    goal || prefilledData || {
      title: '',
      description: '',
      category: 'behavioral',
      target_date: '',
      progress: 0,
      status: 'active',
      milestones: []
    }
  );

  const saveMutation = useMutation({
    mutationFn: (data) =>
      goal
        ? base44.entities.Goal.update(goal.id, data)
        : base44.entities.Goal.create(data),
    onSuccess: () => onClose()
  });

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { title: '', completed: false, due_date: '', description: '' }]
    });
  };

  const updateMilestone = (index, field, value) => {
    const newMilestones = [...formData.milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setFormData({ ...formData, milestones: newMilestones });
  };

  const removeMilestone = (index) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-0 shadow-2xl my-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{goal ? 'Edit Goal' : 'Create New Goal'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Goal Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What do you want to achieve?"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your goal in detail..."
                className="h-24 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Target Date</label>
                <Input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>

            {goal && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Progress: {formData.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Sub-goals / Tasks</label>
                <Button variant="outline" size="sm" onClick={addMilestone} className="rounded-lg">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              </div>
              <div className="space-y-3">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="p-3 border rounded-xl bg-gray-50">
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        placeholder={`Task ${index + 1} title`}
                        className="flex-1 rounded-lg bg-white"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMilestone(index)}
                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={milestone.due_date || ''}
                        onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                        placeholder="Due date"
                        className="rounded-lg bg-white text-sm"
                      />
                      <Input
                        value={milestone.description || ''}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Notes (optional)"
                        className="rounded-lg bg-white text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => saveMutation.mutate(formData)}
                disabled={!formData.title || saveMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {saveMutation.isPending ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}