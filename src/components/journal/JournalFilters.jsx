import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ENTRY_TYPE_VALUES = ['all', 'cbt_standard', 'gratitude', 'anxiety_log', 'mood_journal', 'custom'];

export default function JournalFilters({ allTags = [], selectedTags, onTagsChange, selectedType, onTypeChange }) {
  const { t } = useTranslation();
  const toggleTag = (tag) => onTagsChange(
    selectedTags.includes(tag) ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag]
  );
  const hasActiveFilters = selectedTags.length > 0 || selectedType !== 'all';

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-sm font-semibold text-teal-900">{t('journal.filters.type_label')}</p>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap" role="group" aria-label={t('journal.filters.type_label')}>
          {ENTRY_TYPE_VALUES.map((value) => {
            const isSelected = selectedType === value;
            return (
              <button key={value} type="button" onClick={() => onTypeChange(value)} aria-pressed={isSelected}
                className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                  isSelected ? 'border-teal-700 bg-teal-700 text-white shadow-sm' : 'border-teal-200 bg-white/80 text-teal-900 hover:bg-teal-50'
                }`}>
                {t(`journal.filters.entry_types.${value}`)}
              </button>
            );
          })}
        </div>
      </div>

      {allTags.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-teal-900">{t('journal.filters.tags_label')}</p>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap" role="group" aria-label={t('journal.filters.tags_label')}>
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} aria-pressed={isSelected}
                  className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
                    isSelected ? 'border-teal-700 bg-teal-700 text-white shadow-sm' : 'border-teal-200 bg-white/80 text-teal-900 hover:bg-teal-50'
                  }`}>
                  <span dir="auto">{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => { onTagsChange([]); onTypeChange('all'); }}
          className="min-h-11 rounded-xl text-slate-600 hover:text-slate-900">
          <X className="h-4 w-4" />{t('journal.clear_filters')}
        </Button>
      )}
    </div>
  );
}
