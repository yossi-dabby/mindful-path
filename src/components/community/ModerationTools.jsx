import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Flag, Ban, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModerationTools({ post, onClose }) {
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const moderatePostMutation = useMutation({
    mutationFn: async ({ action, reason }) => {
      if (action === 'delete') {
        await base44.entities.ForumPost.delete(post.id);
      } else if (action === 'flag') {
        await base44.entities.ForumPost.update(post.id, {
          flagged: true,
          moderation_notes: reason
        });
      } else if (action === 'approve') {
        await base44.entities.ForumPost.update(post.id, {
          flagged: false,
          approved: true,
          moderation_notes: reason
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['forumPosts']);
      onClose();
    }
  });

  const actions = [
    {
      id: 'approve',
      label: 'Approve Post',
      icon: CheckCircle,
      color: '#10B981',
      description: 'Mark this post as appropriate and helpful'
    },
    {
      id: 'flag',
      label: 'Flag for Review',
      icon: Flag,
      color: '#F59E0B',
      description: 'Flag this post for further moderator review'
    },
    {
      id: 'delete',
      label: 'Remove Post',
      icon: XCircle,
      color: '#EF4444',
      description: 'Permanently delete this post'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="border-b" style={{
            background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.9) 0%, rgba(180, 220, 210, 0.8) 100%)'
          }}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: '#26A69A' }} />
                Moderation Tools
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Post Preview */}
            <div className="p-4 rounded-xl" style={{
              background: 'linear-gradient(145deg, rgba(240, 250, 248, 0.8) 0%, rgba(225, 245, 240, 0.7) 100%)',
              border: '1px solid rgba(38, 166, 154, 0.2)'
            }}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold" style={{ color: '#1A3A34' }}>{post.title}</h4>
                <Badge variant="outline">
                  {post.category}
                </Badge>
              </div>
              <p className="text-sm line-clamp-3" style={{ color: '#5A7A72' }}>
                {post.content}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: '#5A7A72' }}>
                <span>By: {post.author_display_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{post.upvotes || 0} upvotes</span>
                <span>•</span>
                <span>{post.comment_count || 0} comments</span>
              </div>
            </div>

            {/* Moderation Actions */}
            {!action && (
              <div>
                <h4 className="font-semibold mb-3" style={{ color: '#1A3A34' }}>
                  Select Action
                </h4>
                <div className="space-y-3">
                  {actions.map((actionItem) => {
                    const Icon = actionItem.icon;
                    return (
                      <button
                        key={actionItem.id}
                        onClick={() => setAction(actionItem.id)}
                        className="w-full p-4 rounded-xl text-left hover:shadow-md transition-all flex items-start gap-3"
                        style={{
                          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 247, 0.85) 100%)',
                          border: '2px solid rgba(38, 166, 154, 0.1)'
                        }}
                      >
                        <Icon className="w-6 h-6 mt-1" style={{ color: actionItem.color }} />
                        <div className="flex-1">
                          <h5 className="font-semibold mb-1" style={{ color: '#1A3A34' }}>
                            {actionItem.label}
                          </h5>
                          <p className="text-sm" style={{ color: '#5A7A72' }}>
                            {actionItem.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Confirmation & Reason */}
            <AnimatePresence>
              {action && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl flex items-start gap-3" style={{
                    background: 'linear-gradient(145deg, rgba(254, 243, 199, 0.6) 0%, rgba(255, 251, 235, 0.5) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}>
                    <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: '#F59E0B' }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1" style={{ color: '#92400E' }}>
                        You're about to {action} this post
                      </p>
                      <p className="text-xs" style={{ color: '#78350F' }}>
                        {action === 'delete' && 'This action cannot be undone.'}
                        {action === 'flag' && 'The post will be hidden pending review.'}
                        {action === 'approve' && 'The post will be marked as safe and appropriate.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A3A34' }}>
                      Reason (optional)
                    </label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Provide context for this moderation action..."
                      className="rounded-xl h-24"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setAction(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 text-white"
                      style={{
                        backgroundColor: action === 'delete' ? '#EF4444' : '#26A69A',
                        borderRadius: '12px'
                      }}
                      onClick={() => moderatePostMutation.mutate({ action, reason })}
                      disabled={moderatePostMutation.isPending}
                    >
                      {moderatePostMutation.isPending ? 'Processing...' : 'Confirm'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Safety Guidelines */}
            {!action && (
              <div className="p-4 rounded-xl" style={{
                background: 'linear-gradient(145deg, rgba(240, 240, 250, 0.6) 0%, rgba(245, 245, 255, 0.5) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <h5 className="text-sm font-semibold mb-2" style={{ color: '#6D28D9' }}>
                  Moderation Guidelines
                </h5>
                <ul className="text-xs space-y-1" style={{ color: '#5A7A72' }}>
                  <li>• Flag posts containing harmful advice or triggering content</li>
                  <li>• Remove spam, harassment, or discriminatory content immediately</li>
                  <li>• Approve helpful, supportive, and constructive posts</li>
                  <li>• Document reasons for all moderation actions</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}