import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronRight, Sparkles, Brain, Frown, AlertCircle, Zap, Flame, Users, Target, Cloud, HeartCrack, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const thoughtTypesMeta = [
  { type: 'fear_anxiety', icon: Frown, color: '#9F7AEA', bgColor: 'rgba(159, 122, 234, 0.15)' },
  { type: 'self_criticism', icon: AlertCircle, color: '#ED8936', bgColor: 'rgba(237, 137, 54, 0.15)' },
  { type: 'catastrophizing', icon: Zap, color: '#F56565', bgColor: 'rgba(245, 101, 101, 0.15)' },
  { type: 'guilt_shame', icon: HeartCrack, color: '#805AD5', bgColor: 'rgba(128, 90, 213, 0.15)' },
  { type: 'anger_resentment', icon: Flame, color: '#E53E3E', bgColor: 'rgba(229, 62, 62, 0.15)' },
  { type: 'social_anxiety', icon: Users, color: '#4299E1', bgColor: 'rgba(66, 153, 225, 0.15)' },
  { type: 'perfectionism', icon: Target, color: '#38B2AC', bgColor: 'rgba(56, 178, 172, 0.15)' },
  { type: 'overthinking', icon: Cloud, color: '#718096', bgColor: 'rgba(113, 128, 150, 0.15)' },
  { type: 'hopelessness', icon: HeartCrack, color: '#2D3748', bgColor: 'rgba(45, 55, 72, 0.15)' },
  { type: 'other', icon: HelpCircle, color: '#26A69A', bgColor: 'rgba(38, 166, 154, 0.15)' }
];

const emotionKeys = [
  'anxious', 'worried', 'sad', 'angry', 'frustrated', 'guilty', 'ashamed',
  'hopeless', 'overwhelmed', 'confused', 'scared', 'lonely', 'disappointed'
];

export default function ThoughtCoachPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const thoughtTypes = thoughtTypesMeta.map((meta) => ({
    ...meta,
    label: t(`thought_coach.thought_types.${meta.type}.label`),
    description: t(`thought_coach.thought_types.${meta.type}.description`)
  }));

  const createJournalMutation = useMutation({
    mutationFn: async (data) => {
      if (!data.thought_type || !data.situation || !data.automatic_thoughts || !data.emotions.length) {
        throw new Error('Please fill in all required fields');
      }

      const journalData = {
        entry_type: 'cbt_standard',
        situation: data.situation,
        automatic_thoughts: data.automatic_thoughts,
        emotions: data.emotions,
        emotion_intensity: data.emotion_intensity,
        tags: [data.thought_type]
      };

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
      navigate(-1);
    },
    onError: (error) => {
      console.error('Journal creation error:', error);
    }
  });

  const toggleEmotion = (emotion) => {
    setFormData(prev => {
      const updated = prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion];
      return { ...prev, emotions: updated };
    });
  };

  const canProceed = () => {
    if (step === 1) return !!formData.thought_type;
    if (step === 2) return formData.situation?.trim().length > 0 && formData.automatic_thoughts?.trim().length > 0 && formData.emotions.length > 0;
    if (step === 3) return true;
    if (step === 4) return true;
    return false;
  };

  const handleSubmit = () => {
    if (createJournalMutation.isPending) return;
    if (!formData.thought_type || !formData.situation?.trim() || !formData.automatic_thoughts?.trim() || !formData.emotions.length) {
      return;
    }

    createJournalMutation.mutate({
      ...formData,
      situation: formData.situation.trim(),
      automatic_thoughts: formData.automatic_thoughts.trim()
    });
  };

  const selectedThought = thoughtTypes.find(thought => thought.type === formData.thought_type);

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 w-full overflow-x-hidden" style={{ zIndex: 70, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 flex-shrink-0 overflow-x-hidden" style={{ zIndex: 10 }}>
        <div className="max-w-2xl mx-auto p-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">{t('thought_coach.title')}</h1>
                <p className="text-sm text-gray-500">{t('thought_coach.step_label', { step })}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} aria-label={step > 1 ? t('thought_coach.go_back_step_aria') : t('thought_coach.go_back_nav_aria')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'none' }}>
        <div className="max-w-2xl mx-auto p-4 md:p-6 pb-32 w-full">
          {/* Step 1: Select Thought Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('thought_coach.step_thought_type_title')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('thought_coach.step_thought_type_subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {thoughtTypes.map((thought) => {
                  const Icon = thought.icon;
                  return (
                    <button
                      key={thought.type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, thought_type: thought.type }))}
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('thought_coach.step_details_title')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('thought_coach.step_details_subtitle')}</p>
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
                  {t('thought_coach.step_details_situation_label')} <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.situation}
                  onChange={(e) => setFormData(prev => ({ ...prev, situation: e.target.value }))}
                  placeholder={t('thought_coach.step_details_situation_placeholder')}
                  className="h-32 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('thought_coach.step_details_thoughts_label')} <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.automatic_thoughts}
                  onChange={(e) => setFormData(prev => ({ ...prev, automatic_thoughts: e.target.value }))}
                  placeholder={t('thought_coach.step_details_thoughts_placeholder')}
                  className="h-32 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  {t('thought_coach.step_details_emotions_label')} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {emotionKeys.map((emotion) => (
                    <Badge
                      key={emotion}
                      onClick={() => toggleEmotion(emotion)}
                      className={cn(
                        'cursor-pointer transition-all',
                        formData.emotions.includes(emotion)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {t(`thought_coach.emotion_options.${emotion}`)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('thought_coach.step_intensity_label', { value: formData.emotion_intensity })}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.emotion_intensity}
                  onChange={(e) => setFormData(prev => ({ ...prev, emotion_intensity: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{t('thought_coach.step_intensity_mild')}</span>
                  <span>{t('thought_coach.step_intensity_intense')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: CBT Intervention */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('thought_coach.step_analysis_title')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('thought_coach.step_analysis_subtitle')}</p>
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
                  <p className="text-sm font-medium text-blue-900 mb-3">{t('thought_coach.reflect_questions_label')}</p>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <p>{t('thought_coach.reflect_q1')}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <p>{t('thought_coach.reflect_q2')}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-600">•</span>
                      <p>{t('thought_coach.reflect_q3')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-sm text-purple-800 text-center">
                  {t('thought_coach.step_analysis_cbt_note')}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('thought_coach.step_analysis_balanced_label')}
                </label>
                <Textarea
                  value={formData.balanced_thought}
                  onChange={(e) => setFormData(prev => ({ ...prev, balanced_thought: e.target.value }))}
                  placeholder={t('thought_coach.step_analysis_balanced_placeholder')}
                  className="h-32 rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {t('thought_coach.step_analysis_balanced_optional')}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('thought_coach.step_review_title')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('thought_coach.step_review_subtitle')}</p>
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
                        <span className="text-gray-600 font-medium">{t('thought_coach.field_situation')}</span>
                        <p className="text-gray-800 mt-1">{formData.situation}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">{t('thought_coach.field_thoughts')}</span>
                        <p className="text-gray-800 mt-1">{formData.automatic_thoughts}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">{t('thought_coach.field_emotions')}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.emotions.map((emotion) => (
                            <Badge key={emotion} variant="secondary" className="text-xs">
                              {t(`thought_coach.emotion_options.${emotion}`)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">{t('thought_coach.field_intensity')}</span>
                        <span className="text-gray-800 ml-2">{formData.emotion_intensity}/10</span>
                      </div>
                      {formData.balanced_thought && formData.balanced_thought.trim() && (
                        <div>
                          <span className="text-gray-600 font-medium">{t('thought_coach.field_balanced')}</span>
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
                    <p className="text-sm text-green-900 font-medium mb-1">{t('thought_coach.what_next_label')}</p>
                    <p className="text-sm text-green-700">
                      {t('thought_coach.what_next_text')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="bg-white border-t shadow-lg fixed bottom-0 left-0 right-0 flex-shrink-0 safe-bottom-nav" style={{ zIndex: 10 }}>
        <div className="max-w-2xl mx-auto p-4 w-full overflow-x-hidden">
          <div className="flex gap-3">
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {t('thought_coach.next_button')}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || createJournalMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {createJournalMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    {t('thought_coach.saving_button')}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    {t('thought_coach.save_button')}
                  </>
                )}
              </Button>
            )}
          </div>
          
          {createJournalMutation.isError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                {t('thought_coach.error_save')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}