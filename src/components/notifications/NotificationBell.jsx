import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, Check, CheckCheck, ExternalLink, Target, Dumbbell, TrendingUp, Calendar, Flame, FileText, AtSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
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
      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isUnread ? 'bg-teal-50' : 'bg-white hover:bg-gray-50'}`}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-tight ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>{notification.title}</p>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
            className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
          </span>
          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />}
          {(notification.priority === 'high' || notification.priority === 'critical') && (
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[notification.priority]}`} />
          )}
          {notification.action_url && (
            <ExternalLink className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.AppNotification.list('-created_date', 50),
    refetchInterval: open ? 60000 : false, // only poll when panel is open
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.AppNotification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.AppNotification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AppNotification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-teal-50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white bg-red-500">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 md:w-96 z-50 rounded-2xl shadow-2xl border border-gray-100 bg-white overflow-hidden"
            style={{ maxHeight: '480px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-teal-100 text-teal-700 text-xs px-1.5 py-0">{unreadCount} new</Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No notifications yet. We'll let you know when something happens.</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  <AnimatePresence>
                    {notifications.map(n => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        onMarkRead={(id) => markReadMutation.mutate(id)}
                        onDelete={(id) => deleteMutation.mutate(id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}