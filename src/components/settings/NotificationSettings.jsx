import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Target, Dumbbell, TrendingUp, Calendar, Flame, AtSign, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

function PrefRow({ pref, checked, onChange, disabled, alwaysOnLabel }) {
  const Icon = pref.icon;

  return (
    <div className="flex min-h-[76px] items-center justify-between gap-3 py-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: pref.backgroundColor }}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" style={{ color: pref.color }} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold leading-5 text-slate-800">{pref.label}</p>
            {pref.alwaysOn && (
              <Badge className="border-0 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {alwaysOnLabel}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{pref.description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={pref.label}
        className="shrink-0"
      />
    </div>
  );
}

export default function NotificationSettings({ notifications, emailNotifications, onToggleInApp, onToggleEmail }) {
  const { t } = useTranslation();

  const inAppPrefs = [
    {
      key: 'dailyReminders',
      label: t('settings.notifications.daily_title'),
      description: t('settings.notifications.daily_description'),
      icon: Calendar,
      color: '#D97706',
      backgroundColor: 'rgba(245,158,11,0.13)'
    },
    {
      key: 'progressUpdates',
      label: t('settings.notifications.progress_title'),
      description: t('settings.notifications.progress_description'),
      icon: Flame,
      color: '#EA580C',
      backgroundColor: 'rgba(249,115,22,0.12)'
    },
    {
      key: 'goalReminders',
      label: t('settings.notifications.goal_title'),
      description: t('settings.notifications.goal_description'),
      icon: Target,
      color: '#0F766E',
      backgroundColor: 'rgba(13,148,136,0.12)'
    },
    {
      key: 'exerciseReminders',
      label: t('settings.notifications.exercise_title'),
      description: t('settings.notifications.exercise_description'),
      icon: Dumbbell,
      color: '#7C3AED',
      backgroundColor: 'rgba(124,58,237,0.11)'
    }
  ];

  const emailPrefs = [
    {
      key: 'emailCritical',
      label: t('settings.notifications.critical_title'),
      description: t('settings.notifications.critical_description'),
      icon: AlertCircle,
      color: '#DC2626',
      backgroundColor: 'rgba(220,38,38,0.10)',
      alwaysOn: true
    },
    {
      key: 'emailMentions',
      label: t('settings.notifications.mentions_title'),
      description: t('settings.notifications.mentions_description'),
      icon: AtSign,
      color: '#DB2777',
      backgroundColor: 'rgba(219,39,119,0.10)'
    },
    {
      key: 'dailyReminders',
      label: t('settings.notifications.email_daily_title'),
      description: t('settings.notifications.daily_description'),
      icon: Calendar,
      color: '#D97706',
      backgroundColor: 'rgba(245,158,11,0.13)'
    },
    {
      key: 'progressUpdates',
      label: t('settings.notifications.email_progress_title'),
      description: t('settings.notifications.email_progress_description'),
      icon: TrendingUp,
      color: '#15803D',
      backgroundColor: 'rgba(22,163,74,0.11)'
    },
    {
      key: 'goalReminders',
      label: t('settings.notifications.email_goal_title'),
      description: t('settings.notifications.goal_description'),
      icon: Target,
      color: '#0F766E',
      backgroundColor: 'rgba(13,148,136,0.12)'
    },
    {
      key: 'exerciseReminders',
      label: t('settings.notifications.email_exercise_title'),
      description: t('settings.notifications.exercise_description'),
      icon: Dumbbell,
      color: '#7C3AED',
      backgroundColor: 'rgba(124,58,237,0.11)'
    }
  ];

  const groups = [
    {
      id: 'in-app-notifications',
      icon: Bell,
      iconClass: 'bg-teal-100 text-teal-700',
      title: t('settings.notifications.in_app_title'),
      description: t('settings.notifications.in_app_description'),
      prefs: inAppPrefs,
      values: notifications,
      onToggle: onToggleInApp
    },
    {
      id: 'email-notifications',
      icon: Mail,
      iconClass: 'bg-sky-100 text-sky-700',
      title: t('settings.notifications.email_title'),
      description: t('settings.notifications.email_description'),
      prefs: emailPrefs,
      values: emailNotifications,
      onToggle: onToggleEmail
    }
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-2" data-testid="notification-settings">
      {groups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <Card
            key={group.id}
            className="settings-surface overflow-hidden border border-white/80 bg-white/80 shadow-[0_16px_50px_rgba(15,118,110,0.10)] backdrop-blur-xl"
          >
            <CardHeader className="border-b border-teal-100/80 p-5 sm:p-6">
              <CardTitle className="flex items-start gap-3 text-base sm:text-lg">
                <span className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ' + group.iconClass}>
                  <GroupIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-slate-800">{group.title}</span>
                  <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{group.description}</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 px-5 py-0 sm:px-6">
              {group.prefs.map((pref) => (
                <PrefRow
                  key={pref.key}
                  pref={pref}
                  checked={pref.alwaysOn ? true : !!group.values[pref.key]}
                  onChange={() => !pref.alwaysOn && group.onToggle(pref.key)}
                  disabled={pref.alwaysOn}
                  alwaysOnLabel={t('settings.notifications.always_on')}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
