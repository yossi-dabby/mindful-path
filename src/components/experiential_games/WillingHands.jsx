import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function WillingHands({ onClose }) {
  const [step, setStep] = useState(0);
  const [practiced, setPracticed] = useState(false);

  const steps = [
    "Turn your hands palms up and rest them on your lap or by your sides.",
    "Relax your hands completely—let tension drain out.",
    "Soften your face, especially jaw and forehead.",
    "Breathe naturally and say (silently): 'I am willing.'",
    "Hold this for 30 seconds, noticing any shift."
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setPracticed(true);
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-sm mb-4 break-words whitespace-normal" style={{ color: '#5A7A72' }}>
          Willing Hands is a body-based acceptance practice. It signals openness to reality, even when it's hard.
        </p>

        {!practiced ? (
          <>
            <div className="mb-4 p-4" style={{
              borderRadius: '12px',
              backgroundColor: 'rgba(38, 166, 154, 0.1)',
              border: '1px solid rgba(38, 166, 154, 0.2)'
            }}>
              <p className="text-xs mb-2" style={{ color: '#5A7A72' }}>
                Step {step + 1} of {steps.length}
              </p>
              <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
                {steps[step]}
              </p>
            </div>

            <Button
              onClick={handleNext}
              className="w-full"
              style={{
                borderRadius: '12px',
                backgroundColor: '#26A69A',
                color: 'white'
              }}
            >
              {step < steps.length - 1 ? 'Next' : 'Finish'}
            </Button>
          </>
        ) : (
          <div className="p-4" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              ✓ Nice! Willing Hands is a physical gesture of acceptance. Practice it anytime you're fighting reality.
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