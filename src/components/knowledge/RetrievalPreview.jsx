import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function RetrievalPreview() {
  const { toast } = useToast();
  const [form, setForm] = useState({ userMessage: '', topicHint: '', emotionalState: '', maxResults: 5 });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const run = async () => {
    if (!form.userMessage.trim()) { toast({ title: 'userMessage is required', variant: 'destructive' }); return; }
    setLoading(true);
    setResults(null);
    try {
      const res = await base44.functions.invoke('retrieveTrustedCBTContent', {
        userMessage: form.userMessage,
        topicHint: form.topicHint || undefined,
        emotionalState: form.emotionalState || undefined,
        maxResults: Number(form.maxResults) || 5,
      });
      setResults(res.data);
    } catch (e) {
      toast({ title: 'Retrieval failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-primary" />Retrieval Preview</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>User Message <span className="text-destructive">*</span></Label>
            <Input value={form.userMessage} onChange={e => set('userMessage', e.target.value)} placeholder="e.g., I keep catastrophizing about losing my job" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Topic Hint</Label>
              <Input value={form.topicHint} onChange={e => set('topicHint', e.target.value)} placeholder="e.g., anxiety" />
            </div>
            <div className="space-y-1">
              <Label>Emotional State</Label>
              <Input value={form.emotionalState} onChange={e => set('emotionalState', e.target.value)} placeholder="e.g., anxious, overwhelmed" />
            </div>
            <div className="space-y-1">
              <Label>Max Results</Label>
              <Input type="number" min={1} max={10} value={form.maxResults} onChange={e => set('maxResults', e.target.value)} />
            </div>
          </div>
          <Button onClick={run} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Run Retrieval
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Mode: <Badge variant="outline">{results.mode}</Badge> · {results.total_results} result(s) returned
          </p>
          {results.total_results === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No active chunks matched the query. Add TrustedCBTChunk records and publish them.</CardContent></Card>
          ) : (
            results.results.map((chunk, i) => (
              <Card key={chunk.id || i} className="border border-border/60">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">#{i + 1} {chunk.title}</span>
                      <Badge variant={chunk.is_active ? 'default' : 'secondary'} className="text-xs">
                        {chunk.is_active ? 'published' : 'draft'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{chunk.language || 'en'}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">score: {chunk.priority_score ?? 5}</span>
                  </div>
                  <div className="flex gap-2 text-xs flex-wrap">
                    {chunk.topic && <span className="bg-secondary px-1.5 py-0.5 rounded">{chunk.topic}</span>}
                    {chunk.subtopic && <span className="bg-secondary px-1.5 py-0.5 rounded">{chunk.subtopic}</span>}
                    {(chunk.tags || []).map(t => (
                      <span key={t} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                  {chunk.short_summary && <p className="text-sm text-muted-foreground">{chunk.short_summary}</p>}
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Score explanation</summary>
                    <div className="mt-2 p-2 bg-secondary/40 rounded text-muted-foreground space-y-1">
                      <p>Scoring is keyword-overlap based (v1 deterministic):</p>
                      <p>• Tags match × 2 + topic match + subtopic match + title match = keyword score</p>
                      <p>• Final = (keyword score × 10) + priority_score</p>
                      <p>Priority score: {chunk.priority_score ?? 5} · Tags: {(chunk.tags || []).join(', ') || 'none'}</p>
                    </div>
                  </details>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}