import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Image as ImageIcon, Mic, Upload, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function ThoughtRecordForm({ entry, template, templates, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(template || (entry?.template_id ? templates.find(t => t.id === entry.template_id) : null));
  const [formData, setFormData] = useState(entry || {
    entry_type: template?.entry_type || 'cbt_standard',
    template_id: template?.id || null,
    template_name: template?.name || null,
    situation: '',
    automatic_thoughts: '',
    emotions: [],
    emotion_intensity: 5,
    cognitive_distortions: [],
    evidence_for: '',
    evidence_against: '',
    balanced_thought: '',
    outcome_emotion_intensity: 5,
    custom_fields: {},
    tags: [],
    images: [],
    audio_notes: []
  });

  const [uploadingFile, setUploadingFile] = useState(false);
  const [newTag, setNewTag] = useState('');

  const saveMutation = useMutation({
    mutationFn: (data) => 
      entry 
        ? base44.entities.ThoughtJournal.update(entry.id, data)
        : base44.entities.ThoughtJournal.create(data),
    onSuccess: () => onClose()
  });

  const handleFileUpload = async (file, type) => {
    setUploadingFile(true);
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

  const toggleItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-0 shadow-2xl my-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {selectedTemplate ? selectedTemplate.name : 'Journal Entry'} - Step {step} of 5
              </CardTitle>
              {selectedTemplate && (
                <p className="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
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

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What happened? (The Situation)
                </label>
                <Textarea
                  value={formData.situation}
                  onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                  placeholder="Describe the situation that triggered these thoughts..."
                  className="h-32 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  What went through your mind? (Automatic Thoughts)
                </label>
                <Textarea
                  value={formData.automatic_thoughts}
                  onChange={(e) => setFormData({ ...formData, automatic_thoughts: e.target.value })}
                  placeholder="What thoughts automatically came up? Write them exactly as they appeared..."
                  className="h-32 rounded-xl"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!formData.situation || !formData.automatic_thoughts}
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
                    onChange={(e) => setFormData({ ...formData, emotion_intensity: parseInt(e.target.value) })}
                    className="flex-1"
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
                  disabled={formData.emotions.length === 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
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
                <Textarea
                  value={formData.evidence_for}
                  onChange={(e) => setFormData({ ...formData, evidence_for: e.target.value })}
                  placeholder="What facts support this thought?"
                  className="h-24 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Evidence AGAINST the thought
                </label>
                <Textarea
                  value={formData.evidence_against}
                  onChange={(e) => setFormData({ ...formData, evidence_against: e.target.value })}
                  placeholder="What facts contradict this thought?"
                  className="h-24 rounded-xl"
                />
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
                <Textarea
                  value={formData.balanced_thought}
                  onChange={(e) => setFormData({ ...formData, balanced_thought: e.target.value })}
                  placeholder="Based on the evidence, what's a more balanced way to view this situation?"
                  className="h-32 rounded-xl"
                />
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
                    onChange={(e) => setFormData({ ...formData, outcome_emotion_intensity: parseInt(e.target.value) })}
                    className="flex-1"
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
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}