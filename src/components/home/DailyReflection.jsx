import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const SUGGESTED_TAKEAWAYS = [
  "Notice and challenge one negative thought",
  "Practice 5 minutes of mindful breathing",
  "Take one small action toward my goal",
  "Be kind to myself when I make mistakes",
  "Share how I'm feeling with someone I trust",
  "Take a break when I feel overwhelmed",
  "Celebrate one small win today"
];

export default function DailyReflection({ todayFlow, exercise, onClose }) {
  const [selectedTakeaway, setSelectedTakeaway] = useState('');
  const [customTakeaway, setCustomTakeaway] = useState('');
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: async () => {
      const takeaway = customTakeaway || selectedTakeaway;
      const insight = generateInsight(exercise);
      
      await base44.entities.DailyFlow.update(todayFlow.id, {
        reflection_completed: true,
        reflection_time: new Date().toISOString(),
        key_insight: insight,
        daily_takeaway: takeaway
      });

      return { insight, takeaway };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todayFlow']);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  });

  const generateInsight = (exercise) => {
    if (!exercise) return "Great work on today's practice!";

    const insights = {
      breathing: "Controlled breathing activates your body's natural relaxation response, helping you feel calmer and more centered.",
      grounding: "Grounding techniques bring you back to the present moment, reducing anxiety by shifting focus from worries to immediate sensations.",
      cognitive_restructuring: "By examining your thoughts objectively, you're learning to separate facts from interpretations and build more balanced perspectives.",
      behavioral_activation: "Taking action, even when you don't feel like it, creates positive momentum and helps break the cycle of avoidance.",
      mindfulness: "Mindfulness helps you observe your thoughts and feelings without judgment, creating space between you and your reactions."
    };

    return insights[exercise.category] || "Consistent practice of CBT techniques builds lasting skills for managing difficult emotions.";
  };

  const handleComplete = () => {
    if (!customTakeaway && !selectedTakeaway) return;
    completeMutation.mutate();
  };

  if (completeMutation.isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-lg border-0 shadow-2xl" style={{ 
            borderRadius: 'var(--r-xl)',
            backgroundColor: 'rgb(var(--surface))'
          }}>
            <CardContent className="p-10 text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}
                className="inline-flex w-20 h-20 items-center justify-center mb-6"
                style={{ 
                  borderRadius: 'var(--r-xl)',
                  backgroundColor: 'rgb(var(--success) / 0.15)'
                }}
              >
                <CheckCircle2 className="w-10 h-10 icon-default" style={{ color: 'rgb(var(--success))' }} strokeWidth={2} />
              </motion.div>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'rgb(var(--text))' }}>
                You're all done for today!
              </h2>
              <p style={{ color: 'rgb(var(--muted))' }}>
                See you tomorrow for your next daily practice
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl my-8"
      >
        <Card className="border-0 shadow-2xl" style={{ 
          borderRadius: 'var(--r-xl)',
          backgroundColor: 'rgb(var(--surface))'
        }}>
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center" style={{ 
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'rgb(var(--calm) / 0.15)'
                }}>
                  <Lightbulb className="w-6 h-6 icon-default" style={{ color: 'rgb(var(--calm))' }} strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--text))' }}>
                  Daily Reflection
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" strokeWidth={2} />
              </Button>
            </div>

            {/* Key Insight */}
            <div className="mb-8 p-6 transition-calm" style={{ 
              borderRadius: 'var(--r-lg)',
              backgroundColor: 'rgb(var(--calm) / 0.05)',
              border: '1px solid rgb(var(--border))'
            }}>
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="w-5 h-5 icon-default mt-0.5" style={{ color: 'rgb(var(--calm))' }} strokeWidth={2} />
                <h3 className="font-semibold" style={{ color: 'rgb(var(--text))' }}>
                  Today's Key Insight
                </h3>
              </div>
              <p className="leading-relaxed" style={{ color: 'rgb(var(--text))' }}>
                {generateInsight(exercise)}
              </p>
            </div>

            {/* Takeaway Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4" style={{ color: 'rgb(var(--text))' }}>
                Choose one focus for the rest of your day:
              </h3>
              <div className="space-y-2 mb-4">
                {SUGGESTED_TAKEAWAYS.map((takeaway) => (
                  <button
                    key={takeaway}
                    onClick={() => {
                      setSelectedTakeaway(takeaway);
                      setCustomTakeaway('');
                    }}
                    className="w-full text-left p-4 transition-calm"
                    style={{ 
                      borderRadius: 'var(--r-md)',
                      backgroundColor: selectedTakeaway === takeaway 
                        ? 'rgb(var(--accent) / 0.1)' 
                        : 'rgb(var(--surface-2))',
                      border: selectedTakeaway === takeaway 
                        ? '2px solid rgb(var(--accent))' 
                        : '1px solid rgb(var(--border))'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center transition-calm" style={{ 
                        borderRadius: 'var(--r-xs)',
                        border: `2px solid ${selectedTakeaway === takeaway ? 'rgb(var(--accent))' : 'rgb(var(--border))'}`,
                        backgroundColor: selectedTakeaway === takeaway ? 'rgb(var(--accent))' : 'transparent'
                      }}>
                        {selectedTakeaway === takeaway && (
                          <CheckCircle2 className="w-4 h-4" style={{ color: 'rgb(var(--accent-contrast))' }} strokeWidth={3} />
                        )}
                      </div>
                      <span style={{ color: 'rgb(var(--text))' }}>{takeaway}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Takeaway */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text))' }}>
                  Or write your own:
                </label>
                <Textarea
                  value={customTakeaway}
                  onChange={(e) => {
                    setCustomTakeaway(e.target.value);
                    setSelectedTakeaway('');
                  }}
                  placeholder="What will you focus on today?"
                  className="transition-calm"
                  style={{ 
                    borderRadius: 'var(--r-md)',
                    borderColor: 'rgb(var(--border))'
                  }}
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 transition-calm"
                style={{ borderRadius: 'var(--r-md)' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!customTakeaway && !selectedTakeaway}
                className="flex-1 transition-calm"
                style={{ 
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'rgb(var(--accent))',
                  color: 'rgb(var(--accent-contrast))',
                  opacity: (!customTakeaway && !selectedTakeaway) ? 0.5 : 1
                }}
              >
                Complete Reflection
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}