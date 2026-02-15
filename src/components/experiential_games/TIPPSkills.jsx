import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function TIPPSkills({ onClose }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState(null);

  const content = t('mind_games.content.tipp_skills', { returnObjects: true });
  
  if (!content || (!content.items && !content.situation && !Array.isArray(content))) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  // Handle both new structure (items array + ui object) and old structure (single object or array)
  const items = content.items || (Array.isArray(content) ? content : [content]);
  const currentItem = items[currentIndex] || items[0];

  const getUIText = (key) => {
    return content.ui ? content.ui[key] : t(`mind_games.content.tipp_skills.ui.${key}`);
  };

  const handleSelect = (action) => {
    setSelectedAction(action);
  };

  const handleNext = () => {
    const randomIndex = Math.floor(Math.random() * items.length);
    setCurrentIndex(randomIndex);
    setSelectedAction(null);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-xs font-medium mb-2" style={{ color: '#5A7A72' }}>
          {getUIText('intro')}
        </p>
        <p className="text-sm font-semibold mb-4 break-words whitespace-normal" style={{ color: '#1A3A34' }}>
          {currentItem.situation}
        </p>

        <div className="space-y-3 mb-4">
          {currentItem.skills.map((skill, index) => (
            <div key={index} className="p-3" style={{
              borderRadius: '12px',
              backgroundColor: 'rgba(38, 166, 154, 0.05)',
              border: '1px solid rgba(38, 166, 154, 0.2)'
            }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#26A69A' }}>
                {skill.letter}: {skill.name}
              </p>
              <p className="text-xs break-words whitespace-normal" style={{ color: '#5A7A72' }}>
                {skill.description}
              </p>
            </div>
          ))}
        </div>

        <p className="text-sm font-semibold mb-3" style={{ color: '#1A3A34' }}>
          {getUIText('pick_one')}
        </p>

        <div className="space-y-2">
          {currentItem.actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal break-words min-w-0"
              style={{
                borderRadius: '12px',
                borderColor: selectedAction === action
                  ? 'rgba(34, 197, 94, 0.4)'
                  : 'rgba(38, 166, 154, 0.2)',
                backgroundColor: selectedAction === action
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'transparent'
              }}
              onClick={() => handleSelect(action)}
            >
              <span className="text-sm leading-snug">{action}</span>
            </Button>
          ))}
        </div>

        {selectedAction && (
          <div className="mt-4 p-3" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              {getUIText('success_message')}
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          {t('common.close')}
        </Button>
        {selectedAction && (
          <Button
            onClick={handleNext}
            style={{
              borderRadius: '12px',
              backgroundColor: '#26A69A',
              color: 'white'
            }}
          >
            {getUIText('try_another')}
          </Button>
        )}
      </div>
    </div>
  );
}