import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CheckTheFacts({ onClose }) {
  const { t } = useTranslation();
  const [emotion, setEmotion] = useState('');
  const [step, setStep] = useState('input');
  const [prompts, setPrompts] = useState(null);

  const emotionPromptsData = t('mind_games.check_the_facts.emotion_prompts', { returnObjects: true });
  const emotionPrompts = {
    fear: emotionPromptsData?.fear || [],
    anger: emotionPromptsData?.anger || [],
    sadness: emotionPromptsData?.sadness || [],
    guilt: emotionPromptsData?.guilt || [],
    shame: emotionPromptsData?.shame || [],
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
          {t('mind_games.check_the_facts.description')}
        </p>

        {step === 'input' ? (
          <>
            <p className="text-sm font-semibold mb-2" style={{ color: '#1A3A34' }}>
              {t('mind_games.check_the_facts.emotion_prompt')}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(t('mind_games.check_the_facts.emotions', { returnObjects: true }) || ['Fear', 'Anger', 'Sadness', 'Guilt', 'Shame']).map((e) => (
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
              {t('mind_games.check_the_facts.check_btn')}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold mb-3 break-words" style={{ color: '#1A3A34' }}>
              {t('mind_games.check_the_facts.for_emotion', { emotion })}
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
                {t('mind_games.check_the_facts.tip')}
              </p>
            </div>
          </>
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