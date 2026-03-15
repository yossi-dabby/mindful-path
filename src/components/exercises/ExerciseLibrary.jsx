import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ExerciseMediaBadge from './ExerciseMediaBadge';

export default function ExerciseLibrary({ exercises, categoryIcons, categoryColors, onSelectExercise, onToggleFavorite }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exercises.map((exercise, index) => {
        const Icon = categoryIcons[exercise.category] || Play;
        const colorClass = categoryColors[exercise.category] || 'bg-gray-100 text-gray-700';

        return (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}>

            <Card className="bg-card text-card-foreground rounded-[32px] backdrop-blur-[10px] border border-border/80 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all cursor-pointer group relative overflow-hidden"

            onClick={() => onSelectExercise(exercise)}>

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(exercise);
                }} className="bg-teal-300 mx-1 p-2 opacity-100 rounded-full absolute top-3 right-3 z-10 hover:bg-card shadow-[var(--shadow-sm)] transition-all border border-border/70">


                <Heart className="text-teal-600 lucide lucide-heart w-4 h-4" />


              </button>

              {/* Image/Video Thumbnail */}
              {exercise.image_url &&
              <div className="h-40 overflow-hidden relative">
                  <img
                  src={exercise.image_url}
                  alt={exercise.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                  {exercise.video_url &&
                <div className="absolute inset-0 bg-[hsl(var(--overlay)/0.12)] flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-card/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                }
                </div>
              }

              <CardContent className="bg-teal-300 p-5 rounded-3xl">
                <div className="mr-8 mb-2 flex items-start justify-between">
                  <div className="bg-teal-400 text-sky-700 mx-3 opacity-90 rounded-xl w-10 h-10 border border-sky-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="text-teal-600 lucide lucide-anchor w-5 h-5" />
                  </div>
                  {exercise.completed_count > 0 &&
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      ✓ {exercise.completed_count}x
                    </Badge>
                  }
                </div>

                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1 break-words">
                    {exercise.title || t('exercises.detail.untitled_exercise')}
                  </h3>
                  <ExerciseMediaBadge mediaType={exercise.media_type} />
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{exercise.description || ''}</p>

                {/* Tags */}
                {exercise.tags?.length > 0 &&
                <div className="flex flex-wrap gap-1 mb-3">
                    {exercise.tags.filter((tag) => tag && typeof tag === 'string').slice(0, 3).map((tag, i) =>
                  <Badge key={i} variant="outline" className="bg-teal-100 text-muted-foreground px-2 py-0.5 text-xs font-medium tracking-[0.01em] rounded-[var(--radius-chip)] inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/70">
                        {tag}
                      </Badge>
                  )}
                  </div>
                }

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exercise.duration_options?.length > 0 ?
                    `${exercise.duration_options[0]}-${exercise.duration_options[exercise.duration_options.length - 1]} ${t('common.minutes_short')}` :
                    t('exercises.library.flexible')}
                  </div>
                  <Badge variant="outline" className="bg-teal-100 text-muted-foreground px-2.5 py-1 text-xs font-medium capitalize tracking-[0.01em] rounded-[var(--radius-chip)] inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/70">
                    {exercise.difficulty || 'beginner'}
                  </Badge>
                </div>

                {/* Progress Bar */}
                {exercise.completed_count > 0 &&
                <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{t('journeys.card.progress')}</span>
                      <span>{exercise.total_time_practiced || 0} {t('common.minutes_short')}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(exercise.completed_count / 10 * 100, 100)}%`
                      }} />

                    </div>
                  </div>
                }
              </CardContent>
            </Card>
          </motion.div>);

      })}
    </div>);

}