import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, TrendingUp } from 'lucide-react';

export default function JourneyCard({ journey, progress, onStart, onContinue, onView }) {
  const isStarted = !!progress;
  const isCompleted = progress?.status === 'completed';
  const completionPercentage = progress 
    ? Math.round((progress.completed_steps?.length || 0) / progress.total_steps * 100)
    : 0;

  const categoryColors = {
    anxiety: 'bg-blue-100 text-blue-800',
    depression: 'bg-purple-100 text-purple-800',
    stress: 'bg-orange-100 text-orange-800',
    distress_tolerance: 'bg-teal-100 text-teal-800',
    emotion_regulation: 'bg-pink-100 text-pink-800',
    mindfulness: 'bg-green-100 text-green-800',
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300" style={{
      borderRadius: '20px',
      border: '1px solid rgba(38, 166, 154, 0.2)'
    }}>
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge className={categoryColors[journey.category] || 'bg-gray-100 text-gray-800'}>
            {journey.category}
          </Badge>
          {isCompleted && (
            <Badge className="bg-green-100 text-green-800">
              ✓ Completed
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl" style={{ color: '#1A3A34' }}>
          {journey.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm" style={{ color: '#5A7A72' }}>
          {journey.description}
        </p>

        <div className="flex gap-4 text-xs" style={{ color: '#5A7A72' }}>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{journey.duration_days} days</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{journey.steps?.length || 0} steps</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{journey.difficulty}</span>
          </div>
        </div>

        {isStarted && !isCompleted && (
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: '#5A7A72' }}>
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${completionPercentage}%`,
                  backgroundColor: '#26A69A'
                }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isStarted && (
            <Button
              onClick={() => onStart(journey)}
              className="flex-1"
              style={{
                borderRadius: '12px',
                backgroundColor: '#26A69A',
                color: 'white'
              }}
            >
              Start Journey
            </Button>
          )}
          {isStarted && !isCompleted && (
            <Button
              onClick={() => onContinue(journey, progress)}
              className="flex-1"
              style={{
                borderRadius: '12px',
                backgroundColor: '#26A69A',
                color: 'white'
              }}
            >
              Continue
            </Button>
          )}
          <Button
            onClick={() => onView(journey, progress)}
            variant="outline"
            className="flex-1"
            style={{ borderRadius: '12px' }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}