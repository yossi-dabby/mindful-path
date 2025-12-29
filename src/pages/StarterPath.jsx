import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const DAY_STRUCTURE = [
  {
    day: 1,
    goal: "Help the user understand the connection between thoughts and emotions",
    exerciseType: "awareness_reflection",
    title: "Understanding Your Mind",
    description: "Explore how your thoughts influence your emotions"
  },
  {
    day: 2,
    goal: "Identify automatic thoughts in daily situations",
    exerciseType: "thought_identification",
    title: "Catching Automatic Thoughts",
    description: "Notice the thoughts that pop up automatically"
  },
  {
    day: 3,
    goal: "Recognize a common cognitive distortion",
    exerciseType: "pattern_recognition",
    title: "Spotting Thinking Patterns",
    description: "Identify thinking traps that affect your mood"
  },
  {
    day: 4,
    goal: "Create a pause between trigger and reaction",
    exerciseType: "response_delay",
    title: "The Power of Pause",
    description: "Learn to create space before responding"
  },
  {
    day: 5,
    goal: "Generate a balanced alternative thought",
    exerciseType: "cognitive_restructuring",
    title: "Building Balanced Thoughts",
    description: "Transform unhelpful thoughts into realistic ones"
  },
  {
    day: 6,
    goal: "Apply a new response in a real-life situation",
    exerciseType: "behavioral_experiment",
    title: "Testing New Approaches",
    description: "Try out a new way of responding"
  },
  {
    day: 7,
    goal: "Consolidate learning and prepare for ongoing daily use",
    exerciseType: "review_integration",
    title: "Your Journey Forward",
    description: "Review your progress and plan ahead"
  }
];

export default function StarterPath() {
  const [step, setStep] = useState('loading'); // loading, intro, exercise, complete
  const [userResponse, setUserResponse] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const queryClient = useQueryClient();

  // Get starter path progress
  const { data: starterPath } = useQuery({
    queryKey: ['starterPath'],
    queryFn: async () => {
      const paths = await base44.entities.StarterPath.list();
      return paths[0] || null;
    }
  });

  // Get user context for AI generation
  const { data: userContext } = useQuery({
    queryKey: ['userContext'],
    queryFn: async () => {
      const recentMoods = await base44.entities.MoodEntry.list('-created_date', 7);
      const recentJournals = await base44.entities.ThoughtJournal.list('-created_date', 5);
      return { recentMoods, recentJournals };
    },
    initialData: { recentMoods: [], recentJournals: [] }
  });

  const currentDay = starterPath?.current_day || 1;
  const dayStructure = DAY_STRUCTURE[currentDay - 1];

  // Generate daily content with AI
  const generateContentMutation = useMutation({
    mutationFn: async () => {
      const { recentMoods, recentJournals } = userContext;
      
      // Build context string
      let contextStr = "User context:\n";
      if (recentMoods.length > 0) {
        contextStr += `Recent moods: ${recentMoods.slice(0, 3).map(m => 
          `${m.mood}${m.emotions ? ` (${m.emotions.join(', ')})` : ''}`
        ).join('; ')}\n`;
      }
      if (recentJournals.length > 0) {
        contextStr += `Recent journal themes: ${recentJournals.slice(0, 2).map(j => 
          j.automatic_thoughts || j.situation
        ).filter(Boolean).join('; ')}\n`;
      }
      if (!recentMoods.length && !recentJournals.length) {
        contextStr += "No previous data available - generate general but helpful content.\n";
      }

      const prompt = `You are a CBT therapist creating a personalized guided exercise for Day ${currentDay} of a 7-day program.

${contextStr}

Day ${currentDay} Goal: ${dayStructure.goal}
Exercise Type: ${dayStructure.exerciseType}

Generate a brief, personalized exercise in JSON format:
{
  "introduction": "2-3 sentences explaining today's focus in a warm, supportive tone",
  "main_prompt": "One clear question or task for the user (must be specific and actionable, under 10 minutes)",
  "guidance": "1-2 sentences of helpful context or tips",
  "example": "A brief relevant example if helpful (optional, keep very short)"
}

RULES:
- Be specific and clinical, not generic or motivational
- Reference their actual experiences if data is available
- Keep total content under 200 words
- Use simple, clear language
- No bullet points or formatting, just clear sentences
- Make it feel personal and directly relevant`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            introduction: { type: "string" },
            main_prompt: { type: "string" },
            guidance: { type: "string" },
            example: { type: "string" }
          },
          required: ["introduction", "main_prompt", "guidance"]
        }
      });

      return result;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      setStep('intro');
    }
  });

  // Complete day mutation
  const completeDayMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Generate takeaway with AI
      const takeawayPrompt = `Based on this CBT exercise response, generate ONE clear, actionable takeaway (1 sentence):

Exercise goal: ${dayStructure.goal}
User response: ${userResponse}

Generate a concise insight or action the user can apply today.`;

      const takeawayResult = await base44.integrations.Core.InvokeLLM({
        prompt: takeawayPrompt
      });

      // Update starter path
      const updates = {
        current_day: currentDay < 7 ? currentDay + 1 : currentDay,
        last_completed_date: today,
        completed: currentDay === 7,
        completed_date: currentDay === 7 ? today : undefined,
        day_exercises: {
          ...starterPath?.day_exercises,
          [currentDay]: userResponse
        }
      };

      await base44.entities.StarterPath.update(starterPath.id, updates);

      return { takeaway: takeawayResult };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['starterPath']);
      setStep('complete');
    }
  });

  // Generate content on mount
  useEffect(() => {
    if (starterPath && !generatedContent && step === 'loading') {
      generateContentMutation.mutate();
    }
  }, [starterPath, generatedContent, step]);

  if (!starterPath || step === 'loading' || generateContentMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--bg))' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: 'rgb(var(--calm))' }} strokeWidth={2} />
          <p style={{ color: 'rgb(var(--muted))' }}>Preparing your daily exercise...</p>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'rgb(var(--bg))' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-0 shadow-2xl" style={{ 
            borderRadius: 'var(--r-xl)',
            backgroundColor: 'rgb(var(--surface))'
          }}>
            <CardContent className="p-10 text-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
                className="inline-flex w-20 h-20 items-center justify-center mb-6"
                style={{ 
                  borderRadius: 'var(--r-xl)',
                  backgroundColor: 'rgb(var(--success) / 0.15)'
                }}
              >
                <CheckCircle2 className="w-10 h-10 icon-default" style={{ color: 'rgb(var(--success))' }} strokeWidth={2} />
              </motion.div>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'rgb(var(--text))' }}>
                Day {currentDay} Complete!
              </h2>
              {completeDayMutation.data?.takeaway && (
                <div className="mb-6 p-4" style={{ 
                  borderRadius: 'var(--r-lg)',
                  backgroundColor: 'rgb(var(--calm) / 0.1)',
                  border: '1px solid rgb(var(--border))'
                }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--calm))' }}>
                    Today's Takeaway
                  </p>
                  <p style={{ color: 'rgb(var(--text))' }}>
                    {completeDayMutation.data.takeaway}
                  </p>
                </div>
              )}
              <p className="mb-6" style={{ color: 'rgb(var(--muted))' }}>
                {currentDay === 7 
                  ? "You've completed the 7-Day Starter Path! Continue with your daily practice."
                  : "Come back tomorrow for Day " + (currentDay + 1)}
              </p>
              <Link to={createPageUrl('Home')}>
                <Button className="transition-calm" style={{ 
                  borderRadius: 'var(--r-md)',
                  backgroundColor: 'rgb(var(--accent))',
                  color: 'rgb(var(--accent-contrast))'
                }}>
                  Return Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'rgb(var(--bg))' }}>
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={2} />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2" style={{ color: 'rgb(var(--text))' }}>
                Day {currentDay}: {dayStructure.title}
              </h1>
              <p style={{ color: 'rgb(var(--muted))' }}>{dayStructure.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: 'rgb(var(--calm))' }}>
                Day {currentDay} of 7
              </p>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: d <= currentDay 
                        ? 'rgb(var(--calm))'
                        : 'rgb(var(--border))'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Introduction Step */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-0 shadow-soft mb-6" style={{ 
                borderRadius: 'var(--r-xl)',
                backgroundColor: 'rgb(var(--surface))'
              }}>
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ 
                      borderRadius: 'var(--r-md)',
                      backgroundColor: 'rgb(var(--calm) / 0.15)'
                    }}>
                      <Sparkles className="w-6 h-6 icon-default" style={{ color: 'rgb(var(--calm))' }} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-3" style={{ color: 'rgb(var(--text))' }}>
                        Today's Focus
                      </h3>
                      <p className="mb-4 leading-relaxed" style={{ color: 'rgb(var(--text))' }}>
                        {generatedContent?.introduction}
                      </p>
                      {generatedContent?.guidance && (
                        <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--muted))' }}>
                          {generatedContent.guidance}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep('exercise')}
                    className="w-full transition-calm"
                    style={{ 
                      borderRadius: 'var(--r-md)',
                      backgroundColor: 'rgb(var(--calm))',
                      color: 'rgb(var(--accent-contrast))'
                    }}
                  >
                    Begin Exercise
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Exercise Step */}
          {step === 'exercise' && (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-0 shadow-soft mb-6" style={{ 
                borderRadius: 'var(--r-xl)',
                backgroundColor: 'rgb(var(--surface))'
              }}>
                <CardContent className="p-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--text))' }}>
                    {generatedContent?.main_prompt}
                  </h3>

                  {generatedContent?.example && (
                    <div className="mb-4 p-4" style={{ 
                      borderRadius: 'var(--r-md)',
                      backgroundColor: 'rgb(var(--surface-2))',
                      border: '1px solid rgb(var(--border))'
                    }}>
                      <p className="text-sm" style={{ color: 'rgb(var(--muted))' }}>
                        {generatedContent.example}
                      </p>
                    </div>
                  )}

                  <Textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Take your time to reflect and write your thoughts..."
                    rows={6}
                    className="mb-4"
                    style={{ 
                      borderRadius: 'var(--r-md)',
                      borderColor: 'rgb(var(--border))'
                    }}
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('intro')}
                      className="flex-1"
                      style={{ borderRadius: 'var(--r-md)' }}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => completeDayMutation.mutate()}
                      disabled={!userResponse.trim() || completeDayMutation.isPending}
                      className="flex-1 transition-calm"
                      style={{ 
                        borderRadius: 'var(--r-md)',
                        backgroundColor: 'rgb(var(--calm))',
                        color: 'rgb(var(--accent-contrast))',
                        opacity: !userResponse.trim() ? 0.5 : 1
                      }}
                    >
                      {completeDayMutation.isPending ? 'Completing...' : 'Complete Day ' + currentDay}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}