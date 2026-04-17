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
    onMutate: async (post) => {
      await queryClient.cancelQueries({ queryKey: ['forumPosts'] });
      const previous = queryClient.getQueryData(['forumPosts']);
      queryClient.setQueryData(['forumPosts'], (old = []) =>
        old.map(p => p.id === post.id ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['forumPosts'], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['forumPosts'] })
  });

  const upvoteProgressMutation = useMutation({
    mutationFn: (progress) =>
    base44.entities.SharedProgress.update(progress.id, {
      upvotes: (progress.upvotes || 0) + 1
    }),
    onMutate: async (progress) => {
      await queryClient.cancelQueries({ queryKey: ['sharedProgress'] });
      const previous = queryClient.getQueryData(['sharedProgress']);
      queryClient.setQueryData(['sharedProgress'], (old = []) =>
        old.map(p => p.id === progress.id ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(['sharedProgress'], ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['sharedProgress'] })
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
    onMutate: async (group) => {
      await queryClient.cancelQueries({ queryKey: ['communityGroups'] });
      await queryClient.cancelQueries({ queryKey: ['groupMemberships'] });
      const previousGroups = queryClient.getQueryData(['communityGroups']);
      const previousMemberships = queryClient.getQueryData(['groupMemberships']);
      queryClient.setQueryData(['communityGroups'], (old = []) =>
        old.map(g => g.id === group.id ? { ...g, member_count: (g.member_count || 0) + 1 } : g)
      );
      queryClient.setQueryData(['groupMemberships'], (old = []) => [
        ...old,
        { id: 'temp-' + crypto.randomUUID(), group_id: group.id, role: 'member' }
      ]);
      return { previousGroups, previousMemberships };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousGroups) queryClient.setQueryData(['communityGroups'], ctx.previousGroups);
      if (ctx?.previousMemberships) queryClient.setQueryData(['groupMemberships'], ctx.previousMemberships);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['communityGroups'] });
      queryClient.invalidateQueries({ queryKey: ['groupMemberships'] });
    }
  });

  const myGroupIds = memberships.map((m) => m.group_id);
  const filteredPosts = forumPosts.filter((post) =>
  !searchQuery ||
  (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
  (post.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const baseTabActionClassName = [
    'text-primary-foreground px-4 py-2 font-medium tracking-[0.005em] leading-none',
    'inline-flex items-center justify-center whitespace-nowrap',
    'border border-transparent transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-45',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95',
    'h-9 min-h-[44px] md:min-h-0 gap-2 w-full sm:w-auto'
  ].join(' ');
  const tabActionConfig = {
    forum: {
      onClick: () => setShowPostForm(true),
      label: t('community.buttons.new_post'),
      className: `${baseTabActionClassName} bg-teal-600 rounded-[var(--radius-card)]`
    },
    groups: {
      onClick: () => setShowGroupForm(true),
      label: t('community.buttons.create_group'),
      className: `${baseTabActionClassName} bg-teal-600 rounded-[20px]`
    },
    progress: {
      onClick: () => setShowProgressForm(true),
      label: t('community.buttons.share_progress'),
      className: `${baseTabActionClassName} bg-teal-700 rounded-[20px]`
    }
  };
  const activeTabAction = tabActionConfig[activeTab] || tabActionConfig.forum;

  return (
    <PullToRefresh queryKeys={['forumPosts', 'communityGroups', 'groupMemberships', 'sharedProgress']}>
      <div className="p-4 md:p-8 pb-36 md:pb-8 max-w-7xl mx-auto min-h-[100dvh] bg-transparent">
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-teal-600 mb-2 text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl break-words">{t('community.page_title')}</h1>
        <p className="text-teal-600 font-medium leading-relaxed break-words">{t('community.page_subtitle')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="surface-secondary rounded-[var(--radius-card)] border-border/80">
          <CardContent className="text-teal-600 p-4 flex items-center gap-3">
            <MessageSquare className="text-teal-600 lucide lucide-message-square w-8 h-8" />
            <div>
              <p className="text-teal-600 text-2xl font-bold">{forumPosts.length}</p>
              <p className="text-teal-600 text-sm font-medium">{t('community.stats.forum_posts')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-secondary rounded-[var(--radius-card)] border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="text-emerald-600 lucide lucide-users w-8 h-8" />
            <div>
              <p className="text-emerald-600 text-2xl font-bold">{groups.length}</p>
              <p className="text-emerald-600 text-sm font-medium">{t('community.stats.active_groups')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="surface-secondary rounded-[var(--radius-card)] border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="text-green-600 lucide lucide-trending-up w-8 h-8" />
            <div>
              <p className="text-green-600 text-2xl font-bold">{sharedProgress.length}</p>
              <p className="text-green-600 text-sm font-medium">{t('community.stats.success_stories')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="surface-secondary rounded-[var(--radius-card)] border border-border/70 shadow-[var(--shadow-sm)] p-3 md:p-4 mb-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="flex-shrink-0 w-full sm:w-auto">
            <TabsTrigger value="forum" className="text-teal-600 px-3 py-1 text-sm font-medium tracking-[0.003em] leading-none rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)]">{t('community.tabs.forum')}</TabsTrigger>
            <TabsTrigger value="groups" className="text-teal-600 px-3 py-1 text-sm font-medium tracking-[0.003em] leading-none rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)]">{t('community.tabs.groups')}</TabsTrigger>
            <TabsTrigger value="progress" className="text-teal-600 px-3 py-1 text-sm font-medium tracking-[0.003em] leading-none rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)]">{t('community.tabs.progress')}</TabsTrigger>
          </TabsList>
            <Button onClick={activeTabAction.onClick} className={activeTabAction.className}>
              <Plus className="w-4 h-4" />
              {activeTabAction.label}
            </Button>
          </div>

          {activeTab === 'forum' && (
            <div className="relative">
              <Search className="text-teal-600 lucide lucide-search absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('community.search_placeholder')} className="bg-[hsl(var(--surface-nested)/0.92)] text-emerald-700 pl-10 px-3 py-1 font-normal tracking-[0.001em] leading-6 rounded-[var(--radius-control)] flex h-9 w-full border border-input/90 shadow-[var(--shadow-sm)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 rtl:pl-3 rtl:pr-10"
                style={{ borderRadius: '28px' }} />
            </div>
          )}
        </div>

        {/* Forum Tab */}
        <TabsContent value="forum">
          <div className="space-y-4">
            {loadingPosts ?
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">{t('community.loading.posts')}</p>
                </CardContent>
              </Card> :
              filteredPosts.length === 0 ?
              <Card className="surface-secondary rounded-[var(--radius-card)] border-border/70 shadow-[var(--shadow-md)]">
                <CardContent className="bg-teal-50 p-12 text-center">
                  <MessageSquare className="text-teal-600 mb-3 mx-auto lucide lucide-message-square w-16 h-16" />
                  <h3 className="text-teal-600 mb-2 text-xl font-semibold break-words">{t('community.empty_state.no_posts_title')}</h3>
                  <p className="text-teal-600 mb-4 mx-auto font-medium leading-relaxed break-words max-w-sm">{t('community.empty_state.no_posts_message')}</p>
                  <Button onClick={() => setShowPostForm(true)} className="bg-teal-600 text-primary-foreground px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0 shadow-[var(--shadow-md)]" data-testid="create-first-post-btn">
                    {t('community.empty_state.create_first_post')}
                  </Button>
                </CardContent>
              </Card> :

              <div className="space-y-3">
                {filteredPosts.map((post) =>
                <ForumPostCard
                  key={post.id}
                  post={post}
                  onView={() => {}}
                  onUpvote={(post) => upvotePostMutation.mutate(post)}
                  onModerate={() => setModeratingPost(post)}
                  isUpvoting={upvotePostMutation.isPending} />

                )}
              </div>
              }
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups">
          <div className="space-y-6">
            {memberships.length > 0 &&
              <section className="space-y-3">
                <h3 className="font-semibold text-foreground">{t('community.your_groups')}</h3>
                <div className="space-y-3">
                  {groups.filter((g) => myGroupIds.includes(g.id)).map((group) =>
                  <GroupCard
                    key={group.id}
                    group={group}
                    isMember={true}
                    onView={() => {}}
                    onJoin={() => {}} />

                  )}
                </div>
              </section>
              }

            <section className="space-y-3">
              <h3 className="text-teal-700 font-semibold">{t('community.discover_groups')}</h3>
              {loadingGroups ?
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">{t('community.loading.groups')}</p>
                  </CardContent>
                </Card> :
                groups.filter((g) => !myGroupIds.includes(g.id)).length === 0 ?
                <Card className="surface-secondary rounded-[var(--radius-card)] border-border/70 shadow-[var(--shadow-md)]">
                  <CardContent className="bg-teal-50 p-12 text-center">
                    <Users className="text-teal-600 mb-3 mx-auto lucide lucide-users w-16 h-16" />
                    <h3 className="text-teal-600 mb-2 text-xl font-semibold break-words">{t('community.empty_state.no_groups_title')}</h3>
                    <p className="text-teal-600 mb-4 mx-auto font-medium leading-relaxed break-words max-w-sm">{t('community.empty_state.no_groups_message')}</p>
                    <Button onClick={() => setShowGroupForm(true)} className="bg-teal-600 text-primary-foreground px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0 shadow-[var(--shadow-md)]" data-testid="create-first-group-btn">
                      {t('community.empty_state.create_first_group')}
                    </Button>
                  </CardContent>
                </Card> :

                <div className="space-y-3">
                  {groups.filter((g) => !myGroupIds.includes(g.id)).map((group) =>
                  <GroupCard
                    key={group.id}
                    group={group}
                    isMember={false}
                    onView={() => {}}
                    onJoin={(group) => joinGroupMutation.mutate(group)} />

                  )}
                </div>
                }
            </section>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <div className="space-y-4">
            {sharedProgress.length === 0 ?
              <Card className="surface-secondary rounded-[var(--radius-card)] border-border/70 shadow-[var(--shadow-md)]">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="text-teal-700 mb-3 mx-auto lucide lucide-trending-up w-16 h-16" />
                  <h3 className="text-teal-700 mb-2 text-xl font-semibold break-words">{t('community.empty_state.no_stories_title')}</h3>
                  <p className="text-teal-700 mb-4 mx-auto leading-relaxed break-words max-w-sm">{t('community.empty_state.no_stories_message')}</p>
                  <Button onClick={() => setShowProgressForm(true)} className="bg-teal-700 text-primary-foreground px-4 py-2 font-medium tracking-[0.005em] leading-none rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 min-h-[44px] md:min-h-0 shadow-[var(--shadow-md)]" data-testid="share-story-btn">
                    {t('community.empty_state.share_your_story')}
                  </Button>
                </CardContent>
              </Card> :

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sharedProgress.map((progress) =>
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
                        disabled={upvoteProgressMutation.isPending}>

                          {upvoteProgressMutation.isPending ?
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" /> :

                        <ThumbsUp className="w-4 h-4 mr-1" />
                        }
                          {progress.upvotes || 0}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              }
          </div>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showPostForm && <ForumPostForm onClose={() => setShowPostForm(false)} />}
      {showGroupForm && <GroupForm onClose={() => setShowGroupForm(false)} />}
      {showProgressForm && <ProgressShareForm onClose={() => setShowProgressForm(false)} />}
      {moderatingPost && <ModerationTools post={moderatingPost} onClose={() => setModeratingPost(null)} />}
      </div>
    </PullToRefresh>);

}
