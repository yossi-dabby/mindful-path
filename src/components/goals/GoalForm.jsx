import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { isAuthError, shouldShowAuthError } from '../utils/authErrorHandler';
import AuthErrorBanner from '../utils/AuthErrorBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Trash2, Target, CheckCircle, Sparkles } from 'lucide-react';

const categories = [
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'social', label: 'Social' },
  { value: 'cognitive', label: 'Cognitive' },
  { value: 'lifestyle', label: 'Lifestyle' }
];

export default function GoalForm({ goal, prefilledData, onClose }) {
  const [currentTab, setCurrentTab] = useState('basic');
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);
  const [formData, setFormData] = useState(
    goal || prefilledData || {
      title: '',
      description: '',
      category: 'behavioral',
      target_date: '',
      progress: 0,
      status: 'active',
      milestones: [],
      smart_criteria: {
        specific: '',
        measurable: '',
        achievable: '',
        relevant: '',
        time_bound: ''
      },
      motivation: '',
      rewards: []
    }
  );

  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const isSavingRef = useRef(false);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      // Validate progress range
      const validatedData = {
        ...data,
        progress: Math.max(0, Math.min(100, data.progress || 0))
      };
      return goal
        ? base44.entities.Goal.update(goal.id, validatedData)
        : base44.entities.Goal.create(validatedData);
    },
    onSuccess: () => {
      isSavingRef.current = false;
      onClose();
    },
    onError: (error) => {
      isSavingRef.current = false;
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      } else {
        setSaveError(error.message || 'Failed to save goal');
      }
    }
  });

  const generateSmartSuggestions = async () => {
    if (!formData.title.trim()) return;
    
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setAiSuggesting(true);
    setSaveError(null);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Help make this goal SMART (Specific, Measurable, Achievable, Relevant, Time-bound):

**Goal:** ${formData.title}
**Description:** ${formData.description}
**Category:** ${formData.category}
${formData.target_date ? `**Target Date:** ${formData.target_date}` : ''}

Provide SMART criteria answers and suggestions for milestones.`,
        response_json_schema: {
          type: "object",
          properties: {
            specific: { type: "string" },
            measurable: { type: "string" },
            achievable: { type: "string" },
            relevant: { type: "string" },
            time_bound: { type: "string" },
            suggested_milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (!mountedRef.current) return;
      
      setFormData({
        ...formData,
        smart_criteria: {
          specific: response.specific,
          measurable: response.measurable,
          achievable: response.achievable,
          relevant: response.relevant,
          time_bound: response.time_bound
        },
        milestones: response.suggested_milestones?.map(m => ({ 
          title: m.title, 
          description: m.description,
          completed: false 
        })) || formData.milestones
      });
      setCurrentTab('smart');
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Failed to generate SMART suggestions:', error);
      if (!mountedRef.current) return;
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      } else {
        setSaveError('AI suggestion failed. Please try again or fill manually.');
      }
    } finally {
      if (mountedRef.current) {
        setAiSuggesting(false);
      }
    }
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { title: '', completed: false, due_date: '', description: '' }]
    });
  };

  // Handle Escape key to close
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
    <>
      {showAuthError && <AuthErrorBanner onDismiss={() => setShowAuthError(false)} />}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 pb-24 overflow-y-auto" style={{ zIndex: 50 }}>
        <Card className="w-full max-w-3xl border-0 shadow-2xl my-8" style={{ maxHeight: 'calc(100vh - 160px)', zIndex: 55 }}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{goal ? 'Edit Goal' : 'Create SMART Goal'}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Set goals that are specific, measurable, and achievable</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close goal form">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="smart">SMART Criteria</TabsTrigger>
              <TabsTrigger value="milestones">Action Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="overflow-y-auto flex-1">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Goal Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Exercise 3 times per week for 30 minutes"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what success looks like and why this matters to you..."
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

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Personal Motivation</label>
                  <Textarea
                    value={formData.motivation || ''}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    placeholder="Why is this goal important to you? How will achieving it improve your life?"
                    className="h-20 rounded-xl"
                  />
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

                <Button
                  type="button"
                  onClick={generateSmartSuggestions}
                  disabled={!formData.title || aiSuggesting}
                  variant="outline"
                  className="w-full"
                >
                  {aiSuggesting ? (
                    <>Generating SMART criteria...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Goal Suggestions
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="smart" className="overflow-y-auto flex-1">
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    SMART Goal Framework
                  </h3>
                  <p className="text-sm text-gray-600">
                    Make your goal Specific, Measurable, Achievable, Relevant, and Time-bound for better success.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    📍 Specific - What exactly will you accomplish?
                  </label>
                  <Textarea
                    value={formData.smart_criteria?.specific || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      smart_criteria: { ...formData.smart_criteria, specific: e.target.value }
                    })}
                    placeholder="Be clear and detailed. Who, what, where, when, why?"
                    className="h-20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    📊 Measurable - How will you track progress?
                  </label>
                  <Textarea
                    value={formData.smart_criteria?.measurable || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      smart_criteria: { ...formData.smart_criteria, measurable: e.target.value }
                    })}
                    placeholder="Define numbers, milestones, or indicators of success"
                    className="h-20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    ✅ Achievable - Why is this realistic for you?
                  </label>
                  <Textarea
                    value={formData.smart_criteria?.achievable || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      smart_criteria: { ...formData.smart_criteria, achievable: e.target.value }
                    })}
                    placeholder="What resources, skills, or support do you have?"
                    className="h-20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    💡 Relevant - Why does this matter to you?
                  </label>
                  <Textarea
                    value={formData.smart_criteria?.relevant || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      smart_criteria: { ...formData.smart_criteria, relevant: e.target.value }
                    })}
                    placeholder="How does this align with your values and priorities?"
                    className="h-20 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    ⏰ Time-bound - When will you achieve this?
                  </label>
                  <Textarea
                    value={formData.smart_criteria?.time_bound || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      smart_criteria: { ...formData.smart_criteria, time_bound: e.target.value }
                    })}
                    placeholder="Set a deadline and any important dates"
                    className="h-20 rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="overflow-y-auto flex-1">
              <div className="space-y-6">

                <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Break Down Your Goal
                  </h3>
                  <p className="text-sm text-gray-600">
                    Define actionable steps to make your goal more achievable. Each step should be specific and measurable.
                  </p>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Action Steps / Milestones</label>
                  <Button variant="outline" size="sm" onClick={addMilestone} className="rounded-lg">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.milestones.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No steps added yet. Break your goal into smaller, actionable steps.
                    </div>
                  )}
                  {formData.milestones.map((milestone, index) => (
                    <div key={index} className="p-4 border-2 rounded-xl bg-white hover:border-blue-300 transition-colors">
                      <div className="flex gap-2 mb-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <Input
                          value={milestone.title}
                          onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                          placeholder={`Step ${index + 1}: What will you do?`}
                          className="flex-1 rounded-lg font-medium"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMilestone(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          aria-label={`Remove milestone ${index + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="ml-10 space-y-2">
                        <Textarea
                          value={milestone.description || ''}
                          onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                          placeholder="Describe this step in detail (optional)"
                          className="rounded-lg text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={milestone.due_date || ''}
                            onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                            placeholder="Due date"
                            min={new Date().toISOString().split('T')[0]}
                            className="rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-6 border-t mt-6">
            {saveError && (
              <div className="w-full mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {saveError}
              </div>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!formData.title.trim() || isSavingRef.current || saveMutation.isPending) return;
                isSavingRef.current = true;
                setSaveError(null);
                saveMutation.mutate(formData);
              }}
              disabled={!formData.title.trim() || isSavingRef.current || saveMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {saveMutation.isPending ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}