import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Lock, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function JourneyDetail({ journey, progress, onClose, onPlayGame }) {
  const [reflection, setReflection] = useState('');
  const [savingStep, setSavingStep] = useState(null);
  const queryClient = useQueryClient();

  const currentStepIndex = progress?.current_step || 0;
  const completedStepIndices = new Set(
    progress?.completed_steps?.map(s => s.step_index) || []
  );

  const handleCompleteStep = async (stepIndex) => {
    if (!progress) return;
    
    setSavingStep(stepIndex);
    try {
      const updatedCompletedSteps = [
        ...(progress.completed_steps || []),
        {
          step_index: stepIndex,
          completed_date: new Date().toISOString(),
          reflection: reflection
        }
      ];

      const isLastStep = stepIndex === journey.steps.length - 1;
      
      await base44.entities.UserJourneyProgress.update(progress.id, {
        completed_steps: updatedCompletedSteps,
        current_step: Math.min(stepIndex + 1, journey.steps.length - 1),
        status: isLastStep ? 'completed' : 'in_progress',
        completed_date: isLastStep ? new Date().toISOString() : null
      });

      setReflection('');
      queryClient.invalidateQueries({ queryKey: ['journey_progress'] });
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
    } catch (error) {
      console.error('Failed to complete step:', error);
    } finally {
      setSavingStep(null);
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto overflow-x-hidden">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A3A34' }}>
          {journey.title}
        </h2>
        <p className="text-sm mb-4" style={{ color: '#5A7A72' }}>
          {journey.description}
        </p>
        
        {journey.outcomes && journey.outcomes.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: '#26A69A' }}>
              What you'll gain:
            </p>
            <ul className="space-y-1">
              {journey.outcomes.map((outcome, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: '#5A7A72' }}>
                  <span>•</span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold" style={{ color: '#1A3A34' }}>
          Journey Steps
        </h3>
        
        {journey.steps?.map((step, index) => {
          const isCompleted = completedStepIndices.has(index);
          const isCurrent = index === currentStepIndex && !isCompleted;
          const isLocked = !progress || (index > currentStepIndex && !isCompleted);

          return (
            <Card 
              key={index}
              className="p-4"
              style={{
                borderRadius: '16px',
                border: isCurrent 
                  ? '2px solid #26A69A' 
                  : '1px solid rgba(38, 166, 154, 0.2)',
                backgroundColor: isCompleted 
                  ? 'rgba(34, 197, 94, 0.05)' 
                  : 'white'
              }}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 pt-1">
                  {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {!isCompleted && !isLocked && <Circle className="w-5 h-5 text-teal-600" />}
                  {isLocked && <Lock className="w-5 h-5 text-gray-400" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <Badge variant="outline" className="mb-1">
                        Day {step.day}
                      </Badge>
                      <h4 className="font-semibold" style={{ color: '#1A3A34' }}>
                        {step.title}
                      </h4>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3" style={{ color: '#5A7A72' }}>
                    {step.description}
                  </p>

                  {!isLocked && !isCompleted && (
                    <div className="space-y-3">
                      <Button
                        onClick={() => onPlayGame(step.game_slug)}
                        size="sm"
                        style={{
                          borderRadius: '10px',
                          backgroundColor: '#9F7AEA',
                          color: 'white'
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Play Game
                      </Button>

                      {step.reflection_prompt && (
                        <div>
                          <p className="text-xs mb-2" style={{ color: '#5A7A72' }}>
                            {step.reflection_prompt}
                          </p>
                          <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            placeholder="Your reflection (optional)"
                            rows={2}
                            className="w-full p-2 text-sm rounded-lg border"
                            style={{ borderColor: 'rgba(38, 166, 154, 0.3)' }}
                          />
                        </div>
                      )}

                      <Button
                        onClick={() => handleCompleteStep(index)}
                        disabled={savingStep === index}
                        size="sm"
                        variant="outline"
                        style={{ borderRadius: '10px' }}
                      >
                        {savingStep === index ? 'Saving...' : 'Mark Complete'}
                      </Button>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="text-xs p-2 rounded-lg" style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      color: '#5A7A72'
                    }}>
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={onClose}
        variant="outline"
        className="w-full"
        style={{ borderRadius: '12px' }}
      >
        Close
      </Button>
    </div>
  );
}