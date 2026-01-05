import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Bookmark, Sparkles, Library } from 'lucide-react';
import ResourceCard from '../components/resources/ResourceCard';
import AIResourceRecommendations from '../components/resources/AIResourceRecommendations';

export default function Resources() {
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
    onSuccess: () => queryClient.invalidateQueries(['savedResources'])
  });

  const unsaveResourceMutation = useMutation({
    mutationFn: (savedResourceId) => base44.entities.SavedResource.delete(savedResourceId),
    onSuccess: () => queryClient.invalidateQueries(['savedResources'])
  });

  const [selectedType, setSelectedType] = useState('all');

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'stress', label: 'Stress' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'self-esteem', label: 'Self-Esteem' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'coping_skills', label: 'Coping Skills' },
    { value: 'emotional_regulation', label: 'Emotional Regulation' },
    { value: 'communication', label: 'Communication' },
    { value: 'general', label: 'General Wellness' }
  ];

  const contentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'article', label: 'Articles' },
    { value: 'meditation', label: 'Meditations' },
    { value: 'scenario', label: 'Practice Scenarios' },
    { value: 'interview', label: 'Expert Interviews' },
    { value: 'guide', label: 'Guides' },
    { value: 'video', label: 'Videos' },
    { value: 'podcast', label: 'Podcasts' },
    { value: 'book', label: 'Books' }
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto" style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)' }}>
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-light mb-2 flex items-center gap-3" style={{ color: '#1A3A34' }}>
          <Library className="w-8 h-8" style={{ color: '#26A69A' }} />
          Resource Library
        </h1>
        <p style={{ color: '#5A7A72' }}>Curated mental health resources for your journey</p>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources, topics, tags..."
            className="pl-10 h-12"
            style={{ borderRadius: '28px' }}
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: '#1A3A34' }}>Category</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  className="text-white"
                  size="sm"
                  style={{
                    borderRadius: '24px',
                    backgroundColor: selectedCategory === cat.value ? '#26A69A' : 'transparent',
                    color: selectedCategory === cat.value ? '#fff' : '#3D5A52'
                  }}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: '#1A3A34' }}>Content Type</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {contentTypes.map((type) => (
                <Button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  variant={selectedType === type.value ? 'default' : 'outline'}
                  className="text-white"
                  size="sm"
                  style={{
                    borderRadius: '24px',
                    backgroundColor: selectedType === type.value ? '#26A69A' : 'transparent',
                    color: selectedType === type.value ? '#fff' : '#3D5A52'
                  }}
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
        <TabsList style={{
          background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)',
          borderRadius: '28px'
        }}>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Saved ({savedResources.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading resources...</p>
        </div>
      ) : displayedResources.length === 0 ? (
        <div className="text-center py-12">
          <Library className="w-16 h-16 mx-auto mb-4" style={{ color: '#A8D4CB' }} />
          <p className="mb-2" style={{ color: '#5A7A72' }}>No resources found</p>
          <p className="text-sm" style={{ color: '#7A9A92' }}>Try adjusting your search or filters</p>
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