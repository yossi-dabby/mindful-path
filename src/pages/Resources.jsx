import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Bookmark, Library } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ResourceCard from '../components/resources/ResourceCard';
import AIResourceRecommendations from '../components/resources/AIResourceRecommendations';

export default function Resources() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('-created_date', 100),
    initialData: []
  });

  const { data: savedResources } = useQuery({
    queryKey: ['savedResources'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.SavedResource.filter({ created_by: user.email });
    },
    initialData: []
  });

  const { data: moodEntries } = useQuery({
    queryKey: ['moodForResources'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 14),
    initialData: []
  });

  const { data: journalEntries } = useQuery({
    queryKey: ['journalForResources'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 10),
    initialData: []
  });

  const { data: user } = useQuery({
    queryKey: ['userForResources'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const saveResourceMutation = useMutation({
    mutationFn: (resourceId) => base44.entities.SavedResource.create({ resource_id: resourceId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedResources'] })
  });

  const unsaveResourceMutation = useMutation({
    mutationFn: (savedResourceId) => base44.entities.SavedResource.delete(savedResourceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedResources'] })
  });

  const [selectedType, setSelectedType] = useState('all');

  const categories = [
    { value: 'all', label: t('resources.categories.all') },
    { value: 'anxiety', label: t('resources.categories.anxiety') },
    { value: 'depression', label: t('resources.categories.depression') },
    { value: 'stress', label: t('resources.categories.stress') },
    { value: 'mindfulness', label: t('resources.categories.mindfulness') },
    { value: 'relationships', label: t('resources.categories.relationships') },
    { value: 'self-esteem', label: t('resources.categories.self_esteem') },
    { value: 'sleep', label: t('resources.categories.sleep') },
    { value: 'coping_skills', label: t('resources.categories.coping_skills') },
    { value: 'emotional_regulation', label: t('resources.categories.emotional_regulation') },
    { value: 'communication', label: t('resources.categories.communication') },
    { value: 'general', label: t('resources.categories.general') }
  ];

  const contentTypes = [
    { value: 'all', label: t('resources.content_types.all') },
    { value: 'article', label: t('resources.content_types.article') },
    { value: 'meditation', label: t('resources.content_types.meditation') },
    { value: 'scenario', label: t('resources.content_types.scenario') },
    { value: 'interview', label: t('resources.content_types.interview') },
    { value: 'guide', label: t('resources.content_types.guide') },
    { value: 'video', label: t('resources.content_types.video') },
    { value: 'podcast', label: t('resources.content_types.podcast') },
    { value: 'book', label: t('resources.content_types.book') }
  ];

  const savedResourceIds = savedResources.map(sr => sr.resource_id);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const displayedResources = activeTab === 'saved' 
    ? filteredResources.filter(r => savedResourceIds.includes(r.id))
    : filteredResources;

  const handleSaveToggle = (resource) => {
    const savedResource = savedResources.find(sr => sr.resource_id === resource.id);
    if (savedResource) {
      unsaveResourceMutation.mutate(savedResource.id);
    } else {
      saveResourceMutation.mutate(resource.id);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[100dvh] bg-transparent">
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-semibold mb-2 flex items-center gap-3 text-foreground">
          <Library className="w-8 h-8 text-primary" />
          {t('resources.page_title')}
        </h1>
        <p className="text-muted-foreground">{t('resources.page_subtitle')}</p>
      </div>

      {/* AI Recommendations */}
      <AIResourceRecommendations
        moodEntries={moodEntries}
        journalEntries={journalEntries}
        resources={resources}
        onSaveResource={handleSaveToggle}
        savedResourceIds={savedResourceIds}
        userInterests={user?.preferences?.interests || []}
      />

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('resources.search_placeholder')}
            className="pl-10 h-12"
            style={{ borderRadius: '28px' }}
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2 text-foreground">{t('resources.category_label')}</p>
            <div
              data-testid="category-chips"
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch', cursor: 'pointer' }}
            >
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                  className="whitespace-nowrap flex-shrink-0 text-xs sm:text-sm rounded-[var(--radius-card)]"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2 text-foreground">{t('resources.content_type_label')}</p>
            <div
              data-testid="type-chips"
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch', cursor: 'pointer' }}
            >
              {contentTypes.map((type) => (
                <Button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  variant={selectedType === type.value ? 'default' : 'outline'}
                  size="sm"
                  className="whitespace-nowrap flex-shrink-0 text-xs sm:text-sm rounded-[var(--radius-card)]"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">{t('resources.tabs.all')}</TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            {t('resources.tabs.saved')} ({savedResources.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('resources.loading')}</p>
        </div>
      ) : displayedResources.length === 0 ? (
        <div className="text-center py-12">
          <Library className="w-16 h-16 mx-auto mb-4" style={{ color: '#A8D4CB' }} />
          <p className="mb-2" style={{ color: '#5A7A72' }}>{t('resources.empty_state.no_resources_title')}</p>
          <p className="text-sm" style={{ color: '#7A9A92' }}>{t('resources.empty_state.no_resources_message')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isSaved={savedResourceIds.includes(resource.id)}
              onSaveToggle={() => handleSaveToggle(resource)}
            />
          ))}
        </div>
      )}
    </div>
  );
}