import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { improveItems } from './mindGamesContent';

export default function IMPROVE({ onClose }) {
  const [selectedSkill, setSelectedSkill] = useState(null);

  const handleSelect = (item) => {
    setSelectedSkill(item);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-sm mb-4 break-words whitespace-normal" style={{ color: '#5A7A72' }}>
          IMPROVE the moment when you're in crisis and need to shift your state:
        </p>

        <div className="space-y-2">
          {improveItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelect(item)}
              className="w-full text-left p-3 transition-all"
              style={{
                borderRadius: '12px',
                backgroundColor: selectedSkill?.letter === item.letter
                  ? 'rgba(38, 166, 154, 0.15)'
                  : 'rgba(38, 166, 154, 0.05)',
                border: `1px solid ${selectedSkill?.letter === item.letter ? '#26A69A' : 'rgba(38, 166, 154, 0.2)'}`
              }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: '#26A69A' }}>
                {item.letter}: {item.name}
              </p>
              <p className="text-xs break-words whitespace-normal" style={{ color: '#5A7A72' }}>
                {item.description}
              </p>
            </button>
          ))}
        </div>

        {selectedSkill && (
          <div className="mt-4 p-4" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(38, 166, 154, 0.1)',
            border: '1px solid rgba(38, 166, 154, 0.2)'
          }}>
            <p className="text-xs font-medium mb-2" style={{ color: '#26A69A' }}>
              Quick Action:
            </p>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              {selectedSkill.quickAction}
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