import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wind, Anchor, Brain, TrendingUp, Sparkles, Heart, Search, Star, Moon, Users, Zap, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import ExerciseDetail from '../components/exercises/ExerciseDetail';
import ExerciseLibrary from '../components/exercises/ExerciseLibrary';
import AiExerciseRecommendations from '../components/exercises/AiExerciseRecommendations';
import AiExerciseCoaching from '../components/exercises/AiExerciseCoaching';
import QuickStartPanel from '../components/exercises/QuickStartPanel';
import InteractiveBreathingTool from '../components/exercises/InteractiveBreathingTool';
import PullToRefresh from '../components/utils/PullToRefresh';
import { mergeExercises, validateExercisesTaxonomy } from '../components/exercises/exercisesData';

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
  breathing: 'bg-teal-100 text-teal-700 border border-teal-200',
  grounding: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  cognitive_restructuring: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  behavioral_activation: 'bg-amber-100 text-amber-700 border border-amber-200',
  mindfulness: 'bg-sky-100 text-sky-700 border border-sky-200',
  exposure: 'bg-rose-100 text-rose-700 border border-rose-200',
  sleep: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  relationships: 'bg-teal-100 text-teal-700 border border-teal-200',
  stress_management: 'bg-orange-100 text-orange-700 border border-orange-200'
};

export default function Exercises() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCoaching, setShowCoaching] = useState(false);
  const [showBreathingTool, setShowBreathingTool] = useState(false);
  const queryClient = useQueryClient();
  const tabsListRef = useRef(null);

  useEffect(() => {
    if (!tabsListRef.current) return;
    const activeTab = tabsListRef.current.querySelector('[data-state="active"]');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      try {
        const apiExercises = await base44.entities.Exercise.list();
        return mergeExercises(apiExercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        return mergeExercises([]);
      }
    },
    initialData: mergeExercises([])
  });

  // Dev-only taxonomy validation — runs once after exercises data is ready
  useEffect(() => {
    if (exercises && exercises.length > 0) {
      validateExercisesTaxonomy(exercises);
    }
  }, [exercises]);

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
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
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
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    }
  });

  const filteredExercises = exercises.filter((exercise) => {
    // Breathing exercises are handled by the new Interactive Breathing Tool
    if (exercise.category === 'breathing') return false;
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesSearch = !searchQuery ||
    exercise.title && exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description && exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.tags && exercise.tags.some((tag) => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFavorite = !showFavoritesOnly || exercise.favorite;

    return matchesCategory && matchesSearch && matchesFavorite;
  });

  const categories = [
  { value: 'all', label: t('exercises.categories.all') },
  { value: 'breathing', label: t('exercises.categories.breathing') },
  { value: 'grounding', label: t('exercises.categories.grounding') },
  { value: 'cognitive_restructuring', label: t('exercises.categories.cognitive') },
  { value: 'behavioral_activation', label: t('exercises.categories.behavioral') },
  { value: 'mindfulness', label: t('exercises.categories.mindfulness') },
  { value: 'exposure', label: t('exercises.categories.exposure') },
  { value: 'sleep', label: t('exercises.categories.sleep') },
  { value: 'relationships', label: t('exercises.categories.relationships') },
  { value: 'stress_management', label: t('exercises.categories.stress') }];


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('exercises.loading')}</p>
      </div>);

  }

  return (
    <PullToRefresh queryKeys={['exercises']}>
      <div className="min-h-dvh w-full bg-transparent">
        <div className="p-4 md:p-8 pb-32 md:pb-24 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location.href = '/'}
                  style={{ borderRadius: '50%' }}
                  aria-label={t('exercises.go_back_aria')} className="text-teal-600 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-none hover:bg-secondary/78 hover:text-foreground active:bg-secondary/88 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex-shrink-0">


              <svg className="rtl:scale-x-[-1]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </Button>
            <div className="min-w-0">
              <h1 className="text-teal-600 text-2xl font-semibold md:text-3xl lg:text-4xl break-words">{t('exercises.page_title')}</h1>
              <p className="text-sm md:text-base md:hidden break-words text-muted-foreground">{t('exercises.page_subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Button
                  onClick={() => setShowCoaching(true)}
                  variant="outline" className="bg-teal-50 text-teal-600 px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-[var(--radius-card)] items-center justify-center whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 min-h-[44px] md:min-h-0 gap-2 hidden md:flex">


              <Sparkles className="w-4 h-4" />
              <span className="whitespace-nowrap">{t('exercises.ai_plan')}</span>
            </Button>
            <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className="bg-teal-50 text-teal-600 px-3 py-2 text-sm rounded-[var(--radius-card)] md:px-4 md:py-2 transition-all md:text-base whitespace-nowrap border shadow-[var(--shadow-sm)] border-border/70 hover:text-foreground">







            <Star className={`w-4 h-4 inline mr-1 md:mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            <span className="hidden md:inline">{t('exercises.favorites')}</span>
            {showFavoritesOnly && <span className="md:hidden">({exercises.filter((e) => e.favorite).length})</span>}
            {showFavoritesOnly && <span className="hidden md:inline"> ({exercises.filter((e) => e.favorite).length})</span>}
          </button>
          </div>
        </div>
        <p className="text-teal-600 ml-0 text-sm md:text-base md:ml-12 hidden md:block">{t('exercises.page_subtitle_full')}</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('exercises.search_placeholder')} className="bg-teal-50 text-foreground pl-10 px-3 py-1 font-normal tracking-[0.001em] leading-6 rounded-[var(--radius-control)] flex h-9 w-full border border-input/90 shadow-[var(--shadow-sm)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 rtl:pl-3 rtl:pr-10"

                style={{ borderRadius: '28px' }} />

        </div>
      </div>

      {/* Category Filter */}
      <div
            id="exercises_category_switcher"
            className="mb-6 overflow-x-auto"
            style={{ overscrollBehaviorX: 'contain' }}>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList ref={tabsListRef} className="inline-flex w-auto min-w-full">
            {categories.map((cat) =>
                <TabsTrigger
                  key={cat.value}
                  value={cat.value} className="text-teal-600 px-3 py-1 text-sm font-medium tracking-[0.003em] rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)] whitespace-nowrap">


                {cat.label}
              </TabsTrigger>
                )}
          </TabsList>
        </Tabs>
      </div>

      {/* Quick Start Panel */}
      {!showFavoritesOnly && !searchQuery && selectedCategory === 'all' &&
          <QuickStartPanel
            exercises={exercises}
            onSelectExercise={setSelectedExercise} />

          }

      {/* ── Interactive Breathing Tool Card ────────────────────────────── */}
      {!showFavoritesOnly && (selectedCategory === 'all' || selectedCategory === 'breathing') &&
          <div className="mb-6">
          <button
              onClick={() => setShowBreathingTool(true)}
              className="w-full text-left transition-transform active:scale-[0.99]"
              aria-label={t('breathing_tool.open_tool')}>

            <Card className="bg-primary text-primary-foreground rounded-[48px] backdrop-blur-[10px] overflow-hidden border border-border/80 shadow-[var(--shadow-lg)]">
              <CardContent className="bg-teal-600 pt-5 pr-5 pb-5 pl-5 p-6 opacity-100 rounded-[32px] md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-white/15 border border-white/10">
                      <Wind className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-white">
                        {t('breathing_tool.card_title')}
                      </h3>
                      <p className="text-sm text-white/80 truncate">
                        {t('breathing_tool.card_subtitle')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/70 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
          }

      {/* When breathing category tab is selected, show the tool directly */}
      {selectedCategory === 'breathing' && !showBreathingTool &&
          <div className="mb-6">
          <button
              onClick={() => setShowBreathingTool(true)}
              className="w-full text-left">

            <Card className="border border-border/80 bg-card shadow-[var(--shadow-lg)]">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-sm)]">
                  <Wind className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-foreground">
                  {t('breathing_tool.card_title')}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {t('breathing_tool.card_subtitle')}
                </p>
                <span
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-medium">

                  <Wind className="w-4 h-4" />
                  {t('breathing_tool.open_tool')}
                </span>
              </CardContent>
            </Card>
          </button>
        </div>
          }

      {/* AI Recommendations */}
      {!showFavoritesOnly && !searchQuery && selectedCategory === 'all' &&
          <div className="mb-6">
          <AiExerciseRecommendations
              exercises={exercises}
              onSelectExercise={setSelectedExercise} />

        </div>
          }

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ?
          <Card className="surface-secondary rounded-[var(--radius-card)] border-border/70 shadow-[var(--shadow-md)]">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4 rounded-full bg-secondary text-primary shadow-[var(--shadow-sm)]">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-foreground">
              {showFavoritesOnly ? t('exercises.empty_state.favorites_title') : t('exercises.empty_state.no_results_title')}
            </h2>
            <p className="text-muted-foreground">
              {showFavoritesOnly ?
                t('exercises.empty_state.favorites_message') :
                searchQuery ?
                t('exercises.empty_state.search_message') :
                t('exercises.empty_state.no_exercises_message')}
            </p>
          </CardContent>
        </Card> :

          <ExerciseLibrary
            exercises={filteredExercises}
            categoryIcons={categoryIcons}
            categoryColors={categoryColors}
            onSelectExercise={setSelectedExercise}
            onToggleFavorite={(exercise) => toggleFavoriteMutation.mutate(exercise)} />

          }

        {/* Exercise Detail Modal */}
        {selectedExercise &&
          <ExerciseDetail
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
            onComplete={(duration) => completeMutation.mutate({ exercise: selectedExercise, duration })}
            onToggleFavorite={(exercise) => toggleFavoriteMutation.mutate(exercise)} />

          }

        {/* AI Exercise Coaching */}
        {showCoaching &&
          <AiExerciseCoaching
            onClose={() => setShowCoaching(false)}
            onSelectExercise={(exercise) => setSelectedExercise(exercise)} />

          }

        {/* Interactive Breathing Tool */}
        {showBreathingTool &&
          <InteractiveBreathingTool
            onClose={() => setShowBreathingTool(false)}
            onComplete={() => setShowBreathingTool(false)} />

          }
        </div>
      </div>
    </PullToRefresh>);

}