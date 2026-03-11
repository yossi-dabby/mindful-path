import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ThumbsUp, Pin, User, Shield, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ForumPostCard({ post, onView, onUpvote, onModerate, isUpvoting }) {
  const categoryColors = {
    general: 'bg-secondary text-secondary-foreground border border-border/60',
    goals: 'bg-teal-100 text-teal-700 border border-teal-200',
    mental_health: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
    exercises: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    success_stories: 'bg-amber-100 text-amber-700 border border-amber-200',
    questions: 'bg-orange-100 text-orange-700 border border-orange-200',
    tips: 'bg-rose-100 text-rose-700 border border-rose-200'
  };

  return (
    <Card className="border border-border/80 bg-card shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow cursor-pointer" onClick={onView}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-sm)]">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {post.pinned && <Pin className="w-4 h-4 text-primary" />}
            <h3 className="font-semibold text-foreground line-clamp-2">{post.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <Badge className={categoryColors[post.category]}>
                {post.category.replace('_', ' ')}
              </Badge>
              {post.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {post.is_anonymous && (
                <Badge variant="outline" className="text-xs">
                  Anonymous
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author_display_name}
              </span>
              <span>{formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpvote(post);
                }}
                disabled={isUpvoting}
              >
                {isUpvoting ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <ThumbsUp className="w-4 h-4 mr-1" />
                )}
                {post.upvotes || 0}
              </Button>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {post.comment_count || 0}
              </span>
              {onModerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent text-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onModerate(post);
                  }}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Moderate
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}