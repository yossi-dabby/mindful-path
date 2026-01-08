import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Brain, Heart, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const primaryConcerns = [
  { id: 'anxiety', label: 'Anxiety', icon: Brain, color: '#4299E1', description: 'Reduce worry and nervousness' },
  { id: 'stress', label: 'Stress Management', icon: TrendingUp, color: '#F6AD55', description: 'Build coping strategies' },
  { id: 'mood', label: 'Low Mood', icon: Heart, color: '#ED8936', description: 'Improve emotional wellbeing' },
  { id: 'self_esteem', label: 'Self-Esteem', icon: Sparkles, color: '#9F7AEA', description: 'Build confidence' },
  { id: 'sleep', label: 'Sleep Issues', icon: Brain, color: '#38B2AC', description: 'Better rest and recovery' },
  { id: 'relationships', label: 'Relationships', icon: Heart, color: '#26A69A', description: 'Healthier connections' }
];

const goals = [
  'Feel calmer and more in control',
  'Manage difficult emotions better',
  'Build healthier thought patterns',
  'Improve daily functioning',
  'Reduce negative self-talk',
  'Better sleep quality',
  'Increase self-compassion',
  'Strengthen resilience'
];

export default function PersonalizationSetup({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);

  const toggleConcern = (id) => {
    setSelectedConcerns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleGoal = (goal) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = () => {
    onComplete({
      concerns: selectedConcerns,
      goals: selectedGoals
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      background: 'linear-gradient(165deg, rgba(212, 237, 232, 0.95) 0%, rgba(189, 224, 217, 0.95) 100%)',
      backdropFilter: 'blur(12px)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0" style={{
          borderRadius: '32px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.95) 100%)',
          boxShadow: '0 16px 48px rgba(38, 166, 154, 0.2)'
        }}>
          <CardContent className="p-6 sm:p-8">
            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className="h-2 flex-1 rounded-full transition-all"
                  style={{
                    backgroundColor: s <= step ? '#26A69A' : 'rgba(200, 220, 215, 0.5)'
                  }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Target className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#26A69A' }} />
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1A3A34' }}>
                      Let's Personalize Your Path
                    </h2>
                    <p className="text-sm sm:text-base" style={{ color: '#5A7A72' }}>
                      Select your primary concerns (choose 1-3)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {primaryConcerns.map((concern) => {
                      const Icon = concern.icon;
                      const isSelected = selectedConcerns.includes(concern.id);
                      
                      return (
                        <motion.button
                          key={concern.id}
                          onClick={() => toggleConcern(concern.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'p-4 rounded-2xl text-left transition-all border-2',
                            isSelected 
                              ? 'shadow-lg' 
                              : 'shadow-sm hover:shadow-md'
                          )}
                          style={{
                            background: isSelected 
                              ? `linear-gradient(145deg, ${concern.color}20 0%, ${concern.color}10 100%)`
                              : 'rgba(255, 255, 255, 0.9)',
                            borderColor: isSelected ? concern.color : 'rgba(200, 220, 215, 0.3)'
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{
                              borderRadius: '12px',
                              backgroundColor: `${concern.color}20`
                            }}>
                              <Icon className="w-5 h-5" style={{ color: concern.color }} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm sm:text-base mb-1" style={{ color: '#1A3A34' }}>
                                {concern.label}
                              </p>
                              <p className="text-xs" style={{ color: '#5A7A72' }}>
                                {concern.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={selectedConcerns.length === 0 || selectedConcerns.length > 3}
                    className="w-full py-6 text-white text-base"
                    style={{
                      borderRadius: '20px',
                      backgroundColor: '#26A69A',
                      boxShadow: '0 8px 24px rgba(38, 166, 154, 0.3)'
                    }}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: '#9F7AEA' }} />
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1A3A34' }}>
                      What Do You Hope to Achieve?
                    </h2>
                    <p className="text-sm sm:text-base" style={{ color: '#5A7A72' }}>
                      Select your goals (choose any that resonate)
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {goals.map((goal) => {
                      const isSelected = selectedGoals.includes(goal);
                      
                      return (
                        <Badge
                          key={goal}
                          onClick={() => toggleGoal(goal)}
                          className={cn(
                            'cursor-pointer px-4 py-2 text-sm transition-all',
                            isSelected
                              ? 'shadow-md'
                              : 'shadow-sm hover:shadow-md'
                          )}
                          style={{
                            borderRadius: '16px',
                            background: isSelected 
                              ? 'linear-gradient(145deg, rgba(159, 122, 234, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)'
                              : 'rgba(255, 255, 255, 0.9)',
                            color: isSelected ? '#fff' : '#3D5A52',
                            border: isSelected ? 'none' : '1px solid rgba(200, 220, 215, 0.3)'
                          }}
                        >
                          {goal}
                        </Badge>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 py-6"
                      style={{ borderRadius: '20px' }}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleComplete}
                      disabled={selectedGoals.length === 0}
                      className="flex-1 py-6 text-white"
                      style={{
                        borderRadius: '20px',
                        backgroundColor: '#9F7AEA',
                        boxShadow: '0 8px 24px rgba(159, 122, 234, 0.3)'
                      }}
                    >
                      Start My Path
                      <Sparkles className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}