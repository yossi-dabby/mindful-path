import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, Lightbulb, Star, Video, Heart, Headphones, Eye } from 'lucide-react';
import BreathingVisual from '../components/exercises/BreathingVisual';
import AudioPlayer from '../components/audio/AudioPlayer';
import { motion } from 'framer-motion';
import PremiumBadge from '../components/subscription/PremiumBadge';
import ExerciseMediaBadge from '../components/exercises/ExerciseMediaBadge';

export default function ExerciseViewPage() {
  const { t } = useTranslation();
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [completed, setCompleted] = useState(false);
  const [showBreathingVisual, setShowBreathingVisual] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: exercise, isLoading } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: async () => {
      const exercises = await base44.entities.Exercise.filter({ id: exerciseId });
      return exercises[0];
    }
  });

  const { data: audioContent } = useQuery({
    queryKey: ['audioContent', exerciseId],
    queryFn: () => base44.entities.AudioContent.filter({ linked_exercise_id: exerciseId }),
    initialData: [],
    enabled: !!exerciseId
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Exercise.update(exerciseId, {
        favorite: !exercise.favorite
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise', exerciseId] });
    }
  });

  const completeExerciseMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      await base44.entities.Exercise.update(exerciseId, {
        completed_count: (exercise.completed_count || 0) + 1,
        total_time_practiced: (exercise.total_time_practiced || 0) + (exercise.duration_minutes || 5),
        last_completed: now
      });
    },
    onSuccess: () => {
      setCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['exercise', exerciseId] });
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  });

  const handleStartBreathing = (duration) => {
    setSelectedDuration(duration);
    setShowBreathingVisual(true);
  };

  const handleBreathingComplete = () => {
    completeExerciseMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading exercise...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('exercise_view.not_found')}</p>
          <Button onClick={() => navigate(-1)}>{t('exercise_view.go_back')}</Button>
        </div>
      </div>
    );
  }

  if (showBreathingVisual && exercise.category === 'breathing') {
    return (
      <BreathingVisual
        exercise={exercise}
        duration={selectedDuration}
        onClose={() => setShowBreathingVisual(false)}
        onComplete={handleBreathingComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label={t('exercise_view.go_back_aria')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-800">{exercise.title || t('exercise_view.untitled')}</h1>
            </div>
            <button
              onClick={() => toggleFavoriteMutation.mutate()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={exercise.favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-5 h-5 ${exercise.favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize">
            {exercise.difficulty || 'beginner'}
          </Badge>
          {exercise.difficulty === 'advanced' && <PremiumBadge />}
          <ExerciseMediaBadge mediaType={exercise.media_type} size="md" />
          {exercise.duration_options?.length > 0 ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {exercise.duration_options.join(', ')} min options
            </Badge>
          ) : exercise.duration_minutes && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {exercise.duration_minutes} minutes
            </Badge>
          )}
          {exercise.video_url && (
            <Badge className="flex items-center gap-1 bg-purple-100 text-purple-700">
              <Video className="w-3 h-3" />
              Video
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Main Content */}
          <div className="flex flex-col space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className={`grid w-full ${audioContent.length > 0 ? 'grid-cols-5' : 'grid-cols-4'}`}>
                <TabsTrigger value="overview">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t('exercise_view.tabs.overview')}
                </TabsTrigger>
                <TabsTrigger value="instructions">
                  <Play className="w-4 h-4 mr-2" />
                  {t('exercise_view.tabs.practice')}
                </TabsTrigger>
                {audioContent.length > 0 && (
                  <TabsTrigger value="audio">
                    <Headphones className="w-4 h-4 mr-2" />
                    {t('exercise_view.tabs.audio')}
                  </TabsTrigger>
                )}
                <TabsTrigger value="benefits">
                  <Star className="w-4 h-4 mr-2" />
                  {t('exercise_view.tabs.benefits')}
                </TabsTrigger>
                <TabsTrigger value="tips">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {t('exercise_view.tabs.tips')}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4" style={{ maxHeight: '50vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">About This Exercise</h3>
                    <p className="text-gray-600 leading-relaxed">{exercise.description || ''}</p>
                    {exercise.detailed_description && (
                      <p className="text-gray-600 leading-relaxed mt-3">{exercise.detailed_description}</p>
                    )}
                  </CardContent>
                </Card>

                {exercise.media_type === 'visualization' && exercise.visualization_script && (
                  <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Guided Visualization</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed italic">
                        "{exercise.visualization_script}"
                      </p>
                    </CardContent>
                  </Card>
                )}

                {exercise.video_url && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Video Demonstration</h3>
                      <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
                        <iframe
                          src={exercise.video_url}
                          className="w-full h-full"
                          allowFullScreen
                          title={exercise.title}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {exercise.audio_url && (
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Headphones className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Audio Guide</h3>
                      </div>
                      <audio 
                        controls 
                        className="w-full" 
                        src={exercise.audio_url}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </CardContent>
                  </Card>
                )}

                {exercise.tags?.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Helps With</h3>
                      <div className="flex flex-wrap gap-2">
                        {exercise.tags.filter(tag => tag && typeof tag === 'string').map((tag, i) => (
                          <Badge key={i} variant="secondary" className="capitalize">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Audio Tab */}
              {audioContent.length > 0 && (
                <TabsContent value="audio" className="space-y-4" style={{ maxHeight: '50vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Guided Audio</h3>
                      <p className="text-gray-600 mb-4">
                        Follow along with professionally narrated audio guidance for this exercise.
                      </p>
                      {audioContent.map((audio) => (
                        <div key={audio.id} className="mb-4">
                          <AudioPlayer 
                            audioContent={audio} 
                            onComplete={() => completeExerciseMutation.mutate()}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Instructions Tab */}
              <TabsContent value="instructions" className="space-y-4" style={{ maxHeight: '50vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {exercise.detailed_steps?.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Step-by-Step Guide</h3>
                    {exercise.detailed_steps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200"
                      >
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
                          {step.step_number || i + 1}
                        </div>
                        <div className="flex-1">
                          {step.title && (
                            <h4 className="font-semibold text-gray-800 mb-1">{step.title}</h4>
                          )}
                          <p className="text-gray-700">{step.description || ''}</p>
                          {step.duration_seconds && (
                            <p className="text-sm text-gray-500 mt-1">
                              Duration: {step.duration_seconds} seconds
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {exercise.instructions || ''}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {exercise.category === 'breathing' && exercise.duration_options?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Choose Duration</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {exercise.duration_options.map((duration) => (
                        <Button
                          key={duration}
                          onClick={() => handleStartBreathing(duration)}
                          className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg font-semibold"
                        >
                          {duration} min
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Benefits Tab */}
              <TabsContent value="benefits" className="space-y-4" style={{ maxHeight: '50vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Benefits</h3>
                    {exercise.benefits?.length > 0 ? (
                      <div className="space-y-3">
                        {exercise.benefits.filter(benefit => benefit && typeof benefit === 'string').map((benefit, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 bg-green-50 rounded-lg p-4 border border-green-200"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700">{benefit}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        This exercise helps improve mental well-being, reduce stress, and enhance emotional regulation.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tips Tab */}
              <TabsContent value="tips" className="space-y-4" style={{ maxHeight: '50vh', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Helpful Tips</h3>
                    {exercise.tips?.length > 0 ? (
                      <div className="space-y-3">
                        {exercise.tips.filter(tip => tip && typeof tip === 'string').map((tip, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200"
                          >
                            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-700">{tip}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        Practice regularly for best results. Find a quiet space, start slowly, and be patient with yourself.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Mobile Action Buttons */}
            {exercise.category !== 'breathing' && (
              <div className="lg:hidden flex gap-3">
                {completed ? (
                  <div className="flex-1 bg-green-100 border border-green-300 rounded-xl p-4 flex items-center justify-center gap-2 text-green-700 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    Exercise Completed!
                  </div>
                ) : (
                  <Button onClick={() => completeExerciseMutation.mutate()} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Progress Sidebar - Desktop */}
          <div className="hidden lg:flex lg:flex-col gap-4 self-start sticky top-20">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{exercise.completed_count || 0}</p>
                    <p className="text-xs text-gray-600">Times Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{exercise.total_time_practiced || 0}</p>
                    <p className="text-xs text-gray-600">Minutes Practiced</p>
                  </div>
                </div>
                {exercise.last_completed && (
                  <p className="text-xs text-gray-500 mt-3">
                    Last practiced: {new Date(exercise.last_completed).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </CardContent>
            </Card>

            {exercise.category !== 'breathing' && (
              <div className="flex flex-col gap-3">
                {completed ? (
                  <div className="bg-green-100 border border-green-300 rounded-xl p-4 flex items-center justify-center gap-2 text-green-700 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    Exercise Completed!
                  </div>
                ) : (
                  <Button onClick={() => completeExerciseMutation.mutate()} className="w-full bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}