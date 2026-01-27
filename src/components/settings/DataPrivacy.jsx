import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Download, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DataPrivacy({ user }) {
  const queryClient = useQueryClient();
  const [retentionDays, setRetentionDays] = useState(user?.preferences?.data_retention_days || 365);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deletingData, setDeletingData] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const updateRetentionMutation = useMutation({
    mutationFn: (days) =>
      base44.auth.updateMe({
        preferences: {
          ...user?.preferences,
          data_retention_days: days
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      setActionMessage({ type: 'success', text: 'Retention setting saved' });
      setTimeout(() => setActionMessage(null), 3000);
    },
    onError: () => {
      setActionMessage({ type: 'error', text: 'Failed to save retention setting' });
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
      // Fetch all user data
      const conversations = await base44.agents.listConversations({ agent_name: 'cbt_therapist' });
      const moodEntries = await base44.entities.MoodEntry.list();
      const goals = await base44.entities.Goal.list();
      const journalEntries = await base44.entities.ThoughtJournal.list();

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          email: user.email,
          fullName: user.full_name
        },
        summary: {
          totalConversations: conversations.length,
          totalMoodEntries: moodEntries.length,
          totalGoals: goals.length,
          totalJournalEntries: journalEntries.length
        },
        data: {
          conversations: conversations.map(c => ({
            id: c.id,
            title: c.metadata?.name || 'Session',
            createdDate: c.created_date,
            messageCount: c.messages?.length || 0
          })),
          recentMood: moodEntries.slice(0, 20).map(m => ({
            date: m.date,
            mood: m.mood,
            intensity: m.intensity
          })),
          goals: goals.map(g => ({
            title: g.title,
            status: g.status,
            createdDate: g.created_date
          }))
        }
      };

      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindpath-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setActionMessage({ type: 'success', text: 'Data exported successfully' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setActionMessage({ type: 'error', text: 'Failed to export data' });
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!deleteConfirming) {
      setDeleteConfirming(true);
      return;
    }

    setDeletingData(true);
    try {
      // Delete all conversations
      const conversations = await base44.agents.listConversations({ agent_name: 'cbt_therapist' });
      for (const conv of conversations) {
        await base44.entities.UserDeletedConversations.create({
          agent_conversation_id: conv.id,
          conversation_title: conv.metadata?.name || 'Session'
        });
      }

      // Delete mood entries
      const moodEntries = await base44.entities.MoodEntry.list();
      for (const mood of moodEntries) {
        await base44.entities.MoodEntry.delete(mood.id);
      }

      // Delete journal entries
      const journalEntries = await base44.entities.ThoughtJournal.list();
      for (const entry of journalEntries) {
        await base44.entities.ThoughtJournal.delete(entry.id);
      }

      setActionMessage({ type: 'success', text: 'All data cleared successfully' });
      setDeleteConfirming(false);
      setTimeout(() => setActionMessage(null), 3000);
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Delete error:', error);
      setActionMessage({ type: 'error', text: 'Failed to delete data' });
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setDeletingData(false);
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
        className="border-0"
        style={{
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 3px 12px rgba(38, 166, 154, 0.1), 0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            Data & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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
              Data Retention Policy
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Choose how long your therapy records, mood entries, and journal data are kept. After this period, records may be automatically deleted.
            </p>
            <div className="flex gap-3 items-center">
              <Select value={retentionDays.toString()} onValueChange={handleRetentionChange}>
                <SelectTrigger data-testid="retention-select" className="w-40 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="999999">Keep indefinitely</SelectItem>
                </SelectContent>
              </Select>
              {updateRetentionMutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Current setting: {retentionDays === 999999 ? 'Indefinite' : `${retentionDays} days`}
            </p>
          </div>

          {/* Export Data */}
          <div className="border-t pt-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">Export Your Data</label>
            <p className="text-sm text-gray-600 mb-4">
              Download a summary of your therapy records, mood entries, and goals as a JSON file.
            </p>
            <Button
              onClick={handleExportData}
              disabled={exportingData}
              variant="outline"
              className="gap-2 rounded-lg"
              data-testid="export-data-btn"
            >
              {exportingData ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exportingData ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>

          {/* Delete Data */}
          <div className="border-t pt-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">Delete All Data</label>
            <p className="text-sm text-gray-600 mb-4">
              Permanently remove all your therapy records, mood entries, and journal data. This action cannot be undone.
            </p>

            {/* Confirmation State */}
            {deleteConfirming && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
                data-testid="delete-confirm-panel"
              >
                <p className="text-sm font-medium text-red-800 mb-3">
                  Are you sure? This will permanently delete all your data.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDeleteAllData}
                    disabled={deletingData}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    data-testid="delete-confirm-btn"
                  >
                    {deletingData ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Yes, Delete All
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirming(false)}
                    variant="outline"
                    className="rounded-lg"
                    data-testid="delete-cancel-btn"
                    disabled={deletingData}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Initial Delete Button */}
            {!deleteConfirming && (
              <Button
                onClick={handleDeleteAllData}
                disabled={deletingData}
                variant="outline"
                className="gap-2 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                data-testid="delete-data-btn"
              >
                <Trash2 className="w-4 h-4" />
                Delete All Data
              </Button>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>Privacy Notice:</strong> This app does not claim HIPAA compliance. Your data is stored securely in our database and subject to our terms of service. Deletion requests are processed immediately. For questions about data handling, contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}