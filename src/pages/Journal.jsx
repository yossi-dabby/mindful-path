import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, BookOpen, Search, Filter, Settings, Bell } from 'lucide-react';
import ThoughtRecordForm from '../components/journal/ThoughtRecordForm';
import ThoughtRecordCard from '../components/journal/ThoughtRecordCard';
import JournalFilters from '../components/journal/JournalFilters';
import TemplateManager from '../components/journal/TemplateManager';
import ReminderManager from '../components/journal/ReminderManager';

export default function Journal() {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showReminderManager, setShowReminderManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
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
  const allTags = [...new Set(entries.flatMap(entry => entry.tags || []))];

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.situation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.automatic_thoughts?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.balanced_thought?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => entry.tags?.includes(tag));
    
    const matchesType = selectedType === 'all' || entry.entry_type === selectedType;
    
    return matchesSearch && matchesTags && matchesType;
  });

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingEntry(null);
    setSelectedTemplate(null);
  };

  const handleNewEntry = (template = null) => {
    setSelectedTemplate(template);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">Thought Journal</h1>
          <p className="text-gray-500">Challenge and reframe unhelpful thinking patterns</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowReminderManager(true)}
            variant="outline"
            className="rounded-xl"
          >
            <Bell className="w-4 h-4 mr-2" />
            Reminders
          </Button>
          <Button
            onClick={() => setShowTemplateManager(true)}
            variant="outline"
            className="rounded-xl"
          >
            <Settings className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            onClick={() => handleNewEntry()}
            className="bg-purple-600 hover:bg-purple-700 rounded-xl px-6"
          >
            <Plus className="w-5 h-5 mr-2" />
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
              className="pl-10 rounded-xl"
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

      {/* Entries List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Start Your First Entry</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Thought records help you identify and challenge cognitive distortions, leading to more balanced thinking.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => handleNewEntry()}
                className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg rounded-xl"
              >
                Create Entry
              </Button>
              <Button
                onClick={() => setShowTemplateManager(true)}
                variant="outline"
                className="px-8 py-6 text-lg rounded-xl"
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
    </div>
  );
}