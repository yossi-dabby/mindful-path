import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

function ConversationsList({
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClose
}) {
  const { t } = useTranslation();
  // Ensure conversations is always an array
  const safeConversations = Array.isArray(conversations) ? conversations : [];

  return (
    <div className="rounded-2xl h-full flex flex-col min-h-0">
      {/* Header */}
      <div className="bg-teal-100 p-3 rounded-2xl md:p-4 flex items-center justify-between flex-shrink-0 border-b border-border/70">
        <h2 className="text-teal-600 text-base font-bold md:text-lg truncate">{t('chat.conversations_list.title')}</h2>
        <div className="flex gap-2">
          <Button
            onClick={onNewConversation}
            size="icon" className="bg-teal-100 text-teal-600 font-medium tracking-[0.005em] leading-none rounded-2xl inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex-shrink-0"

            aria-label={t('chat.conversations_list.new_conversation_aria')}>

            <Plus className="w-5 h-5" />
          </Button>
          <Button
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="md:hidden flex-shrink-0"
            aria-label={t('chat.conversations_list.close_list_aria')}>

            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-teal-100 p-2 rounded-2xl flex-1 overflow-y-auto min-h-0" style={{ overscrollBehavior: 'none' }}>
        {safeConversations.length === 0 ?
        <div className="bg-teal-200 px-4 py-8 text-center rounded-2xl">
            <MessageCircle className="text-teal-600 mb-3 mx-auto lucide lucide-message-circle w-12 h-12" />
            <p className="text-teal-600 text-sm font-medium">{t('chat.conversations_list.empty_title')}</p>
            <p className="text-teal-600 mt-1 text-xs font-medium">{t('chat.conversations_list.empty_message')}</p>
          </div> :

        <div className="space-y-1">
            {safeConversations.map((conversation) =>
          <div
            key={conversation.id}
            className={cn(
              'group relative transition-all rounded-[var(--radius-control)] border',
              currentConversationId === conversation.id ?
              'border-border/70 bg-card shadow-[var(--shadow-sm)]' :
              'border-transparent bg-card/55 hover:bg-secondary/60'
            )}>

                <button
              onClick={() => onSelectConversation(conversation.id)} className="bg-teal-100 text-start p-3 w-full flex items-start gap-3 min-w-0">


                  <div className="bg-teal-600 text-slate-50 rounded-[20px] w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pe-8">
                    <p className={cn(
                  "font-medium truncate text-sm md:text-base",
                  currentConversationId === conversation.id ? "text-foreground" : "text-foreground/80"
                )}>
                      {conversation.metadata?.name || `${t('chat.conversations_list.session_prefix')} ${(conversation.id || '').slice(0, 8)}`}
                    </p>
                    <p className={cn(
                  "text-xs",
                  currentConversationId === conversation.id ? "text-primary" : "text-muted-foreground"
                )}>
                      {conversation.created_date ? format(new Date(conversation.created_date), 'MMM d, h:mm a') : ''}
                    </p>
                  </div>
                </button>

                {/* Delete Button */}
                <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conversation.id);
              }}
              className="absolute end-2 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2 min-h-[44px] min-w-[44px] rounded-[var(--radius-nested)] flex-shrink-0 bg-destructive/10"
              aria-label={t('chat.conversations_list.delete_aria')}>

                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
          )}
          </div>
        }
      </div>
    </div>);

}