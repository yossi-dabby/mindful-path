import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, BookOpen, Target, Dumbbell, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const actions = [
  {
    title: 'Talk to Therapist',
    description: 'Start a session',
    icon: MessageCircle,
    page: 'Chat',
    gradient: 'from-green-400 to-green-600'
  },
  {
    title: 'Thought Journal',
    description: 'Work through thoughts',
    icon: BookOpen,
    page: 'Journal',
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    title: 'Set a Goal',
    description: 'Track progress',
    icon: Target,
    page: 'Goals',
    gradient: 'from-coral-400 to-coral-600'
  },
  {
    title: 'Try an Exercise',
    description: 'Practice techniques',
    icon: Dumbbell,
    page: 'Exercises',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    title: 'CBT Video Library',
    description: 'Watch guided videos',
    icon: Play,
    page: 'Videos',
    gradient: 'from-amber-400 to-orange-600'
  }
];

export default function QuickActions() {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h2 className="text-lg font-semibold mb-3 truncate" style={{ color: 'rgb(var(--text))' }}>Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={createPageUrl(action.page)}>
                <Card className="border-0 shadow-soft hover:shadow-lg transition-all cursor-pointer group h-full" style={{
                  borderRadius: 'var(--r-lg)',
                  backgroundColor: 'rgb(var(--surface))',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <CardContent className="p-4">
                    <motion.div 
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3`}
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: 'rgb(var(--text))' }}>{action.title}</h3>
                    <p className="text-xs line-clamp-1" style={{ color: 'rgb(var(--muted))' }}>{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}