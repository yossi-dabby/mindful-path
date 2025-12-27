import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Wind, Anchor, Brain, TrendingUp, Sparkles, Heart, Play, Clock } from 'lucide-react';
import ExerciseDetail from '../components/exercises/ExerciseDetail';

const categoryIcons = {
  breathing: Wind,
  grounding: Anchor,
  cognitive_restructuring: Brain,
  behavioral_activation: TrendingUp,
  mindfulness: Sparkles,
  exposure: Heart
};

const categoryColors = {
  breathing: 'bg-blue-100 text-blue-700',
  grounding: 'bg-green-100 text-green-700',
  cognitive_restructuring: 'bg-purple-100 text-purple-700',
  behavioral_activation: 'bg-orange-100 text-orange-700',
  mindfulness: 'bg-pink-100 text-pink-700',
  exposure: 'bg-red-100 text-red-700'
};

export default function Exercises() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const queryClient = useQueryClient();

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: []
  });

  const completeMutation = useMutation({
    mutationFn: (exercise) =>
      base44.entities.Exercise.update(exercise.id, {
        completed_count: (exercise.completed_count || 0) + 1,
        last_completed: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises']);
    }
  });

  const filteredExercises =
    selectedCategory === 'all'
      ? exercises
      : exercises.filter((ex) => ex.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All Exercises' },
    { value: 'breathing', label: 'Breathing' },
    { value: 'grounding', label: 'Grounding' },
    { value: 'cognitive_restructuring', label: 'Cognitive' },
    { value: 'behavioral_activation', label: 'Behavioral' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'exposure', label: 'Exposure' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading exercises...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">CBT Exercises</h1>
        <p className="text-gray-500">Practice techniques to manage thoughts and emotions</p>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="bg-white border border-gray-200 p-1 flex-wrap h-auto">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No exercises yet</h2>
            <p className="text-gray-600">Exercises will be added soon to help with your practice.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => {
            const Icon = categoryIcons[exercise.category] || Sparkles;
            const colorClass = categoryColors[exercise.category] || 'bg-gray-100 text-gray-700';

            return (
              <Card
                key={exercise.id}
                className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedExercise(exercise)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {exercise.completed_count > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {exercise.completed_count}x
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{exercise.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exercise.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {exercise.duration_options?.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {exercise.duration_options.join(', ')} min
                      </div>
                    ) : exercise.duration_minutes ? (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {exercise.duration_minutes} min
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Flexible
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs capitalize">
                      {exercise.difficulty || 'beginner'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetail
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onComplete={() => completeMutation.mutate(selectedExercise)}
        />
      )}
    </div>
  );
}