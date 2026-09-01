import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAuthError, shouldShowAuthError } from '../utils/authErrorHandler';
import AuthErrorBanner from '../utils/AuthErrorBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BottomSheetSelect from '@/components/ui/bottom-sheet-select';
import { X, Image as ImageIcon, Mic, Trash2, Plus, Sparkles, Brain, Lightbulb, Target, Loader2, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AiJournalSuggestions from './AiJournalSuggestions';
import AiDistortionAnalysis from './AiDistortionAnalysis';
import { safeInvokeLLM } from '../utils/safeInvokeLLM';
import { localizeJournalTemplate } from './journalTemplateCatalog';

const commonEmotions = [
  ['Anxious', 'anxious'], ['Sad', 'sad'], ['Angry', 'angry'], ['Frustrated', 'frustrated'],
  ['Overwhelmed', 'overwhelmed'], ['Guilty', 'guilty'], ['Ashamed', 'ashamed'], ['Hopeless', 'hopeless'],
  ['Worried', 'worried'], ['Fearful', 'fearful'], ['Irritated', 'irritated'], ['Lonely', 'lonely']
];

const cognitiveDistortions = [
  ['All-or-Nothing Thinking', 'all_or_nothing_thinking'],
  ['Overgeneralization', 'overgeneralization'],
  ['Mental Filter', 'mental_filter'],
  ['Catastrophizing', 'catastrophizing'],
  ['Mind Reading', 'mind_reading'],
  ['Fortune Telling', 'fortune_telling'],
  ['Emotional Reasoning', 'emotional_reasoning'],
  ['Should Statements', 'should_statements'],
  ['Labeling', 'labeling'],
  ['Personalization', 'personalization']
];

export default function ThoughtRecordForm({ entry, template, templates = [], onClose, initialSituation = '' }) {
  const { t } = useTranslation();
  const languageName = t('journal_ui.ai.language_name');
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(() => localizeJournalTemplate(
    template || (entry?.template_id ? (templates || []).find(item => item.id === entry.template_id) : null),
    t
  ));
  const [uploadError, setUploadError] = useState(null);
  const [formData, setFormData] = useState({
    entry_type: entry?.entry_type || template?.entry_type || 'cbt_standard',
    template_id: entry?.template_id || template?.id || null,
    template_name: entry?.template_name || localizeJournalTemplate(template, t)?.name || null,
    situation: entry?.situation || initialSituation || '',
    automatic_thoughts: entry?.automatic_thoughts || '',
    emotions: entry?.emotions || [],
    emotion_intensity: entry?.emotion_intensity || 5,
    cognitive_distortions: entry?.cognitive_distortions || [],
    evidence_for: entry?.evidence_for || '',
    evidence_against: entry?.evidence_against || '',
    balanced_thought: entry?.balanced_thought || '',
    outcome_emotion_intensity: entry?.outcome_emotion_intensity || 5,
    custom_fields: entry?.custom_fields || {},
    tags: entry?.tags || [],
    images: entry?.images || [],
    audio_notes: entry?.audio_notes || [],
    linked_goal_id: entry?.linked_goal_id || null
  });

  const [uploadingFile, setUploadingFile] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedEntry, setSavedEntry] = useState(null);
  const [showDistortionAnalysis, setShowDistortionAnalysis] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const isSavingRef = React.useRef(false);
  const abortControllerRef = React.useRef(null);
  const mountedRef = React.useRef(true);

  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000
  });
  const userEmail = userQuery.data?.email;
  const { data: goals } = useQuery({
    queryKey: ['activeGoals', userEmail],
    queryFn: () => base44.entities.Goal.filter({ created_by: userEmail, status: 'active' }),
    enabled: Boolean(userEmail),
    initialData: []
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => {
      // Validate ranges before saving
      const validatedData = {
        ...data,
        emotion_intensity: Math.max(1, Math.min(10, data.emotion_intensity || 5)),
        outcome_emotion_intensity: Math.max(1, Math.min(10, data.outcome_emotion_intensity || 5))
      };
      return entry 
        ? base44.entities.ThoughtJournal.update(entry.id, validatedData)
        : base44.entities.ThoughtJournal.create(validatedData);
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['thoughtJournals'] });

      // Snapshot previous values
      const previousJournals = queryClient.getQueryData(['thoughtJournals']);

      // Optimistically update
      const validatedData = {
        ...data,
        emotion_intensity: Math.max(1, Math.min(10, data.emotion_intensity || 5)),
        outcome_emotion_intensity: Math.max(1, Math.min(10, data.outcome_emotion_intensity || 5))
      };

      if (entry) {
        // Update existing entry
        queryClient.setQueryData(['thoughtJournals'], (old) => {
          if (!old) return old;
          return old.map(e => e.id === entry.id ? { ...e, ...validatedData } : e);
        });
      } else {
        // Add new entry
        const optimisticEntry = {
          id: 'temp-' + Date.now(),
          ...validatedData,
          created_date: new Date().toISOString()
        };
        queryClient.setQueryData(['thoughtJournals'], (old) => [optimisticEntry, ...(old || [])]);
        setSavedEntry(optimisticEntry);
        setStep(6);
      }

      return { previousJournals };
    },
    onSuccess: (data) => {
      if (!mountedRef.current) return;
      isSavingRef.current = false;
      
      // Update with real data
      setSavedEntry(data);
      setStep(6);
    },
    onError: (error, variables, context) => {
      if (!mountedRef.current) return;
      isSavingRef.current = false;
      
      // Rollback on error
      if (context?.previousJournals !== undefined) {
        queryClient.setQueryData(['thoughtJournals'], context.previousJournals);
      }
      setStep(5);
      
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      } else {
        setSaveError(t('journal_ui.form.save_error'));
      }
    },
    onSettled: () => {
      if (!mountedRef.current) return;
      queryClient.invalidateQueries({ queryKey: ['thoughtJournals'] });
    }
  });

  const analyzeEntry = async () => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this CBT journal entry and provide supportive, non-diagnostic insights.
Write every user-visible field only in ${languageName}. Do not mix languages and do not expose JSON keys.

Entry:

**Situation:** ${formData.situation}
**Automatic Thoughts:** ${formData.automatic_thoughts}
**Emotions:** ${formData.emotions.join(', ')}
**Intensity:** ${formData.emotion_intensity}/10
**Cognitive Distortions:** ${formData.cognitive_distortions.join(', ')}
**Evidence For:** ${formData.evidence_for}
**Evidence Against:** ${formData.evidence_against}
**Balanced Thought:** ${formData.balanced_thought}

Provide:
1. **Sentiment Analysis**: Overall emotional tone and patterns
2. **Suggested Tags**: 3-5 relevant tags based on themes (e.g., "work stress", "relationships", "self-worth")
3. **Recommended Exercises**: Suggest 2-3 specific CBT exercise categories that would help
4. **Key Insight**: One encouraging insight about their thought process`;

      const response = await safeInvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "object",
              properties: {
                overall_tone: { type: "string" },
                emotional_shift: { type: "string" },
                patterns_noticed: { type: "array", items: { type: "string" } }
              }
            },
            suggested_tags: {
              type: "array",
              items: { type: "string" }
            },
            recommended_exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            key_insight: { type: "string" }
          }
        }
      }, true);

      if (!mountedRef.current) return;
      if (!response?.sentiment || !response?.key_insight) throw new Error('Invalid journal analysis response');
      setAiAnalysis(response);
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Analysis failed:', error);
      if (!mountedRef.current) return;
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      }
    } finally {
      if (mountedRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleFileUpload = async (file, type) => {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(t('journal_ui.form.file_too_large'));
      return;
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
    
    if (type === 'image' && !validImageTypes.includes(file.type)) {
      setUploadError(t('journal_ui.form.invalid_image'));
      return;
    }
    
    if (type === 'audio' && !validAudioTypes.includes(file.type)) {
      setUploadError(t('journal_ui.form.invalid_audio'));
      return;
    }

    setUploadingFile(true);
    setUploadError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === 'image') {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), file_url]
        }));
      } else if (type === 'audio') {
        setFormData(prev => ({
          ...prev,
          audio_notes: [...(prev.audio_notes || []), file_url]
        }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(t('journal_ui.form.upload_error'));
    } finally {
      setUploadingFile(false);
    }
  };

  const removeFile = (index, type) => {
    if (type === 'image') {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else if (type === 'audio') {
      setFormData(prev => ({
        ...prev,
        audio_notes: prev.audio_notes.filter((_, i) => i !== index)
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Keep focus context stable and prevent the page behind the dialog from scrolling.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleEscape = (event) => {
      if (event.key === 'Escape' && mountedRef.current) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Invalidate queries when form closes
      queryClient.invalidateQueries({ queryKey: ['thoughtJournals'] });
    };
  }, [queryClient]);

  // Set inputmode="text" on ReactQuill contenteditable elements for mobile keyboard optimization.
  // Runs when `step` changes because each step may mount new ReactQuill editor instances.
  useEffect(() => {
    const contentEditables = document.querySelectorAll('.ql-editor[contenteditable="true"]');
    contentEditables.forEach(el => el.setAttribute('inputmode', 'text'));
  }, [step]);

  const toggleItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  return (
    <>
      {showAuthError && <AuthErrorBanner onDismiss={() => setShowAuthError(false)} />}
      <div
        className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-entry-form-title"
        aria-describedby="journal-entry-form-description"
      >
        <Card className="my-0 flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-b-none rounded-t-[28px] border-white/70 bg-white/96 shadow-2xl sm:my-8 sm:max-h-[calc(100dvh-4rem)] sm:rounded-[28px]">
          <CardHeader className="shrink-0 border-b border-teal-100 bg-teal-50/75 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle id="journal-entry-form-title" className="text-lg font-bold text-teal-950 sm:text-xl">
                  {selectedTemplate?.name || t('journal_ui.form.title')}
                </CardTitle>
                <p id="journal-entry-form-description" className="mt-1 text-sm font-medium text-slate-600">
                  {t('journal_ui.form.step', { step, total: 6 })}
                </p>
                {selectedTemplate?.description && (
                  <p className="mt-1 break-words text-sm text-slate-500" dir="auto">{selectedTemplate.description}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" className="min-h-11 min-w-11 rounded-full" onClick={onClose} aria-label={t('journal_ui.common.close_aria')}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Template Selection */}
              {!entry && !template && templates.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {t('journal_ui.form.choose_template')}
                  </label>
                  <BottomSheetSelect
                    value={selectedTemplate?.id || 'none'}
                    onValueChange={(value) => {
                      const tmpl = localizeJournalTemplate(templates.find(item => item.id === value), t);
                      setSelectedTemplate(tmpl || null);
                      if (tmpl) {
                        setFormData({
                          ...formData,
                          entry_type: tmpl.entry_type,
                          template_id: tmpl.id,
                          template_name: tmpl.name
                        });
                      }
                    }}
                    options={[
                      { value: 'none', label: t('journal_ui.form.standard_format') },
                      ...templates.map((tmpl) => {
                        const localizedTemplate = localizeJournalTemplate(tmpl, t);
                        return { value: tmpl.id, label: localizedTemplate.name };
                      })
                    ]}
                    placeholder={t('journal_ui.form.standard_format')}
                    title={t('journal_ui.form.choose_template')}
                  />
                </div>
              )}

              <div key="situation-editor">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('journal_ui.form.situation_label')}
                </label>
                <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
                  <ReactQuill
                    value={formData.situation || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, situation: value }))}
                    placeholder={t('journal_ui.form.situation_placeholder')}
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['clean']
                      ]
                    }}
                    className="h-32"
                    theme="snow"
                  />
                </div>
              </div>

              <div key="thoughts-editor">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('journal_ui.form.thoughts_label')}
                </label>
                <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
                  <ReactQuill
                    value={formData.automatic_thoughts || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, automatic_thoughts: value }))}
                    placeholder={t('journal_ui.form.thoughts_placeholder')}
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['clean']
                      ]
                    }}
                    className="h-32"
                    theme="snow"
                  />
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={
                  !formData.situation?.trim() || 
                  !formData.automatic_thoughts?.trim() ||
                  formData.situation === '<p><br></p>' ||
                  formData.automatic_thoughts === '<p><br></p>'
                }
                className="w-full py-6 rounded-xl"
              >
                {t('journal_ui.common.continue')}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  {t('journal_ui.form.emotions_label')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonEmotions.map(([emotion, emotionKey]) => (
                    <button
                      type="button"
                      key={emotion}
                      aria-pressed={formData.emotions.includes(emotion)}
                      className={cn('min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2',
                        formData.emotions.includes(emotion) ? 'border-teal-700 bg-teal-700 text-white' : 'border-teal-200 bg-white text-teal-950 hover:bg-teal-50')}
                      onClick={() => toggleItem('emotions', emotion)}
                    >
                      {t(`journal_ui.taxonomy.emotions.${emotionKey}`)}
                    </button>
                  ))}

                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('journal_ui.form.intensity_label')}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.emotion_intensity}
                    onChange={(e) => setFormData({ ...formData, emotion_intensity: parseInt(e.target.value) || 5 })}
                    className="flex-1"
                    aria-label={t('journal_ui.form.intensity_aria')}
                    aria-valuetext={t('journal_ui.form.intensity_value', { value: formData.emotion_intensity })}
                  />
                  <span className="text-2xl font-bold text-primary w-12 text-center">
                    {formData.emotion_intensity}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  {t('journal_ui.common.back')}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1"
                >
                  {t('journal_ui.common.continue')}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* AI Distortion Analysis */}
              {formData.situation && formData.automatic_thoughts && !showDistortionAnalysis && (
                <div className="bg-secondary/40 p-4 rounded-[var(--radius-control)] border border-border/70">
                  <div className="text-center">
                    <Brain className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-foreground mb-1">{t('journal_ui.form.distortion_title')}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('journal_ui.form.distortion_description')}
                    </p>
                    <Button
                      onClick={() => setShowDistortionAnalysis(true)}
                      variant="outline"
                      className="border-amber-300 hover:bg-amber-100"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('journal_ui.form.analyze_thoughts')}
                    </Button>
                  </div>
                </div>
              )}

              {showDistortionAnalysis && (
                <AiDistortionAnalysis 
                  entry={formData}
                  onApplyDistortions={(distortions, reframe) => {
                    setFormData(prev => ({
                      ...prev,
                      cognitive_distortions: distortions,
                      balanced_thought: reframe || prev.balanced_thought
                    }));
                    setShowDistortionAnalysis(false);
                  }}
                />
              )}

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  {t('journal_ui.form.patterns_optional')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {cognitiveDistortions.map(([distortion, distortionKey]) => (
                    <button
                      type="button"
                      key={distortion}
                      aria-pressed={formData.cognitive_distortions.includes(distortion)}
                      className={cn(
                        'min-h-11 rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2',
                        formData.cognitive_distortions.includes(distortion)
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-teal-200 bg-white text-teal-950 hover:bg-teal-50'
                      )}
                      onClick={() => toggleItem('cognitive_distortions', distortion)}
                    >
                      {t(`journal_ui.taxonomy.distortions.${distortionKey}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('journal_ui.form.evidence_for')}
                </label>
                <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
                  <ReactQuill
                    value={formData.evidence_for || ''}
                    onChange={(value) => setFormData({ ...formData, evidence_for: value })}
                    placeholder={t('journal_ui.form.evidence_for_placeholder')}
                    modules={{
                      toolbar: [
                        ['bold', 'italic'],
                        [{ list: 'bullet' }],
                        ['clean']
                      ]
                    }}
                    className="h-24"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('journal_ui.form.evidence_against')}
                </label>
                <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
                  <ReactQuill
                    value={formData.evidence_against || ''}
                    onChange={(value) => setFormData({ ...formData, evidence_against: value })}
                    placeholder={t('journal_ui.form.evidence_against_placeholder')}
                    modules={{
                      toolbar: [
                        ['bold', 'italic'],
                        [{ list: 'bullet' }],
                        ['clean']
                      ]
                    }}
                    className="h-24"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  {t('journal_ui.common.back')}
                </Button>
                <Button onClick={() => setStep(4)} className="min-h-11 flex-1 bg-primary hover:bg-primary/90">
                  {t('journal_ui.common.continue')}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('journal_ui.form.balanced_label')}
                </label>
                <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
                  <ReactQuill
                    value={formData.balanced_thought || ''}
                    onChange={(value) => setFormData({ ...formData, balanced_thought: value })}
                    placeholder={t('journal_ui.form.balanced_placeholder')}
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['clean']
                      ]
                    }}
                    className="h-32"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('journal_ui.form.outcome_intensity')}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.outcome_emotion_intensity}
                    onChange={(e) => setFormData({ ...formData, outcome_emotion_intensity: parseInt(e.target.value) || 5 })}
                    className="flex-1"
                    aria-label={t('journal_ui.form.outcome_intensity')}
                    aria-valuetext={t('journal_ui.form.intensity_value', { value: formData.outcome_emotion_intensity })}
                  />
                  <span className="text-2xl font-bold text-primary w-12 text-center">
                    {formData.outcome_emotion_intensity}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                  {t('journal_ui.common.back')}
                </Button>
                <Button
                  onClick={() => setStep(5)}
                  className="min-h-11 flex-1"
                >
                  {t('journal_ui.common.continue')}
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              {/* AI Analysis Section */}
              {!aiAnalysis && !isAnalyzing && (
                <div className="bg-secondary/40 p-6 rounded-[var(--radius-card)] border border-border/70">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/12 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{t('journal_ui.form.ai_title')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('journal_ui.form.ai_description')}
                    </p>
                    <Button
                      onClick={analyzeEntry}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('journal_ui.form.analyze_entry')}
                    </Button>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="bg-card p-8 rounded-[var(--radius-card)] border border-border/70 text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t('journal_ui.form.analyzing')}</p>
                </div>
              )}

              {aiAnalysis && (
                <div className="space-y-4">
                  {/* Sentiment Analysis */}
                  <div className="bg-secondary/40 p-4 rounded-[var(--radius-control)] border border-border/70">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-600" />
                      {t('journal_ui.form.sentiment')}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground/85">
                        <span className="font-medium">{t('journal_ui.form.overall_tone')}:</span> {aiAnalysis.sentiment.overall_tone}
                      </p>
                      <p className="text-foreground/85">
                        <span className="font-medium">{t('journal_ui.form.emotional_shift')}:</span> {aiAnalysis.sentiment.emotional_shift}
                      </p>
                      {aiAnalysis.sentiment.patterns_noticed?.length > 0 && (
                        <div>
                          <p className="font-medium text-foreground/85 mb-1">{t('journal_ui.form.patterns')}:</p>
                          <ul className="space-y-1">
                            {aiAnalysis.sentiment.patterns_noticed.map((pattern, i) => (
                              <li key={i} className="text-muted-foreground text-xs flex items-start gap-1">
                                <span className="text-blue-600 mt-0.5">•</span>
                                {pattern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Key Insight */}
                  <div className="bg-secondary/40 p-4 rounded-[var(--radius-control)] border border-border/70">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-accent" />
                      {t('journal_ui.form.key_insight')}
                    </h4>
                    <p className="text-sm text-muted-foreground">{aiAnalysis.key_insight}</p>
                  </div>

                  {/* Recommended Exercises */}
                  {aiAnalysis.recommended_exercises?.length > 0 && (
                    <div className="bg-secondary/40 p-4 rounded-[var(--radius-control)] border border-border/70">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-600" />
                        {t('journal_ui.form.recommended_practices')}
                      </h4>
                      <div className="space-y-2">
                        {aiAnalysis.recommended_exercises.map((rec, i) => (
                          <div key={i} className="surface-nested p-3 rounded-lg">
                            <p className="font-medium text-foreground text-sm capitalize">{rec.category}</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Link to Goal */}
              {goals.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    {t('journal_ui.form.link_goal')}
                  </label>
                  <BottomSheetSelect
                    value={formData.linked_goal_id || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, linked_goal_id: value === 'none' ? null : value })}
                    options={[
                      { value: 'none', label: t('journal_ui.form.no_goal') },
                      ...goals.map((goal) => ({ value: goal.id, label: goal.title }))
                    ]}
                    placeholder={t('journal_ui.form.no_goal')}
                    title={t('journal_ui.form.link_goal')}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('journal_ui.form.goal_help')}
                  </p>
                </div>
              )}

              {/* Tags Section */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('journal_ui.form.tags')} {aiAnalysis && <span className="text-primary">({t('journal_ui.form.tags_ai')})</span>}
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-primary/12 text-primary pr-1 pl-3 py-1 flex items-center gap-1 border border-primary/12"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-primary/10 rounded-full p-1"
                        aria-label={t('journal_ui.form.remove_tag_aria', { tag })}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder={t('journal_ui.form.tag_placeholder')}
                    className="rounded-xl"
                    inputMode="text"
                  />
                  <Button onClick={addTag} variant="outline" size="icon" className="min-h-11 min-w-11" aria-label={t('journal_ui.form.add_tag_aria')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Media Attachments */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('journal_ui.form.attachments')}
                </label>
                {uploadError && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    {uploadError}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('image-upload').click()}
                    disabled={uploadingFile}
                    className="flex-1"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {t('journal_ui.form.add_image')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('audio-upload').click()}
                    disabled={uploadingFile}
                    className="flex-1"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {t('journal_ui.form.add_audio')}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'image')}
                  />
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'audio')}
                  />
                </div>

                {/* Display attached files */}
                {formData.images?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">{t('journal_ui.form.images')}:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt={`${t('journal_ui.form.images')} ${i + 1}`} className="w-full h-20 object-cover rounded-lg" />
                          <button
                            onClick={() => removeFile(i, 'image')}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={t('journal_ui.common.delete_aria', { item: `${t('journal_ui.form.images')} ${i + 1}` })}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-3">
                  {saveError}
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={() => setStep(4)} variant="outline" className="flex-1">
                  {t('journal_ui.common.back')}
                </Button>
                <Button
                  onClick={() => {
                    if (isSavingRef.current || saveMutation.isPending) return;
                    isSavingRef.current = true;
                    setSaveError(null);
                    
                    // Use a snapshot of formData at click time
                    const dataToSave = { ...formData };
                    saveMutation.mutate(dataToSave);
                  }}
                  disabled={isSavingRef.current || saveMutation.isPending}
                  className="flex-1 shadow-[var(--shadow-md)]"
                >
                  {saveMutation.isPending ? t('journal_ui.common.saving') : t('journal_ui.form.save_entry')}
                </Button>
              </div>
            </div>
          )}

          {step === 6 && savedEntry && savedEntry.id && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-[var(--shadow-md)]">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('journal_ui.form.saved_title')}</h3>
                <p className="text-sm text-muted-foreground">{t('journal_ui.form.saved_description')}</p>
              </div>

              <AiJournalSuggestions 
                key={savedEntry.id}
                entry={savedEntry}
                onClose={onClose}
              />
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}