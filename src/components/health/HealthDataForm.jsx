import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomSheetSelect from '@/components/ui/bottom-sheet-select';
import { useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { X, Activity, Moon, Heart, Droplet } from 'lucide-react';

const sleepQualityOptions = [
  { value: 'poor', label: 'Poor' },
  { value: 'fair', label: 'Fair' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
];

export default function HealthDataForm({ metric, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(
    metric || {
      date: new Date().toISOString().split('T')[0],
      sleep_hours: '',
      sleep_quality: '',
      steps: '',
      active_minutes: '',
      heart_rate_avg: '',
      heart_rate_resting: '',
      exercise_type: '',
      exercise_duration: '',
      water_intake: '',
      caffeine_mg: '',
      source: 'manual',
      notes: ''
    }
  );

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== '' && v !== null)
      );
      return metric
        ? base44.entities.HealthMetric.update(metric.id, cleanData)
        : base44.entities.HealthMetric.create(cleanData);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['healthMetrics'] });
      const previousHealthMetrics = queryClient.getQueryData(['healthMetrics']);
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== '' && v !== null)
      );
      const optimisticEntry = {
        ...(metric || {}),
        ...cleanData,
        id: metric?.id || `temp-${Date.now()}`,
        created_date: metric?.created_date || new Date().toISOString()
      };
      queryClient.setQueryData(['healthMetrics'], (old = []) =>
        metric ? old.map((item) => item.id === metric.id ? optimisticEntry : item) : [optimisticEntry, ...old]
      );
      return { previousHealthMetrics };
    },
    onSuccess: () => {
      onClose();
    },
    onError: (_error, _variables, context) => {
      if (context?.previousHealthMetrics) {
        queryClient.setQueryData(['healthMetrics'], context.previousHealthMetrics);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['healthMetrics'] });
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-0 shadow-2xl my-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Log Health Data</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="rounded-xl"
              />
            </div>

            {/* Sleep */}
            <div className="bg-purple-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-600" />
                Sleep
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Hours</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.sleep_hours}
                    onChange={(e) => setFormData({ ...formData, sleep_hours: parseFloat(e.target.value) })}
                    placeholder="7.5"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Quality</label>
                  <BottomSheetSelect
                   value={formData.sleep_quality}
                   onValueChange={(value) => setFormData({ ...formData, sleep_quality: value })}
                   options={sleepQualityOptions}
                   title="Sleep Quality"
                   placeholder="Select"
                  />
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="bg-green-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Physical Activity
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Steps</label>
                  <Input
                    type="number"
                    value={formData.steps}
                    onChange={(e) => setFormData({ ...formData, steps: parseInt(e.target.value) })}
                    placeholder="10000"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Active Minutes</label>
                  <Input
                    type="number"
                    value={formData.active_minutes}
                    onChange={(e) => setFormData({ ...formData, active_minutes: parseInt(e.target.value) })}
                    placeholder="30"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Exercise Type</label>
                  <Input
                    value={formData.exercise_type}
                    onChange={(e) => setFormData({ ...formData, exercise_type: e.target.value })}
                    placeholder="Running, Yoga, etc."
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Duration (min)</label>
                  <Input
                    type="number"
                    value={formData.exercise_duration}
                    onChange={(e) => setFormData({ ...formData, exercise_duration: parseInt(e.target.value) })}
                    placeholder="45"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="bg-red-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Heart Rate
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Average (bpm)</label>
                  <Input
                    type="number"
                    value={formData.heart_rate_avg}
                    onChange={(e) => setFormData({ ...formData, heart_rate_avg: parseInt(e.target.value) })}
                    placeholder="70"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Resting (bpm)</label>
                  <Input
                    type="number"
                    value={formData.heart_rate_resting}
                    onChange={(e) => setFormData({ ...formData, heart_rate_resting: parseInt(e.target.value) })}
                    placeholder="60"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Other */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-blue-600" />
                Nutrition & Wellness
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Water (ml)</label>
                  <Input
                    type="number"
                    value={formData.water_intake}
                    onChange={(e) => setFormData({ ...formData, water_intake: parseInt(e.target.value) })}
                    placeholder="2000"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Caffeine (mg)</label>
                  <Input
                    type="number"
                    value={formData.caffeine_mg}
                    onChange={(e) => setFormData({ ...formData, caffeine_mg: parseInt(e.target.value) })}
                    placeholder="100"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="rounded-xl h-20"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => saveMutation.mutate(formData)}
                disabled={saveMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}