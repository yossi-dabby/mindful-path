import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Edit, Trash2, TrendingDown, Image as ImageIcon, Mic, Tag, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import AiJournalSuggestions from './AiJournalSuggestions';

// Helper to strip HTML tags for plain text display
const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function ThoughtRecordCard({ entry, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ThoughtJournal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['thoughtJournals']);
    }
  });

  const handleDelete = () => {
    if (confirm('Delete this journal entry? This action cannot be undone.')) {
      deleteMutation.mutate(entry.id);
    }
  };

  const intensityChange = entry.emotion_intensity - entry.outcome_emotion_intensity;
  const improvement = intensityChange > 0;

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow w-full overflow-x-hidden">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">
              {format(new Date(entry.created_date), 'MMM d, yyyy • h:mm a')}
            </p>
            <p className="text-gray-800 font-medium line-clamp-2">{stripHtml(entry.situation)}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(entry)}>
              <Edit className="w-4 h-4 text-gray-400 hover:text-blue-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {entry.emotions?.slice(0, 3).map((emotion) => (
            <Badge key={emotion} variant="secondary" className="bg-purple-100 text-purple-700">
              {emotion}
            </Badge>
          ))}
          {entry.emotions?.length > 3 && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              +{entry.emotions.length - 3} more
            </Badge>
          )}
          {entry.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {entry.outcome_emotion_intensity && (
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1",
              improvement ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            )}>
              {improvement && <TrendingDown className="w-4 h-4" />}
              Intensity: {entry.emotion_intensity} → {entry.outcome_emotion_intensity}
              {improvement && ` (-${intensityChange})`}
            </div>
          )}
          {entry.images?.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {entry.images.length} {entry.images.length === 1 ? 'image' : 'images'}
            </Badge>
          )}
          {entry.audio_notes?.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Mic className="w-3 h-3" />
              {entry.audio_notes.length} {entry.audio_notes.length === 1 ? 'audio' : 'audios'}
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="flex-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 w-full"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show full record
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowAiSuggestions(!showAiSuggestions)}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Analysis
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Automatic Thoughts:</p>
              <div className="text-gray-600 text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: entry.automatic_thoughts }} />
            </div>

            {entry.cognitive_distortions?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Thinking Patterns:</p>
                <div className="flex flex-wrap gap-2">
                  {entry.cognitive_distortions.map((distortion) => (
                    <Badge key={distortion} variant="outline" className="text-xs">
                      {distortion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {entry.evidence_for && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Evidence For:</p>
                <div className="text-gray-600 text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: entry.evidence_for }} />
              </div>
            )}

            {entry.evidence_against && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Evidence Against:</p>
                <div className="text-gray-600 text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: entry.evidence_against }} />
              </div>
            )}

            {entry.balanced_thought && (
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="text-sm font-medium text-purple-900 mb-1">Balanced Thought:</p>
                <div className="text-purple-800 text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: entry.balanced_thought }} />
              </div>
            )}

            {entry.homework_tasks?.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm font-medium text-blue-900 mb-2">Homework Tasks:</p>
                <ul className="space-y-3">
                  {entry.homework_tasks.map((task, index) => (
                    <li key={index} className="text-blue-800 text-sm pl-4 border-l-2 border-blue-300">
                      <p className="font-semibold mb-1">{task.task}</p>
                      {task.duration_minutes && (
                        <p className="text-xs text-blue-700">⏱️ Duration: {task.duration_minutes} minutes</p>
                      )}
                      {task.success_criteria && (
                        <p className="text-xs text-blue-700">✓ Success: {task.success_criteria}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attached Media */}
            {entry.images?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Attached Images:</p>
                <div className="grid grid-cols-3 gap-2">
                  {entry.images.map((url, index) => (
                    <img key={index} src={url} alt="" className="w-full h-24 object-cover rounded-lg cursor-pointer" onClick={() => window.open(url, '_blank')} />
                  ))}
                </div>
              </div>
            )}

            {entry.audio_notes?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Audio Notes:</p>
                <div className="space-y-2">
                  {entry.audio_notes.map((url, index) => (
                    <audio key={index} src={url} controls className="w-full h-10" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showAiSuggestions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <AiJournalSuggestions 
              entry={entry} 
              onClose={() => setShowAiSuggestions(false)} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}