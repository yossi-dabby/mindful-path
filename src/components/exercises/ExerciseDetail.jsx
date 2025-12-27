import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Play, CheckCircle, Clock } from 'lucide-react';

export default function ExerciseDetail({ exercise, onClose, onComplete }) {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    onComplete();
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-0 shadow-2xl my-8">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{exercise.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {exercise.difficulty}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {exercise.duration_minutes} minutes
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-600">{exercise.description}</p>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {exercise.instructions}
                </p>
              </div>
            </div>

            {/* Completion Stats */}
            {exercise.completed_count > 0 && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-800">
                  You've completed this exercise <span className="font-semibold">{exercise.completed_count} times</span>
                  {exercise.last_completed && (
                    <span className="text-green-600">
                      {' '}· Last practiced {new Date(exercise.last_completed).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Action Buttons */}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}