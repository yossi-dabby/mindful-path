import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Target, Sparkles, TrendingUp, Heart, Brain, Users, Briefcase } from 'lucide-react';

const categoryIcons = {
  behavioral: Briefcase,
  emotional: Heart,
  social: Users,
  cognitive: Brain,
  lifestyle: TrendingUp
};

const categoryColors = {
  behavioral: 'bg-blue-100 text-blue-800',
  emotional: 'bg-pink-100 text-pink-800',
  social: 'bg-purple-100 text-purple-800',
  cognitive: 'bg-indigo-100 text-indigo-800',
  lifestyle: 'bg-green-100 text-green-800'
};

export default function GoalTemplateLibrary({ onSelectTemplate, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['goalTemplates'],
    queryFn: async () => {
      const result = await base44.entities.GoalTemplate.list('-created_date');
      return Array.isArray(result) 
        ? result.map(t => ({
            ...t,
            ...t.data,
            id: t.id
          }))
        : [];
    }
  });

  const categories = [
    { value: 'all', label: 'All Templates', icon: Target },
    { value: 'lifestyle', label: 'Health & Habits', icon: TrendingUp },
    { value: 'cognitive', label: 'Study & Work', icon: Brain },
    { value: 'emotional', label: 'Emotional Growth', icon: Heart },
    { value: 'social', label: 'Relationships', icon: Users },
    { value: 'behavioral', label: 'Behavior Change', icon: Briefcase }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const popularTemplates = templates.filter(t => t.is_popular);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto border-0" style={{
        borderRadius: '32px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.95) 100%)'
      }}>
        <CardHeader className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm" style={{ borderRadius: '32px 32px 0 0' }}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold" style={{ color: '#1A3A34' }}>
                Goal Template Library
              </CardTitle>
              <p className="text-sm mt-1" style={{ color: '#5A7A72' }}>
                Choose a template to get started or customize your own
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="whitespace-nowrap"
                  style={selectedCategory === cat.value ? {
                    backgroundColor: '#26A69A',
                    color: 'white'
                  } : {}}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {cat.label}
                </Button>
              );
            })}
          </div>

          {/* Popular Templates */}
          {selectedCategory === 'all' && popularTemplates.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" style={{ color: '#26A69A' }} />
                <h3 className="text-lg font-semibold" style={{ color: '#1A3A34' }}>
                  Popular Templates
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => onSelectTemplate(template)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          <div>
            {selectedCategory === 'all' && (
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A3A34' }}>
                All Templates
              </h3>
            )}
            
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading templates...</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No templates found in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => onSelectTemplate(template)}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TemplateCard({ template, onSelect }) {
  const Icon = categoryIcons[template.category] || Target;
  
  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer border-0" style={{
      borderRadius: '24px',
      background: 'white'
    }} onClick={onSelect}>
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{
            background: 'rgba(38, 166, 154, 0.1)'
          }}>
            <Icon className="w-5 h-5" style={{ color: '#26A69A' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {template.title}
            </h4>
            <Badge className={categoryColors[template.category]} variant="outline">
              {template.category}
            </Badge>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {template.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{template.duration_weeks} weeks</span>
          <Badge variant="outline" className="text-xs">
            {template.difficulty}
          </Badge>
        </div>

        {template.is_popular && (
          <div className="mt-3 flex items-center gap-1 text-xs" style={{ color: '#26A69A' }}>
            <Sparkles className="w-3 h-3" />
            <span>Popular choice</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}