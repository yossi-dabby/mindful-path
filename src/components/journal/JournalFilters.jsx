import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const entryTypes = [
{ value: 'all', label: 'All Types' },
{ value: 'cbt_standard', label: 'CBT Standard' },
{ value: 'gratitude', label: 'Gratitude' },
{ value: 'anxiety_log', label: 'Anxiety Log' },
{ value: 'mood_journal', label: 'Mood Journal' },
{ value: 'custom', label: 'Custom' }];


export default function JournalFilters({
  allTags,
  selectedTags,
  onTagsChange,
  selectedType,
  onTypeChange
}) {
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedType !== 'all';

  return (
    <div className="space-y-3">
      {/* Type Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-teal-600 text-sm font-medium">Type:</span>
        {entryTypes.map((type) =>
        <Badge
          key={type.value}
          variant={selectedType === type.value ? 'default' : 'outline'} className="bg-teal-600 text-slate-50 px-3 py-1 font-medium tracking-[0.01em] leading-4 rounded-2xl inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/70 cursor-pointer hover:bg-secondary"






          onClick={() => onTypeChange(type.value)}>

            {type.label}
          </Badge>
        )}
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 &&
      <div className="flex items-center gap-2 flex-wrap">
          <span className="text-teal-600 text-sm font-medium">Tags:</span>
          {allTags.map((tag) =>
        <Badge
          key={tag}
          variant={selectedTags.includes(tag) ? 'default' : 'outline'} className="bg-teal-600 text-slate-50 px-3 py-1 font-medium tracking-[0.01em] leading-4 rounded-2xl inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/70 cursor-pointer hover:bg-secondary"






          onClick={() => toggleTag(tag)}>

              {tag}
            </Badge>
        )}
        </div>
      }

      {/* Clear Filters */}
      {hasActiveFilters &&
      <div>
          <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onTagsChange([]);
            onTypeChange('all');
          }}
          className="text-muted-foreground hover:text-foreground">

            <X className="w-4 h-4 mr-1" />
            Clear All Filters
          </Button>
        </div>
      }
    </div>);

}