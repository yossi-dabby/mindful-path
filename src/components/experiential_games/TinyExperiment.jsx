import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { tinyExperimentItems } from './mindGamesContent';

export default function TinyExperiment({ onClose }) {
  const [currentIndex] = useState(Math.floor(Math.random() * tinyExperimentItems.length));
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [selectedReflection, setSelectedReflection] = useState(null);

  const currentItem = tinyExperimentItems[currentIndex];

  const handleExperimentSelect = (experiment) => {
    setSelectedExperiment(experiment);
    setSelectedReflection(null);
  };

  const handleReflectionSelect = (option) => {
    setSelectedReflection(option);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 border-0" style={{
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-xs font-medium mb-1" style={{ color: '#5A7A72' }}>
          Belief to test:
        </p>
        <p className="text-sm italic" style={{ color: '#1A3A34' }}>
          "{currentItem.belief}"
        </p>
      </Card>

      <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>
        Choose a 2-minute experiment:
      </p>
      <div className="space-y-2">
        {currentItem.experiments.map((experiment, index) => {
          const isSelected = selectedExperiment === experiment;
          return (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              style={{
                borderRadius: '12px',
                borderColor: isSelected
                  ? 'rgba(38, 166, 154, 0.4)'
                  : 'rgba(38, 166, 154, 0.2)',
                backgroundColor: isSelected
                  ? 'rgba(38, 166, 154, 0.1)'
                  : 'transparent'
              }}
              onClick={() => handleExperimentSelect(experiment)}
            >
              {experiment}
            </Button>
          );
        })}
      </div>

      {selectedExperiment && (
        <>
          <Card className="p-4 border-0" style={{
            borderRadius: '16px',
            background: 'rgba(38, 166, 154, 0.1)',
            border: '1px solid rgba(38, 166, 154, 0.2)'
          }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#1A3A34' }}>
              {currentItem.reflection.question}
            </p>
            <div className="space-y-2">
              {currentItem.reflection.options.map((option, index) => {
                const isSelected = selectedReflection === option;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    style={{
                      borderRadius: '10px',
                      borderColor: isSelected
                        ? 'rgba(34, 197, 94, 0.4)'
                        : 'rgba(38, 166, 154, 0.2)',
                      backgroundColor: isSelected
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'transparent'
                    }}
                    onClick={() => handleReflectionSelect(option)}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          </Card>

          {selectedReflection && (
            <Card className="p-3 border-0" style={{
              borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <p className="text-xs" style={{ color: '#1A3A34' }}>
                ✓ Great observation! Notice what you learned from this experiment.
              </p>
            </Card>
          )}
        </>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          Close
        </Button>
      </div>
    </div>
  );
}