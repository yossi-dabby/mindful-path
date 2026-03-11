import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, MessageSquare, TrendingUp, Search, ThumbsUp, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ForumPostCard from '../components/community/ForumPostCard';
import ForumPostForm from '../components/community/ForumPostForm';
import GroupCard from '../components/community/GroupCard';
import GroupForm from '../components/community/GroupForm';
import ProgressShareForm from '../components/community/ProgressShareForm';
import ModerationTools from '../components/community/ModerationTools';
import PullToRefresh from '../components/utils/PullToRefresh';

export default function Community() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('forum');
  const [showPostForm, setShowPostForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moderatingPost, setModeratingPost] = useState(null);
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
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    }
  });

  const upvoteProgressMutation = useMutation({
    mutationFn: (progress) =>
      base44.entities.SharedProgress.update(progress.id, {
        upvotes: (progress.upvotes || 0) + 1
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedProgress'] });
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
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
      queryClient.invalidateQueries({ queryKey: ['groupMemberships'] });
    }
  });

  const myGroupIds = memberships.map(m => m.group_id);
  const filteredPosts = forumPosts.filter(post =>
    !searchQuery ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PullToRefresh queryKeys={['forumPosts', 'communityGroups', 'groupMemberships', 'sharedProgress']}>
      <div className="p-4 md:p-8 pb-36 md:pb-8 max-w-7xl mx-auto min-h-[100dvh] bg-transparent">
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 leading-tight break-words text-foreground">{t('community.page_title')}</h1>
        <p className="leading-relaxed break-words text-muted-foreground">{t('community.page_subtitle')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="surface-secondary rounded-[var(--radius-card)] border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{forumPosts.length}</p>
              <p className="text-sm text-muted-foreground">{t('community.stats.forum_posts')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-secondary rounded-[var(--radius-card)] border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{groups.length}</p>
              <p className="text-sm text-muted-foreground">{t('community.stats.active_groups')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-secondary rounded-[var(--radius-card)] border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{sharedProgress.length}</p>
              <p className="text-sm text-muted-foreground">{t('community.stats.success_stories')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="forum">{t('community.tabs.forum')}</TabsTrigger>
            <TabsTrigger value="groups">{t('community.tabs.groups')}</TabsTrigger>
            <TabsTrigger value="progress">{t('community.tabs.progress')}</TabsTrigger>
          </TabsList>
          {activeTab === 'forum' && (
            <Button onClick={() => setShowPostForm(true)} className="gap-2 flex-shrink-0 rounded-[var(--radius-card)]">
              <Plus className="w-4 h-4" />
              {t('community.buttons.new_post')}
            </Button>
          )}
          {activeTab === 'groups' && (
            <Button onClick={() => setShowGroupForm(true)} className="gap-2 flex-shrink-0 rounded-[var(--radius-card)]">
              <Plus className="w-4 h-4" />
              {t('community.buttons.create_group')}
            </Button>
          )}
          {activeTab === 'progress' && (
            <Button onClick={() => setShowProgressForm(true)} className="gap-2 flex-shrink-0 rounded-[var(--radius-card)]">
              <Plus className="w-4 h-4" />
              {t('community.buttons.share_progress')}
            </Button>
          )}
        </div>

        {/* Forum Tab */}
        <TabsContent value="forum">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('community.search_placeholder')}
                className="pl-10 rtl:pl-3 rtl:pr-10"
                style={{ borderRadius: '28px' }}
              />
            </div>

            {loadingPosts ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">{t('community.loading.posts')}</p>
                </CardContent>
              </Card>
            ) : filteredPosts.length === 0 ? (
              <Card className="surface-secondary rounded-[var(--radius-card)] border-border/70 shadow-[var(--shadow-md)]">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-3 text-primary/40" />
                  <h3 className="text-xl font-semibold mb-2 break-words text-foreground">{t('community.empty_state.no_posts_title')}</h3>
                  <p className="mb-4 leading-relaxed break-words max-w-sm mx-auto text-muted-foreground">{t('community.empty_state.no_posts_message')}</p>
                  <Button onClick={() => setShowPostForm(true)} className="rounded-full shadow-[var(--shadow-md)]" data-testid="create-first-post-btn">
                    {t('community.empty_state.create_first_post')}
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
                    onModerate={() => setModeratingPost(post)}
                    isUpvoting={upvotePostMutation.isPending}
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
                <h3 className="font-semibold text-foreground mb-3">{t('community.your_groups')}</h3>
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
              <h3 className="font-semibold text-foreground mb-3">{t('community.discover_groups')}</h3>
              {loadingGroups ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">{t('community.loading.groups')}</p>
                  </CardContent>
                </Card>
              ) : groups.filter(g => !myGroupIds.includes(g.id)).length === 0 ? (
                <Card className="surface-secondary rounded-[var(--radius-card)] border-border/70 shadow-[var(--shadow-md)]">
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-3 text-primary/40" />
                    <h3 className="text-xl font-semibold mb-2 break-words text-foreground">{t('community.empty_state.no_groups_title')}</h3>
                    <p className="mb-4 leading-relaxed break-words max-w-sm mx-auto text-muted-foreground">{t('community.empty_state.no_groups_message')}</p>
                    <Button onClick={() => setShowGroupForm(true)} className="rounded-full shadow-[var(--shadow-md)]" data-testid="create-first-group-btn">
                      {t('community.empty_state.create_first_group')}
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
              <Card className="surface-secondary rounded-[var(--radius-card)] border-border/70 shadow-[var(--shadow-md)]">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-3 text-primary/40" />
                  <h3 className="text-xl font-semibold mb-2 break-words text-foreground">{t('community.empty_state.no_stories_title')}</h3>
                  <p className="mb-4 leading-relaxed break-words max-w-sm mx-auto text-muted-foreground">{t('community.empty_state.no_stories_message')}</p>
                  <Button onClick={() => setShowProgressForm(true)} className="rounded-full shadow-[var(--shadow-md)]" data-testid="share-story-btn">
                    {t('community.empty_state.share_your_story')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sharedProgress.map((progress) => (
                  <Card key={progress.id} className="surface-primary rounded-[var(--radius-card)] border-border/70 hover:shadow-[var(--shadow-lg)] transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 break-words min-w-0 text-foreground">{progress.title}</h3>
                          <p className="text-sm line-clamp-3 text-muted-foreground">{progress.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-primary border border-border/60">
                            {progress.progress_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground">{progress.author_display_name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0"
                          onClick={() => upvoteProgressMutation.mutate(progress)}
                          disabled={upvoteProgressMutation.isPending}
                        >
                          {upvoteProgressMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <ThumbsUp className="w-4 h-4 mr-1" />
                          )}
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
      {moderatingPost && <ModerationTools post={moderatingPost} onClose={() => setModeratingPost(null)} />}
      </div>
    </PullToRefresh>
  );
}