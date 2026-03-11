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
    article: 'bg-secondary text-primary border border-border/60',
    video: 'bg-rose-100 text-rose-700 border border-rose-200',
    podcast: 'bg-amber-100 text-amber-700 border border-amber-200',
    app: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    book: 'bg-orange-100 text-orange-700 border border-orange-200',
    website: 'bg-slate-100 text-slate-700 border border-slate-200',
    meditation: 'bg-teal-100 text-teal-700 border border-teal-200',
    scenario: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
    interview: 'bg-sky-100 text-sky-700 border border-sky-200',
    guide: 'bg-teal-100 text-teal-700 border border-teal-200'
  };

  const categoryColors = {
    anxiety: 'bg-amber-100 text-amber-700 border border-amber-200',
    depression: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    stress: 'bg-rose-100 text-rose-700 border border-rose-200',
    mindfulness: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    relationships: 'bg-teal-100 text-teal-700 border border-teal-200',
    'self-esteem': 'bg-cyan-100 text-cyan-700 border border-cyan-200',
    sleep: 'bg-sky-100 text-sky-700 border border-sky-200',
    general: 'bg-secondary text-secondary-foreground border border-border/60',
    coping_skills: 'bg-orange-100 text-orange-700 border border-orange-200',
    emotional_regulation: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    communication: 'bg-rose-100 text-rose-700 border border-rose-200'
  };

  const Icon = typeIcons[resource.type] || FileText;

  return (
    <Card className="border border-border/80 bg-card shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all group">
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
            aria-label={isSaved ? "Remove from saved" : "Save resource"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
            ) : (
              <Bookmark className="w-5 h-5 text-muted-foreground hover:text-primary" />
            )}
          </Button>
        </div>
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{resource.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={cn('text-xs', categoryColors[resource.category])}>
            {resource.category}
          </Badge>
          {resource.estimated_time && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {resource.estimated_time}
            </Badge>
          )}
          {resource.difficulty_level && (
            <Badge variant="outline" className="text-xs text-muted-foreground capitalize">
              {resource.difficulty_level}
            </Badge>
          )}
        </div>

        {resource.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-[var(--radius-chip)] border border-border/50">
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{resource.tags.length - 3}</span>
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
            <Button className="w-full group/btn">
              <span>View Resource</span>
              <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </a>
        ) : resource.content ? (
          <Button 
            className="w-full"
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