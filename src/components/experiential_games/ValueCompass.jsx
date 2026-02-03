import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { valueCompassValues } from './mindGamesContent';

export default function ValueCompass({ onClose }) {
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  const handleValueSelect = (valueData) => {
    setSelectedValue(valueData);
    setSelectedAction(null);
  };

  const handleActionSelect = (action) => {
    setSelectedAction(action);
  };

  const handleReset = () => {
    setSelectedValue(null);
    setSelectedAction(null);
  };

  return (
    <div className="space-y-4">
      {!selectedValue ? (
        <>
          <p className="text-sm font-medium mb-3" style={{ color: '#1A3A34' }}>
            Choose a value that matters to you:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {valueCompassValues.map((valueData) => (
              <Button
                key={valueData.id}
                variant="outline"
                className="h-auto py-4 px-4"
                style={{
                  borderRadius: '16px',
                  borderColor: 'rgba(38, 166, 154, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
                onClick={() => handleValueSelect(valueData)}
              >
                <span className="font-medium">{valueData.value}</span>
              </Button>
            ))}
          </div>
        </>
      ) : (
        <>
          <Card className="p-4 border-0" style={{
            borderRadius: '16px',
            background: 'rgba(38, 166, 154, 0.1)',
            border: '1px solid rgba(38, 166, 154, 0.2)'
          }}>
            <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>
              Your value: <span className="text-base font-bold">{selectedValue.value}</span>
            </p>
          </Card>

          <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>
            Choose one tiny action:
          </p>
          <div className="space-y-2">
            {selectedValue.actions.map((action, index) => {
              const isSelected = selectedAction === action;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  style={{
                    borderRadius: '12px',
                    borderColor: isSelected
                      ? 'rgba(34, 197, 94, 0.4)'
                      : 'rgba(38, 166, 154, 0.2)',
                    backgroundColor: isSelected
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'transparent'
                  }}
                  onClick={() => handleActionSelect(action)}
                >
                  {action}
                </Button>
              );
            })}
          </div>

          {selectedAction && (
            <Card className="p-4 border-0" style={{
              borderRadius: '16px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>
                ✓ Great! Take this step today and notice how it feels.
              </p>
            </Card>
          )}
        </>
      )}

      <div className="flex gap-3 justify-end">
        {selectedValue && (
          <Button variant="outline" onClick={handleReset} style={{ borderRadius: '12px' }}>
            Pick Different Value
          </Button>
        )}
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          Close
        </Button>
      </div>
    </div>
  );
}