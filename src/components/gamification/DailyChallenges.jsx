import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Sparkles, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const challengeIcons = {
  mood_check: '😊',
  journal: '📝',
  exercise: '🧘',
  meditation: '🧘‍♀️',
  goal_action: '🎯',
  gratitude: '🙏'
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700'
};

export default function DailyChallenges() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['dailyChallenges', today],
    queryFn: () => base44.entities.DailyChallenge.filter({ date: today }),
    initialData: []
  });

  const completeMutation = useMutation({
    mutationFn: (challenge) => 
      base44.entities.DailyChallenge.update(challenge.id, {
        completed: true,
        current_progress: challenge.target_value
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['dailyChallenges']);
    }
  });

  const completed = challenges.filter(c => c.completed).length;
  const total = challenges.length;

  if (isLoading) return null;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            Today's Challenges
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-700 border-0">
            {completed}/{total} completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">New challenges coming soon!</p>
          </div>
        ) : (
          challenges.map((challenge, i) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={cn(
                "bg-white rounded-xl p-4 transition-all",
                challenge.completed ? "opacity-75" : "hover:shadow-md"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{challengeIcons[challenge.challenge_type]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{challenge.title}</p>
                        <Badge className={difficultyColors[challenge.difficulty]} variant="secondary">
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                      
                      {/* Progress Bar */}
                      {challenge.target_value > 1 && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-500">Progress</p>
                            <p className="text-xs font-semibold text-gray-700">
                              {challenge.current_progress}/{challenge.target_value}
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${(challenge.current_progress / challenge.target_value) * 100}%` 
                              }}
                              className="bg-gradient-to-r from-purple-400 to-blue-500 h-2 rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                        <span>{challenge.points} points</span>
                      </div>
                    </div>
                  </div>

                  {challenge.completed ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-semibold">Done!</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeMutation.mutate(challenge)}
                      disabled={completeMutation.isPending}
                      className="border-purple-300 hover:bg-purple-50"
                    >
                      <Circle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}