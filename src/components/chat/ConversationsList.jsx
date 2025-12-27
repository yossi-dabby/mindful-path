import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function ConversationsList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onClose
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Sessions</h2>
        <div className="flex gap-2">
          <Button
            onClick={onNewConversation}
            size="icon"
            className="bg-green-600 hover:bg-green-700 rounded-xl"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Button
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No sessions yet</p>
            <p className="text-xs text-gray-400 mt-1">Start a conversation to begin</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  'w-full text-left p-3 rounded-xl transition-all',
                  currentConversationId === conversation.id
                    ? 'bg-green-100 border-2 border-green-500'
                    : 'bg-white hover:bg-gray-50 border-2 border-transparent'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {conversation.metadata?.name || `Session ${conversation.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(conversation.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}