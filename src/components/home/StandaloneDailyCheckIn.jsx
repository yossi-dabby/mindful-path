import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronDown, ChevronUp, Edit2, Trash2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const moodOptions = [
  { value: 'excellent', emoji: '😊', label: 'Excellent' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'low', emoji: '😔', label: 'Low' },
  { value: 'very_low', emoji: '😢', label: 'Very Low' }
];

const emotionCategories = {
  positive: [
    'Happy', 'Joyful', 'Peaceful', 'Grateful', 'Excited', 'Hopeful', 'Confident',
    'Proud', 'Content', 'Energized', 'Inspired', 'Loved', 'Optimistic', 'Relaxed',
    'Satisfied', 'Amused', 'Interested', 'Playful', 'Courageous', 'Compassionate'
  ],
  intermediate: [
    'Uncertain', 'Confused', 'Curious', 'Surprised', 'Bored', 'Tired', 'Restless',
    'Indifferent', 'Neutral', 'Ambivalent', 'Pensive', 'Nostalgic', 'Wistful',
    'Distracted', 'Apathetic', 'Disconnected', 'Numb', 'Empty', 'Doubtful', 'Hesitant'
  ],
  negative: [
    'Anxious', 'Sad', 'Angry', 'Frustrated', 'Stressed', 'Overwhelmed', 'Lonely',
    'Fearful', 'Guilty', 'Ashamed', 'Disappointed', 'Hopeless', 'Jealous', 'Resentful',
    'Irritated', 'Worried', 'Depressed', 'Helpless', 'Rejected', 'Insecure'
  ]
};

const categoryColors = {
  positive: { bg: 'bg-green-500', hover: 'hover:bg-green-600', selected: 'bg-green-600', text: 'text-white' },
  intermediate: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', selected: 'bg-orange-600', text: 'text-white' },
  negative: { bg: 'bg-red-500', hover: 'hover:bg-red-600', selected: 'bg-red-600', text: 'text-white' }
};

export default function StandaloneDailyCheckIn() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    mood: '',
    mood_emoji: '',
    emotions: [],
    intensity: 50
  });

  // Check if today's check-in exists
  const { data: todayMood, isLoading } = useQuery({
    queryKey: ['todayMood'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const moods = await base44.entities.MoodEntry.filter({ date: today });
      return moods[0] || null;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries(['todayMood']);
      queryClient.invalidateQueries(['todayFlow']);
      setStep(4);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (todayMood) {
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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todayMood']);
      queryClient.invalidateQueries(['todayFlow']);
      setStep(1);
      setFormData({ mood: '', mood_emoji: '', emotions: [], intensity: 50 });
    }
  });

  const selectedMood = moodOptions.find(m => m.value === formData.mood);

  const handleMoodSelect = (mood) => {
    setFormData({ ...formData, mood: mood.value, mood_emoji: mood.emoji });
  };

  const toggleEmotion = (emotion) => {
    setFormData(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
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
        mood_emoji: moodOptions.find(m => m.value === todayMood.mood)?.emoji || '',
        emotions: todayMood.emotions || [],
        intensity: todayMood.intensity || 50
      });
    }
    setStep(1);
    setIsCollapsed(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this check-in? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <Card className="border-0" style={{
        borderRadius: '36px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.9) 100%)',
        boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15)'
      }}>
        <CardContent className="p-7">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Summary view (completed check-in)
  if (todayMood && step === 4) {
    const completedMood = moodOptions.find(m => m.value === todayMood.mood);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0" style={{
          borderRadius: '36px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.9) 100%)',
          boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15)'
        }}>
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50/50 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ borderRadius: '36px 36px 0 0', padding: '20px 24px' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{completedMood?.emoji}</span>
                <CardTitle className="text-lg">Daily Check-in Complete</CardTitle>
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
                >
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
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                {isCollapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Emotions:</p>
                    <div className="flex flex-wrap gap-2">
                      {todayMood.emotions?.map((emotion) => {
                        const category = Object.keys(emotionCategories).find(cat => 
                          emotionCategories[cat].includes(emotion)
                        );
                        const colors = categoryColors[category];
                        return (
                          <Badge key={emotion} className={cn(colors.bg, colors.text)}>
                            {emotion}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Intensity:</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-600"
                          style={{ width: `${todayMood.intensity}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold" style={{ color: '#26A69A' }}>
                        {todayMood.intensity}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  }

  // Interactive check-in form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0" style={{
        borderRadius: '36px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.9) 100%)',
        boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15)'
      }}>
        <CardHeader style={{ padding: '20px 24px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 flex items-center justify-center" style={{
              borderRadius: '18px',
              backgroundColor: 'rgba(38, 166, 154, 0.15)'
            }}>
              <Heart className="w-6 h-6" style={{ color: '#26A69A' }} />
            </div>
            <CardTitle className="text-xl">Daily Check-in</CardTitle>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-2 flex-1 rounded-full transition-all"
                style={{
                  backgroundColor: s <= step ? '#26A69A' : 'rgba(200, 220, 215, 0.5)'
                }}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Step 1: Mood Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-base font-semibold text-gray-800">
                How are you feeling overall?
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodSelect(mood)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all hover:scale-105",
                      formData.mood === mood.value
                        ? "border-green-500 bg-green-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="text-3xl mb-1">{mood.emoji}</div>
                    <div className="text-xs font-medium text-gray-700">{mood.label}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Emotions Selection */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-base font-semibold text-gray-800">
                What emotions are you experiencing?
              </h3>
              
              {Object.entries(emotionCategories).map(([category, emotions]) => {
                const colors = categoryColors[category];
                return (
                  <div key={category}>
                    <p className="text-sm font-medium text-gray-600 mb-2 capitalize">
                      {category} Emotions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {emotions.map((emotion) => (
                        <button
                          key={emotion}
                          onClick={() => toggleEmotion(emotion)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2",
                            formData.emotions.includes(emotion)
                              ? cn(colors.selected, colors.text, "border-transparent scale-105")
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          )}
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Step 3: Intensity */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-base font-semibold text-gray-800">
                How intense are your emotions?
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Low</span>
                  <span className="text-3xl font-bold" style={{ color: '#26A69A' }}>
                    {formData.intensity}
                  </span>
                  <span className="text-sm text-gray-600">High</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #26A69A 0%, #26A69A ${formData.intensity}%, #E5E7EB ${formData.intensity}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button
                onClick={handleReturn}
                variant="outline"
                className="flex-1"
                style={{ borderRadius: '16px' }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Return
              </Button>
            )}
            <Button
              onClick={handleContinue}
              disabled={step === 1 && !formData.mood}
              className="flex-1 text-white"
              style={{
                borderRadius: '16px',
                backgroundColor: '#26A69A'
              }}
            >
              {step === 3 ? 'Complete' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}