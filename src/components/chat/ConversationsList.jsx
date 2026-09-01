import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, X, Trash2, Search, MoreHorizontal, Pencil, Pin, PinOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ConversationsList({
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onBulkDeleteConversations,
  onRenameConversation,
  onTogglePinConversation,
  isPreferenceSaving = false,
  onClose
}) {
  // Stage 1 runtime-path lock:
  // Active therapist-chat conversation/session list UI for pages/Chat.jsx (/Chat route).
  const { t, i18n } = useTranslation();
  const safeConversations = Array.isArray(conversations) ? conversations : [];

  const [selected, setSelected] = useState(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [nameDraft, setNameDraft] = useState('');

  const getConversationName = (conversation) =>
    conversation.metadata?.name || `${t('chat.conversations_list.session_prefix')} ${(conversation.id || '').slice(0, 8)}`;

  const visibleConversations = safeConversations
    .filter((conversation) => getConversationName(conversation).toLocaleLowerCase(i18n.resolvedLanguage || i18n.language).includes(searchTerm.trim().toLocaleLowerCase(i18n.resolvedLanguage || i18n.language)))
    .sort((left, right) => {
      if (!!left.ui_is_pinned !== !!right.ui_is_pinned) return left.ui_is_pinned ? -1 : 1;
      return new Date(right.updated_date || right.created_date || 0) - new Date(left.updated_date || left.created_date || 0);
    });

  const beginRename = (conversation) => {
    setEditingId(conversation.id);
    setNameDraft(getConversationName(conversation));
  };

  const submitRename = async (conversationId) => {
    const nextTitle = nameDraft.trim().slice(0, 80);
    if (!nextTitle) return;
    await onRenameConversation?.(conversationId, nextTitle);
    setEditingId(null);
    setNameDraft('');
  };

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
    // Capture the full set synchronously before clearing state
    const idsToDelete = Array.from(selected);
    setSelected(new Set());
    setShowBulkConfirm(false);
    if (onBulkDeleteConversations) {
      onBulkDeleteConversations(idsToDelete);
    }
  };

  return (
    <>
      <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              {t(selected.size === 1 ? 'chat.conversations_list.bulk_delete_title_one' : 'chat.conversations_list.bulk_delete_title_other', { count: selected.size })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(selected.size === 1 ? 'chat.conversations_list.bulk_delete_description_one' : 'chat.conversations_list.bulk_delete_description_other', { count: selected.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={handleBulkDelete}>
              {t('common.delete')}
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
                aria-label={t('chat.conversations_list.select_all')}
              />
              <span className="text-teal-600 text-sm font-medium truncate">{t('chat.conversations_list.selected_count', { count: selected.size })}</span>
              <button
                onClick={() => setShowBulkConfirm(true)}
                className="ms-auto flex items-center gap-1 px-2 py-1 rounded-[var(--radius-nested)] bg-destructive/10 text-red-600 text-xs font-medium flex-shrink-0 min-h-[36px] min-w-[44px]"
                aria-label={t('chat.conversations_list.bulk_delete_aria', { count: selected.size })}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.delete')}</span>
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
                  aria-label={t('chat.conversations_list.select_all')}
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
              className="xl:hidden flex-shrink-0"
              aria-label={t('chat.conversations_list.close_list_aria')}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {safeConversations.length > 0 && (
          <div className="px-3 pb-2 flex-shrink-0">
            <label className="relative block">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600" aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('chat.conversations_list.search_placeholder')}
                className="w-full min-h-[44px] rounded-xl border border-teal-200 bg-white/80 ps-9 pe-3 text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </label>
          </div>
        )}

        {/* Conversations List */
        <div className="bg-teal-100 p-2 rounded-2xl flex-1 overflow-y-auto min-h-0" style={{ overscrollBehavior: 'none' }}>
          {safeConversations.length === 0 ? (
            <div className="bg-teal-200 px-4 py-8 text-center rounded-2xl">
              <MessageCircle className="text-teal-600 mb-3 mx-auto lucide lucide-message-circle w-12 h-12" />
              <p className="text-teal-600 text-sm font-medium">{t('chat.conversations_list.empty_title')}</p>
              <p className="text-teal-600 mt-1 text-xs font-medium">{t('chat.conversations_list.empty_message')}</p>
            </div>
          ) : visibleConversations.length === 0 ? (
            <div className="bg-white/65 px-4 py-8 text-center rounded-2xl">
              <Search className="text-teal-600 mb-3 mx-auto w-9 h-9" />
              <p className="text-slate-700 text-sm font-medium">{t('chat.conversations_list.no_search_results')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {visibleConversations.map((conversation) => (
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
                      aria-label={t('chat.conversations_list.select_session', { name: conversation.metadata?.name || conversation.id })}
                    />
                  </div>

                  {editingId === conversation.id ? (
                    <form
                      className="p-3 ps-8 pe-3 flex items-center gap-2 min-w-0"
                      onSubmit={(event) => { event.preventDefault(); void submitRename(conversation.id); }}
                    >
                      <input
                        autoFocus
                        value={nameDraft}
                        onChange={(event) => setNameDraft(event.target.value)}
                        maxLength={80}
                        aria-label={t('chat.conversations_list.rename_placeholder')}
                        className="flex-1 min-w-0 min-h-[44px] rounded-xl border border-teal-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      />
                      <Button type="submit" size="icon" disabled={!nameDraft.trim() || isPreferenceSaving} aria-label={t('chat.conversations_list.save_name')}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => setEditingId(null)} aria-label={t('common.cancel')}>
                        <X className="w-4 h-4" />
                      </Button>
                    </form>
                  ) : (
                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className="bg-transparent text-start p-3 ps-8 pe-14 w-full flex items-start gap-3 min-w-0"
                  >
                    <div className="bg-teal-600 text-slate-50 rounded-[20px] w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate text-sm md:text-base flex items-center gap-1.5",
                        currentConversationId === conversation.id ? "text-foreground" : "text-foreground/80"
                      )}>
                        {conversation.ui_is_pinned && <Pin className="w-3.5 h-3.5 flex-shrink-0 fill-current" aria-label={t('chat.conversations_list.pinned_label')} />}
                        <span className="truncate">{getConversationName(conversation)}</span>
                      </p>
                      <p className={cn(
                        "text-xs",
                        currentConversationId === conversation.id ? "text-primary" : "text-muted-foreground"
                      )}>
                        {conversation.created_date ? new Intl.DateTimeFormat(i18n.resolvedLanguage || i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(conversation.created_date)) : ''}
                      </p>
                    </div>
                  </button>
                  )}

                  {editingId !== conversation.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="absolute end-2 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center hover:bg-teal-100"
                          aria-label={t('chat.conversations_list.actions_aria', { name: getConversationName(conversation) })}
                        >
                          <MoreHorizontal className="w-5 h-5 text-teal-700" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => beginRename(conversation)}>
                          <Pencil className="w-4 h-4" />
                          {t('chat.conversations_list.rename_aria')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onTogglePinConversation?.(conversation.id, !conversation.ui_is_pinned)} disabled={isPreferenceSaving}>
                          {conversation.ui_is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          {t(conversation.ui_is_pinned ? 'chat.conversations_list.unpin_aria' : 'chat.conversations_list.pin_aria')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-700" onSelect={() => onDeleteConversation(conversation.id)}>
                          <Trash2 className="w-4 h-4" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
