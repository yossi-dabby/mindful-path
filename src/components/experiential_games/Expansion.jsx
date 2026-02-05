import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Expansion({ onClose }) {
  const { t } = useTranslation();
  const [emotion, setEmotion] = useState('');
  const [step, setStep] = useState(0);

  const steps = [
    "Name the emotion you're feeling.",
    "Where do you feel it in your body?",
    "Instead of pushing it away, breathe into that spot.",
    "Imagine making space around the feeling—not shrinking it, just allowing it.",
    "Notice: You can feel this AND still move forward."
  ];

  const handleStart = () => {
    if (emotion.trim()) setStep(1);
  };

  const handleNext = () => {
    if (step < steps.length) setStep(step + 1);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-sm mb-4 break-words whitespace-normal" style={{ color: '#5A7A72' }}>
          Expansion is making room for difficult emotions instead of fighting them.
        </p>

        {step === 0 ? (
          <>
            <p className="text-sm font-semibold mb-2" style={{ color: '#1A3A34' }}>
              What emotion is present right now?
            </p>
            <input
              type="text"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              placeholder="e.g., anxiety, sadness, anger"
              className="w-full p-3 mb-4 text-sm"
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(38, 166, 154, 0.3)',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#26A69A'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(38, 166, 154, 0.3)'}
            />
            <Button
              onClick={handleStart}
              disabled={!emotion.trim()}
              className="w-full"
              style={{
                borderRadius: '12px',
                backgroundColor: emotion.trim() ? '#9F7AEA' : '#ccc',
                color: 'white'
              }}
            >
              Begin Expansion Practice
            </Button>
          </>
        ) : step <= steps.length ? (
          <>
            <div className="mb-4 p-4" style={{
              borderRadius: '12px',
              backgroundColor: 'rgba(159, 122, 234, 0.1)',
              border: '1px solid rgba(159, 122, 234, 0.2)'
            }}>
              <p className="text-xs mb-2" style={{ color: '#9F7AEA' }}>
                Step {step} of {steps.length}
              </p>
              <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
                {steps[step - 1]}
              </p>
            </div>
            <Button
              onClick={handleNext}
              className="w-full"
              style={{
                borderRadius: '12px',
                backgroundColor: '#9F7AEA',
                color: 'white'
              }}
            >
              {step < steps.length ? 'Next' : 'Finish'}
            </Button>
          </>
        ) : (
          <div className="p-4" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              ✓ You practiced making room for {emotion}. Expansion doesn't make feelings go away—it helps you carry them with less struggle.
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          {t('common.close')}
        </Button>
      </div>
    </div>
  );
}