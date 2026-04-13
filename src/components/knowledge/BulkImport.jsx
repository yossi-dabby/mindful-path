import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BATCH_2, BATCH_3 } from './bulkImportBatches';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, AlertTriangle, FlaskConical, Database } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import smokeBatch from '@/data/trusted-cbt-batch-1.smoke.base44.json';
import fullBatch from '@/data/trusted-cbt-batch-1.base44.json';

const REQUIRED = ['title', 'topic', 'content'];
const LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

/** Canonical Base44 TrustedCBTChunk fields. Extra fields beyond this set are flagged.
 * Update only when a schema change is explicitly approved — entity definitions in src/api/entities/ are read-only. */
const BASE44_FIELDS = new Set([
  'title', 'topic', 'subtopic', 'population', 'clinical_goal', 'content',
  'short_summary', 'tags', 'source_name', 'source_type', 'license_status',
  'safety_notes', 'contraindications', 'language', 'priority_score', 'is_active',
]);



function validateRecord(rec, index) {
  const errors = [];
  REQUIRED.forEach(f => { if (!rec[f]?.toString().trim()) errors.push(`"${f}" is required`); });
  if (rec.priority_score !== undefined) {
    const s = Number(rec.priority_score);
    if (isNaN(s) || s < 0 || s > 10) errors.push('"priority_score" must be 0–10');
  }
  if (rec.language && !LANGUAGES.includes(rec.language)) {
    errors.push(`"language" must be one of: ${LANGUAGES.join(', ')}`);
  }
  if (rec.tags !== undefined && !Array.isArray(rec.tags)) {
    errors.push('"tags" must be an array');
  }
  const extra = Object.keys(rec).filter(k => !BASE44_FIELDS.has(k));
  if (extra.length > 0) {
    errors.push(`Extra non-Base44 fields detected: ${extra.map(f => `"${f}"`).join(', ')}`);
  }
  return errors;
}

function normalizeRecord(rec) {
  const tags = Array.isArray(rec.tags)
    ? [...new Set(rec.tags.map(t => String(t).toLowerCase().trim()).filter(Boolean))]
    : [];
  return {
    title: rec.title?.trim() || '',
    topic: rec.topic?.trim() || '',
    subtopic: rec.subtopic?.trim() || '',
    population: rec.population?.trim() || '',
    clinical_goal: rec.clinical_goal?.trim() || '',
    content: rec.content?.trim() || '',
    short_summary: rec.short_summary?.trim() || '',
    tags,
    source_name: rec.source_name?.trim() || '',
    source_type: rec.source_type?.trim() || '',
    license_status: rec.license_status?.trim() || '',
    safety_notes: rec.safety_notes?.trim() || '',
    contraindications: rec.contraindications?.trim() || '',
    language: LANGUAGES.includes(rec.language) ? rec.language : 'en',
    priority_score: Number(rec.priority_score ?? 5),
    is_active: Boolean(rec.is_active ?? false),
  };
}

export default function BulkImport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [json, setJson] = useState('');
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState('');
  const [importResults, setImportResults] = useState(null);
  const [importing, setImporting] = useState(false);

  const loadBatch = (batch, label) => {
    setJson(JSON.stringify(batch, null, 2));
    setParsed(null);
    setImportResults(null);
    setParseError('');
    toast({ title: `${label} loaded — click Validate JSON to continue` });
  };

  const handleParse = () => {
    setParseError('');
    setParsed(null);
    setImportResults(null);
    let data;
    try {
      data = JSON.parse(json.trim());
    } catch (e) {
      setParseError(`JSON parse error: ${e.message}`);
      return;
    }
    const records = Array.isArray(data) ? data : [data];
    const validated = records.map((rec, i) => ({
      index: i,
      record: rec,
      errors: validateRecord(rec, i),
    }));
    setParsed(validated);
  };

  const handleImport = async () => {
    if (!parsed) return;
    const valid = parsed.filter(r => r.errors.length === 0);
    if (valid.length === 0) {
      toast({ title: 'No valid records to import', variant: 'destructive' });
      return;
    }
    setImporting(true);
    const results = [];
    for (const { record, index } of valid) {
      try {
        const normalized = normalizeRecord(record);
        await base44.entities.TrustedCBTChunk.create(normalized);
        results.push({ index, title: record.title, status: 'success' });
      } catch (e) {
        results.push({ index, title: record.title, status: 'error', error: e.message });
      }
    }
    setImportResults(results);
    queryClient.invalidateQueries({ queryKey: ['trustedCBTChunks'] });
    const successCount = results.filter(r => r.status === 'success').length;
    toast({ title: `Imported ${successCount}/${valid.length} records` });
    setImporting(false);
  };

  const validCount = parsed ? parsed.filter(r => r.errors.length === 0).length : 0;
  const invalidCount = parsed ? parsed.filter(r => r.errors.length > 0).length : 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />Bulk JSON Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste a JSON array of TrustedCBTChunk records. Required fields: <code className="text-xs bg-secondary px-1 rounded">title</code>, <code className="text-xs bg-secondary px-1 rounded">topic</code>, <code className="text-xs bg-secondary px-1 rounded">content</code>.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => loadBatch(smokeBatch, 'Smoke Batch')}>Load Smoke Batch (3)</Button>
            <Button variant="outline" size="sm" onClick={() => loadBatch(fullBatch, 'Full Batch')}>Load Full Batch (10)</Button>
            <Button variant="outline" size="sm" onClick={() => loadBatch(BATCH_2)}>Load Batch 2 (25)</Button>
            <Button variant="outline" size="sm" onClick={() => loadBatch(BATCH_3)}>Load Batch 3 (50)</Button>
          </div>
          <Textarea
            value={json}
            onChange={e => { setJson(e.target.value); setParsed(null); setImportResults(null); setParseError(''); }}
            placeholder={'[\n  {\n    "title": "Thought Record for Anxiety",\n    "topic": "anxiety",\n    "content": "...",\n    "tags": ["worry", "rumination"],\n    "language": "en",\n    "priority_score": 7,\n    "is_active": false\n  }\n]'}
            rows={12}
            className="font-mono text-xs"
          />
          {parseError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="w-4 h-4 flex-shrink-0" />{parseError}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleParse} disabled={!json.trim()}>Validate JSON</Button>
            {parsed && validCount > 0 && !importResults && (
              <Button onClick={handleImport} disabled={importing} className="gap-2">
                <Upload className="w-4 h-4" />{importing ? 'Importing…' : `Import ${validCount} valid record(s)`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Report */}
      {parsed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-3">
              Validation Report
              <Badge variant="default" className="gap-1"><CheckCircle className="w-3 h-3" />{validCount} valid</Badge>
              {invalidCount > 0 && <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />{invalidCount} invalid</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {parsed.map(({ index, record, errors }) => (
              <div key={index} className="flex items-start gap-2 text-sm border-b border-border/40 pb-2 last:border-0">
                {errors.length === 0
                  ? <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <span className="font-medium">[{index}] {record.title || '(no title)'}</span>
                  {errors.length > 0 && (
                    <ul className="text-xs text-destructive mt-0.5 list-disc list-inside">
                      {errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader><CardTitle className="text-base">Import Results</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {importResults.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm border-b border-border/40 pb-2 last:border-0">
                {r.status === 'success'
                  ? <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />}
                <div>
                  <span className="font-medium">[{r.index}] {r.title || '(no title)'}</span>
                  {r.error && <p className="text-xs text-destructive">{r.error}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}