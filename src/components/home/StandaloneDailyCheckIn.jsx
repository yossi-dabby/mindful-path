import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { isAuthError, shouldShowAuthError } from '../utils/authErrorHandler';
import AuthErrorBanner from '../utils/AuthErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronDown, ChevronUp, Edit2, Trash2, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const moodOptions = [
{ value: 'excellent', emoji: '😊', label: 'Excellent' },
{ value: 'good', emoji: '🙂', label: 'Good' },
{ value: 'okay', emoji: '😐', label: 'Okay' },
{ value: 'low', emoji: '😔', label: 'Low' },
{ value: 'very_low', emoji: '😢', label: 'Very Low' }];


const emotionCategories = {
  positive: [
  'Happy', 'Joyful', 'Peaceful', 'Grateful', 'Excited', 'Hopeful', 'Confident',
  'Proud', 'Content', 'Energized', 'Inspired', 'Loved', 'Optimistic', 'Relaxed',
  'Satisfied', 'Amused', 'Interested', 'Playful', 'Courageous', 'Compassionate'],

  intermediate: [
  'Uncertain', 'Confused', 'Curious', 'Surprised', 'Bored', 'Tired', 'Restless',
  'Indifferent', 'Neutral', 'Ambivalent', 'Pensive', 'Nostalgic', 'Wistful',
  'Distracted', 'Apathetic', 'Disconnected', 'Numb', 'Empty', 'Doubtful', 'Hesitant'],

  negative: [
  'Anxious', 'Sad', 'Angry', 'Frustrated', 'Stressed', 'Overwhelmed', 'Lonely',
  'Fearful', 'Guilty', 'Ashamed', 'Disappointed', 'Hopeless', 'Jealous', 'Resentful',
  'Irritated', 'Worried', 'Depressed', 'Helpless', 'Rejected', 'Insecure']

};

const categoryColors = {
  positive: { bg: 'bg-green-500', hover: 'hover:bg-green-600', selected: 'bg-green-600', text: 'text-white' },
  intermediate: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', selected: 'bg-orange-600', text: 'text-white' },
  negative: { bg: 'bg-red-500', hover: 'hover:bg-red-600', selected: 'bg-red-600', text: 'text-white' }
};

function StandaloneDailyCheckIn() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const [formData, setFormData] = useState({
    mood: '',
    mood_emoji: '',
    emotions: [],
    intensity: 50
  });
  const isSubmittingRef = useRef(false);

  // Check if today's check-in exists
  const { data: todayMood, isLoading } = useQuery({
    queryKey: ['todayMood'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const moods = await base44.entities.MoodEntry.filter({ date: today });
      return moods[0] || null;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isSubmittingRef.current) {
        throw new Error('Already submitting');
      }
      isSubmittingRef.current = true;
      const today = new Date().toISOString().split('T')[0];

      // Save MoodEntry
      const moodEntry = await base44.entities.MoodEntry.create({
        date: today,
        mood: data.mood,
        emotions: data.emotions,
        intensity: data.intensity,
        energy_level: 'moderate',
        stress_level: Math.max(1, Math.min(10, Math.round((100 - data.intensity) / 10))),
        triggers: [],
        activities: [],
        notes: ''
      });

      // Update DailyFlow
      const flows = await base44.entities.DailyFlow.filter({ date: today });
      if (flows.length > 0) {
        await base44.entities.DailyFlow.update(flows[0].id, {
          check_in_completed: true,
          check_in_time: new Date().toISOString(),
          mood_snapshot: {
            mood: data.mood,
            emotions: data.emotions,
            intensity: data.intensity
          }
        });
      } else {
        await base44.entities.DailyFlow.create({
          date: today,
          check_in_completed: true,
          check_in_time: new Date().toISOString(),
          mood_snapshot: {
            mood: data.mood,
            emotions: data.emotions,
            intensity: data.intensity
          }
        });
      }

      return moodEntry;
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todayMood'] });
      await queryClient.cancelQueries({ queryKey: ['todayFlow'] });

      // Snapshot previous values
      const previousMood = queryClient.getQueryData(['todayMood']);
      const previousFlow = queryClient.getQueryData(['todayFlow']);

      // Optimistically update
      const today = new Date().toISOString().split('T')[0];
      const optimisticMood = {
        id: 'temp-' + Date.now(),
        date: today,
        mood: data.mood,
        emotions: data.emotions,
        intensity: data.intensity,
        energy_level: 'moderate',
        stress_level: Math.max(1, Math.min(10, Math.round((100 - data.intensity) / 10))),
        triggers: [],
        activities: [],
        notes: '',
        created_date: new Date().toISOString()
      };

      queryClient.setQueryData(['todayMood'], optimisticMood);
      setStep(4);

      return { previousMood, previousFlow };
    },
    onSuccess: () => {
      isSubmittingRef.current = false;
    },
    onError: (error, variables, context) => {
      isSubmittingRef.current = false;
      // Rollback on error
      if (context?.previousMood !== undefined) {
        queryClient.setQueryData(['todayMood'], context.previousMood);
      }
      if (context?.previousFlow !== undefined) {
        queryClient.setQueryData(['todayFlow'], context.previousFlow);
      }
      setStep(3);
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMood'] });
      queryClient.invalidateQueries({ queryKey: ['todayFlow'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!todayMood || isSubmittingRef.current) return;
      await base44.entities.MoodEntry.delete(todayMood.id);

      // Also update DailyFlow
      const today = new Date().toISOString().split('T')[0];
      const flows = await base44.entities.DailyFlow.filter({ date: today });
      if (flows.length > 0) {
        await base44.entities.DailyFlow.update(flows[0].id, {
          check_in_completed: false,
          check_in_time: null,
          mood_snapshot: null
        });
      }
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todayMood'] });
      await queryClient.cancelQueries({ queryKey: ['todayFlow'] });

      // Snapshot previous values
      const previousMood = queryClient.getQueryData(['todayMood']);
      const previousFlow = queryClient.getQueryData(['todayFlow']);

      // Optimistically update
      queryClient.setQueryData(['todayMood'], null);
      setStep(1);
      setFormData({ mood: '', mood_emoji: '', emotions: [], intensity: 50 });

      return { previousMood, previousFlow };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMood !== undefined) {
        queryClient.setQueryData(['todayMood'], context.previousMood);
      }
      if (context?.previousFlow !== undefined) {
        queryClient.setQueryData(['todayFlow'], context.previousFlow);
      }
      if (context?.previousMood) {
        setStep(4);
      }
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todayMood'] });
      queryClient.invalidateQueries({ queryKey: ['todayFlow'] });
    }
  });

  const selectedMood = moodOptions.find((m) => m.value === formData.mood);

  const handleMoodSelect = (mood) => {
    setFormData({ ...formData, mood: mood.value, mood_emoji: mood.emoji });
  };

  const toggleEmotion = (emotion) => {
    setFormData((prev) => ({
      ...prev,
      emotions: prev.emotions.includes(emotion) ?
      prev.emotions.filter((e) => e !== emotion) :
      [...prev.emotions, emotion]
    }));
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      // Save data
      const dataToSave = {
        ...formData,
        timestamp: new Date().toISOString()
      };
      saveMutation.mutate(dataToSave);
    }
  };

  const handleReturn = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleEdit = () => {
    if (todayMood) {
      setFormData({
        mood: todayMood.mood,
        mood_emoji: moodOptions.find((m) => m.value === todayMood.mood)?.emoji || '',
        emotions: todayMood.emotions || [],
        intensity: todayMood.intensity || 50
      });
    }
    setStep(1);
    setIsCollapsed(false);
  };

  const handleDelete = () => {
    if (confirm(t('daily_check_in.delete_confirm'))) {
      deleteMutation.mutate();
    }
  };

  // Add Esc key handler for video modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && activeVideo) {
        setActiveVideo(null);
      }
    };
    if (activeVideo) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [activeVideo]);

  // If loading, show skeleton
  if (isLoading) {
    return (
      <Card className="border border-border/70 overflow-hidden" style={{
        borderRadius: '36px',
        background: 'linear-gradient(180deg, rgba(255, 252, 247, 0.98) 0%, rgba(235, 248, 243, 0.94) 62%, rgba(247, 251, 249, 0.98) 100%)',
        boxShadow: '0 20px 56px rgba(77, 125, 111, 0.14), 0 8px 22px rgba(77, 125, 111, 0.08)'
      }}>
        <CardContent className="p-7">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>);

  }

  // Summary view (completed check-in)
  if (todayMood && step === 4) {
    const completedMood = moodOptions.find((m) => m.value === todayMood.mood);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}>

        <Card className="border overflow-hidden" style={{
          borderRadius: '36px',
          borderColor: 'rgba(118, 170, 156, 0.38)',
          background: 'linear-gradient(180deg, rgba(255, 253, 250, 0.99) 0%, rgba(228, 244, 238, 0.96) 58%, rgba(242, 248, 245, 0.99) 100%)',
          boxShadow: '0 30px 72px rgba(68, 108, 96, 0.18), 0 12px 28px rgba(68, 108, 96, 0.1)'
        }}>
          <CardHeader
            className="cursor-pointer hover:bg-secondary/45 transition-colors bg-[linear-gradient(180deg,rgba(255,255,255,0.62)_0%,rgba(226,242,236,0.66)_100%)] border-b border-[rgba(118,170,156,0.24)]"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ borderRadius: '36px 36px 0 0', padding: '20px 24px' }}>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{completedMood?.emoji}</span>
                <CardTitle className="text-lg">{t('daily_check_in.complete_title')}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="h-9 w-9"
                  aria-label={t('daily_check_in.aria_edit')}>

                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="h-9 w-9"
                  aria-label={t('daily_check_in.aria_delete')}>

                  <Trash2 className="w-4 h-4" />
                </Button>
                {isCollapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {!isCollapsed &&
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}>

                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{t('daily_check_in.emotions_label')}</p>
                    <div className="flex flex-wrap gap-2">
                      {todayMood.emotions?.map((emotion) => {
                      const category = Object.keys(emotionCategories).find((cat) =>
                      emotionCategories[cat].includes(emotion)
                      );
                      const colors = categoryColors[category];
                      return (
                        <Badge key={emotion} className={cn(colors.bg, colors.text)}>
                            {t(`daily_check_in.emotions.${emotion}`, { defaultValue: emotion })}
                          </Badge>);

                    })}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{t('daily_check_in.intensity_label')}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600"
                        style={{ width: `${todayMood.intensity}%` }} />

                      </div>
                      <span className="text-lg font-bold text-primary">
                        {todayMood.intensity}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            }
          </AnimatePresence>
        </Card>
      </motion.div>);

  }

  // Interactive check-in form
  return (
    <>
      {showAuthError && <AuthErrorBanner onDismiss={() => setShowAuthError(false)} />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}>

      <Card className="border border-border/70 overflow-hidden" style={{
          borderRadius: '36px',
          background: 'linear-gradient(180deg, rgba(255, 252, 247, 0.98) 0%, rgba(235, 248, 243, 0.94) 62%, rgba(247, 251, 249, 0.98) 100%)',
          boxShadow: '0 20px 56px rgba(77, 125, 111, 0.14), 0 8px 22px rgba(77, 125, 111, 0.08)'
        }}>
        <CardHeader className="bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(238,247,243,0.52)_100%)] border-b border-border/50" style={{ padding: '20px 24px' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center" style={{
                  borderRadius: '18px',
                  background: 'linear-gradient(180deg, rgba(49, 158, 136, 0.22) 0%, rgba(49, 158, 136, 0.34) 100%)',
                  boxShadow: '0 14px 28px rgba(38, 134, 116, 0.2)'
                }}>
                <Heart className="text-teal-600 lucide lucide-heart w-6 h-6" />
              </div>
              <CardTitle className="text-teal-600 text-xl font-semibold tracking-[-0.012em]">{t('daily_check_in.title')}</CardTitle>
            </div>
            <motion.button
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                  '0 4px 12px rgba(38, 166, 154, 0.4)',
                  '0 6px 16px rgba(38, 166, 154, 0.6)',
                  '0 4px 12px rgba(38, 166, 154, 0.4)']

                }}
                transition={{ duration: 2, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveVideo('https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/Daily%20Check-in.mp4?alt=media&token=6c2b0997-3dd4-4824-8791-b01f3c0e28f2');
                }}
                className="flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: 'linear-gradient(180deg, rgba(49, 158, 136, 0.18) 0%, rgba(236, 185, 120, 0.18) 100%)',
                  boxShadow: '0 12px 24px rgba(68, 108, 96, 0.1)',
                  border: 'none',
                  outline: 'none'
                }}
                aria-label={t('daily_check_in.aria_guided_video')}
                title={t('daily_check_in.aria_guided_video')}>

              <User className="w-5 h-5 text-primary" strokeWidth={2} />
            </motion.button>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) =>
              <div
                key={s}
                className="h-2 flex-1 rounded-full transition-all"
                style={{
                  background: s <= step ? 'linear-gradient(90deg, #2D9D88 0%, #1F7F6C 100%)' : 'rgba(188, 208, 201, 0.62)'
                }} />

              )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Step 1: Mood Selection */}
          {step === 1 &&
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4">

              <h3 className="text-teal-600 text-base font-semibold">
                {t('daily_check_in.step1_question')}
              </h3>
              <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-3">
                {moodOptions.map((mood) =>
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMoodSelect(mood);
                    }
                  }} className="p-1 text-xs font-medium normal-case flex flex-col items-center justify-center sm:p-2 md:p-4 transition-all hover:scale-105 hover:opacity-80"






                  aria-label={t('daily_check_in.aria_select_mood', { label: t(`daily_check_in.moods.${mood.value}`, { defaultValue: mood.label }) })}
                  aria-pressed={formData.mood === mood.value}>

                    <div
                    className={cn(
                      "w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-1 sm:mb-2 border-2 transition-all",
                      formData.mood === mood.value ?
                      "border-primary shadow-[var(--shadow-md)]" :
                      "border-border/40"
                    )}
                    style={{
                      background: formData.mood === mood.value ?
                      'linear-gradient(180deg, rgba(210, 239, 231, 0.98) 0%, rgba(247, 236, 222, 0.95) 100%)' :
                      'linear-gradient(180deg, rgba(224, 240, 234, 0.86) 0%, rgba(247, 244, 236, 0.82) 100%)'
                    }}>

                      <span className="text-3xl font-light text-justify sm:text-2xl md:text-3xl">{mood.emoji}</span>
                    </div>
                    <div className="text-teal-600 font-medium text-center leading-tight rounded sm:text-xs">
                      {t(`daily_check_in.moods.${mood.value}`, { defaultValue: mood.label })}
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
            }

          {/* Step 2: Emotions Selection */}
          {step === 2 &&
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4">

              <h3 className="text-teal-600 text-base font-semibold">
                {t('daily_check_in.step2_question')}
              </h3>
              
              {Object.entries(emotionCategories).map(([category, emotions]) => {
                const colors = categoryColors[category];
                return (
                  <div key={category}>
                    <p className="text-teal-600 mb-2 text-sm font-medium capitalize">
                      {t(`daily_check_in.category_${category}`)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {emotions.map((emotion) => {
                        const isSelected = formData.emotions.includes(emotion);
                        return (
                      <button
                        key={emotion}
                        type="button"
                        onClick={() => toggleEmotion(emotion)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleEmotion(emotion);
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-full transition-all border-2 cursor-pointer",
                          isSelected
                            ? cn(colors.selected, colors.text, "border-transparent scale-105 shadow-[var(--shadow-sm)]")
                            : "bg-teal-50 text-foreground/85 border-border/70 hover:border-primary/30 hover:bg-secondary/70"
                        )}
                        aria-label={t(`daily_check_in.emotions.${emotion}`, { defaultValue: emotion })}
                        aria-pressed={isSelected}>

                          {t(`daily_check_in.emotions.${emotion}`, { defaultValue: emotion })}
                        </button>
                        );
                      })}
                    </div>
                  </div>);

              })}
            </motion.div>
            }

          {/* Step 3: Intensity */}
          {step === 3 &&
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4">

              <h3 className="text-base font-semibold text-foreground">
                {t('daily_check_in.step3_question')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-950 text-base font-medium">{t('daily_check_in.intensity_low')}</span>
                  <span className="text-3xl font-bold text-primary">
                    {formData.intensity}
                  </span>
                  <span className="text-slate-950 text-base font-medium">{t('daily_check_in.intensity_high')}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #2D9D88 0%, #2D9D88 ${formData.intensity}%, rgba(196,208,203,0.82) ${formData.intensity}%, rgba(196,208,203,0.82) 100%)`,
                    boxShadow: 'inset 0 1px 3px rgba(68,108,96,0.12)'
                  }}
                  aria-label="Emotion intensity level"
                  aria-valuetext={`${formData.intensity} out of 100`} />

                <div className="text-gray-950 text-xs rounded-[20px] flex justify-between">
                  <span className="text-lg font-medium">1</span>
                  <span className="text-lg font-medium">25</span>
                  <span className="text-lg font-medium">50</span>
                  <span className="text-lg font-medium">75</span>
                  <span className="text-lg font-medium">100</span>
                </div>
              </div>
            </motion.div>
            }

          {/* Navigation */}
          <div className="bg-teal-500 text-teal-800 mt-6 rounded-2xl flex gap-3">
            {step > 1 &&
              <Button
                onClick={handleReturn}
                variant="outline" className="bg-teal-600 text-slate-50 px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 min-h-[44px] md:min-h-0 flex-1"

                style={{ borderRadius: '16px' }}>

                <ChevronLeft className="w-4 h-4 mr-2" />
                {t('daily_check_in.btn_return')}
              </Button>
              }
            <Button
                onClick={handleContinue}
                disabled={step === 1 && !formData.mood} className="bg-teal-600 text-gray-950 px-4 py-2 text-lg font-semibold tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0 flex-1 shadow-[var(--shadow-lg)]"

                style={{
                  borderRadius: '16px'
                }}>

              {step === 3 ? t('daily_check_in.btn_complete') : t('daily_check_in.btn_continue')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => setActiveVideo(null)}>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}>

              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                style={{
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label={t('daily_check_in.aria_close_video')}>

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <video
                autoPlay
                controls
                playsInline
                className="w-full"
                style={{ maxHeight: '80vh', backgroundColor: '#000' }}>

                <source src={activeVideo} type="video/mp4" />
                {t('daily_check_in.video_not_supported')}
              </video>
            </motion.div>
          </motion.div>
          }
      </AnimatePresence>
      </motion.div>
    </>);

}