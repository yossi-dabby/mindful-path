import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ConversationsList({
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onClose
}) {
  const { t } = useTranslation();
  const safeConversations = Array.isArray(conversations) ? conversations : [];

  const [selected, setSelected] = useState(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const allSelected = safeConversations.length > 0 && safeConversations.every(c => selected.has(c.id));
  const someSelected = selected.size > 0 && !allSelected;

  const toggleOne = (id, e) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = (e) => {
    e.stopPropagation();
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(safeConversations.map(c => c.id)));
    }
  };

  const handleBulkDelete = () => {
    selected.forEach(id => onDeleteConversation(id));
    setSelected(new Set());
    setShowBulkConfirm(false);
  };

  return (
    <>
      <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete {selected.size} session{selected.size !== 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selected.size} selected session{selected.size !== 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleBulkDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-teal-100 rounded-2xl h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-teal-100 p-3 rounded-2xl md:p-4 flex items-center justify-between flex-shrink-0 border-b border-border/70">
          {selected.size > 0 ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected; }}
                onChange={toggleAll}
                className="w-4 h-4 flex-shrink-0 accent-teal-600 cursor-pointer"
                aria-label="Select all sessions"
              />
              <span className="text-teal-600 text-sm font-medium truncate">{selected.size} selected</span>
              <button
                onClick={() => setShowBulkConfirm(true)}
                className="ms-auto flex items-center gap-1 px-2 py-1 rounded-[var(--radius-nested)] bg-destructive/10 text-red-600 text-xs font-medium flex-shrink-0 min-h-[36px] min-w-[44px]"
                aria-label={`Delete ${selected.size} selected sessions`}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {safeConversations.length > 0 && (
                <input
                  type="checkbox"
                  checked={false}
                  onChange={toggleAll}
                  className="w-4 h-4 flex-shrink-0 accent-teal-600 cursor-pointer"
                  aria-label="Select all sessions"
                />
              )}
              <h2 className="text-teal-600 text-base font-bold md:text-lg truncate">{t('chat.conversations_list.title')}</h2>
            </div>
          )}
          <div className="flex gap-2 flex-shrink-0 ms-2">
            <Button
              onClick={onNewConversation}
              size="icon"
              className="bg-teal-100 text-teal-600 font-medium tracking-[0.005em] leading-none rounded-2xl inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex-shrink-0"
              aria-label={t('chat.conversations_list.new_conversation_aria')}
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="md:hidden flex-shrink-0"
              aria-label={t('chat.conversations_list.close_list_aria')}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-teal-100 p-2 rounded-2xl flex-1 overflow-y-auto min-h-0" style={{ overscrollBehavior: 'none' }}>
          {safeConversations.length === 0 ? (
            <div className="bg-teal-200 px-4 py-8 text-center rounded-2xl">
              <MessageCircle className="text-teal-600 mb-3 mx-auto lucide lucide-message-circle w-12 h-12" />
              <p className="text-teal-600 text-sm font-medium">{t('chat.conversations_list.empty_title')}</p>
              <p className="text-teal-600 mt-1 text-xs font-medium">{t('chat.conversations_list.empty_message')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {safeConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    'group relative transition-all rounded-[var(--radius-control)] border',
                    currentConversationId === conversation.id
                      ? 'border-border/70 bg-card shadow-[var(--shadow-sm)]'
                      : 'border-transparent bg-card/55 hover:bg-secondary/60'
                  )}
                >
                  {/* Checkbox — left side */}
                  <div className="absolute start-2 top-1/2 -translate-y-1/2 z-10">
                    <input
                      type="checkbox"
                      checked={selected.has(conversation.id)}
                      onChange={(e) => toggleOne(conversation.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-teal-600 cursor-pointer"
                      aria-label={`Select session ${conversation.metadata?.name || conversation.id}`}
                    />
                  </div>

                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className="bg-teal-100 text-start p-3 ps-8 w-full flex items-start gap-3 min-w-0"
                  >
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

                  {/* Single Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="absolute end-2 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2 min-h-[44px] min-w-[44px] rounded-[var(--radius-nested)] flex-shrink-0 bg-destructive/10"
                    aria-label={t('chat.conversations_list.delete_aria')}
                  >
                    <Trash2 className="text-red-500 mx-1 lucide lucide-trash2 w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}