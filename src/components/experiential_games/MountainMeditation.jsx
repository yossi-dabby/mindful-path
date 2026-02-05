import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function MountainMeditation({ onClose }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const steps = [
    "Close your eyes or soften your gaze.",
    "Imagine a mountain—solid, grounded, unshakable.",
    "Feel your body as the mountain: stable, rooted.",
    "Weather passes over the mountain: storms, sun, rain, wind.",
    "The mountain remains. It doesn't fight the weather—it allows it.",
    "You are like the mountain. Thoughts and emotions are like weather.",
    "They come and go. You remain."
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleFinish = () => {
    setStep(steps.length);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        {step < steps.length ? (
          <>
            <div className="mb-6 p-4" style={{
              borderRadius: '12px',
              backgroundColor: 'rgba(38, 166, 154, 0.1)',
              border: '1px solid rgba(38, 166, 154, 0.2)'
            }}>
              <p className="text-xs mb-2" style={{ color: '#5A7A72' }}>
                Step {step + 1} of {steps.length}
              </p>
              <p className="text-base break-words whitespace-normal text-center" style={{ color: '#1A3A34' }}>
                {steps[step]}
              </p>
            </div>
            <Button
              onClick={step === steps.length - 1 ? handleFinish : handleNext}
              className="w-full"
              style={{
                borderRadius: '12px',
                backgroundColor: '#26A69A',
                color: 'white'
              }}
            >
              {step === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </>
        ) : (
          <div className="p-4 text-center" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <p className="text-lg mb-2">🏔️</p>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              You practiced Mountain Meditation. Use this metaphor anytime you need to remember your stability.
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