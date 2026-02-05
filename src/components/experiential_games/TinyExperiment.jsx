import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { tinyExperimentItems } from './mindGamesContent';

export default function TinyExperiment({ onClose }) {
  const { t } = useTranslation();
  const [currentIndex] = useState(Math.floor(Math.random() * tinyExperimentItems.length));
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [selectedReflection, setSelectedReflection] = useState(null);

  const currentItem = tinyExperimentItems[currentIndex];
  
  // Translate content
  const belief = t(`mind_games.tiny_experiment.beliefs.${currentItem.id}`);
  const experiments = currentItem.experiments.map((_, idx) => t(`mind_games.tiny_experiment.experiments.${currentItem.id}_${idx}`));
  const reflectionQuestion = t(`mind_games.tiny_experiment.reflection_questions.${currentItem.id}`);
  const reflectionOptions = currentItem.reflection.options.map((_, idx) => t(`mind_games.tiny_experiment.reflection_options.${currentItem.id}_${idx}`));

  const handleExperimentSelect = (experiment) => {
    setSelectedExperiment(experiment);
    setSelectedReflection(null);
  };

  const handleReflectionSelect = (option) => {
    setSelectedReflection(option);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 border-0" style={{
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-xs font-medium mb-1" style={{ color: '#5A7A72' }}>
          {t('mind_games.tiny_experiment.belief_label')}
        </p>
        <p className="text-sm italic" style={{ color: '#1A3A34' }}>
          "{belief}"
        </p>
      </Card>

      <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>
        {t('mind_games.tiny_experiment.prompt')}
      </p>
      <div className="space-y-2">
        {experiments.map((experiment, index) => {
          const isSelected = selectedExperiment === currentItem.experiments[index];
          return (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              style={{
                borderRadius: '12px',
                borderColor: isSelected
                  ? 'rgba(38, 166, 154, 0.4)'
                  : 'rgba(38, 166, 154, 0.2)',
                backgroundColor: isSelected
                  ? 'rgba(38, 166, 154, 0.1)'
                  : 'transparent'
              }}
              onClick={() => handleExperimentSelect(currentItem.experiments[index])}
            >
              {experiment}
            </Button>
          );
        })}
      </div>

      {selectedExperiment && (
        <>
          <Card className="p-4 border-0" style={{
            borderRadius: '16px',
            background: 'rgba(38, 166, 154, 0.1)',
            border: '1px solid rgba(38, 166, 154, 0.2)'
          }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#1A3A34' }}>
              {reflectionQuestion}
            </p>
            <div className="space-y-2">
              {reflectionOptions.map((option, index) => {
                const isSelected = selectedReflection === currentItem.reflection.options[index];
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    style={{
                      borderRadius: '10px',
                      borderColor: isSelected
                        ? 'rgba(34, 197, 94, 0.4)'
                        : 'rgba(38, 166, 154, 0.2)',
                      backgroundColor: isSelected
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'transparent'
                    }}
                    onClick={() => handleReflectionSelect(currentItem.reflection.options[index])}
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          </Card>

          {selectedReflection && (
            <Card className="p-3 border-0" style={{
              borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <p className="text-xs" style={{ color: '#1A3A34' }}>
                {t('mind_games.tiny_experiment.reflection_success')}
              </p>
            </Card>
          )}
        </>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          {t('common.close')}
        </Button>
      </div>
    </div>
  );
}