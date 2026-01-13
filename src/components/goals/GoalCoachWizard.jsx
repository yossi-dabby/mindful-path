import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, ChevronRight, ChevronLeft, Target, Brain, HeartHandshake, Users, ListChecks, Sparkles, Shapes, GraduationCap, HeartPulse, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const goalCategories = [
  {
    value: 'cognitive',
    label: 'Study / Work',
    subtitle: 'Learning, focus, performance',
    icon: GraduationCap,
    color: '#9F7AEA',
    bgColor: 'rgba(159, 122, 234, 0.15)'
  },
  {
    value: 'lifestyle',
    label: 'Health & Habits',
    subtitle: 'Sleep, food, movement',
    icon: HeartPulse,
    color: '#38B2AC',
    bgColor: 'rgba(56, 178, 172, 0.15)'
  },
  {
    value: 'emotional',
    label: 'Emotions & Stress',
    subtitle: 'Regulation, coping, calm',
    icon: HeartHandshake,
    color: '#ED8936',
    bgColor: 'rgba(237, 137, 54, 0.15)'
  },
  {
    value: 'cognitive',
    label: 'Thoughts & Confidence',
    subtitle: 'Self-talk, mindset',
    icon: Brain,
    color: '#A78BFA',
    bgColor: 'rgba(167, 139, 250, 0.15)'
  },
  {
    value: 'social',
    label: 'Relationships & Social',
    subtitle: 'Connection, communication',
    icon: Users,
    color: '#4299E1',
    bgColor: 'rgba(66, 153, 225, 0.15)'
  },
  {
    value: 'behavioral',
    label: 'Routine & Productivity',
    subtitle: 'Consistency, action',
    icon: ListChecks,
    color: '#F6AD55',
    bgColor: 'rgba(246, 173, 85, 0.15)'
  },
  {
    value: 'lifestyle',
    label: 'Self-Care & Wellbeing',
    subtitle: 'Recharge, balance',
    icon: Sparkles,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)'
  },
  {
    value: 'behavioral',
    label: 'Other',
    subtitle: 'Anything else',
    icon: Shapes,
    color: '#6B7280',
    bgColor: 'rgba(107, 116, 128, 0.15)'
  }
];

export default function GoalCoachWizard({ onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ui_category_label: '',
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
    },
    rewards: ['']
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
      if (data.smart_criteria.time_bound?.trim()) smartCriteria.time_bound = data.smart_criteria.time_bound.trim();
      
      // Store UI category label in smart_criteria.relevant
      const uiCategoryLabel = data.ui_category_label || '';
      smartCriteria.relevant = `UI Category: ${uiCategoryLabel}`;
      
      if (Object.keys(smartCriteria).length > 0) {
        goalData.smart_criteria = smartCriteria;
      }

      // Add rewards if any are filled
      const rewards = data.rewards
        .filter(r => r && r.trim())
        .map(r => r.trim());
      
      if (rewards.length > 0) {
        goalData.rewards = rewards;
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
    if (step === 3) return true; // All fields in step 3 are optional
    if (step === 4) return true; // Review - all validation done
    return false;
  };

  const addReward = () => {
    if (formData.rewards.length < 3) {
      setFormData({ ...formData, rewards: [...formData.rewards, ''] });
    }
  };

  const removeReward = (index) => {
    const updated = formData.rewards.filter((_, i) => i !== index);
    setFormData({ ...formData, rewards: updated.length > 0 ? updated : [''] });
  };

  const updateReward = (index, value) => {
    const updated = [...formData.rewards];
    updated[index] = value;
    setFormData({ ...formData, rewards: updated });
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

  const selectedCategory = goalCategories.find(c => 
    c.value === formData.category && c.label === formData.ui_category_label
  );

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 flex flex-col overflow-hidden">
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
      <div className="flex-1 overflow-y-auto min-h-0 pb-24">
        <div className="max-w-2xl mx-auto p-4 md:p-6 w-full">
          {/* Step 1: Select Goal Category */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What type of goal would you like to work on?</h3>
                <p className="text-sm text-gray-600 mb-4">Choose the category that best fits your goal</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goalCategories.map((category, index) => {
                  const Icon = category.icon;
                  const isSelected = formData.category === category.value && formData.ui_category_label === category.label;
                  return (
                    <button
                      key={`${category.value}-${index}`}
                      type="button"
                      onClick={() => {
                        setFormData({ 
                          ...formData, 
                          category: category.value,
                          ui_category_label: category.label 
                        });
                        // Auto-advance to Step 2 after category selection
                        setStep(2);
                      }}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg',
                        isSelected
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
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{category.label}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{category.subtitle}</p>
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
                  className="h-28 rounded-xl"
                />
              </div>

              <div className="space-y-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700">Additional details (Optional)</p>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Any additional context..."
                    className="h-20 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Target Date</label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Plan Your Next Steps */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Plan your next steps</h3>
                <p className="text-sm text-gray-600 mb-4">Break your goal into actionable pieces</p>
              </div>

              {selectedCategory && (
                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: selectedCategory.color }}
                      >
                        <selectedCategory.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{formData.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-blue-900 mb-2">Reflect on these:</p>
                  <div className="space-y-1 text-xs text-blue-800">
                    <div className="flex gap-1.5">
                      <span className="text-blue-600 flex-shrink-0">•</span>
                      <p>What would success look like in concrete terms?</p>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="text-blue-600 flex-shrink-0">•</span>
                      <p>What is one small step you can take this week?</p>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="text-blue-600 flex-shrink-0">•</span>
                      <p>What might get in the way, and how could you handle it?</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-xs font-medium text-purple-900">SMART Criteria (Optional)</p>
                <div className="space-y-2">
                  <Input
                    value={formData.smart_criteria.specific}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      smart_criteria: { ...formData.smart_criteria, specific: e.target.value } 
                    })}
                    placeholder="Specific: What exactly will you accomplish?"
                    className="rounded-lg text-xs h-9"
                  />
                  <Input
                    value={formData.smart_criteria.measurable}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      smart_criteria: { ...formData.smart_criteria, measurable: e.target.value } 
                    })}
                    placeholder="Measurable: How will you measure progress?"
                    className="rounded-lg text-xs h-9"
                  />
                  <Input
                    value={formData.smart_criteria.achievable}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      smart_criteria: { ...formData.smart_criteria, achievable: e.target.value } 
                    })}
                    placeholder="Achievable: Why is this realistic?"
                    className="rounded-lg text-xs h-9"
                  />
                  <Input
                    value={formData.smart_criteria.time_bound}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      smart_criteria: { ...formData.smart_criteria, time_bound: e.target.value } 
                    })}
                    placeholder="Time-Bound: When will you achieve this?"
                    className="rounded-lg text-xs h-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Milestones (Optional)
                </label>
                <p className="text-xs text-gray-600 mb-2">Break your goal into smaller steps</p>
                <div className="space-y-3">
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="p-2.5 bg-gray-50 rounded-xl space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          placeholder={`Milestone ${index + 1}...`}
                          className="rounded-lg flex-1 text-sm h-9"
                        />
                        {formData.milestones.length > 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeMilestone(index)}
                            className="flex-shrink-0 h-9 w-9"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Details (optional)..."
                        className="h-14 rounded-lg text-xs"
                      />
                      <Input
                        type="date"
                        value={milestone.due_date}
                        onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                        className="rounded-lg text-xs h-9"
                      />
                    </div>
                  ))}
                  {formData.milestones.length < 5 && (
                    <Button
                      variant="outline"
                      onClick={addMilestone}
                      className="w-full rounded-xl h-9 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add Milestone
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Rewards (Optional)
                </label>
                <p className="text-xs text-gray-600 mb-2">What will you reward yourself with?</p>
                <div className="space-y-2">
                  {formData.rewards.map((reward, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={reward}
                        onChange={(e) => updateReward(index, e.target.value)}
                        placeholder={`Reward ${index + 1}...`}
                        className="rounded-lg flex-1 text-sm h-9"
                      />
                      {formData.rewards.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeReward(index)}
                          className="flex-shrink-0 h-9 w-9"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.rewards.length < 3 && (
                    <Button
                      variant="outline"
                      onClick={addReward}
                      className="w-full rounded-xl h-9 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add Reward
                    </Button>
                  )}
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
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: selectedCategory.color }}
                      >
                        <selectedCategory.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{selectedCategory.label}</p>
                        <p className="text-xs text-gray-600">({formData.category})</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-600 font-medium">Goal:</span>
                        <p className="text-gray-800 mt-0.5">{formData.title}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Why it matters:</span>
                        <p className="text-gray-800 mt-0.5">{formData.motivation}</p>
                      </div>
                      {formData.description && (
                        <div>
                          <span className="text-gray-600 font-medium">Details:</span>
                          <p className="text-gray-800 mt-0.5">{formData.description}</p>
                        </div>
                      )}
                      {formData.target_date && (
                        <div>
                          <span className="text-gray-600 font-medium">Target:</span>
                          <span className="text-gray-800 ml-1">
                            {new Date(formData.target_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {formData.milestones.filter(m => m.title.trim()).length > 0 && (
                        <div>
                          <span className="text-gray-600 font-medium">Milestones:</span>
                          <ul className="mt-1 space-y-1.5">
                            {formData.milestones.filter(m => m.title.trim()).map((milestone, index) => (
                              <li key={index} className="text-gray-800 bg-white p-1.5 rounded-lg">
                                <div className="font-medium">• {milestone.title}</div>
                                {milestone.description && (
                                  <div className="text-[10px] text-gray-600 ml-3 mt-0.5">{milestone.description}</div>
                                )}
                                {milestone.due_date && (
                                  <div className="text-[10px] text-gray-500 ml-3">
                                    Due: {new Date(milestone.due_date).toLocaleDateString()}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {formData.rewards.filter(r => r.trim()).length > 0 && (
                        <div>
                          <span className="text-gray-600 font-medium">Rewards:</span>
                          <ul className="mt-0.5 space-y-0.5">
                            {formData.rewards.filter(r => r.trim()).map((reward, index) => (
                              <li key={index} className="text-gray-800">• {reward}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(formData.smart_criteria.specific || formData.smart_criteria.measurable || formData.smart_criteria.achievable || formData.smart_criteria.time_bound) && (
                        <div>
                          <span className="text-gray-600 font-medium">SMART:</span>
                          <div className="mt-1 space-y-0.5 bg-white p-1.5 rounded-lg text-[10px]">
                            {formData.smart_criteria.specific && (
                              <div><span className="font-medium">S:</span> {formData.smart_criteria.specific}</div>
                            )}
                            {formData.smart_criteria.measurable && (
                              <div><span className="font-medium">M:</span> {formData.smart_criteria.measurable}</div>
                            )}
                            {formData.smart_criteria.achievable && (
                              <div><span className="font-medium">A:</span> {formData.smart_criteria.achievable}</div>
                            )}
                            {formData.smart_criteria.time_bound && (
                              <div><span className="font-medium">T:</span> {formData.smart_criteria.time_bound}</div>
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

      {/* Navigation - Fixed at bottom */}
      <div className="bg-white border-t shadow-lg flex-shrink-0 safe-bottom">
        <div className="max-w-2xl mx-auto p-3 w-full">
          <div className="flex gap-2.5">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={createGoalMutation.isPending}
                className="flex-1 h-10"
              >
                <ChevronLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || createGoalMutation.isPending}
                className="flex-1 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
              >
                {createGoalMutation.isPending ? (
                  <>
                    <Target className="w-4 h-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-1.5" />
                    Save Goal
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Error Display */}
          {createGoalMutation.isError && (
            <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-800">
                Failed to save goal. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}