import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Lock, MessageSquare } from 'lucide-react';

export default function GroupCard({ group, isMember, onJoin, onView }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {group.image_url ? (
            <img
              src={group.image_url}
              alt={group.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">{group.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
              </div>
              {group.is_private && <Lock className="w-4 h-4 text-gray-400 ml-2" />}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {group.category.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {group.member_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {group.post_count || 0}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(group)}>
                  View
                </Button>
                {!isMember && (
                  <Button
                    size="sm"
                    onClick={() => onJoin(group)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Join
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}