import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, ChevronLeft, Target, Brain, Heart, Zap, Users, Dumbbell, Briefcase, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const goalCategories = [
  {
    value: 'cognitive',
    label: 'Thoughts & Confidence',
    description: 'Change thinking patterns, build mental clarity',
    icon: Brain,
    color: '#9F7AEA',
    bgColor: 'rgba(159, 122, 234, 0.15)'
  },
  {
    value: 'emotional',
    label: 'Emotions & Stress',
    description: 'Improve mood, manage feelings better',
    icon: Heart,
    color: '#ED8936',
    bgColor: 'rgba(237, 137, 54, 0.15)'
  },
  {
    value: 'behavioral',
    label: 'Routine & Productivity',
    description: 'Build better habits, change actions',
    icon: Zap,
    color: '#F6AD55',
    bgColor: 'rgba(246, 173, 85, 0.15)'
  },
  {
    value: 'social',
    label: 'Relationships & Social',
    description: 'Improve connections, communication',
    icon: Users,
    color: '#4299E1',
    bgColor: 'rgba(66, 153, 225, 0.15)'
  },
  {
    value: 'lifestyle',
    label: 'Health & Wellbeing',
    description: 'Exercise, sleep, self-care habits',
    icon: Dumbbell,
    color: '#38B2AC',
    bgColor: 'rgba(56, 178, 172, 0.15)'
  }
];

export default function GoalCoachWizard({ onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    motivation: '',
    description: '',
    target_date: '',
    milestones: [{ title: '', description: '', due_date: '' }],
    smart_criteria: {
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      time_bound: ''
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data) => {
      // Validate required fields
      if (!data.category || !data.title) {
        throw new Error('Please fill in required fields');
      }

      // Prepare milestones - filter out empty ones
      const milestones = data.milestones
        .filter(m => m.title && m.title.trim())
        .map(m => ({
          title: m.title.trim(),
          description: m.description?.trim() || '',
          due_date: m.due_date || '',
          completed: false,
          completed_date: ''
        }));

      // Create goal entry
      const goalData = {
        category: data.category,
        title: data.title.trim(),
        status: 'active',
        progress: 0
      };

      // Add optional fields if provided
      if (data.motivation?.trim()) {
        goalData.motivation = data.motivation.trim();
      }

      if (data.description?.trim()) {
        goalData.description = data.description.trim();
      }

      if (data.target_date) {
        goalData.target_date = data.target_date;
      }

      if (milestones.length > 0) {
        goalData.milestones = milestones;
      }

      // Add SMART criteria if any field is filled
      const smartCriteria = {};
      if (data.smart_criteria.specific?.trim()) smartCriteria.specific = data.smart_criteria.specific.trim();
      if (data.smart_criteria.measurable?.trim()) smartCriteria.measurable = data.smart_criteria.measurable.trim();
      if (data.smart_criteria.achievable?.trim()) smartCriteria.achievable = data.smart_criteria.achievable.trim();
      if (data.smart_criteria.relevant?.trim()) smartCriteria.relevant = data.smart_criteria.relevant.trim();
      if (data.smart_criteria.time_bound?.trim()) smartCriteria.time_bound = data.smart_criteria.time_bound.trim();
      
      if (Object.keys(smartCriteria).length > 0) {
        goalData.smart_criteria = smartCriteria;
      }

      const goal = await base44.entities.Goal.create(goalData);
      
      if (!goal || !goal.id) {
        throw new Error('Failed to create goal');
      }

      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allGoals']);
      queryClient.invalidateQueries(['recentGoals']);
      onClose();
    },
    onError: (error) => {
      console.error('Goal creation error:', error);
    }
  });

  const addMilestone = () => {
    setFormData({ 
      ...formData, 
      milestones: [...formData.milestones, { title: '', description: '', due_date: '' }] 
    });
  };

  const removeMilestone = (index) => {
    const updated = formData.milestones.filter((_, i) => i !== index);
    setFormData({ ...formData, milestones: updated });
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...formData.milestones];
    updated[index][field] = value;
    setFormData({ ...formData, milestones: updated });
  };

  const canProceed = () => {
    if (step === 1) return formData.category;
    if (step === 2) return formData.title.trim() && formData.motivation.trim();
    if (step === 3) return true; // Target date and steps are optional
    if (step === 4) return true; // Review - all validation done
    return false;
  };

  const handleSubmit = () => {
    // Prevent double submission
    if (createGoalMutation.isPending) return;

    // Final validation
    if (!formData.category || !formData.title?.trim() || !formData.motivation?.trim()) {
      return;
    }

    createGoalMutation.mutate(formData);
  };

  const selectedCategory = goalCategories.find(c => c.value === formData.category);

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 w-full overflow-x-hidden">
      {/* Header - Sticky on mobile */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10 flex-shrink-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto p-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Goal Coach</h1>
                <p className="text-sm text-gray-500">Step {step} of 4</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl mx-auto p-4 md:p-6 pb-32 w-full">
          {/* Step 1: Select Goal Category */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What type of goal would you like to work on?</h3>
                <p className="text-sm text-gray-600 mb-4">Choose the category that best fits your goal</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.value}
                      onClick={() => setFormData({ ...formData, category: category.value })}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg',
                        formData.category === category.value
                          ? 'border-orange-400 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        >
                          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{category.label}</h4>
                          <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Goal Definition */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Describe your goal</h3>
                <p className="text-sm text-gray-600 mb-4">What do you want to achieve?</p>
              </div>

              {selectedCategory && (
                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: selectedCategory.color }}
                      >
                        <selectedCategory.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedCategory.label}</p>
                        <p className="text-xs text-gray-600">{selectedCategory.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Goal Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Practice mindfulness daily"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Why is this goal important to you? <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="Describe why achieving this goal matters to you..."
                  className="h-32 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Additional details (Optional)
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Any additional context or details about this goal..."
                  className="h-24 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Step 3: Goal Coaching */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Let's shape this goal into something achievable</h3>
                <p className="text-sm text-gray-600 mb-4">Making your goal concrete and actionable</p>
              </div>

              {selectedCategory && (
                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: selectedCategory.color }}
                      >
                        <selectedCategory.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{formData.title}</p>
                        <p className="text-xs text-gray-600 mt-1 italic">"{formData.motivation}"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-blue-900 mb-3">Reflect on these questions:</p>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <p>What would success look like in concrete terms?</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <p>What is one small step you can take this week?</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <p>What might get in the way, and how could you handle it?</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Target Timeframe (Optional)
                </label>
                <Input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-2">
                  When would you like to achieve this goal?
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Milestones (Recommended)
                </label>
                <p className="text-xs text-gray-600 mb-3">Break your goal into 2-3 smaller milestones</p>
                <div className="space-y-4">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-xl space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          placeholder={`Milestone ${index + 1} title...`}
                          className="rounded-xl flex-1"
                        />
                        {formData.milestones.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeMilestone(index)}
                            className="flex-shrink-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Details (optional)..."
                        className="h-16 rounded-xl text-sm"
                      />
                      <Input
                        type="date"
                        value={milestone.due_date}
                        onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                        className="rounded-xl text-sm"
                        placeholder="Due date (optional)"
                      />
                    </div>
                  ))}
                  {formData.milestones.length < 5 && (
                    <Button
                      variant="outline"
                      onClick={addMilestone}
                      className="w-full rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Milestone
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-xs font-medium text-purple-900 mb-2">Optional: SMART Goal Framework</p>
                <div className="space-y-2">
                  <Input
                    value={formData.smart_criteria.specific}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      smart_criteria: { ...formData.smart_criteria, specific: e.target.value } 
                    })}
                    placeholder="Specific: What exactly will you accomplish?"
                    className="rounded-lg text-sm"
                  />
                  <Input
                    value={formData.smart_criteria.measurable}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      smart_criteria: { ...formData.smart_criteria, measurable: e.target.value } 
                    })}
                    placeholder="Measurable: How will you measure progress?"
                    className="rounded-lg text-sm"
                  />
                  <Input
                    value={formData.smart_criteria.achievable}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      smart_criteria: { ...formData.smart_criteria, achievable: e.target.value } 
                    })}
                    placeholder="Achievable: Why is this realistic?"
                    className="rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Save */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Review your goal</h3>
                <p className="text-sm text-gray-600 mb-4">Check everything before saving to Active Goals</p>
              </div>

              {selectedCategory && (
                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: selectedCategory.color }}
                      >
                        <selectedCategory.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedCategory.label}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">Goal:</span>
                        <p className="text-gray-800 mt-1">{formData.title}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Why it matters:</span>
                        <p className="text-gray-800 mt-1">{formData.motivation}</p>
                      </div>
                      {formData.description && (
                        <div>
                          <span className="text-gray-600 font-medium">Details:</span>
                          <p className="text-gray-800 mt-1">{formData.description}</p>
                        </div>
                      )}
                      {formData.target_date && (
                        <div>
                          <span className="text-gray-600 font-medium">Target Date:</span>
                          <span className="text-gray-800 ml-2">
                            {new Date(formData.target_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {formData.milestones.filter(m => m.title.trim()).length > 0 && (
                        <div>
                          <span className="text-gray-600 font-medium">Milestones:</span>
                          <ul className="mt-1 space-y-2">
                            {formData.milestones.filter(m => m.title.trim()).map((milestone, index) => (
                              <li key={index} className="text-gray-800 bg-white p-2 rounded-lg">
                                <div className="font-medium">• {milestone.title}</div>
                                {milestone.description && (
                                  <div className="text-xs text-gray-600 ml-3">{milestone.description}</div>
                                )}
                                {milestone.due_date && (
                                  <div className="text-xs text-gray-500 ml-3">
                                    Due: {new Date(milestone.due_date).toLocaleDateString()}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(formData.smart_criteria.specific || formData.smart_criteria.measurable || formData.smart_criteria.achievable) && (
                        <div>
                          <span className="text-gray-600 font-medium">SMART Criteria:</span>
                          <div className="mt-1 text-xs space-y-1 bg-white p-2 rounded-lg">
                            {formData.smart_criteria.specific && (
                              <div><span className="font-medium">Specific:</span> {formData.smart_criteria.specific}</div>
                            )}
                            {formData.smart_criteria.measurable && (
                              <div><span className="font-medium">Measurable:</span> {formData.smart_criteria.measurable}</div>
                            )}
                            {formData.smart_criteria.achievable && (
                              <div><span className="font-medium">Achievable:</span> {formData.smart_criteria.achievable}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-900 font-medium mb-1">What happens next?</p>
                    <p className="text-sm text-green-700">
                      This goal will be saved to your Active Goals. You can track progress, update milestones, 
                      and celebrate achievements along the way.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Navigation - Fixed at bottom above mobile nav */}
      <div className="bg-white border-t shadow-lg fixed bottom-0 left-0 right-0 z-20 flex-shrink-0" style={{ marginBottom: 'calc(80px + env(safe-area-inset-bottom, 0))' }}>
        <div className="max-w-2xl mx-auto p-4 w-full overflow-x-hidden">
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={createGoalMutation.isPending}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || createGoalMutation.isPending}
                className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
              >
                {createGoalMutation.isPending ? (
                  <>
                    <Target className="w-4 h-4 mr-2 animate-spin" />
                    Saving Goal...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Save to Active Goals
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Error Display */}
          {createGoalMutation.isError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Failed to save goal. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}