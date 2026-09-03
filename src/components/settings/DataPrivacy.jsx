import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BottomSheetSelect from '@/components/ui/bottom-sheet-select';
import { Shield, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function DataPrivacy({ user }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [retentionDays, setRetentionDays] = useState(user?.preferences?.data_retention_days || 365);
  const [exportingData, setExportingData] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const retentionOptions = [
    { value: '30', label: t('settings.data_privacy.retention_30_days') },
    { value: '90', label: t('settings.data_privacy.retention_90_days') },
    { value: '365', label: t('settings.data_privacy.retention_1_year') },
    { value: '999999', label: t('settings.data_privacy.retention_indefinite') },
  ];

  const updateRetentionMutation = useMutation({
    mutationFn: (days) =>
      base44.auth.updateMe({
        preferences: {
          ...user?.preferences,
          data_retention_days: days
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setActionMessage({ type: 'success', text: t('settings.data_privacy.retention_saved') });
      setTimeout(() => setActionMessage(null), 3000);
    },
    onError: () => {
      setActionMessage({ type: 'error', text: t('settings.data_privacy.retention_failed') });
      setTimeout(() => setActionMessage(null), 3000);
    }
  });

  const handleRetentionChange = async (days) => {
    setRetentionDays(parseInt(days));
    await updateRetentionMutation.mutateAsync(parseInt(days));
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      const response = await base44.functions.invoke('exportMyData', {});
      const exportData = response?.data ?? response;

      if (!exportData || exportData.error) {
        throw new Error(exportData?.error || 'The export could not be prepared');
      }

      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindful-path-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setActionMessage({ type: 'success', text: t('settings.data_privacy.export_success') });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setActionMessage({ type: 'error', text: t('settings.data_privacy.export_failed') });
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setExportingData(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        data-testid="data-privacy-card"
        className="settings-surface overflow-hidden border border-white/80 bg-white/80 shadow-[0_16px_50px_rgba(15,118,110,0.10)] backdrop-blur-xl"
      >
        <CardHeader className="border-b border-teal-100/80 p-5 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            {t('settings.data_privacy.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Status Messages */}
          {actionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-2 p-3 rounded-lg ${
                actionMessage.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
              data-testid="data-privacy-message"
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{actionMessage.text}</span>
            </motion.div>
          )}

          {/* Data Retention */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              {t('settings.data_privacy.retention_label')}
            </label>
            <p className="text-sm text-gray-600 mb-4">
              {t('settings.data_privacy.retention_description')}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <BottomSheetSelect
                data-testid="retention-select"
                value={retentionDays.toString()}
                onValueChange={handleRetentionChange}
                options={retentionOptions}
                title={t('settings.data_privacy.retention_label')}
                className="w-full sm:w-52"
              />
              {updateRetentionMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('settings.data_privacy.current_setting', { 
                value: retentionDays === 999999 
                  ? t('settings.data_privacy.current_setting_indefinite') 
                  : t('settings.data_privacy.current_setting_days', { days: retentionDays })
              })}
            </p>
          </div>

          {/* Export Data */}
          <div className="border-t pt-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">{t('settings.data_privacy.export_title')}</label>
            <p className="text-sm text-gray-600 mb-4">
              {t('settings.data_privacy.export_description')}
            </p>
            <Button
              onClick={handleExportData}
              disabled={exportingData}
              variant="outline"
              className="min-h-[46px] w-full gap-2 rounded-xl sm:w-auto"
              data-testid="export-data-btn"
            >
              {exportingData ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exportingData ? t('settings.data_privacy.exporting') : t('settings.data_privacy.export_button')}
            </Button>
          </div>

          {/* Delete Data */}
          <div className="border-t pt-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">{t('settings.data_privacy.delete_title')}</label>
            <p className="text-sm text-gray-600 mb-4">
              {t('settings.data_privacy.delete_description')}
            </p>
            <Button
              asChild
              variant="outline"
              className="min-h-[46px] w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 sm:w-auto"
              data-testid="go-to-delete-account-btn"
            >
              <a href="#settings-account">{t('settings.data_privacy.delete_button')}</a>
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              {t('settings.data_privacy.privacy_notice')}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}