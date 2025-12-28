import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

export default function ProgressShareForm({ onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    progress_type: 'general_update',
    is_anonymous: true,
    metrics: {}
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const postData = {
        ...data,
        author_display_name: data.is_anonymous ? 'Anonymous' : user.full_name
      };
      return base44.entities.SharedProgress.create(postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sharedProgress']);
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-0 shadow-2xl my-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Share Your Progress</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Completed my first week of meditation!"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Your Story</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share your achievement and inspire others..."
                className="rounded-xl h-32"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Progress Type</label>
              <Select
                value={formData.progress_type}
                onValueChange={(value) => setFormData({ ...formData, progress_type: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goal_completed">Goal Completed</SelectItem>
                  <SelectItem value="milestone_reached">Milestone Reached</SelectItem>
                  <SelectItem value="streak_achievement">Streak Achievement</SelectItem>
                  <SelectItem value="mood_improvement">Mood Improvement</SelectItem>
                  <SelectItem value="exercise_completion">Exercise Completion</SelectItem>
                  <SelectItem value="general_update">General Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">Share Anonymously</p>
                <p className="text-sm text-gray-500">Your identity will be protected</p>
              </div>
              <Switch
                checked={formData.is_anonymous}
                onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700">
              💡 Tip: Your progress can inspire others on their journey. All personal details are automatically anonymized.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.title || !formData.content || createMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {createMutation.isPending ? 'Sharing...' : 'Share Progress'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}