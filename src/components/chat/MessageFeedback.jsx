import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MessageFeedback({ conversationId, messageIndex, agentName, context }) {
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (type) => {
    if (isSubmitting || feedback) return;
    
    setIsSubmitting(true);
    setFeedback(type);

    try {
      await base44.entities.TherapyFeedback.create({
        conversation_id: conversationId,
        message_index: messageIndex,
        feedback_type: type,
        agent_name: agentName,
        session_context: context
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-xs text-gray-500 mr-2">Was this helpful?</span>
      <button
        onClick={() => handleFeedback('helpful')}
        disabled={feedback !== null}
        data-testid="feedback-helpful"
        className={cn(
          "p-1 rounded-md transition-colors",
          feedback === 'helpful' 
            ? "bg-green-100 text-green-700" 
            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
        )}
        aria-label="Helpful"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => handleFeedback('not_helpful')}
        disabled={feedback !== null}
        data-testid="feedback-not-helpful"
        className={cn(
          "p-1 rounded-md transition-colors",
          feedback === 'not_helpful' 
            ? "bg-red-100 text-red-700" 
            : "text-gray-400 hover:text-red-600 hover:bg-red-50"
        )}
        aria-label="Not helpful"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
      {feedback && (
        <span className="text-xs text-gray-500 ml-2">Thanks for your feedback!</span>
      )}
    </div>
  );
}