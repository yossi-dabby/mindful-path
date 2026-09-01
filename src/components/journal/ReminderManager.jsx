import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomSheetSelect from '@/components/ui/bottom-sheet-select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Bell, Clock, Trash2, Edit } from 'lucide-react';

export default function ReminderManager({ onClose }) {
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const userQuery = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me(), staleTime: 300000 });
  const userEmail = userQuery.data?.email;
  const remindersQuery = useQuery({
    queryKey: ['journalReminders', userEmail],
    queryFn: () => base44.entities.JournalReminder.filter({ created_by: userEmail }, '-created_date', 100),
    enabled: Boolean(userEmail),
    initialData: []
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.JournalReminder.update(id, { active }),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: ['journalReminders'] });
      const snapshots = queryClient.getQueriesData({ queryKey: ['journalReminders'] });
      queryClient.setQueriesData({ queryKey: ['journalReminders'] }, (old = []) =>
        Array.isArray(old) ? old.map((reminder) => reminder.id === id ? { ...reminder, active } : reminder) : old
      );
      return { snapshots };
    },
    onError: (_error, _variables, context) => context?.snapshots?.forEach(([key, value]) => queryClient.setQueryData(key, value)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['journalReminders'] })
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id) => base44.entities.JournalReminder.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['journalReminders'] });
      const snapshots = queryClient.getQueriesData({ queryKey: ['journalReminders'] });
      queryClient.setQueriesData({ queryKey: ['journalReminders'] }, (old = []) =>
        Array.isArray(old) ? old.filter((reminder) => reminder.id !== id) : old
      );
      return { snapshots };
    },
    onError: (_error, _variables, context) => context?.snapshots?.forEach(([key, value]) => queryClient.setQueryData(key, value)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['journalReminders'] })
  });

  const reminders = Array.isArray(remindersQuery.data) ? remindersQuery.data : [];
  const isLoading = userQuery.isLoading || remindersQuery.isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog" aria-modal="true" aria-labelledby="journal-reminders-title" aria-describedby="journal-reminders-description">
      <Card className="my-0 flex max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-b-none rounded-t-[28px] border-white/70 bg-white/95 shadow-2xl sm:my-8 sm:max-h-[calc(100dvh-4rem)] sm:rounded-[28px]">
        <CardHeader className="shrink-0 border-b border-teal-100 bg-teal-50/70 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle id="journal-reminders-title" className="flex items-center gap-2 text-xl font-bold text-teal-950 sm:text-2xl">
                <Bell className="h-5 w-5 text-teal-700" />{t('journal_ui.reminders.title')}
              </CardTitle>
              <p id="journal-reminders-description" className="mt-1 text-sm text-slate-600">{t('journal_ui.reminders.description')}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="min-h-11 min-w-11 rounded-full" aria-label={t('journal_ui.common.close_aria')}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-6">
          {!showCreateForm && !editingReminder ? (
            <div className="space-y-4">
              <Button onClick={() => setShowCreateForm(true)} className="min-h-12 w-full rounded-2xl bg-teal-700 text-white hover:bg-teal-800">
                <Plus className="h-4 w-4" />{t('journal_ui.reminders.create')}
              </Button>
              {isLoading ? (
                <div className="py-10 text-center" role="status">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
                  <p className="mt-3 text-sm text-slate-600">{t('journal_ui.reminders.loading')}</p>
                </div>
              ) : reminders.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="mx-auto mb-3 h-12 w-12 text-teal-200" />
                  <p className="font-semibold text-teal-950">{t('journal_ui.reminders.empty')}</p>
                  <p className="mt-1 text-sm text-slate-500">{t('journal_ui.reminders.empty_description')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <Card key={reminder.id} className="border-teal-100 bg-white/90 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="break-words font-bold text-teal-950">{reminder.title}</h3>
                              <Badge variant="outline" className="rounded-full text-xs">
                                {reminder.entry_type === 'any' ? t('journal_ui.reminders.any') : t(`journal.filters.entry_types.${reminder.entry_type}`, { defaultValue: reminder.entry_type })}
                              </Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{reminder.time}</span>
                              <span>{t(`journal_ui.reminders.${reminder.frequency}`, { defaultValue: reminder.frequency })}</span>
                            </div>
                            {reminder.message && <p className="mt-2 break-words text-sm text-slate-600" dir="auto">{reminder.message}</p>}
                          </div>
                          <div className="flex items-center justify-end gap-1">
                            <Switch checked={Boolean(reminder.active)} onCheckedChange={(active) => toggleActiveMutation.mutate({ id: reminder.id, active })}
                              aria-label={t('journal_ui.reminders.active_aria', { title: reminder.title })} />
                            <Button variant="ghost" size="icon" className="min-h-11 min-w-11 rounded-full" onClick={() => setEditingReminder(reminder)}
                              aria-label={t('journal_ui.common.edit_aria', { item: t('journal_ui.reminders.item') })}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="min-h-11 min-w-11 rounded-full text-red-600" onClick={() => {
                              if (window.confirm(t('journal_ui.reminders.delete_confirm'))) deleteReminderMutation.mutate(reminder.id);
                            }} aria-label={t('journal_ui.common.delete_aria', { item: t('journal_ui.reminders.item') })}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ReminderForm reminder={editingReminder} t={t}
              onClose={() => { setShowCreateForm(false); setEditingReminder(null); }}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['journalReminders'] });
                setShowCreateForm(false);
                setEditingReminder(null);
              }} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReminderForm({ reminder, onClose, onSuccess, t }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(reminder || { title: '', entry_type: 'any', frequency: 'daily', time: '09:00', message: '', active: true });
  const saveMutation = useMutation({
    mutationFn: (data) => reminder ? base44.entities.JournalReminder.update(reminder.id, data) : base44.entities.JournalReminder.create(data),
    onSuccess,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['journalReminders'] })
  });
  const typeOptions = [
    { value: 'any', label: t('journal_ui.reminders.any') },
    ...['cbt_standard', 'gratitude', 'anxiety_log', 'mood_journal'].map((value) => ({ value, label: t(`journal.filters.entry_types.${value}`) }))
  ];
  const frequencyOptions = ['daily', 'weekly'].map((value) => ({ value, label: t(`journal_ui.reminders.${value}`) }));

  return (
    <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(formData); }}>
      <div>
        <label htmlFor="journal-reminder-title" className="mb-2 block text-sm font-semibold text-teal-950">{t('journal_ui.reminders.title_label')}</label>
        <Input id="journal-reminder-title" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })}
          placeholder={t('journal_ui.reminders.title_placeholder')} className="h-12 rounded-xl" autoFocus />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-teal-950">{t('journal_ui.reminders.type')}</label>
          <BottomSheetSelect value={formData.entry_type} onValueChange={(entry_type) => setFormData({ ...formData, entry_type })}
            options={typeOptions} title={t('journal_ui.reminders.type')} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-teal-950">{t('journal_ui.reminders.frequency')}</label>
          <BottomSheetSelect value={formData.frequency} onValueChange={(frequency) => setFormData({ ...formData, frequency })}
            options={frequencyOptions} title={t('journal_ui.reminders.frequency')} />
        </div>
      </div>
      <div>
        <label htmlFor="journal-reminder-time" className="mb-2 block text-sm font-semibold text-teal-950">{t('journal_ui.reminders.time')}</label>
        <Input id="journal-reminder-time" type="time" value={formData.time} onChange={(event) => setFormData({ ...formData, time: event.target.value })}
          className="h-12 rounded-xl" />
      </div>
      <div>
        <label htmlFor="journal-reminder-message" className="mb-2 block text-sm font-semibold text-teal-950">{t('journal_ui.reminders.message')}</label>
        <Input id="journal-reminder-message" value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })}
          placeholder={t('journal_ui.reminders.message_placeholder')} className="h-12 rounded-xl" />
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button type="button" onClick={onClose} variant="outline" className="min-h-12 flex-1 rounded-xl">{t('journal_ui.common.cancel')}</Button>
        <Button type="submit" disabled={!formData.title.trim() || !formData.time || saveMutation.isPending}
          className="min-h-12 flex-1 rounded-xl bg-teal-700 text-white hover:bg-teal-800">
          {saveMutation.isPending ? t('journal_ui.common.saving') : reminder ? t('journal_ui.common.update') : t('journal_ui.common.create')}
        </Button>
      </div>
    </form>
  );
}
