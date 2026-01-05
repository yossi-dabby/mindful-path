import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, BookOpen, Target, Dumbbell, Play, Sparkles, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const actions = [
  {
    title: 'Talk to Therapist',
    description: 'Start a session',
    icon: MessageCircle,
    page: 'Chat',
    color: '#26A69A',
    bgColor: 'rgba(38, 166, 154, 0.15)'
  },
  {
    title: 'Thought Journal',
    description: 'Work through thoughts',
    icon: BookOpen,
    page: 'Journal',
    color: '#9F7AEA',
    bgColor: 'rgba(159, 122, 234, 0.15)'
  },
  {
    title: 'Set a Goal',
    description: 'Track progress',
    icon: Target,
    page: 'Goals',
    color: '#F6AD55',
    bgColor: 'rgba(246, 173, 85, 0.15)'
  },
  {
    title: 'Try an Exercise',
    description: 'Practice techniques',
    icon: Dumbbell,
    page: 'Exercises',
    color: '#4299E1',
    bgColor: 'rgba(66, 153, 225, 0.15)'
  },
  {
    title: 'CBT Video Library',
    description: 'Watch guided videos',
    icon: Play,
    page: 'Videos',
    color: '#ED8936',
    bgColor: 'rgba(237, 137, 54, 0.15)'
  },
  {
    title: 'Starter Path',
    description: '7-day beginner guide',
    icon: MapPin,
    page: 'StarterPath',
    color: '#38B2AC',
    bgColor: 'rgba(56, 178, 172, 0.15)'
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
      <h2 className="text-lg font-semibold mb-4 truncate" style={{ color: '#1A3A34' }}>Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.04, y: -6 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={createPageUrl(action.page)}>
                <Card className="border-0 hover:shadow-xl transition-all cursor-pointer group h-full" style={{
                  borderRadius: '28px',
                  background: `linear-gradient(145deg, ${action.bgColor} 0%, rgba(255, 255, 255, 0.7) 100%)`,
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)'
                }}>
                  <CardContent className="p-5">
                    <motion.div 
                      className="w-14 h-14 flex items-center justify-center mb-4"
                      style={{ 
                        borderRadius: '20px',
                        backgroundColor: action.color,
                        boxShadow: `0 6px 16px ${action.color}40`
                      }}
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <h3 className="font-semibold text-sm mb-1 truncate" style={{ color: '#1A3A34' }}>{action.title}</h3>
                    <p className="text-xs line-clamp-1" style={{ color: '#5A7A72' }}>{action.description}</p>
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