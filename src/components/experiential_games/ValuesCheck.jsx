import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ValuesCheck({ onClose }) {
  const [selectedValue, setSelectedValue] = useState(null);
  const [alignment, setAlignment] = useState(null);

  const values = [
    'Connection', 'Growth', 'Authenticity', 'Courage', 
    'Compassion', 'Creativity', 'Health', 'Peace'
  ];

  const handleValueSelect = (value) => {
    setSelectedValue(value);
  };

  const handleAlignment = (answer) => {
    setAlignment(answer);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        {!selectedValue ? (
          <>
            <p className="text-sm mb-4 break-words whitespace-normal" style={{ color: '#5A7A72' }}>
              Quick check: Which value matters most to you right now?
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => (
                <button
                  key={value}
                  onClick={() => handleValueSelect(value)}
                  className="px-4 py-2 text-sm rounded-lg transition-all"
                  style={{
                    backgroundColor: 'rgba(159, 122, 234, 0.1)',
                    border: '1px solid rgba(159, 122, 234, 0.3)',
                    color: '#9F7AEA'
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </>
        ) : !alignment ? (
          <>
            <p className="text-sm font-semibold mb-4 break-words" style={{ color: '#1A3A34' }}>
              You chose: <span style={{ color: '#9F7AEA' }}>{selectedValue}</span>
            </p>
            <p className="text-sm mb-4 break-words whitespace-normal" style={{ color: '#5A7A72' }}>
              Are your recent actions aligned with this value?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleAlignment('yes')}
                className="flex-1"
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#22C55E',
                  color: 'white'
                }}
              >
                Yes
              </Button>
              <Button
                onClick={() => handleAlignment('somewhat')}
                className="flex-1"
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#F59E0B',
                  color: 'white'
                }}
              >
                Somewhat
              </Button>
              <Button
                onClick={() => handleAlignment('no')}
                className="flex-1"
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#EF4444',
                  color: 'white'
                }}
              >
                Not Really
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(159, 122, 234, 0.1)',
            border: '1px solid rgba(159, 122, 234, 0.2)'
          }}>
            <p className="text-sm break-words whitespace-normal mb-3" style={{ color: '#1A3A34' }}>
              {alignment === 'yes' && '✓ Great! Keep moving in this direction.'}
              {alignment === 'somewhat' && '→ Good awareness. What's one small step toward more alignment?'}
              {alignment === 'no' && '⚠️ Noticed the gap? That's the first step. Choose one tiny action today.'}
            </p>
            <p className="text-xs break-words whitespace-normal" style={{ color: '#5A7A72' }}>
              Values aren't goals to achieve—they're directions to move toward.
            </p>
          </div>
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