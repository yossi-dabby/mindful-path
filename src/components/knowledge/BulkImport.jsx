import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import BATCH_2_DATA from '../../data/trusted-cbt-batch-2.base44.json';
import BATCH_3_DATA from '../../data/trusted-cbt-batch-3.base44.json';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const REQUIRED = ['title', 'topic', 'content'];
const LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];
const ALLOWED_FIELDS = new Set([
  'title','topic','subtopic','population','clinical_goal','content','short_summary',
  'tags','source_name','source_type','license_status','safety_notes','contraindications',
  'language','priority_score','is_active'
]);

const SMOKE_BATCH = [
  {
    title: "Panic Disorder Psychoeducation",
    topic: "anxiety",
    subtopic: "panic disorder",
    population: "adults",
    clinical_goal: "reduce avoidance",
    content: "Panic disorder involves recurrent unexpected panic attacks — sudden surges of intense fear accompanied by physical symptoms such as racing heart, shortness of breath, dizziness, and tingling. A key CBT principle is that panic attacks are not dangerous, even though they feel overwhelming. The brain's alarm system (amygdala) fires a false alarm. Psychoeducation helps clients understand the fight-or-flight response, normalise physical sensations, and break the cycle of catastrophic misinterpretation that amplifies panic.",
    short_summary: "Explains the neuroscience of panic attacks and normalises physical sensations using the false-alarm metaphor.",
    tags: ["panic", "psychoeducation", "fight-or-flight", "anxiety"],
    source_name: "Beck Institute CBT Principles",
    source_type: "clinical_manual",
    license_status: "adapted",
    safety_notes: "Ensure client is medically cleared for cardiac symptoms before reframing.",
    contraindications: "Active cardiac conditions requiring immediate medical review.",
    language: "en",
    priority_score: 7,
    is_active: false
  },
  {
    title: "Behavioural Activation for Low Mood",
    topic: "depression",
    subtopic: "behavioural activation",
    population: "adults",
    clinical_goal: "mood_improvement",
    content: "Behavioural activation (BA) is a structured, evidence-based approach to depression that targets the withdrawal and avoidance cycle. When mood is low, people naturally reduce activity, which removes sources of positive reinforcement and deepens depression. BA works by scheduling meaningful, pleasurable, or mastery-based activities regardless of current mood. The therapist and client collaboratively identify valued activities, rate anticipated versus actual pleasure/mastery, and use activity monitoring to detect mood-behaviour links. Even small increases in activity can initiate an upward mood spiral.",
    short_summary: "Introduces the activity-withdrawal cycle in depression and guides scheduling of pleasurable and mastery activities.",
    tags: ["depression", "behavioural activation", "scheduling", "mood"],
    source_name: "Martell, Dimidjian & Herman-Dunn",
    source_type: "clinical_manual",
    license_status: "adapted",
    safety_notes: "Avoid overloading a severely depressed client; start with one small achievable activity.",
    contraindications: "Severe psychomotor retardation requiring higher-level care.",
    language: "en",
    priority_score: 8,
    is_active: false
  },
  {
    title: "Identifying Catastrophising Thoughts",
    topic: "anxiety",
    subtopic: "catastrophizing",
    population: "adults",
    clinical_goal: "challenge distortions",
    content: "Catastrophising is a cognitive distortion where a person assumes the worst possible outcome will occur and that they will not be able to cope with it. Common forms include magnification (exaggerating the significance of problems) and minimisation (underplaying coping resources). In CBT, clients learn to identify catastrophic thoughts, examine the evidence for and against them, estimate realistic probabilities, and generate balanced alternative perspectives. Thought records and Socratic questioning are primary tools for restructuring this pattern.",
    short_summary: "Defines catastrophising, describes its two components (magnification/minimisation), and outlines CBT restructuring strategies.",
    tags: ["catastrophizing", "cognitive distortion", "thought record", "anxiety"],
    source_name: "Beck Institute CBT Principles",
    source_type: "clinical_manual",
    license_status: "adapted",
    safety_notes: "",
    contraindications: "",
    language: "en",
    priority_score: 7,
    is_active: false
  }
];

const FULL_BATCH = [
  ...SMOKE_BATCH,
  {
    title: "Cognitive Restructuring: Thought Records",
    topic: "anxiety",
    subtopic: "cognitive restructuring",
    population: "adults",
    clinical_goal: "challenge distortions",
    content: "The CBT thought record is a structured worksheet that guides clients through identifying automatic negative thoughts, evaluating the evidence, and generating more balanced alternatives. Steps typically include: (1) describe the situation, (2) identify automatic thoughts and their intensity, (3) identify emotions, (4) list evidence for the thought, (5) list evidence against the thought, (6) generate a balanced thought, (7) re-rate emotion intensity. Regular practice builds metacognitive awareness and reduces emotional reactivity over time.",
    short_summary: "Explains the 7-step thought record for challenging automatic negative thoughts and developing balanced perspectives.",
    tags: ["thought record", "cognitive restructuring", "automatic thoughts"],
    source_name: "Beck Institute CBT Principles",
    source_type: "clinical_manual",
    license_status: "adapted",
    safety_notes: "",
    contraindications: "",
    language: "en",
    priority_score: 8,
    is_active: false
  },
  {
    title: "Exposure and Response Prevention Overview",
    topic: "anxiety",
    subtopic: "exposure therapy",
    population: "adults",
    clinical_goal: "reduce avoidance",
    content: "Exposure and response prevention (ERP) is the gold-standard CBT intervention for anxiety disorders including OCD, phobias, and social anxiety. The client is guided to confront feared stimuli or situations (exposure) while refraining from avoidance or safety behaviours (response prevention). This allows the anxiety response to naturally habituate and the client to learn that feared outcomes either do not occur or are manageable. ERP should be conducted collaboratively with a hierarchy of feared situations, moving from least to most distressing.",
    short_summary: "Describes ERP as the evidence-based approach to anxiety via graduated exposure and elimination of avoidance behaviours.",
    tags: ["exposure", "ERP", "OCD", "phobia", "anxiety"],
    source_name: "NICE Guidelines for Anxiety",
    source_type: "guidelines",
    license_status: "open",
    safety_notes: "Ensure adequate therapist support. Do not use for trauma without trauma-adapted protocol.",
    contraindications: "Acute suicidality; unprocessed trauma without trauma-informed framing.",
    language: "en",
    priority_score: 8,
    is_active: false
  },
  {
    title: "Relaxation Training: Diaphragmatic Breathing",
    topic: "anxiety",
    subtopic: "relaxation",
    population: "general",
    clinical_goal: "reduce avoidance",
    content: "Diaphragmatic breathing (also called belly breathing or slow breathing) activates the parasympathetic nervous system and reduces physiological arousal associated with anxiety. The client is taught to breathe slowly and deeply using the diaphragm rather than the chest. A typical protocol involves inhaling for 4 counts, holding for 1–2 counts, and exhaling for 6–8 counts. Regular practice (10–15 minutes daily) lowers baseline anxiety and provides a portable coping tool during high-stress moments.",
    short_summary: "Teaches diaphragmatic breathing as a portable anxiety-reduction technique that activates the parasympathetic system.",
    tags: ["breathing", "relaxation", "anxiety", "parasympathetic"],
    source_name: "Beck Institute CBT Principles",
    source_type: "clinical_manual",
    license_status: "adapted",
    safety_notes: "",
    contraindications: "Respiratory conditions — adapt pacing accordingly.",
    language: "en",
    priority_score: 6,
    is_active: false
  },
  {
    title: "Identifying Core Beliefs",
    topic: "depression",
    subtopic: "core beliefs",
    population: "adults",
    clinical_goal: "challenge distortions",
    content: "Core beliefs are deeply held, absolute beliefs about oneself, others, and the world that develop through early experiences. In CBT, three main categories are identified: helplessness ('I am weak/incompetent'), unlovability ('I am unworthy of love'), and worthlessness ('I am bad/defective'). Core beliefs operate as schemas that filter incoming information. Techniques for identifying them include the downward arrow technique, reviewing themes across thought records, and early memory exploration. Modification involves behavioural experiments and cognitive continuum work.",
    short_summary: "Explains CBT core beliefs in three categories and describes techniques for identification and modification.",
    tags: ["core beliefs", "schema", "depression", "downward arrow"],
    source_name: "Beck Institute CBT Principles",
    source_type: "clinical_manual",
    license_status: "adapted",
    safety_notes: "",
    contraindications: "Deep schema work should not begin in crisis phase.",
    language: "en",
    priority_score: 7,
    is_active: false
  },
  {
    title: "Problem-Solving Therapy Basics",
    topic: "stress",
    subtopic: "problem solving",
    population: "general",
    clinical_goal: "behavior change",
    content: "Problem-solving therapy (PST) is a structured CBT approach that helps clients develop effective strategies for managing stressful life problems. The D'Zurilla and Nezu model includes five stages: (1) problem orientation — developing a positive, solvable view of the problem; (2) problem definition and formulation; (3) generation of alternative solutions (brainstorming); (4) decision making — evaluating and choosing the best solution; (5) solution implementation and verification. PST is effective for depression, generalised anxiety, and adjustment difficulties.",
    short_summary: "Introduces the 5-stage D'Zurilla and Nezu problem-solving model for stress and depression management.",
    tags: ["problem solving", "stress", "coping", "PST"],
    source_name: "D'Zurilla & Nezu Problem-Solving Therapy",
    source_type: "clinical_manual",
    license_status: "adapted",
    safety_notes: "",
    contraindications: "",
    language: "en",
    priority_score: 6,
    is_active: false
  },
  {
    title: "Sleep Hygiene and Cognitive Factors in Insomnia",
    topic: "sleep",
    subtopic: "CBT for insomnia",
    population: "adults",
    clinical_goal: "mood_improvement",
    content: "CBT for insomnia (CBT-I) is the recommended first-line treatment for chronic insomnia. It combines sleep restriction therapy, stimulus control, cognitive restructuring of unhelpful sleep beliefs, and sleep hygiene education. Key beliefs to address include 'I must get 8 hours or I cannot function' and catastrophising about sleeplessness. Sleep restriction consolidates sleep by limiting time in bed to actual sleep time, then gradually extending it as efficiency improves. Sleep hygiene includes consistent wake times, limiting caffeine, and reducing screen use before bed.",
    short_summary: "Outlines CBT-I components: sleep restriction, stimulus control, cognitive restructuring of sleep beliefs, and sleep hygiene.",
    tags: ["sleep", "insomnia", "CBT-I", "sleep restriction"],
    source_name: "NICE Guidelines for Insomnia",
    source_type: "guidelines",
    license_status: "open",
    safety_notes: "Sleep restriction is contraindicated in bipolar disorder and seizure disorders.",
    contraindications: "Bipolar disorder; seizure disorder; shift work disorder requiring separate protocol.",
    language: "en",
    priority_score: 7,
    is_active: false
  },
  {
    title: "Mindfulness in CBT: Decentring",
    topic: "anxiety",
    subtopic: "mindfulness",
    population: "general",
    clinical_goal: "challenge distortions",
    content: "Decentring (also called defusion in ACT) is the ability to observe thoughts as mental events rather than facts. Mindfulness-based CBT (MBCT) trains clients to adopt a metacognitive observer stance: noticing thoughts arising and passing without fusing with them. Techniques include labelling thoughts ('I am having the thought that…'), the leaves on a stream visualisation, and brief body-scan practices. Decentring reduces rumination and prevents relapse in recurrent depression by interrupting the automatic elaboration of negative thinking.",
    short_summary: "Introduces decentring as a mindfulness-based CBT skill for observing thoughts without fusion, reducing rumination.",
    tags: ["mindfulness", "decentring", "MBCT", "rumination", "metacognition"],
    source_name: "Segal, Williams & Teasdale MBCT Manual",
    source_type: "clinical_manual",
    license_status: "adapted",
    safety_notes: "",
    contraindications: "Active psychosis; dissociative disorders — adapt with clinical supervision.",
    language: "en",
    priority_score: 7,
    is_active: false
  }
];

const BATCH_2 = BATCH_2_DATA.map(r => ({ ...r, is_active: false }));
const BATCH_3 = BATCH_3_DATA.map(r => ({ ...r, is_active: false }));

function validateRecord(rec, index) {
  const errors = [];
  // Reject extra fields not in the allowed schema
  Object.keys(rec).forEach(k => {
    if (!ALLOWED_FIELDS.has(k)) errors.push(`Unknown field "${k}" — not in TrustedCBTChunk schema`);
  });
  REQUIRED.forEach(f => { if (!rec[f]?.toString().trim()) errors.push(`"${f}" is required`); });
  if (rec.priority_score !== undefined) {
    const s = Number(rec.priority_score);
    if (isNaN(s) || s < 0 || s > 10) errors.push('"priority_score" must be 0–10');
  }
  if (rec.language && !LANGUAGES.includes(rec.language)) {
    errors.push(`"language" must be one of: ${LANGUAGES.join(', ')}`);
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

  const loadBatch = (batch) => {
    setJson(JSON.stringify(batch, null, 2));
    setParsed(null);
    setImportResults(null);
    setParseError('');
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
            <Button variant="outline" size="sm" onClick={() => loadBatch(SMOKE_BATCH)}>Load Smoke Batch (3)</Button>
            <Button variant="outline" size="sm" onClick={() => loadBatch(FULL_BATCH)}>Load Full Batch (10)</Button>
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