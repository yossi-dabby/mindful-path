import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, BookOpen, Search, Settings, Bell, Sparkles, BarChart2 } from 'lucide-react';
import { createPageUrl } from '../utils';
import ThoughtRecordForm from '../components/journal/ThoughtRecordForm';
import ThoughtRecordCard from '../components/journal/ThoughtRecordCard';
import SessionSummaryCard from '../components/journal/SessionSummaryCard';
import JournalFilters from '../components/journal/JournalFilters';
import TemplateManager from '../components/journal/TemplateManager';
import ReminderManager from '../components/journal/ReminderManager';
import AiJournalPrompts from '../components/journal/AiJournalPrompts';
import AiTrendsSummary from '../components/journal/AiTrendsSummary';
import PullToRefresh from '../components/utils/PullToRefresh';

export default function Journal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const [focusedEntryId, setFocusedEntryId] = useState(null);
  const [focusedSummaryId, setFocusedSummaryId] = useState(null);
  const queryClient = useQueryClient();

  // Check URL for entry or summary parameters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const entryId = urlParams.get('entry');
    const summaryId = urlParams.get('summary');
    if (entryId) {
      setFocusedEntryId(entryId);
    } else if (summaryId) {
      setFocusedSummaryId(summaryId);
    }
  }, []);

  const { data: thoughtJournals, isLoading: isLoadingJournals } = useQuery({
    queryKey: ['thoughtJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 30),
    initialData: [],
    refetchOnWindowFocus: false
  });

  const { data: sessionSummaries, isLoading: isLoadingSummaries } = useQuery({
    queryKey: ['sessionSummaries'],
    queryFn: () => base44.entities.SessionSummary.list('-session_date'),
    initialData: [],
    refetchOnWindowFocus: false
  });

  const entries = [...(Array.isArray(thoughtJournals) ? thoughtJournals : []), ...(Array.isArray(sessionSummaries) ? sessionSummaries : []).map((s) => ({
    ...s,
    entry_type: 'session_summary',
    situation: `Session Summary: ${new Date(s.session_date).toLocaleDateString()}`,
    isSummary: true
  }))];

  const { data: templates } = useQuery({
    queryKey: ['journalTemplates'],
    queryFn: () => base44.entities.JournalTemplate.list(),
    initialData: []
  });

  // Get all unique tags from entries
  const allTags = useMemo(() => {
    return [...new Set(entries.flatMap((entry) => entry.tags || []))];
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // If there's a focused entry ID, only show that entry
      if (focusedEntryId) {
        return entry.id === focusedEntryId && !entry.isSummary;
      } else if (focusedSummaryId) {
        return entry.id === focusedSummaryId && entry.isSummary;
      }

      const matchesSearch = !searchQuery ||
      entry.situation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.automatic_thoughts?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.balanced_thought?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.summary_content?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags = selectedTags.length === 0 ||
      selectedTags.some((tag) => entry.tags?.includes(tag));

      const matchesType = selectedType === 'all' || entry.entry_type === selectedType || selectedType === 'session_summary' && entry.isSummary;

      return matchesSearch && matchesTags && matchesType;
    });
  }, [entries, searchQuery, selectedTags, selectedType, focusedEntryId, focusedSummaryId]);

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
    <PullToRefresh queryKeys={['thoughtJournals', 'sessionSummaries', 'journalTemplates']}>
      <div className="bg-teal-50 mx-auto pb-32 p-4 md:p-8 md:pb-24 max-w-5xl w-full min-h-[100dvh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4">
        <div className="flex items-center gap-3">
          <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              style={{ borderRadius: '50%' }}
              aria-label={t('journal.go_back_aria')}>

            <svg className="rtl:scale-x-[-1]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </Button>
          <div>
            <h1 className="text-teal-600 mb-1 text-2xl font-semibold md:text-3xl lg:text-4xl md:mb-2">
              {focusedEntryId ? t('journal.title_entry') : focusedSummaryId ? t('journal.title_summary') : t('journal.title_default')}
            </h1>
            <p className="text-teal-600 text-sm font-medium md:text-base">
              {focusedEntryId ? t('journal.subtitle_entry') : focusedSummaryId ? t('journal.subtitle_summary') : t('journal.subtitle_default')}
            </p>
            {(focusedEntryId || focusedSummaryId) &&
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFocusedEntryId(null);
                  setFocusedSummaryId(null);
                  window.history.pushState({}, '', createPageUrl('Journal'));
                }}
                className="mt-2"
                style={{ borderRadius: '16px' }}>

                {t('journal.view_all_entries')}
              </Button>
              }
          </div>
        </div>
        <div className="flex w-full md:w-auto flex-col gap-2 md:items-end">
          <Button
              onClick={() => navigate('/Chat?intent=thought_work')} className="bg-teal-600 text-primary-foreground px-4 text-sm font-medium tracking-[0.005em] rounded-2xl inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-10 min-h-[44px] md:h-8 md:min-h-0 md:text-base md:w-auto w-full"

              size="sm">

            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            {t('journal.new_entry')}
          </Button>
          <div className="flex gap-2 flex-wrap md:justify-end">
          <Button
              onClick={() => navigate('/JournalDashboard')}
              variant="outline" className="bg-teal-600 text-slate-50 px-3 text-xs font-medium tracking-[0.005em] rounded-2xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-8 min-h-[44px] md:min-h-0 md:text-sm"

              size="sm">

            <BarChart2 className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Progress</span>
          </Button>
          <Button
              onClick={() => setShowTrendsSummary(true)}
              variant="outline" className="bg-teal-600 text-slate-50 px-3 text-xs font-medium tracking-[0.005em] rounded-2xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-8 min-h-[44px] md:min-h-0 md:text-sm"

              size="sm">

            <Sparkles className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">{t('journal.ai_insights')}</span>
          </Button>
          <Button
              onClick={() => setShowAiPrompts(true)}
              variant="outline" className="bg-teal-600 text-slate-50 px-3 text-xs font-medium tracking-[0.005em] rounded-2xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-8 min-h-[44px] md:min-h-0 md:text-sm"

              size="sm">

            <Sparkles className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">{t('journal.ai_prompts')}</span>
          </Button>
          <Button
              onClick={() => setShowReminderManager(true)}
              variant="outline" className="bg-teal-600 text-slate-50 px-3 text-xs font-medium tracking-[0.005em] rounded-[var(--radius-control)] items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-8 min-h-[44px] md:min-h-0 hidden md:flex"

              size="sm"
              style={{ borderRadius: '24px' }}>

            <Bell className="w-4 h-4 mr-2" />
            {t('journal.reminders')}
          </Button>
          <Button
              onClick={() => setShowTemplateManager(true)}
              variant="outline" className="bg-teal-600 text-slate-50 px-3 text-xs font-medium tracking-[0.005em] rounded-[var(--radius-control)] items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-8 min-h-[44px] md:min-h-0 hidden md:flex"

              size="sm"
              style={{ borderRadius: '24px' }}>

            <Settings className="w-4 h-4 mr-2" />
                {t('journal.templates')}
              </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="text-teal-600 lucide lucide-search absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5" />
            <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('journal.search_placeholder')} className="bg-teal-100 text-foreground mx-3 px-8 py-1 font-normal tracking-[0.001em] leading-6 rounded-2xl flex h-9 w-full border border-input/90 shadow-[var(--shadow-sm)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 rtl:pl-3 rtl:pr-10"

                style={{ borderRadius: '28px' }} />

          </div>
        </div>
        
        <JournalFilters
            allTags={allTags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            selectedType={selectedType}
            onTypeChange={setSelectedType} />

      </div>



      {/* Entries List */}
      {isLoadingJournals || isLoadingSummaries ?
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('journal.loading')}</p>
        </div> :
        entries.length === 0 ?
        <Card className="border border-border/80 bg-card shadow-[var(--shadow-lg)]">
          <CardContent className="bg-teal-100 p-12 text-center">
            <div className="bg-teal-100 text-primary mb-4 mx-auto rounded-full w-20 h-20 flex items-center justify-center shadow-[var(--shadow-sm)]">
              <BookOpen className="bg-teal-100 text-teal-600 lucide lucide-book-open w-10 h-10" />
            </div>
            <h2 className="text-teal-600 mb-2 text-2xl font-medium">{t('journal.first_entry_title')}</h2>
            <p className="text-teal-600 mb-6 mx-auto font-medium max-w-md">
              {t('journal.first_entry_description')}
            </p>
            <div className="flex flex-col gap-3 items-center max-w-md mx-auto">
              <Button
                onClick={() => navigate('/Chat?intent=thought_work')} className="bg-teal-600 text-primary-foreground px-8 py-6 text-lg font-medium tracking-[0.005em] rounded-3xl inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0 w-full">


                {t('journal.create_entry')}
              </Button>
              <Button
                onClick={() => setShowTemplateManager(true)}
                variant="outline" className="bg-teal-600 text-slate-50 px-6 py-5 text-base font-medium tracking-[0.005em] rounded-[var(--radius-control)] inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-border/70 shadow-[var(--shadow-sm)] hover:bg-secondary/92 hover:text-foreground active:bg-secondary/96 h-9 min-h-[44px] md:min-h-0 w-full md:w-auto"

                style={{ borderRadius: '32px' }}>

                {t('journal.browse_templates')}
              </Button>
            </div>
          </CardContent>
        </Card> :

        <>
          {filteredEntries.length === 0 ?
          <Card className="border border-border/80 bg-card shadow-[var(--shadow-md)]">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t('journal.no_entries_match')}</p>
                <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTags([]);
                  setSelectedType('all');
                }}
                variant="outline"
                className="mt-4">

                  {t('journal.clear_filters')}
                </Button>
              </CardContent>
            </Card> :

          <div className="space-y-4">
              {filteredEntries.map((entry) =>
            entry.isSummary ?
            <SessionSummaryCard key={entry.id} summary={entry} onDelete={() => {queryClient.invalidateQueries({ queryKey: ['sessionSummaries'] });queryClient.invalidateQueries({ queryKey: ['journalCount'] });}} /> :

            <ThoughtRecordCard key={entry.id} entry={entry} onEdit={handleEdit} />

            )}
            </div>
          }
        </>
        }

      {/* Form Modal */}
      {showForm &&
        <ThoughtRecordForm
          entry={editingEntry}
          template={selectedTemplate}
          templates={templates}
          onClose={handleClose}
          initialSituation={promptedSituation} />

        }

      {/* Template Manager */}
      {showTemplateManager &&
        <TemplateManager
          templates={templates}
          onClose={() => setShowTemplateManager(false)}
          onSelectTemplate={(template) => {
            setShowTemplateManager(false);
            handleNewEntry(template);
          }} />

        }

      {/* Reminder Manager */}
      {showReminderManager &&
        <ReminderManager
          onClose={() => setShowReminderManager(false)} />

        }

      {/* AI Prompts */}
      {showAiPrompts &&
        <AiJournalPrompts
          onSelectPrompt={(prompt) => {
            setShowAiPrompts(false);
            handleNewEntry(null, prompt);
          }}
          onClose={() => setShowAiPrompts(false)} />

        }

      {/* AI Trends Summary */}
      {showTrendsSummary &&
        <AiTrendsSummary
          onClose={() => setShowTrendsSummary(false)} />

        }
      </div>
    </PullToRefresh>);

}
