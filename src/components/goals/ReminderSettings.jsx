import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BottomSheetSelect from '@/components/ui/bottom-sheet-select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2, Plus, Mail, AppWindow, Check } from 'lucide-react';
import { format } from 'date-fns';

const REMINDER_TYPE_OPTIONS = [
  { value: 'goal_deadline', label: 'Goal Deadline' },
  { value: 'milestone_deadline', label: 'Milestone Deadline' },
  { value: 'weekly_checkin', label: 'Weekly Check-in' },
  { value: 'custom', label: 'Custom' },
];

const NOTIFICATION_METHOD_OPTIONS = [
  { value: 'both', label: 'Email + In-App' },
  { value: 'email', label: 'Email Only' },
  { value: 'in_app', label: 'In-App Only' },
];

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function ReminderSettings({ goal, onClose }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    reminder_type: 'goal_deadline',
    days_before: 3,
    notification_method: 'both',
    frequency: 'once',
    active: true
  });

  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['goalReminders', goal.id],
    queryFn: () => base44.entities.GoalReminder.filter({ goal_id: goal.id })
  });

  const createReminder = useMutation({
    mutationFn: (data) => base44.entities.GoalReminder.create({
      ...data,
      goal_id: goal.id
    }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['goalReminders', goal.id] });
      const previousReminders = queryClient.getQueryData(['goalReminders', goal.id]);
      queryClient.setQueryData(['goalReminders', goal.id], (old = []) => [{
        ...data,
        goal_id: goal.id,
        id: `temp-${Date.now()}`
      }, ...old]);
      return { previousReminders };
    },
    onSuccess: () => {
      setShowAddForm(false);
      setNewReminder({
        reminder_type: 'goal_deadline',
        days_before: 3,
        notification_method: 'both',
        frequency: 'once',
        active: true
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previousReminders) {
        queryClient.setQueryData(['goalReminders', goal.id], context.previousReminders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goalReminders', goal.id] });
    }
  });

  const toggleReminder = useMutation({
    mutationFn: ({ id, active }) => base44.entities.GoalReminder.update(id, { active }),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: ['goalReminders', goal.id] });
      const previousReminders = queryClient.getQueryData(['goalReminders', goal.id]);
      queryClient.setQueryData(['goalReminders', goal.id], (old = []) =>
        old.map((reminder) => reminder.id === id ? { ...reminder, active } : reminder)
      );
      return { previousReminders };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousReminders) {
        queryClient.setQueryData(['goalReminders', goal.id], context.previousReminders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goalReminders', goal.id] });
    }
  });

  const deleteReminder = useMutation({
    mutationFn: (id) => base44.entities.GoalReminder.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['goalReminders', goal.id] });
      const previousReminders = queryClient.getQueryData(['goalReminders', goal.id]);
      queryClient.setQueryData(['goalReminders', goal.id], (old = []) => old.filter((reminder) => reminder.id !== id));
      return { previousReminders };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousReminders) {
        queryClient.setQueryData(['goalReminders', goal.id], context.previousReminders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goalReminders', goal.id] });
    }
  });

  const handleAddReminder = () => {
    const reminderData = { ...newReminder };
    
    if (newReminder.reminder_type === 'weekly_checkin') {
      reminderData.frequency = 'weekly';
      delete reminderData.days_before;
    }
    
    createReminder.mutate(reminderData);
  };

  const getReminderTypeLabel = (type) => {
    const labels = {
      goal_deadline: 'Goal Deadline',
      milestone_deadline: 'Milestone Deadline',
      weekly_checkin: 'Weekly Check-in',
      custom: 'Custom'
    };
    return labels[type] || type;
  };

  const getMethodIcon = (method) => {
    if (method === 'email') return <Mail className="w-3 h-3" />;
    if (method === 'in_app') return <AppWindow className="w-3 h-3" />;
    return <><Mail className="w-3 h-3" /><AppWindow className="w-3 h-3" /></>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Goal Reminders
            </CardTitle>
            <Button variant="ghost" aria-label="Close" onClick={onClose}>✕</Button>
          </div>
          <p className="text-sm text-gray-600">
            Set up reminders for "{goal.title}"
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading reminders...</p>
          ) : (
            <>
              {reminders.length > 0 && (
                <div className="space-y-2">
                  {reminders.map((reminder) => (
                    <div 
                      key={reminder.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {getReminderTypeLabel(reminder.reminder_type)}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            {getMethodIcon(reminder.notification_method)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {reminder.reminder_type === 'goal_deadline' && 
                            `${reminder.days_before} days before deadline`}
                          {reminder.reminder_type === 'milestone_deadline' && 
                            `${reminder.days_before} days before milestone`}
                          {reminder.reminder_type === 'weekly_checkin' && 
                            'Every week'}
                          {reminder.reminder_type === 'custom' && 
                            reminder.custom_message?.substring(0, 50)}
                        </p>
                        {reminder.last_sent && (
                          <p className="text-xs text-gray-400 mt-1">
                            Last sent: {format(new Date(reminder.last_sent), 'MMM d, h:mm a')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reminder.active}
                          onCheckedChange={(active) => 
                            toggleReminder.mutate({ id: reminder.id, active })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Delete this reminder?')) {
                              deleteReminder.mutate(reminder.id);
                            }
                          }}
                          aria-label="Delete reminder"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showAddForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder
                </Button>
              ) : (
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <div className="space-y-2">
                    <Label>Reminder Type</Label>
                    <BottomSheetSelect
                      value={newReminder.reminder_type}
                      onValueChange={(value) => 
                        setNewReminder({ ...newReminder, reminder_type: value })
                      }
                      options={REMINDER_TYPE_OPTIONS}
                      title="Reminder Type"
                    />
                  </div>

                  {(newReminder.reminder_type === 'goal_deadline' || 
                    newReminder.reminder_type === 'milestone_deadline') && (
                    <div className="space-y-2">
                      <Label>Days Before Deadline</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newReminder.days_before}
                        onChange={(e) => 
                          setNewReminder({ ...newReminder, days_before: parseInt(e.target.value) })
                        }
                      />
                    </div>
                  )}

                  {newReminder.reminder_type === 'milestone_deadline' && (
                    <div className="space-y-2">
                      <Label>Select Milestone</Label>
                      <BottomSheetSelect
                        value={newReminder.milestone_index?.toString()}
                        onValueChange={(value) => 
                          setNewReminder({ ...newReminder, milestone_index: parseInt(value) })
                        }
                        options={(goal.milestones || []).map((m, idx) => ({
                          value: idx.toString(),
                          label: m.title || `Step ${idx + 1}`,
                        }))}
                        placeholder="Choose milestone…"
                        title="Select Milestone"
                      />
                    </div>
                  )}

                  {newReminder.reminder_type === 'custom' && (
                    <div className="space-y-2">
                      <Label>Custom Message</Label>
                      <Input
                        placeholder="Enter your reminder message..."
                        value={newReminder.custom_message || ''}
                        onChange={(e) => 
                          setNewReminder({ ...newReminder, custom_message: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Send Via</Label>
                    <BottomSheetSelect
                      value={newReminder.notification_method}
                      onValueChange={(value) => 
                        setNewReminder({ ...newReminder, notification_method: value })
                      }
                      options={NOTIFICATION_METHOD_OPTIONS}
                      title="Notification Method"
                    />
                  </div>

                  {newReminder.reminder_type !== 'weekly_checkin' && (
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <BottomSheetSelect
                        value={newReminder.frequency}
                        onValueChange={(value) => 
                          setNewReminder({ ...newReminder, frequency: value })
                        }
                        options={FREQUENCY_OPTIONS}
                        title="Reminder Frequency"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddReminder}
                      disabled={createReminder.isPending}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Create Reminder
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}