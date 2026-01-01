import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Play, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExerciseLibrary({ exercises, categoryIcons, categoryColors, onSelectExercise, onToggleFavorite }) {
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
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
              onClick={() => onSelectExercise(exercise)}
            >
              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(exercise);
                }}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
              >
                <Heart
                  className={`w-4 h-4 ${exercise.favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                />
              </button>

              {/* Image/Video Thumbnail */}
              {exercise.image_url && (
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={exercise.image_url}
                    alt={exercise.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {exercise.video_url && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {exercise.completed_count > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      ✓ {exercise.completed_count}x
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-gray-800 mb-2 text-lg group-hover:text-green-600 transition-colors">
                  {exercise.title || 'Untitled Exercise'}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exercise.description || ''}</p>

                {/* Tags */}
                {exercise.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {exercise.tags.filter(tag => tag && typeof tag === 'string').slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs px-2 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exercise.duration_options?.length > 0
                      ? `${exercise.duration_options[0]}-${exercise.duration_options[exercise.duration_options.length - 1]} min`
                      : 'Flexible'}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {exercise.difficulty || 'beginner'}
                  </Badge>
                </div>

                {/* Progress Bar */}
                {exercise.completed_count > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{exercise.total_time_practiced || 0} min</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min((exercise.completed_count / 10) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}