import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2, Plus, Mail, AppWindow, Check } from 'lucide-react';
import { format } from 'date-fns';

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
    onSuccess: () => {
      queryClient.invalidateQueries(['goalReminders', goal.id]);
      setShowAddForm(false);
      setNewReminder({
        reminder_type: 'goal_deadline',
        days_before: 3,
        notification_method: 'both',
        frequency: 'once',
        active: true
      });
    }
  });

  const toggleReminder = useMutation({
    mutationFn: ({ id, active }) => base44.entities.GoalReminder.update(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['goalReminders', goal.id]);
    }
  });

  const deleteReminder = useMutation({
    mutationFn: (id) => base44.entities.GoalReminder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['goalReminders', goal.id]);
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
            <Button variant="ghost" onClick={onClose}>✕</Button>
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
                    <Select
                      value={newReminder.reminder_type}
                      onValueChange={(value) => 
                        setNewReminder({ ...newReminder, reminder_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goal_deadline">Goal Deadline</SelectItem>
                        <SelectItem value="milestone_deadline">Milestone Deadline</SelectItem>
                        <SelectItem value="weekly_checkin">Weekly Check-in</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Select
                        value={newReminder.milestone_index?.toString()}
                        onValueChange={(value) => 
                          setNewReminder({ ...newReminder, milestone_index: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose milestone..." />
                        </SelectTrigger>
                        <SelectContent>
                          {goal.milestones?.map((m, idx) => (
                            <SelectItem key={idx} value={idx.toString()}>
                              {m.title || `Step ${idx + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <Select
                      value={newReminder.notification_method}
                      onValueChange={(value) => 
                        setNewReminder({ ...newReminder, notification_method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Email + In-App</SelectItem>
                        <SelectItem value="email">Email Only</SelectItem>
                        <SelectItem value="in_app">In-App Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newReminder.reminder_type !== 'weekly_checkin' && (
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={newReminder.frequency}
                        onValueChange={(value) => 
                          setNewReminder({ ...newReminder, frequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Once</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
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