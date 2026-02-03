import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ProsAndCons({ onClose }) {
  const [decision, setDecision] = useState('');
  const [step, setStep] = useState('input');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');

  const handleStart = () => {
    if (decision.trim()) setStep('pros');
  };

  const handleNext = () => {
    if (step === 'pros' && pros.trim()) setStep('cons');
    else if (step === 'cons' && cons.trim()) setStep('result');
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-sm mb-4 break-words whitespace-normal" style={{ color: '#5A7A72' }}>
          Use Pros & Cons when you're considering a crisis behavior or tough decision.
        </p>

        {step === 'input' && (
          <>
            <p className="text-sm font-semibold mb-2" style={{ color: '#1A3A34' }}>
              What decision are you facing?
            </p>
            <input
              type="text"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="e.g., Should I send that message now?"
              className="w-full p-3 mb-4 text-sm"
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(38, 166, 154, 0.3)',
                outline: 'none'
              }}
            />
            <Button
              onClick={handleStart}
              disabled={!decision.trim()}
              className="w-full"
              style={{
                borderRadius: '12px',
                backgroundColor: decision.trim() ? '#26A69A' : '#ccc',
                color: 'white'
              }}
            >
              Start Analysis
            </Button>
          </>
        )}

        {step === 'pros' && (
          <>
            <p className="text-sm font-semibold mb-2 break-words" style={{ color: '#1A3A34' }}>
              Pros of doing it:
            </p>
            <textarea
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              placeholder="What are the short-term benefits?"
              rows={3}
              className="w-full p-3 mb-4 text-sm"
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(38, 166, 154, 0.3)',
                outline: 'none',
                resize: 'none'
              }}
            />
            <Button
              onClick={handleNext}
              disabled={!pros.trim()}
              className="w-full"
              style={{
                borderRadius: '12px',
                backgroundColor: pros.trim() ? '#26A69A' : '#ccc',
                color: 'white'
              }}
            >
              Next: Cons
            </Button>
          </>
        )}

        {step === 'cons' && (
          <>
            <p className="text-sm font-semibold mb-2 break-words" style={{ color: '#1A3A34' }}>
              Cons of doing it:
            </p>
            <textarea
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              placeholder="What are the long-term costs?"
              rows={3}
              className="w-full p-3 mb-4 text-sm"
              style={{
                borderRadius: '12px',
                border: '1px solid rgba(38, 166, 154, 0.3)',
                outline: 'none',
                resize: 'none'
              }}
            />
            <Button
              onClick={handleNext}
              disabled={!cons.trim()}
              className="w-full"
              style={{
                borderRadius: '12px',
                backgroundColor: cons.trim() ? '#26A69A' : '#ccc',
                color: 'white'
              }}
            >
              See Result
            </Button>
          </>
        )}

        {step === 'result' && (
          <div className="space-y-3">
            <div className="p-3" style={{
              borderRadius: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#22C55E' }}>
                Pros:
              </p>
              <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
                {pros}
              </p>
            </div>
            <div className="p-3" style={{
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#EF4444' }}>
                Cons:
              </p>
              <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
                {cons}
              </p>
            </div>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#5A7A72' }}>
              Often, short-term relief has long-term costs. What choice serves your values?
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