import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const PROMPTS = {
  1: "I'm here with you. What's happening right now that makes you feel this way?",
  2: "Write the thought that's bothering you (one sentence is enough).",
  3: "What would you like to reflect on today? (short is fine)",
  4: "What is one goal you want to work on right now?",
  5: "Choose: Calm / Ground / Breathing (or write one short line)."
};

export default function TherapyStateMachine({ onComplete }) {
  const [flowStep, setFlowStep] = useState('entry'); // entry | input | confirm | execute | complete
  const [selectedOption, setSelectedOption] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [alternatives, setAlternatives] = useState([]);
  const [selectedAlternative, setSelectedAlternative] = useState(null);
  const [journalEntryId, setJournalEntryId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setFlowStep('input');
  };

  const handleContinueFromInput = () => {
    if (!userInput.trim()) return;
    setFlowStep('confirm');
  };

  const handleConfirmYes = async () => {
    // Handle option 5 immediately
    if (selectedOption === 5) {
      navigate(createPageUrl('Exercises'));
      return;
    }

    setFlowStep('execute');
    setIsProcessing(true);

    try {
      if (selectedOption === 2 || selectedOption === 3) {
        // Create journal entry
        const today = new Date().toISOString().split('T')[0];
        const entry = await base44.entities.ThoughtJournal.create({
          date: today,
          situation: selectedOption === 2 ? "Identified during therapy session" : "Reflection from therapy session",
          automatic_thoughts: userInput,
          emotions: [],
          intensity: 5,
          cognitive_distortions: []
        });
        setJournalEntryId(entry.id);

        // Generate 3 alternatives
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate exactly 3 brief alternative balanced thoughts for: "${userInput}". Make them short, realistic, and compassionate. Return JSON: {"alternatives": ["...", "...", "..."]}`,
          response_json_schema: {
            type: "object",
            properties: {
              alternatives: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["alternatives"]
          }
        });

        setAlternatives(result.alternatives || [
          "This thought may not reflect the full picture",
          "I can approach this from a different angle",
          "I'm doing my best given the circumstances"
        ]);
        setIsProcessing(false);
      } else if (selectedOption === 1) {
        // Not feeling well - grounding
        setAlternatives([]);
        setIsProcessing(false);
      } else if (selectedOption === 4) {
        // Goal
        const goal = await base44.entities.Goal.create({
          title: userInput,
          category: 'behavioral',
          status: 'active',
          progress: 0
        });
        setJournalEntryId(goal.id);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Execute error:', error);
      if (selectedOption === 2 || selectedOption === 3) {
        setAlternatives([
          "This thought may not reflect the full picture",
          "I can approach this from a different angle", 
          "I'm doing my best given the circumstances"
        ]);
      }
      setIsProcessing(false);
    }
  };

  const handleConfirmNo = () => {
    setFlowStep('input');
  };

  const handleSelectAlternative = async (alternative) => {
    if (!journalEntryId) return;
    
    setSelectedAlternative(alternative);
    setIsProcessing(true);

    try {
      await base44.entities.ThoughtJournal.update(journalEntryId, {
        alternative_thoughts: alternative
      });
      queryClient.invalidateQueries(['journalEntries']);
      
      setTimeout(() => {
        setIsProcessing(false);
        setFlowStep('complete');
      }, 500);
    } catch (error) {
      console.error('Update error:', error);
      setIsProcessing(false);
      setFlowStep('complete');
    }
  };

  const handleDoAnother = () => {
    setFlowStep('entry');
    setSelectedOption(null);
    setUserInput('');
    setAlternatives([]);
    setSelectedAlternative(null);
    setJournalEntryId(null);
  };

  const handleGoToJournal = () => {
    navigate(createPageUrl('Journal'));
  };

  const handleGoToGoals = () => {
    navigate(createPageUrl('Goals'));
  };

  // ENTRY SCREEN
  if (flowStep === 'entry') {
    return (
      <Card className="p-6 border-0 max-w-2xl mx-auto" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 32px rgba(38, 166, 154, 0.12)'
      }}>
        <div className="mb-6">
          <p className="text-sm mb-3" style={{ color: '#5A7A72' }}>
            Welcome. I'm here to support you.
          </p>
          <h3 className="text-xl font-semibold" style={{ color: '#1A3A34' }}>
            What would you like to do today?
          </h3>
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((id) => {
            const labels = [
              "I'm not feeling well and want help right now",
              "I have a thought that's bothering me",
              "I want to write or reflect a bit",
              "I want to work on a goal",
              "I just want something short and calming"
            ];
            const emojis = ['❤️', '💭', '📓', '🎯', '🌿'];
            const colors = ['#E57373', '#9F7AEA', '#4FC3F7', '#FFB74D', '#81C784'];

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (id - 1) * 0.05 }}
              >
                <Button
                  onClick={() => handleOptionSelect(id)}
                  variant="ghost"
                  className="w-full h-auto min-h-[56px] justify-start text-left p-4"
                  style={{
                    borderRadius: '18px',
                    border: '1px solid rgba(38, 166, 154, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{
                      borderRadius: '12px',
                      backgroundColor: colors[id - 1] + '20'
                    }}>
                      <span className="text-lg">{emojis[id - 1]}</span>
                    </div>
                    <span className="text-sm font-medium flex-1" style={{ color: '#1A3A34' }}>
                      {labels[id - 1]}
                    </span>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </Card>
    );
  }

  // INPUT SCREEN
  if (flowStep === 'input') {
    return (
      <Card className="p-6 border-0 max-w-2xl mx-auto" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 32px rgba(38, 166, 154, 0.12)'
      }}>
        <p className="mb-4 leading-relaxed" style={{ color: '#1A3A34' }}>
          {PROMPTS[selectedOption]}
        </p>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type here..."
          className="w-full p-4 rounded-xl resize-none min-h-[120px] mb-4"
          style={{
            border: '1px solid rgba(38, 166, 154, 0.2)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: '#1A3A34'
          }}
        />
        <Button
          onClick={handleContinueFromInput}
          disabled={!userInput.trim()}
          className="w-full text-white"
          style={{
            borderRadius: '18px',
            backgroundColor: '#26A69A',
            boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)',
            opacity: !userInput.trim() ? 0.5 : 1
          }}
        >
          Continue
        </Button>
      </Card>
    );
  }

  // CONFIRM SCREEN
  if (flowStep === 'confirm') {
    const reflections = {
      1: `It sounds like you're dealing with ${userInput.toLowerCase()}. Did I understand that correctly?`,
      2: `So the thought bothering you is: "${userInput}". Is that right?`,
      3: `You want to reflect on ${userInput.toLowerCase()}. Did I capture that accurately?`,
      4: `You want to work on: ${userInput}. Is that correct?`,
      5: `You're looking for ${userInput.toLowerCase()}. Did I get that right?`
    };

    return (
      <Card className="p-6 border-0 max-w-2xl mx-auto" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 32px rgba(38, 166, 154, 0.12)'
      }}>
        <p className="mb-4 leading-relaxed" style={{ color: '#1A3A34' }}>
          {reflections[selectedOption]}
        </p>
        <p className="mb-6 text-sm" style={{ color: '#5A7A72' }}>
          Would you like me to help you work with this now?
        </p>
        <div className="flex gap-3">
          <Button
            onClick={handleConfirmYes}
            className="flex-1 text-white"
            style={{
              borderRadius: '18px',
              backgroundColor: '#26A69A',
              boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
            }}
          >
            Yes, continue
          </Button>
          <Button
            onClick={handleConfirmNo}
            variant="outline"
            className="flex-1"
            style={{
              borderRadius: '18px',
              borderColor: 'rgba(38, 166, 154, 0.3)'
            }}
          >
            Not exactly
          </Button>
        </div>
      </Card>
    );
  }

  // EXECUTE SCREEN - Loading or alternatives
  if (flowStep === 'execute') {
    if (isProcessing) {
      return (
        <Card className="p-8 border-0 max-w-2xl mx-auto text-center" style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 32px rgba(38, 166, 154, 0.12)'
        }}>
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" style={{ color: '#26A69A' }} />
          <p style={{ color: '#5A7A72' }}>Creating your entry...</p>
        </Card>
      );
    }

    // Show alternatives for options 2 & 3
    if ((selectedOption === 2 || selectedOption === 3) && alternatives.length > 0) {
      return (
        <Card className="p-6 border-0 max-w-2xl mx-auto" style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 32px rgba(38, 166, 154, 0.12)'
        }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A3A34' }}>
            Alternative perspectives
          </h3>
          <p className="text-sm mb-6" style={{ color: '#5A7A72' }}>
            Which of these feels most helpful?
          </p>

          <div className="space-y-3">
            {alternatives.map((alt, index) => (
              <Button
                key={index}
                onClick={() => handleSelectAlternative(alt)}
                disabled={isProcessing}
                className="w-full text-left h-auto p-4 justify-start"
                variant="outline"
                style={{
                  borderRadius: '18px',
                  borderColor: 'rgba(38, 166, 154, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                    backgroundColor: 'rgba(38, 166, 154, 0.15)'
                  }}>
                    <span className="text-sm font-medium" style={{ color: '#26A69A' }}>
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <span className="flex-1" style={{ color: '#1A3A34', lineHeight: '1.5' }}>
                    {alt}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      );
    }

    // For option 1 (not feeling well) - show grounding
    if (selectedOption === 1) {
      return (
        <Card className="p-6 border-0 max-w-2xl mx-auto" style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 32px rgba(38, 166, 154, 0.12)'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A3A34' }}>
            Let's ground together
          </h3>
          <div className="space-y-4 mb-6">
            <p style={{ color: '#1A3A34' }}>
              <strong>1.</strong> Take a slow, deep breath in for 4 counts, hold for 4, breathe out for 6.
            </p>
            <p style={{ color: '#1A3A34' }}>
              <strong>2.</strong> Name 3 things you can see, 2 you can hear, 1 you can touch.
            </p>
            <p style={{ color: '#1A3A34' }}>
              <strong>3.</strong> Place your feet flat on the ground. Feel the support beneath you.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                base44.entities.ThoughtJournal.create({
                  date: new Date().toISOString().split('T')[0],
                  situation: "Grounding practice",
                  automatic_thoughts: userInput,
                  emotions: [],
                  intensity: 5,
                  cognitive_distortions: []
                });
                setFlowStep('complete');
              }}
              variant="outline"
              className="flex-1"
              style={{ borderRadius: '18px' }}
            >
              Save as note
            </Button>
            <Button
              onClick={() => navigate(createPageUrl('Exercises'))}
              className="flex-1 text-white"
              style={{
                borderRadius: '18px',
                backgroundColor: '#26A69A',
                boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
              }}
            >
              Try a calming exercise
            </Button>
          </div>
        </Card>
      );
    }

    // For option 4 (goal) - completion
    if (selectedOption === 4) {
      return (
        <Card className="p-8 border-0 max-w-2xl mx-auto text-center" style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 32px rgba(38, 166, 154, 0.12)'
        }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
            backgroundColor: 'rgba(129, 199, 132, 0.2)'
          }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: '#81C784' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A3A34' }}>
            Goal created
          </h3>
          <p className="mb-6" style={{ color: '#5A7A72' }}>
            Your goal has been saved. Track your progress anytime.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleDoAnother}
              variant="outline"
              className="flex-1"
              style={{ borderRadius: '18px' }}
            >
              Do another one
            </Button>
            <Button
              onClick={handleGoToGoals}
              className="flex-1 text-white"
              style={{
                borderRadius: '18px',
                backgroundColor: '#26A69A',
                boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
              }}
            >
              Go to Goals
            </Button>
          </div>
        </Card>
      );
    }
  }

  // COMPLETE SCREEN
  if (flowStep === 'complete') {
    return (
      <Card className="p-8 border-0 max-w-2xl mx-auto text-center" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 32px rgba(38, 166, 154, 0.12)'
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
            backgroundColor: 'rgba(129, 199, 132, 0.2)'
          }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: '#81C784' }} />
          </div>
        </motion.div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A3A34' }}>
          Entry saved
        </h3>
        <p className="mb-6" style={{ color: '#5A7A72' }}>
          Your thought has been recorded in your journal.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={handleDoAnother}
            variant="outline"
            className="flex-1"
            style={{ borderRadius: '18px', borderColor: 'rgba(38, 166, 154, 0.3)' }}
          >
            Do another one
          </Button>
          <Button
            onClick={handleGoToJournal}
            className="flex-1 text-white"
            style={{
              borderRadius: '18px',
              backgroundColor: '#26A69A',
              boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
            }}
          >
            Go to Journal
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}