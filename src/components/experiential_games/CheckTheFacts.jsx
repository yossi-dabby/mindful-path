import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CheckTheFacts({ onClose }) {
  const [emotion, setEmotion] = useState('');
  const [step, setStep] = useState('input');
  const [prompts, setPrompts] = useState(null);

  const emotionPrompts = {
    fear: ["Is there real, immediate danger?", "What's the worst that could happen?", "What's the evidence?"],
    anger: ["Did someone violate my rights on purpose?", "Is this threat to my goals real?", "Will anger help or hurt?"],
    sadness: ["Did I actually lose something important?", "Is it permanent or can I recover?", "What would help me cope?"],
    guilt: ["Did I actually do something against my values?", "Was it within my control?", "What repair is needed?"],
    shame: ["Is the whole 'me' bad, or just this action?", "Would others see it the same way?", "Can I separate behavior from identity?"],
  };

  const handleStart = () => {
    const key = emotion.toLowerCase();
    const selectedPrompts = emotionPrompts[key] || ["What are the facts?", "Am I adding interpretations?", "Does this emotion fit?"];
    setPrompts(selectedPrompts);
    setStep('check');
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-sm mb-4 break-words whitespace-normal" style={{ color: '#5A7A72' }}>
          Check the Facts helps you determine if your emotion fits the situation. If it doesn't, you can work to change it.
        </p>

        {step === 'input' ? (
          <>
            <p className="text-sm font-semibold mb-2" style={{ color: '#1A3A34' }}>
              What emotion are you feeling?
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Fear', 'Anger', 'Sadness', 'Guilt', 'Shame'].map((e) => (
                <button
                  key={e}
                  onClick={() => setEmotion(e)}
                  className="px-4 py-2 text-sm rounded-lg transition-all"
                  style={{
                    backgroundColor: emotion === e ? 'rgba(38, 166, 154, 0.2)' : 'rgba(38, 166, 154, 0.1)',
                    border: `1px solid ${emotion === e ? '#26A69A' : 'rgba(38, 166, 154, 0.3)'}`,
                    color: '#26A69A',
                    fontWeight: emotion === e ? '600' : '400'
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <Button
              onClick={handleStart}
              disabled={!emotion}
              className="w-full"
              style={{
                borderRadius: '12px',
                backgroundColor: emotion ? '#26A69A' : '#ccc',
                color: 'white'
              }}
            >
              Check the Facts
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold mb-3 break-words" style={{ color: '#1A3A34' }}>
              For {emotion}, ask yourself:
            </p>
            <ul className="space-y-2 mb-4">
              {prompts.map((prompt, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-sm flex-shrink-0" style={{ color: '#26A69A' }}>•</span>
                  <span className="text-sm break-words whitespace-normal flex-1 min-w-0" style={{ color: '#1A3A34' }}>
                    {prompt}
                  </span>
                </li>
              ))}
            </ul>
            <div className="p-3" style={{
              borderRadius: '12px',
              backgroundColor: 'rgba(38, 166, 154, 0.1)',
              border: '1px solid rgba(38, 166, 154, 0.2)'
            }}>
              <p className="text-xs break-words whitespace-normal" style={{ color: '#5A7A72' }}>
                If the facts don't support the emotion's intensity, use opposite action or other skills to shift it.
              </p>
            </div>
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