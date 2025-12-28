import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiJournalPrompts({ onSelectPrompt, onClose }) {
  const [prompts, setPrompts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: recentMoods } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: async () => {
      const moods = await base44.entities.MoodEntry.list('-created_date', 5);
      return moods;
    },
    initialData: []
  });

  const { data: recentJournals } = useQuery({
    queryKey: ['recentJournals'],
    queryFn: async () => {
      const journals = await base44.entities.ThoughtJournal.list('-created_date', 5);
      return journals;
    },
    initialData: []
  });

  const generatePrompts = async () => {
    setIsLoading(true);
    try {
      const moodContext = recentMoods.length > 0 
        ? `Recent moods: ${recentMoods.map(m => `${m.mood} (${m.emotions?.join(', ')})`).join('; ')}`
        : 'No recent mood data';

      const journalContext = recentJournals.length > 0
        ? `Recent journal themes: ${recentJournals.map(j => j.situation?.replace(/<[^>]*>/g, '').substring(0, 100)).filter(Boolean).join('; ')}`
        : 'No recent journal entries';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `As a CBT therapist, generate 4 personalized journal prompts for the user based on their context:

${moodContext}
${journalContext}

Create prompts that:
1. Help process recent emotions or situations
2. Encourage cognitive restructuring
3. Promote self-reflection and growth
4. Are specific, actionable, and therapeutic

Each prompt should be a thoughtful question or scenario to explore.`,
        response_json_schema: {
          type: "object",
          properties: {
            prompts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  prompt: { type: "string" },
                  focus: { type: "string" }
                }
              }
            }
          }
        }
      });

      setPrompts(response.prompts);
    } catch (error) {
      console.error('Failed to generate prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <CardTitle>AI Journal Prompts</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Get personalized prompts based on your recent mood and journal entries
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {!prompts && !isLoading && (
              <div className="text-center py-8">
                <Button
                  onClick={generatePrompts}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Prompts
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600">Creating personalized prompts...</p>
              </div>
            )}

            <AnimatePresence>
              {prompts && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {prompts.map((prompt, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                            onClick={() => onSelectPrompt(prompt.prompt)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-800">{prompt.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {prompt.focus}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{prompt.prompt}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={generatePrompts}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate New Prompts
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Start Blank Entry
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