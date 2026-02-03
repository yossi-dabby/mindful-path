import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { thoughtQuizItems } from './mindGamesContent';

export default function ThoughtQuiz({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const currentItem = thoughtQuizItems[currentIndex];

  const handleAnswer = (index) => {
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === currentItem.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < thoughtQuizItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const handleTryAnother = () => {
    const randomIndex = Math.floor(Math.random() * thoughtQuizItems.length);
    setCurrentIndex(randomIndex);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm" style={{ color: '#5A7A72' }}>
          Question {currentIndex + 1} of {thoughtQuizItems.length}
        </p>
      </div>

      <Card className="p-6 border-0" style={{
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <p className="text-base font-medium mb-4" style={{ color: '#1A3A34' }}>
          {currentItem.prompt}
        </p>

        <div className="space-y-2">
          {currentItem.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === currentItem.correctIndex;
            const showResult = showExplanation;

            return (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
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
                <div className="flex items-center gap-2 w-full">
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
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
            <p className="text-sm" style={{ color: '#1A3A34' }}>
              <strong>Why:</strong> {currentItem.explanation}
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose} style={{ borderRadius: '12px' }}>
          Close
        </Button>
        {showExplanation && currentIndex < thoughtQuizItems.length - 1 && (
          <Button
            onClick={handleNext}
            style={{
              borderRadius: '12px',
              backgroundColor: '#26A69A',
              color: 'white'
            }}
          >
            Next Question
          </Button>
        )}
        {showExplanation && currentIndex === thoughtQuizItems.length - 1 && (
          <Button
            onClick={handleTryAnother}
            style={{
              borderRadius: '12px',
              backgroundColor: '#26A69A',
              color: 'white'
            }}
          >
            Try Another
          </Button>
        )}
      </div>
    </div>
  );
}