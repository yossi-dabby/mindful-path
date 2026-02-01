import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAuthError, shouldShowAuthError } from '../utils/authErrorHandler';
import AuthErrorBanner from '../utils/AuthErrorBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Image as ImageIcon, Mic, Upload, Trash2, Plus, Sparkles, Brain, Lightbulb, Target, Loader2, Bold, Italic, List, ListOrdered, Heading, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AiJournalSuggestions from './AiJournalSuggestions';
import AiDistortionAnalysis from './AiDistortionAnalysis';

const commonEmotions = [
  'Anxious', 'Sad', 'Angry', 'Frustrated', 'Overwhelmed', 'Guilty', 
  'Ashamed', 'Hopeless', 'Worried', 'Fearful', 'Irritated', 'Lonely'
];

const cognitiveDistortions = [
  'All-or-Nothing Thinking',
  'Overgeneralization',
  'Mental Filter',
  'Catastrophizing',
  'Mind Reading',
  'Fortune Telling',
  'Emotional Reasoning',
  'Should Statements',
  'Labeling',
  'Personalization'
];

export default function ThoughtRecordForm({ entry, template, templates = [], onClose, initialSituation = '' }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(template || (entry?.template_id ? (templates || []).find(t => t.id === entry.template_id) : null));
  const [uploadError, setUploadError] = useState(null);
  const [formData, setFormData] = useState({
    entry_type: entry?.entry_type || template?.entry_type || 'cbt_standard',
    template_id: entry?.template_id || template?.id || null,
    template_name: entry?.template_name || template?.name || null,
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedEntry, setSavedEntry] = useState(null);
  const [showDistortionAnalysis, setShowDistortionAnalysis] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const isSavingRef = React.useRef(false);
  const abortControllerRef = React.useRef(null);
  const mountedRef = React.useRef(true);

  const { data: goals } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }),
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
    onSuccess: (data) => {
      if (!mountedRef.current) return;
      isSavingRef.current = false;
      
      // Batch state updates to avoid multiple re-renders
      Promise.resolve().then(() => {
        if (!mountedRef.current) return;
        queryClient.invalidateQueries(['thoughtJournals']);
        setSavedEntry(data);
        setShowSuggestions(true);
        setStep(6);
      });
    },
    onError: (error) => {
      if (!mountedRef.current) return;
      isSavingRef.current = false;
      if (isAuthError(error) && shouldShowAuthError()) {
        setShowAuthError(true);
      } else {
        setSaveError('Couldn\'t save. Check connection and try again.');
      }
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
      const prompt = `Analyze this CBT journal entry and provide insights:

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

      const response = await base44.integrations.Core.InvokeLLM({
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
      });

      if (!mountedRef.current) return;
      
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
      setUploadError(`File too large. Maximum size is 5MB.`);
      return;
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
    
    if (type === 'image' && !validImageTypes.includes(file.type)) {
      setUploadError('Invalid image format. Use JPG, PNG, GIF, or WebP.');
      return;
    }
    
    if (type === 'audio' && !validAudioTypes.includes(file.type)) {
      setUploadError('Invalid audio format. Use MP3, WAV, OGG, or WebM.');
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
      setUploadError('Upload failed. Please try again.');
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

  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mountedRef.current) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-24 overflow-y-auto">
        <Card className="w-full max-w-2xl border-0 shadow-2xl my-8" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {selectedTemplate ? selectedTemplate.name : 'Journal Entry'} - Step {step} of 6
              </CardTitle>
              {selectedTemplate && (
                <p className="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close journal form">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
          {step === 1 && (
            <div className="space-y-6">
              {/* Template Selection */}
              {!entry && !template && templates.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Choose a Template (Optional)
                  </label>
                  <Select
                    value={selectedTemplate?.id || 'none'}
                    onValueChange={(value) => {
                      const tmpl = templates.find(t => t.id === value);
                      setSelectedTemplate(tmpl);
                      if (tmpl) {
                        setFormData({
                          ...formData,
                          entry_type: tmpl.entry_type,
                          template_id: tmpl.id,
                          template_name: tmpl.name
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Standard CBT Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Standard CBT Format</SelectItem>
                      {templates.map((tmpl) => (
                        <SelectItem key={tmpl.id} value={tmpl.id}>
                          {tmpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div key="situation-editor">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What happened? (The Situation)
                </label>
                <div className="border rounded-xl overflow-hidden">
                  <ReactQuill
                    value={formData.situation || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, situation: value }))}
                    placeholder="Describe the situation that triggered these thoughts..."
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What went through your mind? (Automatic Thoughts)
                </label>
                <div className="border rounded-xl overflow-hidden">
                  <ReactQuill
                    value={formData.automatic_thoughts || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, automatic_thoughts: value }))}
                    placeholder="What thoughts automatically came up? Write them exactly as they appeared..."
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
                className="w-full bg-purple-600 hover:bg-purple-700 py-6 rounded-xl"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  What emotions did you feel?
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonEmotions.map((emotion) => (
                    <Badge
                      key={emotion}
                      variant={formData.emotions.includes(emotion) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer px-4 py-2',
                        formData.emotions.includes(emotion)
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'hover:bg-gray-100'
                      )}
                      onClick={() => toggleItem('emotions', emotion)}
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  How intense? (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.emotion_intensity}
                    onChange={(e) => setFormData({ ...formData, emotion_intensity: parseInt(e.target.value) || 5 })}
                    className="flex-1"
                    aria-label="Emotion intensity"
                    aria-valuetext={`Intensity ${formData.emotion_intensity} out of 10`}
                  />
                  <span className="text-2xl font-bold text-purple-600 w-12 text-center">
                    {formData.emotion_intensity}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* AI Distortion Analysis */}
              {formData.situation && formData.automatic_thoughts && !showDistortionAnalysis && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
                  <div className="text-center">
                    <Brain className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-800 mb-1">AI Distortion Detection</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Let AI identify cognitive distortions in your thoughts
                    </p>
                    <Button
                      onClick={() => setShowDistortionAnalysis(true)}
                      variant="outline"
                      className="border-amber-300 hover:bg-amber-100"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Thoughts
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
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Identify thinking patterns (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {cognitiveDistortions.map((distortion) => (
                    <Badge
                      key={distortion}
                      variant={formData.cognitive_distortions.includes(distortion) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer px-3 py-2 text-xs',
                        formData.cognitive_distortions.includes(distortion)
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'hover:bg-gray-100'
                      )}
                      onClick={() => toggleItem('cognitive_distortions', distortion)}
                    >
                      {distortion}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Evidence FOR the thought
                </label>
                <div className="border rounded-xl overflow-hidden">
                  <ReactQuill
                    value={formData.evidence_for || ''}
                    onChange={(value) => setFormData({ ...formData, evidence_for: value })}
                    placeholder="What facts support this thought?"
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Evidence AGAINST the thought
                </label>
                <div className="border rounded-xl overflow-hidden">
                  <ReactQuill
                    value={formData.evidence_against || ''}
                    onChange={(value) => setFormData({ ...formData, evidence_against: value })}
                    placeholder="What facts contradict this thought?"
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
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Balanced, realistic thought
                </label>
                <div className="border rounded-xl overflow-hidden">
                  <ReactQuill
                    value={formData.balanced_thought || ''}
                    onChange={(value) => setFormData({ ...formData, balanced_thought: value })}
                    placeholder="Based on the evidence, what's a more balanced way to view this situation?"
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
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  How intense are the emotions now? (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.outcome_emotion_intensity}
                    onChange={(e) => setFormData({ ...formData, outcome_emotion_intensity: parseInt(e.target.value) || 5 })}
                    className="flex-1"
                    aria-label="Outcome emotion intensity"
                    aria-valuetext={`Intensity ${formData.outcome_emotion_intensity} out of 10`}
                  />
                  <span className="text-2xl font-bold text-purple-600 w-12 text-center">
                    {formData.outcome_emotion_intensity}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(5)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              {/* AI Analysis Section */}
              {!aiAnalysis && !isAnalyzing && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Get AI Insights</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Analyze your entry for sentiment, themes, and get personalized exercise recommendations
                    </p>
                    <Button
                      onClick={analyzeEntry}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Entry
                    </Button>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="bg-white p-8 rounded-xl border text-center">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Analyzing your journal entry...</p>
                </div>
              )}

              {aiAnalysis && (
                <div className="space-y-4">
                  {/* Sentiment Analysis */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-600" />
                      Sentiment Analysis
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Overall Tone:</span> {aiAnalysis.sentiment.overall_tone}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Emotional Shift:</span> {aiAnalysis.sentiment.emotional_shift}
                      </p>
                      {aiAnalysis.sentiment.patterns_noticed?.length > 0 && (
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Patterns:</p>
                          <ul className="space-y-1">
                            {aiAnalysis.sentiment.patterns_noticed.map((pattern, i) => (
                              <li key={i} className="text-gray-600 text-xs flex items-start gap-1">
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
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Key Insight
                    </h4>
                    <p className="text-sm text-green-700">{aiAnalysis.key_insight}</p>
                  </div>

                  {/* Recommended Exercises */}
                  {aiAnalysis.recommended_exercises?.length > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-600" />
                        Recommended Practices
                      </h4>
                      <div className="space-y-2">
                        {aiAnalysis.recommended_exercises.map((rec, i) => (
                          <div key={i} className="bg-white/70 p-3 rounded-lg">
                            <p className="font-medium text-gray-800 text-sm capitalize">{rec.category}</p>
                            <p className="text-xs text-gray-600 mt-1">{rec.reason}</p>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Link to Goal (optional)
                  </label>
                  <Select
                    value={formData.linked_goal_id || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, linked_goal_id: value === 'none' ? null : value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="No goal linked" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No goal linked</SelectItem>
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Connect this entry to a goal for context and tracking
                  </p>
                </div>
              )}

              {/* Tags Section */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tags {aiAnalysis && <span className="text-purple-600">(AI-suggested tags applied)</span>}
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-purple-100 text-purple-700 pr-1 pl-3 py-1 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-purple-200 rounded-full p-0.5"
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
                    placeholder="Add a custom tag..."
                    className="rounded-xl"
                  />
                  <Button onClick={addTag} variant="outline" size="icon" aria-label="Add tag">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Media Attachments */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Attachments (Optional)
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
                    Add Image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('audio-upload').click()}
                    disabled={uploadingFile}
                    className="flex-1"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Add Audio
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
                    <p className="text-xs text-gray-600 mb-2">Images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                          <button
                            onClick={() => removeFile(i, 'image')}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove image ${i + 1}`}
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
                  Back
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
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </div>
          )}

          {step === 6 && showSuggestions && savedEntry && savedEntry.id && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Entry Saved!</h3>
                <p className="text-sm text-gray-600">Here are some AI-powered insights based on your entry</p>
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