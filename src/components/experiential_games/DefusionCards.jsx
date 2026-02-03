import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { defusionCards } from './mindGamesContent';

export default function DefusionCards({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLine, setSelectedLine] = useState(null);

  const currentCard = defusionCards[currentIndex];

  const handleSelectLine = (line) => {
    setSelectedLine(line);
  };

  const handleNext = () => {
    const randomIndex = Math.floor(Math.random() * defusionCards.length);
    setCurrentIndex(randomIndex);
    setSelectedLine(null);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-xs font-medium mb-2" style={{ color: '#5A7A72' }}>
          Sticky Thought:
        </p>
        <p className="text-sm font-semibold mb-4 break-words whitespace-normal italic" style={{ color: '#1A3A34' }}>
          "{currentCard.thought}"
        </p>

        <p className="text-sm font-semibold mb-3" style={{ color: '#1A3A34' }}>
          Try one defusion line:
        </p>

        <div className="space-y-2">
          {currentCard.defuseLines.map((line, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal break-words min-w-0"
              style={{
                borderRadius: '12px',
                borderColor: selectedLine === line
                  ? 'rgba(159, 122, 234, 0.4)'
                  : 'rgba(38, 166, 154, 0.2)',
                backgroundColor: selectedLine === line
                  ? 'rgba(159, 122, 234, 0.1)'
                  : 'transparent'
              }}
              onClick={() => handleSelectLine(line)}
            >
              <span className="text-sm leading-snug">{line}</span>
            </Button>
          ))}
        </div>

        {selectedLine && (
          <div className="mt-4 p-3" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(159, 122, 234, 0.1)',
            border: '1px solid rgba(159, 122, 234, 0.2)'
          }}>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              Nice! You created space between you and the thought. Notice: you can observe it without being controlled by it.
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          Close
        </Button>
        {selectedLine && (
          <Button
            onClick={handleNext}
            style={{
              borderRadius: '12px',
              backgroundColor: '#9F7AEA',
              color: 'white'
            }}
          >
            Next Card
          </Button>
        )}
      </div>
    </div>
  );
}