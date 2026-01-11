import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function ConversationsList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClose
}) {
  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="p-3 md:p-4 flex items-center justify-between flex-shrink-0" style={{
        borderBottom: '1px solid rgba(38, 166, 154, 0.2)'
      }}>
        <h2 className="text-base md:text-lg font-semibold truncate" style={{ color: '#1A3A34' }}>Sessions</h2>
        <div className="flex gap-2">
          <Button
            onClick={onNewConversation}
            size="icon"
            className="text-white flex-shrink-0"
            style={{
              borderRadius: '16px',
              backgroundColor: '#26A69A',
              boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)'
            }}
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Button
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="md:hidden flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(38, 166, 154, 0.3)' }} />
            <p className="text-sm" style={{ color: '#5A7A72' }}>No sessions yet</p>
            <p className="text-xs mt-1" style={{ color: '#7A9A92' }}>Start a conversation to begin</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  'group relative transition-all'
                )}
                style={{
                  borderRadius: '18px',
                  ...(currentConversationId === conversation.id ? {
                    background: 'linear-gradient(145deg, rgba(38, 166, 154, 0.15) 0%, rgba(56, 178, 172, 0.1) 100%)',
                    boxShadow: '0 4px 12px rgba(38, 166, 154, 0.2), inset 0 0 0 2px rgba(38, 166, 154, 0.3)'
                  } : {
                    background: 'rgba(255, 255, 255, 0.6)'
                  })
                }}
              >
                <button
                  onClick={() => onSelectConversation(conversation.id)}
                  className="w-full text-left p-3 flex items-start gap-3 min-w-0"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0" style={{
                    borderRadius: '16px',
                    background: 'linear-gradient(145deg, rgba(38, 166, 154, 0.15) 0%, rgba(56, 178, 172, 0.15) 100%)'
                  }}>
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#26A69A' }} />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <p className="font-medium truncate text-sm md:text-base" style={{
                      color: currentConversationId === conversation.id ? '#1A3A34' : '#3D5A52'
                    }}>
                      {conversation.metadata?.name || `Session ${conversation.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs" style={{
                      color: currentConversationId === conversation.id ? '#26A69A' : '#5A7A72'
                    }}>
                      {format(new Date(conversation.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg flex-shrink-0"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)'
                  }}
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}