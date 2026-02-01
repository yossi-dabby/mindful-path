import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wind, Anchor, Brain, TrendingUp, Sparkles, Heart, Search, Star, Moon, Users, Zap } from 'lucide-react';
import ExerciseDetail from '../components/exercises/ExerciseDetail';
import ExerciseLibrary from '../components/exercises/ExerciseLibrary';
import AiExerciseRecommendations from '../components/exercises/AiExerciseRecommendations';
import AiExerciseCoaching from '../components/exercises/AiExerciseCoaching';
import QuickStartPanel from '../components/exercises/QuickStartPanel';

const categoryIcons = {
  breathing: Wind,
  grounding: Anchor,
  cognitive_restructuring: Brain,
  behavioral_activation: TrendingUp,
  mindfulness: Sparkles,
  exposure: Heart,
  sleep: Moon,
  relationships: Users,
  stress_management: Zap
};

const categoryColors = {
  breathing: 'bg-blue-100 text-blue-700',
  grounding: 'bg-green-100 text-green-700',
  cognitive_restructuring: 'bg-purple-100 text-purple-700',
  behavioral_activation: 'bg-orange-100 text-orange-700',
  mindfulness: 'bg-pink-100 text-pink-700',
  exposure: 'bg-red-100 text-red-700',
  sleep: 'bg-indigo-100 text-indigo-700',
  relationships: 'bg-teal-100 text-teal-700',
  stress_management: 'bg-amber-100 text-amber-700'
};

export default function Exercises() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCoaching, setShowCoaching] = useState(false);
  const queryClient = useQueryClient();

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      try {
        return await base44.entities.Exercise.list();
      } catch (error) {
        console.error('Error fetching exercises:', error);
        return [];
      }
    },
    initialData: []
  });

  const completeMutation = useMutation({
    mutationFn: async ({ exercise, duration }) => {
      try {
        return await base44.entities.Exercise.update(exercise.id, {
          completed_count: (exercise.completed_count || 0) + 1,
          last_completed: new Date().toISOString(),
          total_time_practiced: (exercise.total_time_practiced || 0) + (duration || 0)
        });
      } catch (error) {
        console.error('Error updating exercise:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises']);
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (exercise) => {
      try {
        return await base44.entities.Exercise.update(exercise.id, {
          favorite: !exercise.favorite
        });
      } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises']);
    }
  });

  const filteredExercises = exercises.filter((exercise) => {
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      (exercise.title && exercise.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exercise.description && exercise.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exercise.tags && exercise.tags.some(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesFavorite = !showFavoritesOnly || exercise.favorite;
    
    return matchesCategory && matchesSearch && matchesFavorite;
  });

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'breathing', label: 'Breathing' },
    { value: 'grounding', label: 'Grounding' },
    { value: 'cognitive_restructuring', label: 'Cognitive' },
    { value: 'behavioral_activation', label: 'Behavioral' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'exposure', label: 'Exposure' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'stress_management', label: 'Stress' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading exercises...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)' }}>
      <div className="p-4 md:p-8 pb-32 md:pb-24 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/'}
              style={{ borderRadius: '50%' }}
              aria-label="Go back to home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-light" style={{ color: '#1A3A34' }}>Exercise Library</h1>
              <p className="text-sm md:text-base md:hidden" style={{ color: '#5A7A72' }}>Practice evidence-based techniques</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCoaching(true)}
              variant="outline"
              className="gap-2 hidden md:flex"
              style={{ borderRadius: '24px' }}
            >
              <Sparkles className="w-4 h-4" />
              AI Plan
            </Button>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="px-3 py-2 md:px-4 md:py-2 transition-all text-sm md:text-base"
            style={{
              borderRadius: '24px',
              background: showFavoritesOnly
                ? 'linear-gradient(145deg, rgba(254, 202, 202, 0.7) 0%, rgba(252, 165, 165, 0.6) 100%)'
                : 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)',
              color: showFavoritesOnly ? '#991B1B' : '#3D5A52',
              boxShadow: '0 4px 12px rgba(38, 166, 154, 0.08)'
            }}
          >
            <Star className={`w-4 h-4 inline mr-1 md:mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            <span className="hidden md:inline">Favorites</span>
            {showFavoritesOnly && <span className="md:hidden">({exercises.filter(e => e.favorite).length})</span>}
            {showFavoritesOnly && <span className="hidden md:inline"> ({exercises.filter(e => e.favorite).length})</span>}
          </button>
          </div>
        </div>
        <p className="text-sm md:text-base ml-0 md:ml-12 hidden md:block" style={{ color: '#5A7A72' }}>Practice evidence-based techniques to manage thoughts and emotions</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="pl-10"
            style={{ borderRadius: '28px' }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6 overflow-x-auto">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="border p-1 inline-flex w-auto min-w-full" style={{
            background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)',
            borderColor: 'rgba(38, 166, 154, 0.25)',
            borderRadius: '28px'
          }}>
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="whitespace-nowrap text-sm px-3"
                style={{
                  borderRadius: '24px',
                  color: selectedCategory === cat.value ? '#fff' : '#3D5A52',
                  background: selectedCategory === cat.value ? '#26A69A' : 'transparent'
                }}
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Quick Start Panel */}
      {!showFavoritesOnly && !searchQuery && selectedCategory === 'all' && (
        <QuickStartPanel
          exercises={exercises}
          onSelectExercise={setSelectedExercise}
        />
      )}

      {/* AI Recommendations */}
      {!showFavoritesOnly && !searchQuery && selectedCategory === 'all' && (
        <div className="mb-6">
          <AiExerciseRecommendations 
            exercises={exercises}
            onSelectExercise={setSelectedExercise}
          />
        </div>
      )}

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ? (
        <Card className="border-0" style={{
          borderRadius: '32px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          boxShadow: '0 12px 40px rgba(38, 166, 154, 0.12), 0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4" style={{
              borderRadius: '50%',
              background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)'
            }}>
              <Sparkles className="w-10 h-10" style={{ color: '#26A69A' }} />
            </div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1A3A34' }}>
              {showFavoritesOnly ? 'No favorite exercises yet' : 'No exercises found'}
            </h2>
            <p style={{ color: '#5A7A72' }}>
              {showFavoritesOnly
                ? 'Mark exercises as favorites to see them here'
                : searchQuery
                ? 'Try adjusting your search or filters'
                : 'Exercises will be added soon to help with your practice.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ExerciseLibrary
          exercises={filteredExercises}
          categoryIcons={categoryIcons}
          categoryColors={categoryColors}
          onSelectExercise={setSelectedExercise}
          onToggleFavorite={(exercise) => toggleFavoriteMutation.mutate(exercise)}
        />
      )}

        {/* Exercise Detail Modal */}
        {selectedExercise && (
          <ExerciseDetail
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            onComplete={(duration) => completeMutation.mutate({ exercise: selectedExercise, duration })}
            onToggleFavorite={(exercise) => toggleFavoriteMutation.mutate(exercise)}
          />
        )}

        {/* AI Exercise Coaching */}
        {showCoaching && (
          <AiExerciseCoaching
            onClose={() => setShowCoaching(false)}
            onSelectExercise={(exercise) => setSelectedExercise(exercise)}
          />
        )}
      </div>
    </div>
  );
}