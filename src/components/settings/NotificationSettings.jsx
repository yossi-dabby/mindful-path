import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Target, Dumbbell, TrendingUp, Calendar, Flame, AtSign, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const IN_APP_PREFS = [
  { key: 'dailyReminders', label: 'Daily Check-in Reminders', description: 'Remind you to do your daily mood check-in', icon: Calendar, color: '#FF9800' },
  { key: 'progressUpdates', label: 'Progress & Streak Updates', description: 'Celebrate milestones and streak achievements', icon: Flame, color: '#FF5722' },
  { key: 'goalReminders', label: 'Goal Reminders', description: 'Stay on track with your active goals', icon: Target, color: '#26A69A' },
  { key: 'exerciseReminders', label: 'Exercise Reminders', description: 'Gentle nudges to practice CBT exercises', icon: Dumbbell, color: '#9F7AEA' }
];

const EMAIL_PREFS = [
  { key: 'emailCritical', label: 'Critical System Alerts', description: 'Important account or security notices', icon: AlertCircle, color: '#E53E3E', alwaysOn: true },
  { key: 'emailMentions', label: 'Mentions & Replies', description: 'When someone replies to your forum post', icon: AtSign, color: '#E91E63' },
  { key: 'dailyReminders', label: 'Daily Reminder Emails', description: 'Email version of your daily check-in reminder', icon: Calendar, color: '#FF9800' },
  { key: 'progressUpdates', label: 'Progress Digest', description: 'Weekly summary of your progress via email', icon: TrendingUp, color: '#4CAF50' },
  { key: 'goalReminders', label: 'Goal Reminder Emails', description: 'Email reminders for upcoming goal deadlines', icon: Target, color: '#26A69A' },
  { key: 'exerciseReminders', label: 'Exercise Reminder Emails', description: 'Email nudges to practice exercises', icon: Dumbbell, color: '#9F7AEA' }
];

function PrefRow({ pref, checked, onChange, disabled }) {
  const Icon = pref.icon;
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${pref.color}18` }}>
          <Icon className="w-4 h-4" style={{ color: pref.color }} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800">{pref.label}</p>
            {pref.alwaysOn && <Badge className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0">Always on</Badge>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{pref.description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

export default function NotificationSettings({ notifications, emailNotifications, onToggleInApp, onToggleEmail }) {
  return (
    <div className="space-y-6">
      {/* In-App Notifications */}
      <Card className="border-0" style={{
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 3px 12px rgba(38, 166, 154, 0.1), 0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-5 h-5 text-teal-600" />
            In-App Notifications
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">Choose what appears in your notification bell</p>
        </CardHeader>
        <CardContent className="p-6 divide-y divide-gray-100">
          {IN_APP_PREFS.map(pref => (
            <PrefRow
              key={pref.key}
              pref={pref}
              checked={!!notifications[pref.key]}
              onChange={() => onToggleInApp(pref.key)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="border-0" style={{
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 3px 12px rgba(38, 166, 154, 0.1), 0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="w-5 h-5 text-blue-500" />
            Email Notifications
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">Control which events also send an email to your inbox</p>
        </CardHeader>
        <CardContent className="p-6 divide-y divide-gray-100">
          {EMAIL_PREFS.map(pref => (
            <PrefRow
              key={pref.key}
              pref={pref}
              checked={pref.alwaysOn ? true : !!emailNotifications[pref.key]}
              onChange={() => !pref.alwaysOn && onToggleEmail(pref.key)}
              disabled={pref.alwaysOn}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}