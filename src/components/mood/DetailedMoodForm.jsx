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

const moods = [
  { value: 'excellent', label: 'Excellent', icon: '😄', color: 'from-green-400 to-green-600' },
  { value: 'good', label: 'Good', icon: '🙂', color: 'from-blue-400 to-blue-600' },
  { value: 'okay', label: 'Okay', icon: '😐', color: 'from-yellow-400 to-yellow-600' },
  { value: 'low', label: 'Low', icon: '😟', color: 'from-orange-400 to-orange-600' },
  { value: 'very_low', label: 'Very Low', icon: '😢', color: 'from-red-400 to-red-600' }
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

const energyLevels = [
  { value: 'very_low', label: 'Very Low', icon: Battery },
  { value: 'low', label: 'Low', icon: Battery },
  { value: 'moderate', label: 'Moderate', icon: Battery },
  { value: 'high', label: 'High', icon: Zap },
  { value: 'very_high', label: 'Very High', icon: Zap }
];

const sleepQualities = [
  { value: 'poor', label: 'Poor', icon: Moon },
  { value: 'fair', label: 'Fair', icon: Moon },
  { value: 'good', label: 'Good', icon: Moon },
  { value: 'excellent', label: 'Excellent', icon: Moon }
];

export default function DetailedMoodForm({ entry, onClose }) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

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
    mutationFn: (data) =>
      entry
        ? base44.entities.MoodEntry.update(entry.id, data)
        : base44.entities.MoodEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['moodEntries']);
      queryClient.invalidateQueries(['recentMood']);
      onClose();
    }
  });

  const toggleItem = (field, item) => {
    const current = formData[field] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    setFormData({ ...formData, [field]: updated });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl border-0 shadow-2xl my-8">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">How are you feeling today?</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
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
            <label className="text-sm font-medium text-gray-700 mb-3 block">Overall Mood</label>
            <div className="grid grid-cols-5 gap-3">
              {moods.map((mood) => (
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
                  <span className="text-3xl">{mood.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emotions */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              What emotions are you feeling?
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
              Emotional Intensity: {formData.intensity}/10
            </label>
            <Slider
              value={[formData.intensity]}
              onValueChange={([value]) => setFormData({ ...formData, intensity: value })}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Mild</span>
              <span>Intense</span>
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Energy Level</label>
            <div className="grid grid-cols-5 gap-2">
              {energyLevels.map((level) => {
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
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{level.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Sleep Quality</label>
            <div className="grid grid-cols-4 gap-2">
              {sleepQualities.map((quality) => {
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
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{quality.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Stress Level: {formData.stress_level}/10
            </label>
            <Slider
              value={[formData.stress_level]}
              onValueChange={([value]) => setFormData({ ...formData, stress_level: value })}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Relaxed</span>
              <span>Very Stressed</span>
            </div>
          </div>

          {/* Triggers */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              What triggered your mood today?
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
              What did you do today?
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
              Additional Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any other thoughts or observations about your day..."
              className="h-32 rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {saveMutation.isPending ? 'Saving...' : entry ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}