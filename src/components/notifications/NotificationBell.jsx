import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, CheckCheck, ExternalLink, Target, Dumbbell, TrendingUp, Calendar, Flame, FileText, AtSign, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICON = {
  goal_reminder: Target,
  exercise_reminder: Dumbbell,
  progress_update: TrendingUp,
  daily_checkin: Calendar,
  streak_alert: Flame,
  session_summary: FileText,
  mention: AtSign,
  system: Info
};

const TYPE_COLOR = {
  goal_reminder: '#26A69A',
  exercise_reminder: '#9F7AEA',
  progress_update: '#4CAF50',
  daily_checkin: '#FF9800',
  streak_alert: '#FF5722',
  session_summary: '#2196F3',
  mention: '#E91E63',
  system: '#607D8B'
};

const PRIORITY_DOT = {
  critical: 'bg-red-500',
  high: 'bg-orange-400',
  normal: 'bg-transparent',
  low: 'bg-transparent'
};

function NotificationItem({ notification, onMarkRead, onDelete }) {
  const Icon = TYPE_ICON[notification.type] || Info;
  const color = TYPE_COLOR[notification.type] || '#607D8B';
  const isUnread = !notification.is_read;

  const handleClick = () => {
    if (isUnread) onMarkRead(notification.id);
    if (notification.action_url) window.location.href = notification.action_url;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`flex gap-3 p-3 rounded-[var(--radius-control)] cursor-pointer transition-colors border ${isUnread ? 'bg-secondary/70 border-border/70' : 'bg-card border-transparent hover:bg-secondary/60'}`}
      onClick={handleClick}>

      <div className="flex-shrink-0 w-9 h-9 rounded-[var(--radius-control)] bg-secondary flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-tight ${isUnread ? 'text-foreground' : 'text-foreground/80'}`}>{notification.title}</p>
          <button
            onClick={(e) => {e.stopPropagation();onDelete(notification.id);}}
            className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors">

            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground/80">
            {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
          </span>
          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
          {(notification.priority === 'high' || notification.priority === 'critical') &&
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[notification.priority]}`} />
          }
          {notification.action_url &&
          <ExternalLink className="w-3 h-3 text-gray-400" />
          }
        </div>
      </div>
    </motion.div>);

}

// Dropdown panel width in px — must match the w-80/w-96 values used in the panel.
const PANEL_WIDTH_MOBILE = 320; // w-80
const PANEL_WIDTH_DESKTOP = 384; // w-96
const PANEL_GAP = 8; // gap below the bell button

function useDropdownPosition(buttonRef, open) {
  const [pos, setPos] = useState(null);

  const recalculate = useCallback(() => {
    if (typeof window === 'undefined' || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const panelWidth = vw >= 768 ? PANEL_WIDTH_DESKTOP : PANEL_WIDTH_MOBILE;

    // Prefer aligning the panel's right edge with the button's right edge.
    // If that would clip the left side, align left edges instead.
    let left = rect.right - panelWidth;
    if (left < 8) left = Math.min(rect.left, vw - panelWidth - 8);
    left = Math.max(8, left);

    const top = rect.bottom + PANEL_GAP;
    setPos({ top, left, width: panelWidth });
  }, [buttonRef]);

  useEffect(() => {
    if (!open) {setPos(null);return;}
    recalculate();
    window.addEventListener('resize', recalculate);
    window.addEventListener('scroll', recalculate, true);
    return () => {
      window.removeEventListener('resize', recalculate);
      window.removeEventListener('scroll', recalculate, true);
    };
  }, [open, recalculate]);

  return pos;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.AppNotification.list('-created_date', 50),
    refetchInterval: open ? 60000 : false, // only poll when panel is open
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  // Base44 SDK can return a non-array on error or unexpected response shape;
  // guard here ensures all subsequent array operations are safe.
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const unreadCount = safeNotifications.filter((n) => !n.is_read).length;

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.AppNotification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = safeNotifications.filter((n) => !n.is_read);
      await Promise.all(unread.map((n) => base44.entities.AppNotification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AppNotification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  // Close on outside click (covers both button and portal dropdown)
  useEffect(() => {
    const handler = (e) => {
      if (
      buttonRef.current && !buttonRef.current.contains(e.target) &&
      dropdownRef.current && !dropdownRef.current.contains(e.target))
      {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {if (e.key === 'Escape') setOpen(false);};
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const pos = useDropdownPosition(buttonRef, open);

  const panel = pos &&
  <AnimatePresence>
      {open &&
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        maxHeight: '480px',
        zIndex: 9999
      }}
      className="rounded-[var(--radius-card)] shadow-[var(--shadow-lg)] border border-border/80 bg-popover overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-secondary/55">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground text-sm">Notifications</span>
              {unreadCount > 0 &&
          <Badge className="text-xs px-1.5 py-0">{unreadCount} new</Badge>
          }
            </div>
            {unreadCount > 0 &&
        <button
          onClick={() => markAllReadMutation.mutate()}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">

                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
        }
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
            {safeNotifications.length === 0 ?
        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="w-12 h-12 rounded-[var(--radius-control)] bg-secondary flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No notifications yet. We'll let you know when something happens.</p>
              </div> :

        <div className="p-2 space-y-1">
                <AnimatePresence>
                  {safeNotifications.map((n) =>
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={(id) => markReadMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)} />

            )}
                </AnimatePresence>
              </div>
        }
          </div>
        </motion.div>
    }
    </AnimatePresence>;


  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)} className="bg-teal-200 text-muted-foreground rounded-3xl relative w-10 h-10 flex items-center justify-center border border-transparent transition-colors hover:bg-secondary hover:text-foreground"

        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true">

        <Bell className="text-teal-600 lucide lucide-bell w-5 h-5" />
        {unreadCount > 0 &&
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white bg-red-500">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        }
      </button>

      {typeof document !== 'undefined' && createPortal(panel, document.body)}
    </>);

}