import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, BookOpen, Sparkles, Heart, Brain, FileText, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const templateIcons = {
  cbt_standard: Brain,
  gratitude: Heart,
  anxiety_log: Sparkles,
  mood_journal: Heart,
  custom: FileText
};

export default function TemplateManager({ templates, onClose, onSelectTemplate }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const queryClient = useQueryClient();

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.JournalTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['journalTemplates']);
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl border-0 shadow-2xl my-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Journal Templates</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Create custom templates for different types of journaling
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!showCreateForm && !editingTemplate ? (
            <div className="space-y-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Template
              </Button>

              {/* Default Templates */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Default Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TemplateCard
                    template={{
                      name: 'CBT Standard',
                      description: 'Standard cognitive behavioral therapy thought record',
                      entry_type: 'cbt_standard',
                      is_default: true
                    }}
                    onSelect={onSelectTemplate}
                  />
                  <TemplateCard
                    template={{
                      name: 'Gratitude Journal',
                      description: 'Focus on positive moments and gratitude',
                      entry_type: 'gratitude',
                      is_default: true
                    }}
                    onSelect={onSelectTemplate}
                  />
                  <TemplateCard
                    template={{
                      name: 'Anxiety Log',
                      description: 'Track anxiety triggers and coping strategies',
                      entry_type: 'anxiety_log',
                      is_default: true
                    }}
                    onSelect={onSelectTemplate}
                  />
                  <TemplateCard
                    template={{
                      name: 'Mood Journal',
                      description: 'Simple daily mood and thoughts tracker',
                      entry_type: 'mood_journal',
                      is_default: true
                    }}
                    onSelect={onSelectTemplate}
                  />
                </div>
              </div>

              {/* Custom Templates */}
              {templates.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Custom Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={onSelectTemplate}
                        onEdit={() => setEditingTemplate(template)}
                        onDelete={() => deleteTemplateMutation.mutate(template.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <TemplateForm
              template={editingTemplate}
              onClose={() => {
                setShowCreateForm(false);
                setEditingTemplate(null);
              }}
              onSuccess={() => {
                queryClient.invalidateQueries(['journalTemplates']);
                setShowCreateForm(false);
                setEditingTemplate(null);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TemplateCard({ template, onSelect, onEdit, onDelete }) {
  const Icon = templateIcons[template.entry_type] || FileText;

  return (
    <Card className="border-2 hover:border-purple-300 transition-colors cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this template?')) onDelete();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">{template.name}</h3>
        <p className="text-xs text-gray-600 mb-3">{template.description}</p>
        <Button
          onClick={() => onSelect(template)}
          size="sm"
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
}

function TemplateForm({ template, onClose, onSuccess }) {
  const [formData, setFormData] = useState(
    template || {
      name: '',
      description: '',
      entry_type: 'custom',
      fields: []
    }
  );

  const saveMutation = useMutation({
    mutationFn: (data) =>
      template
        ? base44.entities.JournalTemplate.update(template.id, data)
        : base44.entities.JournalTemplate.create(data),
    onSuccess
  });

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Template Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Daily Reflection"
          className="rounded-xl"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What is this template for?"
          className="h-20 rounded-xl"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={onClose} variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={() => saveMutation.mutate(formData)}
          disabled={!formData.name || saveMutation.isPending}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          {saveMutation.isPending ? 'Saving...' : template ? 'Update' : 'Create'} Template
        </Button>
      </div>
    </div>
  );
}