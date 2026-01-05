import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Bookmark, BookmarkCheck, FileText, Video, Headphones, Smartphone, BookOpen, Globe, Sparkles, Brain, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResourceCard({ resource, isSaved, onSaveToggle }) {
  const typeIcons = {
    article: FileText,
    video: Video,
    podcast: Headphones,
    app: Smartphone,
    book: BookOpen,
    website: Globe,
    meditation: Sparkles,
    scenario: Brain,
    interview: Users,
    guide: BookOpen
  };

  const typeColors = {
    article: 'bg-blue-100 text-blue-700',
    video: 'bg-red-100 text-red-700',
    podcast: 'bg-purple-100 text-purple-700',
    app: 'bg-green-100 text-green-700',
    book: 'bg-yellow-100 text-yellow-700',
    website: 'bg-gray-100 text-gray-700',
    meditation: 'bg-teal-100 text-teal-700',
    scenario: 'bg-orange-100 text-orange-700',
    interview: 'bg-indigo-100 text-indigo-700',
    guide: 'bg-emerald-100 text-emerald-700'
  };

  const categoryColors = {
    anxiety: 'bg-orange-100 text-orange-700',
    depression: 'bg-indigo-100 text-indigo-700',
    stress: 'bg-red-100 text-red-700',
    mindfulness: 'bg-green-100 text-green-700',
    relationships: 'bg-pink-100 text-pink-700',
    'self-esteem': 'bg-purple-100 text-purple-700',
    sleep: 'bg-blue-100 text-blue-700',
    general: 'bg-gray-100 text-gray-700',
    coping_skills: 'bg-cyan-100 text-cyan-700',
    emotional_regulation: 'bg-violet-100 text-violet-700',
    communication: 'bg-rose-100 text-rose-700'
  };

  const Icon = typeIcons[resource.type] || FileText;

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all group">
      {resource.thumbnail_url && (
        <div className="h-40 overflow-hidden rounded-t-xl">
          <img
            src={resource.thumbnail_url}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge className={cn('text-xs', typeColors[resource.type])}>
            <Icon className="w-3 h-3 mr-1" />
            {resource.type}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSaveToggle}
            className="h-8 w-8"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-purple-600 fill-purple-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-400 hover:text-purple-600" />
            )}
          </Button>
        </div>
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">{resource.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={cn('text-xs', categoryColors[resource.category])}>
            {resource.category}
          </Badge>
          {resource.estimated_time && (
            <Badge variant="outline" className="text-xs text-gray-600">
              {resource.estimated_time}
            </Badge>
          )}
          {resource.difficulty_level && (
            <Badge variant="outline" className="text-xs text-gray-600 capitalize">
              {resource.difficulty_level}
            </Badge>
          )}
        </div>

        {resource.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{resource.tags.length - 3}</span>
            )}
          </div>
        )}

        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full bg-purple-600 hover:bg-purple-700 group/btn">
              <span>View Resource</span>
              <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </a>
        ) : resource.content ? (
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              // Open content in modal or new view
              window.open(`/resources/${resource.id}`, '_blank');
            }}
          >
            <span>View Content</span>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}