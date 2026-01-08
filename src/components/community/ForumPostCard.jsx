import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, ThumbsUp, Pin, User, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ForumPostCard({ post, onView, onUpvote, onModerate }) {
  const categoryColors = {
    general: 'bg-gray-100 text-gray-700',
    goals: 'bg-blue-100 text-blue-700',
    mental_health: 'bg-purple-100 text-purple-700',
    exercises: 'bg-green-100 text-green-700',
    success_stories: 'bg-yellow-100 text-yellow-700',
    questions: 'bg-orange-100 text-orange-700',
    tips: 'bg-pink-100 text-pink-700'
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onView}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {post.pinned && <Pin className="w-4 h-4 text-blue-600" />}
              <h3 className="font-semibold text-gray-800 line-clamp-1">{post.title}</h3>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.content}</p>
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
            <div className="flex items-center gap-4 text-sm text-gray-500">
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
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
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
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onModerate(post);
                  }}
                  style={{ color: '#F59E0B' }}
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