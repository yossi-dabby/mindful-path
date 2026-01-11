import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';

export default function JournalEntriesWidget() {
  // Get recent journal entries
  const { data: recentEntries } = useQuery({
    queryKey: ['recentJournalEntries'],
    queryFn: async () => {
      const entries = await base44.entities.ThoughtJournal.list('-created_date', 3);
      return entries;
    },
    initialData: []
  });

  // Check if there's a saved journal entry from recent AI conversation
  const { data: recentConversations } = useQuery({
    queryKey: ['recentConversations'],
    queryFn: async () => {
      try {
        const conversations = await base44.agents.listConversations({ agent_name: 'cbt_therapist' });
        return conversations;
      } catch {
        return [];
      }
    },
    initialData: []
  });

  // Find the most recent conversation with saved journal metadata
  const conversationWithJournal = recentConversations.find(conv => {
    const lastMessage = conv.messages?.[conv.messages.length - 1];
    return lastMessage?.metadata?.saved_journal_entry_id;
  });

  const savedJournalEntryId = conversationWithJournal?.messages?.[
    conversationWithJournal.messages.length - 1
  ]?.metadata?.saved_journal_entry_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-0" style={{
        borderRadius: '32px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.9) 100%)',
        boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15)'
      }}>
        <CardHeader style={{ padding: '20px 24px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center" style={{
                borderRadius: '18px',
                backgroundColor: 'rgba(159, 122, 234, 0.15)'
              }}>
                <BookOpen className="w-6 h-6" style={{ color: '#9F7AEA' }} />
              </div>
              <CardTitle className="text-lg">Journal Entries</CardTitle>
            </div>
            
            {/* Show button if there's a saved journal entry from AI */}
            {savedJournalEntryId && (
              <Link to={createPageUrl('Journal', `entry=${savedJournalEntryId}`)}>
                <Button
                  size="icon"
                  className="text-white"
                  style={{
                    borderRadius: '16px',
                    backgroundColor: '#9F7AEA',
                    boxShadow: '0 4px 12px rgba(159, 122, 234, 0.3)'
                  }}
                >
                  <BookOpen className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {recentEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-4">No journal entries yet</p>
              <Link to={createPageUrl('Chat', 'intent=thought_work')}>
                <Button
                  className="text-white"
                  style={{
                    borderRadius: '16px',
                    backgroundColor: '#9F7AEA'
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start Journaling
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <Link 
                  key={entry.id} 
                  to={createPageUrl('Journal', `entry=${entry.id}`)}
                  className="block"
                >
                  <div 
                    className="p-4 rounded-2xl hover:shadow-md transition-all cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(159, 122, 234, 0.08)',
                      border: '1px solid rgba(159, 122, 234, 0.2)'
                    }}
                  >
                    <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">
                      {entry.situation || 'Thought Record'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
              
              <Link to={createPageUrl('Journal')}>
                <Button
                  variant="outline"
                  className="w-full"
                  style={{
                    borderRadius: '16px',
                    borderColor: 'rgba(159, 122, 234, 0.3)'
                  }}
                >
                  View All Entries
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}