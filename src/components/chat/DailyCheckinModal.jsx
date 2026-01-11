import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const MOOD_SCALE = [
  { value: 1, emoji: '😢', label: 'Very Bad' },
  { value: 2, emoji: '😞', label: 'Bad' },
  { value: 3, emoji: '😕', label: 'Poor' },
  { value: 4, emoji: '😐', label: 'Below Average' },
  { value: 5, emoji: '😶', label: 'Neutral' },
  { value: 6, emoji: '🙂', label: 'Okay' },
  { value: 7, emoji: '😊', label: 'Good' },
  { value: 8, emoji: '😄', label: 'Great' },
  { value: 9, emoji: '😁', label: 'Very Good' },
  { value: 10, emoji: '🤩', label: 'Excellent' }
];

const EMOTION_OPTIONS = [
  'happy', 'anxious', 'sad', 'angry', 'peaceful', 
  'frustrated', 'excited', 'overwhelmed', 'calm', 
  'stressed', 'hopeful', 'tired', 'energized'
];

const ACTIVITY_OPTIONS = [
  'work', 'exercise', 'social', 'rest', 'hobbies',
  'family_time', 'self_care', 'learning', 'creative'
];

export default function DailyCheckinModal({ isOpen, onClose, onSubmit }) {
  const [moodScore, setMoodScore] = useState(5);
  const [emotions, setEmotions] = useState([]);
  const [energy, setEnergy] = useState([5]);
  const [stress, setStress] = useState([5]);
  const [triggers, setTriggers] = useState('');
  const [activities, setActivities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMood = MOOD_SCALE.find(m => m.value === moodScore);

  const toggleEmotion = (emotion) => {
    setEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleActivity = (activity) => {
    setActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSubmit = async () => {
    if (emotions.length === 0) {
      alert('Please select at least one emotion');
      return;
    }

    setIsSubmitting(true);
    
    const payload = {
      mood_score: moodScore,
      mood_emoji: selectedMood.emoji,
      emotions: emotions,
      energy: energy[0],
      stress: stress[0],
      triggers: triggers.trim() || null,
      activities: activities,
      notes: null
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error('Error submitting check-in:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        borderRadius: '24px'
      }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold" style={{ color: '#1A3A34' }}>
            Daily Check-in
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mood Scale */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: '#1A3A34' }}>
              How are you feeling today?
            </label>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl">{selectedMood.emoji}</span>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: '#26A69A' }}>{moodScore}</div>
                <div className="text-sm" style={{ color: '#5A7A72' }}>{selectedMood.label}</div>
              </div>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {MOOD_SCALE.map(mood => (
                <button
                  key={mood.value}
                  onClick={() => setMoodScore(mood.value)}
                  className={`p-2 rounded-lg transition-all ${
                    moodScore === mood.value 
                      ? 'ring-2 ring-offset-2' 
                      : 'opacity-50 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: moodScore === mood.value ? 'rgba(38, 166, 154, 0.15)' : 'transparent',
                    ringColor: '#26A69A'
                  }}
                  title={mood.label}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emotions */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A3A34' }}>
              What emotions are you experiencing? <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOTION_OPTIONS.map(emotion => (
                <Badge
                  key={emotion}
                  variant={emotions.includes(emotion) ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1.5 transition-all"
                  onClick={() => toggleEmotion(emotion)}
                  style={{
                    backgroundColor: emotions.includes(emotion) ? '#26A69A' : 'transparent',
                    color: emotions.includes(emotion) ? 'white' : '#5A7A72',
                    borderColor: '#26A69A'
                  }}
                >
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A3A34' }}>
              Energy level: <span className="font-bold text-lg" style={{ color: '#26A69A' }}>{energy[0]}/10</span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: '#5A7A72' }}>Exhausted</span>
              <Slider
                value={energy}
                onValueChange={setEnergy}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-sm" style={{ color: '#5A7A72' }}>Energized</span>
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A3A34' }}>
              Stress level: <span className="font-bold text-lg" style={{ color: '#26A69A' }}>{stress[0]}/10</span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: '#5A7A72' }}>Calm</span>
              <Slider
                value={stress}
                onValueChange={setStress}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-sm" style={{ color: '#5A7A72' }}>Overwhelmed</span>
            </div>
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A3A34' }}>
              Any triggers or stressors today? (optional)
            </label>
            <Textarea
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              placeholder="e.g., Work deadline, family conflict, health concern..."
              className="min-h-[80px]"
              style={{
                borderRadius: '16px',
                borderColor: 'rgba(38, 166, 154, 0.3)'
              }}
            />
          </div>

          {/* Activities */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#1A3A34' }}>
              What activities have you done today?
            </label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map(activity => (
                <Badge
                  key={activity}
                  variant={activities.includes(activity) ? 'default' : 'outline'}
                  className="cursor-pointer px-3 py-1.5 transition-all"
                  onClick={() => toggleActivity(activity)}
                  style={{
                    backgroundColor: activities.includes(activity) ? '#9F7AEA' : 'transparent',
                    color: activities.includes(activity) ? 'white' : '#5A7A72',
                    borderColor: '#9F7AEA'
                  }}
                >
                  {activity.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              borderRadius: '16px',
              borderColor: 'rgba(38, 166, 154, 0.3)'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || emotions.length === 0}
            className="text-white"
            style={{
              borderRadius: '16px',
              backgroundColor: '#26A69A',
              boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
            }}
          >
            {isSubmitting ? 'Saving...' : 'Complete Check-in'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}