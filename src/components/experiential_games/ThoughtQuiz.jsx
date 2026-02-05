import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAdaptiveDifficulty } from './useAdaptiveDifficulty';
import { useMindGameTracking } from './useMindGameTracking';

export default function ThoughtQuiz({ onClose }) {
  const { t } = useTranslation();
  const { suggestedDifficulty } = useAdaptiveDifficulty('thought_quiz');
  const { trackGamePlay } = useMindGameTracking();
  
  const [difficulty, setDifficulty] = useState(suggestedDifficulty);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
  const questionPool = difficulty === 'advanced' 
    ? t('mind_games.content.thought_quiz.advanced', { returnObjects: true })
    : t('mind_games.content.thought_quiz.items', { returnObjects: true });
  
  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * questionPool.length));
  }, [difficulty, questionPool.length]);
  
  useEffect(() => {
    return () => {
      if (questionsAnswered > 0) {
        const successRate = (score / questionsAnswered) * 100;
        trackGamePlay({
          game: { id: 'thought_quiz', slug: 'thought-quiz', title: 'Thought Quiz' },
          completed: true,
          durationSeconds: questionsAnswered * 15,
          difficulty_level: difficulty,
          success_rate: successRate,
          attempts: questionsAnswered,
        });
      }
    };
  }, [score, questionsAnswered, difficulty]);

  const currentItem = questionPool[currentIndex];
  
  // Guard: Prevent render if currentItem is undefined
  if (!currentItem) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">Loading question...</p>
      </div>
    );
  }

  const prompt = currentItem.prompt;
  const explanation = currentItem.explanation;
  const options = currentItem.options;

  const handleAnswer = (index) => {
    setSelectedOption(index);
    setShowExplanation(true);
    setQuestionsAnswered(prev => prev + 1);
    if (index === currentItem.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    const randomIndex = Math.floor(Math.random() * questionPool.length);
    setCurrentIndex(randomIndex);
    setSelectedOption(null);
    setShowExplanation(false);
  };
  
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setScore(0);
    setQuestionsAnswered(0);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <Badge variant="outline" style={{
            borderRadius: '8px',
            borderColor: 'rgba(38, 166, 154, 0.3)',
            color: '#26A69A'
          }}>
            {t('mind_games.thought_quiz.score')}: {score}/{questionsAnswered}
          </Badge>
          
          <div className="flex gap-2">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                onClick={() => handleDifficultyChange(level)}
                className="px-3 py-1 text-xs rounded-lg transition-all"
                style={{
                  backgroundColor: difficulty === level ? 'rgba(38, 166, 154, 0.2)' : 'transparent',
                  border: `1px solid ${difficulty === level ? '#26A69A' : 'rgba(38, 166, 154, 0.3)'}`,
                  color: difficulty === level ? '#26A69A' : '#5A7A72',
                  fontWeight: difficulty === level ? '600' : '400'
                }}
              >
                {level === 'beginner' && '★'}
                {level === 'intermediate' && '★★'}
                {level === 'advanced' && '★★★'}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-base font-medium mb-4 break-words whitespace-normal" style={{ color: '#1A3A34' }}>
          {prompt}
        </p>

        <div className="space-y-2">
          {options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === currentItem.correctIndex;
            const showResult = showExplanation;

            return (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal break-words min-w-0"
                style={{
                  borderRadius: '12px',
                  borderColor: showResult
                    ? isCorrect
                      ? 'rgba(34, 197, 94, 0.4)'
                      : isSelected
                      ? 'rgba(239, 68, 68, 0.4)'
                      : 'rgba(38, 166, 154, 0.2)'
                    : 'rgba(38, 166, 154, 0.2)',
                  backgroundColor: showResult
                    ? isCorrect
                      ? 'rgba(34, 197, 94, 0.1)'
                      : isSelected
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'transparent'
                    : 'transparent'
                }}
                onClick={() => !showExplanation && handleAnswer(index)}
                disabled={showExplanation}
              >
                <div className="flex items-center gap-2 w-full min-w-0">
                  <span className="flex-1 break-words">{option}</span>
                  {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                </div>
              </Button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-4 p-4" style={{
            borderRadius: '12px',
            backgroundColor: 'rgba(38, 166, 154, 0.1)',
            border: '1px solid rgba(38, 166, 154, 0.2)'
          }}>
            <p className="text-sm break-words whitespace-normal" style={{ color: '#1A3A34' }}>
              {explanation}
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-3 justify-end flex-wrap">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          {t('common.close')}
        </Button>
        {showExplanation && (
          <Button
            onClick={handleNext}
            style={{
              borderRadius: '12px',
              backgroundColor: '#26A69A',
              color: 'white'
            }}
          >
            {t('mind_games.thought_quiz.next_question')}
          </Button>
        )}
      </div>
    </div>
  );
}