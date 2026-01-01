import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Play, CheckCircle, Clock, BookOpen, Lightbulb, Star, Video, Heart, Headphones } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import BreathingVisual from './BreathingVisual';
import AudioPlayer from '../audio/AudioPlayer';
import { motion } from 'framer-motion';
import PremiumBadge from '../subscription/PremiumBadge';

export default function ExerciseDetail({ exercise, onClose, onComplete, onToggleFavorite }) {
  const [completed, setCompleted] = useState(false);
  const [showBreathingVisual, setShowBreathingVisual] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch linked audio content
  const { data: audioContent } = useQuery({
    queryKey: ['audioContent', exercise.id],
    queryFn: () => base44.entities.AudioContent.filter({ linked_exercise_id: exercise.id }),
    initialData: []
  });

  const handleComplete = () => {
    setCompleted(true);
    onComplete();
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleStartBreathing = (duration) => {
    setSelectedDuration(duration);
    setShowBreathingVisual(true);
  };

  const handleBreathingComplete = () => {
    handleComplete();
  };

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl my-8"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{exercise.title}</CardTitle>
                  <button
                    onClick={() => onToggleFavorite?.(exercise)}
                    className="p-2 rounded-full hover:bg-white/50 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${exercise.favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="capitalize">
                    {exercise.difficulty}
                  </Badge>
                  {exercise.difficulty === 'advanced' && <PremiumBadge />}
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
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className={`grid w-full ${audioContent.length > 0 ? 'grid-cols-5' : 'grid-cols-4'}`}>
                <TabsTrigger value="overview">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="instructions">
                  <Play className="w-4 h-4 mr-2" />
                  Practice
                </TabsTrigger>
                {audioContent.length > 0 && (
                  <TabsTrigger value="audio">
                    <Headphones className="w-4 h-4 mr-2" />
                    Audio
                  </TabsTrigger>
                )}
                <TabsTrigger value="benefits">
                  <Star className="w-4 h-4 mr-2" />
                  Benefits
                </TabsTrigger>
                <TabsTrigger value="tips">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Tips
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">About This Exercise</h3>
                  <p className="text-gray-600 leading-relaxed">{exercise.description || ''}</p>
                  {exercise.detailed_description && (
                    <p className="text-gray-600 leading-relaxed mt-3">{exercise.detailed_description}</p>
                  )}
                </div>

                {/* Video Preview */}
                {exercise.video_url && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Video Demonstration</h3>
                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
                      <iframe
                        src={exercise.video_url}
                        className="w-full h-full"
                        allowFullScreen
                        title={exercise.title}
                      />
                    </div>
                  </div>
                )}

                {/* Tags */}
                {exercise.tags?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Helps With</h3>
                    <div className="flex flex-wrap gap-2">
                      {exercise.tags.filter(tag => tag && typeof tag === 'string').map((tag, i) => (
                        <Badge key={i} variant="secondary" className="capitalize">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Audio Tab */}
              {audioContent.length > 0 && (
                <TabsContent value="audio" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Guided Audio</h3>
                    <p className="text-gray-600 mb-4">
                      Follow along with professionally narrated audio guidance for this exercise.
                    </p>
                    {audioContent.map((audio) => (
                      <div key={audio.id} className="mb-4">
                        <AudioPlayer 
                          audioContent={audio} 
                          onComplete={handleComplete}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}

              {/* Instructions Tab */}
              <TabsContent value="instructions" className="space-y-4">
                {exercise.detailed_steps?.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Step-by-Step Guide</h3>
                    <div className="space-y-4">
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
                            <p className="text-gray-700">{step.description}</p>
                            {step.duration_seconds && (
                              <p className="text-sm text-gray-500 mt-1">
                                Duration: {step.duration_seconds} seconds
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {exercise.instructions || ''}
                      </p>
                    </div>
                  </div>
                )}

                {/* Duration Options for Breathing Exercises */}
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
              <TabsContent value="benefits" className="space-y-4">
                <div>
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
                </div>
              </TabsContent>

              {/* Tips Tab */}
              <TabsContent value="tips" className="space-y-4">
                <div>
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
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-600">
                        Practice regularly for best results. Find a quiet space, start slowly, and be patient with yourself.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Completion Stats */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Progress</h3>
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
            </div>

            {/* Action Buttons */}
            {exercise.category !== 'breathing' && (
              <div className="flex gap-3">
                {completed ? (
                  <div className="flex-1 bg-green-100 border border-green-300 rounded-xl p-4 flex items-center justify-center gap-2 text-green-700 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    Exercise Completed!
                  </div>
                ) : (
                  <>
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Close
                    </Button>
                    <Button onClick={handleComplete} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </div>
      </div>
      );
      }