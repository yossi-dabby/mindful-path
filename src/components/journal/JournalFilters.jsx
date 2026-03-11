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
  { value: 'custom', label: 'Custom' }
];

export default function JournalFilters({
  allTags,
  selectedTags,
  onTagsChange,
  selectedType,
  onTypeChange
}) {
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedType !== 'all';

  return (
    <div className="space-y-3">
      {/* Type Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Type:</span>
        {entryTypes.map((type) => (
          <Badge
            key={type.value}
            variant={selectedType === type.value ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer px-3 py-1',
              selectedType === type.value
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : 'hover:bg-secondary text-foreground'
            )}
            onClick={() => onTypeChange(type.value)}
          >
            {type.label}
          </Badge>
        ))}
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Tags:</span>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer px-3 py-1',
                selectedTags.includes(tag)
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'hover:bg-secondary text-foreground'
              )}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onTagsChange([]);
              onTypeChange('all');
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}