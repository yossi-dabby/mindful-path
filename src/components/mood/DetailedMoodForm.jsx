import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { X, Smile, Meh, Frown, Battery, Moon, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const moodsConfig = [
  { value: 'excellent', labelKey: 'mood_tracker.form.mood_excellent', icon: '😄', color: 'from-green-400 to-green-600' },
  { value: 'good', labelKey: 'mood_tracker.form.mood_good', icon: '🙂', color: 'from-blue-400 to-blue-600' },
  { value: 'okay', labelKey: 'mood_tracker.form.mood_okay', icon: '😐', color: 'from-yellow-400 to-yellow-600' },
  { value: 'low', labelKey: 'mood_tracker.form.mood_low', icon: '😟', color: 'from-orange-400 to-orange-600' },
  { value: 'very_low', labelKey: 'mood_tracker.form.mood_very_low', icon: '😢', color: 'from-red-400 to-red-600' }
];

const emotions = [
  'happy', 'sad', 'anxious', 'calm', 'angry', 'frustrated', 'excited', 'grateful',
  'lonely', 'hopeful', 'overwhelmed', 'peaceful', 'stressed', 'content', 'worried'
];

const commonTriggers = [
  'work', 'relationships', 'health', 'finances', 'sleep', 'family',
  'social media', 'news', 'weather', 'exercise', 'diet', 'isolation'
];

const commonActivities = [
  'exercise', 'meditation', 'socializing', 'work', 'hobbies', 'reading',
  'watching TV', 'gaming', 'cooking', 'outdoor activities', 'therapy', 'journaling'
];

const energyLevelsConfig = [
  { value: 'very_low', labelKey: 'mood_tracker.form.energy_very_low', icon: Battery },
  { value: 'low', labelKey: 'mood_tracker.form.energy_low', icon: Battery },
  { value: 'moderate', labelKey: 'mood_tracker.form.energy_moderate', icon: Battery },
  { value: 'high', labelKey: 'mood_tracker.form.energy_high', icon: Zap },
  { value: 'very_high', labelKey: 'mood_tracker.form.energy_very_high', icon: Zap }
];

const sleepQualitiesConfig = [
  { value: 'poor', labelKey: 'mood_tracker.form.sleep_poor', icon: Moon },
  { value: 'fair', labelKey: 'mood_tracker.form.sleep_fair', icon: Moon },
  { value: 'good', labelKey: 'mood_tracker.form.sleep_good', icon: Moon },
  { value: 'excellent', labelKey: 'mood_tracker.form.sleep_excellent', icon: Moon }
];

export default function DetailedMoodForm({ entry, onClose }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const isSavingRef = React.useRef(false);
  const [saveError, setSaveError] = React.useState(null);

  const [formData, setFormData] = useState(
    entry || {
      date: today,
      mood: 'okay',
      emotions: [],
      intensity: 5,
      energy_level: 'moderate',
      sleep_quality: 'good',
      stress_level: 5,
      triggers: [],
      activities: [],
      notes: ''
    }
  );

  const saveMutation = useMutation({
    mutationFn: (data) => {
      // Validate ranges before saving
      const validatedData = {
        ...data,
        intensity: Math.max(1, Math.min(10, data.intensity || 5)),
        stress_level: Math.max(1, Math.min(10, data.stress_level || 5))
      };
      return entry
        ? base44.entities.MoodEntry.update(entry.id, validatedData)
        : base44.entities.MoodEntry.create(validatedData);
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['moodEntries']);
      await queryClient.cancelQueries(['recentMood']);
      await queryClient.cancelQueries(['todayFlow']);

      // Snapshot previous values
      const previousMoodEntries = queryClient.getQueryData(['moodEntries']);
      const previousRecentMood = queryClient.getQueryData(['recentMood']);
      const previousTodayFlow = queryClient.getQueryData(['todayFlow']);

      // Optimistically update
      const validatedData = {
        ...data,
        intensity: Math.max(1, Math.min(10, data.intensity || 5)),
        stress_level: Math.max(1, Math.min(10, data.stress_level || 5))
      };

      if (entry) {
        // Update existing entry
        queryClient.setQueryData(['moodEntries'], (old) => {
          if (!old) return old;
          return old.map(e => e.id === entry.id ? { ...e, ...validatedData } : e);
        });
      } else {
        // Add new entry
        const optimisticEntry = {
          id: 'temp-' + Date.now(),
          ...validatedData,
          created_date: new Date().toISOString()
        };
        queryClient.setQueryData(['moodEntries'], (old) => [optimisticEntry, ...(old || [])]);
        queryClient.setQueryData(['recentMood'], (old) => [optimisticEntry, ...(old || [])]);
      }

      return { previousMoodEntries, previousRecentMood, previousTodayFlow };
    },
    onSuccess: () => {
      isSavingRef.current = false;
      onClose();
    },
    onError: (error, variables, context) => {
      isSavingRef.current = false;
      // Rollback on error
      if (context?.previousMoodEntries !== undefined) {
        queryClient.setQueryData(['moodEntries'], context.previousMoodEntries);
      }
      if (context?.previousRecentMood !== undefined) {
        queryClient.setQueryData(['recentMood'], context.previousRecentMood);
      }
      if (context?.previousTodayFlow !== undefined) {
        queryClient.setQueryData(['todayFlow'], context.previousTodayFlow);
      }
      setSaveError(t('mood_tracker.form.save_error'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(['moodEntries']);
      queryClient.invalidateQueries(['recentMood']);
      queryClient.invalidateQueries(['todayFlow']);
    }
  });

  const toggleItem = (field, item) => {
    const current = formData[field] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    setFormData({ ...formData, [field]: updated });
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

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-24 overflow-y-auto"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)'
      }}
    >
      <Card className="w-full max-w-3xl border-0 shadow-2xl my-8" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{t('mood_tracker.form.title')}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('mood_tracker.form.close_aria')}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {/* Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">{t('mood_tracker.form.date')}</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={today}
              className="rounded-xl"
            />
          </div>

          {/* Mood Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">{t('mood_tracker.form.overall_mood')}</label>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {moodsConfig.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setFormData({ ...formData, mood: mood.value })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                    formData.mood === mood.value
                      ? 'border-purple-400 bg-purple-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <span className="text-2xl sm:text-3xl">{mood.icon}</span>
                  <span className="text-xs font-medium text-gray-700 break-words text-center">{t(mood.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emotions */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              {t('mood_tracker.form.emotions_question')}
            </label>
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion) => (
                <Badge
                  key={emotion}
                  onClick={() => toggleItem('emotions', emotion)}
                  className={cn(
                    'cursor-pointer capitalize transition-all',
                    formData.emotions?.includes(emotion)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {t('mood_tracker.form.intensity_label')}: {formData.intensity}/10
            </label>
            <Slider
              value={[formData.intensity]}
              onValueChange={([value]) => setFormData({ ...formData, intensity: value })}
              min={1}
              max={10}
              step={1}
              className="w-full"
              aria-label={t('mood_tracker.form.intensity_label')}
              aria-valuetext={`${t('mood_tracker.form.intensity_label')} ${formData.intensity} out of 10`}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('mood_tracker.form.mild')}</span>
              <span>{t('mood_tracker.form.intense')}</span>
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">{t('mood_tracker.form.energy_level')}</label>
            <div className="grid grid-cols-5 gap-2">
              {energyLevelsConfig.map((level) => {
                const Icon = level.icon;
                return (
                  <button
                    key={level.value}
                    onClick={() => setFormData({ ...formData, energy_level: level.value })}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                      formData.energy_level === level.value
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs break-words text-center">{t(level.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">{t('mood_tracker.form.sleep_quality')}</label>
            <div className="grid grid-cols-4 gap-2">
              {sleepQualitiesConfig.map((quality) => {
                const Icon = quality.icon;
                return (
                  <button
                    key={quality.value}
                    onClick={() => setFormData({ ...formData, sleep_quality: quality.value })}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                      formData.sleep_quality === quality.value
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs break-words text-center">{t(quality.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {t('mood_tracker.form.stress_level')}: {formData.stress_level}/10
            </label>
            <Slider
              value={[formData.stress_level]}
              onValueChange={([value]) => setFormData({ ...formData, stress_level: value })}
              min={1}
              max={10}
              step={1}
              className="w-full"
              aria-label={t('mood_tracker.form.stress_level')}
              aria-valuetext={`${t('mood_tracker.form.stress_level')} ${formData.stress_level} out of 10`}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{t('mood_tracker.form.relaxed')}</span>
              <span>{t('mood_tracker.form.very_stressed')}</span>
            </div>
          </div>

          {/* Triggers */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              {t('mood_tracker.form.triggers_question')}
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTriggers.map((trigger) => (
                <Badge
                  key={trigger}
                  onClick={() => toggleItem('triggers', trigger)}
                  className={cn(
                    'cursor-pointer capitalize transition-all',
                    formData.triggers?.includes(trigger)
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              {t('mood_tracker.form.activities_question')}
            </label>
            <div className="flex flex-wrap gap-2">
              {commonActivities.map((activity) => (
                <Badge
                  key={activity}
                  onClick={() => toggleItem('activities', activity)}
                  className={cn(
                    'cursor-pointer capitalize transition-all',
                    formData.activities?.includes(activity)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {activity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {t('mood_tracker.form.notes_label')}
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('mood_tracker.form.notes_placeholder')}
              className="h-32 rounded-xl"
            />
          </div>

          {/* Actions */}
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">
              {saveError}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                if (isSavingRef.current || saveMutation.isPending) return;
                isSavingRef.current = true;
                setSaveError(null);
                saveMutation.mutate(formData);
              }}
              disabled={isSavingRef.current || saveMutation.isPending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {saveMutation.isPending ? t('mood_tracker.form.saving') : entry ? t('mood_tracker.form.update_entry') : t('mood_tracker.form.save_entry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}