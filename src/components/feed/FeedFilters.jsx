import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

const CONTENT_TYPES = [
  { id: 'all', label: 'All Content' },
  { id: 'exercises', label: 'Exercises' },
  { id: 'resources', label: 'Articles' },
  { id: 'community', label: 'Community' },
  { id: 'quotes', label: 'Inspiration' }
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Most Relevant' },
  { id: 'recent', label: 'Most Recent' },
  { id: 'popular', label: 'Most Popular' }
];

export default function FeedFilters({ 
  contentType, 
  setContentType, 
  sortBy, 
  setSortBy,
  hasActiveFilters,
  onClearFilters 
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-sm text-gray-800">Filter & Sort</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Content Type Filter */}
        <div>
          <p className="text-xs text-gray-600 mb-2">Content Type:</p>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setContentType(type.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${contentType === type.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <p className="text-xs text-gray-600 mb-2">Sort By:</p>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSortBy(option.id)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${sortBy === option.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}