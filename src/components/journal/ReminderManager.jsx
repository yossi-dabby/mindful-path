import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Bell, Clock, Trash2, Edit } from 'lucide-react';

export default function ReminderManager({ onClose }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const queryClient = useQueryClient();

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['journalReminders'],
    queryFn: () => base44.entities.JournalReminder.list('-created_date'),
    initialData: []
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.JournalReminder.update(id, { active }),
    onSuccess: () => queryClient.invalidateQueries(['journalReminders'])
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id) => base44.entities.JournalReminder.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['journalReminders'])
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border-0 shadow-2xl my-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Journal Reminders
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Set reminders for different types of journaling
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!showCreateForm && !editingReminder ? (
            <div className="space-y-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Reminder
              </Button>

              {isLoading ? (
                <p className="text-center text-gray-500 py-8">Loading reminders...</p>
              ) : reminders.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reminders yet</p>
                  <p className="text-sm text-gray-400 mt-1">Create your first reminder to stay consistent</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <Card key={reminder.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-800">{reminder.title}</h3>
                              <Badge variant="outline" className="text-xs capitalize">
                                {reminder.entry_type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {reminder.time}
                              </div>
                              <span className="capitalize">{reminder.frequency}</span>
                            </div>
                            {reminder.message && (
                              <p className="text-sm text-gray-600 mt-2">{reminder.message}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={reminder.active}
                              onCheckedChange={(checked) =>
                                toggleActiveMutation.mutate({ id: reminder.id, active: checked })
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingReminder(reminder)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => {
                                if (confirm('Delete this reminder?')) {
                                  deleteReminderMutation.mutate(reminder.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ReminderForm
              reminder={editingReminder}
              onClose={() => {
                setShowCreateForm(false);
                setEditingReminder(null);
              }}
              onSuccess={() => {
                queryClient.invalidateQueries(['journalReminders']);
                setShowCreateForm(false);
                setEditingReminder(null);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReminderForm({ reminder, onClose, onSuccess }) {
  const [formData, setFormData] = useState(
    reminder || {
      title: '',
      entry_type: 'any',
      frequency: 'daily',
      time: '09:00',
      message: '',
      active: true
    }
  );

  const saveMutation = useMutation({
    mutationFn: (data) =>
      reminder
        ? base44.entities.JournalReminder.update(reminder.id, data)
        : base44.entities.JournalReminder.create(data),
    onSuccess
  });

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Reminder Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Evening Gratitude"
          className="rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Journal Type</label>
          <Select
            value={formData.entry_type}
            onValueChange={(value) => setFormData({ ...formData, entry_type: value })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Type</SelectItem>
              <SelectItem value="cbt_standard">CBT Standard</SelectItem>
              <SelectItem value="gratitude">Gratitude</SelectItem>
              <SelectItem value="anxiety_log">Anxiety Log</SelectItem>
              <SelectItem value="mood_journal">Mood Journal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Frequency</label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData({ ...formData, frequency: value })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Time</label>
        <Input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="rounded-xl"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Custom Message (optional)
        </label>
        <Input
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="e.g., Time to reflect on your day"
          className="rounded-xl"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={onClose} variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={() => saveMutation.mutate(formData)}
          disabled={!formData.title || !formData.time || saveMutation.isPending}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          {saveMutation.isPending ? 'Saving...' : reminder ? 'Update' : 'Create'} Reminder
        </Button>
      </div>
    </div>
  );
}