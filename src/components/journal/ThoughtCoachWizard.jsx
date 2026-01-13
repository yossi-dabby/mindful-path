import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, ChevronLeft, Sparkles, Brain, Frown, AlertCircle, Zap, Flame, Users, Target, Cloud, HeartCrack, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const thoughtTypes = [
  {
    type: 'fear_anxiety',
    label: 'Fear / Anxiety',
    description: 'Worried about the future, feeling nervous or scared',
    icon: Frown,
    color: '#9F7AEA',
    bgColor: 'rgba(159, 122, 234, 0.15)'
  },
  {
    type: 'self_criticism',
    label: 'Self-Criticism / Failure',
    description: 'Harsh self-judgment, feeling like you failed',
    icon: AlertCircle,
    color: '#ED8936',
    bgColor: 'rgba(237, 137, 54, 0.15)'
  },
  {
    type: 'catastrophizing',
    label: 'Catastrophizing',
    description: 'Expecting the worst possible outcome',
    icon: Zap,
    color: '#F56565',
    bgColor: 'rgba(245, 101, 101, 0.15)'
  },
  {
    type: 'guilt_shame',
    label: 'Guilt / Shame',
    description: 'Feeling bad about something you did or who you are',
    icon: HeartCrack,
    color: '#805AD5',
    bgColor: 'rgba(128, 90, 213, 0.15)'
  },
  {
    type: 'anger_resentment',
    label: 'Anger / Resentment',
    description: 'Frustrated, upset, or holding a grudge',
    icon: Flame,
    color: '#E53E3E',
    bgColor: 'rgba(229, 62, 62, 0.15)'
  },
  {
    type: 'social_anxiety',
    label: 'Social Anxiety',
    description: 'Worried about what others think or social situations',
    icon: Users,
    color: '#4299E1',
    bgColor: 'rgba(66, 153, 225, 0.15)'
  },
  {
    type: 'perfectionism',
    label: 'Perfectionism',
    description: 'Setting impossible standards, fear of mistakes',
    icon: Target,
    color: '#38B2AC',
    bgColor: 'rgba(56, 178, 172, 0.15)'
  },
  {
    type: 'overthinking',
    label: 'Overthinking / Uncertainty',
    description: 'Can\'t stop analyzing, stuck in loops, confused',
    icon: Cloud,
    color: '#718096',
    bgColor: 'rgba(113, 128, 150, 0.15)'
  },
  {
    type: 'hopelessness',
    label: 'Hopelessness',
    description: 'Feeling like nothing will get better',
    icon: HeartCrack,
    color: '#2D3748',
    bgColor: 'rgba(45, 55, 72, 0.15)'
  },
  {
    type: 'other',
    label: 'Other / Free Thought',
    description: 'Something else, or just want to journal freely',
    icon: HelpCircle,
    color: '#26A69A',
    bgColor: 'rgba(38, 166, 154, 0.15)'
  }
];

const emotionOptions = [
  'anxious', 'worried', 'sad', 'angry', 'frustrated', 'guilty', 'ashamed',
  'hopeless', 'overwhelmed', 'confused', 'scared', 'lonely', 'disappointed'
];

export default function ThoughtCoachWizard({ onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    thought_type: '',
    situation: '',
    automatic_thoughts: '',
    emotions: [],
    emotion_intensity: 5,
    balanced_thought: ''
  });

  const createJournalMutation = useMutation({
    mutationFn: async (data) => {
      // Validate data
      if (!data.thought_type || !data.situation || !data.automatic_thoughts || !data.emotions.length) {
        throw new Error('Please fill in all required fields');
      }

      // Create journal entry directly
      const journalData = {
        entry_type: 'cbt_standard',
        situation: data.situation,
        automatic_thoughts: data.automatic_thoughts,
        emotions: data.emotions,
        emotion_intensity: data.emotion_intensity,
        tags: [data.thought_type]
      };

      // Add balanced_thought only if provided
      if (data.balanced_thought && data.balanced_thought.trim()) {
        journalData.balanced_thought = data.balanced_thought.trim();
      }

      const entry = await base44.entities.ThoughtJournal.create(journalData);
      
      if (!entry || !entry.id) {
        throw new Error('Failed to create journal entry');
      }

      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['thoughtJournals']);
      onClose();
    },
    onError: (error) => {
      console.error('Journal creation error:', error);
    }
  });

  const toggleEmotion = (emotion) => {
    const updated = formData.emotions.includes(emotion)
      ? formData.emotions.filter(e => e !== emotion)
      : [...formData.emotions, emotion];
    setFormData({ ...formData, emotions: updated });
  };

  const canProceed = () => {
    if (step === 1) return formData.thought_type;
    if (step === 2) return formData.situation && formData.automatic_thoughts && formData.emotions.length > 0;
    if (step === 3) return true; // CBT step - balanced_thought is optional
    if (step === 4) return true; // Review - all validation done
    return false;
  };

  const handleSubmit = () => {
    // Prevent double submission
    if (createJournalMutation.isPending) return;

    // Final validation
    if (!formData.thought_type || !formData.situation?.trim() || !formData.automatic_thoughts?.trim() || !formData.emotions.length) {
      return;
    }

    createJournalMutation.mutate({
      ...formData,
      situation: formData.situation.trim(),
      automatic_thoughts: formData.automatic_thoughts.trim()
    });
  };

  const selectedThought = thoughtTypes.find(t => t.type === formData.thought_type);

  return (
    <div className="min-h-[calc(100vh-4rem)] md:min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 w-full overflow-x-hidden">
      {/* Header - Sticky on mobile */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10 flex-shrink-0 overflow-x-hidden">
        <div className="max-w-2xl mx-auto p-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Thought Coach</h1>
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
          {/* Step 1: Select Thought Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">What type of thought would you like to work on?</h3>
                <p className="text-sm text-gray-600 mb-4">Choose the category that best matches your current experience</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {thoughtTypes.map((thought) => {
                  const Icon = thought.icon;
                  return (
                    <button
                      key={thought.type}
                      onClick={() => setFormData({ ...formData, thought_type: thought.type })}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg',
                        formData.thought_type === thought.type
                          ? 'border-purple-400 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: thought.color }}
                        >
                          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{thought.label}</h4>
                          <p className="text-xs text-gray-600 mt-1">{thought.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Describe the Thought */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tell me about this thought</h3>
                <p className="text-sm text-gray-600 mb-4">Let's explore what's happening</p>
              </div>

              {selectedThought && (
                <Card className="border-2 border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: selectedThought.color }}
                      >
                        <selectedThought.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedThought.label}</p>
                        <p className="text-xs text-gray-600">{selectedThought.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What situation triggered this thought?
                </label>
                <Textarea
                  value={formData.situation}
                  onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                  placeholder="Describe the situation, event, or moment that triggered this thought..."
                  className="h-32 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What are the automatic thoughts going through your mind?
                </label>
                <Textarea
                  value={formData.automatic_thoughts}
                  onChange={(e) => setFormData({ ...formData, automatic_thoughts: e.target.value })}
                  placeholder="Write down the thoughts exactly as they appear in your mind..."
                  className="h-32 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  What emotions are you feeling? (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {emotionOptions.map((emotion) => (
                    <Badge
                      key={emotion}
                      onClick={() => toggleEmotion(emotion)}
                      className={cn(
                        'cursor-pointer capitalize transition-all',
                        formData.emotions.includes(emotion)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  How intense are these emotions? ({formData.emotion_intensity}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.emotion_intensity}
                  onChange={(e) => setFormData({ ...formData, emotion_intensity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Mild</span>
                  <span>Intense</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: CBT Intervention */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Let's look at this thought together</h3>
                <p className="text-sm text-gray-600 mb-4">Examining your thoughts is an important CBT skill</p>
              </div>

              {selectedThought && (
                <Card className="border-2 border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: selectedThought.color }}
                      >
                        <selectedThought.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedThought.label}</p>
                        <p className="text-xs text-gray-600 mt-1 italic">"{formData.automatic_thoughts}"</p>
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
                      <p>What evidence supports this thought?</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <p>What evidence goes against it?</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <p>Is there a more balanced way to see this situation?</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-sm text-purple-800 text-center">
                  💡 Noticing and examining a thought is already an important CBT skill.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Balanced / Helpful Thought (Optional)
                </label>
                <Textarea
                  value={formData.balanced_thought}
                  onChange={(e) => setFormData({ ...formData, balanced_thought: e.target.value })}
                  placeholder="Write a more balanced or helpful perspective... (e.g., 'I can prepare and even if I don't succeed perfectly, it doesn't define me.')"
                  className="h-32 rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This is optional - you can always add it later in your journal.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Review your thought entry</h3>
                <p className="text-sm text-gray-600 mb-4">Check everything before saving to your journal</p>
              </div>

              {selectedThought && (
                <Card className="border-2 border-purple-200 bg-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: selectedThought.color }}
                      >
                        <selectedThought.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedThought.label}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">Situation:</span>
                        <p className="text-gray-800 mt-1">{formData.situation}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Thoughts:</span>
                        <p className="text-gray-800 mt-1">{formData.automatic_thoughts}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Emotions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.emotions.map((emotion) => (
                            <Badge key={emotion} variant="secondary" className="text-xs capitalize">
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Intensity:</span>
                        <span className="text-gray-800 ml-2">{formData.emotion_intensity}/10</span>
                      </div>
                      {formData.balanced_thought && formData.balanced_thought.trim() && (
                        <div>
                          <span className="text-gray-600 font-medium">Balanced Thought:</span>
                          <p className="text-gray-800 mt-1">{formData.balanced_thought}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-900 font-medium mb-1">What happens next?</p>
                    <p className="text-sm text-green-700">
                      This entry will be saved to your journal. You can come back later to add balanced thoughts, 
                      identify cognitive distortions, and track your progress over time.
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
                disabled={createJournalMutation.isPending}
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
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || createJournalMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {createJournalMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Saving Entry...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Save to Journal
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Error Display */}
          {createJournalMutation.isError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Failed to save journal entry. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}