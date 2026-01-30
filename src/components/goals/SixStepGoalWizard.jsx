import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, Target, Brain, AlertTriangle, Map, TrendingUp, RefreshCw, Lightbulb, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const STEPS = [
  { 
    id: 1, 
    title: 'Define Problem', 
    icon: Brain,
    description: 'Understand the current situation and its impact'
  },
  { 
    id: 2, 
    title: 'Set SMART Goal', 
    icon: Target,
    description: 'Create a clear, measurable objective'
  },
  { 
    id: 3, 
    title: 'Identify Obstacles', 
    icon: AlertTriangle,
    description: 'Recognize barriers and cognitive distortions'
  },
  { 
    id: 4, 
    title: 'Develop Action Plan', 
    icon: Map,
    description: 'Create strategies with CBT techniques'
  },
  { 
    id: 5, 
    title: 'Set Up Tracking', 
    icon: TrendingUp,
    description: 'Define metrics and check-ins'
  },
  { 
    id: 6, 
    title: 'Schedule Reviews', 
    icon: RefreshCw,
    description: 'Plan regular evaluation and adjustment'
  }
];

export default function SixStepGoalWizard({ onComplete, onCancel, existingGoal = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goalData, setGoalData] = useState({
    title: existingGoal?.title || '',
    category: existingGoal?.category || 'behavioral',
    target_date: existingGoal?.target_date || '',
    problem_definition: existingGoal?.problem_definition || {
      situation: '',
      impact: '',
      thoughts: '',
      emotions: [],
      behaviors: ''
    },
    smart_criteria: existingGoal?.smart_criteria || {
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      time_bound: ''
    },
    obstacles: existingGoal?.obstacles || {
      identified_obstacles: [],
      automatic_thoughts: [],
      cognitive_distortions: [],
      core_beliefs: '',
      balanced_thoughts: []
    },
    action_plan: existingGoal?.action_plan || {
      strategies: [],
      coping_skills: [],
      alternative_behaviors: [],
      support_system: []
    },
    milestones: existingGoal?.milestones || [],
    tracking: existingGoal?.tracking || {
      daily_check_ins: [],
      quantitative_metrics: []
    },
    review_and_adjust: existingGoal?.review_and_adjust || {
      review_schedule: 'weekly',
      reviews: []
    },
    motivation: existingGoal?.motivation || ''
  });

  const [tempInputs, setTempInputs] = useState({
    emotion: '',
    obstacle: '',
    automaticThought: '',
    distortion: '',
    balancedThought: '',
    strategy: '',
    copingSkill: '',
    alternativeBehavior: '',
    support: '',
    milestone: '',
    metricName: ''
  });

  const updateField = (path, value) => {
    setGoalData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addToArray = (path, value) => {
    if (!value.trim()) return;
    setGoalData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      const arrayKey = keys[keys.length - 1];
      current[arrayKey] = [...(current[arrayKey] || []), value];
      return newData;
    });
  };

  const removeFromArray = (path, index) => {
    setGoalData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      const arrayKey = keys[keys.length - 1];
      current[arrayKey] = current[arrayKey].filter((_, i) => i !== index);
      return newData;
    });
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (existingGoal) {
        await base44.entities.Goal.update(existingGoal.id, goalData);
      } else {
        await base44.entities.Goal.create({
          ...goalData,
          status: 'active',
          progress: 0
        });
      }
      onComplete();
    } catch (error) {
      console.error('Failed to save goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Current Situation</Label>
              <Textarea
                value={goalData.problem_definition.situation}
                onChange={(e) => updateField('problem_definition.situation', e.target.value)}
                placeholder="Describe the problem or situation you want to address..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Impact on Your Life</Label>
              <Textarea
                value={goalData.problem_definition.impact}
                onChange={(e) => updateField('problem_definition.impact', e.target.value)}
                placeholder="How does this affect your daily life, relationships, work, or well-being?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Your Thoughts About This</Label>
              <Textarea
                value={goalData.problem_definition.thoughts}
                onChange={(e) => updateField('problem_definition.thoughts', e.target.value)}
                placeholder="What thoughts go through your mind regarding this situation?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Emotions You Experience</Label>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.emotion}
                  onChange={(e) => setTempInputs({ ...tempInputs, emotion: e.target.value })}
                  placeholder="e.g., anxious, frustrated, sad"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('problem_definition.emotions', tempInputs.emotion);
                      setTempInputs({ ...tempInputs, emotion: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('problem_definition.emotions', tempInputs.emotion);
                    setTempInputs({ ...tempInputs, emotion: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {goalData.problem_definition.emotions.map((emotion, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {emotion}
                    <button onClick={() => removeFromArray('problem_definition.emotions', i)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Behaviors</Label>
              <Textarea
                value={goalData.problem_definition.behaviors}
                onChange={(e) => updateField('problem_definition.behaviors', e.target.value)}
                placeholder="How do you currently respond to or cope with this situation?"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Goal Title</Label>
              <Input
                value={goalData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Brief, clear goal title"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={goalData.category}
                onValueChange={(value) => updateField('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="emotional">Emotional</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="cognitive">Cognitive</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                SMART Criteria
              </h4>

              <div className="space-y-2">
                <Label>Specific: What exactly will you accomplish?</Label>
                <Textarea
                  value={goalData.smart_criteria.specific}
                  onChange={(e) => updateField('smart_criteria.specific', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Measurable: How will you track progress?</Label>
                <Textarea
                  value={goalData.smart_criteria.measurable}
                  onChange={(e) => updateField('smart_criteria.measurable', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Achievable: Why is this realistic?</Label>
                <Textarea
                  value={goalData.smart_criteria.achievable}
                  onChange={(e) => updateField('smart_criteria.achievable', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Relevant: Why does this matter to you?</Label>
                <Textarea
                  value={goalData.smart_criteria.relevant}
                  onChange={(e) => updateField('smart_criteria.relevant', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Time-Bound: When will you achieve this?</Label>
                <Input
                  type="date"
                  value={goalData.target_date}
                  onChange={(e) => updateField('target_date', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Personal Motivation</Label>
              <Textarea
                value={goalData.motivation}
                onChange={(e) => updateField('motivation', e.target.value)}
                placeholder="Why is achieving this goal important to you?"
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Potential Obstacles</Label>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.obstacle}
                  onChange={(e) => setTempInputs({ ...tempInputs, obstacle: e.target.value })}
                  placeholder="What might get in the way?"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('obstacles.identified_obstacles', tempInputs.obstacle);
                      setTempInputs({ ...tempInputs, obstacle: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('obstacles.identified_obstacles', tempInputs.obstacle);
                    setTempInputs({ ...tempInputs, obstacle: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-1 mt-2">
                {goalData.obstacles.identified_obstacles.map((obs, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{obs}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromArray('obstacles.identified_obstacles', i)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Automatic Negative Thoughts</Label>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.automaticThought}
                  onChange={(e) => setTempInputs({ ...tempInputs, automaticThought: e.target.value })}
                  placeholder="e.g., 'I'll never succeed at this'"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('obstacles.automatic_thoughts', tempInputs.automaticThought);
                      setTempInputs({ ...tempInputs, automaticThought: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('obstacles.automatic_thoughts', tempInputs.automaticThought);
                    setTempInputs({ ...tempInputs, automaticThought: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-1 mt-2">
                {goalData.obstacles.automatic_thoughts.map((thought, i) => (
                  <div key={i} className="flex items-center justify-between bg-red-50 p-2 rounded">
                    <span className="text-sm">{thought}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromArray('obstacles.automatic_thoughts', i)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cognitive Distortions</Label>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.distortion}
                  onChange={(e) => setTempInputs({ ...tempInputs, distortion: e.target.value })}
                  placeholder="e.g., all-or-nothing thinking, catastrophizing"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('obstacles.cognitive_distortions', tempInputs.distortion);
                      setTempInputs({ ...tempInputs, distortion: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('obstacles.cognitive_distortions', tempInputs.distortion);
                    setTempInputs({ ...tempInputs, distortion: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {goalData.obstacles.cognitive_distortions.map((dist, i) => (
                  <Badge key={i} variant="outline" className="gap-1">
                    {dist}
                    <button onClick={() => removeFromArray('obstacles.cognitive_distortions', i)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Core Beliefs</Label>
              <Textarea
                value={goalData.obstacles.core_beliefs}
                onChange={(e) => updateField('obstacles.core_beliefs', e.target.value)}
                placeholder="What deeper beliefs might be holding you back? (e.g., 'I'm not capable', 'I don't deserve success')"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Balanced Alternative Thoughts</Label>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.balancedThought}
                  onChange={(e) => setTempInputs({ ...tempInputs, balancedThought: e.target.value })}
                  placeholder="More realistic, helpful perspective"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('obstacles.balanced_thoughts', tempInputs.balancedThought);
                      setTempInputs({ ...tempInputs, balancedThought: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('obstacles.balanced_thoughts', tempInputs.balancedThought);
                    setTempInputs({ ...tempInputs, balancedThought: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-1 mt-2">
                {goalData.obstacles.balanced_thoughts.map((thought, i) => (
                  <div key={i} className="flex items-center justify-between bg-green-50 p-2 rounded">
                    <span className="text-sm">{thought}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromArray('obstacles.balanced_thoughts', i)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Action Strategies</Label>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.strategy}
                  onChange={(e) => setTempInputs({ ...tempInputs, strategy: e.target.value })}
                  placeholder="Specific action or behavioral experiment"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('action_plan.strategies', { strategy: tempInputs.strategy, cbt_technique: '', behavioral_experiment: '' });
                      setTempInputs({ ...tempInputs, strategy: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('action_plan.strategies', { strategy: tempInputs.strategy, cbt_technique: '', behavioral_experiment: '' });
                    setTempInputs({ ...tempInputs, strategy: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {goalData.action_plan.strategies.map((strat, i) => (
                  <div key={i} className="bg-blue-50 p-3 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{strat.strategy}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromArray('action_plan.strategies', i)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Coping Skills & Emotion Regulation</Label>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.copingSkill}
                  onChange={(e) => setTempInputs({ ...tempInputs, copingSkill: e.target.value })}
                  placeholder="e.g., deep breathing, grounding, journaling"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('action_plan.coping_skills', tempInputs.copingSkill);
                      setTempInputs({ ...tempInputs, copingSkill: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('action_plan.coping_skills', tempInputs.copingSkill);
                    setTempInputs({ ...tempInputs, copingSkill: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {goalData.action_plan.coping_skills.map((skill, i) => (
                  <Badge key={i} className="gap-1">
                    {skill}
                    <button onClick={() => removeFromArray('action_plan.coping_skills', i)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alternative Behaviors</Label>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.alternativeBehavior}
                  onChange={(e) => setTempInputs({ ...tempInputs, alternativeBehavior: e.target.value })}
                  placeholder="New behaviors to replace old patterns"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('action_plan.alternative_behaviors', tempInputs.alternativeBehavior);
                      setTempInputs({ ...tempInputs, alternativeBehavior: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('action_plan.alternative_behaviors', tempInputs.alternativeBehavior);
                    setTempInputs({ ...tempInputs, alternativeBehavior: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-1 mt-2">
                {goalData.action_plan.alternative_behaviors.map((behavior, i) => (
                  <div key={i} className="flex items-center justify-between bg-purple-50 p-2 rounded">
                    <span className="text-sm">{behavior}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromArray('action_plan.alternative_behaviors', i)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Support System</Label>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.support}
                  onChange={(e) => setTempInputs({ ...tempInputs, support: e.target.value })}
                  placeholder="People or resources to help"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('action_plan.support_system', tempInputs.support);
                      setTempInputs({ ...tempInputs, support: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('action_plan.support_system', tempInputs.support);
                    setTempInputs({ ...tempInputs, support: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {goalData.action_plan.support_system.map((support, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {support}
                    <button onClick={() => removeFromArray('action_plan.support_system', i)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Milestones & Metrics</h4>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.milestone}
                  onChange={(e) => setTempInputs({ ...tempInputs, milestone: e.target.value })}
                  placeholder="Milestone title"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('milestones', { 
                        title: tempInputs.milestone, 
                        completed: false,
                        quantitative_metric: null
                      });
                      setTempInputs({ ...tempInputs, milestone: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('milestones', { 
                      title: tempInputs.milestone, 
                      completed: false,
                      quantitative_metric: null
                    });
                    setTempInputs({ ...tempInputs, milestone: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {goalData.milestones.map((milestone, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{milestone.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromArray('milestones', i)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Tracking Metrics</h4>
              <div className="flex gap-2">
                <Input
                  value={tempInputs.metricName}
                  onChange={(e) => setTempInputs({ ...tempInputs, metricName: e.target.value })}
                  placeholder="Metric name (e.g., 'Anxiety level', 'Exercise frequency')"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('tracking.quantitative_metrics', { 
                        metric_name: tempInputs.metricName,
                        frequency: 'daily',
                        data_points: []
                      });
                      setTempInputs({ ...tempInputs, metricName: '' });
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addToArray('tracking.quantitative_metrics', { 
                      metric_name: tempInputs.metricName,
                      frequency: 'daily',
                      data_points: []
                    });
                    setTempInputs({ ...tempInputs, metricName: '' });
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {goalData.tracking.quantitative_metrics.map((metric, i) => (
                  <div key={i} className="bg-blue-50 p-3 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.metric_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromArray('tracking.quantitative_metrics', i)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">Daily Check-Ins</h4>
              <p className="text-sm text-amber-800">
                After saving your goal, you'll be able to log daily check-ins including:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-800 mt-2 space-y-1">
                <li>Effort rating (1-10)</li>
                <li>Mood rating (1-10)</li>
                <li>Progress notes</li>
                <li>Obstacles faced</li>
                <li>Coping strategies used</li>
              </ul>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Review Schedule</Label>
              <Select
                value={goalData.review_and_adjust.review_schedule}
                onValueChange={(value) => updateField('review_and_adjust.review_schedule', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Every Two Weeks</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Regular Reviews Include:</h4>
              <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                <li>Progress assessment</li>
                <li>What's working well</li>
                <li>What needs adjustment</li>
                <li>Cognitive shifts noticed</li>
                <li>Plan modifications</li>
                <li>AI-generated insights from your conversations</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI-Powered Goal Support
              </h4>
              <p className="text-sm text-purple-800">
                Our AI agents will monitor your progress through conversations and can:
              </p>
              <ul className="list-disc list-inside text-sm text-purple-800 mt-2 space-y-1">
                <li>Suggest adjustments based on patterns</li>
                <li>Identify obstacles you mention</li>
                <li>Recommend relevant CBT techniques</li>
                <li>Track cognitive shifts over time</li>
                <li>Celebrate milestones with you</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Goal:</strong> {goalData.title || 'Not set'}</p>
                <p><strong>Category:</strong> {goalData.category}</p>
                <p><strong>Target Date:</strong> {goalData.target_date || 'Not set'}</p>
                <p><strong>Obstacles Identified:</strong> {goalData.obstacles.identified_obstacles.length}</p>
                <p><strong>Strategies:</strong> {goalData.action_plan.strategies.length}</p>
                <p><strong>Milestones:</strong> {goalData.milestones.length}</p>
                <p><strong>Review Schedule:</strong> {goalData.review_and_adjust.review_schedule}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return goalData.problem_definition.situation.trim().length > 0;
      case 2:
        return goalData.title.trim().length > 0 && goalData.smart_criteria.specific.trim().length > 0;
      case 3:
        return goalData.obstacles.identified_obstacles.length > 0 || goalData.obstacles.automatic_thoughts.length > 0;
      case 4:
        return goalData.action_plan.strategies.length > 0;
      case 5:
        return goalData.milestones.length > 0;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const StepIcon = STEPS[currentStep - 1].icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <StepIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Step {currentStep} of 6: {STEPS[currentStep - 1].title}</CardTitle>
                <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <Progress value={(currentStep / 6) * 100} className="h-2" />
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <div className="p-6 border-t flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {currentStep < 6 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !isStepValid()}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isSubmitting ? 'Saving...' : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete Goal Setup
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}