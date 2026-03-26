import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { X, Save, Plus } from 'lucide-react';

const LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];
const SOURCE_TYPES = ['clinical_manual', 'research_paper', 'guidelines', 'original', 'adapted', 'other'];
const LICENSE_STATUSES = ['open', 'proprietary', 'adapted', 'original', 'unknown'];

const EMPTY = {
  title: '', topic: '', subtopic: '', population: '', clinical_goal: '',
  content: '', short_summary: '', tags: [], source_name: '', source_type: '',
  license_status: '', safety_notes: '', contraindications: '',
  language: 'en', priority_score: 5, is_active: false,
};

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Required';
  if (!form.topic.trim()) errors.topic = 'Required';
  if (!form.content.trim()) errors.content = 'Required';
  const score = Number(form.priority_score);
  if (isNaN(score) || score < 0 || score > 10) errors.priority_score = 'Must be 0–10';
  return errors;
}

function normalizeTags(rawTags) {
  return [...new Set(rawTags.map(t => t.toLowerCase().trim()).filter(Boolean))];
}

export default function ChunkForm({ chunk, onSave, onCancel }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chunk) {
      setForm({ ...EMPTY, ...chunk, tags: chunk.tags || [] });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setTagInput('');
  }, [chunk]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addTag = () => {
    if (!tagInput.trim()) return;
    const newTags = normalizeTags([...form.tags, ...tagInput.split(',')]);
    set('tags', newTags);
    setTagInput('');
  };

  const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag));

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, tags: normalizeTags(form.tags), priority_score: Number(form.priority_score) };
      if (chunk?.id) {
        await base44.entities.TrustedCBTChunk.update(chunk.id, payload);
        toast({ title: 'Chunk updated' });
      } else {
        await base44.entities.TrustedCBTChunk.create(payload);
        toast({ title: 'Chunk created' });
      }
      queryClient.invalidateQueries({ queryKey: ['trustedCBTChunks'] });
      onSave();
    } catch (e) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, opts = {}) => (
    <div className="space-y-1">
      <Label>{label}{opts.required && <span className="text-destructive ml-1">*</span>}</Label>
      {opts.textarea ? (
        <Textarea value={form[key]} onChange={e => set(key, e.target.value)} rows={opts.rows || 4} placeholder={opts.placeholder} className={errors[key] ? 'border-destructive' : ''} />
      ) : (
        <Input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={opts.placeholder} className={errors[key] ? 'border-destructive' : ''} type={opts.type || 'text'} />
      )}
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Identity */}
      <Card>
        <CardHeader><CardTitle className="text-base">Identity</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Title', 'title', { required: true, placeholder: 'e.g., CBT Thought Record for Anxiety' })}
          {field('Topic', 'topic', { required: true, placeholder: 'e.g., anxiety, depression, sleep' })}
          {field('Subtopic', 'subtopic', { placeholder: 'e.g., catastrophizing, avoidance' })}
          {field('Population', 'population', { placeholder: 'e.g., adults, adolescents, general' })}
          {field('Clinical Goal', 'clinical_goal', { placeholder: 'e.g., reduce avoidance, challenge distortions' })}
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {field('Full Content', 'content', { required: true, textarea: true, rows: 8, placeholder: 'Full clinical content of this chunk…' })}
          {field('Short Summary', 'short_summary', { textarea: true, rows: 3, placeholder: 'Brief summary for retrieval injection…' })}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tags</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="Add tags (comma-separated)"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button variant="outline" onClick={addTag} type="button"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Tags are auto-normalized to lowercase with duplicates removed.</p>
        </CardContent>
      </Card>

      {/* Source & Metadata */}
      <Card>
        <CardHeader><CardTitle className="text-base">Source & Metadata</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Source Name', 'source_name', { placeholder: 'e.g., Beck Institute, NICE Guidelines' })}
          <div className="space-y-1">
            <Label>Source Type</Label>
            <Select value={form.source_type || ''} onValueChange={v => set('source_type', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{SOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>License Status</Label>
            <Select value={form.license_status || ''} onValueChange={v => set('license_status', v)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{LICENSE_STATUSES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Language</Label>
            <Select value={form.language} onValueChange={v => set('language', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Priority Score (0–10)<span className="text-destructive ml-1">*</span></Label>
            <Input type="number" min={0} max={10} step={1} value={form.priority_score} onChange={e => set('priority_score', e.target.value)} className={errors.priority_score ? 'border-destructive' : ''} />
            {errors.priority_score && <p className="text-xs text-destructive">{errors.priority_score}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Safety */}
      <Card>
        <CardHeader><CardTitle className="text-base">Safety</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {field('Safety Notes', 'safety_notes', { textarea: true, rows: 3, placeholder: 'Any safety considerations for using this content…' })}
          {field('Contraindications', 'contraindications', { textarea: true, rows: 3, placeholder: 'Conditions where this should NOT be used…' })}
        </CardContent>
      </Card>

      {/* Status & Actions */}
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Switch checked={form.is_active} onCheckedChange={v => set('is_active', v)} id="is_active" />
            <Label htmlFor="is_active" className="cursor-pointer">
              {form.is_active ? '✅ Published (active)' : '📝 Draft (inactive)'}
            </Label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />{saving ? 'Saving…' : chunk?.id ? 'Update' : 'Create'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}