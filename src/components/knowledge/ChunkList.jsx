import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

const LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

export default function ChunkList({ onEdit, onNew }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState(null);
  const [filters, setFilters] = useState({
    topic: '', subtopic: '', language: 'all', is_active: 'all', priority_min: '', priority_max: ''
  });
  const [search, setSearch] = useState('');

  const { data: chunks = [], isLoading } = useQuery({
    queryKey: ['trustedCBTChunks'],
    queryFn: () => base44.entities.TrustedCBTChunk.list('-priority_score', 200),
  });

  const handleDelete = async () => {
    try {
      await base44.entities.TrustedCBTChunk.delete(pendingDelete.id);
      queryClient.invalidateQueries({ queryKey: ['trustedCBTChunks'] });
      toast({ title: 'Chunk deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' });
    } finally {
      setPendingDelete(null);
    }
  };

  const filtered = chunks.filter(c => {
    if (filters.topic && !c.topic?.toLowerCase().includes(filters.topic.toLowerCase())) return false;
    if (filters.subtopic && !c.subtopic?.toLowerCase().includes(filters.subtopic.toLowerCase())) return false;
    if (filters.language !== 'all' && c.language !== filters.language) return false;
    if (filters.is_active !== 'all' && String(c.is_active) !== filters.is_active) return false;
    if (filters.priority_min !== '' && (c.priority_score ?? 0) < Number(filters.priority_min)) return false;
    if (filters.priority_max !== '' && (c.priority_score ?? 0) > Number(filters.priority_max)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (c.title?.toLowerCase().includes(q) || c.topic?.toLowerCase().includes(q) || c.tags?.join(' ').includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search title, topic, tags…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Input placeholder="Topic filter" className="w-32" value={filters.topic} onChange={e => setFilters(f => ({ ...f, topic: e.target.value }))} />
        <Input placeholder="Subtopic" className="w-32" value={filters.subtopic} onChange={e => setFilters(f => ({ ...f, subtopic: e.target.value }))} />
        <Select value={filters.language} onValueChange={v => setFilters(f => ({ ...f, language: v }))}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All lang</SelectItem>
            {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.is_active} onValueChange={v => setFilters(f => ({ ...f, is_active: v }))}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Min score" type="number" className="w-24" value={filters.priority_min} onChange={e => setFilters(f => ({ ...f, priority_min: e.target.value }))} />
        <Input placeholder="Max score" type="number" className="w-24" value={filters.priority_max} onChange={e => setFilters(f => ({ ...f, priority_max: e.target.value }))} />
        <Button onClick={onNew} className="ml-auto gap-2"><Plus className="w-4 h-4" /> New Chunk</Button>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} of {chunks.length} chunks</p>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No chunks found. Adjust filters or create a new one.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(chunk => (
            <Card key={chunk.id} className="border border-border/60">
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 items-center mb-1">
                    <span className="font-medium truncate">{chunk.title}</span>
                    <Badge variant={chunk.is_active ? 'default' : 'secondary'} className="text-xs">
                      {chunk.is_active ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{chunk.language || 'en'}</Badge>
                    <span className="text-xs text-muted-foreground">score: {chunk.priority_score ?? 5}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                    {chunk.topic && <span className="bg-secondary px-1.5 py-0.5 rounded">{chunk.topic}</span>}
                    {chunk.subtopic && <span className="bg-secondary px-1.5 py-0.5 rounded">{chunk.subtopic}</span>}
                    {(chunk.tags || []).slice(0, 5).map(t => (
                      <span key={t} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                    {(chunk.tags || []).length > 5 && <span>+{chunk.tags.length - 5} more</span>}
                  </div>
                  {chunk.short_summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{chunk.short_summary}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(chunk)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setPendingDelete(chunk)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={open => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chunk?</AlertDialogTitle>
            <AlertDialogDescription>"{pendingDelete?.title}" will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}