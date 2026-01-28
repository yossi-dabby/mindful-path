import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

/**
 * Non-breaking handler for thought work saves with structured data extraction.
 * Falls back gracefully if extraction fails.
 */
export default function ThoughtWorkSaveHandler({ 
  conversationId, 
  conversationMessages, 
  onSaveComplete, 
  onCancel 
}) {
  const [status, setStatus] = useState('idle'); // idle | extracting | saving | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      setStatus('extracting');
      
      // Step 1: Extract structured data from conversation
      let structuredData = null;
      try {
        const extractResult = await base44.functions.invoke('extractThoughtWorkData', {
          conversation_messages: conversationMessages
        });
        
        if (extractResult?.data?.success && extractResult?.data?.data) {
          structuredData = extractResult.data.data;
        }
      } catch (error) {
        console.warn('Structured data extraction failed (non-critical):', error);
        // Continue with basic save
      }

      setStatus('saving');

      // Step 2: Save to ThoughtJournal
      // Use structured data if available, otherwise use basic fields
      const journalEntry = {
        entry_type: 'cbt_standard',
        situation: structuredData?.situation || 'Thought work session',
        automatic_thoughts: structuredData?.automatic_thoughts || '',
        emotions: structuredData?.emotions || [],
        emotion_intensity: structuredData?.emotion_ratings?.anxiety || null,
        emotion_ratings: structuredData?.emotion_ratings || null,
        evidence_for: structuredData?.evidence_for || '',
        evidence_against: structuredData?.evidence_against || '',
        balanced_thought: structuredData?.balanced_thought || '',
        homework_tasks: structuredData?.homework || [],
        custom_fields: {
          conversation_id: conversationId,
          extracted_at: new Date().toISOString()
        }
      };

      await base44.entities.ThoughtJournal.create(journalEntry);
      
      return { structuredData };
    },
    onSuccess: ({ structuredData }) => {
      setStatus('success');
      queryClient.invalidateQueries(['thoughtJournals']);
      
      setTimeout(() => {
        if (onSaveComplete) {
          onSaveComplete(structuredData);
        }
      }, 1500);
    },
    onError: (error) => {
      console.error('Save error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to save. Please try again.');
    }
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  if (status === 'idle') {
    return (
      <Card className="p-4 border-0" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 246, 243, 0.8) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(38, 166, 154, 0.15)'
      }}>
        <p className="text-sm mb-4" style={{ color: '#1A3A34' }}>
          Save this thought record with your homework plan to your Journal?
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="text-white"
            style={{
              borderRadius: '16px',
              backgroundColor: '#26A69A',
              boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
            }}
          >
            Save to Journal
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            style={{
              borderRadius: '16px',
              borderColor: 'rgba(38, 166, 154, 0.3)'
            }}
          >
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  if (status === 'extracting') {
    return (
      <Card className="p-4 border-0" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 246, 243, 0.8) 100%)',
        backdropFilter: 'blur(12px)'
      }}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#26A69A' }} />
          <p className="text-sm" style={{ color: '#5A7A72' }}>
            Analyzing conversation and extracting homework...
          </p>
        </div>
      </Card>
    );
  }

  if (status === 'saving') {
    return (
      <Card className="p-4 border-0" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 246, 243, 0.8) 100%)',
        backdropFilter: 'blur(12px)'
      }}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#26A69A' }} />
          <p className="text-sm" style={{ color: '#5A7A72' }}>
            Saving to your Journal...
          </p>
        </div>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="p-4 border-0" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 246, 243, 0.8) 100%)',
        backdropFilter: 'blur(12px)'
      }}>
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5" style={{ color: '#26A69A' }} />
          <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>
            ✓ Saved to your Thought Journal with homework plan.
          </p>
        </div>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="p-4 border-0" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 246, 243, 0.8) 100%)',
        backdropFilter: 'blur(12px)'
      }}>
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#E57373' }} />
          <p className="text-sm" style={{ color: '#1A3A34' }}>
            {errorMessage}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            size="sm"
            style={{
              borderRadius: '16px',
              backgroundColor: '#26A69A'
            }}
          >
            Try Again
          </Button>
          <Button
            onClick={onCancel}
            size="sm"
            variant="outline"
            style={{
              borderRadius: '16px',
              borderColor: 'rgba(38, 166, 154, 0.3)'
            }}
          >
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}