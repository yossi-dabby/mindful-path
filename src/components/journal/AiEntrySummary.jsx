import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AiEntrySummary({ entry, onSummaryGenerated }) {
  const [summary, setSummary] = useState(entry.ai_summary || null);
  const [isGenerating, setIsGenerating] = useState(false);

  const shouldAutoGenerate = !summary && (
    (entry.situation?.length || 0) + (entry.automatic_thoughts?.length || 0) > 200
  );

  useEffect(() => {
    if (shouldAutoGenerate) {
      generateSummary();
    }
  }, [entry.id]);

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this CBT thought journal entry in 2-3 concise sentences. Focus on: 1) The core situation, 2) Main emotions felt, 3) The balanced thought outcome.

ENTRY:
Situation: ${entry.situation || 'Not specified'}
Automatic Thoughts: ${entry.automatic_thoughts || 'Not specified'}
Emotions: ${entry.emotions?.join(', ') || 'Not specified'}
Balanced Thought: ${entry.balanced_thought || 'Not specified'}

Write a brief, empathetic summary that captures the essence. Max 150 words.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" }
          }
        }
      });

      const generatedSummary = response.summary;
      setSummary(generatedSummary);

      // Save summary to database
      await base44.entities.ThoughtJournal.update(entry.id, {
        ai_summary: generatedSummary
      });

      if (onSummaryGenerated) {
        onSummaryGenerated(generatedSummary);
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Generating AI summary...</span>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateSummary}
          className="mt-2 h-7 text-xs text-purple-600 hover:text-purple-700"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Regenerate
        </Button>
      </div>
    );
  }

  return null;
}