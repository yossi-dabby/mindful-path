import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function OppositeAction({ onClose }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const items = t('mind_games.content.opposite_action.items', { returnObjects: true }) || [];
  const currentItem = items[currentIndex];

  if (!currentItem) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  const handleChoice = (choice) => {
    setSelectedChoice(choice);
  };

  const handleNext = () => {
    const randomIndex = Math.floor(Math.random() * items.length);
    setCurrentIndex(randomIndex);
    setSelectedChoice(null);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#5A7A72' }}>
              {t('mind_games.content.opposite_action.ui.emotion')}
            </p>
            <p className="text-sm font-semibold break-words" style={{ color: '#1A3A34' }}>
              {currentItem.emotion}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#5A7A72' }}>
              {t('mind_games.content.opposite_action.ui.urge')}
            </p>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              {currentItem.urge}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#5A7A72' }}>
              {t('mind_games.content.opposite_action.ui.opposite_action')}
            </p>
            <p className="text-sm font-semibold break-words" style={{ color: '#26A69A' }}>
              {currentItem.opposite}
            </p>
          </div>
        </div>

        <p className="text-sm font-semibold mb-3" style={{ color: '#1A3A34' }}>
          {t('mind_games.content.opposite_action.ui.pick_step')}
        </p>

        <div className="space-y-2">
          {currentItem.choices.map((choice, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal break-words min-w-0"
              style={{
                borderRadius: '12px',
                borderColor: selectedChoice === choice
                  ? 'rgba(34, 197, 94, 0.4)'
                  : 'rgba(38, 166, 154, 0.2)',
                backgroundColor: selectedChoice === choice
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'transparent'
              }}
              onClick={() => handleChoice(choice)}
            >
              <span className="text-sm leading-snug">{choice}</span>
            </Button>
          ))}
        </div>

        {selectedChoice && (
          <div className="mt-4 p-3" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(38, 166, 154, 0.1)',
            border: '1px solid rgba(38, 166, 154, 0.2)'
          }}>
            <p className="text-xs break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              <strong>{t('mind_games.content.opposite_action.ui.note_label')}</strong> {currentItem.note}
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          {t('common.close')}
        </Button>
        {selectedChoice && (
          <Button
            onClick={handleNext}
            style={{
              borderRadius: '12px',
              backgroundColor: '#26A69A',
              color: 'white'
            }}
          >
            {t('mind_games.content.opposite_action.ui.try_another')}
          </Button>
        )}
      </div>
    </div>
  );
}