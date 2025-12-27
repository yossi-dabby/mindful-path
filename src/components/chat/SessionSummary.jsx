import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Dumbbell, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function SessionSummary({ conversation }) {
  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: []
  });

  const suggestedExercises = exercises.filter(ex => 
    conversation.suggested_exercises?.includes(ex.id)
  );

  if (!conversation.session_summary) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-t border-purple-200 p-4 md:p-6">
      <Card className="max-w-4xl mx-auto border-0 shadow-lg">
        <CardHeader className="border-b bg-white">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <FileText className="w-5 h-5" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6 bg-white">
          {/* Summary Text */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Key Takeaways
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {conversation.session_summary}
            </p>
          </div>

          {/* Suggested Exercises */}
          {suggestedExercises.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-purple-600" />
                Recommended Exercises
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedExercises.map((exercise) => (
                  <Link key={exercise.id} to={createPageUrl('Exercises')}>
                    <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-1">{exercise.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{exercise.description}</p>
                        {exercise.duration_options?.length > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            {exercise.duration_options.join(', ')} min
                          </Badge>
                        ) : exercise.duration_minutes ? (
                          <Badge variant="outline" className="text-xs">
                            {exercise.duration_minutes} min
                          </Badge>
                        ) : null}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Resources */}
          {conversation.recommended_resources?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Helpful Resources
              </h3>
              <div className="space-y-2">
                {conversation.recommended_resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">{resource.title}</h4>
                        <p className="text-xs text-gray-600">{resource.description}</p>
                        {resource.type && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {resource.type}
                          </Badge>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t flex gap-3">
            <Link to={createPageUrl('Journal')} className="flex-1">
              <Button variant="outline" className="w-full">
                Reflect in Journal
              </Button>
            </Link>
            <Link to={createPageUrl('Exercises')} className="flex-1">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                View All Exercises
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}