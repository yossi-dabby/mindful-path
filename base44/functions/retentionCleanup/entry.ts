import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Data Retention Cleanup Function
 * 
 * Runs on demand or periodically to delete/archive old data based on user retention settings.
 * Non-blocking: logs cleanup progress and continues even if individual deletions fail.
 * 
 * Triggered by:
 * - App initialization (if last cleanup > 24 hours ago)
 * - Manual trigger from Settings page
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const retentionDays = user.preferences?.data_retention_days || 365;
    
    // Skip cleanup if set to indefinite
    if (retentionDays === 999999) {
      return Response.json({ 
        message: 'Retention set to indefinite, skipping cleanup',
        skipped: true 
      });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffISO = cutoffDate.toISOString();

    const results = {
      deletedMoodEntries: 0,
      deletedJournalEntries: 0,
      archivedConversations: 0,
      errors: []
    };

    try {
      // Delete old mood entries
      const oldMoodEntries = await base44.entities.MoodEntry.filter(
        { created_date: { $lt: cutoffISO } },
        '-created_date',
        100
      );
      
      for (const entry of oldMoodEntries) {
        try {
          await base44.entities.MoodEntry.delete(entry.id);
          results.deletedMoodEntries++;
        } catch (error) {
          results.errors.push(`Failed to delete mood entry ${entry.id}: ${error.message}`);
        }
      }
    } catch (error) {
      results.errors.push(`Mood entry cleanup error: ${error.message}`);
    }

    try {
      // Delete old journal entries
      const oldJournalEntries = await base44.entities.ThoughtJournal.filter(
        { created_date: { $lt: cutoffISO } },
        '-created_date',
        100
      );
      
      for (const entry of oldJournalEntries) {
        try {
          await base44.entities.ThoughtJournal.delete(entry.id);
          results.deletedJournalEntries++;
        } catch (error) {
          results.errors.push(`Failed to delete journal entry ${entry.id}: ${error.message}`);
        }
      }
    } catch (error) {
      results.errors.push(`Journal entry cleanup error: ${error.message}`);
    }

    try {
      // Archive old conversations (soft delete via UserDeletedConversations)
      const allConversations = await base44.agents.listConversations({ 
        agent_name: 'cbt_therapist' 
      });
      
      const deletedConversations = await base44.entities.UserDeletedConversations.list();
      const deletedIds = new Set(deletedConversations.map(d => d.agent_conversation_id));

      for (const conv of allConversations) {
        // Only process conversations older than cutoff and not already deleted
        if (conv.created_date && new Date(conv.created_date) < cutoffDate && !deletedIds.has(conv.id)) {
          try {
            await base44.entities.UserDeletedConversations.create({
              agent_conversation_id: conv.id,
              conversation_title: conv.metadata?.name || 'Session'
            });
            results.archivedConversations++;
          } catch (error) {
            results.errors.push(`Failed to archive conversation ${conv.id}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      results.errors.push(`Conversation cleanup error: ${error.message}`);
    }

    return Response.json({
      success: true,
      retentionDays,
      cutoffDate: cutoffISO,
      ...results,
      message: `Cleanup complete: ${results.deletedMoodEntries} mood entries, ${results.deletedJournalEntries} journal entries, ${results.archivedConversations} conversations archived`
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});