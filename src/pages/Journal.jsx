import React, { useState, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, BookOpen, Search, Filter, Settings, Bell, Sparkles } from 'lucide-react';
import ThoughtRecordForm from '../components/journal/ThoughtRecordForm';
import ThoughtRecordCard from '../components/journal/ThoughtRecordCard';
import JournalFilters from '../components/journal/JournalFilters';
import TemplateManager from '../components/journal/TemplateManager';
import ReminderManager from '../components/journal/ReminderManager';
import AiJournalPrompts from '../components/journal/AiJournalPrompts';
import AiTrendsSummary from '../components/journal/AiTrendsSummary';

export default function Journal() {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showReminderManager, setShowReminderManager] = useState(false);
  const [showAiPrompts, setShowAiPrompts] = useState(false);
  const [showTrendsSummary, setShowTrendsSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [promptedSituation, setPromptedSituation] = useState('');
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['thoughtJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date'),
    initialData: []
  });

  const { data: templates } = useQuery({
    queryKey: ['journalTemplates'],
    queryFn: () => base44.entities.JournalTemplate.list(),
    initialData: []
  });

  // Get all unique tags from entries
  const allTags = useMemo(() => {
    return [...new Set(entries.flatMap(entry => entry.tags || []))];
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.situation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.automatic_thoughts?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.balanced_thought?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => entry.tags?.includes(tag));
    
    const matchesType = selectedType === 'all' || entry.entry_type === selectedType;
    
    return matchesSearch && matchesTags && matchesType;
    });
  }, [entries, searchQuery, selectedTags, selectedType]);

  const handleEdit = useCallback((entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowForm(false);
    setEditingEntry(null);
    setSelectedTemplate(null);
    setPromptedSituation('');
  }, []);

  const handleNewEntry = useCallback((template = null, initialSituation = '') => {
    setSelectedTemplate(template);
    setPromptedSituation(initialSituation);
    setShowForm(true);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto" style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            style={{ borderRadius: '50%' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light mb-1 md:mb-2" style={{ color: '#1A3A34' }}>Thought Journal</h1>
            <p className="text-sm md:text-base" style={{ color: '#5A7A72' }}>Challenge and reframe unhelpful thinking patterns</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setShowTrendsSummary(true)}
            variant="outline"
            className="text-sm md:text-base"
            size="sm"
            style={{ borderRadius: '24px' }}
          >
            <Sparkles className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">AI Insights</span>
          </Button>
          <Button
            onClick={() => setShowAiPrompts(true)}
            variant="outline"
            className="text-sm md:text-base"
            size="sm"
            style={{ borderRadius: '24px' }}
          >
            <Sparkles className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">AI Prompts</span>
          </Button>
          <Button
            onClick={() => setShowReminderManager(true)}
            variant="outline"
            className="hidden md:flex"
            size="sm"
            style={{ borderRadius: '24px' }}
          >
            <Bell className="w-4 h-4 mr-2" />
            Reminders
          </Button>
          <Button
            onClick={() => setShowTemplateManager(true)}
            variant="outline"
            className="hidden md:flex"
            size="sm"
            style={{ borderRadius: '24px' }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            onClick={() => handleNewEntry()}
            className="text-white text-sm md:text-base"
            size="sm"
            style={{
              borderRadius: '24px',
              backgroundColor: '#26A69A',
              boxShadow: '0 6px 20px rgba(38, 166, 154, 0.3)'
            }}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="pl-10"
              style={{ borderRadius: '28px' }}
            />
          </div>
        </div>
        
        <JournalFilters
          allTags={allTags}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />
      </div>

      {/* AI Insights Panel - Only show if user has entries */}
      {!showForm && entries.length > 0 && (
        <JournalInsightsPanel entriesCount={entries.length} />
      )}

      {/* Entries List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <Card className="border-0" style={{
          borderRadius: '32px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          boxShadow: '0 12px 40px rgba(38, 166, 154, 0.12), 0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4" style={{
              borderRadius: '50%',
              background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)'
            }}>
              <BookOpen className="w-10 h-10" style={{ color: '#26A69A' }} />
            </div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#1A3A34' }}>Start Your First Entry</h2>
            <p className="mb-6 max-w-md mx-auto" style={{ color: '#5A7A72' }}>
              Thought records help you identify and challenge cognitive distortions, leading to more balanced thinking.
            </p>
            <div className="flex flex-col gap-3 items-center max-w-md mx-auto">
              <Button
                onClick={() => handleNewEntry()}
                className="text-white px-8 py-6 text-lg w-full"
                style={{
                  borderRadius: '32px',
                  backgroundColor: '#26A69A',
                  boxShadow: '0 8px 24px rgba(38, 166, 154, 0.35)'
                }}
              >
                Create Entry
              </Button>
              <Button
                onClick={() => setShowTemplateManager(true)}
                variant="outline"
                className="px-8 py-6 text-lg w-full"
                style={{ borderRadius: '32px' }}
              >
                Browse Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {filteredEntries.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center">
                <p className="text-gray-600">No entries match your filters</p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags([]);
                    setSelectedType('all');
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <ThoughtRecordCard key={entry.id} entry={entry} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <ThoughtRecordForm
          entry={editingEntry}
          template={selectedTemplate}
          templates={templates}
          onClose={handleClose}
          initialSituation={promptedSituation}
        />
      )}

      {/* Template Manager */}
      {showTemplateManager && (
        <TemplateManager
          templates={templates}
          onClose={() => setShowTemplateManager(false)}
          onSelectTemplate={(template) => {
            setShowTemplateManager(false);
            handleNewEntry(template);
          }}
        />
      )}

      {/* Reminder Manager */}
      {showReminderManager && (
        <ReminderManager
          onClose={() => setShowReminderManager(false)}
        />
      )}

      {/* AI Prompts */}
      {showAiPrompts && (
        <AiJournalPrompts
          onSelectPrompt={(prompt) => {
            setShowAiPrompts(false);
            handleNewEntry(null, prompt);
          }}
          onClose={() => setShowAiPrompts(false)}
        />
      )}

      {/* AI Trends Summary */}
      {showTrendsSummary && (
        <AiTrendsSummary
          onClose={() => setShowTrendsSummary(false)}
        />
      )}
    </div>
  );
}