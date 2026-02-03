import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { evidenceBalanceItems } from './mindGamesContent';

export default function EvidenceBalance({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConclusion, setShowConclusion] = useState(false);

  const currentItem = evidenceBalanceItems[currentIndex];

  const handleShowConclusion = () => {
    setShowConclusion(true);
  };

  const handleNext = () => {
    const randomIndex = Math.floor(Math.random() * evidenceBalanceItems.length);
    setCurrentIndex(randomIndex);
    setShowConclusion(false);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-xs font-medium mb-2" style={{ color: '#5A7A72' }}>
          Thought:
        </p>
        <p className="text-sm font-semibold mb-4 break-words whitespace-normal" style={{ color: '#1A3A34' }}>
          "{currentItem.thought}"
        </p>

        {/* Stacked on mobile */}
        <div className="space-y-4 mb-4">
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: '#EF4444' }}>
              Evidence For:
            </p>
            <ul className="space-y-1">
              {currentItem.evidenceFor.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-sm flex-shrink-0" style={{ color: '#EF4444' }}>•</span>
                  <span className="text-sm break-words whitespace-normal flex-1 min-w-0" style={{ color: '#1A3A34' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium mb-2" style={{ color: '#22C55E' }}>
              Evidence Against:
            </p>
            <ul className="space-y-1">
              {currentItem.evidenceAgainst.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-sm flex-shrink-0" style={{ color: '#22C55E' }}>•</span>
                  <span className="text-sm break-words whitespace-normal flex-1 min-w-0" style={{ color: '#1A3A34' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!showConclusion ? (
          <Button
            onClick={handleShowConclusion}
            className="w-full"
            style={{
              borderRadius: '12px',
              backgroundColor: '#26A69A',
              color: 'white'
            }}
          >
            Show Balanced Conclusion
          </Button>
        ) : (
          <div className="p-4" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(38, 166, 154, 0.1)',
            border: '1px solid rgba(38, 166, 154, 0.2)'
          }}>
            <p className="text-xs font-medium mb-2" style={{ color: '#26A69A' }}>
              Balanced Conclusion:
            </p>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              {currentItem.balancedConclusion}
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          Close
        </Button>
        {showConclusion && (
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