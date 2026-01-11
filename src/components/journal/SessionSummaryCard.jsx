import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Lightbulb, ClipboardList, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function SessionSummaryCard({ summary, onDelete }) {
  const queryClient = useQueryClient();

  const deleteSummaryMutation = useMutation({
    mutationFn: (id) => base44.entities.SessionSummary.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sessionSummaries']);
      queryClient.invalidateQueries(['journalCount']);
      toast.success('Session summary deleted successfully!');
      onDelete && onDelete(summary.id);
    },
    onError: (error) => {
      toast.error(`Failed to delete session summary: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this session summary?')) {
      deleteSummaryMutation.mutate(summary.id);
    }
  };

  return (
    <Card className="border-0" style={{
      borderRadius: '24px',
      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
      boxShadow: '0 12px 40px rgba(38, 166, 154, 0.12), 0 4px 16px rgba(0,0,0,0.04)'
    }}>
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#1A3A34' }}>
            <BookOpen className="w-5 h-5 text-teal-600" />
            AI Session Summary
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            <Calendar className="inline-block w-3 h-3 mr-1 text-gray-500" />
            {new Date(summary.created_date).toLocaleDateString()} - AI insights from your conversation
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleteSummaryMutation.isPending}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 space-y-4">
        <ReactMarkdown className="prose prose-sm max-w-none">
          {summary.summary_content}
        </ReactMarkdown>
        {summary.key_takeaways?.length > 0 && (
          <div>
            <h3 className="font-semibold text-base flex items-center gap-1 mb-2" style={{ color: '#1A3A34' }}>
              <Lightbulb className="w-4 h-4 text-yellow-600" /> Key Takeaways
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {summary.key_takeaways.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {summary.actionable_advice?.length > 0 && (
          <div>
            <h3 className="font-semibold text-base flex items-center gap-1 mb-2" style={{ color: '#1A3A34' }}>
              <ClipboardList className="w-4 h-4 text-blue-600" /> Actionable Advice
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {summary.actionable_advice.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {summary.recommended_resources?.length > 0 && (
          <div>
            <h3 className="font-semibold text-base flex items-center gap-1 mb-2" style={{ color: '#1A3A34' }}>
              <BookOpen className="w-4 h-4 text-green-600" /> Recommended Resources
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {summary.recommended_resources.map((res, i) => (
                <li key={i}>
                  {res.url ? <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{res.title}</a> : res.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}