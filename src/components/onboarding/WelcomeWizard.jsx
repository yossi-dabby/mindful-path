import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Sparkles, Heart, Target, BookOpen, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import IllustrationCard from '../shared/IllustrationCard';

const focusAreas = [
  { value: 'stress', label: 'Stress Management', icon: '🧘', color: 'from-blue-400 to-cyan-400' },
  { value: 'anxiety', label: 'Anxiety Relief', icon: '💆', color: 'from-purple-400 to-pink-400' },
  { value: 'sleep', label: 'Better Sleep', icon: '😴', color: 'from-indigo-400 to-blue-400' },
  { value: 'mood', label: 'Mood Improvement', icon: '😊', color: 'from-green-400 to-teal-400' },
  { value: 'focus', label: 'Focus & Clarity', icon: '🎯', color: 'from-orange-400 to-red-400' },
  { value: 'relationships', label: 'Relationships', icon: '💝', color: 'from-pink-400 to-rose-400' }
];

export default function WelcomeWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    focus_areas: [],
    goals: '',
    experience_level: ''
  });
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        ...user,
        onboarding_completed: true,
        focus_areas: data.focus_areas,
        onboarding_goals: data.goals,
        experience_level: data.experience_level
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      onComplete();
    }
  });

  const toggleFocusArea = (value) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(value)
        ? prev.focus_areas.filter(a => a !== value)
        : [...prev.focus_areas, value]
    }));
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return formData.focus_areas.length > 0;
    if (step === 3) return formData.experience_level;
    return true;
  };

  const handleComplete = () => {
    completeMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-100 via-white to-blue-100 overflow-y-auto" style={{ zIndex: 60 }}>
      <div className="min-h-screen flex items-center justify-center p-4 pb-24">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <IllustrationCard
                  type="wellness"
                  title="Welcome to Mindful Path"
                  description="Your personal companion for mental wellness, combining mindfulness, CBT techniques, and AI-powered insights to support your journey."
                  animate={false}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg">
                        <Target className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">Goal Tracking</p>
                          <p className="text-xs text-gray-600">Set and achieve your wellness goals</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
                        <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">CBT Journaling</p>
                          <p className="text-xs text-gray-600">Challenge negative thoughts</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-purple-50 p-3 rounded-lg">
                        <Activity className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">Mood Tracking</p>
                          <p className="text-xs text-gray-600">Understand your patterns</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-pink-50 p-3 rounded-lg">
                        <Sparkles className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">AI Coach</p>
                          <p className="text-xs text-gray-600">Personalized guidance</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setStep(2)}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 py-6 text-lg"
                    >
                      Get Started
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </IllustrationCard>
              </motion.div>
            )}

            {/* Step 2: Focus Areas */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-0 shadow-2xl bg-white">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-semibold text-gray-800 mb-3">
                        What would you like to focus on?
                      </h2>
                      <p className="text-gray-600">
                        Select one or more areas (you can change this later)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {focusAreas.map((area) => (
                        <button
                          key={area.value}
                          onClick={() => toggleFocusArea(area.value)}
                          className={cn(
                            "p-6 rounded-2xl border-2 transition-all hover:scale-105",
                            formData.focus_areas.includes(area.value)
                              ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-pink-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          )}
                        >
                          <div className="text-4xl mb-3">{area.icon}</div>
                          <p className="font-semibold text-gray-800">{area.label}</p>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 py-6"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        disabled={!canProceed()}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 py-6"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Experience Level */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-0 shadow-2xl bg-white">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-semibold text-gray-800 mb-3">
                        How familiar are you with mindfulness?
                      </h2>
                      <p className="text-gray-600">
                        This helps us tailor your experience
                      </p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {[
                        { value: 'beginner', label: 'Just Starting', desc: "I'm new to mindfulness and CBT" },
                        { value: 'intermediate', label: 'Some Experience', desc: "I've tried meditation or therapy before" },
                        { value: 'advanced', label: 'Regular Practice', desc: "I practice mindfulness regularly" }
                      ].map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setFormData({ ...formData, experience_level: level.value })}
                          className={cn(
                            "w-full p-6 rounded-2xl border-2 text-left transition-all hover:scale-102",
                            formData.experience_level === level.value
                              ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-pink-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          )}
                        >
                          <p className="font-semibold text-gray-800 mb-1">{level.label}</p>
                          <p className="text-sm text-gray-600">{level.desc}</p>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1 py-6"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handleComplete}
                        disabled={!canProceed() || completeMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 py-6"
                      >
                        {completeMutation.isPending ? 'Setting up...' : 'Complete Setup'}
                        <Sparkles className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-6" dir="ltr">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  s === step ? 'bg-orange-500 w-8' : 'bg-gray-300'
                )}
                role="progressbar"
                aria-valuenow={step}
                aria-valuemin={1}
                aria-valuemax={3}
                aria-label={`Step ${s} of 3`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}