import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Filter, MessageCircle, Brain, Target } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const surfaceIcons = {
  chat: MessageCircle,
  companion: Brain,
  coach: Target
};

const reasonLabels = {
  self_harm: 'Self-Harm',
  suicide: 'Suicide',
  overdose: 'Overdose',
  immediate_danger: 'Immediate Danger',
  general_crisis: 'General Crisis'
};

const reasonColors = {
  self_harm: 'bg-red-100 text-red-800 border-red-300',
  suicide: 'bg-red-100 text-red-800 border-red-300',
  overdose: 'bg-orange-100 text-orange-800 border-orange-300',
  immediate_danger: 'bg-red-100 text-red-800 border-red-300',
  general_crisis: 'bg-yellow-100 text-yellow-800 border-yellow-300'
};

export default function CrisisAlerts() {
  const { t } = useTranslation();

  const reasonLabels = {
    self_harm: t('crisis_alerts.reasons.self_harm'),
    suicide: t('crisis_alerts.reasons.suicide'),
    overdose: t('crisis_alerts.reasons.overdose'),
    immediate_danger: t('crisis_alerts.reasons.immediate_danger'),
    general_crisis: t('crisis_alerts.reasons.general_crisis')
  };
  const [surfaceFilter, setSurfaceFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const userIsAdmin = user?.role === 'admin';
      setIsAdmin(userIsAdmin);
      setIsAdminChecked(true);
      return user;
    }
  });

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['crisisAlerts', surfaceFilter, reasonFilter],
    queryFn: async () => {
      let query = {};
      if (surfaceFilter !== 'all') query.surface = surfaceFilter;
      if (reasonFilter !== 'all') query.reason_code = reasonFilter;
      
      const results = await base44.entities.CrisisAlert.filter(query, '-created_date', 100);
      return results;
    },
    enabled: isAdmin,
    initialData: []
  });

  if (!isAdminChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('crisis_alerts.loading_check')}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('crisis_alerts.admin_required_title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('crisis_alerts.admin_required_description')}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              {t('crisis_alerts.return_home')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh p-4 md:p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t('crisis_alerts.title')}</h1>
          </div>
          <p className="text-gray-600">
            {t('crisis_alerts.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <Card data-testid="crisis-alerts-filters" className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{t('crisis_alerts.filters_label')}</span>
              </div>
              
              <Select value={surfaceFilter} onValueChange={setSurfaceFilter}>
                <SelectTrigger data-testid="surface-filter" className="w-40">
                  <SelectValue placeholder={t('crisis_alerts.all_surfaces')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('crisis_alerts.all_surfaces')}</SelectItem>
                  <SelectItem value="chat">{t('crisis_alerts.therapist_chat')}</SelectItem>
                  <SelectItem value="companion">{t('crisis_alerts.ai_companion')}</SelectItem>
                  <SelectItem value="coach">{t('crisis_alerts.coach_chat')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger data-testid="reason-filter" className="w-40">
                  <SelectValue placeholder={t('crisis_alerts.all_reasons')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('crisis_alerts.all_reasons')}</SelectItem>
                  <SelectItem value="self_harm">{t('crisis_alerts.reasons.self_harm')}</SelectItem>
                  <SelectItem value="suicide">{t('crisis_alerts.reasons.suicide')}</SelectItem>
                  <SelectItem value="overdose">{t('crisis_alerts.reasons.overdose')}</SelectItem>
                  <SelectItem value="immediate_danger">{t('crisis_alerts.reasons.immediate_danger')}</SelectItem>
                  <SelectItem value="general_crisis">{t('crisis_alerts.reasons.general_crisis')}</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto text-sm text-gray-500">
                {t('crisis_alerts.alert_count', { count: alerts.length, unit: alerts.length === 1 ? t('crisis_alerts.alert_singular') : t('crisis_alerts.alert_plural') })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div data-testid="crisis-alerts-list" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">{t('crisis_alerts.loading_alerts')}</p>
              </CardContent>
            </Card>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('crisis_alerts.no_alerts')}</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => {
              const SurfaceIcon = surfaceIcons[alert.surface];
              return (
                <Card key={alert.id} data-testid={`alert-item-${alert.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <SurfaceIcon className="w-5 h-5 text-red-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="capitalize">
                            {alert.surface}
                          </Badge>
                          <Badge className={reasonColors[alert.reason_code]}>
                            {reasonLabels[alert.reason_code]}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">{t('crisis_alerts.time_label')}</span>{' '}
                            {format(new Date(alert.created_date), 'MMM d, yyyy h:mm a')}
                          </p>
                          <p>
                            <span className="font-medium">{t('crisis_alerts.user_label')}</span>{' '}
                            {alert.user_email}
                          </p>
                          {alert.conversation_id && alert.conversation_id !== 'none' && (
                            <p className="truncate">
                              <span className="font-medium">{t('crisis_alerts.conversation_label')}</span>{' '}
                              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                {alert.conversation_id}
                              </code>
                            </p>
                          )}
                          {alert.session_id && (
                            <p className="truncate">
                              <span className="font-medium">{t('crisis_alerts.session_label')}</span>{' '}
                              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                {alert.session_id}
                              </code>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}