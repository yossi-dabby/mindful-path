import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { urgeSurfingSteps } from './mindGamesContent';

export default function UrgeSurfing({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState(null);

  const currentItem = urgeSurfingSteps[currentIndex];

  const handleFinishChoice = (choice) => {
    setSelectedFinish(choice);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % urgeSurfingSteps.length;
    setCurrentIndex(nextIndex);
    setSelectedFinish(null);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-sm font-semibold mb-4 break-words" style={{ color: '#1A3A34' }}>
          {currentItem.title}
        </p>

        <div className="mb-4">
          <ul className="space-y-2">
            {currentItem.steps.map((step, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-sm flex-shrink-0" style={{ color: '#26A69A' }}>•</span>
                <span className="text-sm break-words whitespace-normal flex-1 min-w-0" style={{ color: '#1A3A34' }}>
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm font-semibold mb-3" style={{ color: '#1A3A34' }}>
          After surfing, pick one:
        </p>

        <div className="space-y-2">
          {currentItem.finishChoices.map((choice, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal break-words min-w-0"
              style={{
                borderRadius: '12px',
                borderColor: selectedFinish === choice
                  ? 'rgba(34, 197, 94, 0.4)'
                  : 'rgba(38, 166, 154, 0.2)',
                backgroundColor: selectedFinish === choice
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'transparent'
              }}
              onClick={() => handleFinishChoice(choice)}
            >
              <span className="text-sm leading-snug">{choice}</span>
            </Button>
          ))}
        </div>

        {selectedFinish && (
          <div className="mt-4 p-3" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <p className="text-sm font-medium break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              ✓ Good! Urges rise and fall. You rode the wave.
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          Close
        </Button>
        {selectedFinish && (
          <Button
            onClick={handleNext}
            style={{
              borderRadius: '12px',
              backgroundColor: '#26A69A',
              color: 'white'
            }}
          >
            Try Another
          </Button>
        )}
      </div>
    </div>
  );
}