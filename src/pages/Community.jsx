import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, MessageSquare, TrendingUp, Search, ThumbsUp } from 'lucide-react';
import ForumPostCard from '../components/community/ForumPostCard';
import ForumPostForm from '../components/community/ForumPostForm';
import GroupCard from '../components/community/GroupCard';
import GroupForm from '../components/community/GroupForm';
import ProgressShareForm from '../components/community/ProgressShareForm';

export default function Community() {
  const [activeTab, setActiveTab] = useState('forum');
  const [showPostForm, setShowPostForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: forumPosts, isLoading: loadingPosts } = useQuery({
    queryKey: ['forumPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 50),
    initialData: []
  });

  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ['communityGroups'],
    queryFn: () => base44.entities.CommunityGroup.list('-created_date'),
    initialData: []
  });

  const { data: memberships } = useQuery({
    queryKey: ['groupMemberships'],
    queryFn: () => base44.entities.GroupMembership.list(),
    initialData: []
  });

  const { data: sharedProgress } = useQuery({
    queryKey: ['sharedProgress'],
    queryFn: () => base44.entities.SharedProgress.list('-created_date', 30),
    initialData: []
  });

  const upvotePostMutation = useMutation({
    mutationFn: (post) =>
      base44.entities.ForumPost.update(post.id, {
        upvotes: (post.upvotes || 0) + 1
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['forumPosts']);
    }
  });

  const upvoteProgressMutation = useMutation({
    mutationFn: (progress) =>
      base44.entities.SharedProgress.update(progress.id, {
        upvotes: (progress.upvotes || 0) + 1
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['sharedProgress']);
    }
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (group) => {
      await base44.entities.GroupMembership.create({
        group_id: group.id,
        role: 'member',
        joined_date: new Date().toISOString()
      });
      await base44.entities.CommunityGroup.update(group.id, {
        member_count: (group.member_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['communityGroups']);
      queryClient.invalidateQueries(['groupMemberships']);
    }
  });

  const myGroupIds = memberships.map(m => m.group_id);
  const filteredPosts = forumPosts.filter(post =>
    !searchQuery ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">Community</h1>
        <p className="text-gray-500">Connect, share, and support each other's journeys</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{forumPosts.length}</p>
              <p className="text-sm text-gray-600">Forum Posts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">{groups.length}</p>
              <p className="text-sm text-gray-600">Active Groups</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{sharedProgress.length}</p>
              <p className="text-sm text-gray-600">Success Stories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="forum">Forum</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="progress">Success Stories</TabsTrigger>
          </TabsList>
          {activeTab === 'forum' && (
            <Button onClick={() => setShowPostForm(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          )}
          {activeTab === 'groups' && (
            <Button onClick={() => setShowGroupForm(true)} className="bg-purple-600 hover:bg-purple-700 gap-2">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          )}
          {activeTab === 'progress' && (
            <Button onClick={() => setShowProgressForm(true)} className="bg-green-600 hover:bg-green-700 gap-2">
              <Plus className="w-4 h-4" />
              Share Progress
            </Button>
          )}
        </div>

        {/* Forum Tab */}
        <TabsContent value="forum">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="pl-10 rounded-xl"
              />
            </div>

            {loadingPosts ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">Loading posts...</p>
                </CardContent>
              </Card>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to start a conversation!</p>
                  <Button onClick={() => setShowPostForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    Create First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    onView={() => {}}
                    onUpvote={(post) => upvotePostMutation.mutate(post)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups">
          <div className="space-y-4">
            {memberships.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Your Groups</h3>
                <div className="space-y-3 mb-6">
                  {groups.filter(g => myGroupIds.includes(g.id)).map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isMember={true}
                      onView={() => {}}
                      onJoin={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Discover Groups</h3>
              {loadingGroups ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500">Loading groups...</p>
                  </CardContent>
                </Card>
              ) : groups.filter(g => !myGroupIds.includes(g.id)).length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No groups yet</h3>
                    <p className="text-gray-600 mb-4">Create the first group to bring people together!</p>
                    <Button onClick={() => setShowGroupForm(true)} className="bg-purple-600 hover:bg-purple-700">
                      Create First Group
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {groups.filter(g => !myGroupIds.includes(g.id)).map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      isMember={false}
                      onView={() => {}}
                      onJoin={(group) => joinGroupMutation.mutate(group)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <div className="space-y-4">
            {sharedProgress.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No stories yet</h3>
                  <p className="text-gray-600 mb-4">Share your progress and inspire others!</p>
                  <Button onClick={() => setShowProgressForm(true)} className="bg-green-600 hover:bg-green-700">
                    Share Your Story
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sharedProgress.map((progress) => (
                  <Card key={progress.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{progress.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-3">{progress.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            {progress.progress_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">{progress.author_display_name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0"
                          onClick={() => upvoteProgressMutation.mutate(progress)}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {progress.upvotes || 0}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showPostForm && <ForumPostForm onClose={() => setShowPostForm(false)} />}
      {showGroupForm && <GroupForm onClose={() => setShowGroupForm(false)} />}
      {showProgressForm && <ProgressShareForm onClose={() => setShowProgressForm(false)} />}
    </div>
  );
}