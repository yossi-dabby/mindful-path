import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HalfSmile({ onClose }) {
  const { t } = useTranslation();
  const [practiced, setPracticed] = useState(false);
  const [emotionBefore, setEmotionBefore] = useState(null);
  const [emotionAfter, setEmotionAfter] = useState(null);

  const emotions = ['Tense', 'Frustrated', 'Anxious', 'Sad', 'Neutral'];

  const handlePractice = () => {
    setPracticed(true);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-sm mb-4 break-words whitespace-normal" style={{ color: '#5A7A72' }}>
          Half Smile is a gentle facial expression that can shift your emotional state. Even a tiny smile signals safety to your nervous system.
        </p>

        {!emotionBefore ? (
          <>
            <p className="text-sm font-semibold mb-3" style={{ color: '#1A3A34' }}>
              How do you feel right now?
            </p>
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => setEmotionBefore(emotion)}
                  className="px-4 py-2 text-sm rounded-lg transition-all"
                  style={{
                    backgroundColor: 'rgba(38, 166, 154, 0.1)',
                    border: '1px solid rgba(38, 166, 154, 0.3)',
                    color: '#26A69A'
                  }}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </>
        ) : !practiced ? (
          <>
            <div className="mb-4 p-4" style={{
              borderRadius: '12px',
              backgroundColor: 'rgba(159, 122, 234, 0.1)',
              border: '1px solid rgba(159, 122, 234, 0.2)'
            }}>
              <p className="text-sm font-semibold mb-3" style={{ color: '#1A3A34' }}>
                Try this for 30 seconds:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-sm flex-shrink-0" style={{ color: '#9F7AEA' }}>•</span>
                  <span className="text-sm break-words whitespace-normal flex-1 min-w-0" style={{ color: '#1A3A34' }}>
                    Relax your face, especially your jaw.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sm flex-shrink-0" style={{ color: '#9F7AEA' }}>•</span>
                  <span className="text-sm break-words whitespace-normal flex-1 min-w-0" style={{ color: '#1A3A34' }}>
                    Lift the corners of your mouth just slightly (10%).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sm flex-shrink-0" style={{ color: '#9F7AEA' }}>•</span>
                  <span className="text-sm break-words whitespace-normal flex-1 min-w-0" style={{ color: '#1A3A34' }}>
                    Soften your eyes.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sm flex-shrink-0" style={{ color: '#9F7AEA' }}>•</span>
                  <span className="text-sm break-words whitespace-normal flex-1 min-w-0" style={{ color: '#1A3A34' }}>
                    Breathe slowly.
                  </span>
                </li>
              </ul>
            </div>
            <Button
              onClick={handlePractice}
              className="w-full"
              style={{
                borderRadius: '12px',
                backgroundColor: '#9F7AEA',
                color: 'white'
              }}
            >
              I Practiced for 30 Seconds
            </Button>
          </>
        ) : !emotionAfter ? (
          <>
            <p className="text-sm font-semibold mb-3" style={{ color: '#1A3A34' }}>
              How do you feel now?
            </p>
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => setEmotionAfter(emotion)}
                  className="px-4 py-2 text-sm rounded-lg transition-all"
                  style={{
                    backgroundColor: 'rgba(38, 166, 154, 0.1)',
                    border: '1px solid rgba(38, 166, 154, 0.3)',
                    color: '#26A69A'
                  }}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="p-4" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              ✓ Before: {emotionBefore} → After: {emotionAfter}
              <br /><br />
              Even a subtle shift matters. Half Smile is a tool you can use anywhere, anytime.
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