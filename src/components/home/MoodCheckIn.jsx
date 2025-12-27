import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Smile, Meh, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';

const moodOptions = [
  { value: 'excellent', label: 'Excellent', emoji: '😊', color: 'bg-green-500' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-green-400' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'bg-yellow-400' },
  { value: 'low', label: 'Low', emoji: '😔', color: 'bg-orange-400' },
  { value: 'very_low', label: 'Very Low', emoji: '😢', color: 'bg-red-400' }
];

const commonEmotions = [
  'Happy', 'Anxious', 'Sad', 'Calm', 'Angry', 'Excited',
  'Overwhelmed', 'Grateful', 'Lonely', 'Hopeful', 'Frustrated', 'Peaceful'
];

export default function MoodCheckIn({ onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: '',
    emotions: [],
    intensity: 5,
    notes: '',
    triggers: ''
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.MoodEntry.create(data),
    onSuccess: () => {
      onClose();
    }
  });

  const toggleEmotion = (emotion) => {
    setFormData(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }));
  };

  const handleSubmit = () => {
    saveMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Daily Check-in</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  How are you feeling overall?
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setFormData({ ...formData, mood: mood.value })}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all hover:scale-105",
                        formData.mood === mood.value
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      )}
                    >
                      <div className="text-4xl mb-2">{mood.emoji}</div>
                      <div className="text-sm font-medium text-gray-700">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.mood}
                className="w-full bg-green-600 hover:bg-green-700 py-6 rounded-xl"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  What emotions are you experiencing?
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {commonEmotions.map((emotion) => (
                    <Badge
                      key={emotion}
                      variant={formData.emotions.includes(emotion) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer px-4 py-2 text-sm transition-all",
                        formData.emotions.includes(emotion)
                          ? "bg-green-600 hover:bg-green-700"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => toggleEmotion(emotion)}
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Intensity (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-green-600 w-12 text-center">
                    {formData.intensity}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What triggered these feelings? (optional)
                </label>
                <Input
                  value={formData.triggers}
                  onChange={(e) => setFormData({ ...formData, triggers: e.target.value })}
                  placeholder="e.g., Work deadline, conversation with friend..."
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Additional notes (optional)
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anything else you'd like to remember..."
                  className="rounded-xl h-32"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Complete Check-in'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}