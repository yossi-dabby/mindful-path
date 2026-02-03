import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { selfSootheItems } from './mindGamesContent';

export default function SelfSoothe({ onClose }) {
  const [selectedSense, setSelectedSense] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  const handleSenseSelect = (item) => {
    setSelectedSense(item);
    setSelectedAction(null);
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-sm mb-4 break-words whitespace-normal" style={{ color: '#5A7A72' }}>
          Self-soothe with your 5 senses to create moments of comfort and safety.
        </p>

        {!selectedSense ? (
          <div className="space-y-2">
            {selfSootheItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSenseSelect(item)}
                className="w-full text-left p-3 transition-all"
                style={{
                  borderRadius: '12px',
                  backgroundColor: 'rgba(38, 166, 154, 0.05)',
                  border: '1px solid rgba(38, 166, 154, 0.2)'
                }}
              >
                <p className="text-sm font-semibold" style={{ color: '#26A69A' }}>
                  {item.sense}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <>
            <button
              onClick={() => setSelectedSense(null)}
              className="text-xs mb-3"
              style={{ color: '#5A7A72' }}
            >
              ← Back to senses
            </button>
            <p className="text-sm font-semibold mb-3" style={{ color: '#26A69A' }}>
              {selectedSense.sense}
            </p>
            <div className="space-y-2">
              {selectedSense.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal break-words min-w-0"
                  style={{
                    borderRadius: '12px',
                    borderColor: selectedAction === action
                      ? 'rgba(34, 197, 94, 0.4)'
                      : 'rgba(38, 166, 154, 0.2)',
                    backgroundColor: selectedAction === action
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'transparent'
                  }}
                  onClick={() => handleActionSelect(action)}
                >
                  <span className="text-sm leading-snug">{action}</span>
                </Button>
              ))}
            </div>
            {selectedAction && (
              <div className="mt-4 p-3" style={{
                borderRadius: '12px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
                  ✓ Take a moment to fully experience this. Self-soothing is a gift you give yourself.
                </p>
              </div>
            )}
          </>
        )}
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          Close
        </Button>
      </div>
    </div>
  );
}